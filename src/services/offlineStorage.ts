// Offline Storage Service using IndexedDB
// Provides offline-first data architecture with conflict resolution

interface StoredData {
  id: string;
  data: any;
  timestamp: number;
  version: number;
  synced: boolean;
  deleted?: boolean;
}

interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolver?: (clientData: any, serverData: any) => any;
}

class OfflineStorageService {
  private dbName = 'rural-connect-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Store names
  private stores = {
    wellbeing: 'wellbeing_data',
    community: 'community_data',
    emergency: 'emergency_data',
    agriculture: 'agriculture_data',
    resources: 'resources_data',
    users: 'users_data',
    syncQueue: 'sync_queue',
    conflicts: 'conflicts'
  };

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  /**
   * Create object stores
   */
  private createStores(db: IDBDatabase): void {
    // Wellbeing data store
    if (!db.objectStoreNames.contains(this.stores.wellbeing)) {
      const wellbeingStore = db.createObjectStore(this.stores.wellbeing, { keyPath: 'id' });
      wellbeingStore.createIndex('timestamp', 'timestamp', { unique: false });
      wellbeingStore.createIndex('synced', 'synced', { unique: false });
    }

    // Community data store
    if (!db.objectStoreNames.contains(this.stores.community)) {
      const communityStore = db.createObjectStore(this.stores.community, { keyPath: 'id' });
      communityStore.createIndex('timestamp', 'timestamp', { unique: false });
      communityStore.createIndex('synced', 'synced', { unique: false });
    }

    // Emergency data store
    if (!db.objectStoreNames.contains(this.stores.emergency)) {
      const emergencyStore = db.createObjectStore(this.stores.emergency, { keyPath: 'id' });
      emergencyStore.createIndex('timestamp', 'timestamp', { unique: false });
      emergencyStore.createIndex('priority', 'priority', { unique: false });
    }

    // Agriculture data store
    if (!db.objectStoreNames.contains(this.stores.agriculture)) {
      const agricultureStore = db.createObjectStore(this.stores.agriculture, { keyPath: 'id' });
      agricultureStore.createIndex('timestamp', 'timestamp', { unique: false });
      agricultureStore.createIndex('synced', 'synced', { unique: false });
    }

    // Resources data store
    if (!db.objectStoreNames.contains(this.stores.resources)) {
      const resourcesStore = db.createObjectStore(this.stores.resources, { keyPath: 'id' });
      resourcesStore.createIndex('category', 'category', { unique: false });
      resourcesStore.createIndex('location', 'location', { unique: false });
    }

    // Users data store
    if (!db.objectStoreNames.contains(this.stores.users)) {
      const usersStore = db.createObjectStore(this.stores.users, { keyPath: 'id' });
      usersStore.createIndex('lastSeen', 'lastSeen', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
      const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id', autoIncrement: true });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('retryCount', 'retryCount', { unique: false });
    }

    // Conflicts store
    if (!db.objectStoreNames.contains(this.stores.conflicts)) {
      const conflictsStore = db.createObjectStore(this.stores.conflicts, { keyPath: 'id' });
      conflictsStore.createIndex('timestamp', 'timestamp', { unique: false });
      conflictsStore.createIndex('resolved', 'resolved', { unique: false });
    }
  }

  /**
   * Store data offline
   */
  async storeData(storeName: keyof typeof this.stores, data: any): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores[storeName]], 'readwrite');
      const store = transaction.objectStore(this.stores[storeName]);

      const storedData: StoredData = {
        id: data.id || this.generateId(),
        data,
        timestamp: Date.now(),
        version: data.version || 1,
        synced: false
      };

      const request = store.put(storedData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve data from offline storage
   */
  async getData(storeName: keyof typeof this.stores, id?: string): Promise<StoredData | StoredData[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores[storeName]], 'readonly');
      const store = transaction.objectStore(this.stores[storeName]);

      if (id) {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(url: string, method: string, headers: Record<string, string>, body?: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);

      const queueItem: SyncQueueItem = {
        url,
        method,
        headers,
        body,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Process sync queue when online
   */
  async processSyncQueue(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const queueItems = await this.getSyncQueue();
    
    for (const item of queueItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });

        if (response.ok) {
          // Remove from queue on success
          await this.removeFromSyncQueue(item.id!);
        } else {
          // Increment retry count
          await this.updateSyncQueueItem(item.id!, { retryCount: item.retryCount + 1 });
        }
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        
        if (item.retryCount >= item.maxRetries) {
          // Remove failed items after max retries
          await this.removeFromSyncQueue(item.id!);
        } else {
          await this.updateSyncQueueItem(item.id!, { retryCount: item.retryCount + 1 });
        }
      }
    }
  }

  /**
   * Get sync queue items
   */
  private async getSyncQueue(): Promise<SyncQueueItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readonly');
      const store = transaction.objectStore(this.stores.syncQueue);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from sync queue
   */
  private async removeFromSyncQueue(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update sync queue item
   */
  private async updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          Object.assign(item, updates);
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Handle data conflicts
   */
  async resolveConflict(
    storeName: keyof typeof this.stores,
    clientData: any,
    serverData: any,
    resolution: ConflictResolution
  ): Promise<any> {
    switch (resolution.strategy) {
      case 'client-wins':
        return clientData;
      
      case 'server-wins':
        return serverData;
      
      case 'merge':
        return { ...serverData, ...clientData };
      
      case 'manual':
        if (resolution.resolver) {
          return resolution.resolver(clientData, serverData);
        }
        // Store conflict for manual resolution
        await this.storeConflict(storeName, clientData, serverData);
        return null;
      
      default:
        return serverData;
    }
  }

  /**
   * Store conflict for manual resolution
   */
  private async storeConflict(storeName: keyof typeof this.stores, clientData: any, serverData: any): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.conflicts], 'readwrite');
      const store = transaction.objectStore(this.stores.conflicts);

      const conflict = {
        id: this.generateId(),
        storeName,
        clientData,
        serverData,
        timestamp: Date.now(),
        resolved: false
      };

      const request = store.add(conflict);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const storeNames = Object.values(this.stores);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      let completed = 0;

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length) {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalItems: number;
    unsyncedItems: number;
    queuedItems: number;
    conflicts: number;
    estimatedSize: number;
  }> {
    if (!this.db) {
      await this.initDB();
    }

    let totalItems = 0;
    let unsyncedItems = 0;
    let queuedItems = 0;
    let conflicts = 0;

    // Count items in each store
    for (const storeName of Object.keys(this.stores) as Array<keyof typeof this.stores>) {
      if (storeName === 'syncQueue') {
        const items = await this.getData(storeName) as SyncQueueItem[];
        queuedItems = items.length;
      } else if (storeName === 'conflicts') {
        const items = await this.getData(storeName) as any[];
        conflicts = items.filter(item => !item.resolved).length;
      } else {
        const items = await this.getData(storeName) as StoredData[];
        totalItems += items.length;
        unsyncedItems += items.filter(item => !item.synced).length;
      }
    }

    // Estimate storage size (rough calculation)
    const estimatedSize = await this.estimateStorageSize();

    return {
      totalItems,
      unsyncedItems,
      queuedItems,
      conflicts,
      estimatedSize
    };
  }

  /**
   * Estimate storage size
   */
  private async estimateStorageSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }
}

export default new OfflineStorageService();