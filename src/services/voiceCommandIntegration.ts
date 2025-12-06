import { CommandResult } from '@/types/voice';
import { useNavigate } from 'react-router-dom';

/**
 * Voice Command Integration Service
 * Provides centralized voice command routing and execution for all features
 */

export interface VoiceCommandContext {
    navigate: (path: string) => void;
    showNotification?: (message: string, type?: string) => void;
    currentLocation?: { lat: number; lon: number };
}

export interface VoiceCommandHandler {
    pattern: RegExp;
    handler: (match: RegExpMatchArray, context: VoiceCommandContext) => Promise<void> | void;
    description: string;
    examples: string[];
    requiresConfirmation?: boolean;
}

// Gig Board Voice Commands
export const gigBoardCommands: VoiceCommandHandler[] = [
    {
        pattern: /(?:post|create|add)\s+(?:a\s+)?(?:job|gig)\s+(?:for\s+)?(.+)/i,
        handler: (match, context) => {
            const jobDescription = match[1];
            context.navigate('/gigs/create');
            context.showNotification?.(`Creating job: ${jobDescription}`, 'info');
        },
        description: 'Post a new job',
        examples: ['post a job for farm help', 'create a gig for transport'],
        requiresConfirmation: true
    },
    {
        pattern: /(?:search|find|look\s+for)\s+(?:jobs?|gigs?)\s+(?:for\s+)?(.+)/i,
        handler: (match, context) => {
            const query = match[1];
            context.navigate(`/gigs?search=${encodeURIComponent(query)}`);
            context.showNotification?.(`Searching for jobs: ${query}`, 'info');
        },
        description: 'Search for jobs',
        examples: ['search jobs for agriculture', 'find gigs for construction']
    },
    {
        pattern: /(?:apply|apply\s+for|apply\s+to)\s+(?:job|gig)/i,
        handler: (match, context) => {
            // This would need job context from the current view
            context.showNotification?.('Please select a job to apply', 'info');
        },
        description: 'Apply to a job',
        examples: ['apply to job', 'apply for this gig']
    },
    {
        pattern: /(?:show|view|open)\s+(?:my\s+)?(?:jobs|gigs|applications)/i,
        handler: (match, context) => {
            context.navigate('/gigs/my-gigs');
            context.showNotification?.('Opening your gigs', 'info');
        },
        description: 'View your jobs and applications',
        examples: ['show my jobs', 'view my gigs', 'open my applications']
    }
];

// Service Navigator Voice Commands
export const serviceNavigatorCommands: VoiceCommandHandler[] = [
    {
        pattern: /(?:find|search\s+for|locate)\s+(?:a\s+)?(.+?)\s+(?:service|services)/i,
        handler: (match, context) => {
            const serviceType = match[1];
            context.navigate(`/services?search=${encodeURIComponent(serviceType)}`);
            context.showNotification?.(`Searching for ${serviceType} services`, 'info');
        },
        description: 'Find services',
        examples: ['find health services', 'search for transport services', 'locate medical services']
    },
    {
        pattern: /(?:call|contact|phone)\s+(.+?)\s+service/i,
        handler: (match, context) => {
            const serviceName = match[1];
            context.showNotification?.(`Looking up contact for ${serviceName}`, 'info');
            // This would need service context to actually make the call
        },
        description: 'Call a service',
        examples: ['call health service', 'contact transport service']
    },
    {
        pattern: /(?:show|find)\s+(?:nearby|closest|nearest)\s+(.+)/i,
        handler: (match, context) => {
            const serviceType = match[1];
            if (context.currentLocation) {
                context.navigate(`/services?search=${encodeURIComponent(serviceType)}&nearby=true`);
                context.showNotification?.(`Finding nearest ${serviceType}`, 'info');
            } else {
                context.showNotification?.('Location access needed to find nearby services', 'warning');
            }
        },
        description: 'Find nearby services',
        examples: ['show nearby hospitals', 'find closest pharmacy', 'nearest police station']
    },
    {
        pattern: /(?:open|show|view)\s+service\s+(?:navigator|directory)/i,
        handler: (match, context) => {
            context.navigate('/services');
            context.showNotification?.('Opening service navigator', 'info');
        },
        description: 'Open service navigator',
        examples: ['open service navigator', 'show service directory']
    }
];

