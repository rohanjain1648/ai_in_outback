// @ts-nocheck
// Socket.io Service for Real-time Communication
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import EmergencyAlert from '../models/EmergencyAlert';
import { redisClient } from '../config/redis';
import { config } from '../config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface SocketUser {
  id: string;
  socketId: string;
  userId: string;
  username: string;
  location?: {
    state: string;
    region?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  roomId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'system';
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  reactions?: {
    emoji: string;
    userId: string;
    username: string;
  }[];
}

interface NotificationPreferences {
  userId: string;
  emergencyAlerts: boolean;
  communityMessages: boolean;
  skillMatches: boolean;
  businessOpportunities: boolean;
  culturalEvents: boolean;
  wellbeingCheckins: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers(): void {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.id}, User ID: ${socket.userId}`);

      if (socket.userId) {
        this.handleUserConnection(socket);
        this.setupSocketEventHandlers(socket);
      }
    });
  }

  private async authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  }

  private handleUserConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const user = socket.user;

    // Add to connected users
    const socketUser: SocketUser = {
      id: socket.id,
      socketId: socket.id,
      userId,
      username: user.username,
      location: user.location,
      status: 'online',
      lastSeen: new Date()
    };

    this.connectedUsers.set(socket.id, socketUser);

    // Track multiple sockets per user
    const userSocketIds = this.userSockets.get(userId) || [];
    userSocketIds.push(socket.id);
    this.userSockets.set(userId, userSocketIds);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join location-based rooms if location is available
    if (user.location?.coordinates) {
      const locationRoom = this.getLocationRoom(user.location.coordinates);
      socket.join(locationRoom);
    }

    // Notify user's connections about online status
    this.broadcastUserStatus(userId, 'online');

    // Store user status in Redis
    this.updateUserStatusInRedis(userId, 'online');
  }

  private setupSocketEventHandlers(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;

    // Chat message handling
    socket.on('chat:send_message', async (data: {
      recipientId?: string;
      roomId?: string;
      content: string;
      type: 'text' | 'image' | 'file' | 'location';
    }) => {
      await this.handleChatMessage(socket, data);
    });

    // Chat room management
    socket.on('chat:join_room', (roomId: string) => {
      socket.join(`room:${roomId}`);
      socket.emit('chat:joined_room', { roomId });
    });

    socket.on('chat:leave_room', (roomId: string) => {
      socket.leave(`room:${roomId}`);
      socket.emit('chat:left_room', { roomId });
    });

    // Typing indicators
    socket.on('chat:typing_start', (data: { recipientId?: string; roomId?: string }) => {
      this.handleTypingIndicator(socket, data, true);
    });

    socket.on('chat:typing_stop', (data: { recipientId?: string; roomId?: string }) => {
      this.handleTypingIndicator(socket, data, false);
    });

    // Message reactions
    socket.on('chat:add_reaction', async (data: { messageId: string; emoji: string }) => {
      await this.handleMessageReaction(socket, data, 'add');
    });

    socket.on('chat:remove_reaction', async (data: { messageId: string; emoji: string }) => {
      await this.handleMessageReaction(socket, data, 'remove');
    });

    // User status updates
    socket.on('user:update_status', (status: 'online' | 'away' | 'busy') => {
      this.updateUserStatus(socket, status);
    });

    // Location updates
    socket.on('user:update_location', (location: { latitude: number; longitude: number }) => {
      this.updateUserLocation(socket, location);
    });

    // Push notification subscription
    socket.on('notifications:subscribe', async (subscription: any) => {
      await this.handlePushSubscription(userId, subscription);
    });

    // Notification preferences
    socket.on('notifications:update_preferences', async (preferences: Partial<NotificationPreferences>) => {
      await this.updateNotificationPreferences(userId, preferences);
    });

    // WebRTC signaling
    socket.on('webrtc:offer', (data: { recipientId: string; offer: any }) => {
      this.handleWebRTCSignaling(socket, 'offer', data);
    });

    socket.on('webrtc:answer', (data: { recipientId: string; answer: any }) => {
      this.handleWebRTCSignaling(socket, 'answer', data);
    });

    socket.on('webrtc:ice_candidate', (data: { recipientId: string; candidate: any }) => {
      this.handleWebRTCSignaling(socket, 'ice_candidate', data);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      this.handleUserDisconnection(socket);
    });
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: {
    recipientId?: string;
    roomId?: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'location';
  }): Promise<void> {
    const userId = socket.userId!;
    const user = socket.user;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: userId,
      senderName: user.username,
      recipientId: data.recipientId,
      roomId: data.roomId,
      content: data.content,
      type: data.type,
      timestamp: new Date(),
      reactions: []
    };

    // Store message in Redis for chat history
    await this.storeMessage(message);

    // Send to recipient(s)
    if (data.recipientId) {
      // Direct message
      this.io.to(`user:${data.recipientId}`).emit('chat:message_received', message);
      socket.emit('chat:message_sent', message);
    } else if (data.roomId) {
      // Room message
      this.io.to(`room:${data.roomId}`).emit('chat:message_received', message);
    }

    // Send push notification if recipient is offline
    if (data.recipientId) {
      const recipientOnline = this.userSockets.has(data.recipientId);
      if (!recipientOnline) {
        await this.sendPushNotification(data.recipientId, {
          title: `Message from ${user.username}`,
          body: data.type === 'text' ? data.content : `Sent a ${data.type}`,
          data: { type: 'chat_message', senderId: userId, messageId: message.id }
        });
      }
    }
  }

  private handleTypingIndicator(socket: AuthenticatedSocket, data: {
    recipientId?: string;
    roomId?: string;
  }, isTyping: boolean): void {
    const userId = socket.userId!;
    const user = socket.user;

    const typingData = {
      userId,
      username: user.username,
      isTyping
    };

    if (data.recipientId) {
      this.io.to(`user:${data.recipientId}`).emit('chat:typing_indicator', typingData);
    } else if (data.roomId) {
      socket.to(`room:${data.roomId}`).emit('chat:typing_indicator', typingData);
    }
  }

  private async handleMessageReaction(socket: AuthenticatedSocket, data: {
    messageId: string;
    emoji: string;
  }, action: 'add' | 'remove'): Promise<void> {
    const userId = socket.userId!;
    const user = socket.user;

    // Update message reactions in Redis
    const messageKey = `message:${data.messageId}`;
    const message = await redisClient.get(messageKey);

    if (message) {
      const parsedMessage: ChatMessage = JSON.parse(message);

      if (action === 'add') {
        parsedMessage.reactions = parsedMessage.reactions || [];
        const existingReaction = parsedMessage.reactions.find(r => r.userId === userId && r.emoji === data.emoji);

        if (!existingReaction) {
          parsedMessage.reactions.push({
            emoji: data.emoji,
            userId,
            username: user.username
          });
        }
      } else {
        parsedMessage.reactions = parsedMessage.reactions?.filter(r =>
          !(r.userId === userId && r.emoji === data.emoji)
        ) || [];
      }

      await redisClient.setEx(messageKey, 86400 * 7, JSON.stringify(parsedMessage)); // 7 days

      // Broadcast reaction update
      const targetRoom = parsedMessage.recipientId ? `user:${parsedMessage.recipientId}` : `room:${parsedMessage.roomId}`;
      this.io.to(targetRoom).emit('chat:reaction_updated', {
        messageId: data.messageId,
        reactions: parsedMessage.reactions
      });
    }
  }

  private updateUserStatus(socket: AuthenticatedSocket, status: 'online' | 'away' | 'busy'): void {
    const userId = socket.userId!;
    const socketUser = this.connectedUsers.get(socket.id);

    if (socketUser) {
      socketUser.status = status;
      socketUser.lastSeen = new Date();
      this.connectedUsers.set(socket.id, socketUser);
    }

    this.broadcastUserStatus(userId, status);
    this.updateUserStatusInRedis(userId, status);
  }

  private updateUserLocation(socket: AuthenticatedSocket, location: { latitude: number; longitude: number }): void {
    const userId = socket.userId!;
    const socketUser = this.connectedUsers.get(socket.id);

    if (socketUser) {
      // Leave old location room
      if (socketUser.location?.coordinates) {
        const oldLocationRoom = this.getLocationRoom(socketUser.location.coordinates);
        socket.leave(oldLocationRoom);
      }

      // Update location
      socketUser.location = {
        state: socketUser.location?.state || '',
        region: socketUser.location?.region,
        coordinates: location
      };
      this.connectedUsers.set(socket.id, socketUser);

      // Join new location room
      const newLocationRoom = this.getLocationRoom(location);
      socket.join(newLocationRoom);
    }
  }

  private handleWebRTCSignaling(socket: AuthenticatedSocket, type: string, data: any): void {
    const userId = socket.userId!;

    this.io.to(`user:${data.recipientId}`).emit(`webrtc:${type}`, {
      ...data,
      senderId: userId
    });
  }

  private handleUserDisconnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;

    // Remove from connected users
    this.connectedUsers.delete(socket.id);

    // Update user sockets tracking
    const userSocketIds = this.userSockets.get(userId) || [];
    const updatedSocketIds = userSocketIds.filter(id => id !== socket.id);

    if (updatedSocketIds.length === 0) {
      // User is completely offline
      this.userSockets.delete(userId);
      this.broadcastUserStatus(userId, 'offline');
      this.updateUserStatusInRedis(userId, 'offline');
    } else {
      this.userSockets.set(userId, updatedSocketIds);
    }

    console.log(`User disconnected: ${socket.id}, User ID: ${userId}`);
  }

  // Public methods for external services
  public async sendNotificationToUser(userId: string, notification: any): Promise<void> {
    this.io.to(`user:${userId}`).emit('notification', notification);

    // Also send push notification if user is offline
    const userOnline = this.userSockets.has(userId);
    if (!userOnline) {
      await this.sendPushNotification(userId, {
        title: notification.title,
        body: notification.message,
        data: notification.data
      });
    }
  }

  public async sendEmergencyAlert(alert: any, targetUsers?: string[]): Promise<void> {
    if (targetUsers) {
      targetUsers.forEach(userId => {
        this.io.to(`user:${userId}`).emit('emergency:alert', alert);
      });
    } else {
      this.io.emit('emergency:alert', alert);
    }

    // Send push notifications for emergency alerts
    const pushNotification: PushNotification = {
      title: '🚨 Emergency Alert',
      body: alert.message,
      data: { type: 'emergency', alertId: alert.id },
      actions: [
        { action: 'acknowledge', title: 'Acknowledge' },
        { action: 'view', title: 'View Details' }
      ]
    };

    if (targetUsers) {
      for (const userId of targetUsers) {
        await this.sendPushNotification(userId, pushNotification);
      }
    }
  }

  public broadcastToLocation(location: { latitude: number; longitude: number }, event: string, data: any): void {
    const locationRoom = this.getLocationRoom(location);
    this.io.to(locationRoom).emit(event, data);
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getUserStatus(userId: string): 'online' | 'offline' {
    return this.userSockets.has(userId) ? 'online' : 'offline';
  }

  // Gig-specific methods
  public async broadcastGigJobCreated(job: any): Promise<void> {
    this.io.emit('gig:job_created', job);
  }

  public async broadcastGigJobUpdated(job: any): Promise<void> {
    this.io.emit('gig:job_updated', job);

    // Notify job poster
    if (job.postedBy) {
      await this.sendNotificationToUser(job.postedBy.toString(), {
        title: 'Job Updated',
        message: `Your job "${job.title}" has been updated`,
        type: 'info',
        data: { jobId: job._id, type: 'gig_job_updated' }
      });
    }
  }

  public async broadcastGigJobDeleted(jobId: string, posterId: string): Promise<void> {
    this.io.emit('gig:job_deleted', jobId);
  }

  public async notifyGigApplicationReceived(jobId: string, posterId: string, applicant: any): Promise<void> {
    await this.sendNotificationToUser(posterId, {
      title: 'New Job Application',
      message: `${applicant.name} applied to your job`,
      type: 'info',
      data: { jobId, applicantId: applicant.id, type: 'gig_application_received' }
    });

    this.io.to(`user:${posterId}`).emit('gig:application_received', {
      jobId,
      applicant
    });
  }

  public async notifyGigWorkerSelected(jobId: string, workerId: string, jobTitle: string): Promise<void> {
    await this.sendNotificationToUser(workerId, {
      title: 'You\'ve Been Selected!',
      message: `You were selected for the job: ${jobTitle}`,
      type: 'success',
      data: { jobId, type: 'gig_worker_selected' }
    });

    this.io.to(`user:${workerId}`).emit('gig:worker_selected', {
      jobId,
      jobTitle
    });
  }

  public async notifyGigJobCompleted(jobId: string, posterId: string, workerId: string, jobTitle: string): Promise<void> {
    await this.sendNotificationToUser(posterId, {
      title: 'Job Completed',
      message: `The job "${jobTitle}" has been marked as completed`,
      type: 'success',
      data: { jobId, type: 'gig_job_completed' }
    });

    await this.sendNotificationToUser(workerId, {
      title: 'Job Completed',
      message: `The job "${jobTitle}" has been marked as completed`,
      type: 'success',
      data: { jobId, type: 'gig_job_completed' }
    });

    this.io.to(`user:${posterId}`).emit('gig:job_completed', { jobId, jobTitle });
    this.io.to(`user:${workerId}`).emit('gig:job_completed', { jobId, jobTitle });
  }

  // Private helper methods
  private broadcastUserStatus(userId: string, status: string): void {
    this.io.emit('user:status_changed', { userId, status, timestamp: new Date() });
  }

  private async updateUserStatusInRedis(userId: string, status: string): Promise<void> {
    await redisClient.setEx(`user_status:${userId}`, 86400, JSON.stringify({
      status,
      lastSeen: new Date(),
      socketIds: this.userSockets.get(userId) || []
    })); // 24 hours
  }

  private getLocationRoom(coordinates: { latitude: number; longitude: number }): string {
    // Create location-based room with ~10km precision
    const lat = Math.round(coordinates.latitude * 100) / 100;
    const lng = Math.round(coordinates.longitude * 100) / 100;
    return `location:${lat}_${lng}`;
  }

  private async storeMessage(message: ChatMessage): Promise<void> {
    const messageKey = `message:${message.id}`;
    await redisClient.setEx(messageKey, 86400 * 7, JSON.stringify(message)); // 7 days

    // Also store in conversation history
    const conversationKey = message.recipientId
      ? `conversation:${[message.senderId, message.recipientId].sort().join(':')}`
      : `room_messages:${message.roomId}`;

    await redisClient.lPush(conversationKey, message.id);
    await redisClient.expire(conversationKey, 86400 * 30); // 30 days
  }

  private async handlePushSubscription(userId: string, subscription: any): Promise<void> {
    // Store push subscription in Redis
    await redisClient.setEx(`push_subscription:${userId}`, 86400 * 365, JSON.stringify(subscription)); // 1 year
  }

  private async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const existingPrefs = await redisClient.get(`notification_prefs:${userId}`);
    const currentPrefs: NotificationPreferences = existingPrefs
      ? JSON.parse(existingPrefs)
      : {
        userId,
        emergencyAlerts: true,
        communityMessages: true,
        skillMatches: true,
        businessOpportunities: true,
        culturalEvents: true,
        wellbeingCheckins: true,
        pushNotifications: true,
        emailNotifications: false,
        quietHours: { enabled: false, start: '22:00', end: '07:00' }
      };

    const updatedPrefs = { ...currentPrefs, ...preferences };
    await redisClient.setEx(`notification_prefs:${userId}`, 86400 * 365, JSON.stringify(updatedPrefs));
  }

  private async sendPushNotification(userId: string, notification: PushNotification): Promise<void> {
    try {
      // Check notification preferences
      const prefsData = await redisClient.get(`notification_prefs:${userId}`);
      if (prefsData) {
        const prefs: NotificationPreferences = JSON.parse(prefsData);
        if (!prefs.pushNotifications) return;

        // Check quiet hours
        if (prefs.quietHours.enabled) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          if (currentTime >= prefs.quietHours.start || currentTime <= prefs.quietHours.end) {
            return; // Skip notification during quiet hours
          }
        }
      }

      // Get push subscription
      const subscriptionData = await redisClient.get(`push_subscription:${userId}`);
      if (!subscriptionData) return;

      const subscription = JSON.parse(subscriptionData);

      // Here you would integrate with a push notification service like Firebase Cloud Messaging
      // For now, we'll just log the notification
      console.log(`Push notification for user ${userId}:`, notification);

      // TODO: Implement actual push notification sending
      // await webpush.sendNotification(subscription, JSON.stringify(notification));

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

export default SocketService;
