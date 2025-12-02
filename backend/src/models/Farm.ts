import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop {
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  area: number; // in hectares
  status: 'planted' | 'growing' | 'flowering' | 'harvesting' | 'harvested';
  notes?: string;
}

export interface ILivestock {
  type: string; // cattle, sheep, goats, pigs, chickens, etc.
  breed: string;
  count: number;
  age?: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'quarantined';
  notes?: string;
}

export interface IEquipment {
  name: string;
  type: string; // tractor, harvester, irrigation, etc.
  model?: string;
  purchaseDate?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  maintenanceSchedule?: Date;
  notes?: string;
}

export interface IFarm extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    postcode: string;
    state: string;
  };
  totalArea: number; // in hectares
  farmType: string; // crop, livestock, mixed, dairy, etc.
  crops: ICrop[];
  livestock: ILivestock[];
  equipment: IEquipment[];
  soilType?: string;
  irrigationType?: string;
  organicCertified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>({
  name: { type: String, required: true },
  variety: { type: String, required: true },
  plantingDate: { type: Date, required: true },
  expectedHarvestDate: { type: Date, required: true },
  area: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['planted', 'growing', 'flowering', 'harvesting', 'harvested'],
    default: 'planted'
  },
  notes: { type: String }
});

const LivestockSchema = new Schema<ILivestock>({
  type: { type: String, required: true },
  breed: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  age: { type: String },
  healthStatus: {
    type: String,
    enum: ['healthy', 'sick', 'recovering', 'quarantined'],
    default: 'healthy'
  },
  notes: { type: String }
});

const EquipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  model: { type: String },
  purchaseDate: { type: Date },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs_repair'],
    default: 'good'
  },
  maintenanceSchedule: { type: Date },
  notes: { type: String }
});

const FarmSchema = new Schema<IFarm>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    postcode: { type: String, required: true },
    state: { type: String, required: true }
  },
  totalArea: { type: Number, required: true, min: 0 },
  farmType: { type: String, required: true },
  crops: [CropSchema],
  livestock: [LivestockSchema],
  equipment: [EquipmentSchema],
  soilType: { type: String },
  irrigationType: { type: String },
  organicCertified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for geospatial queries
FarmSchema.index({ 'location.coordinates': '2dsphere' });
FarmSchema.index({ userId: 1 });

export const Farm = mongoose.model<IFarm>('Farm', FarmSchema);