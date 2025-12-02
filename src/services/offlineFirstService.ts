// Offline-First Service
// Provides a unified interface for offline-first data operations

import offlineStorage from './offlineStorage';
import syncManager from './syncManager';

interface OfflineFirstOptions {
  cacheFirst?: boolean;
  syncOnWrite?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'manual';
}

class OfflineFirstService {
  private defaultOptions: OfflineFirstOptions = {
    cacheFirst: true,
    syncOnWrite: true,
    conflictResolution: 'server-wins'
  };

  /**
   * Fetch data with offline-first strategy
   */
  async fetchData<T>(
    url: string,
    storeName: keyof typeof offlineStorage['stores'],
    options: OfflineFirstOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      if (opts.cacheFirst) {
        // Try cache first
        const cachedData = await this.getCachedData<T>(storeName, url);
        if (cachedData) {
          // Fetch fresh data in background if online
          if (navigator.onLine) {
            this.fetchAndCache(url, storeName).catch(console.error);
          }
          return cachedData;
        }
      }

      // Fetch from network
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the data
      await this.cacheData(storeName, url, data.data || data);
      
      return data.data || data;
    } catch (error) {
      console.error('Network fetch failed:', error);
      
      // Fallback to cache
      const cachedData = await this.getCachedData<T>(storeName, url);
      if (cachedData) {
        return cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Post data with offline-first strategy
   */
  async postData<T>(
    url: string,
    data: any,
    storeName: keyof typeof offlineStorage['stores'],
    options: OfflineFirstOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };

    // Store data locally first
    const localId = this.generateId();
    const localData = {
      id: localId,
      ...data,
      _offline: true,
      _timestamp: Date.now()
    };

    await offlineStorage.storeData(storeName, localData);

    if (navigator.onLine && opts.syncOnWrite) {
      try {
        // Try to sync immediately
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const serverData = await response.json();
          
          // Update local data with server response
          const syncedData = {
            ...localData,
            ...serverData.data || serverData,
            _offline: false,
            _synced: true
          };
          
          await offlineStorage.storeData(storeName, syncedData);
          return syncedData;
        } else {
          // Queue for later sync
          await offlineStorage.addToSyncQueue(url, 'POST', {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Immediate sync failed, queuing for later:', error);
        
        // Queue for later sync
        await offlineStorage.addToSyncQueue(url, 'POST', {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }, JSON.stringify(data));
      }
    } else {
      // Queue for sync when online
      await offlineStorage.addToSyncQueue(url, 'POST', {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }, JSON.stringify(data));
    }

    return localData;
  }

  /**
   * Update data with offline-first strategy
   */
  async updateData<T>(
    url: string,
    data: any,
    storeName: keyof typeof offlineStorage['stores'],
    options: OfflineFirstOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };

    // Update local data first
    const updatedData = {
      ...data,
      _offline: true,
      _timestamp: Date.now()
    };

    await offlineStorage.storeData(storeName, updatedData);

    if (navigator.onLine && opts.syncOnWrite) {
      try {
        // Try to sync immediately
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const serverData = await response.json();
          
          // Handle potential conflicts
          const resolvedData = await this.resolveConflict(
            storeName,
            updatedData,
            serverData.data || serverData,
            opts.conflictResolution!
          );
          
          const syncedData = {
            ...resolvedData,
            _offline: false,
            _synced: true
          };
          
          await offlineStorage.storeData(storeName, syncedData);
          return syncedData;
        } else {
          // Queue for later sync
          await offlineStorage.addToSyncQueue(url, 'PUT', {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Immediate sync failed, queuing for later:', error);
        
        // Queue for later sync
        await offlineStorage.addToSyncQueue(url, 'PUT', {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }, JSON.stringify(data));
      }
    } else {
      // Queue for sync when online
      await offlineStorage.addToSyncQueue(url, 'PUT', {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }, JSON.stringify(data));
    }

    return updatedData;
  }

  /**
   * Delete data with offline-first strategy
   */
  async deleteData(
    url: string,
    id: string,
    storeName: keyof typeof offlineStorage['stores'],
    options: OfflineFirstOptions = {}
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };

    // Mark as deleted locally
    const deletedData = {
      id,
      _deleted: true,
      _offline: true,
      _timestamp: Date.now()
    };

    await offlineStorage.storeData(storeName, deletedData);

    if (navigator.onLine && opts.syncOnWrite) {
      try {
        // Try to sync immediately
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          // Remove from local storage
          // Note: This would need to be implemented in offlineStorage
          console.log('Item deleted successfully');
        } else {
          // Queue for later sync
          await offlineStorage.addToSyncQueue(url, 'DELETE', {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          });
        }
      } catch (error) {
        console.error('Immediate delete sync failed, queuing for later:', error);
        
        // Queue for later sync
        await offlineStorage.addToSyncQueue(url, 'DELETE', {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        });
      }
    } else {
      // Queue for sync when online
      await offlineStorage.addToSyncQueue(url, 'DELETE', {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData<T>(
    storeName: keyof typeof offlineStorage['stores'],
    url: string
  ): Promise<T | null> {
    try {
      const data = await offlineStorage.getData(storeName);
      
      if (Array.isArray(data)) {
        // For list endpoints, return all non-deleted items
        const validItems = data
          .filter(item => !item.deleted && !item.data?._deleted)
          .map(item => item.data);
        
        return validItems.length > 0 ? validItems as T : null;
      } else if (data) {
        // For single item endpoints
        return data.deleted || data.data?._deleted ? null : data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Cache data
   */
  private async cacheData(
    storeName: keyof typeof offlineStorage['stores'],
    url: string,
    data: any
  ): Promise<void> {
    try {
      if (Array.isArray(data)) {
        // For arrays, store each item separately
        for (const item of data) {
          await offlineStorage.storeData(storeName, {
            ...item,
            _cached: true,
            _cacheTime: Date.now()
          });
        }
      } else {
        // For single items
        await offlineStorage.storeData(storeName, {
          ...data,
          _cached: true,
          _cacheTime: Date.now()
        });
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Fetch and cache data in background
   */
  private async fetchAndCache(
    url: string,
    storeName: keyof typeof offlineStorage['stores']
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.cacheData(storeName, url, data.data || data);
      }
    } catch (error) {
      console.error('Background fetch failed:', error);
    }
  }

  /**
   * Resolve data conflicts
   */
  private async resolveConflict(
    storeName: keyof typeof offlineStorage['stores'],
    clientData: any,
    serverData: any,
    strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual'
  ): Promise<any> {
    return await offlineStorage.resolveConflict(storeName, clientData, serverData, {
      strategy,
      resolver: strategy === 'merge' ? this.mergeData : undefined
    });
  }

  /**
   * Merge data for conflict resolution
   */
  private mergeData(clientData: any, serverData: any): any {
    // Simple merge strategy - server data takes precedence for conflicts
    // but preserve client-only fields
    const merged = { ...serverData };
    
    // Preserve client timestamps if newer
    if (clientData._timestamp && (!serverData._timestamp || clientData._timestamp > serverData._timestamp)) {
      merged._timestamp = clientData._timestamp;
    }
    
    // Preserve client-specific fields
    if (clientData._offline !== undefined) {
      merged._offline = clientData._offline;
    }
    
    return merged;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get offline status
   */
  async getOfflineStatus(): Promise<{
    isOnline: boolean;
    pendingSync: number;
    lastSync: Date | null;
    storageUsed: number;
  }> {
    const syncStatus = await syncManager.getStatus();
    const storageStats = await offlineStorage.getStorageStats();
    
    return {
      isOnline: syncStatus.isOnline,
      pendingSync: syncStatus.pendingItems,
      lastSync: syncStatus.lastSyncTime,
      storageUsed: storageStats.estimatedSize
    };
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    await offlineStorage.clearAllData();
  }

  /**
   * Force sync all data
   */
  async forceSync(): Promise<void> {
    await syncManager.forcSync();
  }
}

export default new OfflineFirstService();