import React, { useState } from 'react';
import { VoiceCommandRouter } from './VoiceCommandRouter';
import { useGeolocation } from '@/hooks/useGeolocation';

/**
 * Example component demonstrating Voice Command Router integration
 * 
 * This shows how to integrate the voice command system into your app
 */
export const VoiceCommandIntegrationExample: React.FC = () => {
    const [notifications, setNotifications] = useState<Array<{ message: string; type: string; id: number }>>([]);
    const { coordinates } = useGeolocation({ immediate: true });

    const handleNotification = (message: string, type: string = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { message, type, id }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                        Voice Command Integration
                    </h1>
                    <p className="text-xl text-gray-300">
                        Control the entire app with your voice
                    </p>
                </div>

                {/* Voice Command Router */}
                <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Voice Interface</h2>
                    <p className="text-gray-300 mb-6">
                        Click the microphone to start, then speak any command. Say "help" to see all available commands.
                    </p>

                    <div className="flex justify-center">
                        <VoiceCommandRouter
                            {...(coordinates && {
                                currentLocation: {
                                    lat: coordinates.latitude,
                                    lon: coordinates.longitude
                                }
                            })}
                            onNotification={handleNotification}
                        />
                    </div>
                </div>

                {/* Quick Command Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <CommandCard
                        title="🚨 Emergency"
                        commands={[
                            'report emergency',
                            'check alerts',
                            'emergency'
                        ]}
                        color="from-red-500 to-orange-500"
                    />
                    <CommandCard
                        title="💼 Gig Board"
                        commands={[
                            'post a job for farm help',
                            'search jobs for agriculture',
                            'show my jobs'
                        ]}
                        color="from-purple-500 to-pink-500"
                    />
                    <CommandCard
                        title="🗺️ Services"
                        commands={[
                            'find health services',
                            'show nearby hospitals',
                            'open service navigator'
                        ]}
                        color="from-blue-500 to-cyan-500"
                    />
                    <CommandCard
                        title="🧭 Navigation"
                        commands={[
                            'go home',
                            'go to profile',
                            'check notifications'
                        ]}
                        color="from-green-500 to-teal-500"
                    />
                    <CommandCard
                        title="🔄 Workflows"
                        commands={[
                            'Start post job workflow',
                            'Start report emergency workflow',
                            'Start find service workflow'
                        ]}
                        color="from-yellow-500 to-orange-500"
                    />
                    <CommandCard
                        title="❓ Help"
                        commands={[
                            'help',
                            'what can I do',
                            'voice commands'
                        ]}
                        color="from-indigo-500 to-purple-500"
                    />
                </div>

                {/* Features */}
                <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureItem
                            icon="🎤"
                            title="Natural Language"
                            description="Speak naturally - the system understands various phrasings"
                        />
                        <FeatureItem
                            icon="✅"
                            title="Smart Confirmation"
                            description="Critical actions require confirmation for safety"
                        />
                        <FeatureItem
                            icon="🔄"
                            title="Multi-Step Workflows"
                            description="Guided workflows with context retention"
                        />
                        <FeatureItem
                            icon="🎯"
                            title="Context Aware"
                            description="Commands adapt based on your current location"
                        />
                        <FeatureItem
                            icon="🔊"
                            title="Voice Feedback"
                            description="Audio responses confirm every action"
                        />
                        <FeatureItem
                            icon="📱"
                            title="Mobile Friendly"
                            description="Works on mobile devices with voice support"
                        />
                    </div>
                </div>

                {/* Integration Code Example */}
                <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Integration Example</h2>
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm">
                        {`import { VoiceCommandRouter } from '@/components/voice/VoiceCommandRouter';

function MyApp() {
  const handleNotification = (message, type) => {
    // Show notification to user
    console.log(\`[\${type}] \${message}\`);
  };

  return (
    <VoiceCommandRouter
      currentLocation={{ lat: -37.8136, lon: 144.9631 }}
      onNotification={handleNotification}
    />
  );
}`}
                    </pre>
                </div>
            </div>

            {/* Notification Toast */}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`${getNotificationColor(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in-right max-w-md`}
                    >
                        <p className="font-medium">{notification.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper Components
interface CommandCardProps {
    title: string;
    commands: string[];
    color: string;
}

const CommandCard: React.FC<CommandCardProps> = ({ title, commands, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
        <h3 className={`text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}>
            {title}
        </h3>
        <ul className="space-y-2">
            {commands.map((command, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-purple-400 mt-1">💬</span>
                    <code className="bg-gray-900/50 px-2 py-1 rounded">"{command}"</code>
                </li>
            ))}
        </ul>
    </div>
);

interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </div>
);
