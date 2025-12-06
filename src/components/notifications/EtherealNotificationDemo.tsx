import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { initializeAudio } from '../../utils/notificationSounds';

const EtherealNotificationDemo: React.FC = () => {
    const [audioInitialized, setAudioInitialized] = useState(false);

    const handleInitAudio = () => {
        initializeAudio();
        setAudioInitialized(true);
    };

    const sendTestNotification = (type: 'info' | 'success' | 'warning' | 'emergency') => {
        if (!audioInitialized) {
            handleInitAudio();
        }

        const messages = {
            info: {
                title: 'New Message',
                message: 'You have a new message from the community board.'
            },
            success: {
                title: 'Success!',
                message: 'Your profile has been updated successfully.'
            },
            warning: {
                title: 'Warning',
                message: 'Your session will expire in 5 minutes.'
            },
            emergency: {
                title: '🚨 Emergency Alert',
                message: 'Severe weather warning in your area. Seek shelter immediately.'
            }
        };

        const notification = {
            id: `test_${Date.now()}`,
            title: messages[type].title,
            message: messages[type].message,
            type,
            timestamp: new Date(),
            read: false,
            actions: type === 'emergency' ? [
                {
                    action: 'acknowledge',
                    title: 'Acknowledge',
                    handler: () => console.log('Emergency acknowledged')
                },
                {
                    action: 'safe',
                    title: "I'm Safe",
                    handler: () => console.log('User marked as safe')
                }
            ] : undefined
        };

        notificationService.addNotification(notification);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center mb-4">
                        <Bell className="w-12 h-12 text-blue-400 mr-3" />
                        <h1 className="text-4xl font-bold text-white">
                            Ethereal Notifications
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">
                        Experience haunting, beautiful notifications with holographic effects
                    </p>
                </motion.div>

                {/* Audio Initialization */}
                {!audioInitialized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-xl backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <p className="text-white text-sm">
                                    Click to enable notification sounds
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleInitAudio}
                                className="px-4 py-2 bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 rounded-lg text-sm font-medium border border-yellow-400/30 transition-colors"
                            >
                                Enable Audio
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Demo Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Info Notification */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-400/30 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center mb-4">
                            <Info className="w-6 h-6 text-blue-400 mr-3" />
                            <h3 className="text-xl font-semibold text-white">Info</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Subtle, gentle notification for general information
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendTestNotification('info')}
                            className="w-full px-4 py-3 bg-blue-500/30 hover:bg-blue-500/40 text-blue-300 rounded-lg font-medium border border-blue-400/30 transition-colors"
                        >
                            Send Info Notification
                        </motion.button>
                    </motion.div>

                    {/* Success Notification */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-400/30 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                            <h3 className="text-xl font-semibold text-white">Success</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Pleasant, uplifting chime for successful actions
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendTestNotification('success')}
                            className="w-full px-4 py-3 bg-green-500/30 hover:bg-green-500/40 text-green-300 rounded-lg font-medium border border-green-400/30 transition-colors"
                        >
                            Send Success Notification
                        </motion.button>
                    </motion.div>

                    {/* Warning Notification */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-400/30 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                            <h3 className="text-xl font-semibold text-white">Warning</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Moderate alert tone for important warnings
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendTestNotification('warning')}
                            className="w-full px-4 py-3 bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 rounded-lg font-medium border border-yellow-400/30 transition-colors"
                        >
                            Send Warning Notification
                        </motion.button>
                    </motion.div>

                    {/* Emergency Notification */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 bg-gradient-to-br from-red-600/30 to-red-600/10 border border-red-500/50 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-400 mr-3 animate-pulse" />
                            <h3 className="text-xl font-semibold text-white">Emergency</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Urgent, attention-grabbing alarm with haptic feedback
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendTestNotification('emergency')}
                            className="w-full px-4 py-3 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded-lg font-medium border border-red-400/30 transition-colors"
                        >
                            Send Emergency Alert
                        </motion.button>
                    </motion.div>
                </div>

                {/* Features List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
                >
                    <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
                    <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Holographic glow effects with CSS filters and animations</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Framer Motion animations for smooth transitions</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Priority-based notification queue management</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Web Audio API integration for contextual sounds</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Haptic feedback on supported mobile devices</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Notification history and management panel</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Auto-dismiss with configurable timeouts</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-400 mr-2">✓</span>
                            <span>Spirit avatar support for personalized notifications</span>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default EtherealNotificationDemo;
