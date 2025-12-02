import { authService } from './authService';

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  canTeach: boolean;
  wantsToLearn: boolean;
  category: 'agricultural' | 'technical' | 'creative' | 'business' | 'health' | 'education' | 'trades' | 'other';
}

export interface Interest {
  name: string;
  category: 'agriculture' | 'technology' | 'arts' | 'sports' | 'community' | 'environment' | 'business' | 'health' | 'education' | 'other';
  intensity: 'casual' | 'moderate' | 'passionate';
}

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
}

export interface Availability {
  timeSlots: TimeSlot[];
  timezone: string;
  preferredMeetingTypes: ('in-person' | 'video-call' | 'phone-call' | 'text-chat')[];
  maxTravelDistance?: number;
  responseTime: 'immediate' | 'within-hour' | 'within-day' | 'within-week';
}

export interface MatchingPreferences {
  ageRange?: {
    min: number;
    max: number;
  };
  genderPreference?: ('male' | 'female' | 'other' | 'any')[];
  maxDistance: number;
  preferredSkillLevels: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
  priorityCategories: string[];
  excludeCategories?: string[];
  requireMutualInterests: boolean;
  minimumSharedInterests: number;
}

export interface CommunityMemberProfile {
  userId: string;
  skills: Skill[];
  interests: Interest[];
  availability: Availability;
  matchingPreferences: MatchingPreferences;
  profileCompleteness: number;
  isAvailableForMatching: boolean;
  joinedCommunityDate: string;
  lastActiveDate: string;
}

export interface MatchResult {
  member: CommunityMemberProfile;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      displayName?: string;
      bio?: string;
      avatar?: string;
      occupation?: string;
      farmType?: string;
      yearsInArea?: number;
    };
    location?: {
      city?: string;
      state?: string;
      region?: string;
    };
  };
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
  limit?: number;
}

export interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  skillCategories: { [key: string]: number };
  interestCategories: { [key: string]: number };
  averageProfileCompleteness: number;
}

export interface ConnectionHistory {
  userId: string;
  connectionDate: string;
  interactionCount: number;
  lastInteraction: string;
  connectionType: 'matched' | 'requested' | 'mutual';
  status: 'active' | 'inactive' | 'blocked';
  rating?: number;
  feedback?: string;
}

class CommunityService {
  private baseURL = '/api/community';

  /**
   * Create or update community member profile
   */
  async createOrUpdateProfile(profileData: {
    skills: Skill[];
    interests: Interest[];
    availability: Availability;
    matchingPreferences: MatchingPreferences;
  }): Promise<CommunityMemberProfile> {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update community profile');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get current user's community profile
   */
  async getProfile(): Promise<CommunityMemberProfile | null> {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (response.status === 404) {
        return null; // Profile doesn't exist yet
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get community profile');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Find community matches
   */
  async findMatches(filters: MatchingFilters = {}): Promise<MatchResult[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.maxDistance) queryParams.append('maxDistance', filters.maxDistance.toString());
    if (filters.skillCategories) queryParams.append('skillCategories', filters.skillCategories.join(','));
    if (filters.interestCategories) queryParams.append('interestCategories', filters.interestCategories.join(','));
    if (filters.skillLevels) queryParams.append('skillLevels', filters.skillLevels.join(','));
    if (filters.availabilityTypes) queryParams.append('availabilityTypes', filters.availabilityTypes.join(','));
    if (filters.minAge) queryParams.append('minAge', filters.minAge.toString());
    if (filters.maxAge) queryParams.append('maxAge', filters.maxAge.toString());
    if (filters.genderPreference) queryParams.append('genderPreference', filters.genderPreference.join(','));
    if (filters.communicationStyles) queryParams.append('communicationStyles', filters.communicationStyles.join(','));
    if (filters.minMatchingScore) queryParams.append('minMatchingScore', filters.minMatchingScore.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseURL}/matches?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to find matches');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Connect with a community member
   */
  async connectWithMember(memberId: string, connectionType: 'matched' | 'requested' | 'mutual' = 'requested'): Promise<void> {
    const response = await fetch(`${this.baseURL}/connect/${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({ connectionType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect with member');
    }
  }

  /**
   * Get connection history
   */
  async getConnectionHistory(): Promise<ConnectionHistory[]> {
    const response = await fetch(`${this.baseURL}/connections`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get connection history');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update availability
   */
  async updateAvailability(availability: Availability): Promise<CommunityMemberProfile> {
    const response = await fetch(`${this.baseURL}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify(availability),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update availability');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update matching preferences
   */
  async updateMatchingPreferences(preferences: Partial<MatchingPreferences>): Promise<CommunityMemberProfile> {
    const response = await fetch(`${this.baseURL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update preferences');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Toggle matching availability
   */
  async toggleMatchingAvailability(): Promise<CommunityMemberProfile> {
    const response = await fetch(`${this.baseURL}/toggle-availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle availability');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get community statistics
   */
  async getCommunityStats(): Promise<CommunityStats> {
    const response = await fetch(`${this.baseURL}/stats`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get community statistics');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get community members (public endpoint)
   */
  async getCommunityMembers(filters: MatchingFilters = {}): Promise<MatchResult[] | CommunityStats> {
    const queryParams = new URLSearchParams();
    
    if (filters.skillCategories) queryParams.append('skillCategories', filters.skillCategories.join(','));
    if (filters.interestCategories) queryParams.append('interestCategories', filters.interestCategories.join(','));
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const headers: HeadersInit = {};
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/members?${queryParams}`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get community members');
    }

    const result = await response.json();
    return result.data;
  }
}

export const communityService = new CommunityService();