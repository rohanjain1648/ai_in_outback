import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Palette, Wand2 } from 'lucide-react';
import { avatarService } from '../../services/avatarService';
import { AvatarStyle, AvatarTheme, AvatarCustomization } from '../../types/avatar';
import { useAuth } from '../../hooks/useAuth';

interface AvatarGeneratorProps {
    onAvatarGenerated?: (avatarUrl: string) => void;
    onClose?: () => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onAvatarGenerated, onClose }) => {
    const { user } = useAuth();
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [customization, setCustomization] = useState<AvatarCustomization>({
        style: 'ethereal',
        theme: 'light',
        colors: [],
    });

    const styles: { value: AvatarStyle; label: string; description: string }[] = [
        { value: 'ethereal', label: 'Ethereal', description: 'Ghostly, translucent with glowing edges' },
        { value: 'geometric', label: 'Geometric', description: 'Sacred geometry and symmetrical patterns' },
        { value: 'nature', label: 'Nature', description: 'Organic forms and natural elements' },
        { value: 'abstract', label: 'Abstract', description: 'Surreal and dreamlike artistic style' },
        { value: 'traditional', label: 'Traditional', description: 'Aboriginal art inspired patterns' },
    ];

    const themes: { value: AvatarTheme; label: string; colors: string[] }[] = [
        { value: 'light', label: 'Light', colors: ['#E0F2FE', '#BAE6FD', '#7DD3FC'] },
        { value: 'dark', label: 'Dark', colors: ['#1E293B', '#334155', '#475569'] },
        { value: 'earth', label: 'Earth', colors: ['#78350F', '#92400E', '#A16207'] },
        { value: 'water', label: 'Water', colors: ['#0C4A6E', '#075985', '#0369A1'] },
        { value: 'fire', label: 'Fire', colors: ['#7C2D12', '#991B1B', '#B91C1C'] },
        { value: 'air', label: 'Air', colors: ['#1E3A8A', '#1E40AF', '#2563EB'] },
    ];

    const handleGenerate = async () => {
        if (!user) {
            setError('You must be logged in to generate an avatar');
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            const response = await avatarService.generateAvatar({
                userId: user.id,
                customization,
                userProfile: {
                    interests: [],
                },
            });

            if (response.success && response.avatar) {
                setPreviewUrl(response.avatar.imageUrl);
                if (onAvatarGenerated) {
                    onAvatarGenerated(response.avatar.imageUrl);
                }
            } else {
                setError(response.error || 'Failed to generate avatar');
            }
        } catch (err) {
            console.error('Avatar generation error:', err);
            setError('An error occurred while generating your avatar');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Generate Spirit Avatar</h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Style Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Wand2 className="w-4 h-4 inline mr-2" />
                    Avatar Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {styles.map((style) => (
                        <motion.button
                            key={style.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCustomization({ ...customization, style: style.value })}
                            className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${customization.style === style.value
                                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                                }
              `}
                        >
                            <div className="font-semibold text-white text-sm">{style.label}</div>
                            <div className="text-xs text-gray-400 mt-1">{style.description}</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Color Theme
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {themes.map((theme) => (
                        <motion.button
                            key={theme.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCustomization({ ...customization, theme: theme.value })}
                            className={`
                p-3 rounded-lg border-2 transition-all
                ${customization.theme === theme.value
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                                    : 'border-gray-600 hover:border-gray-500'
                                }
              `}
                        >
                            <div className="flex space-x-1 mb-2">
                                {theme.colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="text-xs text-white font-medium">{theme.label}</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            {previewUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                >
                    <label className="block text-sm font-medium text-gray-300 mb-3">Preview</label>
                    <div className="relative w-48 h-48 mx-auto">
                        <img
                            src={previewUrl}
                            alt="Generated Avatar"
                            className="w-full h-full rounded-full object-cover border-4 border-purple-500/50 shadow-2xl shadow-purple-500/50"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Generate Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={generating}
                className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-700 hover:to-pink-700
          disabled:from-gray-600 disabled:to-gray-700
          disabled:cursor-not-allowed
          transition-all shadow-lg
          flex items-center justify-center space-x-2
        `}
            >
                {generating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Spirit Avatar...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Avatar</span>
                    </>
                )}
            </motion.button>

            <p className="text-xs text-gray-400 text-center mt-4">
                Your avatar will be personalized based on your profile and preferences
            </p>
        </div>
    );
};

export default AvatarGenerator;
