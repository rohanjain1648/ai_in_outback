import { ServiceListing, IServiceListing } from '../models/ServiceListing';
import mongoose from 'mongoose';
import axios from 'axios';

interface SearchFilters {
    query?: string;
    category?: string;
    location?: { lat: number; lon: number; radius?: string };
    verified?: boolean;
    minRating?: number;
    tags?: string[];
    essentialOnly?: boolean;
    offlineAvailable?: boolean;
}

interface SearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'distance' | 'rating' | 'date';
    lowDataMode?: boolean;
}

interface ServiceCache {
    services: any[];
    timestamp: Date;
    filters: string;
}

class ServiceDirectoryService {
    private cache: Map<string, ServiceCache> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Create a new service listing
     */
    async createService(serviceData: Partial<IServiceListing>): Promise<IServiceListing> {
        try {
            const service = new ServiceListing(serviceData);
            await service.save();

            // Clear relevant caches
            this.clearCache();

            return service;
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    }

    /**
     * Update an existing service listing
     */
    async updateService(serviceId: string, updateData: Partial<IServiceListing>): Promise<IServiceListing | null> {
        try {
            const service = await ServiceListing.findByIdAndUpdate(
                serviceId,
                { ...updateData, lastUpdated: new Date() },
                { new: true, runValidators: true }
            );

            if (service) {
                this.clearCache();
            }

            return service;
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    }

    /**
     * Delete a service listing
     */
    async deleteService(serviceId: string): Promise<boolean> {
        try {
            const result = await ServiceListing.findByIdAndDelete(serviceId);

            if (result) {
                this.clearCache();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    }

    /**
     * Get service by ID
     */
    async getServiceById(serviceId: string, incrementView: boolean = false): Promise<IServiceListing | null> {
        try {
            const service = await ServiceListing.findById(serviceId)
                .populate('reviews.user', 'profile.firstName profile.lastName');

            if (service && incrementView) {
                await ServiceListing.findByIdAndUpdate(serviceId, {
                    $inc: { 'metadata.viewCount': 1 },
                    'metadata.lastViewedAt': new Date()
                });
            }

            return service;
        } catch (error) {
            console.error('Error getting service by ID:', error);
            throw error;
        }
    }

    /**
     * Search services with filters and options
     */
    async searchServices(
        filters: SearchFilters,
        options: SearchOptions = {}
    ): Promise<{
        services: any[];
        total: number;
        suggestions?: string[];
    }> {
        try {
            const { lowDataMode = false, ...searchOptions } = options;

            // Check cache first
            const cacheKey = this.getCacheKey(filters, searchOptions);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return {
                    services: cached.services,
                    total: cached.services.length,
                    suggestions: []
                };
            }

            // Build search query
            const searchResult = await this.searchServicesMongoDB(filters, searchOptions, lowDataMode);

            // Cache results
            this.setCache(cacheKey, searchResult.services);

            // Generate suggestions based on query
            const suggestions = filters.query ? await this.generateSuggestions(filters.query) : [];

            return {
                ...searchResult,
                suggestions
            };
        } catch (error) {
            console.error('Error searching services:', error);
            throw error;
        }
    }

    /**
     * Search services using MongoDB
     */
    private async searchServicesMongoDB(
        filters: SearchFilters,
        options: SearchOptions,
        lowDataMode: boolean
    ): Promise<{ services: any[]; total: number }> {
        const {
            query,
            category,
            location,
            verified,
            minRating,
            tags,
            essentialOnly,
            offlineAvailable
        } = filters;

        const {
            limit = 20,
            offset = 0,
            sortBy = 'relevance'
        } = options;

        // Build MongoDB query
        const mongoQuery: any = { isActive: true };

        if (category) {
            mongoQuery.category = category;
        }

        if (verified !== undefined) {
            mongoQuery.isVerified = verified;
        }

        if (minRating) {
            mongoQuery['ratings.average'] = { $gte: minRating };
        }

        if (tags && tags.length > 0) {
            mongoQuery.tags = { $in: tags };
        }

        if (essentialOnly) {
            mongoQuery.isEssential = true;
        }

        if (offlineAvailable) {
            mongoQuery.offlineAvailable = true;
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
                sortCriteria = { 'ratings.average': -1, 'ratings.count': -1 };
                break;
            case 'date':
                sortCriteria = { lastUpdated: -1 };
                break;
            case 'distance':
                // Distance sorting is handled by $near in the query
                sortCriteria = {};
                break;
            default:
                if (query) {
                    sortCriteria = { score: { $meta: 'textScore' } };
                } else {
                    sortCriteria = { 'ratings.average': -1, lastUpdated: -1 };
                }
        }

        // Select fields based on low data mode
        let selectFields = lowDataMode
            ? 'name category location.address location.region contact.phone contact.hours isEssential'
            : '';

        const [services, total] = await Promise.all([
            ServiceListing.find(mongoQuery)
                .select(selectFields)
                .sort(sortCriteria)
                .skip(offset)
                .limit(limit)
                .lean(),
            ServiceListing.countDocuments(mongoQuery)
        ]);

        // Calculate distance if location provided
        if (location && services.length > 0) {
            services.forEach((service: any) => {
                if (service.location && service.location.coordinates) {
                    service.distance = this.calculateDistance(
                        location.lat,
                        location.lon,
                        service.location.coordinates[1],
                        service.location.coordinates[0]
                    );
                }
            });
        }

        return { services, total };
    }

    /**
     * Integrate with Australian Government APIs
     */
    async syncGovernmentServices(): Promise<{ synced: number; errors: number }> {
        let synced = 0;
        let errors = 0;

        try {
            // Sync from data.gov.au
            const dataGovResults = await this.syncDataGovAu();
            synced += dataGovResults.synced;
            errors += dataGovResults.errors;

            // Sync from Health Direct
            const healthDirectResults = await this.syncHealthDirect();
            synced += healthDirectResults.synced;
            errors += healthDirectResults.errors;

            console.log(`Government services sync completed: ${synced} synced, ${errors} errors`);

            return { synced, errors };
        } catch (error) {
            console.error('Error syncing government services:', error);
            throw error;
        }
    }

    /**
     * Sync services from data.gov.au
     */
    private async syncDataGovAu(): Promise<{ synced: number; errors: number }> {
        let synced = 0;
        let errors = 0;

        try {
            // Note: This is a placeholder for actual data.gov.au API integration
            // The actual API endpoints and data structure would need to be configured
            // based on available datasets

            const apiUrl = process.env.DATA_GOV_AU_API_URL;
            if (!apiUrl) {
                console.log('DATA_GOV_AU_API_URL not configured, skipping sync');
                return { synced, errors };
            }

            const response = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data.services)) {
                for (const serviceData of response.data.services) {
                    try {
                        await this.upsertGovernmentService(serviceData, 'data_gov_au');
                        synced++;
                    } catch (error) {
                        console.error('Error upserting data.gov.au service:', error);
                        errors++;
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing from data.gov.au:', error);
            errors++;
        }

        return { synced, errors };
    }

    /**
     * Sync services from Health Direct
     */
    private async syncHealthDirect(): Promise<{ synced: number; errors: number }> {
        let synced = 0;
        let errors = 0;

        try {
            // Note: This is a placeholder for actual Health Direct API integration
            // The actual API would require proper authentication and endpoint configuration

            const apiUrl = process.env.HEALTH_DIRECT_API_URL;
            const apiKey = process.env.HEALTH_DIRECT_API_KEY;

            if (!apiUrl || !apiKey) {
                console.log('Health Direct API not configured, skipping sync');
                return { synced, errors };
            }

            const response = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data.services)) {
                for (const serviceData of response.data.services) {
                    try {
                        await this.upsertGovernmentService(serviceData, 'health_direct');
                        synced++;
                    } catch (error) {
                        console.error('Error upserting Health Direct service:', error);
                        errors++;
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing from Health Direct:', error);
            errors++;
        }

        return { synced, errors };
    }

    /**
     * Upsert a government service (create or update)
     */
    private async upsertGovernmentService(serviceData: any, source: string): Promise<void> {
        try {
            const existingService = await ServiceListing.findOne({
                source,
                sourceId: serviceData.id
            });

            const mappedData = this.mapGovernmentServiceData(serviceData, source);

            if (existingService) {
                await ServiceListing.findByIdAndUpdate(existingService._id, {
                    ...mappedData,
                    lastUpdated: new Date()
                });
            } else {
                await ServiceListing.create(mappedData);
            }
        } catch (error) {
            console.error('Error upserting government service:', error);
            throw error;
        }
    }

    /**
     * Map government API data to our service model
     */
    private mapGovernmentServiceData(data: any, source: string): Partial<IServiceListing> {
        // This mapping would need to be customized based on actual API responses
        return {
            name: data.name || data.serviceName,
            category: this.mapCategory(data.category || data.type),
            description: data.description || '',
            location: {
                type: 'Point',
                coordinates: [
                    data.longitude || data.location?.longitude || 0,
                    data.latitude || data.location?.latitude || 0
                ],
                address: data.address || data.location?.address || '',
                city: data.city || data.location?.city,
                state: data.state || data.location?.state,
                postcode: data.postcode || data.location?.postcode,
                region: data.region || 'Unknown'
            },
            contact: {
                phone: data.phone || data.contact?.phone || '',
                email: data.email || data.contact?.email,
                website: data.website || data.contact?.website,
                hours: data.hours || data.openingHours || 'Contact for hours'
            },
            services: Array.isArray(data.services) ? data.services : [],
            isVerified: true,
            source: source as any,
            sourceId: data.id || data.serviceId,
            offlineAvailable: true,
            isEssential: this.isEssentialService(data.category || data.type),
            tags: Array.isArray(data.tags) ? data.tags : []
        };
    }

    /**
     * Map external category to our category enum
     */
    private mapCategory(externalCategory: string): IServiceListing['category'] {
        const categoryMap: { [key: string]: IServiceListing['category'] } = {
            'health': 'health',
            'healthcare': 'health',
            'medical': 'health',
            'transport': 'transport',
            'transportation': 'transport',
            'government': 'government',
            'emergency': 'emergency',
            'education': 'education',
            'financial': 'financial',
            'finance': 'financial',
            'legal': 'legal',
            'law': 'legal',
            'social': 'social',
            'community': 'social'
        };

        const normalized = externalCategory?.toLowerCase() || '';
        return categoryMap[normalized] || 'other';
    }

    /**
     * Determine if a service is essential
     */
    private isEssentialService(category: string): boolean {
        const essentialCategories = ['health', 'emergency', 'government'];
        return essentialCategories.includes(category?.toLowerCase());
    }

    /**
     * Add a review to a service
     */
    async addServiceReview(
        serviceId: string,
        userId: string,
        rating: number,
        comment: string
    ): Promise<IServiceListing | null> {
        try {
            const service = await ServiceListing.findById(serviceId);
            if (!service) return null;

            // Check if user already reviewed this service
            const existingReviewIndex = service.reviews.findIndex(
                review => review.user.toString() === userId
            );

            if (existingReviewIndex >= 0) {
                // Update existing review
                service.reviews[existingReviewIndex] = {
                    user: new mongoose.Types.ObjectId(userId),
                    rating,
                    comment,
                    date: new Date(),
                    helpful: service.reviews[existingReviewIndex].helpful
                };
            } else {
                // Add new review
                service.reviews.push({
                    user: new mongoose.Types.ObjectId(userId),
                    rating,
                    comment,
                    date: new Date(),
                    helpful: 0
                });
            }

            // Recalculate average rating
            const totalRating = service.reviews.reduce((sum, review) => sum + review.rating, 0);
            service.ratings.average = totalRating / service.reviews.length;
            service.ratings.count = service.reviews.length;

            await service.save();
            this.clearCache();

            return service;
        } catch (error) {
            console.error('Error adding service review:', error);
            throw error;
        }
    }

    /**
     * Get essential services for offline availability
     */
    async getEssentialServices(location?: { lat: number; lon: number }): Promise<IServiceListing[]> {
        try {
            const query: any = {
                isActive: true,
                isEssential: true,
                offlineAvailable: true
            };

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

            return await ServiceListing.find(query)
                .select('name category location contact services')
                .limit(50)
                .lean();
        } catch (error) {
            console.error('Error getting essential services:', error);
            throw error;
        }
    }

    /**
     * Mark service as contacted
     */
    async recordServiceContact(serviceId: string): Promise<void> {
        try {
            await ServiceListing.findByIdAndUpdate(serviceId, {
                $inc: { 'metadata.contactCount': 1 },
                'metadata.lastContactedAt': new Date()
            });
        } catch (error) {
            console.error('Error recording service contact:', error);
        }
    }

    /**
     * Get service categories with counts
     */
    async getServiceCategories(): Promise<any[]> {
        try {
            const categories = await ServiceListing.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        subcategories: { $addToSet: '$subcategory' },
                        essentialCount: {
                            $sum: { $cond: ['$isEssential', 1, 0] }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return categories.map(cat => ({
                category: cat._id,
                count: cat.count,
                essentialCount: cat.essentialCount,
                subcategories: cat.subcategories.filter(Boolean)
            }));
        } catch (error) {
            console.error('Error getting service categories:', error);
            throw error;
        }
    }

    /**
     * Generate search suggestions
     */
    private async generateSuggestions(query: string): Promise<string[]> {
        try {
            const suggestions: string[] = [];

            // Find services with similar names
            const services = await ServiceListing.find({
                $text: { $search: query },
                isActive: true
            })
                .select('name category services')
                .limit(5)
                .lean();

            services.forEach(service => {
                if (!suggestions.includes(service.name)) {
                    suggestions.push(service.name);
                }
                service.services.forEach(s => {
                    if (!suggestions.includes(s) && suggestions.length < 10) {
                        suggestions.push(s);
                    }
                });
            });

            return suggestions.slice(0, 5);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return [];
        }
    }

    /**
     * Cache management
     */
    private getCacheKey(filters: SearchFilters, options: SearchOptions): string {
        return JSON.stringify({ filters, options });
    }

    private getFromCache(key: string): ServiceCache | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp.getTime();
        if (age > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached;
    }

    private setCache(key: string, services: any[]): void {
        this.cache.set(key, {
            services,
            timestamp: new Date(),
            filters: key
        });

        // Limit cache size
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
    }

    private clearCache(): void {
        this.cache.clear();
    }

    /**
     * Utility functions
     */
    private parseRadius(radius: string): number {
        const match = radius.match(/^(\d+)(km|m)$/);
        if (!match) return 50000; // Default 50km in meters

        const value = parseInt(match[1]);
        const unit = match[2];

        return unit === 'km' ? value * 1000 : value;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

export const serviceDirectoryService = new ServiceDirectoryService();
