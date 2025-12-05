// @ts-nocheck
import { CulturalStory, ICulturalStory, IStoryConnection } from '../models/CulturalStory';
import { User } from '../models/User';
import OpenAI from 'openai';
import mongoose from 'mongoose';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CreateStoryData {
  title: string;
  content: string;
  summary?: string;
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags?: string[];
  location: {
    coordinates: [number, number];
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: Date;
    isOngoing?: boolean;
  };
  relatedPeople?: string[];
  relatedEvents?: string[];
  visibility?: 'public' | 'community' | 'private';
}

export interface StoryFilters {
  category?: string;
  region?: string;
  tags?: string[];
  author?: string;
  status?: string;
  culturalSignificance?: string;
  location?: {
    coordinates: [number, number];
    radius: number; // in kilometers
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class CulturalStoryService {
  
  async createStory(authorId: string, storyData: CreateStoryData): Promise<ICulturalStory> {
    // Generate AI insights and tags
    const aiInsights = await this.generateAIInsights(storyData.content, storyData.title);
    
    // Auto-generate summary if not provided
    const summary = storyData.summary || await this.generateSummary(storyData.content);
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = storyData.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const story = new CulturalStory({
      ...storyData,
      summary,
      author: new mongoose.Types.ObjectId(authorId),
      readingTime,
      aiInsights: {
        ...aiInsights,
        generatedAt: new Date()
      },
      aiGeneratedTags: aiInsights.suggestedTags || []
    });
    
    await story.save();
    return story.populate('author', 'name email profilePicture');
  }
  
  async getStories(filters: StoryFilters = {}, page = 1, limit = 20): Promise<{
    stories: ICulturalStory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { status: { $in: ['approved', 'featured'] } };
    
    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.region) query['location.region'] = new RegExp(filters.region, 'i');
    if (filters.author) query.author = new mongoose.Types.ObjectId(filters.author);
    if (filters.status) query.status = filters.status;
    if (filters.culturalSignificance) query.culturalSignificance = filters.culturalSignificance;
    if (filters.tags && filters.tags.length > 0) {
      query.$or = [
        { tags: { $in: filters.tags } },
        { aiGeneratedTags: { $in: filters.tags } }
      ];
    }
    
    // Location-based filtering
    if (filters.location) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filters.location.coordinates
          },
          $maxDistance: filters.location.radius * 1000 // Convert km to meters
        }
      };
    }
    
    // Date range filtering
    if (filters.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }
    
    const skip = (page - 1) * limit;
    
    const [stories, total] = await Promise.all([
      CulturalStory.find(query)
        .populate('author', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CulturalStory.countDocuments(query)
    ]);
    
    return {
      stories: stories as ICulturalStory[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async getStoryById(storyId: string, userId?: string): Promise<ICulturalStory | null> {
    const story = await CulturalStory.findById(storyId)
      .populate('author', 'name email profilePicture')
      .populate('contributors', 'name email profilePicture')
      .populate('comments.author', 'name profilePicture');
    
    if (!story) return null;
    
    // Increment view count (but not for the author)
    if (userId && story.author._id.toString() !== userId) {
      story.views += 1;
      await story.save();
    }
    
    return story;
  }
  
  async getRecommendations(userId: string, limit = 10): Promise<ICulturalStory[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Get user's interaction history
    const userStories = await CulturalStory.find({
      $or: [
        { author: new mongoose.Types.ObjectId(userId) },
        { likes: new mongoose.Types.ObjectId(userId) }
      ]
    }).select('category tags aiGeneratedTags location');
    
    // Extract user preferences
    const preferredCategories = this.extractPreferences(userStories, 'category');
    const preferredTags = this.extractAllTags(userStories);
    const preferredRegions = this.extractPreferences(userStories, 'location.region');
    
    // Build recommendation query
    const recommendationQuery: any = {
      status: { $in: ['approved', 'featured'] },
      author: { $ne: new mongoose.Types.ObjectId(userId) }
    };
    
    // Score-based recommendation
    const pipeline = [
      { $match: recommendationQuery },
      {
        $addFields: {
          score: {
            $add: [
              // Category preference score
              {
                $cond: [
                  { $in: ['$category', preferredCategories] },
                  3,
                  0
                ]
              },
              // Tag preference score
              {
                $size: {
                  $setIntersection: [
                    { $concatArrays: ['$tags', '$aiGeneratedTags'] },
                    preferredTags
                  ]
                }
              },
              // Region preference score
              {
                $cond: [
                  { $in: ['$location.region', preferredRegions] },
                  2,
                  0
                ]
              },
              // Popularity score (views and likes)
              { $multiply: [{ $log10: { $add: ['$views', 1] } }, 0.5] },
              { $multiply: [{ $size: '$likes' }, 0.3] }
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { name: 1, email: 1, profilePicture: 1 } }]
        }
      },
      { $unwind: '$author' }
    ];
    
    const recommendations = await CulturalStory.aggregate(pipeline);
    return recommendations;
  }
  
  async searchStories(query: string, filters: StoryFilters = {}, page = 1, limit = 20): Promise<{
    stories: ICulturalStory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchQuery: any = {
      $text: { $search: query },
      status: { $in: ['approved', 'featured'] }
    };
    
    // Apply additional filters
    Object.assign(searchQuery, this.buildFilterQuery(filters));
    
    const skip = (page - 1) * limit;
    
    const [stories, total] = await Promise.all([
      CulturalStory.find(searchQuery, { score: { $meta: 'textScore' } })
        .populate('author', 'name email profilePicture')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CulturalStory.countDocuments(searchQuery)
    ]);
    
    return {
      stories: stories as ICulturalStory[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async addStoryConnection(storyId: string, connection: Omit<IStoryConnection, 'storyId'>): Promise<ICulturalStory | null> {
    const story = await CulturalStory.findById(storyId);
    if (!story) return null;
    
    // Check if connection already exists
    const existingConnection = story.connections.find(
      conn => conn.storyId.toString() === connection.storyId.toString()
    );
    
    if (existingConnection) {
      // Update existing connection
      existingConnection.connectionType = connection.connectionType;
      existingConnection.description = connection.description;
      existingConnection.strength = connection.strength;
    } else {
      // Add new connection
      story.connections.push({
        storyId: new mongoose.Types.ObjectId(connection.storyId.toString()),
        connectionType: connection.connectionType,
        description: connection.description,
        strength: connection.strength
      });
    }
    
    await story.save();
    return story.populate('author', 'name email profilePicture');
  }
  
  async likeStory(storyId: string, userId: string): Promise<ICulturalStory | null> {
    const story = await CulturalStory.findById(storyId);
    if (!story) return null;
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = story.likes.includes(userObjectId);
    
    if (isLiked) {
      story.likes = story.likes.filter(id => !id.equals(userObjectId));
    } else {
      story.likes.push(userObjectId);
    }
    
    await story.save();
    return story.populate('author', 'name email profilePicture');
  }
  
  async addComment(storyId: string, userId: string, content: string): Promise<ICulturalStory | null> {
    const story = await CulturalStory.findById(storyId);
    if (!story) return null;
    
    story.comments.push({
      author: new mongoose.Types.ObjectId(userId),
      content,
      createdAt: new Date(),
      isApproved: true // Auto-approve for now, can add moderation later
    });
    
    await story.save();
    return story.populate([
      { path: 'author', select: 'name email profilePicture' },
      { path: 'comments.author', select: 'name profilePicture' }
    ]);
  }
  
  private async generateAIInsights(content: string, title: string): Promise<{
    themes: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    complexity: number;
    recommendedAudience: string[];
    suggestedTags: string[];
  }> {
    try {
      const prompt = `Analyze this cultural story and provide insights in JSON format:

Title: ${title}
Content: ${content.substring(0, 2000)}...

Please provide:
1. themes: Array of 3-5 main themes
2. sentiment: "positive", "neutral", "negative", or "mixed"
3. complexity: Number from 0-1 (0=simple, 1=complex)
4. recommendedAudience: Array of audience types (e.g., "children", "adults", "historians", "locals")
5. suggestedTags: Array of 5-10 relevant tags

Return only valid JSON.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        themes: result.themes || [],
        sentiment: result.sentiment || 'neutral',
        complexity: Math.min(Math.max(result.complexity || 0.5, 0), 1),
        recommendedAudience: result.recommendedAudience || [],
        suggestedTags: result.suggestedTags || []
      };
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        themes: [],
        sentiment: 'neutral',
        complexity: 0.5,
        recommendedAudience: [],
        suggestedTags: []
      };
    }
  }
  
  private async generateSummary(content: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Please create a compelling 2-3 sentence summary of this cultural story:\n\n${content.substring(0, 1500)}`
        }],
        temperature: 0.3,
        max_tokens: 150
      });
      
      return response.choices[0].message.content?.trim() || content.substring(0, 200) + '...';
    } catch (error) {
      console.error('Error generating summary:', error);
      return content.substring(0, 200) + '...';
    }
  }
  
  private extractPreferences(stories: any[], field: string): string[] {
    const preferences: { [key: string]: number } = {};
    
    stories.forEach(story => {
      const value = field.includes('.') ? 
        field.split('.').reduce((obj, key) => obj?.[key], story) : 
        story[field];
      
      if (value) {
        preferences[value] = (preferences[value] || 0) + 1;
      }
    });
    
    return Object.entries(preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key]) => key);
  }
  
  private extractAllTags(stories: any[]): string[] {
    const allTags = new Set<string>();
    
    stories.forEach(story => {
      [...(story.tags || []), ...(story.aiGeneratedTags || [])].forEach(tag => {
        allTags.add(tag);
      });
    });
    
    return Array.from(allTags);
  }
  
  private buildFilterQuery(filters: StoryFilters): any {
    const query: any = {};
    
    if (filters.category) query.category = filters.category;
    if (filters.region) query['location.region'] = new RegExp(filters.region, 'i');
    if (filters.author) query.author = new mongoose.Types.ObjectId(filters.author);
    if (filters.status) query.status = filters.status;
    if (filters.culturalSignificance) query.culturalSignificance = filters.culturalSignificance;
    
    if (filters.tags && filters.tags.length > 0) {
      query.$or = [
        { tags: { $in: filters.tags } },
        { aiGeneratedTags: { $in: filters.tags } }
      ];
    }
    
    if (filters.location) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filters.location.coordinates
          },
          $maxDistance: filters.location.radius * 1000
        }
      };
    }
    
    if (filters.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }
    
    return query;
  }
}

export const culturalStoryService = new CulturalStoryService();
