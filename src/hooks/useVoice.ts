import { useState, useEffect, useCallback, useRef } from 'react';
import {
    checkVoiceSupport,
    getSpeechRecognition,
    parseVoiceCommand,
    SpeechService,
    requestMicrophonePermission,
} from '@/services/voiceService';
import { VoiceState, CommandResult, VoiceSettings } from '@/types/voice';

export const useVoice = (settings?: Partial<VoiceSettings>) => {
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        isSupported: false,
        hasPermission: null,
        transcript: '',
        interimTranscript: '',
        error: null,
        isSpeaking: false,
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const speechServiceRef = useRef<SpeechService | null>(null);
    const commandCallbackRef = useRef<((result: CommandResult) => void) | null>(null);

    // Initialize voice services
    useEffect(() => {
        const support = checkVoiceSupport();
        setVoiceState(prev => ({
            ...prev,
            isSupported: support.speechRecognition && support.speechSynthesis,
        }));

        if (support.speechSynthesis) {
            speechServiceRef.current = new SpeechService(settings);
        }

        if (support.speechRecognition) {
            const SpeechRecognitionConstructor = getSpeechRecognition();
            if (SpeechRecognitionConstructor) {
                const recognition = new SpeechRecognitionConstructor();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = settings?.language || 'en-AU';

                recognition.onstart = () => {
                    setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
                };

                recognition.onend = () => {
                    setVoiceState(prev => ({ ...prev, isListening: false }));
                };

                recognition.onerror = (event) => {
                    setVoiceState(prev => ({
                        ...prev,
                        error: `Speech recognition error: ${event.error}`,
                        isListening: false,
                    }));
                };

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result) {
                            const transcript = result[0]?.transcript || '';
                            if (result.isFinal) {
                                finalTranscript += transcript;
                            } else {
                                interimTranscript += transcript;
                            }
                        }
                    }

                    setVoiceState(prev => ({
                        ...prev,
                        transcript: finalTranscript || prev.transcript,
                        interimTranscript,
                    }));

                    if (finalTranscript && commandCallbackRef.current) {
                        const result = parseVoiceCommand(finalTranscript);
                        commandCallbackRef.current(result);
                    }
                };

                recognitionRef.current = recognition;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (speechServiceRef.current) {
                speechServiceRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(async () => {
        if (!voiceState.isSupported) {
            setVoiceState(prev => ({
                ...prev,
                error: 'Voice recognition is not supported in this browser',
            }));
            return false;
        }

        if (voiceState.hasPermission === null) {
            const granted = await requestMicrophonePermission();
            setVoiceState(prev => ({ ...prev, hasPermission: granted }));

            if (!granted) {
                setVoiceState(prev => ({
                    ...prev,
                    error: 'Microphone permission denied',
                }));
                return false;
            }
        }

        try {
            recognitionRef.current?.start();
            return true;
        } catch (error) {
            setVoiceState(prev => ({
                ...prev,
                error: 'Failed to start voice recognition',
            }));
            return false;
        }
    }, [voiceState.isSupported, voiceState.hasPermission]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!speechServiceRef.current) {
            return false;
        }

        try {
            setVoiceState(prev => ({ ...prev, isSpeaking: true }));
            await speechServiceRef.current.speak(text);
            setVoiceState(prev => ({ ...prev, isSpeaking: false }));
            return true;
        } catch (error) {
            setVoiceState(prev => ({ ...prev, isSpeaking: false }));
            return false;
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        speechServiceRef.current?.stop();
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }, []);

    const onCommand = useCallback((callback: (result: CommandResult) => void) => {
        commandCallbackRef.current = callback;
    }, []);

    const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
        speechServiceRef.current?.updateSettings(newSettings);
    }, []);

    const getVoices = useCallback(() => {
        return speechServiceRef.current?.getVoices() || [];
    }, []);

    return {
        voiceState,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        onCommand,
        updateSettings,
        getVoices,
    };
};
