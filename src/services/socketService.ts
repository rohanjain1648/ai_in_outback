import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

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

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
  timestamp: Date;
  data?: any;
  actions?: {
    action: string;
    title: string;
  }[];
}

interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  timestamp: Date;
}

interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const token = authService.getToken();
    if (!token) {
      console.warn('No auth token available for socket connection');
      return;
    }

    const serverUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', async () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.emit('connected');

      // Join user's personal room
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          this.socket?.emit('join_user_room', user.id);
        }
      } catch (error) {
        console.warn('Could not get current user for socket room join:', error);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnected', reason);

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }

      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('connection_error', error);
      this.handleReconnection();
    });

    // Chat message events
    this.socket.on('chat:message_received', (message: ChatMessage) => {
      this.emit('message_received', message);
    });

    this.socket.on('chat:message_sent', (message: ChatMessage) => {
      this.emit('message_sent', message);
    });

    this.socket.on('chat:typing_indicator', (data: TypingIndicator) => {
      this.emit('typing_indicator', data);
    });

    this.socket.on('chat:reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      this.emit('reaction_updated', data);
    });

    this.socket.on('chat:joined_room', (data: { roomId: string }) => {
      this.emit('room_joined', data);
    });

    this.socket.on('chat:left_room', (data: { roomId: string }) => {
      this.emit('room_left', data);
    });

    // User status events
    this.socket.on('user:status_changed', (data: UserStatus) => {
      this.emit('user_status_changed', data);
    });

    // Notification events
    this.socket.on('notification', (notification: NotificationData) => {
      this.emit('notification', notification);
      this.showBrowserNotification(notification);
    });

    // Emergency alert events
    this.socket.on('emergency:alert', (alert: any) => {
      this.emit('emergency_alert', alert);
      this.showEmergencyNotification(alert);
    });

    // Gig job events
    this.socket.on('gig:job_created', (job: any) => {
      this.emit('gig:job_created', job);
    });

    this.socket.on('gig:job_updated', (job: any) => {
      this.emit('gig:job_updated', job);
    });

    this.socket.on('gig:job_deleted', (jobId: string) => {
      this.emit('gig:job_deleted', jobId);
    });

    this.socket.on('gig:application_received', (data: any) => {
      this.emit('gig:application_received', data);
    });

    this.socket.on('gig:worker_selected', (data: any) => {
      this.emit('gig:worker_selected', data);
    });

    this.socket.on('gig:job_completed', (data: any) => {
      this.emit('gig:job_completed', data);
    });

    // WebRTC signaling events
    this.socket.on('webrtc:offer', (data: any) => {
      this.emit('webrtc_offer', data);
    });

    this.socket.on('webrtc:answer', (data: any) => {
      this.emit('webrtc_answer', data);
    });

    this.socket.on('webrtc:ice_candidate', (data: any) => {
      this.emit('webrtc_ice_candidate', data);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnection_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.socket?.connected) return;

      this.socket?.connect();
    }, delay);
  }

  // Public methods
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Event management
  public on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Chat methods
  public sendMessage(data: {
    recipientId?: string;
    roomId?: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'location';
  }): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:send_message', {
      type: 'text',
      ...data
    });
  }

  public joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:join_room', roomId);
  }

  public leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:leave_room', roomId);
  }

  public startTyping(data: { recipientId?: string; roomId?: string }): void {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:typing_start', data);
  }

  public stopTyping(data: { recipientId?: string; roomId?: string }): void {
    if (!this.socket?.connected) return;
    this.socket.emit('chat:typing_stop', data);
  }

  public addReaction(messageId: string, emoji: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:add_reaction', { messageId, emoji });
  }

  public removeReaction(messageId: string, emoji: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('chat:remove_reaction', { messageId, emoji });
  }

  // User status methods
  public updateStatus(status: 'online' | 'away' | 'busy'): void {
    if (!this.socket?.connected) return;
    this.socket.emit('user:update_status', status);
  }

  public updateLocation(location: { latitude: number; longitude: number }): void {
    if (!this.socket?.connected) return;
    this.socket.emit('user:update_location', location);
  }

  // Notification methods
  public subscribeToPushNotifications(subscription: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:subscribe', subscription);
  }

  public updateNotificationPreferences(preferences: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:update_preferences', preferences);
  }

  // WebRTC methods
  public sendWebRTCOffer(recipientId: string, offer: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('webrtc:offer', { recipientId, offer });
  }

  public sendWebRTCAnswer(recipientId: string, answer: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('webrtc:answer', { recipientId, answer });
  }

  public sendWebRTCIceCandidate(recipientId: string, candidate: any): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('webrtc:ice_candidate', { recipientId, candidate });
  }

  // Emergency methods
  public async acknowledgeEmergencyAlert(alertId: string): Promise<void> {
    if (!this.socket?.connected) return;

    const user = await authService.getCurrentUser();
    if (user) {
      this.socket.emit('emergency:acknowledge', { alertId, userId: user.id });
    }
  }

  public async updateSafetyStatus(alertId: string, status: 'safe' | 'need_help', message?: string, location?: [number, number]): Promise<void> {
    if (!this.socket?.connected) return;

    const user = await authService.getCurrentUser();
    if (user) {
      this.socket.emit('emergency:safety_status', {
        alertId,
        userId: user.id,
        status,
        message,
        location
      });
    }
  }

  // Browser notification methods
  private async showBrowserNotification(notification: NotificationData): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        data: notification.data
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotification(notification);
      }
    }
  }

  private async showEmergencyNotification(alert: any): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('🚨 Emergency Alert', {
        body: alert.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `emergency-${alert.id}`,
        requireInteraction: true,
        data: { type: 'emergency', alertId: alert.id }
      });
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }
}

export const socketService = new SocketService();
export default socketService;