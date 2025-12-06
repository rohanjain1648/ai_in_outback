import mongoose, { Document, Schema } from 'mongoose';

export interface IGigJob extends Document {
    title: string;
    description: string;
    category: 'agriculture' | 'construction' | 'services' | 'transport' | 'other';
    requiredSkills: {
        skillId: mongoose.Types.ObjectId;
        minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }[];
    location: {
        type: 'Point';
        coordinates: [number, number];
        description: string;
        radius: number; // km
    };
    payment: {
        amount: number;
        currency: 'AUD';
        type: 'fixed' | 'hourly' | 'negotiable';
        escrowRequired: boolean;
    };
    duration: {
        estimatedHours: number;
        startDate?: Date;
        deadline?: Date;
    };
    status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    postedBy: mongoose.Types.ObjectId;
    postedAt: Date;
    applicants: {
        userId: mongoose.Types.ObjectId;
        appliedAt: Date;
        message: string;
        matchScore: number;
    }[];
    selectedWorker?: mongoose.Types.ObjectId;
    acceptedAt?: Date;
    completedAt?: Date;
    ratings?: {
        posterRating: number;
        posterReview: string;
        workerRating: number;
        workerReview: string;
    };
    aiMatchingData: {
        suggestedWorkers: mongoose.Types.ObjectId[];
        matchingFactors: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

const GigJobSchema = new Schema<IGigJob>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: ['agriculture', 'construction', 'services', 'transport', 'other']
    },
    requiredSkills: [{
        skillId: {
            type: Schema.Types.ObjectId,
            ref: 'Skill',
            required: true
        },
        minimumLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            required: true
        }
    }],
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
                        coords[0] >= -180 && coords[0] <= 180 && // longitude
                        coords[1] >= -90 && coords[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates format'
            }
        },
        description: {
            type: String,
            required: true
        },
        radius: {
            type: Number,
            required: true,
            min: 0,
            max: 500 // Maximum 500km radius
        }
    },
    payment: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'AUD',
            enum: ['AUD']
        },
        type: {
            type: String,
            required: true,
            enum: ['fixed', 'hourly', 'negotiable']
        },
        escrowRequired: {
            type: Boolean,
            default: false
        }
    },
    duration: {
        estimatedHours: {
            type: Number,
            required: true,
            min: 0.5
        },
        startDate: Date,
        deadline: Date
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'cancelled', 'disputed'],
        default: 'open'
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    applicants: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        message: {
            type: String,
            maxlength: 1000
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100
        }
    }],
    selectedWorker: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    acceptedAt: Date,
    completedAt: Date,
    ratings: {
        posterRating: {
            type: Number,
            min: 1,
            max: 5
        },
        posterReview: {
            type: String,
            maxlength: 1000
        },
        workerRating: {
            type: Number,
            min: 1,
            max: 5
        },
        workerReview: {
            type: String,
            maxlength: 1000
        }
    },
    aiMatchingData: {
        suggestedWorkers: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        matchingFactors: {
            type: Schema.Types.Mixed,
            default: {}
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
GigJobSchema.index({ 'location.coordinates': '2dsphere' });
GigJobSchema.index({ status: 1 });
GigJobSchema.index({ postedBy: 1 });
GigJobSchema.index({ category: 1 });
GigJobSchema.index({ postedAt: -1 });
GigJobSchema.index({ 'requiredSkills.skillId': 1 });
GigJobSchema.index({ selectedWorker: 1 });

export const GigJob = mongoose.model<IGigJob>('GigJob', GigJobSchema);
