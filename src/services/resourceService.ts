import { Resource, SearchFilters, SearchResult, ResourceRecommendation, CreateResourceData, ResourceCategory } from '../types/resource';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ResourceService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');

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
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async searchResources(filters: SearchFilters): Promise<SearchResult> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.makeRequest<SearchResult>(`/resources/search?${queryParams.toString()}`);
  }

  async getResourceById(id: string): Promise<{ resource: Resource }> {
    return this.makeRequest<{ resource: Resource }>(`/resources/${id}`);
  }

  async createResource(resourceData: CreateResourceData): Promise<{ resource: Resource }> {
    return this.makeRequest<{ resource: Resource }>('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  }

  async updateResource(id: string, resourceData: Partial<CreateResourceData>): Promise<{ resource: Resource }> {
    return this.makeRequest<{ resource: Resource }>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  }

  async deleteResource(id: string): Promise<void> {
    await this.makeRequest(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  async getRecommendations(lat?: number, lon?: number, limit: number = 10): Promise<{ recommendations: ResourceRecommendation[] }> {
    const queryParams = new URLSearchParams();
    if (lat !== undefined) queryParams.append('lat', lat.toString());
    if (lon !== undefined) queryParams.append('lon', lon.toString());
    queryParams.append('limit', limit.toString());

    return this.makeRequest<{ recommendations: ResourceRecommendation[] }>(`/resources/recommendations?${queryParams.toString()}`);
  }

  async getPopularResources(lat?: number, lon?: number, limit: number = 10): Promise<{ resources: Resource[] }> {
    const queryParams = new URLSearchParams();
    if (lat !== undefined) queryParams.append('lat', lat.toString());
    if (lon !== undefined) queryParams.append('lon', lon.toString());
    queryParams.append('limit', limit.toString());

    return this.makeRequest<{ resources: Resource[] }>(`/resources/popular?${queryParams.toString()}`);
  }

  async getCategories(): Promise<{ categories: ResourceCategory[] }> {
    return this.makeRequest<{ categories: ResourceCategory[] }>('/resources/categories');
  }

  async addReview(resourceId: string, rating: number, comment: string): Promise<{ resource: Resource }> {
    return this.makeRequest<{ resource: Resource }>(`/resources/${resourceId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async getUserResources(includeInactive: boolean = false): Promise<{ resources: Resource[] }> {
    const queryParams = new URLSearchParams();
    if (includeInactive) queryParams.append('includeInactive', 'true');

    return this.makeRequest<{ resources: Resource[] }>(`/resources/user/my-resources?${queryParams.toString()}`);
  }

  // Utility methods
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      equipment: 'Equipment & Tools',
      services: 'Services',
      knowledge: 'Knowledge & Skills',
      materials: 'Materials & Supplies',
      transportation: 'Transportation',
      accommodation: 'Accommodation',
      emergency: 'Emergency Resources',
      other: 'Other'
    };
    return categoryNames[category] || category;
  }

  getAvailabilityDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      available: 'Available',
      unavailable: 'Not Available',
      limited: 'Limited Availability'
    };
    return statusNames[status] || status;
  }

  getPricingDisplayName(type: string): string {
    const pricingNames: Record<string, string> = {
      free: 'Free',
      paid: 'Paid',
      donation: 'Donation',
      barter: 'Barter/Trade'
    };
    return pricingNames[type] || type;
  }

  formatDistance(distance?: number): string {
    if (!distance) return '';

    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  }

  formatRating(rating: number, count: number): string {
    if (count === 0) return 'No ratings';
    return `${rating.toFixed(1)} (${count} review${count !== 1 ? 's' : ''})`;
  }

  getContactMethod(contact: Resource['contact']): string {
    const methods: Record<string, string> = {
      phone: contact.phone ? `Call ${contact.phone}` : 'Phone contact',
      email: contact.email ? `Email ${contact.email}` : 'Email contact',
      'in-person': 'In-person contact'
    };
    return methods[contact.preferredMethod] || 'Contact available';
  }
}

export const resourceService = new ResourceService();