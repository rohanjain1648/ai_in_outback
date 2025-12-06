// Service Directory Frontend Service
// Handles communication with backend service directory API and offline caching

export interface ServiceListing {
    _id: string;
    name: string;
    category: 'health' | 'transport' | 'government' | 'emergency' | 'education' | 'financial' | 'legal' | 'social' | 'other';
    subcategory?: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
        address: string;
        city?: string;
        state?: string;
        postcode?: string;
        region: string;
    };
    contact: {
        phone: string;
        email?: string;
        website?: string;
        hours: string;
        emergencyContact?: string;
    };
    services: string[];
    ratings: {
        average: number;
        count: number;
    };
    reviews?: ServiceReview[];
    isVerified: boolean;
    source: string;
    offlineAvailable: boolean;
    isEssential: boolean;
    tags: string[];
    accessibility?: {
        wheelchairAccessible?: boolean;
        parkingAvailable?: boolean;
        publicTransportNearby?: boolean;
        interpreterServices?: boolean;
        notes?: string;
    };
    distance?: number;
}

export interface ServiceReview {
    user: {
        _id: string;
        profile?: {
            firstName?: string;
            lastName?: string;
        };
    };
    rating: number;
    comment: string;
    date: Date;
    helpful: number;
}

export interface ServiceSearchFilters {
    query?: string;
    category?: string;
    location?: { lat: number; lon: number; radius?: string };
    verified?: boolean;
    minRating?: number;
    tags?: string[];
    essentialOnly?: boolean;
    offlineAvailable?: boolean;
}

export interface ServiceSearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'distance' | 'rating' | 'date';
    lowDataMode?: boolean;
}

export interface ServiceSearchResult {
    services: ServiceListing[];
    total: number;
    suggestions?: string[];
}

export interface ServiceCategory {
    category: string;
    count: number;
    essentialCount: number;
    subcategories: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const CACHE_KEY_PREFIX = 'service_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ESSENTIAL_SERVICES_KEY = 'essential_services';

class ServiceDirectoryService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || data;
    }

    /**
     * Search services with filters and options
     */
    async searchServices(
        filters: ServiceSearchFilters = {},
        options: ServiceSearchOptions = {}
    ): Promise<ServiceSearchResult> {
        try {
            // Build query parameters
            const params = new URLSearchParams();

            if (filters.query) params.append('query', filters.query);
            if (filters.category) params.append('category', filters.category);
            if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
            if (filters.minRating) params.append('minRating', filters.minRating.toString());
            if (filters.essentialOnly) params.append('essentialOnly', 'true');
            if (filters.offlineAvailable) params.append('offlineAvailable', 'true');
            if (filters.tags && filters.tags.length > 0) {
                params.append('tags', filters.tags.join(','));
            }
            if (filters.location) {
                params.append('lat', filters.location.lat.toString());
                params.append('lon', filters.location.lon.toString());
                if (filters.location.radius) {
                    params.append('radius', filters.location.radius);
                }
            }

            if (options.limit) params.append('limit', options.limit.toString());
            if (options.offset) params.append('offset', options.offset.toString());
            if (options.sortBy) params.append('sortBy', options.sortBy);
            if (options.lowDataMode) params.append('lowDataMode', 'true');

            // Check cache first
            const cacheKey = `${CACHE_KEY_PREFIX}${params.toString()}`;
            const cached = this.getFromCache<ServiceSearchResult>(cacheKey);
            if (cached) {
                return cached;
            }

            // Fetch from API
            const result = await this.request<ServiceSearchResult>(`/services/search?${params.toString()}`);

            // Cache the result
            this.setCache(cacheKey, result);

            return result;
        } catch (error) {
            console.error('Error searching services:', error);

            // Try to return cached essential services if offline
            if (!navigator.onLine) {
                const essentialServices = this.getEssentialServicesFromCache();
                if (essentialServices.length > 0) {
                    return {
                        services: essentialServices,
                        total: essentialServices.length,
                        suggestions: []
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Get a specific service by ID
     */
    async getServiceById(serviceId: string): Promise<ServiceListing> {
        return this.request<ServiceListing>(`/services/${serviceId}`);
    }

    /**
     * Get essential services for offline availability
     */
    async getEssentialServices(location?: { lat: number; lon: number }): Promise<ServiceListing[]> {
        try {
            const params = new URLSearchParams();
            if (location) {
                params.append('lat', location.lat.toString());
                params.append('lon', location.lon.toString());
            }

            const services = await this.request<ServiceListing[]>(`/services/essential?${params.toString()}`);

            // Cache essential services for offline use
            this.cacheEssentialServices(services);

            return services;
        } catch (error) {
            console.error('Error fetching essential services:', error);

            // Return cached essential services if available
            return this.getEssentialServicesFromCache();
        }
    }

    /**
     * Add a review to a service
     */
    async addServiceReview(serviceId: string, rating: number, comment: string): Promise<ServiceListing> {
        const result = await this.request<ServiceListing>(`/services/${serviceId}/review`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment }),
        });

        // Clear cache after adding review
        this.clearCache();

        return result;
    }

    /**
     * Record that a service was contacted
     */
    async recordServiceContact(serviceId: string): Promise<void> {
        try {
            await this.request<void>(`/services/${serviceId}/contact`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error recording service contact:', error);
            // Don't throw - this is not critical
        }
    }

    /**
     * Get service categories with counts
     */
    async getServiceCategories(): Promise<ServiceCategory[]> {
        const cacheKey = `${CACHE_KEY_PREFIX}categories`;
        const cached = this.getFromCache<ServiceCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const categories = await this.request<ServiceCategory[]>('/services/categories');
        this.setCache(cacheKey, categories);

        return categories;
    }

    /**
     * Cache management
     */
    private getFromCache<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age > CACHE_DURATION) {
                localStorage.removeItem(key);
                return null;
            }

            return data as T;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    private setCache<T>(key: string, data: T): void {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error writing to cache:', error);
        }
    }

    private clearCache(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    private cacheEssentialServices(services: ServiceListing[]): void {
        try {
            localStorage.setItem(ESSENTIAL_SERVICES_KEY, JSON.stringify(services));
        } catch (error) {
            console.error('Error caching essential services:', error);
        }
    }

    private getEssentialServicesFromCache(): ServiceListing[] {
        try {
            const cached = localStorage.getItem(ESSENTIAL_SERVICES_KEY);
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Error reading essential services from cache:', error);
            return [];
        }
    }
}

export const serviceDirectoryService = new ServiceDirectoryService();
