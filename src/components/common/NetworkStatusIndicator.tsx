import React, { useEffect, useState } from 'react';

interface NetworkStatus {
    isOnline: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

interface NetworkStatusIndicatorProps {
    showWhenOnline?: boolean;
    position?: 'top' | 'bottom';
    className?: string;
}

/**
 * Network Status Indicator Component
 * Shows online/offline status and connection quality
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
    showWhenOnline = false,
    position = 'top',
    className = ''
}) => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: navigator.onLine
    });
    const [showIndicator, setShowIndicator] = useState(false);
    const [justCameOnline, setJustCameOnline] = useState(false);

    useEffect(() => {
        const updateNetworkStatus = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection;

            setNetworkStatus({
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink,
                rtt: connection?.rtt,
                saveData: connection?.saveData
            });
        };

        const handleOnline = () => {
            updateNetworkStatus();
            setJustCameOnline(true);
            setShowIndicator(true);

            // Hide "back online" message after 5 seconds
            setTimeout(() => {
                setJustCameOnline(false);
                if (showWhenOnline) {
                    setShowIndicator(false);
                }
            }, 5000);
        };

        const handleOffline = () => {
            updateNetworkStatus();
            setShowIndicator(true);
        };

        const handleConnectionChange = () => {
            updateNetworkStatus();
        };

        // Initial update
        updateNetworkStatus();

        // Set initial visibility
        setShowIndicator(!navigator.onLine || showWhenOnline);

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            connection.addEventListener('change', handleConnectionChange);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            if (connection) {
                connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, [showWhenOnline]);

    const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
        if (!networkStatus.effectiveType) return 'unknown';

        switch (networkStatus.effectiveType) {
            case '4g':
                return 'excellent';
            case '3g':
                return 'good';
            case '2g':
                return 'fair';
            case 'slow-2g':
                return 'poor';
            default:
                return 'unknown';
        }
    };

    const getConnectionIcon = () => {
        if (!networkStatus.isOnline) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                    />
                </svg>
            );
        }

        const quality = getConnectionQuality();
        const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;

        return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 18h2v2H2v-2zm4-4h2v6H6v-6zm4-4h2v10h-2V10zm4-4h2v14h-2V6zm4-4h2v18h-2V2z" opacity={bars >= 1 ? 1 : 0.3} />
                <path d="M6 14h2v6H6v-6z" opacity={bars >= 2 ? 1 : 0.3} />
                <path d="M10 10h2v10h-2V10z" opacity={bars >= 3 ? 1 : 0.3} />
                <path d="M14 6h2v14h-2V6z" opacity={bars >= 4 ? 1 : 0.3} />
            </svg>
        );
    };

    const getMessage = (): string => {
        if (!networkStatus.isOnline) {
            return 'You are offline. Some features may be limited.';
        }

        if (justCameOnline) {
            return 'Back online! Syncing data...';
        }

        const quality = getConnectionQuality();
        if (quality === 'poor' || quality === 'fair') {
            return `Slow connection detected (${networkStatus.effectiveType}). Some features may be slower.`;
        }

        if (networkStatus.saveData) {
            return 'Data saver mode is active';
        }

        return 'Connected';
    };

    const getBackgroundColor = (): string => {
        if (!networkStatus.isOnline) {
            return 'bg-red-600 dark:bg-red-700';
        }

        if (justCameOnline) {
            return 'bg-green-600 dark:bg-green-700';
        }

        const quality = getConnectionQuality();
        if (quality === 'poor' || quality === 'fair') {
            return 'bg-yellow-600 dark:bg-yellow-700';
        }

        return 'bg-green-600 dark:bg-green-700';
    };

    if (!showIndicator) {
        return null;
    }

    const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';

    return (
        <div
            className={`fixed left-0 right-0 ${positionClasses} z-50 ${className}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className={`${getBackgroundColor()} text-white px-4 py-2 shadow-lg transition-all duration-300`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getConnectionIcon()}
                        <span className="text-sm font-medium">{getMessage()}</span>
                    </div>

                    {!networkStatus.isOnline && (
                        <button
                            onClick={() => setShowIndicator(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Hook to get current network status
 */
export const useNetworkStatus = (): NetworkStatus => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: navigator.onLine
    });

    useEffect(() => {
        const updateNetworkStatus = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection;

            setNetworkStatus({
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink,
                rtt: connection?.rtt,
                saveData: connection?.saveData
            });
        };

        updateNetworkStatus();

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);

            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, []);

    return networkStatus;
};

export default NetworkStatusIndicator;
