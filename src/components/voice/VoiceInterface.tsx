import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import {
    checkVoiceSupport,
    getSpeechRecognition,
    parseVoiceCommand,
    SpeechService,
    requestMicrophonePermission,
    generateResponse,
} from '@/services/voiceService';
import { VoiceInterfaceProps, VoiceState, CommandResult } from '@/types/voice';

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
    onCommand,
    onTranscript,
    onError,
    autoStart = false,
    showVisualIndicator = true,
    className = '',
}) => {
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        isSupported: false,
        hasPermission: null,
        transcript: '',
        interimTranscript: '',
        error: null,
        isSpeaking: false,
    });

    const [showSettings, setShowSettings] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const speechServiceRef = useRef<SpeechService | null>(null);

    // Initialize voice services
    useEffect(() => {
        const support = checkVoiceSupport();
        setVoiceState(prev => ({
            ...prev,
            isSupported: support.speechRecognition && support.speechSynthesis,
        }));

        if (support.speechSynthesis) {
            speechServiceRef.current = new SpeechService();
        }

        if (support.speechRecognition) {
            const SpeechRecognitionConstructor = getSpeechRecognition();
            if (SpeechRecognitionConstructor) {
                const recognition = new SpeechRecognitionConstructor();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-AU';

                recognition.onstart = () => {
                    setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
                };

                recognition.onend = () => {
                    setVoiceState(prev => ({ ...prev, isListening: false }));
                };

                recognition.onerror = (event) => {
                    const errorMessage = `Speech recognition error: ${event.error}`;
                    setVoiceState(prev => ({
                        ...prev,
                        error: errorMessage,
                        isListening: false,
                    }));
                    onError?.(errorMessage);
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

                    if (finalTranscript) {
                        onTranscript?.(finalTranscript);
                        handleCommand(finalTranscript);
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

    // Auto-start if requested
    useEffect(() => {
        if (autoStart && voiceState.isSupported && !voiceState.isListening) {
            startListening();
        }
    }, [autoStart, voiceState.isSupported]);

    const handleCommand = useCallback((transcript: string) => {
        const result = parseVoiceCommand(transcript);
        onCommand?.(result);

        // Provide voice feedback
        if (speechServiceRef.current) {
            const response = generateResponse(result);
            setVoiceState(prev => ({ ...prev, isSpeaking: true }));
            speechServiceRef.current
                .speak(response)
                .then(() => {
                    setVoiceState(prev => ({ ...prev, isSpeaking: false }));
                })
                .catch((error) => {
                    console.error('Speech synthesis error:', error);
                    setVoiceState(prev => ({ ...prev, isSpeaking: false }));
                });
        }
    }, [onCommand]);

    const startListening = async () => {
        if (!voiceState.isSupported) {
            const error = 'Voice recognition is not supported in this browser';
            setVoiceState(prev => ({ ...prev, error }));
            onError?.(error);
            return;
        }

        // Request permission if not already granted
        if (voiceState.hasPermission === null) {
            const granted = await requestMicrophonePermission();
            setVoiceState(prev => ({ ...prev, hasPermission: granted }));

            if (!granted) {
                const error = 'Microphone permission denied';
                setVoiceState(prev => ({ ...prev, error }));
                onError?.(error);
                return;
            }
        }

        try {
            recognitionRef.current?.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            setVoiceState(prev => ({
                ...prev,
                error: 'Failed to start voice recognition',
            }));
        }
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
    };

    const toggleListening = () => {
        if (voiceState.isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const toggleSpeech = () => {
        if (speechServiceRef.current) {
            if (voiceState.isSpeaking) {
                speechServiceRef.current.stop();
                setVoiceState(prev => ({ ...prev, isSpeaking: false }));
            }
        }
    };

    if (!voiceState.isSupported) {
        return (
            <div className={`voice-interface-unsupported ${className}`}>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
                    <p className="text-sm">
                        Voice features are not supported in this browser. Please use Chrome, Edge, or Safari.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`voice-interface ${className}`}>
            <div className="flex items-center gap-2">
                {/* Main microphone button */}
                <motion.button
                    onClick={toggleListening}
                    className={`relative p-4 rounded-full transition-all ${voiceState.isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={voiceState.isListening ? 'Stop listening' : 'Start listening'}
                >
                    {voiceState.isListening ? (
                        <MicOff className="w-6 h-6" />
                    ) : (
                        <Mic className="w-6 h-6" />
                    )}

                    {/* Listening indicator */}
                    {voiceState.isListening && showVisualIndicator && (
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-red-400"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.8, 0, 0.8],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    )}
                </motion.button>

                {/* Speaker toggle */}
                <motion.button
                    onClick={toggleSpeech}
                    className={`p-3 rounded-full transition-all ${voiceState.isSpeaking
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={voiceState.isSpeaking ? 'Stop speaking' : 'Speaker'}
                >
                    {voiceState.isSpeaking ? (
                        <Volume2 className="w-5 h-5" />
                    ) : (
                        <VolumeX className="w-5 h-5" />
                    )}
                </motion.button>

                {/* Settings button */}
                <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Voice settings"
                >
                    <Settings className="w-5 h-5" />
                </motion.button>

                {/* Help button */}
                <motion.button
                    onClick={() => {
                        const helpText = 'Available commands: search, navigate, post, home, profile, notifications, emergency. Say help for more information.';
                        if (speechServiceRef.current) {
                            speechServiceRef.current.speak(helpText);
                        }
                    }}
                    className="p-3 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Voice help"
                >
                    <HelpCircle className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Transcript display */}
            <AnimatePresence>
                {(voiceState.transcript || voiceState.interimTranscript) && showVisualIndicator && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200"
                    >
                        <p className="text-sm text-gray-600 mb-1">Transcript:</p>
                        <p className="text-lg">
                            {voiceState.transcript}
                            {voiceState.interimTranscript && (
                                <span className="text-gray-400 italic">
                                    {' '}
                                    {voiceState.interimTranscript}
                                </span>
                            )}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error display */}
            <AnimatePresence>
                {voiceState.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg"
                    >
                        <p className="text-sm">{voiceState.error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings panel */}
            <AnimatePresence>
                {showSettings && (
                    <VoiceSettingsPanel
                        speechService={speechServiceRef.current}
                        onClose={() => setShowSettings(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Voice Settings Panel Component
interface VoiceSettingsPanelProps {
    speechService: SpeechService | null;
    onClose: () => void;
}

const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
    speechService,
    onClose,
}) => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        if (speechService) {
            const availableVoices = speechService.getVoices();
            setVoices(availableVoices);

            // Prefer Australian English voices
            const auVoice = availableVoices.find(v => v.lang.startsWith('en-AU'));
            if (auVoice) {
                setSelectedVoice(auVoice.name);
            }
        }
    }, [speechService]);

    const handleVoiceChange = (voiceName: string) => {
        setSelectedVoice(voiceName);
        speechService?.updateSettings({ voice: voiceName });
    };

    const handlePitchChange = (value: number) => {
        setPitch(value);
        speechService?.updateSettings({ pitch: value });
    };

    const handleRateChange = (value: number) => {
        setRate(value);
        speechService?.updateSettings({ rate: value });
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        speechService?.updateSettings({ volume: value });
    };

    const testVoice = () => {
        speechService?.speak('This is a test of the voice settings');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Voice Settings</h2>

                {/* Voice selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voice
                    </label>
                    <select
                        value={selectedVoice}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Default</option>
                        {voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pitch control */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pitch: {pitch.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Rate control */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Speed: {rate.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Volume control */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Volume: {volume.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={testVoice}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Test Voice
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
