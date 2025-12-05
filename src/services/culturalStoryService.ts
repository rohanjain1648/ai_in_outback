const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreateStoryData {
  title: string;
  content: string;
  summary?: string;
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  location: {
    coordinates: [number, number];
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: string;
    isOngoing?: boolean;
  };
  relatedPeople?: string[];
  relatedEvents?: string[];
  visibility: 'public' | 'community' | 'private';
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
    radius: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CulturalStory {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  location: {
    coordinates: [number, number];
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: string;
    isOngoing?: boolean;
  };
  media: MediaItem[];
  connections: StoryConnection[];
  relatedPeople: string[];
  relatedEvents: string[];
  views: number;
  likes: string[];
  comments: Comment[];
  culturalSignificance: 'high' | 'medium' | 'low';
  readingTime: number;
  createdAt: string;
  aiInsights: {
    themes: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    complexity: number;
    recommendedAudience: string[];
  };
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  caption?: string;
  thumbnailUrl?: string;
  metadata?: {
    duration?: number;
    dimensions?: { width: number; height: number };
  };
}

export interface StoryConnection {
  storyId: string;
  connectionType: 'related' | 'sequel' | 'prequel' | 'reference' | 'location' | 'family';
  description?: string;
  strength: number;
}

export interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export interface StoriesResponse {
  stories: CulturalStory[];
  total: number;
  page: number;
  totalPages: number;
}

class CulturalStoryService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getStories(
    filters: StoryFilters = {},
    page = 1,
    limit = 20
  ): Promise<StoriesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to params
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    if (filters.author) params.append('author', filters.author);
    if (filters.status) params.append('status', filters.status);
    if (filters.culturalSignificance) params.append('culturalSignificance', filters.culturalSignificance);

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    if (filters.location) {
      params.append('lat', filters.location.coordinates[1].toString());
      params.append('lng', filters.location.coordinates[0].toString());
      params.append('radius', filters.location.radius.toString());
    }

    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start.toISOString());
      params.append('endDate', filters.dateRange.end.toISOString());
    }

    const response = await this.request<{ success: boolean; data: StoriesResponse }>(
      `/culture/stories?${params.toString()}`
    );

    return response.data;
  }

  async getStoryById(storyId: string): Promise<CulturalStory> {
    const response = await this.request<{ success: boolean; data: CulturalStory }>(
      `/culture/stories/${storyId}`
    );

    return response.data;
  }

  async createStory(storyData: CreateStoryData): Promise<CulturalStory> {
    const response = await this.request<{ success: boolean; data: CulturalStory }>(
      '/culture/stories',
      {
        method: 'POST',
        body: JSON.stringify(storyData),
      }
    );

    return response.data;
  }

  async updateStory(storyId: string, storyData: Partial<CreateStoryData>): Promise<CulturalStory> {
    const response = await this.request<{ success: boolean; data: CulturalStory }>(
      `/culture/stories/${storyId}`,
      {
        method: 'PUT',
        body: JSON.stringify(storyData),
      }
    );

    return response.data;
  }

  async uploadMedia(storyId: string, files: File[], captions: string[] = []): Promise<MediaItem[]> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('media', file);
    });

    if (captions.length > 0) {
      formData.append('captions', JSON.stringify(captions));
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/culture/stories/${storyId}/media`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async searchStories(
    query: string,
    filters: StoryFilters = {},
    page = 1,
    limit = 20
  ): Promise<StoriesResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters
    if (filters.category) params.append('category', filters.category);
    if (filters.region) params.append('region', filters.region);
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const response = await this.request<{ success: boolean; data: StoriesResponse }>(
      `/culture/search?${params.toString()}`
    );

    return response.data;
  }

  async getRecommendations(limit = 10): Promise<CulturalStory[]> {
    const response = await this.request<{ success: boolean; data: CulturalStory[] }>(
      `/culture/recommendations?limit=${limit}`
    );

    return response.data;
  }

  async likeStory(storyId: string): Promise<{ story: CulturalStory; isLiked: boolean }> {
    const response = await this.request<{
      success: boolean;
      data: { story: CulturalStory; isLiked: boolean }
    }>(
      `/culture/stories/${storyId}/like`,
      { method: 'POST' }
    );

    return response.data;
  }

  async addComment(storyId: string, content: string): Promise<CulturalStory> {
    const response = await this.request<{ success: boolean; data: CulturalStory }>(
      `/culture/stories/${storyId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );

    return response.data;
  }

  async addStoryConnection(
    storyId: string,
    connection: {
      storyId: string;
      connectionType: 'related' | 'sequel' | 'prequel' | 'reference' | 'location' | 'family';
      description?: string;
      strength?: number;
    }
  ): Promise<CulturalStory> {
    const response = await this.request<{ success: boolean; data: CulturalStory }>(
      `/culture/stories/${storyId}/connections`,
      {
        method: 'POST',
        body: JSON.stringify(connection),
      }
    );

    return response.data;
  }

  async getPopularTags(): Promise<string[]> {
    const response = await this.request<{ success: boolean; data: string[] }>(
      '/culture/tags/popular'
    );

    return response.data;
  }

  async getStoryStats(): Promise<{
    totalStories: number;
    storiesByCategory: Record<string, number>;
    storiesByRegion: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
  }> {
    const response = await this.request<{
      success: boolean;
      data: {
        totalStories: number;
        storiesByCategory: Record<string, number>;
        storiesByRegion: Record<string, number>;
        topTags: Array<{ tag: string; count: number }>;
      }
    }>('/culture/stats');

    return response.data;
  }

  // Utility methods for working with stories
  formatReadingTime(minutes: number): string {
    if (minutes < 1) return 'Less than 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryColor(category: string): string {
    const colors = {
      traditional: 'bg-amber-100 text-amber-800',
      historical: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      community: 'bg-purple-100 text-purple-800',
      legend: 'bg-red-100 text-red-800',
      contemporary: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getSignificanceIcon(significance: string): string {
    const icons = {
      high: '⭐⭐⭐',
      medium: '⭐⭐',
      low: '⭐'
    };
    return icons[significance as keyof typeof icons] || '⭐';
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  extractKeywords(content: string, limit = 10): string[] {
    // Simple keyword extraction - in production, you might use a more sophisticated algorithm
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }

  validateStoryData(data: CreateStoryData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!data.content || data.content.trim().length < 50) {
      errors.push('Story content must be at least 50 characters long');
    }

    if (!data.location.region || data.location.region.trim().length < 2) {
      errors.push('Region is required');
    }

    if (!data.location.coordinates || data.location.coordinates.length !== 2) {
      errors.push('Valid coordinates are required');
    }

    if (data.tags.length > 20) {
      errors.push('Cannot have more than 20 tags');
    }

    if (data.relatedPeople && data.relatedPeople.length > 50) {
      errors.push('Cannot have more than 50 related people');
    }

    if (data.relatedEvents && data.relatedEvents.length > 20) {
      errors.push('Cannot have more than 20 related events');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const culturalStoryService = new CulturalStoryService();