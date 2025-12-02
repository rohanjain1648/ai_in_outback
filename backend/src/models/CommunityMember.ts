import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  canTeach: boolean;
  wantsToLearn: boolean;
  category: 'agricultural' | 'technical' | 'creative' | 'business' | 'health' | 'education' | 'trades' | 'other';
}

export interface IInterest {
  name: string;
  category: 'agriculture' | 'technology' | 'arts' | 'sports' | 'community' | 'environment' | 'business' | 'health' | 'education' | 'other';
  intensity: 'casual' | 'moderate' | 'passionate';
}

export interface IAvailability {
  timeSlots: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  }[];
  timezone: string;
  preferredMeetingTypes: ('in-person' | 'video-call' | 'phone-call' | 'text-chat')[];
  maxTravelDistance?: number; // in kilometers for in-person meetings
  responseTime: 'immediate' | 'within-hour' | 'within-day' | 'within-week';
}

export interface IConnectionHistory {
  userId: mongoose.Types.ObjectId;
  connectionDate: Date;
  interactionCount: number;
  lastInteraction: Date;
  connectionType: 'matched' | 'requested' | 'mutual';
  status: 'active' | 'inactive' | 'blocked';
  rating?: number; // 1-5 stars
  feedback?: string;
}

export interface IMatchingPreferences {
  ageRange?: {
    min: number;
    max: number;
  };
  genderPreference?: ('male' | 'female' | 'other' | 'any')[];
  maxDistance: number; // in kilometers
  preferredSkillLevels: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
  priorityCategories: string[]; // Categories of interests/skills to prioritize
  excludeCategories?: string[]; // Categories to avoid
  requireMutualInterests: boolean;
  minimumSharedInterests: number;
}

export interface ICommunityMember extends Document {
  userId: mongoose.Types.ObjectId;
  skills: ISkill[];
  interests: IInterest[];
  availability: IAvailability;
  connectionHistory: IConnectionHistory[];
  matchingPreferences: IMatchingPreferences;
  
  // AI Learning Data
  interactionPatterns: {
    preferredConnectionTypes: string[];
    successfulMatchCategories: string[];
    communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
    responsePatterns: {
      averageResponseTime: number; // in minutes
      preferredContactTimes: string[]; // HH:MM format
      communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
    };
  };
  
  // Matching Algorithm Data
  matchingScore?: number;
  lastMatchingUpdate: Date;
  isAvailableForMatching: boolean;
  
  // Metadata
  joinedCommunityDate: Date;
  lastActiveDate: Date;
  profileCompleteness: number; // percentage 0-100
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    skills: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, trim: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  yearsExperience: { type: Number, min: 0 },
  canTeach: { type: Boolean, default: false },
  wantsToLearn: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ['agricultural', 'technical', 'creative', 'business', 'health', 'education', 'trades', 'other'],
    required: true,
  },
});

const InterestSchema = new Schema<IInterest>({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['agriculture', 'technology', 'arts', 'sports', 'community', 'environment', 'business', 'health', 'education', 'other'],
    required: true,
  },
  intensity: {
    type: String,
    enum: ['casual', 'moderate', 'passionate'],
    default: 'moderate',
  },
});

const AvailabilitySchema = new Schema<IAvailability>({
  timeSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  }],
  timezone: { type: String, required: true },
  preferredMeetingTypes: [{
    type: String,
    enum: ['in-person', 'video-call', 'phone-call', 'text-chat'],
  }],
  maxTravelDistance: { type: Number, min: 0 },
  responseTime: {
    type: String,
    enum: ['immediate', 'within-hour', 'within-day', 'within-week'],
    default: 'within-day',
  },
});

const ConnectionHistorySchema = new Schema<IConnectionHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  connectionDate: { type: Date, default: Date.now },
  interactionCount: { type: Number, default: 0 },
  lastInteraction: { type: Date, default: Date.now },
  connectionType: {
    type: String,
    enum: ['matched', 'requested', 'mutual'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, maxlength: 500 },
});

const MatchingPreferencesSchema = new Schema<IMatchingPreferences>({
  ageRange: {
    min: { type: Number, min: 18, max: 100 },
    max: { type: Number, min: 18, max: 100 },
  },
  genderPreference: [{
    type: String,
    enum: ['male', 'female', 'other', 'any'],
  }],
  maxDistance: { type: Number, required: true, min: 1, default: 50 },
  preferredSkillLevels: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  }],
  priorityCategories: [String],
  excludeCategories: [String],
  requireMutualInterests: { type: Boolean, default: false },
  minimumSharedInterests: { type: Number, min: 0, default: 1 },
});

const CommunityMemberSchema = new Schema<ICommunityMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [SkillSchema],
  interests: [InterestSchema],
  availability: { type: AvailabilitySchema, required: true },
  connectionHistory: [ConnectionHistorySchema],
  matchingPreferences: { type: MatchingPreferencesSchema, required: true },
  
  interactionPatterns: {
    preferredConnectionTypes: [String],
    successfulMatchCategories: [String],
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'friendly', 'professional'],
      default: 'friendly',
    },
    responsePatterns: {
      averageResponseTime: { type: Number, default: 60 }, // minutes
      preferredContactTimes: [String],
      communicationFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'as-needed'],
        default: 'weekly',
      },
    },
  },
  
  matchingScore: { type: Number, min: 0, max: 100 },
  lastMatchingUpdate: { type: Date, default: Date.now },
  isAvailableForMatching: { type: Boolean, default: true },
  
  joinedCommunityDate: { type: Date, default: Date.now },
  lastActiveDate: { type: Date, default: Date.now },
  profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Indexes for performance
CommunityMemberSchema.index({ userId: 1 });
CommunityMemberSchema.index({ isAvailableForMatching: 1 });
CommunityMemberSchema.index({ 'skills.category': 1 });
CommunityMemberSchema.index({ 'interests.category': 1 });
CommunityMemberSchema.index({ lastActiveDate: -1 });
CommunityMemberSchema.index({ matchingScore: -1 });
CommunityMemberSchema.index({ profileCompleteness: -1 });

// Calculate profile completeness before saving
CommunityMemberSchema.pre('save', function(next) {
  let completeness = 0;
  
  // Basic profile (20%)
  if (this.skills.length > 0) completeness += 20;
  if (this.interests.length > 0) completeness += 20;
  if (this.availability.timeSlots.length > 0) completeness += 20;
  
  // Preferences (20%)
  if (this.matchingPreferences.maxDistance > 0) completeness += 10;
  if (this.matchingPreferences.preferredSkillLevels.length > 0) completeness += 10;
  
  // Verification (20%)
  const verifications = Object.values(this.verificationStatus).filter(Boolean).length;
  completeness += (verifications / 4) * 20;
  
  this.profileCompleteness = Math.round(completeness);
  next();
});

export const CommunityMember = mongoose.model<ICommunityMember>('CommunityMember', CommunityMemberSchema);