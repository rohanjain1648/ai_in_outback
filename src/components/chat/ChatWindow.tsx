import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { webrtcService } from '../../services/webrtcService';

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

interface ChatWindowProps {
  recipientId?: string;
  roomId?: string;
  recipientName?: string;
  roomName?: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  roomId,
  recipientName,
  roomName,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadMessages();
    
    // Join room if it's a room chat
    if (roomId) {
      chatService.joinRoom(roomId);
    }

    // Set up event listeners
    const unsubscribeMessage = chatService.onMessage((message) => {
      if (isRelevantMessage(message)) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
      }
    });

    const unsubscribeTyping = chatService.onTyping((typing) => {
      if (isRelevantTyping(typing)) {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== typing.userId);
          return typing.isTyping ? [...filtered, typing] : filtered;
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      
      if (roomId) {
        chatService.leaveRoom(roomId);
      }
    };
  }, [recipientId, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const result = await chatService.getMessages(roomId, recipientId);
      setMessages(result.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRelevantMessage = (message: ChatMessage): boolean => {
    if (roomId) {
      return message.roomId === roomId;
    } else if (recipientId) {
      return (
        (message.senderId === currentUserId && message.recipientId === recipientId) ||
        (message.senderId === recipientId && message.recipientId === currentUserId)
      );
    }
    return false;
  };

  const isRelevantTyping = (typing: TypingIndicator): boolean => {
    if (roomId) {
      return true; // Room typing indicators are relevant
    } else if (recipientId) {
      return typing.userId === recipientId;
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      if (roomId) {
        await chatService.sendRoomMessage(roomId, messageContent);
      } else if (recipientId) {
        await chatService.sendDirectMessage(recipientId, messageContent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error notification here
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      chatService.startTyping(roomId, recipientId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        chatService.stopTyping(roomId, recipientId);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (recipientId) {
      webrtcService.startCall(recipientId, type);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    
    if (isToday) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const displayName = roomName || recipientName || 'Chat';

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            {typingUsers.length > 0 && (
              <p className="text-sm text-gray-500">
                {typingUsers.map(t => t.username).join(', ')} typing...
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {recipientId && (
            <>
              <button
                onClick={() => handleStartCall('audio')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Start audio call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleStartCall('video')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Close chat"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.senderId !== currentUserId && roomId && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === currentUserId
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1"
                        title={reaction.username}
                      >
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get current user ID
function getCurrentUserId(): string {
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

export default ChatWindow;