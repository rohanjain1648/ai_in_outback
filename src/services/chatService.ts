import { socketService } from './socketService';

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
  readBy?: {
    userId: string;
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

interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'community' | 'emergency' | 'skill_sharing' | 'business';
  participants: {
    userId: string;
    username: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    lastReadAt?: Date;
  }[];
  createdBy: string;
  isPrivate: boolean;
  maxParticipants?: number;
  settings: {
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowVideoCall: boolean;
    moderationEnabled: boolean;
    autoDeleteMessages?: number;
  };
  metadata?: {
    relatedResourceId?: string;
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
  unreadCount?: number;
}

interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface ConversationState {
  messages: ChatMessage[];
  typingUsers: Map<string, TypingIndicator>;
  lastFetched: Date;
  hasMore: boolean;
}

type MessageCallback = (message: ChatMessage) => void;
type TypingCallback = (typing: TypingIndicator) => void;
type RoomCallback = (room: ChatRoom) => void;

class ChatService {
  private conversations: Map<string, ConversationState> = new Map();
  private rooms: Map<string, ChatRoom> = new Map();
  private messageListeners: MessageCallback[] = [];
  private typingListeners: TypingCallback[] = [];
  private roomListeners: RoomCallback[] = [];
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    socketService.on('message_received', (message: ChatMessage) => {
      this.handleMessageReceived(message);
    });

    socketService.on('message_sent', (message: ChatMessage) => {
      this.handleMessageSent(message);
    });

    socketService.on('typing_indicator', (data: TypingIndicator) => {
      this.handleTypingIndicator(data);
    });

    socketService.on('reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      this.handleReactionUpdate(data);
    });

    socketService.on('room_joined', (data: { roomId: string }) => {
      console.log('Joined room:', data.roomId);
    });

    socketService.on('room_left', (data: { roomId: string }) => {
      console.log('Left room:', data.roomId);
    });
  }

  private handleMessageReceived(message: ChatMessage): void {
    const conversationKey = this.getConversationKey(message);
    const conversation = this.getOrCreateConversation(conversationKey);
    
    // Add message if not already exists
    const existingMessage = conversation.messages.find(m => m.id === message.id);
    if (!existingMessage) {
      conversation.messages.push({
        ...message,
        timestamp: new Date(message.timestamp)
      });
      
      // Sort messages by timestamp
      conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    this.notifyMessageListeners(message);
  }

  private handleMessageSent(message: ChatMessage): void {
    const conversationKey = this.getConversationKey(message);
    const conversation = this.getOrCreateConversation(conversationKey);
    
    // Update or add message
    const existingIndex = conversation.messages.findIndex(m => m.id === message.id);
    if (existingIndex >= 0) {
      conversation.messages[existingIndex] = {
        ...message,
        timestamp: new Date(message.timestamp)
      };
    } else {
      conversation.messages.push({
        ...message,
        timestamp: new Date(message.timestamp)
      });
    }

    // Sort messages by timestamp
    conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    this.notifyMessageListeners(message);
  }

  private handleTypingIndicator(data: TypingIndicator): void {
    const conversationKey = data.userId; // For direct messages, use userId as key
    const conversation = this.conversations.get(conversationKey);
    
    if (conversation) {
      if (data.isTyping) {
        conversation.typingUsers.set(data.userId, data);
        
        // Clear existing timeout
        const existingTimeout = this.typingTimeouts.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set timeout to clear typing indicator
        const timeout = setTimeout(() => {
          conversation.typingUsers.delete(data.userId);
          this.typingTimeouts.delete(data.userId);
          this.notifyTypingListeners({ ...data, isTyping: false });
        }, 3000);
        
        this.typingTimeouts.set(data.userId, timeout);
      } else {
        conversation.typingUsers.delete(data.userId);
        const timeout = this.typingTimeouts.get(data.userId);
        if (timeout) {
          clearTimeout(timeout);
          this.typingTimeouts.delete(data.userId);
        }
      }
    }

    this.notifyTypingListeners(data);
  }

  private handleReactionUpdate(data: { messageId: string; reactions: any[] }): void {
    // Find and update message in all conversations
    for (const conversation of this.conversations.values()) {
      const message = conversation.messages.find(m => m.id === data.messageId);
      if (message) {
        message.reactions = data.reactions;
        this.notifyMessageListeners(message);
        break;
      }
    }
  }

  private getConversationKey(message: ChatMessage): string {
    if (message.roomId) {
      return `room:${message.roomId}`;
    } else if (message.recipientId) {
      // For direct messages, create consistent key regardless of sender/recipient order
      const currentUserId = this.getCurrentUserId();
      const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;
      return `direct:${otherUserId}`;
    }
    return 'unknown';
  }

  private getOrCreateConversation(key: string): ConversationState {
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        messages: [],
        typingUsers: new Map(),
        lastFetched: new Date(0),
        hasMore: true
      });
    }
    return this.conversations.get(key)!;
  }

  private getCurrentUserId(): string {
    // This should get the current user ID from auth service
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    return '';
  }

  // Public methods
  public async getRooms(): Promise<ChatRoom[]> {
    try {
      const response = await fetch('/api/v1/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const rooms = data.data.map((room: any) => ({
          ...room,
          lastActivity: new Date(room.lastActivity)
        }));
        
        // Cache rooms
        rooms.forEach((room: ChatRoom) => {
          this.rooms.set(room._id, room);
        });
        
        return rooms;
      }
      throw new Error('Failed to fetch rooms');
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  public async getMessages(roomId?: string, recipientId?: string, page = 1, limit = 50): Promise<{
    messages: ChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (roomId) params.append('roomId', roomId);
      if (recipientId) params.append('recipientId', recipientId);

      const response = await fetch(`/api/v1/chat/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const messages = data.data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        // Cache messages
        const conversationKey = roomId ? `room:${roomId}` : `direct:${recipientId}`;
        const conversation = this.getOrCreateConversation(conversationKey);
        
        if (page === 1) {
          conversation.messages = messages;
        } else {
          // Prepend older messages
          const existingIds = new Set(conversation.messages.map(m => m.id));
          const newMessages = messages.filter((m: ChatMessage) => !existingIds.has(m.id));
          conversation.messages = [...newMessages, ...conversation.messages];
        }
        
        conversation.lastFetched = new Date();
        conversation.hasMore = data.data.pagination.page < data.data.pagination.pages;

        return data.data;
      }
      throw new Error('Failed to fetch messages');
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        messages: [],
        pagination: { page: 1, limit, total: 0, pages: 0 }
      };
    }
  }

  public sendMessage(data: {
    recipientId?: string;
    roomId?: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'location';
    metadata?: any;
  }): void {
    socketService.sendMessage(data);
  }

  public async sendDirectMessage(recipientId: string, content: string, type: 'text' | 'image' | 'file' | 'location' = 'text', metadata?: any): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/chat/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId,
          content,
          type,
          metadata
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending direct message:', error);
      return false;
    }
  }

  public async sendRoomMessage(roomId: string, content: string, type: 'text' | 'image' | 'file' | 'location' = 'text', metadata?: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          type,
          metadata
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending room message:', error);
      return false;
    }
  }

  public joinRoom(roomId: string): void {
    socketService.joinRoom(roomId);
  }

  public leaveRoom(roomId: string): void {
    socketService.leaveRoom(roomId);
  }

  public startTyping(roomId?: string, recipientId?: string): void {
    socketService.startTyping({ roomId, recipientId });
  }

  public stopTyping(roomId?: string, recipientId?: string): void {
    socketService.stopTyping({ roomId, recipientId });
  }

  public addReaction(messageId: string, emoji: string): void {
    socketService.addReaction(messageId, emoji);
  }

  public removeReaction(messageId: string, emoji: string): void {
    socketService.removeReaction(messageId, emoji);
  }

  public async createRoom(roomData: {
    name: string;
    description?: string;
    type: 'group' | 'community' | 'emergency' | 'skill_sharing' | 'business';
    isPrivate?: boolean;
    maxParticipants?: number;
    participantIds: string[];
    settings?: any;
    metadata?: any;
  }): Promise<ChatRoom | null> {
    try {
      const response = await fetch('/api/v1/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        const data = await response.json();
        const room = {
          ...data.data,
          lastActivity: new Date(data.data.lastActivity)
        };
        
        this.rooms.set(room._id, room);
        this.notifyRoomListeners(room);
        return room;
      }
      return null;
    } catch (error) {
      console.error('Error creating room:', error);
      return null;
    }
  }

  public async markAsRead(roomId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getToken()}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  public getCachedMessages(roomId?: string, recipientId?: string): ChatMessage[] {
    const conversationKey = roomId ? `room:${roomId}` : `direct:${recipientId}`;
    const conversation = this.conversations.get(conversationKey);
    return conversation ? [...conversation.messages] : [];
  }

  public getTypingUsers(roomId?: string, recipientId?: string): TypingIndicator[] {
    const conversationKey = roomId ? `room:${roomId}` : `direct:${recipientId}`;
    const conversation = this.conversations.get(conversationKey);
    return conversation ? Array.from(conversation.typingUsers.values()) : [];
  }

  // Event listeners
  public onMessage(callback: MessageCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  public onTyping(callback: TypingCallback): () => void {
    this.typingListeners.push(callback);
    return () => {
      const index = this.typingListeners.indexOf(callback);
      if (index > -1) {
        this.typingListeners.splice(index, 1);
      }
    };
  }

  public onRoom(callback: RoomCallback): () => void {
    this.roomListeners.push(callback);
    return () => {
      const index = this.roomListeners.indexOf(callback);
      if (index > -1) {
        this.roomListeners.splice(index, 1);
      }
    };
  }

  private notifyMessageListeners(message: ChatMessage): void {
    this.messageListeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  private notifyTypingListeners(typing: TypingIndicator): void {
    this.typingListeners.forEach(callback => {
      try {
        callback(typing);
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  private notifyRoomListeners(room: ChatRoom): void {
    this.roomListeners.forEach(callback => {
      try {
        callback(room);
      } catch (error) {
        console.error('Error in room listener:', error);
      }
    });
  }
}

export const chatService = new ChatService();
export default chatService;