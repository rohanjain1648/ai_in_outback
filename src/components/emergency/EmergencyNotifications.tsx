import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'alert' | 'response' | 'coordination';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  alertId?: string;
}

interface EmergencyNotificationsProps {
  socket: Socket | null;
}

const EmergencyNotifications: React.FC<EmergencyNotificationsProps> = ({ socket }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!socket) return;

    // Listen for new emergency alerts
    socket.on('emergency:alert', (data) => {
      const notification: Notification = {
        id: `alert-${data.alert._id}-${Date.now()}`,
        type: 'alert',
        title: `🚨 ${data.alert.severity.toUpperCase()} ALERT`,
        message: data.alert.title,
        severity: data.alert.severity,
        timestamp: new Date(),
        alertId: data.alert._id
      };
      
      addNotification(notification);
      playNotificationSound(data.alert.severity);
    });

    // Listen for targeted alerts (higher priority)
    socket.on('emergency:targeted_alert', (data) => {
      const notification: Notification = {
        id: `targeted-${data.alert._id}-${Date.now()}`,
        type: 'alert',
        title: `🎯 ALERT IN YOUR AREA`,
        message: `${data.alert.title} (${data.distance.toFixed(1)}km away)`,
        severity: data.alert.severity,
        timestamp: new Date(),
        alertId: data.alert._id
      };
      
      addNotification(notification);
      playNotificationSound(data.alert.severity, true);
    });

    // Listen for response updates
    socket.on('emergency:response_update', (data) => {
      const notification: Notification = {
        id: `response-${data.alertId}-${Date.now()}`,
        type: 'response',
        title: '📊 Community Response Update',
        message: `New response recorded for emergency alert`,
        severity: 'low',
        timestamp: new Date(),
        alertId: data.alertId
      };
      
      addNotification(notification);
    });

    // Listen for coordination updates
    socket.on('emergency:coordination_update', (data) => {
      const notification: Notification = {
        id: `coord-${data.alertId}-${Date.now()}`,
        type: 'coordination',
        title: '🤝 Emergency Coordination Update',
        message: 'New coordination information available',
        severity: 'medium',
        timestamp: new Date(),
        alertId: data.alertId
      };
      
      addNotification(notification);
    });

    // Listen for alert cancellations
    socket.on('emergency:alert_cancelled', (data) => {
      const notification: Notification = {
        id: `cancelled-${data.alertId}-${Date.now()}`,
        type: 'alert',
        title: '✅ Alert Cancelled',
        message: `Emergency alert cancelled: ${data.reason}`,
        severity: 'low',
        timestamp: new Date(),
        alertId: data.alertId
      };
      
      addNotification(notification);
    });

    return () => {
      socket.off('emergency:alert');
      socket.off('emergency:targeted_alert');
      socket.off('emergency:response_update');
      socket.off('emergency:coordination_update');
      socket.off('emergency:alert_cancelled');
    };
  }, [socket]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Auto-remove after 10 seconds for low priority, 30 seconds for others
    const timeout = notification.severity === 'low' ? 10000 : 30000;
    setTimeout(() => {
      removeNotification(notification.id);
    }, timeout);

    // Request notification permission and show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.alertId || notification.id
      });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const playNotificationSound = (severity: string, isTargeted: boolean = false) => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      
      // Different sounds for different severity levels
      switch (severity) {
        case 'critical':
          // High-pitched urgent beeping
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          break;
        case 'high':
          // Medium-pitched alert
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          break;
        default:
          // Gentle notification sound
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      }
      
      audio.volume = isTargeted ? 0.8 : 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 border-red-700';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-blue-500 border-blue-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return '🚨';
      case 'response': return '📊';
      case 'coordination': return '🤝';
      default: return '📢';
    }
  };

  return (
    <>
      {/* Notification Permission Request */}
      {'Notification' in window && Notification.permission === 'default' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4"
        >
          <div className="flex items-center justify-between">
            <p>🔔 Enable browser notifications for emergency alerts</p>
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
          </div>
        </motion.div>
      )}

      {/* Sound Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🔔 Live Notifications</h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">🔊 Sound alerts</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.slice(0, 5).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`${getSeverityColor(notification.severity)} text-white p-4 rounded-lg shadow-lg border-l-4 cursor-pointer`}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-sm opacity-90">{notification.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="text-white hover:text-gray-200 ml-2"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notification History (in main content area) */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Recent Notifications</h4>
            <button
              onClick={() => setNotifications([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded text-sm"
              >
                <span>{getTypeIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyNotifications;