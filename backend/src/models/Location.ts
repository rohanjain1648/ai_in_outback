import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  userId: mongoose.Types.ObjectId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street?: string;
    suburb?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  region: {
    type: 'urban' | 'rural' | 'remote';
    name: string;
    state: string;
  };
  isPrivate: boolean;
  anonymized: boolean;
  approximateLocation?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  lastUpdated: Date;
  source: 'gps' | 'manual' | 'ip' | 'postcode';
  accuracy?: number; // in meters
}

const LocationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  address: {
    street: String,
    suburb: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      enum: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']
    },
    postcode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Australia'
    }
  },
  region: {
    type: {
      type: String,
      enum: ['urban', 'rural', 'remote'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      enum: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']
    }
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  anonymized: {
    type: Boolean,
    default: false
  },
  approximateLocation: {
    latitude: Number,
    longitude: Number,
    radius: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['gps', 'manual', 'ip', 'postcode'],
    required: true
  },
  accuracy: Number
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
LocationSchema.index({ coordinates: '2dsphere' });
LocationSchema.index({ 'region.state': 1, 'region.type': 1 });
LocationSchema.index({ userId: 1, lastUpdated: -1 });

export default mongoose.model<ILocation>('Location', LocationSchema);