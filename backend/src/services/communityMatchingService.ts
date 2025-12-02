import { CommunityMember, ICommunityMember } from '../models/CommunityMember';
import { User, IUser } from '../models/User';
import { AIMatchingService } from './aiMatchingService';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface MatchResult {
  member: ICommunityMember;
  user: IUser;
  matchingScore: number;
  compatibilityFactors: {
    skillsAlignment: number;
    interestsAlignment: number;
    availabilityMatch: number;
    locationCompatibility: number;
    communicationStyle: number;
    experienceLevel: number;
  };
  reasoning: string;
  recommendations: string[];
  distance?: number;
}

export interface MatchingFilters {
  maxDistance?: number;
  skillCategories?: string[];
  interestCategories?: string[];
  skillLevels?: string[];
  availabilityTypes?: string[];
  minAge?: number;
  maxAge?: number;
  genderPreference?: string[];
  communicationStyles?: string[];
  minMatchingScore?: number;
  excludeUserIds?: string[];
}

export interface CreateCommunityMemberData {
  userId: string;
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience?: number;
    canTeach: boolean;
    wantsToLearn: boolean;
    category: string;
  }[];
  interests: {
    name: string;
    category: string;
    intensity: 'casual' | 'moderate' | 'passionate';
  }[];
  availability: {
    timeSlots: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
    timezone: string;
    preferredMeetingTypes: string[];
    maxTravelDistance?: number;
    responseTime: string;
  };
  matchingPreferences: {
    ageRange?: { min: number; max: number };
    genderPreference?: string[];
    maxDistance: number;
    preferredSkillLevels: string[];
    priorityCategories: string[];
    excludeCategories?: string[];
    requireMutualInterests: boolean;
    minimumSharedInterests: number;
  };
}

export class CommunityMatchingService {
  /**
   * Create or update community member profile
   */
  static async createOrUpdateCommunityMember(data: CreateCommunityMemberData): Promise<ICommunityMember> {
    try {
      // Verify user exists
      const user = await User.findById(data.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if community member already exists
      let communityMember = await CommunityMember.findOne({ userId: data.userId });

      if (communityMember) {
        // Update existing member
        Object.assign(communityMember, {
          skills: data.skills,
          interests: data.interests,
          availability: data.availability,
          matchingPreferences: data.matchingPreferences,
          lastActiveDate: new Date(),
        });
      } else {
        // Create new community member
        communityMember = new CommunityMember({
          userId: data.userId,
          skills: data.skills,
          interests: data.interests,
          availability: data.availability,
          matchingPreferences: data.matchingPreferences,
          connectionHistory: [],
          interactionPatterns: {
            preferredConnectionTypes: [],
            successfulMatchCategories: [],
            communicationStyle: 'friendly',
            responsePatterns: {
              averageResponseTime: 60,
              preferredContactTimes: [],
              communicationFrequency: 'weekly',
            },
          },
          isAvailableForMatching: true,
          joinedCommunityDate: new Date(),
          lastActiveDate: new Date(),
        });
      }

      await communityMember.save();
      return communityMember;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create/update community member', 500);
    }
  }

  /**
   * Find potential matches for a user
   */
  static async findMatches(
    userId: string,
    filters: MatchingFilters = {},
    limit: number = 20
  ): Promise<MatchResult[]> {
    try {
      // Get current user and their community member profile
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        throw new AppError('User not found', 404);
      }

      const currentMember = await CommunityMember.findOne({ userId });
      if (!currentMember) {
        throw new AppError('Community member profile not found. Please complete your profile first.', 404);
      }

      if (!currentMember.isAvailableForMatching) {
        return [];
      }

      // Build query for potential matches
      const query = this.buildMatchingQuery(currentMember, filters);
      
      // Find potential matches
      const potentialMatches = await CommunityMember.find(query)
        .populate('userId')
        .limit(limit * 2) // Get more than needed for filtering
        .lean();

      // Calculate matching scores and filter
      const matchResults: MatchResult[] = [];

      for (const match of potentialMatches) {
        if (!match.userId || match.userId.toString() === userId) continue;

        const matchUser = match.userId as any; // Populated user data
        
        // Apply additional filters
        if (!this.passesFilters(match, matchUser, currentUser, filters)) continue;

        // Calculate AI-enhanced matching score
        const aiResult = await AIMatchingService.calculateAIMatchingScore(
          currentMember,
          match as ICommunityMember,
          currentUser,
          matchUser
        );

        // Apply minimum score filter
        if (filters.minMatchingScore && aiResult.score < filters.minMatchingScore) continue;

        // Calculate distance if both users have location data
        let distance: number | undefined;
        if (currentUser.location?.coordinates && matchUser.location?.coordinates) {
          distance = this.calculateDistance(
            currentUser.location.coordinates[1],
            currentUser.location.coordinates[0],
            matchUser.location.coordinates[1],
            matchUser.location.coordinates[0]
          );
        }

        matchResults.push({
          member: match as ICommunityMember,
          user: matchUser,
          matchingScore: aiResult.score,
          compatibilityFactors: aiResult.compatibilityFactors,
          reasoning: aiResult.reasoning,
          recommendations: aiResult.recommendations,
          distance,
        });
      }

      // Sort by matching score and return top results
      return matchResults
        .sort((a, b) => b.matchingScore - a.matchingScore)
        .slice(0, limit);

    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to find matches', 500);
    }
  }

