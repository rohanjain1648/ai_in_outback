// @ts-nocheck
import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  recipientId?: mongoose.Types.ObjectId;
  roomId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'system';
  timestamp: Date;
  edited: boolean;
  editedAt?: Date;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    username: string;
    timestamp: Date;
  }[];
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

const ChatMessageSchema = new Schema<IChatMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  roomId: {
    type: String,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ChatMessageSchema.index({ senderId: 1, timestamp: -1 });
ChatMessageSchema.index({ recipientId: 1, timestamp: -1 });
ChatMessageSchema.index({ roomId: 1, timestamp: -1 });
ChatMessageSchema.index({ timestamp: -1 });

// Compound index for direct messages
ChatMessageSchema.index({ senderId: 1, recipientId: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
