/**
 * Browser Feature Detection and Graceful Degradation
 * Detects browser capabilities and provides fallback strategies
 */

export interface BrowserCapabilities {
    geolocation: boolean;
    webSpeech: boolean;
    webAudio: boolean;
    webGL: boolean;
    webRTC: boolean;
    serviceWorker: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    webWorkers: boolean;
    notifications: boolean;
    vibration: boolean;
    mediaDevices: boolean;
    webXR: boolean;
    webAssembly: boolean;
    intersectionObserver: boolean;
    resizeObserver: boolean;
    mutationObserver: boolean;
    fetch: boolean;
    promises: boolean;
    asyncAwait: boolean;
    modules: boolean;
}

export interface FeatureSupport {
    supported: boolean;
    fallback?: string;
    message?: string;
}

class FeatureDetector {
    private capabilities: BrowserCapabilities;

    constructor() {
        this.capabilities = this.detectCapabilities();
    }

    /**
     * Detect all browser capabilities
     */
    private detectCapabilities(): BrowserCapabilities {
        return {
            geolocation: 'geolocation' in navigator,
            webSpeech: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            webGL: this.detectWebGL(),
            webRTC: 'RTCPeerConnection' in window,
            serviceWorker: 'serviceWorker' in navigator,
            indexedDB: 'indexedDB' in window,
            localStorage: this.detectLocalStorage(),
            sessionStorage: this.detectSessionStorage(),
            webWorkers: 'Worker' in window,
            notifications: 'Notification' in window,
            vibration: 'vibrate' in navigator,
            mediaDevices: 'mediaDevices' in navigator,
            webXR: 'xr' in navigator,
            webAssembly: 'WebAssembly' in window,
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            mutationObserver: 'MutationObserver' in window,
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            asyncAwait: this.detectAsyncAwait(),
            modules: this.detectModules()
        };
    }

