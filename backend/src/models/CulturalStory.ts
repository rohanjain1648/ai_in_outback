import mongoose, { Document, Schema } from 'mongoose';

export interface IMediaItem {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  caption?: string;
  metadata?: {
    duration?: number; // for video/audio
    dimensions?: { width: number; height: number }; // for images/video
    [key: string]: any;
  };
}

export interface IStoryConnection {
  storyId: mongoose.Types.ObjectId;
  connectionType: 'related' | 'sequel' | 'prequel' | 'reference' | 'location' | 'family';
  description?: string;
  strength: number; // 0-1 connection strength
}

export interface ICulturalStory extends Document {
  title: string;
  content: string;
  summary: string;
  author: mongoose.Types.ObjectId;
  contributors: mongoose.Types.ObjectId[];
  
  // Categorization and tagging
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  aiGeneratedTags: string[];
  culturalSignificance: 'high' | 'medium' | 'low';
  
  // Geographic and temporal context
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    region: string;
    specificPlace?: string;
  };
  timeframe: {
    period?: string; // e.g., "1800s", "Dreamtime", "Modern"
    specificDate?: Date;
    isOngoing?: boolean;
  };
  
  // Multimedia support
  media: IMediaItem[];
  featuredImage?: string;
  
  // Story connections and relationships
  connections: IStoryConnection[];
  relatedPeople: string[]; // Names of people mentioned
  relatedEvents: string[];
  
  // Community engagement
  views: number;
  likes: mongoose.Types.ObjectId[];
  comments: {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    isApproved: boolean;
  }[];
  
  // Curation and moderation
  status: 'draft' | 'pending' | 'approved' | 'featured' | 'archived';
  moderationNotes?: string;
  featuredUntil?: Date;
  
  // Privacy and permissions
  visibility: 'public' | 'community' | 'private';
  canComment: boolean;
  canShare: boolean;
  
  // AI-generated insights
  aiInsights: {
    themes: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    complexity: number; // 0-1
    recommendedAudience: string[];
    generatedAt: Date;
  };
  
  // Metadata
  language: string;
  readingTime: number; // estimated minutes
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const MediaItemSchema = new Schema<IMediaItem>({
  type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  caption: String,
  metadata: Schema.Types.Mixed
});

const StoryConnectionSchema = new Schema<IStoryConnection>({
  storyId: { type: Schema.Types.ObjectId, ref: 'CulturalStory', required: true },
  connectionType: { 
    type: String, 
    enum: ['related', 'sequel', 'prequel', 'reference', 'location', 'family'], 
    required: true 
  },
  description: String,
  strength: { type: Number, min: 0, max: 1, default: 0.5 }
});

const CulturalStorySchema = new Schema<ICulturalStory>({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  summary: { type: String, required: true, maxlength: 500 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contributors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  category: { 
    type: String, 
    enum: ['traditional', 'historical', 'personal', 'community', 'legend', 'contemporary'],
    required: true 
  },
  tags: [{ type: String, maxlength: 50 }],
  aiGeneratedTags: [{ type: String, maxlength: 50 }],
  culturalSignificance: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  },
  
  location: {
    coordinates: { type: [Number], index: '2dsphere' },
    region: { type: String, required: true },
    specificPlace: String
  },
  timeframe: {
    period: String,
    specificDate: Date,
    isOngoing: { type: Boolean, default: false }
  },
  
  media: [MediaItemSchema],
  featuredImage: String,
  
  connections: [StoryConnectionSchema],
  relatedPeople: [String],
  relatedEvents: [String],
  
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: false }
  }],
  
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'featured', 'archived'],
    default: 'draft'
  },
  moderationNotes: String,
  featuredUntil: Date,
  
  visibility: { 
    type: String, 
    enum: ['public', 'community', 'private'],
    default: 'public'
  },
  canComment: { type: Boolean, default: true },
  canShare: { type: Boolean, default: true },
  
  aiInsights: {
    themes: [String],
    sentiment: { 
      type: String, 
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral'
    },
    complexity: { type: Number, min: 0, max: 1, default: 0.5 },
    recommendedAudience: [String],
    generatedAt: Date
  },
  
  language: { type: String, default: 'en' },
  readingTime: { type: Number, default: 1 },
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
CulturalStorySchema.index({ 'location.coordinates': '2dsphere' });
CulturalStorySchema.index({ category: 1, status: 1 });
CulturalStorySchema.index({ tags: 1 });
CulturalStorySchema.index({ author: 1, status: 1 });
CulturalStorySchema.index({ createdAt: -1 });
CulturalStorySchema.index({ views: -1 });
CulturalStorySchema.index({ 'aiInsights.themes': 1 });

// Text search index
CulturalStorySchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text',
  'relatedPeople': 'text',
  'relatedEvents': 'text'
});

export const CulturalStory = mongoose.model<ICulturalStory>('CulturalStory', CulturalStorySchema);