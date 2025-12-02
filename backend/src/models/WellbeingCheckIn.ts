import mongoose, { Document, Schema } from 'mongoose';

export interface IWellbeingCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  moodScore: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  socialConnection: number; // 1-10 scale
  physicalActivity: number; // 1-10 scale
  notes?: string;
  tags: string[]; // e.g., ['anxious', 'hopeful', 'isolated']
  isAnonymous: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis?: {
    sentiment: number;
    concernFlags: string[];
    supportRecommendations: string[];
    riskFactors: string[];
  };
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellbeingCheckInSchema = new Schema<IWellbeingCheckIn>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleepQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  socialConnection: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  physicalActivity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  aiAnalysis: {
    sentiment: {
      type: Number,
      min: -1,
      max: 1
    },
    concernFlags: [String],
    supportRecommendations: [String],
    riskFactors: [String]
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date
}, {
  timestamps: true
});

// Index for efficient querying
WellbeingCheckInSchema.index({ userId: 1, date: -1 });
WellbeingCheckInSchema.index({ riskLevel: 1, followUpRequired: 1 });

export default mongoose.model<IWellbeingCheckIn>('WellbeingCheckIn', WellbeingCheckInSchema);