  /**
   * Get community member by user ID
   */
  static async getCommunityMemberByUserId(userId: string): Promise<ICommunityMember | null> {
    return CommunityMember.findOne({ userId }).populate('userId');
  }

  /**
   * Update community member availability
   */
  static async updateAvailability(userId: string, availability: any): Promise<ICommunityMember | null> {
    const member = await CommunityMember.findOne({ userId });
    if (!member) {
      throw new AppError('Community member not found', 404);
    }

    member.availability = availability;
    member.lastActiveDate = new Date();
    await member.save();

    return member;
  }

  /**
   * Record a connection between two community members
   */
  static async recordConnection(
    userId: string,
    targetUserId: string,
    connectionType: 'matched' | 'requested' | 'mutual'
  ): Promise<void> {
    try {
      const member = await CommunityMember.findOne({ userId });
      if (!member) {
        throw new AppError('Community member not found', 404);
      }

      // Check if connection already exists
      const existingConnection = member.connectionHistory.find(
        conn => conn.userId.toString() === targetUserId
      );

      if (existingConnection) {
        // Update existing connection
        existingConnection.connectionType = connectionType;
        existingConnection.lastInteraction = new Date();
        existingConnection.interactionCount += 1;
      } else {
        // Add new connection
        member.connectionHistory.push({
          userId: new mongoose.Types.ObjectId(targetUserId),
          connectionDate: new Date(),
          interactionCount: 1,
          lastInteraction: new Date(),
          connectionType,
          status: 'active',
        });
      }

      member.lastActiveDate = new Date();
      await member.save();

      // Learn from this interaction
      await AIMatchingService.learnFromUserInteraction({
        userId,
        interactionType: 'connection_made',
        targetUserId,
        contextData: {
          sharedSkills: [], // TODO: Calculate shared skills
          sharedInterests: [], // TODO: Calculate shared interests
          distance: 0, // TODO: Calculate distance
          meetingType: 'unknown',
        },
      });

    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to record connection', 500);
    }
  }

  /**
   * Get connection history for a user
   */
  static async getConnectionHistory(userId: string): Promise<any[]> {
    const member = await CommunityMember.findOne({ userId })
      .populate('connectionHistory.userId');
    
    if (!member) {
      throw new AppError('Community member not found', 404);
    }

    return member.connectionHistory;
  }

  /**
   * Update matching preferences
   */
  static async updateMatchingPreferences(userId: string, preferences: any): Promise<ICommunityMember | null> {
    const member = await CommunityMember.findOne({ userId });
    if (!member) {
      throw new AppError('Community member not found', 404);
    }

    member.matchingPreferences = { ...member.matchingPreferences, ...preferences };
    member.lastActiveDate = new Date();
    await member.save();

    return member;
  }

  /**
   * Toggle matching availability
   */
  static async toggleMatchingAvailability(userId: string): Promise<ICommunityMember | null> {
    const member = await CommunityMember.findOne({ userId });
    if (!member) {
      throw new AppError('Community member not found', 404);
    }

    member.isAvailableForMatching = !member.isAvailableForMatching;
    member.lastActiveDate = new Date();
    await member.save();

    return member;
  }

