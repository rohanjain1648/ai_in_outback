import mongoose, { Document, Schema } from 'mongoose';

export interface IPeerSupportMessage {
  senderId: mongoose.Types.ObjectId;
  senderAlias: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  reactions?: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    userAlias: string;
  }[];
}

export interface IPeerSupportChat extends Document {
  connectionId: mongoose.Types.ObjectId;
  participants: {
    userId: mongoose.Types.ObjectId;
    alias: string;
    joinedAt: Date;
    lastSeen: Date;
    isActive: boolean;
  }[];
  messages: IPeerSupportMessage[];
  chatType: 'one_on_one' | 'group' | 'crisis_support';
  isAnonymous: boolean;
  moderatorId?: mongoose.Types.ObjectId;
  chatSettings: {
    allowImages: boolean;
    allowFiles: boolean;
    moderationLevel: 'none' | 'basic' | 'strict';
    maxParticipants: number;
  };
  supportTopic?: string;
  isActive: boolean;
  lastActivity: Date;
  totalMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

const PeerSupportMessageSchema = new Schema<IPeerSupportMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderAlias: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  reactions: [{
    emoji: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    userAlias: String
  }]
});

const PeerSupportChatSchema = new Schema<IPeerSupportChat>({
  connectionId: {
    type: Schema.Types.ObjectId,
    ref: 'SupportConnection',
    required: true
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    alias: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  messages: [PeerSupportMessageSchema],
  chatType: {
    type: String,
    enum: ['one_on_one', 'group', 'crisis_support'],
    default: 'one_on_one'
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  moderatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  chatSettings: {
    allowImages: {
      type: Boolean,
      default: false
    },
    allowFiles: {
      type: Boolean,
      default: false
    },
    moderationLevel: {
      type: String,
      enum: ['none', 'basic', 'strict'],
      default: 'basic'
    },
    maxParticipants: {
      type: Number,
      default: 2
    }
  },
  supportTopic: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalMessages: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
PeerSupportChatSchema.index({ connectionId: 1 });
PeerSupportChatSchema.index({ 'participants.userId': 1, isActive: 1 });
PeerSupportChatSchema.index({ lastActivity: -1 });

export default mongoose.model<IPeerSupportChat>('PeerSupportChat', PeerSupportChatSchema);