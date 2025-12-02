import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Phone, Video } from 'lucide-react';
import { chatService } from '../../services/chatService';
import ChatWindow from './ChatWindow';

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
  lastActivity: Date;
  messageCount: number;
  unreadCount?: number;
}

const ChatList: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const roomList = await chatService.getRooms();
      setRooms(roomList);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <MessageCircle className="w-5 h-5" />;
      case 'group':
      case 'community':
        return <Users className="w-5 h-5" />;
      case 'emergency':
        return <span className="text-red-500">🚨</span>;
      case 'skill_sharing':
        return <span>🎓</span>;
      case 'business':
        return <span>💼</span>;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (selectedRoom) {
    return (
      <ChatWindow
        roomId={selectedRoom._id}
        roomName={selectedRoom.name}
        onClose={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
          <p className="text-gray-600">Connect with your community in real-time</p>
        </div>

        {/* Chat rooms list */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading conversations...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start connecting with your community!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {getRoomIcon(room.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {room.unreadCount && room.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatLastActivity(new Date(room.lastActivity))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {room.description || `${room.participants.length} participants`}
                      </p>
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400 capitalize">
                          {room.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Demo section */}
        {rooms.length === 0 && !isLoading && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Communication Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">✅ Implemented Features:</h4>
                <ul className="space-y-1">
                  <li>• Real-time messaging with Socket.io</li>
                  <li>• Push notifications for offline users</li>
                  <li>• Typing indicators</li>
                  <li>• Message reactions and read receipts</li>
                  <li>• WebRTC voice and video calls</li>
                  <li>• Notification preferences management</li>
                  <li>• Emergency alert system</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔧 Technical Implementation:</h4>
                <ul className="space-y-1">
                  <li>• Socket.io server integration</li>
                  <li>• React hooks for real-time state</li>
                  <li>• Service worker for push notifications</li>
                  <li>• WebRTC peer-to-peer connections</li>
                  <li>• Redis for message caching</li>
                  <li>• MongoDB for persistent storage</li>
                  <li>• Background sync for offline messages</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;