  /**
   * Get community statistics
   */
  static async getCommunityStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    skillCategories: { [key: string]: number };
    interestCategories: { [key: string]: number };
    averageProfileCompleteness: number;
  }> {
    const totalMembers = await CommunityMember.countDocuments();
    const activeMembers = await CommunityMember.countDocuments({ 
      isAvailableForMatching: true,
      lastActiveDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
    });

    // Aggregate skill categories
    const skillStats = await CommunityMember.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills.category', count: { $sum: 1 } } },
    ]);

    // Aggregate interest categories
    const interestStats = await CommunityMember.aggregate([
      { $unwind: '$interests' },
      { $group: { _id: '$interests.category', count: { $sum: 1 } } },
    ]);

    // Calculate average profile completeness
    const completenessStats = await CommunityMember.aggregate([
      { $group: { _id: null, avgCompleteness: { $avg: '$profileCompleteness' } } },
    ]);

    const skillCategories: { [key: string]: number } = {};
    skillStats.forEach(stat => {
      skillCategories[stat._id] = stat.count;
    });

    const interestCategories: { [key: string]: number } = {};
    interestStats.forEach(stat => {
      interestCategories[stat._id] = stat.count;
    });

    return {
      totalMembers,
      activeMembers,
      skillCategories,
      interestCategories,
      averageProfileCompleteness: completenessStats[0]?.avgCompleteness || 0,
    };
  }

  /**
   * Build MongoDB query for matching
   */
  private static buildMatchingQuery(currentMember: ICommunityMember, filters: MatchingFilters): any {
    const query: any = {
      userId: { $ne: currentMember.userId },
      isAvailableForMatching: true,
    };

    // Exclude specific user IDs
    if (filters.excludeUserIds && filters.excludeUserIds.length > 0) {
      query.userId.$nin = filters.excludeUserIds.map(id => new mongoose.Types.ObjectId(id));
    }

    // Filter by skill categories
    if (filters.skillCategories && filters.skillCategories.length > 0) {
      query['skills.category'] = { $in: filters.skillCategories };
    }

    // Filter by interest categories
    if (filters.interestCategories && filters.interestCategories.length > 0) {
      query['interests.category'] = { $in: filters.interestCategories };
    }

    // Filter by skill levels
    if (filters.skillLevels && filters.skillLevels.length > 0) {
      query['skills.level'] = { $in: filters.skillLevels };
    }

    // Filter by availability types
    if (filters.availabilityTypes && filters.availabilityTypes.length > 0) {
      query['availability.preferredMeetingTypes'] = { $in: filters.availabilityTypes };
    }

    return query;
  }

  /**
   * Check if a potential match passes additional filters
   */
  private static passesFilters(
    match: any,
    matchUser: any,
    currentUser: IUser,
    filters: MatchingFilters
  ): boolean {
    // Age filters
    if (filters.minAge || filters.maxAge) {
      const age = this.calculateAge(matchUser.profile.dateOfBirth);
      if (age !== null) {
        if (filters.minAge && age < filters.minAge) return false;
        if (filters.maxAge && age > filters.maxAge) return false;
      }
    }

    // Gender preference filter
    if (filters.genderPreference && filters.genderPreference.length > 0) {
      if (!filters.genderPreference.includes(matchUser.profile.gender) && 
          !filters.genderPreference.includes('any')) {
        return false;
      }
    }

    // Communication style filter
    if (filters.communicationStyles && filters.communicationStyles.length > 0) {
      if (!filters.communicationStyles.includes(match.interactionPatterns.communicationStyle)) {
        return false;
      }
    }

    // Distance filter
    if (filters.maxDistance && currentUser.location?.coordinates && matchUser.location?.coordinates) {
      const distance = this.calculateDistance(
        currentUser.location.coordinates[1],
        currentUser.location.coordinates[0],
        matchUser.location.coordinates[1],
        matchUser.location.coordinates[0]
      );
      if (distance > filters.maxDistance) return false;
    }

    return true;
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth?: Date): number | null {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}