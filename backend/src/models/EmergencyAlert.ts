import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyAlert extends Document {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'fire' | 'flood' | 'medical' | 'security' | 'infrastructure' | 'community';
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    radius: number; // in kilometers
    regions: string[]; // affected regions/postcodes
    description: string;
  };
  source: {
    type: 'official' | 'community' | 'ai_generated';
    organization?: string;
    reportedBy?: mongoose.Types.ObjectId; // User ID for community reports
    verificationStatus: 'unverified' | 'pending' | 'verified' | 'false_alarm';
  };
  status: 'active' | 'resolved' | 'expired' | 'cancelled';
  priority: number; // 1-10, higher is more urgent
  expiresAt?: Date;
  metadata: {
    affectedPopulation?: number;
    estimatedImpact?: string;
    recommendedActions: string[];
    resources?: string[];
    contactInfo?: {
      emergency: string;
      local: string;
      website?: string;
    };
  };
  responses?: {
    userId: mongoose.Types.ObjectId;
    responseType: 'acknowledged' | 'safe' | 'need_help' | 'false_alarm';
    message?: string;
    location?: [number, number];
    timestamp: Date;
  }[];
  aiAnalysis?: {
    riskScore: number;
    confidence: number;
    relatedAlerts: mongoose.Types.ObjectId[];
    predictedImpact: string;
    recommendedResponse: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyAlertSchema = new Schema<IEmergencyAlert>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['weather', 'fire', 'flood', 'medical', 'security', 'infrastructure', 'community'],
    required: true,
    index: true
  },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    radius: {
      type: Number,
      required: true,
      min: 0
    },
    regions: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  source: {
    type: {
      type: String,
      enum: ['official', 'community', 'ai_generated'],
      required: true
    },
    organization: {
      type: String,
      trim: true
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'false_alarm'],
      default: 'unverified',
      index: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  metadata: {
    affectedPopulation: Number,
    estimatedImpact: String,
    recommendedActions: [{
      type: String,
      trim: true
    }],
    resources: [{
      type: String,
      trim: true
    }],
    contactInfo: {
      emergency: String,
      local: String,
      website: String
    }
  },
  responses: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responseType: {
      type: String,
      enum: ['acknowledged', 'safe', 'need_help', 'false_alarm'],
      required: true
    },
    message: String,
    location: [Number],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  aiAnalysis: {
    riskScore: {
      type: Number,
      min: 0,
      max: 1
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    relatedAlerts: [{
      type: Schema.Types.ObjectId,
      ref: 'EmergencyAlert'
    }],
    predictedImpact: String,
    recommendedResponse: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
EmergencyAlertSchema.index({ 'location.coordinates': '2dsphere' });
EmergencyAlertSchema.index({ severity: 1, status: 1, isActive: 1 });
EmergencyAlertSchema.index({ type: 1, status: 1 });
EmergencyAlertSchema.index({ createdAt: -1 });
EmergencyAlertSchema.index({ expiresAt: 1 });
EmergencyAlertSchema.index({ 'source.verificationStatus': 1 });

// Middleware to handle expiration
EmergencyAlertSchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'expired';
    this.isActive = false;
  }
  next();
});

// Static method to find active alerts in area
EmergencyAlertSchema.statics.findActiveInArea = function(
  coordinates: [number, number], 
  radiusKm: number = 50
) {
  return this.find({
    isActive: true,
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000 // Convert to meters
      }
    }
  }).sort({ priority: -1, createdAt: -1 });
};

export default mongoose.model<IEmergencyAlert>('EmergencyAlert', EmergencyAlertSchema);