    /**
     * Detect WebGL support
     */
    private detectWebGL(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl')
            );
        } catch {
            return false;
        }
    }

    /**
     * Detect localStorage support
     */
    private detectLocalStorage(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Detect sessionStorage support
     */
    private detectSessionStorage(): boolean {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Detect async/await support
     */
    private detectAsyncAwait(): boolean {
        try {
            eval('(async () => {})');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Detect ES6 modules support
     */
    private detectModules(): boolean {
        try {
            return 'noModule' in document.createElement('script');
        } catch {
            return false;
        }
    }

    /**
     * Get all capabilities
     */
    getCapabilities(): BrowserCapabilities {
        return { ...this.capabilities };
    }

    /**
     * Check if a specific feature is supported
     */
    isSupported(feature: keyof BrowserCapabilities): boolean {
        return this.capabilities[feature];
    }

    /**
     * Get feature support with fallback information
     */
    getFeatureSupport(feature: keyof BrowserCapabilities): FeatureSupport {
        const supported = this.capabilities[feature];

        const fallbacks: Record<string, { fallback: string; message: string }> = {
            geolocation: {
                fallback: 'manual-location-entry',
                message: 'GPS not available. You can manually enter your location.'
            },
            webSpeech: {
                fallback: 'text-input',
                message: 'Voice input not available. Please use text input.'
            },
            webAudio: {
                fallback: 'silent-mode',
                message: 'Audio features not available. Running in silent mode.'
            },
            webGL: {
                fallback: 'canvas-2d',
                message: '3D graphics not available. Using simplified graphics.'
            },
            webRTC: {
                fallback: 'no-video-calls',
                message: 'Video calls not available in this browser.'
            },
            serviceWorker: {
                fallback: 'online-only',
                message: 'Offline features not available. Internet connection required.'
            },
            indexedDB: {
                fallback: 'memory-storage',
                message: 'Local database not available. Data will not persist.'
            },
            localStorage: {
                fallback: 'session-only',
                message: 'Local storage not available. Settings will not be saved.'
            },
            notifications: {
                fallback: 'in-app-only',
                message: 'Browser notifications not available. Using in-app notifications only.'
            },
            vibration: {
                fallback: 'visual-feedback',
                message: 'Haptic feedback not available. Using visual feedback only.'
            },
            mediaDevices: {
                fallback: 'no-camera',
                message: 'Camera access not available.'
            },
            webXR: {
                fallback: 'standard-view',
                message: 'AR features not available. Using standard view.'
            }
        };

        return {
            supported,
            fallback: fallbacks[feature]?.fallback || undefined,
            message: fallbacks[feature]?.message || undefined
        };
    }

    /**
     * Get browser information
     */
    getBrowserInfo(): {
        name: string;
        version: string;
        platform: string;
        mobile: boolean;
    } {
        const ua = navigator.userAgent;
        let name = 'Unknown';
        let version = 'Unknown';

        // Detect browser
        if (ua.includes('Firefox/')) {
            name = 'Firefox';
            version = ua.split('Firefox/')[1].split(' ')[0];
        } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
            name = 'Chrome';
            version = ua.split('Chrome/')[1].split(' ')[0];
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            name = 'Safari';
            version = ua.split('Version/')[1]?.split(' ')[0] || 'Unknown';
        } else if (ua.includes('Edg/')) {
            name = 'Edge';
            version = ua.split('Edg/')[1].split(' ')[0];
        }

        return {
            name,
            version,
            platform: navigator.platform,
            mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        };
    }

    /**
     * Check if browser is supported
     */
    isBrowserSupported(): {
        supported: boolean;
        issues: string[];
        warnings: string[];
    } {
        const issues: string[] = [];
        const warnings: string[] = [];

        // Critical features
        if (!this.capabilities.fetch) {
            issues.push('Fetch API not supported');
        }
        if (!this.capabilities.promises) {
            issues.push('Promises not supported');
        }
        if (!this.capabilities.localStorage) {
            issues.push('Local storage not supported');
        }

        // Important features
        if (!this.capabilities.serviceWorker) {
            warnings.push('Service workers not supported - offline features unavailable');
        }
        if (!this.capabilities.geolocation) {
            warnings.push('Geolocation not supported - manual location entry required');
        }
        if (!this.capabilities.webSpeech) {
            warnings.push('Web Speech API not supported - voice features unavailable');
        }

        return {
            supported: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Get recommended actions for unsupported features
     */
    getRecommendedActions(): string[] {
        const actions: string[] = [];
        const support = this.isBrowserSupported();

        if (!support.supported) {
            actions.push('Please update your browser to the latest version');
            actions.push('Consider using Chrome, Firefox, Safari, or Edge');
        }

        if (support.warnings.length > 0) {
            actions.push('Some features may be limited in your browser');
        }

        return actions;
    }

    /**
     * Log capabilities to console
     */
    logCapabilities(): void {
        console.group('Browser Capabilities');
        console.table(this.capabilities);
        console.groupEnd();

        const support = this.isBrowserSupported();
        if (!support.supported) {
            console.warn('Browser Support Issues:', support.issues);
        }
        if (support.warnings.length > 0) {
            console.warn('Browser Support Warnings:', support.warnings);
        }
    }
}

// Create singleton instance
const featureDetector = new FeatureDetector();

// Export convenience functions
export const getCapabilities = () => featureDetector.getCapabilities();
export const isSupported = (feature: keyof BrowserCapabilities) =>
    featureDetector.isSupported(feature);
export const getFeatureSupport = (feature: keyof BrowserCapabilities) =>
    featureDetector.getFeatureSupport(feature);
export const getBrowserInfo = () => featureDetector.getBrowserInfo();
export const isBrowserSupported = () => featureDetector.isBrowserSupported();
export const getRecommendedActions = () => featureDetector.getRecommendedActions();
export const logCapabilities = () => featureDetector.logCapabilities();

export default featureDetector;
