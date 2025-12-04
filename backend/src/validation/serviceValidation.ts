import Joi from 'joi';

export const createServiceSchema = Joi.object({
    name: Joi.string().trim().max(200).required(),
    category: Joi.string()
        .valid('health', 'transport', 'government', 'emergency', 'education', 'financial', 'legal', 'social', 'other')
        .required(),
    subcategory: Joi.string().trim().max(100).optional(),
    description: Joi.string().max(2000).required(),
    location: Joi.object({
        coordinates: Joi.array()
            .items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90))
            .length(2)
            .required(),
        address: Joi.string().required(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postcode: Joi.string().optional(),
        region: Joi.string().required()
    }).required(),
    contact: Joi.object({
        phone: Joi.string().required(),
        email: Joi.string().email().optional(),
        website: Joi.string().uri().optional(),
        hours: Joi.string().required(),
        emergencyContact: Joi.string().optional()
    }).required(),
    services: Joi.array().items(Joi.string().trim()).min(1).required(),
    isVerified: Joi.boolean().optional(),
    source: Joi.string()
        .valid('government_api', 'community', 'manual', 'health_direct', 'data_gov_au')
        .required(),
    sourceId: Joi.string().optional(),
    offlineAvailable: Joi.boolean().optional(),
    isEssential: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    accessibility: Joi.object({
        wheelchairAccessible: Joi.boolean().optional(),
        parkingAvailable: Joi.boolean().optional(),
        publicTransportNearby: Joi.boolean().optional(),
        interpreterServices: Joi.boolean().optional(),
        notes: Joi.string().optional()
    }).optional(),
    eligibility: Joi.object({
        ageRestrictions: Joi.string().optional(),
        residencyRequirements: Joi.string().optional(),
        incomeRequirements: Joi.string().optional(),
        other: Joi.string().optional()
    }).optional()
});

export const updateServiceSchema = Joi.object({
    name: Joi.string().trim().max(200).optional(),
    category: Joi.string()
        .valid('health', 'transport', 'government', 'emergency', 'education', 'financial', 'legal', 'social', 'other')
        .optional(),
    subcategory: Joi.string().trim().max(100).optional(),
    description: Joi.string().max(2000).optional(),
    location: Joi.object({
        coordinates: Joi.array()
            .items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90))
            .length(2)
            .optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postcode: Joi.string().optional(),
        region: Joi.string().optional()
    }).optional(),
    contact: Joi.object({
        phone: Joi.string().optional(),
        email: Joi.string().email().optional(),
        website: Joi.string().uri().optional(),
        hours: Joi.string().optional(),
        emergencyContact: Joi.string().optional()
    }).optional(),
    services: Joi.array().items(Joi.string().trim()).optional(),
    isVerified: Joi.boolean().optional(),
    offlineAvailable: Joi.boolean().optional(),
    isEssential: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    accessibility: Joi.object({
        wheelchairAccessible: Joi.boolean().optional(),
        parkingAvailable: Joi.boolean().optional(),
        publicTransportNearby: Joi.boolean().optional(),
        interpreterServices: Joi.boolean().optional(),
        notes: Joi.string().optional()
    }).optional(),
    eligibility: Joi.object({
        ageRestrictions: Joi.string().optional(),
        residencyRequirements: Joi.string().optional(),
        incomeRequirements: Joi.string().optional(),
        other: Joi.string().optional()
    }).optional(),
    isActive: Joi.boolean().optional()
});

export const searchServicesSchema = Joi.object({
    query: Joi.string().trim().optional(),
    category: Joi.string()
        .valid('health', 'transport', 'government', 'emergency', 'education', 'financial', 'legal', 'social', 'other')
        .optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lon: Joi.number().min(-180).max(180).optional(),
    radius: Joi.string().pattern(/^\d+(km|m)$/).optional(),
    verified: Joi.boolean().optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    tags: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).optional(),
    essentialOnly: Joi.boolean().optional(),
    offlineAvailable: Joi.boolean().optional(),
    limit: Joi.number().min(1).max(100).optional(),
    offset: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('relevance', 'distance', 'rating', 'date').optional(),
    lowDataMode: Joi.boolean().optional()
});

export const addReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).required()
});

export const serviceIdSchema = Joi.object({
    serviceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});
