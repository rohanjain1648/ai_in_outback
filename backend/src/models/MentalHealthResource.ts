import mongoose, { Document, Schema } from 'mongoose';

export interface IMentalHealthResource extends Document {
  title: string;
  description: string;
  category: 'telehealth' | 'crisis' | 'support_group' | 'self_help' | 'professional' | 'emergency';
  resourceType: 'phone' | 'website' | 'app' | 'in_person' | 'online_chat' | 'video_call';
  contactInfo: {
    phone?: string;
    website?: string;
    email?: string;
    address?: string;
  };
  availability: {
    hours: string;
    days: string[];
    timezone: string;
    is24x7: boolean;
  };
  targetAudience: string[]; // e.g., ['youth', 'adults', 'seniors', 'farmers', 'indigenous']
  services: string[]; // e.g., ['counseling', 'crisis_intervention', 'peer_support']
  cost: 'free' | 'bulk_billed' | 'private' | 'sliding_scale';
  location: {
    state: string;
    region?: string;
    isNational: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  languages: string[];
  specializations: string[]; // e.g., ['anxiety', 'depression', 'trauma', 'addiction']
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  lastVerified: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MentalHealthResourceSchema = new Schema<IMentalHealthResource>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['telehealth', 'crisis', 'support_group', 'self_help', 'professional', 'emergency']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['phone', 'website', 'app', 'in_person', 'online_chat', 'video_call']
  },
  contactInfo: {
    phone: String,
    website: String,
    email: String,
    address: String
  },
  availability: {
    hours: {
      type: String,
      required: true
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timezone: {
      type: String,
      default: 'Australia/Sydney'
    },
    is24x7: {
      type: Boolean,
      default: false
    }
  },
  targetAudience: [{
    type: String,
    trim: true
  }],
  services: [{
    type: String,
    trim: true
  }],
  cost: {
    type: String,
    required: true,
    enum: ['free', 'bulk_billed', 'private', 'sliding_scale']
  },
  location: {
    state: {
      type: String,
      required: true
    },
    region: String,
    isNational: {
      type: Boolean,
      default: false
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  specializations: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastVerified: Date
}, {
  timestamps: true
});

// Indexes for efficient searching
MentalHealthResourceSchema.index({ category: 1, 'location.state': 1 });
MentalHealthResourceSchema.index({ specializations: 1 });
MentalHealthResourceSchema.index({ cost: 1, isVerified: 1 });
MentalHealthResourceSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model<IMentalHealthResource>('MentalHealthResource', MentalHealthResourceSchema);