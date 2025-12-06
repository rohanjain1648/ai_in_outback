// @ts-nocheck
import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'community' | 'emergency' | 'skill_sharing' | 'business';
  participants: {
    userId: mongoose.Types.ObjectId;
    username: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    lastReadAt?: Date;
  }[];
  createdBy: mongoose.Types.ObjectId;
  isPrivate: boolean;
  maxParticipants?: number;
  settings: {
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowVideoCall: boolean;
    moderationEnabled: boolean;
    autoDeleteMessages?: number; // days
  };
  metadata?: {
    relatedResourceId?: mongoose.Types.ObjectId;
    relatedResourceType?: string;
    location?: {
      state: string;
      region?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    tags?: string[];
  };
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
}

const ChatRoomSchema = new Schema<IChatRoom>({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'community', 'emergency', 'skill_sharing', 'business'],
    required: true,
    index: true
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    min: 2,
    max: 1000
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceMessages: {
      type: Boolean,
      default: true
    },
    allowVideoCall: {
      type: Boolean,
      default: true
    },
    moderationEnabled: {
      type: Boolean,
      default: false
    },
    autoDeleteMessages: {
      type: Number,
      min: 1,
      max: 365
    }
  },
  metadata: {
    relatedResourceId: {
      type: Schema.Types.ObjectId
    },
    relatedResourceType: {
      type: String,
      enum: ['skill', 'business', 'emergency', 'cultural_story', 'resource']
    },
    location: {
      state: String,
      region: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    tags: [String]
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  messageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
ChatRoomSchema.index({ 'participants.userId': 1 });
ChatRoomSchema.index({ type: 1, isActive: 1 });
ChatRoomSchema.index({ lastActivity: -1 });
ChatRoomSchema.index({ 'metadata.location.state': 1 });

// Methods
ChatRoomSchema.methods.addParticipant = function (
  userId: mongoose.Types.ObjectId,
  username: string,
  role: 'admin' | 'moderator' | 'member' = 'member'
) {
  const existingParticipant = this.participants.find((p: any) => p.userId.equals(userId));
  if (existingParticipant) {
    throw new Error('User is already a participant');
  }

  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Room has reached maximum participant limit');
  }

  this.participants.push({
    userId,
    username,
    role,
    joinedAt: new Date()
  });

  return this.save();
};

ChatRoomSchema.methods.removeParticipant = function (userId: mongoose.Types.ObjectId) {
  this.participants = this.participants.filter(p => !p.userId.equals(userId));
  return this.save();
};

ChatRoomSchema.methods.updateParticipantRole = function (
  userId: mongoose.Types.ObjectId,
  newRole: 'admin' | 'moderator' | 'member'
) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (!participant) {
    throw new Error('User is not a participant');
  }

  participant.role = newRole;
  return this.save();
};

ChatRoomSchema.methods.markAsRead = function (userId: mongoose.Types.ObjectId) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  throw new Error('User is not a participant');
};

ChatRoomSchema.methods.getUnreadCount = function (userId: mongoose.Types.ObjectId) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (!participant) return 0;

  // This would typically require a separate query to count messages
  // after the participant's lastReadAt timestamp
  return 0; // Placeholder
};

ChatRoomSchema.methods.canUserPerformAction = function (
  userId: mongoose.Types.ObjectId,
  action: 'send_message' | 'add_participant' | 'remove_participant' | 'modify_settings'
): boolean {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (!participant) return false;

  switch (action) {
    case 'send_message':
      return true; // All participants can send messages
    case 'add_participant':
      return participant.role === 'admin' || participant.role === 'moderator';
    case 'remove_participant':
      return participant.role === 'admin';
    case 'modify_settings':
      return participant.role === 'admin';
    default:
      return false;
  }
};

// Static methods
ChatRoomSchema.statics.findByParticipant = function (userId: mongoose.Types.ObjectId) {
  return this.find({
    'participants.userId': userId,
    isActive: true
  }).sort({ lastActivity: -1 });
};

ChatRoomSchema.statics.createDirectMessage = function (
  user1Id: mongoose.Types.ObjectId,
  user1Name: string,
  user2Id: mongoose.Types.ObjectId,
  user2Name: string
) {
  return this.create({
    name: `${user1Name} & ${user2Name}`,
    type: 'direct',
    participants: [
      { userId: user1Id, username: user1Name, role: 'member' },
      { userId: user2Id, username: user2Name, role: 'member' }
    ],
    createdBy: user1Id,
    isPrivate: true,
    maxParticipants: 2,
    settings: {
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowVideoCall: true,
      moderationEnabled: false
    }
  });
};

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
