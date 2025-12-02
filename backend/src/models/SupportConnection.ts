import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportConnection extends Document {
  supporterId: mongoose.Types.ObjectId;
  supporteeId: mongoose.Types.ObjectId;
  connectionType: 'peer_support' | 'mentor' | 'buddy' | 'crisis_support';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'terminated';
  matchingScore: number;
  matchingFactors: {
    locationProximity: number;
    experienceSimilarity: number;
    availabilityMatch: number;
    personalityMatch: number;
    supportNeedsAlignment: number;
  };
  supportAreas: string[]; // e.g., ['anxiety', 'depression', 'isolation', 'grief']
  communicationPreferences: {
    methods: string[]; // e.g., ['chat', 'video', 'phone', 'in_person']
    frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed';
    timezone: string;
  };
  isAnonymous: boolean;
  anonymousIds: {
    supporterAlias?: string;
    supporteeAlias?: string;
  };
  lastInteraction: Date;
  totalInteractions: number;
  averageRating: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportConnectionSchema = new Schema<ISupportConnection>({
  supporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supporteeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  connectionType: {
    type: String,
    required: true,
    enum: ['peer_support', 'mentor', 'buddy', 'crisis_support']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'paused', 'completed', 'terminated'],
    default: 'pending'
  },
  matchingScore: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  matchingFactors: {
    locationProximity: {
      type: Number,
      min: 0,
      max: 1
    },
    experienceSimilarity: {
      type: Number,
      min: 0,
      max: 1
    },
    availabilityMatch: {
      type: Number,
      min: 0,
      max: 1
    },
    personalityMatch: {
      type: Number,
      min: 0,
      max: 1
    },
    supportNeedsAlignment: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  supportAreas: [{
    type: String,
    trim: true
  }],
  communicationPreferences: {
    methods: [{
      type: String,
      enum: ['chat', 'video', 'phone', 'in_person']
    }],
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi_weekly', 'monthly', 'as_needed'],
      default: 'weekly'
    },
    timezone: {
      type: String,
      default: 'Australia/Sydney'
    }
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  anonymousIds: {
    supporterAlias: String,
    supporteeAlias: String
  },
  lastInteraction: Date,
  totalInteractions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
SupportConnectionSchema.index({ supporterId: 1, status: 1 });
SupportConnectionSchema.index({ supporteeId: 1, status: 1 });
SupportConnectionSchema.index({ connectionType: 1, status: 1 });

export default mongoose.model<ISupportConnection>('SupportConnection', SupportConnectionSchema);