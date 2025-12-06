import React, { useState } from 'react';
import { VoiceInterface } from './VoiceInterface';
import { CommandResult } from '@/types/voice';

export const VoiceDemo: React.FC = () => {
    const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
    const [lastTranscript, setLastTranscript] = useState<string>('');

    const handleCommand = (result: CommandResult) => {
        console.log('Voice command received:', result);
        setCommandHistory(prev => [result, ...prev].slice(0, 10));

        // Route commands to appropriate actions
        switch (result.command) {
            case 'search':
                console.log('Executing search:', result.parameters?.['query']);
                break;
            case 'navigate':
                console.log('Navigating to:', result.parameters?.['query']);
                break;
            case 'post':
                console.log('Creating post:', result.parameters?.['query']);
                break;
            case 'home':
                console.log('Going to home');
                break;
            case 'profile':
                console.log('Opening profile');
                break;
            case 'notifications':
                console.log('Opening notifications');
                break;
            case 'emergency':
                console.log('Opening emergency services');
                break;
            case 'help':
                console.log('Showing help');
                break;
            default:
                console.log('Unknown command');
        }
    };

    const handleTranscript = (transcript: string) => {
        setLastTranscript(transcript);
    };

    const handleError = (error: string) => {
        console.error('Voice error:', error);
    };

    return (
        <div className="voice-demo p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Voice Interface Demo</h1>

            <div className="mb-8">
                <VoiceInterface
                    onCommand={handleCommand}
                    onTranscript={handleTranscript}
                    onError={handleError}
                    showVisualIndicator={true}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Last transcript */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-3">Last Transcript</h2>
                    <p className="text-gray-700">
                        {lastTranscript || 'No transcript yet...'}
                    </p>
                </div>

                {/* Command history */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-3">Command History</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {commandHistory.length === 0 ? (
                            <p className="text-gray-500">No commands yet...</p>
                        ) : (
                            commandHistory.map((cmd, index) => (
                                <div
                                    key={index}
                                    className="p-2 bg-gray-50 rounded border border-gray-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-blue-600">
                                            {cmd.command}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {(cmd.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    {cmd.parameters?.query && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {String(cmd.parameters.query)}
                                        </p>
                                    )}
                                    {cmd.needsConfirmation && (
                                        <span className="text-xs text-orange-600">
                                            Needs confirmation
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Available commands */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-3">Available Commands</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium mb-2">Search</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>"Search for resources"</li>
                            <li>"Find farmers near me"</li>
                            <li>"Show me skills"</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Navigate</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>"Go to dashboard"</li>
                            <li>"Open profile"</li>
                            <li>"Navigate to home"</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Post</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>"Post a job"</li>
                            <li>"Create a resource"</li>
                            <li>"Add a skill"</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Quick Actions</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>"Home"</li>
                            <li>"Profile"</li>
                            <li>"Notifications"</li>
                            <li>"Emergency"</li>
                            <li>"Help"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
