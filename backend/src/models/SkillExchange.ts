import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISkillExchange extends Document {
  participantA: Types.ObjectId;
  participantB: Types.ObjectId;
  skillOfferedByA: Types.ObjectId;
  skillRequestedByA: Types.ObjectId;
  skillOfferedByB: Types.ObjectId;
  skillRequestedByB: Types.ObjectId;
  status: 'Proposed' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  exchangeType: 'Direct' | 'Time Bank' | 'Skill Credits';
  timeCommitment: {
    hoursOfferedByA: number;
    hoursOfferedByB: number;
  };
  schedule: {
    sessionAtoB: Date[];
    sessionBtoA: Date[];
  };
  completionTracking: {
    sessionsCompletedAtoB: number;
    sessionsCompletedBtoA: number;
    totalSessionsAtoB: number;
    totalSessionsBtoA: number;
  };
  feedback: {
    fromA: {
      rating?: number;
      comment?: string;
      skillsLearned?: string[];
    };
    fromB: {
      rating?: number;
      comment?: string;
      skillsLearned?: string[];
    };
  };
  reputation: {
    pointsEarnedByA: number;
    pointsEarnedByB: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const skillExchangeSchema = new Schema<ISkillExchange>({
  participantA: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participantB: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOfferedByA: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  skillRequestedByA: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  skillOfferedByB: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  skillRequestedByB: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Proposed', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Proposed'
  },
  exchangeType: {
    type: String,
    required: true,
    enum: ['Direct', 'Time Bank', 'Skill Credits'],
    default: 'Direct'
  },
  timeCommitment: {
    hoursOfferedByA: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    hoursOfferedByB: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    }
  },
  schedule: {
    sessionAtoB: [{
      type: Date
    }],
    sessionBtoA: [{
      type: Date
    }]
  },
  completionTracking: {
    sessionsCompletedAtoB: {
      type: Number,
      default: 0
    },
    sessionsCompletedBtoA: {
      type: Number,
      default: 0
    },
    totalSessionsAtoB: {
      type: Number,
      default: 0
    },
    totalSessionsBtoA: {
      type: Number,
      default: 0
    }
  },
  feedback: {
    fromA: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      skillsLearned: [{
        type: String,
        maxlength: 100
      }]
    },
    fromB: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      skillsLearned: [{
        type: String,
        maxlength: 100
      }]
    }
  },
  reputation: {
    pointsEarnedByA: {
      type: Number,
      default: 0
    },
    pointsEarnedByB: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

skillExchangeSchema.index({ participantA: 1, status: 1 });
skillExchangeSchema.index({ participantB: 1, status: 1 });
skillExchangeSchema.index({ status: 1, createdAt: -1 });

export const SkillExchange = mongoose.model<ISkillExchange>('SkillExchange', skillExchangeSchema);