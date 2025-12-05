import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Info,
    AlertCircle,
    Archive
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

interface HistoryNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
    timestamp: Date;
    read: boolean;
    data?: any;
}

const EtherealNotificationHistory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<HistoryNotification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();

        const unsubscribe = notificationService.onNotification(() => {
            loadNotifications();
        });

        return unsubscribe;
    }, []);

    const loadNotifications = () => {
        const allNotifications = notificationService.getNotifications();
        setNotifications(allNotifications as HistoryNotification[]);
        setUnreadCount(notificationService.getUnreadCount());
    };

    const getFilteredNotifications = () => {
        switch (filter) {
            case 'unread':
                return notifications.filter(n => !n.read);
            case 'emergency':
                return notifications.filter(n => n.type === 'emergency');
            default:
                return notifications;
        }
    };

    const handleMarkAsRead = (id: string) => {
        notificationService.markAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        notificationService.markAllAsRead();
        loadNotifications();
    };

    const handleDelete = (id: string) => {
        notificationService.removeNotification(id);
        loadNotifications();
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            notificationService.clearAll();
            loadNotifications();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            case 'emergency':
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            case 'error':
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default:
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'from-green-500/20 to-green-500/5 border-green-400/30';
            case 'warning':
                return 'from-yellow-500/20 to-yellow-500/5 border-yellow-400/30';
            case 'emergency':
                return 'from-red-600/30 to-red-600/10 border-red-500/50';
            case 'error':
                return 'from-red-500/20 to-red-500/5 border-red-400/30';
            default:
                return 'from-blue-500/20 to-blue-500/5 border-blue-400/30';
        }
    };

    const formatTimestamp = (timestamp: Date): string => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return timestamp.toLocaleDateString();
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <>
            {/* Bell Icon Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* History Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-[9999] overflow-hidden"
                        >
                            {/* Holographic overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />

                            {/* Header */}
                            <div className="relative border-b border-white/10 p-4 backdrop-blur-xl bg-black/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Bell className="w-6 h-6 text-blue-400" />
                                        <h2 className="text-xl font-bold text-white">Notifications</h2>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.button>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex space-x-2">
                                    {(['all', 'unread', 'emergency'] as const).map((filterType) => (
                                        <motion.button
                                            key={filterType}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setFilter(filterType)}
                                            className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${filter === filterType
                                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                                }
                      `}
                                        >
                                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 mt-3">
                                    {unreadCount > 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-xs font-medium border border-green-400/30 transition-colors"
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Mark all read</span>
                                        </motion.button>
                                    )}
                                    {notifications.length > 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleClearAll}
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium border border-red-400/30 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Clear all</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="relative h-[calc(100%-180px)] overflow-y-auto">
                                {filteredNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <Archive className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="text-lg">No notifications</p>
                                        <p className="text-sm mt-1">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredNotifications.map((notification, index) => (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`
                            relative p-4 rounded-xl border backdrop-blur-xl
                            bg-gradient-to-br ${getTypeColor(notification.type)}
                            ${!notification.read ? 'shadow-lg' : 'opacity-75'}
                            hover:opacity-100 transition-all
                          `}
                                                >
                                                    {/* Unread indicator */}
                                                    {!notification.read && (
                                                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                                    )}

                                                    <div className="flex items-start space-x-3">
                                                        {getIcon(notification.type)}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-semibold text-sm mb-1">
                                                                {notification.title}
                                                            </h4>
                                                            <p className="text-white/80 text-xs leading-relaxed">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-white/50 text-xs mt-2">
                                                                {formatTimestamp(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex space-x-2 mt-3">
                                                        {!notification.read && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors"
                                                            >
                                                                Mark read
                                                            </motion.button>
                                                        )}
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors"
                                                        >
                                                            Delete
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default EtherealNotificationHistory;
