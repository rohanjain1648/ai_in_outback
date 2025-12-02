import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  category: 'equipment' | 'services' | 'knowledge' | 'materials' | 'transportation' | 'accommodation' | 'emergency' | 'other';
  subcategory?: string;
  availability: {
    status: 'available' | 'unavailable' | 'limited';
    schedule?: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    };
    quantity?: number;
    maxQuantity?: number;
  };
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    postcode: string;
    state: string;
    region: string;
    accessibilityNotes?: string;
  };
  contact: {
    name: string;
    phone?: string;
    email?: string;
    preferredMethod: 'phone' | 'email' | 'in-person';
  };
  owner: mongoose.Types.ObjectId;
  tags: string[];
  images?: string[];
  pricing?: {
    type: 'free' | 'paid' | 'donation' | 'barter';
    amount?: number;
    currency?: string;
    barterPreferences?: string[];
  };
  requirements?: {
    experience?: string;
    equipment?: string[];
    certification?: string[];
    other?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  searchKeywords: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  viewCount: number;
  bookingCount: number;
}

const ResourceSchema = new Schema<IResource>({
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
    enum: ['equipment', 'services', 'knowledge', 'materials', 'transportation', 'accommodation', 'emergency', 'other']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  availability: {
    status: {
      type: String,
      required: true,
      enum: ['available', 'unavailable', 'limited'],
      default: 'available'
    },
    schedule: {
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      hours: {
        start: String,
        end: String
      }
    },
    quantity: {
      type: Number,
      min: 0
    },
    maxQuantity: {
      type: Number,
      min: 0
    }
  },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    address: {
      type: String,
      required: true
    },
    postcode: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    accessibilityNotes: String
  },
  contact: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    email: String,
    preferredMethod: {
      type: String,
      required: true,
      enum: ['phone', 'email', 'in-person']
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  images: [String],
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'donation', 'barter'],
      default: 'free'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'AUD'
    },
    barterPreferences: [String]
  },
  requirements: {
    experience: String,
    equipment: [String],
    certification: [String],
    other: String
  },
  rating: {
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
    }
  }],
  searchKeywords: [{
    type: String,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient searching
ResourceSchema.index({ category: 1, 'availability.status': 1 });
ResourceSchema.index({ 'location.coordinates': '2dsphere' });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ searchKeywords: 1 });
ResourceSchema.index({ owner: 1 });
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ 'rating.average': -1 });

// Text search index
ResourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  searchKeywords: 'text'
});

// Pre-save middleware to generate search keywords
ResourceSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || this.isModified('tags')) {
    const keywords = new Set<string>();
    
    // Add title words
    this.title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Add description words
    this.description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
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

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);