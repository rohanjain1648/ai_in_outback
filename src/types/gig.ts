export interface GigJob {
    _id: string;
    title: string;
    description: string;
    category: 'agriculture' | 'construction' | 'services' | 'transport' | 'other';
    requiredSkills: {
        skillId: {
            _id: string;
            name: string;
            category: string;
        };
        minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }[];
    location: {
        type: 'Point';
        coordinates: [number, number];
        description: string;
        radius: number;
    };
    payment: {
        amount: number;
        currency: 'AUD';
        type: 'fixed' | 'hourly' | 'negotiable';
        escrowRequired: boolean;
    };
    duration: {
        estimatedHours: number;
        startDate?: string;
        deadline?: string;
    };
    status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    postedBy: {
        _id: string;
        profile: {
            firstName: string;
            lastName: string;
            displayName?: string;
            avatar?: string;
        };
        location?: {
            coordinates: [number, number];
            address?: string;
        };
    };
    postedAt: string;
    applicants: {
        userId: {
            _id: string;
            profile: {
                firstName: string;
                lastName: string;
                displayName?: string;
                avatar?: string;
            };
            location?: {
                coordinates: [number, number];
                address?: string;
            };
        };
        appliedAt: string;
        message: string;
        matchScore: number;
    }[];
    selectedWorker?: {
        _id: string;
        profile: {
            firstName: string;
            lastName: string;
            displayName?: string;
            avatar?: string;
        };
    };
    acceptedAt?: string;
    completedAt?: string;
    ratings?: {
        posterRating: number;
        posterReview: string;
        workerRating: number;
        workerReview: string;
    };
    aiMatchingData: {
        suggestedWorkers: {
            _id: string;
            profile: {
                firstName: string;
                lastName: string;
                displayName?: string;
                avatar?: string;
            };
        }[];
        matchingFactors: any;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateGigJobData {
    title: string;
    description: string;
    category: 'agriculture' | 'construction' | 'services' | 'transport' | 'other';
    requiredSkills: {
        skillId: string;
        minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }[];
    location: {
        coordinates: [number, number];
        description: string;
        radius: number;
    };
    payment: {
        amount: number;
        type: 'fixed' | 'hourly' | 'negotiable';
        escrowRequired: boolean;
    };
    duration: {
        estimatedHours: number;
        startDate?: string;
        deadline?: string;
    };
}

export interface GigSearchFilters {
    category?: string;
    minPayment?: number;
    maxPayment?: number;
    paymentType?: string;
    maxDistance?: number;
    userLocation?: [number, number];
    skillIds?: string[];
    status?: string;
}

export interface JobApplication {
    jobId: string;
    message: string;
}

export interface JobRating {
    rating: number;
    review: string;
}
