import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Check, AlertTriangle } from 'lucide-react';
import { VoiceInterface } from './VoiceInterface';
import { useVoice } from '@/hooks/useVoice';
import { CommandResult } from '@/types/voice';
import {
    processVoiceCommand,
    getCommandsByCategory,
    VoiceCommandContext,
    VoiceWorkflowManager,
    workflows,
    VoiceCommandHandler
} from '@/services/voiceCommandIntegration';

interface VoiceCommandRouterProps {
    currentLocation?: { lat: number; lon: number };
    onNotification?: (message: string, type?: string) => void;
    className?: string;
}

export const VoiceCommandRouter: React.FC<VoiceCommandRouterProps> = ({
    currentLocation,
    onNotification,
    className = ''
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showHelp, setShowHelp] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingCommand, setPendingCommand] = useState<{
        transcript: string;
        command: VoiceCommandHandler;
    } | null>(null);
    const [workflowManager] = useState(() => new VoiceWorkflowManager());
    const [workflowPrompt, setWorkflowPrompt] = useState<string | null>(null);

    const { voiceState, startListening, stopListening, speak, onCommand } = useVoice();

    // Create command context
    const commandContext: VoiceCommandContext = {
        navigate,
        showNotification: onNotification,
        currentLocation
    };

    // Handle voice commands
    const handleVoiceCommand = useCallback(async (result: CommandResult) => {
        const transcript = voiceState.transcript;

        // Check if we're in a workflow
        if (workflowManager.isInWorkflow()) {
            handleWorkflowStep(transcript);
            return;
        }

        // Check for help command
        if (result.command === 'help') {
            setShowHelp(true);
            speak('Showing available voice commands');
            return;
        }

        // Process the command
        const commandResult = await processVoiceCommand(transcript, commandContext);

        if (commandResult.needsConfirmation) {
            // Show confirmation dialog
            setPendingCommand({
                transcript,
                command: commandResult.command!
            });
            setShowConfirmation(true);
            speak(`${commandResult.message}. Say yes to confirm or no to cancel.`);
        } else if (commandResult.success) {
            onNotification?.(commandResult.message, 'success');
            speak(commandResult.message);
        } else {
            onNotification?.(commandResult.message, 'error');
            speak(commandResult.message);
        }
    }, [voiceState.transcript, workflowManager, commandContext, speak, onNotification]);

    // Handle workflow steps
    const handleWorkflowStep = useCallback((transcript: string) => {
        const workflow = workflowManager.getCurrentWorkflow();
        if (!workflow) return;

        const workflowDef = workflows[workflow.type as keyof typeof workflows];
        if (!workflowDef) return;

        const currentStep = workflowDef.steps[workflow.step];
        if (!currentStep) return;

        // Store the response
        workflowManager.updateWorkflowData({
            [currentStep.field]: transcript
        });

        // Move to next step or complete
        if (workflow.step < workflowDef.steps.length - 1) {
            workflowManager.nextStep();
            const nextStep = workflowDef.steps[workflow.step + 1];
            if (nextStep) {
                setWorkflowPrompt(nextStep.prompt);
                speak(nextStep.prompt);
            }
        } else {
            // Workflow complete
            const completedWorkflow = workflowManager.completeWorkflow();
            setWorkflowPrompt(null);
            onNotification?.(`${workflow.type} workflow completed`, 'success');
            speak(`${workflow.type} completed. Submitting now.`);

            // Handle workflow completion based on type
            handleWorkflowCompletion(completedWorkflow!);
        }
    }, [workflowManager, speak, onNotification]);

    // Handle workflow completion
    const handleWorkflowCompletion = (workflow: any) => {
        switch (workflow.type) {
            case 'postJob':
                navigate('/gigs/create', { state: { voiceData: workflow.data } });
                break;
            case 'reportEmergency':
                navigate('/emergency?action=report', { state: { voiceData: workflow.data } });
                break;
            case 'findService':
                navigate(`/services?search=${encodeURIComponent(workflow.data.serviceType)}`);
                break;
        }
    };

    // Handle confirmation response
    const handleConfirmationResponse = useCallback((confirmed: boolean) => {
        if (confirmed && pendingCommand) {
            // Execute the command
            processVoiceCommand(pendingCommand.transcript, commandContext).then(result => {
                if (result.success) {
                    onNotification?.(result.message, 'success');
                    speak('Command executed');
                }
            });
        } else {
            speak('Command cancelled');
        }

        setShowConfirmation(false);
        setPendingCommand(null);
    }, [pendingCommand, commandContext, speak, onNotification]);

    // Listen for confirmation keywords when confirmation dialog is open
    useEffect(() => {
        if (showConfirmation && voiceState.transcript) {
            const transcript = voiceState.transcript.toLowerCase();
            if (transcript.includes('yes') || transcript.includes('confirm') || transcript.includes('ok')) {
                handleConfirmationResponse(true);
            } else if (transcript.includes('no') || transcript.includes('cancel') || transcript.includes('stop')) {
                handleConfirmationResponse(false);
            }
        }
    }, [voiceState.transcript, showConfirmation, handleConfirmationResponse]);

    // Register command handler
    useEffect(() => {
        onCommand(handleVoiceCommand);
    }, [onCommand, handleVoiceCommand]);

    // Start workflow
    const startWorkflow = (workflowType: keyof typeof workflows) => {
        const workflowDef = workflows[workflowType];
        if (!workflowDef) return;

        workflowManager.startWorkflow(workflowType);
        const firstStep = workflowDef.steps[0];
        if (firstStep) {
            setWorkflowPrompt(firstStep.prompt);
            speak(firstStep.prompt);
            startListening();
        }
    };

    return (
        <div className={`voice-command-router ${className}`}>
            {/* Voice Interface */}
            <VoiceInterface
                onCommand={handleVoiceCommand}
                showVisualIndicator={true}
            />

            {/* Workflow Prompt */}
            <AnimatePresence>
                {workflowPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="animate-pulse">🎤</div>
                            <p className="font-medium">{workflowPrompt}</p>
                            <button
                                onClick={() => {
                                    workflowManager.cancelWorkflow();
                                    setWorkflowPrompt(null);
                                    speak('Workflow cancelled');
                                }}
                                className="ml-4 p-1 hover:bg-blue-600 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirmation && pendingCommand && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        Confirm Action
                                    </h3>
                                    <p className="text-gray-700">
                                        {pendingCommand.command.description}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        You said: "{pendingCommand.transcript}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleConfirmationResponse(true)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                    Yes, Confirm
                                </button>
                                <button
                                    onClick={() => handleConfirmationResponse(false)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    No, Cancel
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                💡 You can also say "yes" or "no" to confirm
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <VoiceCommandHelp
                        onClose={() => setShowHelp(false)}
                        onStartWorkflow={startWorkflow}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Voice Command Help Component
interface VoiceCommandHelpProps {
    onClose: () => void;
    onStartWorkflow: (workflow: keyof typeof workflows) => void;
}

const VoiceCommandHelp: React.FC<VoiceCommandHelpProps> = ({ onClose, onStartWorkflow }) => {
    const commandsByCategory = getCommandsByCategory();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-8 h-8" />
                            <h2 className="text-2xl font-bold">Voice Commands</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="mt-2 text-purple-100">
                        Use your voice to navigate and control the app
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {Object.entries(commandsByCategory).map(([category, commands]) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                {category === 'Emergency' && '🚨'}
                                {category === 'Gig Board' && '💼'}
                                {category === 'Service Navigator' && '🗺️'}
                                {category === 'Navigation' && '🧭'}
                                {category === 'Help' && '❓'}
                                {category}
                            </h3>

                            <div className="space-y-4">
                                {commands.map((command, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium text-gray-900">
                                                {command.description}
                                            </p>
                                            {command.requiresConfirmation && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                    Requires Confirmation
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            {command.examples.map((example, exIndex) => (
                                                <div
                                                    key={exIndex}
                                                    className="flex items-center gap-2 text-sm text-gray-600"
                                                >
                                                    <span className="text-purple-500">💬</span>
                                                    <code className="bg-white px-2 py-1 rounded border border-gray-200">
                                                        "{example}"
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Multi-step Workflows */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🔄 Multi-Step Workflows
                        </h3>
                        <p className="text-gray-600 mb-4">
                            These workflows guide you through multiple steps with voice prompts:
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    onStartWorkflow('postJob');
                                    onClose();
                                }}
                                className="w-full text-left bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <p className="font-medium text-gray-900 mb-1">Post a Job</p>
                                <p className="text-sm text-gray-600">
                                    Guided workflow to create a new gig posting
                                </p>
                            </button>

                            <button
                                onClick={() => {
                                    onStartWorkflow('reportEmergency');
                                    onClose();
                                }}
                                className="w-full text-left bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <p className="font-medium text-gray-900 mb-1">Report Emergency</p>
                                <p className="text-sm text-gray-600">
                                    Guided workflow to report an emergency alert
                                </p>
                            </button>

                            <button
                                onClick={() => {
                                    onStartWorkflow('findService');
                                    onClose();
                                }}
                                className="w-full text-left bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <p className="font-medium text-gray-900 mb-1">Find Service</p>
                                <p className="text-sm text-gray-600">
                                    Guided workflow to search for services
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-900 mb-2">💡 Tips</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Speak clearly and naturally</li>
                            <li>• Wait for the voice feedback before giving the next command</li>
                            <li>• Say "help" anytime to see this guide</li>
                            <li>• Critical actions require confirmation for safety</li>
                            <li>• Emergency commands have highest priority</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                        Got it, let's go!
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
