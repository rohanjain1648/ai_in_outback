import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  region?: string; // Rural region classification
}

export interface IPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    emergency: boolean;
    community: boolean;
    agricultural: boolean;
    business: boolean;
    cultural: boolean;
    skills: boolean;
    wellbeing: boolean;
  };
  privacy: {
    showLocation: boolean;
    showProfile: boolean;
    allowMatching: boolean;
    shareSkills: boolean;
  };
  interests: string[];
  skills: string[];
  languages: string[];
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

export interface IWellbeingProfile {
  willingToSupport: boolean;
  supportAreas: string[];
  supportExperience: string[];
  availableHours: {
    days: string[];
    timeSlots: string[];
    timezone: string;
  };
  communicationPreferences: string[];
  crisisStatus?: {
    isActive: boolean;
    triggeredAt: Date;
    checkInId: string;
    resourcesProvided: string[];
  };
  mentalHealthHistory?: {
    hasHistory: boolean;
    conditions: string[];
    currentTreatment: boolean;
    medications: boolean;
  };
  supportPreferences: {
    anonymousOnly: boolean;
    genderPreference?: 'male' | 'female' | 'any';
    ageRangePreference?: {
      min: number;
      max: number;
    };
    locationPreference: 'local' | 'state' | 'national';
  };
}

export interface IProfile {
  firstName: string;
  lastName: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  occupation?: string;
  farmType?: string;
  businessType?: string;
  yearsInArea?: number;
  familySize?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  profile: IProfile;
  location?: ILocation;
  preferences: IPreferences;
  wellbeingProfile?: IWellbeingProfile;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(coords: number[]) {
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 && // longitude
               coords[1] >= -90 && coords[1] <= 90;     // latitude
      },
      message: 'Invalid coordinates format',
    },
  },
  address: String,
  city: String,
  state: String,
  postcode: String,
  region: String,
});

const PreferencesSchema = new Schema<IPreferences>({
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    emergency: { type: Boolean, default: true },
    community: { type: Boolean, default: true },
    agricultural: { type: Boolean, default: true },
    business: { type: Boolean, default: true },
    cultural: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    wellbeing: { type: Boolean, default: true },
  },
  privacy: {
    showLocation: { type: Boolean, default: true },
    showProfile: { type: Boolean, default: true },
    allowMatching: { type: Boolean, default: true },
    shareSkills: { type: Boolean, default: true },
  },
  interests: [String],
  skills: [String],
  languages: [String],
  accessibility: {
    screenReader: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    largeText: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
  },
});

const WellbeingProfileSchema = new Schema<IWellbeingProfile>({
  willingToSupport: { type: Boolean, default: false },
  supportAreas: [String],
  supportExperience: [String],
  availableHours: {
    days: [String],
    timeSlots: [String],
    timezone: { type: String, default: 'Australia/Sydney' }
  },
  communicationPreferences: [String],
  crisisStatus: {
    isActive: { type: Boolean, default: false },
    triggeredAt: Date,
    checkInId: String,
    resourcesProvided: [String]
  },
  mentalHealthHistory: {
    hasHistory: { type: Boolean, default: false },
    conditions: [String],
    currentTreatment: { type: Boolean, default: false },
    medications: { type: Boolean, default: false }
  },
  supportPreferences: {
    anonymousOnly: { type: Boolean, default: true },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any'
    },
    ageRangePreference: {
      min: { type: Number, min: 18, max: 100 },
      max: { type: Number, min: 18, max: 100 }
    },
    locationPreference: {
      type: String,
      enum: ['local', 'state', 'national'],
      default: 'state'
    }
  }
});

const ProfileSchema = new Schema<IProfile>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  displayName: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  avatar: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  occupation: String,
  farmType: String,
  businessType: String,
  yearsInArea: { type: Number, min: 0 },
  familySize: { type: Number, min: 0 },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
});

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  profile: {
    type: ProfileSchema,
    required: true,
  },
  location: LocationSchema,
  preferences: {
    type: PreferencesSchema,
    default: () => ({}),
  },
  wellbeingProfile: WellbeingProfileSchema,
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.emailVerificationToken = token;
  return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

export const User = mongoose.model<IUser>('User', UserSchema);