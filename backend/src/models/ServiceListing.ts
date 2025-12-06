import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceListing extends Document {
    name: string;
    category: 'health' | 'transport' | 'government' | 'emergency' | 'education' | 'financial' | 'legal' | 'social' | 'other';
    subcategory?: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
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
    reviews: {
        user: mongoose.Types.ObjectId;
        rating: number;
        comment: string;
        date: Date;
        helpful: number;
    }[];
    isVerified: boolean;
    source: 'government_api' | 'community' | 'manual' | 'health_direct' | 'data_gov_au';
    sourceId?: string;
    lastUpdated: Date;
    offlineAvailable: boolean;
    isEssential: boolean;
    tags: string[];
    searchKeywords: string[];
    accessibility: {
        wheelchairAccessible?: boolean;
        parkingAvailable?: boolean;
        publicTransportNearby?: boolean;
        interpreterServices?: boolean;
        notes?: string;
    };
    eligibility?: {
        ageRestrictions?: string;
        residencyRequirements?: string;
        incomeRequirements?: string;
        other?: string;
    };
    metadata: {
        viewCount: number;
        contactCount: number;
        lastContactedAt?: Date;
        lastViewedAt?: Date;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceListingSchema = new Schema<IServiceListing>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        enum: ['health', 'transport', 'government', 'emergency', 'education', 'financial', 'legal', 'social', 'other']
    },
    subcategory: {
        type: String,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (coords: number[]) {
                    return coords.length === 2 &&
                        coords[0] >= -180 && coords[0] <= 180 &&
                        coords[1] >= -90 && coords[1] <= 90;
                },
                message: 'Invalid coordinates format'
            }
        },
        address: {
            type: String,
            required: true
        },
        city: String,
        state: String,
        postcode: String,
        region: {
            type: String,
            required: true
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: String,
        website: String,
        hours: {
            type: String,
            required: true
        },
        emergencyContact: String
    },
    services: [{
        type: String,
        trim: true
    }],
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 1000
        },
        date: {
            type: Date,
            default: Date.now
        },
        helpful: {
            type: Number,
            default: 0
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        required: true,
        enum: ['government_api', 'community', 'manual', 'health_direct', 'data_gov_au']
    },
    sourceId: String,
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    offlineAvailable: {
        type: Boolean,
        default: false
    },
    isEssential: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    searchKeywords: [{
        type: String,
        lowercase: true
    }],
    accessibility: {
        wheelchairAccessible: Boolean,
        parkingAvailable: Boolean,
        publicTransportNearby: Boolean,
        interpreterServices: Boolean,
        notes: String
    },
    eligibility: {
        ageRestrictions: String,
        residencyRequirements: String,
        incomeRequirements: String,
        other: String
    },
    metadata: {
        viewCount: {
            type: Number,
            default: 0
        },
        contactCount: {
            type: Number,
            default: 0
        },
        lastContactedAt: Date,
        lastViewedAt: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient searching
ServiceListingSchema.index({ category: 1, isActive: 1 });
ServiceListingSchema.index({ 'location.coordinates': '2dsphere' });
ServiceListingSchema.index({ tags: 1 });
ServiceListingSchema.index({ searchKeywords: 1 });
ServiceListingSchema.index({ source: 1 });
ServiceListingSchema.index({ isVerified: 1 });
ServiceListingSchema.index({ offlineAvailable: 1 });
ServiceListingSchema.index({ isEssential: 1 });
ServiceListingSchema.index({ 'ratings.average': -1 });
ServiceListingSchema.index({ lastUpdated: -1 });

// Text search index
ServiceListingSchema.index({
    name: 'text',
    description: 'text',
    services: 'text',
    tags: 'text',
    searchKeywords: 'text'
});

// Compound indexes for common queries
ServiceListingSchema.index({ category: 1, 'location.coordinates': '2dsphere' });
ServiceListingSchema.index({ isEssential: 1, offlineAvailable: 1 });

// Pre-save middleware to generate search keywords
ServiceListingSchema.pre('save', function (next) {
    if (this.isModified('name') || this.isModified('description') || this.isModified('services') || this.isModified('tags')) {
        const keywords = new Set<string>();

        // Add name words
        this.name.toLowerCase().split(/\s+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });

        // Add description words
        this.description.toLowerCase().split(/\s+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });

        // Add services
        this.services.forEach(service => {
            service.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 2) keywords.add(word);
            });
        });

        // Add tags
        this.tags.forEach(tag => keywords.add(tag.toLowerCase()));

        // Add category and subcategory
        keywords.add(this.category);
        if (this.subcategory) keywords.add(this.subcategory.toLowerCase());

        this.searchKeywords = Array.from(keywords);
    }
    next();
});

export const ServiceListing = mongoose.model<IServiceListing>('ServiceListing', ServiceListingSchema);
