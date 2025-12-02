import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  services: string[];
  capabilities: string[];
  location: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  businessHours: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    verificationDocuments?: string[];
    abn?: string;
    acn?: string;
  };
  ratings: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: mongoose.Types.ObjectId[];
  economicData: {
    employeeCount?: number;
    annualRevenue?: string; // Range like "50k-100k"
    establishedYear?: number;
    businessType: 'sole-trader' | 'partnership' | 'company' | 'trust';
  };
  tags: string[];
  isActive: boolean;
  isPremium: boolean;
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessReview extends Document {
  business: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  services: [{ type: String, trim: true }],
  capabilities: [{ type: String, trim: true }],
  location: {
    address: { type: String, required: true },
    suburb: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  contact: {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      linkedin: { type: String }
    }
  },
  businessHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  verification: {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedAt: { type: Date },
    verificationDocuments: [{ type: String }],
    abn: { type: String },
    acn: { type: String }
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'BusinessReview' }],
  economicData: {
    employeeCount: { type: Number },
    annualRevenue: { type: String },
    establishedYear: { type: Number },
    businessType: { 
      type: String, 
      enum: ['sole-trader', 'partnership', 'company', 'trust'],
      required: true
    }
  },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  featuredUntil: { type: Date }
}, {
  timestamps: true
});

const businessReviewSchema = new Schema<IBusinessReview>({
  business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  comment: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for better query performance
businessSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ category: 1, subcategory: 1 });
businessSchema.index({ services: 1 });
businessSchema.index({ capabilities: 1 });
businessSchema.index({ tags: 1 });
businessSchema.index({ 'verification.status': 1 });
businessSchema.index({ isActive: 1 });
businessSchema.index({ 'ratings.average': -1 });

businessReviewSchema.index({ business: 1, createdAt: -1 });
businessReviewSchema.index({ reviewer: 1 });

export const Business = mongoose.model<IBusiness>('Business', businessSchema);
export const BusinessReview = mongoose.model<IBusinessReview>('BusinessReview', businessReviewSchema);