import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { socketService } from '../services/socketService';

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

interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface UseRealTimeChatProps {
  roomId?: string;
  recipientId?: string;
}

interface UseRealTimeChatReturn {
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'location') => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

export const useRealTimeChat = ({ roomId, recipientId }: UseRealTimeChatProps): UseRealTimeChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const result = await chatService.getMessages(roomId, recipientId, 1, 50);
        setMessages(result.messages);
        setHasMoreMessages(result.pagination.page < result.pagination.pages);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId || recipientId) {
      loadMessages();
    }
  }, [roomId, recipientId]);

  // Set up socket connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(socketService.isConnected());
    };

    socketService.on('connected', updateConnectionStatus);
    socketService.on('disconnected', updateConnectionStatus);
    socketService.on('connection_error', updateConnectionStatus);

    // Initial status
    updateConnectionStatus();

    return () => {
      socketService.off('connected', updateConnectionStatus);
      socketService.off('disconnected', updateConnectionStatus);
      socketService.off('connection_error', updateConnectionStatus);
    };
  }, []);

  // Set up message listeners
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      // Check if message is relevant to current conversation
      const isRelevant = roomId 
        ? message.roomId === roomId
        : (message.recipientId === recipientId || message.senderId === recipientId);

      if (isRelevant) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.find(m => m.id === message.id);
          if (exists) return prev;
          
          // Add message and sort by timestamp
          return [...prev, message].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
      }
    };

    const handleTypingIndicator = (typing: TypingIndicator) => {
      // Check if typing indicator is relevant
      const isRelevant = roomId || typing.userId === recipientId;
      
      if (isRelevant) {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== typing.userId);
          return typing.isTyping ? [...filtered, typing] : filtered;
        });
      }
    };

    const unsubscribeMessage = chatService.onMessage(handleNewMessage);
    const unsubscribeTyping = chatService.onTyping(handleTypingIndicator);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [roomId, recipientId]);

  // Join/leave room
  useEffect(() => {
    if (roomId) {
      chatService.joinRoom(roomId);
      
      return () => {
        chatService.leaveRoom(roomId);
      };
    }
  }, [roomId]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' | 'location' = 'text') => {
    if (!content.trim()) return;

    try {
      if (roomId) {
        await chatService.sendRoomMessage(roomId, content, type);
      } else if (recipientId) {
        await chatService.sendDirectMessage(recipientId, content, type);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [roomId, recipientId]);

  const startTyping = useCallback(() => {
    chatService.startTyping(roomId, recipientId);
  }, [roomId, recipientId]);

  const stopTyping = useCallback(() => {
    chatService.stopTyping(roomId, recipientId);
  }, [roomId, recipientId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await chatService.getMessages(roomId, recipientId, nextPage, 50);
      
      if (result.messages.length > 0) {
        setMessages(prev => {
          // Merge messages and remove duplicates
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = result.messages.filter(m => !existingIds.has(m.id));
          
          return [...newMessages, ...prev].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
        
        setCurrentPage(nextPage);
        setHasMoreMessages(result.pagination.page < result.pagination.pages);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, recipientId, currentPage, hasMoreMessages, isLoading]);

  return {
    messages,
    typingUsers,
    isConnected,
    isLoading,
    sendMessage,
    startTyping,
    stopTyping,
    loadMoreMessages,
    hasMoreMessages
  };
};