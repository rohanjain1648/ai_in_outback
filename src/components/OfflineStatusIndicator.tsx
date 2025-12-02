import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import syncManager from '../services/syncManager';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
}

interface OfflineStatusIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
  onStatusClick?: () => void;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  position = 'top-right',
  showDetails = false,
  onStatusClick
}) => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    failedItems: 0
  });
  
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initialize status
    syncManager.getStatus().then(setStatus);
    
    // Listen for status changes
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };
    
    syncManager.addListener(handleStatusChange);
    
    return () => {
      syncManager.removeListener(handleStatusChange);
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500';
    if (status.isSyncing) return 'bg-yellow-500';
    if (status.pendingItems > 0) return 'bg-orange-500';
    if (status.failedItems > 0) return 'bg-red-400';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.isSyncing) return 'Syncing...';
    if (status.pendingItems > 0) return `${status.pendingItems} pending`;
    if (status.failedItems > 0) return `${status.failedItems} failed`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return '📴';
    if (status.isSyncing) return '🔄';
    if (status.pendingItems > 0) return '⏳';
    if (status.failedItems > 0) return '⚠️';
    return '✅';
  };

  const handleIndicatorClick = () => {
    if (onStatusClick) {
      onStatusClick();
    } else {
      setShowDetailPanel(!showDetailPanel);
    }
  };

  const handleForceSync = async () => {
    try {
      await syncManager.forcSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const formatLastSyncTime = (time: Date | null) => {
    if (!time) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {/* Main Status Indicator */}
      <motion.div
        className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 ${getStatusColor()} text-white`}
        onClick={handleIndicatorClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        <motion.span
          className="text-sm"
          animate={{ rotate: status.isSyncing ? 360 : 0 }}
          transition={{ duration: 1, repeat: status.isSyncing ? Infinity : 0, ease: "linear" }}
        >
          {getStatusIcon()}
        </motion.span>
        
        <AnimatePresence>
          {(isExpanded || showDetails) && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="text-xs font-medium whitespace-nowrap overflow-hidden"
            >
              {getStatusText()}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border min-w-64 overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="mr-2">{getStatusIcon()}</span>
                Connection Status
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              {/* Connection Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  status.isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Sync Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sync:</span>
                <span className={`text-sm font-medium ${
                  status.isSyncing ? 'text-yellow-600' : 'text-gray-900'
                }`}>
                  {status.isSyncing ? 'In Progress' : 'Idle'}
                </span>
              </div>

              {/* Last Sync Time */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-900">
                  {formatLastSyncTime(status.lastSyncTime)}
                </span>
              </div>

              {/* Pending Items */}
              {status.pendingItems > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="text-sm text-orange-600 font-medium">
                    {status.pendingItems} items
                  </span>
                </div>
              )}

              {/* Failed Items */}
              {status.failedItems > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Failed:</span>
                  <span className="text-sm text-red-600 font-medium">
                    {status.failedItems} items
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t space-y-2">
                {status.isOnline && (
                  <button
                    onClick={handleForceSync}
                    disabled={status.isSyncing}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {status.isSyncing ? 'Syncing...' : 'Force Sync'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowDetailPanel(false)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Offline Message */}
            {!status.isOnline && (
              <div className="p-4 bg-red-50 border-t">
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      You're currently offline
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Your data will be saved locally and synced when connection is restored.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Items Warning */}
            {status.pendingItems > 0 && status.isOnline && (
              <div className="p-4 bg-orange-50 border-t">
                <div className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-0.5">⏳</span>
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {status.pendingItems} items waiting to sync
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      These will be synchronized automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact version for mobile or minimal UI
export const CompactOfflineIndicator: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    failedItems: 0
  });

  useEffect(() => {
    syncManager.getStatus().then(setStatus);
    
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };
    
    syncManager.addListener(handleStatusChange);
    
    return () => {
      syncManager.removeListener(handleStatusChange);
    };
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (status.isSyncing) return 'text-yellow-500';
    if (status.pendingItems > 0) return 'text-orange-500';
    if (status.failedItems > 0) return 'text-red-400';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return '📴';
    if (status.isSyncing) return '🔄';
    if (status.pendingItems > 0) return '⏳';
    if (status.failedItems > 0) return '⚠️';
    return '✅';
  };

  return (
    <motion.div
      className={`flex items-center space-x-1 ${className}`}
      animate={{ rotate: status.isSyncing ? 360 : 0 }}
      transition={{ duration: 1, repeat: status.isSyncing ? Infinity : 0, ease: "linear" }}
    >
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
      </span>
      {status.pendingItems > 0 && (
        <span className="text-xs text-orange-600 font-medium">
          {status.pendingItems}
        </span>
      )}
    </motion.div>
  );
};