import { CommandResult, SpeechOptions, VoiceCommand, VoiceSettings } from '@/types/voice';

// Browser compatibility detection
export const checkVoiceSupport = (): {
    speechRecognition: boolean;
    speechSynthesis: boolean;
} => {
    const hasRecognition =
        'SpeechRecognition' in window ||
        'webkitSpeechRecognition' in window;

    const hasSynthesis = 'speechSynthesis' in window;

    return {
        speechRecognition: hasRecognition,
        speechSynthesis: hasSynthesis,
    };
};

// Get SpeechRecognition constructor
export const getSpeechRecognition = (): typeof SpeechRecognition | null => {
    if ('SpeechRecognition' in window) {
        return (window as Window & typeof globalThis).SpeechRecognition;
    }
    if ('webkitSpeechRecognition' in window) {
        return (window as Window & typeof globalThis).webkitSpeechRecognition;
    }
    return null;
};

// Voice command parser
export const parseVoiceCommand = (transcript: string): CommandResult => {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Command patterns
    const patterns: Record<VoiceCommand, RegExp[]> = {
        search: [
            /search\s+(?:for\s+)?(.+)/i,
            /find\s+(.+)/i,
            /look\s+(?:for\s+)?(.+)/i,
            /show\s+(?:me\s+)?(.+)/i,
        ],
        navigate: [
            /go\s+to\s+(.+)/i,
            /open\s+(.+)/i,
            /navigate\s+to\s+(.+)/i,
            /take\s+me\s+to\s+(.+)/i,
        ],
        post: [
            /post\s+(.+)/i,
            /create\s+(?:a\s+)?(.+)/i,
            /add\s+(?:a\s+)?(.+)/i,
            /new\s+(.+)/i,
        ],
        help: [
            /help/i,
            /what\s+can\s+(?:i|you)\s+do/i,
            /commands/i,
            /how\s+do\s+i/i,
        ],
        home: [
            /home/i,
            /dashboard/i,
            /main\s+page/i,
        ],
        profile: [
            /profile/i,
            /my\s+profile/i,
            /account/i,
        ],
        notifications: [
            /notifications/i,
            /alerts/i,
            /messages/i,
        ],
        emergency: [
            /emergency/i,
            /help\s+me/i,
            /urgent/i,
            /sos/i,
        ],
        unknown: [],
    };

    // Try to match patterns
    for (const [command, regexList] of Object.entries(patterns)) {
        for (const regex of regexList) {
            const match = lowerTranscript.match(regex);
            if (match) {
                const parameters: Record<string, unknown> = {};
                if (match[1]) {
                    parameters['query'] = match[1].trim();
                }

                return {
                    command: command as VoiceCommand,
                    action: command,
                    parameters,
                    confidence: 0.9,
                    needsConfirmation: command === 'post' || command === 'emergency',
                };
            }
        }
    }

    // If no pattern matched, check for keywords
    const keywords: Record<VoiceCommand, string[]> = {
        search: ['search', 'find', 'look', 'show'],
        navigate: ['go', 'open', 'navigate'],
        post: ['post', 'create', 'add', 'new'],
        help: ['help', 'commands'],
        home: ['home', 'dashboard'],
        profile: ['profile', 'account'],
        notifications: ['notification', 'alert', 'message'],
        emergency: ['emergency', 'urgent', 'sos'],
        unknown: [],
    };

    const foundCommands: VoiceCommand[] = [];
    for (const [command, words] of Object.entries(keywords)) {
        if (words.some(word => lowerTranscript.includes(word))) {
            foundCommands.push(command as VoiceCommand);
        }
    }

    if (foundCommands.length === 1) {
        return {
            command: foundCommands[0]!,
            action: foundCommands[0]!,
            parameters: { query: transcript },
            confidence: 0.6,
            needsConfirmation: true,
        };
    }

    if (foundCommands.length > 1) {
        return {
            command: 'unknown',
            action: 'clarify',
            parameters: { query: transcript },
            confidence: 0.3,
            needsConfirmation: true,
            clarificationOptions: foundCommands.map(cmd =>
                `Did you mean: ${cmd} ${transcript}?`
            ),
        };
    }

    // No match found
    return {
        command: 'unknown',
        action: 'unknown',
        parameters: { query: transcript },
        confidence: 0,
        needsConfirmation: true,
        clarificationOptions: [
            'Search for this',
            'Navigate to this',
            'Get help',
        ],
    };
};

// Text-to-speech service
export class SpeechService {
    private synth: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private settings: VoiceSettings;

    constructor(settings?: Partial<VoiceSettings>) {
        this.synth = window.speechSynthesis;
        this.settings = {
            language: 'en-AU',
            voice: null,
            pitch: 1,
            rate: 1,
            volume: 1,
            autoSpeak: true,
            ...settings,
        };

        // Load voices
        this.loadVoices();

        // Voices may load asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    private loadVoices(): void {
        this.voices = this.synth.getVoices();
    }

    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
        return this.voices.filter(voice => voice.lang.startsWith(lang));
    }

    public updateSettings(settings: Partial<VoiceSettings>): void {
        this.settings = { ...this.settings, ...settings };
    }

    public speak(text: string, options?: SpeechOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!text) {
                resolve();
                return;
            }

            // Cancel any ongoing speech
            this.synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Apply settings
            utterance.lang = options?.lang || this.settings.language;
            utterance.pitch = options?.pitch ?? this.settings.pitch;
            utterance.rate = options?.rate ?? this.settings.rate;
            utterance.volume = options?.volume ?? this.settings.volume;

            // Set voice if specified
            if (options?.voice) {
                utterance.voice = options.voice;
            } else if (this.settings.voice) {
                const voice = this.voices.find(v => v.name === this.settings.voice);
                if (voice) {
                    utterance.voice = voice;
                }
            }

            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(event);

            this.synth.speak(utterance);
        });
    }

    public stop(): void {
        this.synth.cancel();
    }

    public pause(): void {
        this.synth.pause();
    }

    public resume(): void {
        this.synth.resume();
    }

    public isSpeaking(): boolean {
        return this.synth.speaking;
    }
}

// Request microphone permission
export const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we just needed permission
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        return false;
    }
};

// Natural language response generator
export const generateResponse = (result: CommandResult): string => {
    const { command, parameters } = result;
    const query = parameters?.['query'];

    switch (command) {
        case 'search':
            return `Searching for ${query || 'results'}`;
        case 'navigate':
            return `Navigating to ${query || 'page'}`;
        case 'post':
            return `Creating ${query || 'post'}`;
        case 'help':
            return 'Here are the available commands: search, navigate, post, home, profile, notifications, and emergency';
        case 'home':
            return 'Going to home page';
        case 'profile':
            return 'Opening your profile';
        case 'notifications':
            return 'Showing notifications';
        case 'emergency':
            return 'Opening emergency services';
        case 'unknown':
            if (result.clarificationOptions && result.clarificationOptions.length > 0) {
                return `I'm not sure what you meant. ${result.clarificationOptions.join(', or ')}`;
            }
            return "I didn't understand that. Try saying 'help' to see available commands";
        default:
            return 'Command received';
    }
};
