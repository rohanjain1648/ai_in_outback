import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import AvatarDisplay from '../avatar/AvatarDisplay';

export interface EtherealNotificationData {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'emergency';
    timestamp: Date;
    avatar?: string;
    priority?: number;
    actions?: {
        label: string;
        onClick: () => void;
    }[];
}

interface EtherealNotificationProps {
    notification: EtherealNotificationData;
    onDismiss: (id: string) => void;
    index: number;
}

const EtherealNotification: React.FC<EtherealNotificationProps> = ({
    notification,
    onDismiss,
    index
}) => {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Trigger haptic feedback on supported devices
        if ('vibrate' in navigator && notification.type === 'emergency') {
            navigator.vibrate([200, 100, 200]);
        } else if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }, [notification.type]);

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'success':
                return {
                    bg: 'from-green-500/20 via-emerald-500/10 to-green-500/5',
                    border: 'border-green-400/50',
                    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
                    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
                    pulse: 'animate-pulse-slow'
                };
            case 'warning':
                return {
                    bg: 'from-yellow-500/20 via-amber-500/10 to-yellow-500/5',
                    border: 'border-yellow-400/50',
                    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]',
                    icon: <AlertCircle className="w-6 h-6 text-yellow-400" />,
                    pulse: 'animate-pulse-slow'
                };
            case 'emergency':
                return {
                    bg: 'from-red-600/30 via-red-500/20 to-red-600/10',
                    border: 'border-red-500/70',
                    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.6)]',
                    icon: <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />,
                    pulse: 'animate-pulse'
                };
            default:
                return {
                    bg: 'from-blue-500/20 via-cyan-500/10 to-blue-500/5',
                    border: 'border-blue-400/50',
                    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
                    icon: <Info className="w-6 h-6 text-blue-400" />,
                    pulse: 'animate-pulse-slow'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                y: index * 10
            }}
            exit={{
                opacity: 0,
                x: 300,
                scale: 0.8,
                transition: { duration: 0.2 }
            }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
            className={`
        relative w-96 mb-4
        bg-gradient-to-br ${styles.bg}
        backdrop-blur-xl
        border ${styles.border}
        rounded-2xl
        ${styles.glow}
        overflow-hidden
        ethereal-notification
      `}
            style={{
                zIndex: 1000 - index
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Holographic overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

            {/* Animated border glow */}
            <motion.div
                className={`absolute inset-0 rounded-2xl ${styles.pulse}`}
                style={{
                    background: `linear-gradient(45deg, transparent, ${notification.type === 'emergency' ? 'rgba(239,68,68,0.3)' :
                        notification.type === 'success' ? 'rgba(34,197,94,0.3)' :
                            notification.type === 'warning' ? 'rgba(251,191,36,0.3)' :
                                'rgba(59,130,246,0.3)'
                        }, transparent)`,
                    filter: 'blur(10px)',
                    opacity: isHovered ? 0.8 : 0.4
                }}
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Content */}
            <div className="relative p-4">
                <div className="flex items-start space-x-3">
                    {/* Icon with pulse effect */}
                    <motion.div
                        animate={{
                            scale: notification.type === 'emergency' ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                            duration: 1,
                            repeat: notification.type === 'emergency' ? Infinity : 0
                        }}
                    >
                        {styles.icon}
                    </motion.div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1 drop-shadow-lg">
                            {notification.title}
                        </h4>
                        <p className="text-white/90 text-xs leading-relaxed drop-shadow">
                            {notification.message}
                        </p>

                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-3">
                                {notification.actions.map((action, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            action.onClick();
                                            onDismiss(notification.id);
                                        }}
                                        className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      ${notification.type === 'emergency'
                                                ? 'bg-red-500/80 hover:bg-red-500 text-white'
                                                : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                                            }
                      transition-colors
                    `}
                                    >
                                        {action.label}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Avatar if provided */}
                    {notification.avatar && (
                        <AvatarDisplay
                            avatarUrl={notification.avatar}
                            size="md"
                            showGlow={true}
                            alt="Spirit Avatar"
                        />
                    )}

                    {/* Close button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDismiss(notification.id)}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Timestamp */}
                <div className="mt-2 text-white/50 text-xs">
                    {formatTimestamp(notification.timestamp)}
                </div>
            </div>

            {/* Particle effect overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/40 rounded-full"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: '100%',
                            opacity: 0
                        }}
                        animate={{
                            y: '-10%',
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
};

export default EtherealNotification;
