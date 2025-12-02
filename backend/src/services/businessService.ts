import { Business, IBusiness, BusinessReview, IBusinessReview } from '../models/Business';
import { User } from '../models/User';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { calculateDistance } from '../utils/geolocation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BusinessSearchFilters {
  category?: string;
  subcategory?: string;
  services?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  rating?: number;
  verified?: boolean;
  tags?: string[];
  businessType?: string;
}

export interface BusinessMatchingCriteria {
  businessId: string;
  lookingFor: string[];
  offering: string[];
  preferredLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export class BusinessService {
  
  async createBusiness(businessData: Partial<IBusiness>): Promise<IBusiness> {
    const business = new Business(businessData);
    await business.save();
    return business;
  }

  async getBusinessById(businessId: string): Promise<IBusiness | null> {
    return Business.findById(businessId)
      .populate('owner', 'name email')
      .populate('reviews');
  }

  async updateBusiness(businessId: string, updateData: Partial<IBusiness>): Promise<IBusiness | null> {
    return Business.findByIdAndUpdate(
      businessId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async searchBusinesses(filters: BusinessSearchFilters, page: number = 1, limit: number = 20): Promise<{
    businesses: IBusiness[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { isActive: true };

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.subcategory) query.subcategory = filters.subcategory;
    if (filters.services && filters.services.length > 0) {
      query.services = { $in: filters.services };
    }
    if (filters.verified !== undefined) {
      query['verification.status'] = filters.verified ? 'verified' : { $ne: 'verified' };
    }
    if (filters.rating) {
      query['ratings.average'] = { $gte: filters.rating };
    }
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters.businessType) {
      query['economicData.businessType'] = filters.businessType;
    }

    // Location-based search
    if (filters.location) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.longitude, filters.location.latitude]
          },
          $maxDistance: filters.location.radius * 1000 // Convert km to meters
        }
      };
    }

    const skip = (page - 1) * limit;
    
    const [businesses, total] = await Promise.all([
      Business.find(query)
        .populate('owner', 'name email')
        .sort({ 'ratings.average': -1, isPremium: -1, featuredUntil: -1 })
        .skip(skip)
        .limit(limit),
      Business.countDocuments(query)
    ]);

    return {
      businesses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getBusinessRecommendations(userId: string, limit: number = 10): Promise<IBusiness[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get user's location and interests
    const userLocation = user.location?.coordinates;
    const userInterests = user.preferences?.interests || [];

    const query: any = { 
      isActive: true,
      owner: { $ne: userId } // Don't recommend user's own businesses
    };

    // Location-based recommendations if user has location
    if (userLocation) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userLocation[0], userLocation[1]] // [longitude, latitude]
          },
          $maxDistance: 50000 // 50km radius
        }
      };
    }

    // Interest-based recommendations
    if (userInterests.length > 0) {
      query.$or = [
        { services: { $in: userInterests } },
        { capabilities: { $in: userInterests } },
        { tags: { $in: userInterests } }
      ];
    }

    return Business.find(query)
      .populate('owner', 'name email')
      .sort({ 'ratings.average': -1, isPremium: -1 })
      .limit(limit);
  }

  async getAIBusinessMatches(criteria: BusinessMatchingCriteria): Promise<{
    matches: Array<{
      business: IBusiness;
      matchScore: number;
      matchReasons: string[];
    }>;
  }> {
    const business = await Business.findById(criteria.businessId);
    if (!business) throw new Error('Business not found');

    // Find potential matches based on location and complementary services
    const query: any = {
      isActive: true,
      _id: { $ne: criteria.businessId }
    };

    if (criteria.preferredLocation) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [criteria.preferredLocation.longitude, criteria.preferredLocation.latitude]
          },
          $maxDistance: criteria.preferredLocation.radius * 1000
        }
      };
    }

    const potentialMatches = await Business.find(query).limit(50);

    // Use AI to analyze and score matches
    const matchPromises = potentialMatches.map(async (match) => {
      const matchScore = await this.calculateAIMatchScore(business, match, criteria);
      const matchReasons = await this.generateMatchReasons(business, match, criteria);
      
      return {
        business: match,
        matchScore,
        matchReasons
      };
    });

    const matches = await Promise.all(matchPromises);
    
    // Sort by match score and return top matches
    return {
      matches: matches
        .filter(match => match.matchScore > 0.3) // Only return matches with score > 30%
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10)
    };
  }

  private async calculateAIMatchScore(
    business1: IBusiness, 
    business2: IBusiness, 
    criteria: BusinessMatchingCriteria
  ): Promise<number> {
    try {
      const prompt = `
        Analyze the business compatibility between these two rural Australian businesses and provide a match score from 0 to 1.

        Business 1: ${business1.name}
        - Category: ${business1.category}
        - Services: ${business1.services.join(', ')}
        - Capabilities: ${business1.capabilities.join(', ')}
        - Looking for: ${criteria.lookingFor.join(', ')}
        - Offering: ${criteria.offering.join(', ')}

        Business 2: ${business2.name}
        - Category: ${business2.category}
        - Services: ${business2.services.join(', ')}
        - Capabilities: ${business2.capabilities.join(', ')}

        Consider:
        1. Complementary services and capabilities
        2. Potential for collaboration or partnership
        3. Supply chain opportunities
        4. Shared customer base potential
        5. Rural business ecosystem synergies

        Respond with only a number between 0 and 1 (e.g., 0.75).
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.3,
      });

      const score = parseFloat(response.choices[0].message.content?.trim() || '0');
      return Math.max(0, Math.min(1, score)); // Ensure score is between 0 and 1
    } catch (error) {
      console.error('Error calculating AI match score:', error);
      return 0;
    }
  }

  private async generateMatchReasons(
    business1: IBusiness, 
    business2: IBusiness, 
    criteria: BusinessMatchingCriteria
  ): Promise<string[]> {
    try {
      const prompt = `
        Explain why these two rural Australian businesses could be good partners. Provide 2-3 specific reasons.

        Business 1: ${business1.name} (${business1.category})
        - Services: ${business1.services.join(', ')}
        - Looking for: ${criteria.lookingFor.join(', ')}
        - Offering: ${criteria.offering.join(', ')}

        Business 2: ${business2.name} (${business2.category})
        - Services: ${business2.services.join(', ')}

        Provide reasons as a JSON array of strings, focusing on practical collaboration opportunities.
        Example: ["Complementary services for complete customer solutions", "Shared target market in rural communities"]
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content?.trim();
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          // Fallback if JSON parsing fails
          return [content];
        }
      }
      return [];
    } catch (error) {
      console.error('Error generating match reasons:', error);
      return [];
    }
  }

  async addBusinessReview(reviewData: Partial<IBusinessReview>): Promise<IBusinessReview> {
    const review = new BusinessReview(reviewData);
    await review.save();

    // Update business rating
    await this.updateBusinessRating(reviewData.business as mongoose.Types.ObjectId);

    return review;
  }

  private async updateBusinessRating(businessId: mongoose.Types.ObjectId): Promise<void> {
    const reviews = await BusinessReview.find({ business: businessId });
    
    if (reviews.length === 0) return;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      breakdown[review.rating as keyof typeof breakdown]++;
      totalRating += review.rating;
    });

    const average = totalRating / reviews.length;

    await Business.findByIdAndUpdate(businessId, {
      'ratings.average': Math.round(average * 10) / 10, // Round to 1 decimal
      'ratings.count': reviews.length,
      'ratings.breakdown': breakdown
    });
  }

  async getBusinessAnalytics(businessId: string): Promise<{
    viewsThisMonth: number;
    reviewsThisMonth: number;
    averageRating: number;
    competitorAnalysis: {
      averageRatingInCategory: number;
      positionInCategory: number;
      totalInCategory: number;
    };
    recommendations: string[];
  }> {
    const business = await Business.findById(businessId);
    if (!business) throw new Error('Business not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent reviews
    const recentReviews = await BusinessReview.find({
      business: businessId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get competitor analysis
    const categoryBusinesses = await Business.find({
      category: business.category,
      isActive: true,
      _id: { $ne: businessId }
    }).sort({ 'ratings.average': -1 });

    const averageRatingInCategory = categoryBusinesses.length > 0 
      ? categoryBusinesses.reduce((sum, b) => sum + b.ratings.average, 0) / categoryBusinesses.length
      : 0;

    const positionInCategory = categoryBusinesses.findIndex(b => 
      b.ratings.average <= business.ratings.average
    ) + 1;

    // Generate AI recommendations
    const recommendations = await this.generateBusinessRecommendations(business);

    return {
      viewsThisMonth: 0, // This would be tracked separately in a real implementation
      reviewsThisMonth: recentReviews.length,
      averageRating: business.ratings.average,
      competitorAnalysis: {
        averageRatingInCategory,
        positionInCategory,
        totalInCategory: categoryBusinesses.length + 1
      },
      recommendations
    };
  }

  private async generateBusinessRecommendations(business: IBusiness): Promise<string[]> {
    try {
      const prompt = `
        Provide 3-4 specific business improvement recommendations for this rural Australian business:

        Business: ${business.name}
        Category: ${business.category}
        Current Rating: ${business.ratings.average}/5 (${business.ratings.count} reviews)
        Services: ${business.services.join(', ')}
        Verification Status: ${business.verification.status}

        Focus on practical, actionable advice for rural businesses. Return as JSON array of strings.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content?.trim();
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return [content];
        }
      }
      return [];
    } catch (error) {
      console.error('Error generating business recommendations:', error);
      return ['Focus on improving customer service', 'Consider expanding your service offerings'];
    }
  }

  async getEconomicOpportunities(location: { latitude: number; longitude: number }, radius: number = 25): Promise<{
    opportunities: Array<{
      type: 'partnership' | 'supply-chain' | 'market-gap' | 'collaboration';
      title: string;
      description: string;
      businesses: IBusiness[];
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    // Find businesses in the area
    const nearbyBusinesses = await Business.find({
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: radius * 1000
        }
      }
    }).limit(100);

    // Analyze for opportunities using AI
    const opportunities = await this.analyzeEconomicOpportunities(nearbyBusinesses);

    return { opportunities };
  }

  private async analyzeEconomicOpportunities(businesses: IBusiness[]): Promise<Array<{
    type: 'partnership' | 'supply-chain' | 'market-gap' | 'collaboration';
    title: string;
    description: string;
    businesses: IBusiness[];
    priority: 'high' | 'medium' | 'low';
  }>> {
    // This is a simplified implementation - in a real system, this would use more sophisticated AI analysis
    const opportunities: Array<{
      type: 'partnership' | 'supply-chain' | 'market-gap' | 'collaboration';
      title: string;
      description: string;
      businesses: IBusiness[];
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Group businesses by category
    const businessesByCategory = businesses.reduce((acc, business) => {
      if (!acc[business.category]) acc[business.category] = [];
      acc[business.category].push(business);
      return acc;
    }, {} as Record<string, IBusiness[]>);

    // Look for supply chain opportunities
    const agricultureBusinesses = businessesByCategory['Agriculture'] || [];
    const foodBusinesses = businessesByCategory['Food & Beverage'] || [];
    
    if (agricultureBusinesses.length > 0 && foodBusinesses.length > 0) {
      opportunities.push({
        type: 'supply-chain' as const,
        title: 'Farm-to-Table Supply Chain Opportunity',
        description: 'Local farms and food businesses could create direct supply relationships',
        businesses: [...agricultureBusinesses.slice(0, 3), ...foodBusinesses.slice(0, 3)],
        priority: 'high' as const
      });
    }

    // Look for service gaps
    const serviceCategories = Object.keys(businessesByCategory);
    const commonRuralServices = ['Healthcare', 'Education', 'Transport', 'Technology', 'Finance'];
    
    const missingServices = commonRuralServices.filter(service => 
      !serviceCategories.some(cat => cat.toLowerCase().includes(service.toLowerCase()))
    );

    if (missingServices.length > 0) {
      opportunities.push({
        type: 'market-gap' as const,
        title: `Service Gap: ${missingServices[0]}`,
        description: `There appears to be limited ${missingServices[0].toLowerCase()} services in this area`,
        businesses: [],
        priority: 'medium' as const
      });
    }

    return opportunities;
  }
}

export const businessService = new BusinessService();