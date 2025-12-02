import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILearningSession extends Document {
  teacherId: Types.ObjectId;
  learnerId: Types.ObjectId;
  skillId: Types.ObjectId;
  title: string;
  description: string;
  format: 'In-person' | 'Online' | 'Hybrid';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: Date;
  duration: number; // in minutes
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  onlineLink?: string;
  maxParticipants: number;
  currentParticipants: Types.ObjectId[];
  materials: string[];
  prerequisites: string[];
  learningObjectives: string[];
  feedback: {
    teacherRating?: number;
    learnerRating?: number;
    teacherComment?: string;
    learnerComment?: string;
    skillsLearned?: string[];
  };
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'Weekly' | 'Biweekly' | 'Monthly';
    endDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const learningSessionSchema = new Schema<ILearningSession>({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  format: {
    type: String,
    required: true,
    enum: ['In-person', 'Online', 'Hybrid']
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  },
  onlineLink: {
    type: String,
    maxlength: 500
  },
  maxParticipants: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  currentParticipants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  materials: [{
    type: String,
    maxlength: 200
  }],
  prerequisites: [{
    type: String,
    maxlength: 200
  }],
  learningObjectives: [{
    type: String,
    maxlength: 200
  }],
  feedback: {
    teacherRating: {
      type: Number,
      min: 1,
      max: 5
    },
    learnerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    teacherComment: {
      type: String,
      maxlength: 500
    },
    learnerComment: {
      type: String,
      maxlength: 500
    },
    skillsLearned: [{
      type: String,
      maxlength: 100
    }]
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['Weekly', 'Biweekly', 'Monthly']
    },
    endDate: Date
  }
}, {
  timestamps: true
});

learningSessionSchema.index({ teacherId: 1, scheduledDate: 1 });
learningSessionSchema.index({ learnerId: 1, scheduledDate: 1 });
learningSessionSchema.index({ skillId: 1, scheduledDate: 1 });
learningSessionSchema.index({ status: 1, scheduledDate: 1 });
learningSessionSchema.index({ location: '2dsphere' });

export const LearningSession = mongoose.model<ILearningSession>('LearningSession', learningSessionSchema);