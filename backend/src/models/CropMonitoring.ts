import mongoose, { Document, Schema } from 'mongoose';

export interface ICropAnalysis {
  healthScore: number; // 0-100
  diseaseDetected?: string[];
  pestDetected?: string[];
  nutritionDeficiency?: string[];
  growthStage: string;
  recommendations: string[];
  confidence: number; // 0-1
}

export interface ICropMonitoring extends Document {
  farmId: mongoose.Types.ObjectId;
  cropName: string;
  photoUrl: string;
  photoMetadata: {
    captureDate: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    weather?: {
      temperature: number;
      humidity: number;
      rainfall: number;
    };
  };
  analysis: ICropAnalysis;
  aiModel: string; // which AI model was used for analysis
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CropAnalysisSchema = new Schema<ICropAnalysis>({
  healthScore: { type: Number, required: true, min: 0, max: 100 },
  diseaseDetected: [{ type: String }],
  pestDetected: [{ type: String }],
  nutritionDeficiency: [{ type: String }],
  growthStage: { type: String, required: true },
  recommendations: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 }
});

const CropMonitoringSchema = new Schema<ICropMonitoring>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  cropName: { type: String, required: true },
  photoUrl: { type: String, required: true },
  photoMetadata: {
    captureDate: { type: Date, required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    weather: {
      temperature: { type: Number },
      humidity: { type: Number },
      rainfall: { type: Number }
    }
  },
  analysis: CropAnalysisSchema,
  aiModel: { type: String, required: true },
  processed: { type: Boolean, default: false }
}, {
  timestamps: true
});

CropMonitoringSchema.index({ farmId: 1, createdAt: -1 });
CropMonitoringSchema.index({ cropName: 1 });

export const CropMonitoring = mongoose.model<ICropMonitoring>('CropMonitoring', CropMonitoringSchema);