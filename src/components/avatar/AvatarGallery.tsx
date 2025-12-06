import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { avatarService } from '../../services/avatarService';
import { SpiritAvatar } from '../../types/avatar';
import { useAuth } from '../../hooks/useAuth';

interface AvatarGalleryProps {
    onAvatarSelected?: (avatar: SpiritAvatar) => void;
}

const AvatarGallery: React.FC<AvatarGalleryProps> = ({ onAvatarSelected }) => {
    const { user } = useAuth();
    const [avatars, setAvatars] = useState<SpiritAvatar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activatingId, setActivatingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadAvatars();
        }
    }, [user]);

    const loadAvatars = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const userAvatars = await avatarService.getUserAvatars(user.id);
            setAvatars(userAvatars);
        } catch (err) {
            console.error('Error loading avatars:', err);
            setError('Failed to load avatars');
        } finally {
            setLoading(false);
        }
    };

    const handleSetActive = async (avatarId: string) => {
        if (!user) return;

        setActivatingId(avatarId);
        try {
            const success = await avatarService.setActiveAvatar(user.id, avatarId);
            if (success) {
                // Update local state
                setAvatars(
                    avatars.map((avatar) => ({
                        ...avatar,
                        isActive: avatar.id === avatarId,
                    }))
                );

                const selectedAvatar = avatars.find((a) => a.id === avatarId);
                if (selectedAvatar && onAvatarSelected) {
                    onAvatarSelected(selectedAvatar);
                }
            }
        } catch (err) {
            console.error('Error setting active avatar:', err);
        } finally {
            setActivatingId(null);
        }
    };

    const handleDelete = async (avatarId: string) => {
        if (!confirm('Are you sure you want to delete this avatar?')) return;

        setDeletingId(avatarId);
        try {
            const success = await avatarService.deleteAvatar(avatarId);
            if (success) {
                setAvatars(avatars.filter((avatar) => avatar.id !== avatarId));
            }
        } catch (err) {
            console.error('Error deleting avatar:', err);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
            </div>
        );
    }

    if (avatars.length === 0) {
        return (
            <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No avatars yet. Generate your first spirit avatar!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Spirit Avatars</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {avatars.map((avatar) => (
                        <motion.div
                            key={avatar.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                        >
                            {/* Avatar Image */}
                            <div
                                className={`
                  relative aspect-square rounded-xl overflow-hidden
                  border-2 transition-all cursor-pointer
                  ${avatar.isActive
                                        ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }
                `}
                                onClick={() => handleSetActive(avatar.id)}
                            >
                                <img
                                    src={avatar.imageUrl}
                                    alt="Spirit Avatar"
                                    className="w-full h-full object-cover"
                                />

                                {/* Active Badge */}
                                {avatar.isActive && (
                                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}

                                {/* AI Generated Badge */}
                                {avatar.isAIGenerated && (
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                                        AI
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-white text-sm font-medium">
                                        {avatar.isActive ? 'Active' : 'Set as Active'}
                                    </div>
                                </div>

                                {/* Loading Overlay */}
                                {activatingId === avatar.id && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Avatar Info */}
                            <div className="mt-2 px-1">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                        {avatar.customization.style} • {avatar.customization.theme}
                                    </div>

                                    {/* Delete Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(avatar.id);
                                        }}
                                        disabled={deletingId === avatar.id}
                                        className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === avatar.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </motion.button>
                                </div>

                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(avatar.generatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AvatarGallery;
