import {
  Business,
  BusinessSearchFilters,
  BusinessMatch,
  EconomicOpportunity,
  BusinessAnalytics,
  BusinessReview
} from '../types/business';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class BusinessService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    return data.data;
  }

  async searchBusinesses(filters: BusinessSearchFilters): Promise<{
    businesses: Business[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item.toString()));
        } else if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.makeRequest(`/business/directory?${queryParams.toString()}`);
  }

  async getBusinessRecommendations(limit: number = 10): Promise<Business[]> {
    return this.makeRequest(`/business/recommendations?limit=${limit}`);
  }

  async createBusiness(businessData: Partial<Business>): Promise<Business> {
    return this.makeRequest('/business/profile', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async getBusinessById(businessId: string): Promise<Business> {
    return this.makeRequest(`/business/${businessId}`);
  }

  async updateBusiness(businessId: string, updateData: Partial<Business>): Promise<Business> {
    return this.makeRequest(`/business/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getBusinessMatches(criteria: {
    businessId: string;
    lookingFor: string[];
    offering: string[];
    preferredLocation?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  }): Promise<{ matches: BusinessMatch[] }> {
    return this.makeRequest('/business/matches', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  async addBusinessReview(businessId: string, reviewData: {
    rating: number;
    title: string;
    comment: string;
  }): Promise<BusinessReview> {
    return this.makeRequest(`/business/${businessId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getBusinessAnalytics(businessId: string): Promise<BusinessAnalytics> {
    return this.makeRequest(`/business/${businessId}/analytics`);
  }

  async getEconomicOpportunities(
    latitude: number,
    longitude: number,
    radius: number = 25
  ): Promise<{ opportunities: EconomicOpportunity[] }> {
    return this.makeRequest(
      `/business/opportunities/area?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  }

  // Utility methods
  formatBusinessHours(businessHours: Business['businessHours']): string {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const openDays = days
      .map((day, index) => {
        const hours = businessHours[day];
        if (!hours || hours.closed) return null;
        return `${dayNames[index]}: ${hours.open}-${hours.close}`;
      })
      .filter(Boolean);

    return openDays.length > 0 ? openDays.join(', ') : 'Hours not specified';
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  formatRevenueRange(range: string): string {
    const ranges: Record<string, string> = {
      'under-50k': 'Under $50K',
      '50k-100k': '$50K - $100K',
      '100k-250k': '$100K - $250K',
      '250k-500k': '$250K - $500K',
      '500k-1m': '$500K - $1M',
      '1m-5m': '$1M - $5M',
      'over-5m': 'Over $5M'
    };
    return ranges[range] || range;
  }

  formatBusinessType(type: string): string {
    const types: Record<string, string> = {
      'sole-trader': 'Sole Trader',
      'partnership': 'Partnership',
      'company': 'Company',
      'trust': 'Trust'
    };
    return types[type] || type;
  }

  getVerificationBadgeColor(status: string): string {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  renderStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
      (hasHalfStar ? '☆' : '') +
      '☆'.repeat(emptyStars);
  }
}

export const businessService = new BusinessService();