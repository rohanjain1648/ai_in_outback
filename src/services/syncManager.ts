// Sync Manager for handling online/offline synchronization
import offlineStorage from './offlineStorage';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
}

interface SyncEventListener {
  (status: SyncStatus): void;
}

class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: SyncEventListener[] = [];
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeEventListeners();
    this.startPeriodicSync();
  }

  /**
   * Initialize online/offline event listeners
   */
  private initializeEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for visibility change to sync when app becomes visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    console.log('SyncManager: Device came online');
    this.isOnline = true;
    this.notifyListeners();
    
    // Start syncing after a short delay to ensure connection is stable
    setTimeout(() => {
      this.syncAll();
    }, 1000);
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('SyncManager: Device went offline');
    this.isOnline = false;
    this.isSyncing = false;
    this.notifyListeners();
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (!document.hidden && this.isOnline) {
      // App became visible and we're online, sync data
      this.syncAll();
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      this.lastSyncTime = new Date();
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending data
   */
  async syncAll(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    console.log('SyncManager: Starting sync...');
    this.isSyncing = true;
    this.notifyListeners();

    try {
      // Process sync queue from offline storage
      await offlineStorage.processSyncQueue();
      
      // Sync specific data types
      await this.syncWellbeingData();
      await this.syncCommunityData();
      await this.syncEmergencyData();
      await this.syncAgricultureData();
      
      this.lastSyncTime = new Date();
      console.log('SyncManager: Sync completed successfully');
      
    } catch (error) {
      console.error('SyncManager: Sync failed:', error);
      this.scheduleRetry();
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync wellbeing data
   */
  private async syncWellbeingData(): Promise<void> {
    try {
      const wellbeingData = await offlineStorage.getData('wellbeing') as any[];
      const unsyncedData = Array.isArray(wellbeingData) 
        ? wellbeingData.filter(item => !item.synced)
        : [];

      for (const item of unsyncedData) {
        try {
          const response = await fetch('/api/wellbeing/checkin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            // Mark as synced
            item.synced = true;
            await offlineStorage.storeData('wellbeing', item);
          }
        } catch (error) {
          console.error('Failed to sync wellbeing item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync wellbeing data:', error);
    }
  }

  /**
   * Sync community data
   */
  private async syncCommunityData(): Promise<void> {
    try {
      const communityData = await offlineStorage.getData('community') as any[];
      const unsyncedData = Array.isArray(communityData) 
        ? communityData.filter(item => !item.synced)
        : [];

      for (const item of unsyncedData) {
        try {
          const response = await fetch('/api/community/members', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            item.synced = true;
            await offlineStorage.storeData('community', item);
          }
        } catch (error) {
          console.error('Failed to sync community item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync community data:', error);
    }
  }

  /**
   * Sync emergency data
   */
  private async syncEmergencyData(): Promise<void> {
    try {
      const emergencyData = await offlineStorage.getData('emergency') as any[];
      const unsyncedData = Array.isArray(emergencyData) 
        ? emergencyData.filter(item => !item.synced)
        : [];

      for (const item of unsyncedData) {
        try {
          const response = await fetch('/api/emergency/alerts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            item.synced = true;
            await offlineStorage.storeData('emergency', item);
          }
        } catch (error) {
          console.error('Failed to sync emergency item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync emergency data:', error);
    }
  }

  /**
   * Sync agriculture data
   */
  private async syncAgricultureData(): Promise<void> {
    try {
      const agricultureData = await offlineStorage.getData('agriculture') as any[];
      const unsyncedData = Array.isArray(agricultureData) 
        ? agricultureData.filter(item => !item.synced)
        : [];

      for (const item of unsyncedData) {
        try {
          const response = await fetch('/api/agriculture/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            item.synced = true;
            await offlineStorage.storeData('agriculture', item);
          }
        } catch (error) {
          console.error('Failed to sync agriculture item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync agriculture data:', error);
    }
  }

  /**
   * Schedule retry after failed sync
   */
  private scheduleRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Exponential backoff: retry after 30 seconds, then 1 minute, then 2 minutes, etc.
    const retryDelay = Math.min(30000 * Math.pow(2, this.getRetryCount()), 300000); // Max 5 minutes
    
    this.retryTimeout = setTimeout(() => {
      if (this.isOnline) {
        this.syncAll();
      }
    }, retryDelay);
  }

  /**
   * Get retry count (simplified implementation)
   */
  private getRetryCount(): number {
    // In a real implementation, this would track actual retry attempts
    return 0;
  }

  /**
   * Add sync status listener
   */
  addListener(listener: SyncEventListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  removeListener(listener: SyncEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners(): Promise<void> {
    const stats = await offlineStorage.getStorageStats();
    const status: SyncStatus = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingItems: stats.unsyncedItems + stats.queuedItems,
      failedItems: stats.conflicts
    };

    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync status listener:', error);
      }
    });
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const stats = await offlineStorage.getStorageStats();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingItems: stats.unsyncedItems + stats.queuedItems,
      failedItems: stats.conflicts
    };
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncAll();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    await offlineStorage.clearAllData();
    this.notifyListeners();
  }

  /**
   * Destroy sync manager
   */
  destroy(): void {
    this.stopPeriodicSync();
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    this.listeners = [];
  }
}

export default new SyncManager();