import React, { useState } from 'react';
import { VoiceInterface } from './VoiceInterface';
import { CommandResult } from '@/types/voice';

/**
 * Example integration of VoiceInterface into the Rural Connect AI app
 * 
 * This component demonstrates how to:
 * 1. Add voice interface to your component
 * 2. Handle voice commands
 * 3. Route commands to appropriate actions
 * 4. Provide feedback to users
 */

interface VoiceIntegrationExampleProps {
    onNavigate?: (view: string) => void;
    onSearch?: (query: string) => void;
    onPost?: (content: string) => void;
}

export const VoiceIntegrationExample: React.FC<VoiceIntegrationExampleProps> = ({
    onNavigate,
    onSearch,
    onPost,
}) => {
    const [lastCommand, setLastCommand] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');

    const handleVoiceCommand = (result: CommandResult) => {
        setLastCommand(`${result.command}: ${result.parameters?.['query'] || 'N/A'}`);

        // Route commands to appropriate handlers
        switch (result.command) {
            case 'search':
                if (result.parameters?.['query']) {
                    const query = String(result.parameters['query']);
                    setFeedback(`Searching for: ${query}`);
                    onSearch?.(query);
                }
                break;

            case 'navigate':
                if (result.parameters?.['query']) {
                    const destination = String(result.parameters['query']);
                    setFeedback(`Navigating to: ${destination}`);

                    // Map voice commands to app views
                    const viewMap: Record<string, string> = {
                        'home': 'home',
                        'dashboard': 'home',
                        'agriculture': 'agriculture',
                        'farm': 'agriculture',
                        'business': 'business',
                        'directory': 'business',
                        'culture': 'culture',
                        'heritage': 'culture',
                        'wellbeing': 'wellbeing',
                        'health': 'wellbeing',
                        'chat': 'chat',
                        'messages': 'chat',
                        'admin': 'admin',
                    };

                    const view = viewMap[destination.toLowerCase()] || destination;
                    onNavigate?.(view);
                }
                break;

            case 'post':
                if (result.parameters?.['query']) {
                    const content = String(result.parameters['query']);
                    setFeedback(`Creating post: ${content}`);
                    onPost?.(content);
                }
                break;

            case 'home':
                setFeedback('Going to home');
                onNavigate?.('home');
                break;

            case 'profile':
                setFeedback('Opening profile');
                onNavigate?.('profile');
                break;

            case 'notifications':
                setFeedback('Showing notifications');
                // Handle notifications
                break;

            case 'emergency':
                setFeedback('Opening emergency services');
                onNavigate?.('emergency');
                break;

            case 'help':
                setFeedback('Showing help');
                // Show help modal or guide
                break;

            case 'unknown':
                setFeedback('Command not recognized. Try saying "help" for available commands.');
                break;

            default:
                setFeedback('Command received but not handled');
        }
    };

    const handleTranscript = (transcript: string) => {
        console.log('Voice transcript:', transcript);
    };

    const handleError = (error: string) => {
        console.error('Voice error:', error);
        setFeedback(`Error: ${error}`);
    };

    return (
        <div className="voice-integration-example">
            {/* Voice Interface Component */}
            <div className="fixed bottom-4 right-4 z-50">
                <VoiceInterface
                    onCommand={handleVoiceCommand}
                    onTranscript={handleTranscript}
                    onError={handleError}
                    showVisualIndicator={true}
                />
            </div>

            {/* Feedback Display (for demo purposes) */}
            {feedback && (
                <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-40">
                    {feedback}
                </div>
            )}

            {/* Last Command Display (for demo purposes) */}
            {lastCommand && (
                <div className="fixed top-16 right-4 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg z-40 text-sm">
                    Last: {lastCommand}
                </div>
            )}
        </div>
    );
};

/**
 * Integration Instructions:
 * 
 * 1. Add to App.tsx:
 * 
 * import { VoiceIntegrationExample } from './components/voice/VoiceIntegrationExample';
 * 
 * function App() {
 *   const [currentView, setCurrentView] = useState('home');
 *   
 *   const handleNavigate = (view: string) => {
 *     setCurrentView(view);
 *   };
 *   
 *   const handleSearch = (query: string) => {
 *     // Perform search
 *   };
 *   
 *   const handlePost = (content: string) => {
 *     // Create post
 *   };
 *   
 *   return (
 *     <div>
 *       <YourAppContent />
 *       <VoiceIntegrationExample
 *         onNavigate={handleNavigate}
 *         onSearch={handleSearch}
 *         onPost={handlePost}
 *       />
 *     </div>
 *   );
 * }
 * 
 * 2. Or use the hook directly:
 * 
 * import { useVoice } from '@/hooks/useVoice';
 * 
 * function MyComponent() {
 *   const { startListening, speak, onCommand } = useVoice();
 *   
 *   onCommand((result) => {
 *     // Handle command
 *   });
 *   
 *   return (
 *     <button onClick={startListening}>
 *       Start Voice
 *     </button>
 *   );
 * }
 */
