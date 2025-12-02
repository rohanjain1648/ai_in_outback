import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDeviceDetection } from '../../utils/mobileDetection';
import TouchButton from './TouchButton';

interface OfflineData {
  id: string;
  type: 'emergency' | 'community' | 'agricultural' | 'business' | 'cultural';
  title: string;
  data: any;
  timestamp: Date;
  size: number; // in bytes
  priority: 'high' | 'medium' | 'low';
  synced: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingUploads: number;
  pendingDownloads: number;
  lastSyncTime?: Date;
  syncProgress: number; // 0-100
  error?: string;
}

interface MobileOfflineManagerProps {
  onDataSync?: (data: OfflineData[]) => void;
  onSyncComplete?: () => void;
  maxStorageSize?: number; // in MB
  autoSync?: boolean;
  priorityTypes?: string[];
}

const MobileOfflineManager: React.FC<MobileOfflineManagerProps> = ({
  onDataSync,
  onSyncComplete,
  maxStorageSize = 50, // 50MB default
  autoSync = true,
  priorityTypes = ['emergency', 'agricultural']
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingUploads: 0,
    pendingDownloads: 0,
    syncProgress: 0
  });
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [storageUsage, setStorageUsage] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const deviceInfo = useDeviceDetection();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: undefined }));
      if (autoSync) {
        syncData();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Load offline data on mount
  useEffect(() => {
    loadOfflineData();
    calculateStorageUsage();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (syncStatus.isOnline && autoSync && offlineData.some(d => !d.synced)) {
      syncData();
    }
  }, [syncStatus.isOnline, autoSync, offlineData]);

  const loadOfflineData = async () => {
    try {
      // Load from IndexedDB
      const db = await openOfflineDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const data = await store.getAll();
      
      setOfflineData(data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const saveOfflineData = async (data: OfflineData) => {
    try {
      // Check storage limits
      const dataSize = JSON.stringify(data).length;
      if (storageUsage + dataSize > maxStorageSize * 1024 * 1024) {
        await cleanupOldData();
      }

      const db = await openOfflineDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await store.put(data);
      
      setOfflineData(prev => [...prev.filter(d => d.id !== data.id), data]);
      calculateStorageUsage();
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const syncData = async () => {
    if (syncStatus.isSyncing || !syncStatus.isOnline) return;

    setSyncStatus(prev => ({ 
      ...prev, 
      isSyncing: true, 
      syncProgress: 0,
      error: undefined 
    }));

    try {
      const unsyncedData = offlineData.filter(d => !d.synced);
      const totalItems = unsyncedData.length;
      
      if (totalItems === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      // Sort by priority
      const sortedData = unsyncedData.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      let syncedCount = 0;

      for (const data of sortedData) {
        try {
          // Simulate API call based on data type
          await syncDataItem(data);
          
          // Mark as synced
          data.synced = true;
          await saveOfflineData(data);
          
          syncedCount++;
          setSyncStatus(prev => ({ 
            ...prev, 
            syncProgress: Math.round((syncedCount / totalItems) * 100)
          }));
        } catch (error) {
          console.error(`Failed to sync item ${data.id}:`, error);
          // Continue with other items
        }
      }

      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingUploads: offlineData.filter(d => !d.synced).length
      }));

      onSyncComplete?.();
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: 'Sync failed. Please try again.'
      }));
    }
  };

  const syncDataItem = async (data: OfflineData): Promise<void> => {
    // Simulate different API endpoints based on data type
    const endpoints = {
      emergency: '/api/v1/emergency/reports',
      community: '/api/v1/community/posts',
      agricultural: '/api/v1/agriculture/data',
      business: '/api/v1/business/updates',
      cultural: '/api/v1/culture/stories'
    };

    const endpoint = endpoints[data.type] || '/api/v1/sync';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data.data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  const cleanupOldData = async () => {
    // Remove old, synced data to free up space
    const sortedData = offlineData
      .filter(d => d.synced)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const toRemove = sortedData.slice(0, Math.ceil(sortedData.length * 0.3)); // Remove 30%

    const db = await openOfflineDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');

    for (const item of toRemove) {
      await store.delete(item.id);
    }

    setOfflineData(prev => prev.filter(d => !toRemove.some(r => r.id === d.id)));
  };

  const calculateStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        setStorageUsage(used);
      } else {
        // Fallback: estimate based on data size
        const dataSize = offlineData.reduce((total, item) => {
          return total + JSON.stringify(item).length;
        }, 0);
        setStorageUsage(dataSize);
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }
  };

  const openOfflineDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RuralConnectOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <Upload className="w-4 h-4 animate-spin" />;
    }
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    if (offlineData.some(d => !d.synced)) {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return `Syncing... ${syncStatus.syncProgress}%`;
    }
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    if (syncStatus.error) {
      return 'Sync Error';
    }
    const pendingCount = offlineData.filter(d => !d.synced).length;
    if (pendingCount > 0) {
      return `${pendingCount} pending`;
    }
    return 'All synced';
  };

  // Mobile-optimized status indicator
  if (deviceInfo.isMobile && !showDetails) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <TouchButton
          onClick={() => setShowDetails(true)}
          variant="ghost"
          size="sm"
          className="bg-white shadow-lg border border-gray-200 rounded-full"
          icon={getStatusIcon()}
        />
      </div>
    );
  }

  return (
    <div className={`${deviceInfo.isMobile ? 'fixed inset-x-4 bottom-4 z-50' : 'relative'}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-900">
              {getStatusText()}
            </span>
          </div>
          
          {deviceInfo.isMobile && (
            <TouchButton
              onClick={() => setShowDetails(false)}
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
            />
          )}
        </div>

        {/* Sync progress */}
        {syncStatus.isSyncing && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncStatus.syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Storage usage */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Storage Used</span>
            <span>{formatStorageSize(storageUsage)} / {maxStorageSize}MB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${Math.min((storageUsage / (maxStorageSize * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <TouchButton
            onClick={syncData}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            loading={syncStatus.isSyncing}
            variant="primary"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
          >
            Sync Now
          </TouchButton>
          
          <TouchButton
            onClick={loadOfflineData}
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Refresh
          </TouchButton>
        </div>

        {/* Error message */}
        {syncStatus.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {syncStatus.error}
          </div>
        )}

        {/* Last sync time */}
        {syncStatus.lastSyncTime && (
          <div className="mt-2 text-xs text-gray-500">
            Last synced: {syncStatus.lastSyncTime.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for saving data offline
export const useOfflineData = () => {
  const saveForOffline = async (
    type: OfflineData['type'],
    title: string,
    data: any,
    priority: OfflineData['priority'] = 'medium'
  ) => {
    const offlineData: OfflineData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      data,
      timestamp: new Date(),
      size: JSON.stringify(data).length,
      priority,
      synced: false
    };

    // Save to IndexedDB
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('RuralConnectOffline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    await store.put(offlineData);

    return offlineData.id;
  };

  return { saveForOffline };
};

export default MobileOfflineManager;