// Emergency Alert Voice Commands
export const emergencyCommands: VoiceCommandHandler[] = [
    {
        pattern: /(?:report|create|submit)\s+(?:an?\s+)?emergency/i,
        handler: (match, context) => {
            context.navigate('/emergency?action=report');
            context.showNotification?.('Opening emergency report form', 'warning');
        },
        description: 'Report an emergency',
        examples: ['report emergency', 'create an emergency alert'],
        requiresConfirmation: true
    },
    {
        pattern: /(?:check|show|view)\s+(?:emergency\s+)?alerts?/i,
        handler: (match, context) => {
            context.navigate('/emergency');
            context.showNotification?.('Showing emergency alerts', 'info');
        },
        description: 'Check emergency alerts',
        examples: ['check alerts', 'show emergency alerts', 'view alerts']
    },
    {
        pattern: /(?:emergency|help|urgent|sos)/i,
        handler: (match, context) => {
            context.navigate('/emergency');
            context.showNotification?.('Opening emergency dashboard', 'error');
        },
        description: 'Access emergency services',
        examples: ['emergency', 'help', 'urgent', 'SOS'],
        requiresConfirmation: false // No confirmation for emergencies
    }
];

// Navigation Voice Commands
export const navigationCommands: VoiceCommandHandler[] = [
    {
        pattern: /(?:go|navigate|take\s+me)\s+(?:to\s+)?(?:home|dashboard|main)/i,
        handler: (match, context) => {
            context.navigate('/dashboard');
            context.showNotification?.('Going to home', 'info');
        },
        description: 'Go to home page',
        examples: ['go home', 'navigate to dashboard', 'take me to main']
    },
    {
        pattern: /(?:go|navigate|open|show)\s+(?:to\s+)?(?:my\s+)?profile/i,
        handler: (match, context) => {
            context.navigate('/profile');
            context.showNotification?.('Opening your profile', 'info');
        },
        description: 'View profile',
        examples: ['go to profile', 'show my profile', 'open profile']
    },
    {
        pattern: /(?:check|show|view|open)\s+(?:my\s+)?notifications?/i,
        handler: (match, context) => {
            context.navigate('/notifications');
            context.showNotification?.('Showing notifications', 'info');
        },
        description: 'View notifications',
        examples: ['check notifications', 'show my notifications', 'view notifications']
    },
    {
        pattern: /(?:go|navigate|open)\s+(?:to\s+)?(.+)/i,
        handler: (match, context) => {
            const destination = match[1]?.toLowerCase();
            const routes: Record<string, string> = {
                'community': '/community',
                'skills': '/skills',
                'resources': '/resources',
                'map': '/map',
                'chat': '/chat',
                'wellbeing': '/wellbeing',
                'agricultural': '/agricultural',
                'business': '/business',
                'cultural': '/cultural',
                'learning': '/learning'
            };

            const route = routes[destination];
            if (route) {
                context.navigate(route);
                context.showNotification?.(`Opening ${destination}`, 'info');
            } else {
                context.showNotification?.(`Unknown destination: ${destination}`, 'warning');
            }
        },
        description: 'Navigate to a page',
        examples: ['go to community', 'open skills', 'navigate to resources']
    }
];

// Help Command
export const helpCommands: VoiceCommandHandler[] = [
    {
        pattern: /(?:help|what\s+can\s+(?:i|you)\s+do|commands|voice\s+commands)/i,
        handler: (match, context) => {
            // This will be handled by the component to show help modal
            context.showNotification?.('Showing available voice commands', 'info');
        },
        description: 'Show available commands',
        examples: ['help', 'what can I do', 'voice commands']
    }
];

// All commands combined
export const allVoiceCommands: VoiceCommandHandler[] = [
    ...emergencyCommands, // Emergency first (highest priority)
    ...gigBoardCommands,
    ...serviceNavigatorCommands,
    ...navigationCommands,
    ...helpCommands
];

