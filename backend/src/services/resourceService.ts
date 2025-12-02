import { Resource, IResource } from '../models/Resource';
import { elasticsearchService } from './elasticsearchService';
import { aiSearchService } from './aiSearchService';
import mongoose from 'mongoose';

interface SearchFilters {
  query?: string;
  category?: string;
  location?: { lat: number; lon: number; radius?: string };
  availability?: string;
  pricing?: string;
  tags?: string[];
  verified?: boolean;
  minRating?: number;
  maxDistance?: number;
  priceRange?: { min?: number; max?: number };
}

interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'date' | 'popularity';
  useAI?: boolean;
}

class ResourceService {
  async createResource(resourceData: Partial<IResource>): Promise<IResource> {
    try {
      const resource = new Resource(resourceData);
      await resource.save();
      
      // Index in Elasticsearch
      await elasticsearchService.indexResource(resource);
      
      return resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(resourceId: string, updateData: Partial<IResource>): Promise<IResource | null> {
    try {
      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (resource) {
        // Update in Elasticsearch
        await elasticsearchService.updateResource(resourceId, resource);
      }

      return resource;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }

  async deleteResource(resourceId: string): Promise<boolean> {
    try {
      const result = await Resource.findByIdAndDelete(resourceId);
      
      if (result) {
        // Remove from Elasticsearch
        await elasticsearchService.deleteResource(resourceId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }

  async getResourceById(resourceId: string, incrementView: boolean = false): Promise<IResource | null> {
    try {
      const resource = await Resource.findById(resourceId)
        .populate('owner', 'name email')
        .populate('reviews.user', 'name');

      if (resource && incrementView) {
        // Increment view count
        await Resource.findByIdAndUpdate(resourceId, {
          $inc: { viewCount: 1 },
          lastAccessedAt: new Date()
        });
      }

      return resource;
    } catch (error) {
      console.error('Error getting resource by ID:', error);
      throw error;
    }
  }

  async searchResources(
    filters: SearchFilters,
    options: SearchOptions = {},
    userId?: string
  ): Promise<{
    resources: any[];
    total: number;
    suggestions?: string[];
    aggregations?: any;
    aiInsights?: any;
  }> {
    try {
      const { useAI = false, ...searchOptions } = options;
      
      let searchParams = { ...filters, ...searchOptions };
      let suggestions: string[] = [];
      let aiInsights: any = null;

      // Use AI for natural language processing if enabled and query is provided
      if (useAI && filters.query) {
        const aiResult = await aiSearchService.processNaturalLanguageQuery(
          filters.query,
          filters.location
        );
        
        searchParams = { ...searchParams, ...aiResult.searchParams };
        suggestions = aiResult.suggestions;
        aiInsights = aiResult.intent;
      }

      // Try Elasticsearch first, fallback to MongoDB
      let searchResult;
      const isElasticsearchHealthy = await elasticsearchService.isHealthy();
      
      if (isElasticsearchHealthy) {
        searchResult = await elasticsearchService.searchResources(searchParams);
        
        // Get aggregations for faceted search
        const aggregations = await elasticsearchService.getAggregations(filters);
        
        // Enhance results with AI if enabled
        if (useAI && filters.query) {
          searchResult.resources = await aiSearchService.enhanceSearchResults(
            searchResult.resources,
            filters.query
          );
        }
        
        return {
          resources: searchResult.resources,
          total: searchResult.total,
          suggestions,
          aggregations,
          aiInsights
        };
      } else {
        // Fallback to MongoDB search
        searchResult = await this.searchResourcesMongoDB(searchParams);
        
        return {
          resources: searchResult.resources,
          total: searchResult.total,
          suggestions,
          aiInsights
        };
      }
    } catch (error) {
      console.error('Error searching resources:', error);
      throw error;
    }
  }

  private async searchResourcesMongoDB(params: any): Promise<{ resources: any[]; total: number }> {
    const {
      query,
      category,
      location,
      availability,
      pricing,
      tags,
      verified,
      minRating,
      limit = 20,
      offset = 0,
      sortBy = 'relevance'
    } = params;

    // Build MongoDB query
    const mongoQuery: any = { isActive: true };

    if (category) {
      mongoQuery.category = category;
    }

    if (availability) {
      mongoQuery['availability.status'] = availability;
    }

    if (pricing) {
      mongoQuery['pricing.type'] = pricing;
    }

    if (tags && tags.length > 0) {
      mongoQuery.tags = { $in: tags };
    }

    if (verified !== undefined) {
      mongoQuery.isVerified = verified;
    }

    if (minRating) {
      mongoQuery['rating.average'] = { $gte: minRating };
    }

    // Text search
    if (query) {
      mongoQuery.$text = { $search: query };
    }

    // Location search
    if (location) {
      const radiusInMeters = this.parseRadius(location.radius || '50km');
      mongoQuery['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lon, location.lat]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case 'rating':
        sortCriteria = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'date':
        sortCriteria = { createdAt: -1 };
        break;
      case 'popularity':
        sortCriteria = { bookingCount: -1, viewCount: -1 };
        break;
      default:
        if (query) {
          sortCriteria = { score: { $meta: 'textScore' } };
        } else {
          sortCriteria = { createdAt: -1 };
        }
    }

    const [resources, total] = await Promise.all([
      Resource.find(mongoQuery)
        .populate('owner', 'name email')
        .sort(sortCriteria)
        .skip(offset)
        .limit(limit)
        .lean(),
      Resource.countDocuments(mongoQuery)
    ]);

    return { resources, total };
  }

  private parseRadius(radius: string): number {
    const match = radius.match(/^(\d+)(km|m)$/);
    if (!match) return 50000; // Default 50km in meters
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit === 'km' ? value * 1000 : value;
  }

  async getResourceRecommendations(
    userId: string,
    userLocation?: { lat: number; lon: number },
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Get user preferences (would typically come from user profile)
      const userPreferences = await this.getUserPreferences(userId);
      
      // Use AI to generate personalized recommendations
      const aiRecommendations = await aiSearchService.generateResourceRecommendations(
        userId,
        userPreferences,
        userLocation
      );

      // Convert AI recommendations to actual resource searches
      const recommendations = await Promise.all(
        aiRecommendations.slice(0, limit).map(async (rec) => {
          try {
            const searchResult = await this.searchResources(
              {
                query: rec.searchQuery,
                category: rec.category,
                location: userLocation
              },
              { limit: 3 }
            );

            return {
              ...rec,
              resources: searchResult.resources
            };
          } catch (error) {
            return { ...rec, resources: [] };
          }
        })
      );

      return recommendations.filter(rec => rec.resources.length > 0);
    } catch (error) {
      console.error('Error getting resource recommendations:', error);
      return [];
    }
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // This would typically fetch from user profile
    // For now, return default preferences
    return {
      interests: ['farming', 'community'],
      skills: [],
      role: 'community member'
    };
  }

  async addResourceReview(
    resourceId: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<IResource | null> {
    try {
      const resource = await Resource.findById(resourceId);
      if (!resource) return null;

      // Check if user already reviewed this resource
      const existingReviewIndex = resource.reviews.findIndex(
        review => review.user.toString() === userId
      );

      if (existingReviewIndex >= 0) {
        // Update existing review
        resource.reviews[existingReviewIndex] = {
          user: new mongoose.Types.ObjectId(userId),
          rating,
          comment,
          date: new Date()
        };
      } else {
        // Add new review
        resource.reviews.push({
          user: new mongoose.Types.ObjectId(userId),
          rating,
          comment,
          date: new Date()
        });
      }

      // Recalculate average rating
      const totalRating = resource.reviews.reduce((sum, review) => sum + review.rating, 0);
      resource.rating.average = totalRating / resource.reviews.length;
      resource.rating.count = resource.reviews.length;

      await resource.save();

      // Update in Elasticsearch
      await elasticsearchService.updateResource(resourceId, {
        rating: resource.rating
      });

      return resource;
    } catch (error) {
      console.error('Error adding resource review:', error);
      throw error;
    }
  }

  async getResourcesByOwner(ownerId: string, includeInactive: boolean = false): Promise<IResource[]> {
    try {
      const query: any = { owner: ownerId };
      if (!includeInactive) {
        query.isActive = true;
      }

      return await Resource.find(query)
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      console.error('Error getting resources by owner:', error);
      throw error;
    }
  }

  async getPopularResources(location?: { lat: number; lon: number }, limit: number = 10): Promise<IResource[]> {
    try {
      const query: any = { isActive: true };
      
      if (location) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lon, location.lat]
            },
            $maxDistance: 100000 // 100km
          }
        };
      }

      return await Resource.find(query)
        .sort({ bookingCount: -1, viewCount: -1, 'rating.average': -1 })
        .limit(limit)
        .populate('owner', 'name')
        .lean();
    } catch (error) {
      console.error('Error getting popular resources:', error);
      throw error;
    }
  }

  async getResourceCategories(): Promise<any[]> {
    try {
      const categories = await Resource.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            subcategories: { $addToSet: '$subcategory' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return categories.map(cat => ({
        category: cat._id,
        count: cat.count,
        subcategories: cat.subcategories.filter(Boolean)
      }));
    } catch (error) {
      console.error('Error getting resource categories:', error);
      throw error;
    }
  }
}

export const resourceService = new ResourceService();