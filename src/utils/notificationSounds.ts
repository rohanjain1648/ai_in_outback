// Web Audio API integration for contextual notification sounds

let audioContext: AudioContext | null = null;

const initAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Play a notification sound based on the notification type
 * Uses Web Audio API to generate synthetic sounds
 */
export const playNotificationSound = (type: string): void => {
    try {
        const context = initAudioContext();

        // Resume context if suspended (required for user interaction)
        if (context.state === 'suspended') {
            context.resume();
        }

        switch (type) {
            case 'emergency':
                playEmergencySound(context);
                break;
            case 'warning':
                playWarningSound(context);
                break;
            case 'success':
                playSuccessSound(context);
                break;
            case 'info':
            default:
                playInfoSound(context);
                break;
        }
    } catch (error) {
        console.warn('Failed to play notification sound:', error);
    }
};

/**
 * Emergency sound: Urgent, attention-grabbing alarm
 */
const playEmergencySound = (context: AudioContext): void => {
    const now = context.currentTime;

    // Create oscillator for alarm sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Alternating high-low frequency for urgency
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.setValueAtTime(600, now + 0.1);
    oscillator.frequency.setValueAtTime(800, now + 0.2);
    oscillator.frequency.setValueAtTime(600, now + 0.3);

    oscillator.type = 'square';

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.setValueAtTime(0.3, now + 0.4);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
};

/**
 * Warning sound: Moderate alert tone
 */
const playWarningSound = (context: AudioContext): void => {
    const now = context.currentTime;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.linearRampToValueAtTime(500, now + 0.15);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
};

/**
 * Success sound: Pleasant, uplifting chime
 */
const playSuccessSound = (context: AudioContext): void => {
    const now = context.currentTime;

    // Create two oscillators for a chord
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gainNode = context.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(context.destination);

    // Major third interval (C and E)
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.setValueAtTime(659.25, now); // E5

    osc1.type = 'sine';
    osc2.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
};

/**
 * Info sound: Subtle, gentle notification
 */
const playInfoSound = (context: AudioContext): void => {
    const now = context.currentTime;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
};

/**
 * Initialize audio context on user interaction
 * Call this on first user click/touch to enable audio
 */
export const initializeAudio = (): void => {
    const context = initAudioContext();
    if (context.state === 'suspended') {
        context.resume();
    }
};

/**
 * Clean up audio context
 */
export const cleanupAudio = (): void => {
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
};
