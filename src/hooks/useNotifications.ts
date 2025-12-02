import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
  timestamp: Date;
  read: boolean;
  data?: any;
  actions?: {
    action: string;
    title: string;
    handler: () => void;
  }[];
}

interface NotificationPreferences {
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
    start: string;
    end: string;
    timezone?: string;
  };
  categories: Record<string, boolean>;
}

interface UseNotificationsReturn {
  notifications: InAppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isPermissionGranted: boolean;
  isPushSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  // Initialize notifications and check permissions
  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
    setPreferences(notificationService.getPreferences());

    // Check notification permission
    if ('Notification' in window) {
      setIsPermissionGranted(Notification.permission === 'granted');
    }

    // Check if push notifications are subscribed
    checkPushSubscription();

    // Listen for new notifications
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(notificationService.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  const checkPushSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsPushSubscribed(!!subscription);
      } catch (error) {
        console.error('Failed to check push subscription:', error);
      }
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setIsPermissionGranted(granted);
    return granted;
  }, []);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.subscribeToPushNotifications();
      setIsPushSubscribed(success);
      return success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, []);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.unsubscribeFromPushNotifications();
      setIsPushSubscribed(!success);
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    notificationService.removeNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      const success = await notificationService.updatePreferences(newPreferences);
      if (success) {
        setPreferences(notificationService.getPreferences());
      }
      return success;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }, []);

  return {
    notifications,
    unreadCount,
    preferences,
    isPermissionGranted,
    isPushSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences
  };
};