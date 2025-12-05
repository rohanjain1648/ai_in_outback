import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Users } from 'lucide-react';
import AvatarGenerator from './AvatarGenerator';
import AvatarGallery from './AvatarGallery';
import AvatarDisplay from './AvatarDisplay';
import { useAuth } from '../../hooks/useAuth';

const AvatarDemo: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'generator' | 'gallery' | 'display'>('generator');
    const [demoAvatarUrl, setDemoAvatarUrl] = useState<string | undefined>(undefined);

    const tabs = [
        { id: 'generator', label: 'Generate', icon: Sparkles },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'display', label: 'Display', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-3 mb-4"
                    >
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold text-white">Spirit Avatar System</h1>
                        <Sparkles className="w-8 h-8 text-pink-400" />
                    </motion.div>
                    <p className="text-gray-300 text-lg">
                        AI-powered avatar generation with geometric fallback patterns
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm border border-purple-500/30">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                    px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2
                    ${activeTab === tab.id
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'generator' && (
                        <div className="max-w-2xl mx-auto">
                            <AvatarGenerator
                                onAvatarGenerated={(url) => {
                                    setDemoAvatarUrl(url);
                                    setActiveTab('display');
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/30">
                            {user ? (
                                <AvatarGallery
                                    onAvatarSelected={(avatar) => {
                                        setDemoAvatarUrl(avatar.imageUrl);
                                        setActiveTab('display');
                                    }}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-400">Please log in to view your avatar gallery</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'display' && (
                        <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                                Avatar Display Examples
                            </h2>

                            <div className="space-y-8">
                                {/* Size Variations */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Size Variations</h3>
                                    <div className="flex items-end space-x-6 justify-center">
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="sm" />
                                            <p className="text-xs text-gray-400 mt-2">Small</p>
                                        </div>
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="md" />
                                            <p className="text-xs text-gray-400 mt-2">Medium</p>
                                        </div>
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="lg" />
                                            <p className="text-xs text-gray-400 mt-2">Large</p>
                                        </div>
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="xl" />
                                            <p className="text-xs text-gray-400 mt-2">Extra Large</p>
                                        </div>
                                    </div>
                                </div>

                                {/* With/Without Glow */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Glow Effect</h3>
                                    <div className="flex items-center space-x-8 justify-center">
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="lg" showGlow={true} />
                                            <p className="text-xs text-gray-400 mt-2">With Glow</p>
                                        </div>
                                        <div className="text-center">
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="lg" showGlow={false} />
                                            <p className="text-xs text-gray-400 mt-2">Without Glow</p>
                                        </div>
                                    </div>
                                </div>

                                {/* In Notification Context */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-4">
                                        In Notification Context
                                    </h3>
                                    <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-500/5 backdrop-blur-xl border border-blue-400/50 rounded-2xl p-4 max-w-md mx-auto">
                                        <div className="flex items-start space-x-3">
                                            <div className="text-blue-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-semibold text-sm mb-1">
                                                    New Community Connection
                                                </h4>
                                                <p className="text-white/90 text-xs">
                                                    Someone nearby shares your interests in sustainable farming
                                                </p>
                                            </div>
                                            <AvatarDisplay avatarUrl={demoAvatarUrl} size="md" showGlow={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!demoAvatarUrl && (
                                <div className="text-center mt-8">
                                    <p className="text-gray-400 mb-4">
                                        Generate or select an avatar to see it displayed here
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('generator')}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Generate Avatar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Features List */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/30">
                        <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">AI Generation</h3>
                        <p className="text-gray-400 text-sm">
                            Powered by OpenAI DALL-E for unique, personalized spirit avatars based on your
                            profile
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/30">
                        <ImageIcon className="w-8 h-8 text-pink-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Geometric Fallback</h3>
                        <p className="text-gray-400 text-sm">
                            Beautiful geometric patterns generated locally when AI is unavailable
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/30">
                        <Users className="w-8 h-8 text-blue-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Smart Caching</h3>
                        <p className="text-gray-400 text-sm">
                            Avatars are cached to reduce API calls and improve performance
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarDemo;
