import { socketService } from './socketService';

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

type NotificationCallback = (notification: InAppNotification) => void;

class NotificationService {
  private notifications: InAppNotification[] = [];
  private listeners: NotificationCallback[] = [];
  private pushSubscription: PushSubscription | null = null;
  private preferences: NotificationPreferences | null = null;

  constructor() {
    this.initializeServiceWorker();
    this.setupSocketListeners();
    this.loadPreferences();
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Check for existing subscription
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        this.pushSubscription = subscription;
        this.syncPushSubscription();
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private setupSocketListeners(): void {
    socketService.on('notification', (notification: any) => {
      this.addNotification({
        id: notification.id || `notif_${Date.now()}`,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        timestamp: new Date(notification.timestamp || Date.now()),
        read: false,
        data: notification.data,
        actions: notification.actions?.map((action: any) => ({
          ...action,
          handler: () => this.handleNotificationAction(action.action, notification.data)
        }))
      });
    });

    socketService.on('emergency_alert', (alert: any) => {
      this.addNotification({
        id: `emergency_${alert.id}`,
        title: '🚨 Emergency Alert',
        message: alert.message,
        type: 'emergency',
        timestamp: new Date(alert.timestamp || Date.now()),
        read: false,
        data: { type: 'emergency', alertId: alert.id },
        actions: [
          {
            action: 'acknowledge',
            title: 'Acknowledge',
            handler: () => this.acknowledgeEmergencyAlert(alert.id)
          },
          {
            action: 'safe',
            title: 'I\'m Safe',
            handler: () => this.updateSafetyStatus(alert.id, 'safe')
          },
          {
            action: 'need_help',
            title: 'Need Help',
            handler: () => this.updateSafetyStatus(alert.id, 'need_help')
          }
        ]
      });
    });
  }

  private async loadPreferences(): Promise<void> {
    try {
      const response = await fetch('/api/v1/chat/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.preferences = data.data;
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Public methods
  public async requestPermission(): Promise<boolean> {
    const permission = await socketService.requestNotificationPermission();
    return permission === 'granted';
  }

  public async subscribeToPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key not configured');
          return false;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      this.pushSubscription = subscription;
      await this.syncPushSubscription();
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.pushSubscription) return true;

    try {
      await this.pushSubscription.unsubscribe();
      this.pushSubscription = null;
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  private async syncPushSubscription(): Promise<void> {
    if (!this.pushSubscription) return;

    try {
      socketService.subscribeToPushNotifications(this.pushSubscription.toJSON());
    } catch (error) {
      console.error('Failed to sync push subscription:', error);
    }
  }

  public addNotification(notification: InAppNotification): void {
    // Check if notification should be shown based on preferences
    if (!this.shouldShowNotification(notification)) {
      return;
    }

    this.notifications.unshift(notification);
    
    // Limit to 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.notifyListeners(notification);
    this.saveToLocalStorage();
  }

  public getNotifications(): InAppNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToLocalStorage();
  }

  public removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToLocalStorage();
  }

  public clearAll(): void {
    this.notifications = [];
    this.saveToLocalStorage();
  }

  public onNotification(callback: NotificationCallback): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/chat/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        const data = await response.json();
        this.preferences = data.data;
        
        // Sync with socket service
        socketService.updateNotificationPreferences(this.preferences);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  public getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  // Private helper methods
  private shouldShowNotification(notification: InAppNotification): boolean {
    if (!this.preferences) return true;

    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= this.preferences.quietHours.start && currentTime <= this.preferences.quietHours.end) {
        // Allow emergency alerts during quiet hours
        return notification.type === 'emergency';
      }
    }

    // Check category preferences
    switch (notification.type) {
      case 'emergency':
        return this.preferences.emergencyAlerts;
      default:
        return true;
    }
  }

  private notifyListeners(notification: InAppNotification): void {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 50))); // Save only recent 50
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        const notifications = JSON.parse(saved);
        this.notifications = notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
    }
  }

  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'acknowledge':
        if (data?.alertId) {
          this.acknowledgeEmergencyAlert(data.alertId);
        }
        break;
      case 'view':
        // Handle view action based on notification type
        console.log('View notification:', data);
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  private acknowledgeEmergencyAlert(alertId: string): void {
    socketService.acknowledgeEmergencyAlert(alertId);
  }

  private updateSafetyStatus(alertId: string, status: 'safe' | 'need_help'): void {
    socketService.updateSafetyStatus(alertId, status);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();
export default notificationService;