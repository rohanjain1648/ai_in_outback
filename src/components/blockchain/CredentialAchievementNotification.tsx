import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockchainCredential } from '../../types/blockchain';
import { CredentialBadge } from './CredentialBadge';

interface CredentialAchievementNotificationProps {
    credential: BlockchainCredential;
    onClose: () => void;
    autoCloseDelay?: number;
}

export const CredentialAchievementNotification: React.FC<
    CredentialAchievementNotificationProps
> = ({ credential, onClose, autoCloseDelay = 8000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Auto-close after delay
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500); // Wait for exit animation
        }, autoCloseDelay);

        return () => clearTimeout(timer);
    }, [autoCloseDelay, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 500);
    };

    // Confetti particles
    const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 50,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
    }));

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Confetti Animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {confettiParticles.map((particle) => (
                                <motion.div
                                    key={particle.id}
                                    initial={{
                                        x: '50%',
                                        y: '50%',
                                        opacity: 1,
                                        rotate: 0,
                                        scale: particle.scale,
                                    }}
                                    animate={{
                                        x: `calc(50% + ${particle.x}vw)`,
                                        y: `calc(50% + ${particle.y}vh)`,
                                        opacity: 0,
                                        rotate: particle.rotation,
                                    }}
                                    transition={{
                                        duration: 2,
                                        ease: 'easeOut',
                                        delay: Math.random() * 0.3,
                                    }}
                                    className="absolute w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: particle.color }}
                                />
                            ))}
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-transparent to-blue-200 opacity-30 animate-pulse" />

                        {/* Content */}
                        <div className="relative p-8">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>

                            {/* Achievement Header */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="text-center mb-6"
                            >
                                <div className="text-6xl mb-2">🎉</div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                    Achievement Unlocked!
                                </h2>
                                <p className="text-gray-600">You've earned a new credential</p>
                            </motion.div>

                            {/* Credential Badge */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="relative">
                                    <CredentialBadge credential={credential} size="large" />
                                    {/* Shine effect */}
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '200%' }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            repeatDelay: 2,
                                        }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                        style={{ transform: 'skewX(-20deg)' }}
                                    />
                                </div>
                            </motion.div>

                            {/* Credential Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-center space-y-3"
                            >
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {credential.metadata.title}
                                </h3>
                                <p className="text-gray-600">{credential.metadata.description}</p>

                                {/* Blockchain Badge */}
                                {credential.status === 'minted' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8, type: 'spring' }}
                                        className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold"
                                    >
                                        <span>✓</span>
                                        <span>Verified on Blockchain</span>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="mt-8 flex gap-3"
                            >
                                <button
                                    onClick={() => {
                                        window.location.href = '/profile';
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                                >
                                    View in Profile
                                </button>
                                <button
                                    onClick={() => {
                                        const shareLink = window.location.origin + `/credentials/${credential._id}`;
                                        navigator.clipboard.writeText(shareLink);
                                        alert('Share link copied to clipboard!');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                                >
                                    Share
                                </button>
                            </motion.div>
                        </div>

                        {/* Bottom Sparkle Effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 animate-pulse" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