/**
 * Process a voice command and execute the appropriate handler
 */
export const processVoiceCommand = async (
    transcript: string,
    context: VoiceCommandContext
): Promise<{
    success: boolean;
    command?: VoiceCommandHandler;
    message: string;
    needsConfirmation?: boolean;
}> => {
    const normalizedTranscript = transcript.trim();

    // Try to match against all command patterns
    for (const command of allVoiceCommands) {
        const match = normalizedTranscript.match(command.pattern);
        if (match) {
            // Check if confirmation is needed
            if (command.requiresConfirmation) {
                return {
                    success: false,
                    command,
                    message: `Confirm: ${command.description}?`,
                    needsConfirmation: true
                };
            }

            // Execute the command
            try {
                await command.handler(match, context);
                return {
                    success: true,
                    command,
                    message: `Executed: ${command.description}`
                };
            } catch (error) {
                return {
                    success: false,
                    message: `Error executing command: ${error}`
                };
            }
        }
    }

    // No matching command found
    return {
        success: false,
        message: 'Command not recognized. Say "help" to see available commands.'
    };
};

/**
 * Get all available commands grouped by category
 */
export const getCommandsByCategory = () => {
    return {
        'Emergency': emergencyCommands,
        'Gig Board': gigBoardCommands,
        'Service Navigator': serviceNavigatorCommands,
        'Navigation': navigationCommands,
        'Help': helpCommands
    };
};

/**
 * Generate natural language response for a command result
 */
export const generateCommandResponse = (result: CommandResult, transcript: string): string => {
    if (result.command === 'emergency') {
        return 'Opening emergency services. Stay safe.';
    }

    if (result.command === 'help') {
        return 'Here are the available voice commands: You can search for jobs, find services, report emergencies, navigate to different pages, and more. Say a command to get started.';
    }

    if (result.needsConfirmation) {
        return `I heard: ${transcript}. Please confirm this action.`;
    }

    if (result.confidence < 0.5) {
        return `I'm not sure I understood. Did you say: ${transcript}? Try saying "help" for available commands.`;
    }

    return `Processing: ${transcript}`;
};

/**
 * Multi-step workflow context manager
 */
export class VoiceWorkflowManager {
    private currentWorkflow: {
        type: string;
        step: number;
        data: Record<string, any>;
    } | null = null;

    startWorkflow(type: string, initialData: Record<string, any> = {}) {
        this.currentWorkflow = {
            type,
            step: 0,
            data: initialData
        };
    }

    getCurrentWorkflow() {
        return this.currentWorkflow;
    }

    updateWorkflowData(data: Record<string, any>) {
        if (this.currentWorkflow) {
            this.currentWorkflow.data = {
                ...this.currentWorkflow.data,
                ...data
            };
        }
    }

    nextStep() {
        if (this.currentWorkflow) {
            this.currentWorkflow.step++;
        }
    }

    completeWorkflow() {
        const workflow = this.currentWorkflow;
        this.currentWorkflow = null;
        return workflow;
    }

    cancelWorkflow() {
        this.currentWorkflow = null;
    }

    isInWorkflow(): boolean {
        return this.currentWorkflow !== null;
    }
}

// Workflow definitions
export const workflows = {
    postJob: {
        steps: [
            { prompt: 'What type of job do you want to post?', field: 'category' },
            { prompt: 'What is the job title?', field: 'title' },
            { prompt: 'Describe the job', field: 'description' },
            { prompt: 'What is the payment amount?', field: 'payment' },
            { prompt: 'How many hours will it take?', field: 'hours' }
        ]
    },
    reportEmergency: {
        steps: [
            { prompt: 'What type of emergency is this?', field: 'type' },
            { prompt: 'Describe the emergency', field: 'description' },
            { prompt: 'What is the severity? Say low, medium, high, or critical', field: 'severity' }
        ]
    },
    findService: {
        steps: [
            { prompt: 'What type of service are you looking for?', field: 'serviceType' },
            { prompt: 'Do you want to search nearby or in a specific location?', field: 'location' }
        ]
    }
};
