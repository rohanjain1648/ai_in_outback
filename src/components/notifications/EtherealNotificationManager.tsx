import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import EtherealNotification from './EtherealNotification';
import { notificationService } from '../../services/notificationService';
import { playNotificationSound } from '../../utils/notificationSounds';

interface NotificationQueueItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'emergency';
    timestamp: Date;
    avatar?: string;
    priority: number;
    actions?: {
        label: string;
        onClick: () => void;
    }[];
}

const EtherealNotificationManager: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationQueueItem[]>([]);
    const MAX_VISIBLE = 5;

    useEffect(() => {
        // Listen for new notifications
        const unsubscribe = notificationService.onNotification((notification) => {
            const etherealNotification: NotificationQueueItem = {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type as 'info' | 'success' | 'warning' | 'emergency',
                timestamp: notification.timestamp,
                priority: getPriority(notification.type),
                ...(notification.actions && {
                    actions: notification.actions.map(action => ({
                        label: action.title,
                        onClick: action.handler
                    }))
                })
            };

            // Play sound effect based on notification type
            playNotificationSound(notification.type);

            // Add to queue with priority sorting
            setNotifications(prev => {
                const updated = [...prev, etherealNotification];
                // Sort by priority (higher first) and timestamp (newer first)
                return updated.sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return b.priority - a.priority;
                    }
                    return b.timestamp.getTime() - a.timestamp.getTime();
                }).slice(0, MAX_VISIBLE);
            });

            // Auto-dismiss non-emergency notifications after 8 seconds
            if (notification.type !== 'emergency') {
                setTimeout(() => {
                    handleDismiss(etherealNotification.id);
                }, 8000);
            }
        });

        return unsubscribe;
    }, []);

    const handleDismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getPriority = (type: string): number => {
        switch (type) {
            case 'emergency':
                return 100;
            case 'warning':
                return 75;
            case 'success':
                return 50;
            case 'info':
            default:
                return 25;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence mode="popLayout">
                    {notifications.map((notification, index) => (
                        <EtherealNotification
                            key={notification.id}
                            notification={notification}
                            onDismiss={handleDismiss}
                            index={index}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EtherealNotificationManager;
