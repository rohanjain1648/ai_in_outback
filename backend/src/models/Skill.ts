import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description: string;
  isTraditional: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Agriculture',
      'Crafts',
      'Technology',
      'Business',
      'Health',
      'Education',
      'Traditional',
      'Mechanical',
      'Creative',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  isTraditional: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true
});

skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1 });
skillSchema.index({ isTraditional: 1 });

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);