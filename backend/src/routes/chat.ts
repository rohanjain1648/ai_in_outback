// @ts-nocheck
import express, { Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import ChatMessage from '../models/ChatMessage';
import ChatRoom from '../models/ChatRoom';
import NotificationPreferences from '../models/NotificationPreferences';
import { User } from '../models/User';
import Joi from 'joi';

const router = express.Router();

// Validation middleware
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: Function) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }
    next();
  };
};

// Validation schemas
const createRoomSchema = Joi.object({
  name: Joi.string().required().max(100).trim(),
  description: Joi.string().max(500).trim(),
  type: Joi.string().valid('group', 'community', 'emergency', 'skill_sharing', 'business').required(),
  isPrivate: Joi.boolean().default(false),
  maxParticipants: Joi.number().min(2).max(1000),
  participantIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1),
  settings: Joi.object({
    allowFileSharing: Joi.boolean().default(true),
    allowVoiceMessages: Joi.boolean().default(true),
    allowVideoCall: Joi.boolean().default(true),
    moderationEnabled: Joi.boolean().default(false),
    autoDeleteMessages: Joi.number().min(1).max(365)
  }),
  metadata: Joi.object({
    relatedResourceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    relatedResourceType: Joi.string().valid('skill', 'business', 'emergency', 'cultural_story', 'resource'),
    location: Joi.object({
      state: Joi.string(),
      region: Joi.string(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      })
    }),
    tags: Joi.array().items(Joi.string())
  })
});

const sendMessageSchema = Joi.object({
  content: Joi.string().required().max(2000),
  type: Joi.string().valid('text', 'image', 'file', 'location').default('text'),
  metadata: Joi.object({
    fileName: Joi.string(),
    fileSize: Joi.number(),
    mimeType: Joi.string(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    })
  })
});

const updatePreferencesSchema = Joi.object({
  emergencyAlerts: Joi.boolean(),
  communityMessages: Joi.boolean(),
  skillMatches: Joi.boolean(),
  businessOpportunities: Joi.boolean(),
  culturalEvents: Joi.boolean(),
  wellbeingCheckins: Joi.boolean(),
  pushNotifications: Joi.boolean(),
  emailNotifications: Joi.boolean(),
  quietHours: Joi.object({
    enabled: Joi.boolean(),
    start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: Joi.string()
  }),
  categories: Joi.object().pattern(Joi.string(), Joi.boolean())
});

// Get user's chat rooms
router.get('/rooms', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const rooms = await ChatRoom.findByParticipant(userId)
      .populate('participants.userId', 'username profilePicture')
      .select('-__v')
      .lean();

    // Add unread message counts (simplified - in production, use aggregation)
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const participant = room.participants.find(p => p.userId._id.toString() === userId);
        const lastReadAt = participant?.lastReadAt || new Date(0);

        const unreadCount = await ChatMessage.countDocuments({
          roomId: room._id.toString(),
          timestamp: { $gt: lastReadAt },
          senderId: { $ne: userId }
        });

        return {
          ...room,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: roomsWithUnread
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms'
    });
  }
});

// Create a new chat room
router.post('/rooms', authenticate, validateRequest(createRoomSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('username');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { participantIds, ...roomData } = req.body;

    // Get participant details
    const participants = await User.find({
      _id: { $in: participantIds }
    }).select('username');

    const participantData = participants.map(p => ({
      userId: p._id,
      username: p.username,
      role: 'member' as const
    }));

    // Add creator as admin
    participantData.push({
      userId: userId,
      username: user.username,
      role: 'admin' as const
    });

    const room = new ChatRoom({
      ...roomData,
      participants: participantData,
      createdBy: userId
    });

    await room.save();

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat room'
    });
  }
});

// Get messages for a room or direct conversation
router.get('/messages', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { roomId, recipientId, page = 1, limit = 50 } = req.query;

    let query: any = {};

    if (roomId) {
      // Verify user is participant in the room
      const room = await ChatRoom.findOne({
        _id: roomId,
        'participants.userId': userId
      });

      if (!room) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this chat room'
        });
      }

      query.roomId = roomId;
    } else if (recipientId) {
      // Direct message conversation
      query.$or = [
        { senderId: userId, recipientId: recipientId },
        { senderId: recipientId, recipientId: userId }
      ];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either roomId or recipientId is required'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'username profilePicture')
      .lean();

    const total = await ChatMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message to a room
router.post('/rooms/:roomId/messages', authenticate, validateRequest(sendMessageSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const { content, type, metadata } = req.body;

    // Verify user is participant in the room
    const room = await ChatRoom.findOne({
      _id: roomId,
      'participants.userId': userId
    });

    if (!room) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    const user = await User.findById(userId).select('username');

    const message = new ChatMessage({
      senderId: userId,
      senderName: user!.username,
      roomId,
      content,
      type,
      metadata
    });

    await message.save();

    // Update room's last activity and message count
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastActivity: new Date(),
      $inc: { messageCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Send direct message
router.post('/direct-messages', authenticate, validateRequest(sendMessageSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { recipientId, content, type, metadata } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'recipientId is required'
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId).select('username');
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const user = await User.findById(userId).select('username');

    const message = new ChatMessage({
      senderId: userId,
      senderName: user!.username,
      recipientId,
      content,
      type,
      metadata
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending direct message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send direct message'
    });
  }
});

// Mark messages as read
router.post('/rooms/:roomId/read', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({
      _id: roomId,
      'participants.userId': userId
    });

    if (!room) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    await room.markAsRead(userId);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// Get notification preferences
router.get('/notifications/preferences', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    let preferences = await NotificationPreferences.findOne({ userId });

    if (!preferences) {
      // Create default preferences
      preferences = new NotificationPreferences(
        NotificationPreferences.schema.statics.getDefaultPreferences(userId)
      );
      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
});

// Update notification preferences
router.put('/notifications/preferences', authenticate, validateRequest(updatePreferencesSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const preferences = await NotificationPreferences.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Subscribe to push notifications
router.post('/notifications/subscribe', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Valid push subscription required'
      });
    }

    await NotificationPreferences.findOneAndUpdate(
      { userId },
      {
        userId,
        pushSubscription: subscription,
        pushNotifications: true
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Push notification subscription saved'
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications'
    });
  }
});

// Join a chat room
router.post('/rooms/:roomId/join', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;

    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    if (room.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Cannot join private room'
      });
    }

    await room.addParticipant(userId, user.username);

    res.json({
      success: true,
      message: 'Successfully joined chat room'
    });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to join chat room'
    });
  }
});

// Leave a chat room
router.post('/rooms/:roomId/leave', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    await room.removeParticipant(userId);

    res.json({
      success: true,
      message: 'Successfully left chat room'
    });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat room'
    });
  }
});

export default router;