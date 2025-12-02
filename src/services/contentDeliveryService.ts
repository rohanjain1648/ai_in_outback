import { Location, LocationFilter, Coordinates } from '../types/location';
import { locationService } from './locationService';
import { GeolocationUtils } from '../utils/geolocation';

export interface LocationBasedContent {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'resource' | 'event' | 'business' | 'agricultural' | 'cultural' | 'health';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: Coordinates;
  radius: number; // km - how far this content is relevant
  targetRegions?: ('urban' | 'rural' | 'remote')[];
  targetStates?: string[];
  content: any; // Flexible content structure
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  metadata?: {
    source?: string;
    tags?: string[];
    language?: string;
  };
}

export interface ContentDeliveryOptions {
  userLocation: Location;
  contentTypes?: LocationBasedContent['type'][];
  maxDistance?: number;
  priority?: LocationBasedContent['priority'][];
  includeRegionalContent?: boolean;
  includeStateWideContent?: boolean;
  limit?: number;
}

export interface RelevantContent {
  content: LocationBasedContent;
  distance: number;
  relevanceScore: number;
  reason: string;
}

class ContentDeliveryService {
  private contentCache: Map<string, LocationBasedContent[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get location-based content for a user
   */
  async getRelevantContent(options: ContentDeliveryOptions): Promise<RelevantContent[]> {
    const {
      userLocation,
      contentTypes,
      maxDistance = 50,
      priority = ['critical', 'high', 'medium', 'low'],
      includeRegionalContent = true,
      includeStateWideContent = true,
      limit = 50
    } = options;

    try {
      // Get all available content (in a real app, this would be from an API)
      const allContent = await this.getAllContent();
      
      const relevantContent: RelevantContent[] = [];

      for (const content of allContent) {
        if (!content.isActive) continue;
        if (contentTypes && !contentTypes.includes(content.type)) continue;
        if (!priority.includes(content.priority)) continue;

        // Check if content is still valid
        const now = new Date();
        if (content.validUntil && now > content.validUntil) continue;
        if (now < content.validFrom) continue;

        const relevance = this.calculateRelevance(userLocation, content, {
          maxDistance,
          includeRegionalContent,
          includeStateWideContent
        });

        if (relevance.isRelevant) {
          relevantContent.push({
            content,
            distance: relevance.distance,
            relevanceScore: relevance.score,
            reason: relevance.reason
          });
        }
      }

      // Sort by relevance score (higher is more relevant)
      relevantContent.sort((a, b) => {
        // Critical content always comes first
        if (a.content.priority === 'critical' && b.content.priority !== 'critical') return -1;
        if (b.content.priority === 'critical' && a.content.priority !== 'critical') return 1;
        
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      });

      return relevantContent.slice(0, limit);
    } catch (error) {
      console.error('Failed to get relevant content:', error);
      return [];
    }
  }

  /**
   * Calculate content relevance for a user location
   */
  private calculateRelevance(
    userLocation: Location,
    content: LocationBasedContent,
    options: {
      maxDistance: number;
      includeRegionalContent: boolean;
      includeStateWideContent: boolean;
    }
  ): {
    isRelevant: boolean;
    distance: number;
    score: number;
    reason: string;
  } {
    const distance = GeolocationUtils.calculateDistance(
      userLocation.coordinates,
      content.location
    );

    let score = 0;
    let reason = '';
    let isRelevant = false;

    // Distance-based relevance
    if (distance <= content.radius) {
      isRelevant = true;
      score += 100 - (distance / content.radius) * 50; // 50-100 points based on distance within radius
      reason = `Within ${content.radius}km radius`;
    } else if (distance <= options.maxDistance) {
      isRelevant = true;
      score += 50 - (distance / options.maxDistance) * 30; // 20-50 points for nearby content
      reason = `Within ${options.maxDistance}km search radius`;
    }

    // Regional relevance
    if (options.includeRegionalContent && content.targetRegions?.includes(userLocation.region.type)) {
      isRelevant = true;
      score += 30;
      reason = reason ? `${reason}, matches region type` : `Relevant for ${userLocation.region.type} areas`;
    }

    // State-wide relevance
    if (options.includeStateWideContent && content.targetStates?.includes(userLocation.region.state)) {
      isRelevant = true;
      score += 20;
      reason = reason ? `${reason}, state-wide` : `State-wide content for ${userLocation.region.state}`;
    }

    // Priority boost
    const priorityBoost = {
      'critical': 50,
      'high': 30,
      'medium': 10,
      'low': 0
    };
    score += priorityBoost[content.priority];

    // Content type relevance (some types are more location-dependent)
    const typeRelevance = {
      'emergency': 40,
      'agricultural': 35,
      'resource': 30,
      'business': 25,
      'event': 20,
      'cultural': 15,
      'health': 10
    };
    score += typeRelevance[content.type];

    return {
      isRelevant,
      distance: Math.round(distance),
      score: Math.round(score),
      reason
    };
  }

  /**
   * Get emergency content for immediate delivery
   */
  async getEmergencyContent(userLocation: Location): Promise<RelevantContent[]> {
    return this.getRelevantContent({
      userLocation,
      contentTypes: ['emergency'],
      priority: ['critical', 'high'],
      maxDistance: 100,
      includeRegionalContent: true,
      includeStateWideContent: true,
      limit: 10
    });
  }

  /**
   * Get agricultural content based on location and season
   */
  async getAgriculturalContent(userLocation: Location): Promise<RelevantContent[]> {
    return this.getRelevantContent({
      userLocation,
      contentTypes: ['agricultural'],
      maxDistance: 75,
      includeRegionalContent: true,
      includeStateWideContent: false,
      limit: 20
    });
  }

  /**
   * Get local business and resource content
   */
  async getLocalContent(userLocation: Location): Promise<RelevantContent[]> {
    return this.getRelevantContent({
      userLocation,
      contentTypes: ['business', 'resource', 'event'],
      maxDistance: 25,
      includeRegionalContent: false,
      includeStateWideContent: false,
      limit: 30
    });
  }

  /**
   * Subscribe to location-based content updates
   */
  async subscribeToLocationUpdates(
    userLocation: Location,
    callback: (content: RelevantContent[]) => void,
    options?: Partial<ContentDeliveryOptions>
  ): Promise<() => void> {
    const fullOptions: ContentDeliveryOptions = {
      userLocation,
      ...options
    };

    // Initial content delivery
    const initialContent = await this.getRelevantContent(fullOptions);
    callback(initialContent);

    // Set up periodic updates (in a real app, this would use WebSocket or Server-Sent Events)
    const intervalId = setInterval(async () => {
      try {
        const updatedContent = await this.getRelevantContent(fullOptions);
        callback(updatedContent);
      } catch (error) {
        console.error('Failed to get updated content:', error);
      }
    }, 60000); // Update every minute

    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Get content statistics for a region
   */
  async getRegionalContentStats(region: {
    state: string;
    type: 'urban' | 'rural' | 'remote';
  }): Promise<{
    totalContent: number;
    byType: Record<LocationBasedContent['type'], number>;
    byPriority: Record<LocationBasedContent['priority'], number>;
    activeContent: number;
  }> {
    const allContent = await this.getAllContent();
    
    const relevantContent = allContent.filter(content => 
      content.targetStates?.includes(region.state) ||
      content.targetRegions?.includes(region.type)
    );

    const stats = {
      totalContent: relevantContent.length,
      byType: {} as Record<LocationBasedContent['type'], number>,
      byPriority: {} as Record<LocationBasedContent['priority'], number>,
      activeContent: relevantContent.filter(c => c.isActive).length
    };

    // Count by type
    for (const content of relevantContent) {
      stats.byType[content.type] = (stats.byType[content.type] || 0) + 1;
      stats.byPriority[content.priority] = (stats.byPriority[content.priority] || 0) + 1;
    }

    return stats;
  }

  /**
   * Cache management
   */
  private getCacheKey(filters: any): string {
    return JSON.stringify(filters);
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: LocationBasedContent[]): void {
    this.contentCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Mock data - in a real app, this would fetch from an API
   */
  private async getAllContent(): Promise<LocationBasedContent[]> {
    // This is mock data - in a real application, this would come from your backend API
    return [
      {
        id: '1',
        title: 'Bushfire Warning - Blue Mountains',
        description: 'High fire danger warning for Blue Mountains region',
        type: 'emergency',
        priority: 'critical',
        location: { latitude: -33.7, longitude: 150.3 },
        radius: 50,
        targetRegions: ['rural', 'remote'],
        targetStates: ['NSW'],
        content: {
          alertLevel: 'WATCH_AND_ACT',
          evacuationCenters: ['Katoomba RSL', 'Springwood Community Centre']
        },
        validFrom: new Date(Date.now() - 3600000), // 1 hour ago
        validUntil: new Date(Date.now() + 86400000), // 24 hours from now
        isActive: true,
        metadata: {
          source: 'NSW RFS',
          tags: ['bushfire', 'emergency', 'evacuation']
        }
      },
      {
        id: '2',
        title: 'Wheat Harvest Advisory',
        description: 'Optimal conditions for wheat harvest in Central West NSW',
        type: 'agricultural',
        priority: 'high',
        location: { latitude: -33.4, longitude: 149.1 },
        radius: 100,
        targetRegions: ['rural'],
        targetStates: ['NSW'],
        content: {
          cropType: 'wheat',
          recommendation: 'Begin harvest within 48 hours',
          weatherConditions: 'Dry conditions expected for next 5 days'
        },
        validFrom: new Date(Date.now() - 7200000), // 2 hours ago
        validUntil: new Date(Date.now() + 172800000), // 48 hours from now
        isActive: true,
        metadata: {
          source: 'NSW DPI',
          tags: ['agriculture', 'wheat', 'harvest']
        }
      },
      {
        id: '3',
        title: 'Community Market - Orange',
        description: 'Weekly farmers market with local produce and crafts',
        type: 'event',
        priority: 'medium',
        location: { latitude: -33.2839, longitude: 149.0999 },
        radius: 25,
        targetRegions: ['rural', 'urban'],
        content: {
          eventType: 'market',
          schedule: 'Every Saturday 8AM-2PM',
          location: 'Orange Civic Centre'
        },
        validFrom: new Date(Date.now() - 86400000), // 1 day ago
        isActive: true,
        metadata: {
          source: 'Orange City Council',
          tags: ['market', 'community', 'local-produce']
        }
      }
    ];
  }
}

export const contentDeliveryService = new ContentDeliveryService();
export default contentDeliveryService;