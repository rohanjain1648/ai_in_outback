import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISkillEndorsement extends Document {
  endorserId: Types.ObjectId;
  endorsedUserId: Types.ObjectId;
  skillId: Types.ObjectId;
  rating: number;
  comment: string;
  verificationMethod: 'Direct Experience' | 'Witnessed Work' | 'Certification Review' | 'Peer Recommendation';
  isVerified: boolean;
  verifiedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const skillEndorsementSchema = new Schema<ISkillEndorsement>({
  endorserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endorsedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
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
    required: true,
    maxlength: 500
  },
  verificationMethod: {
    type: String,
    required: true,
    enum: ['Direct Experience', 'Witnessed Work', 'Certification Review', 'Peer Recommendation']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent duplicate endorsements
skillEndorsementSchema.index({ endorserId: 1, endorsedUserId: 1, skillId: 1 }, { unique: true });
skillEndorsementSchema.index({ endorsedUserId: 1, skillId: 1 });
skillEndorsementSchema.index({ isVerified: 1 });

export const SkillEndorsement = mongoose.model<ISkillEndorsement>('SkillEndorsement', skillEndorsementSchema);