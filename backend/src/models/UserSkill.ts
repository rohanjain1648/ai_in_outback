import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserSkill extends Document {
  userId: Types.ObjectId;
  skillId: Types.ObjectId;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  canTeach: boolean;
  wantsToLearn: boolean;
  yearsOfExperience: number;
  certifications: string[];
  endorsements: Types.ObjectId[];
  description: string;
  availableForTeaching: boolean;
  teachingPreferences: {
    format: ('In-person' | 'Online' | 'Both')[];
    groupSize: 'Individual' | 'Small Group' | 'Large Group' | 'Any';
    timeCommitment: 'Flexible' | 'Regular' | 'Intensive';
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSkillSchema = new Schema<IUserSkill>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  proficiencyLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  canTeach: {
    type: Boolean,
    default: false
  },
  wantsToLearn: {
    type: Boolean,
    default: false
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  certifications: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  endorsements: [{
    type: Schema.Types.ObjectId,
    ref: 'SkillEndorsement'
  }],
  description: {
    type: String,
    maxlength: 1000
  },
  availableForTeaching: {
    type: Boolean,
    default: false
  },
  teachingPreferences: {
    format: [{
      type: String,
      enum: ['In-person', 'Online', 'Both']
    }],
    groupSize: {
      type: String,
      enum: ['Individual', 'Small Group', 'Large Group', 'Any'],
      default: 'Any'
    },
    timeCommitment: {
      type: String,
      enum: ['Flexible', 'Regular', 'Intensive'],
      default: 'Flexible'
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one skill per user
userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });
userSkillSchema.index({ canTeach: 1, availableForTeaching: 1 });
userSkillSchema.index({ wantsToLearn: 1 });
userSkillSchema.index({ proficiencyLevel: 1 });

export const UserSkill = mongoose.model<IUserSkill>('UserSkill', userSkillSchema);