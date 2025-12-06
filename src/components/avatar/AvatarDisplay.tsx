import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface AvatarDisplayProps {
    avatarUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showGlow?: boolean;
    className?: string;
    alt?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
    avatarUrl,
    size = 'md',
    showGlow = true,
    className = '',
    alt = 'Avatar',
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative ${sizeClasses[size]} ${className}`}
        >
            {/* Glow Effect */}
            {showGlow && (
                <div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 blur-md animate-pulse-slow"
                    style={{ zIndex: -1 }}
                />
            )}

            {/* Avatar Container */}
            <div
                className={`
          ${sizeClasses[size]} rounded-full overflow-hidden
          border-2 border-purple-500/50 shadow-lg
          bg-gradient-to-br from-slate-800 to-slate-900
        `}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to default icon on error
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                    <svg class="${iconSizes[size]} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                `;
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                        <User className={`${iconSizes[size]} text-white`} />
                    </div>
                )}
            </div>

            {/* Holographic Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        </motion.div>
    );
};

export default AvatarDisplay;
