export type VoiceCommand =
    | 'search'
    | 'navigate'
    | 'post'
    | 'help'
    | 'home'
    | 'profile'
    | 'notifications'
    | 'emergency'
    | 'unknown';

export interface CommandResult {
    command: VoiceCommand;
    action: string;
    parameters?: Record<string, unknown>;
    confidence: number;
    needsConfirmation: boolean;
    clarificationOptions?: string[] | undefined;
}

export interface SpeechOptions {
    lang?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
}

export interface VoiceSettings {
    language: string;
    voice: string | null;
    pitch: number;
    rate: number;
    volume: number;
    autoSpeak: boolean;
}

export interface VoiceState {
    isListening: boolean;
    isSupported: boolean;
    hasPermission: boolean | null;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSpeaking: boolean;
}

export interface VoiceInterfaceProps {
    onCommand?: (result: CommandResult) => void;
    onTranscript?: (transcript: string) => void;
    onError?: (error: string) => void;
    autoStart?: boolean;
    showVisualIndicator?: boolean;
    className?: string;
}
