import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
export type Language = 'en' | 'en-AU' | 'aboriginal' | 'es' | 'zh' | 'ar' | 'vi';

export interface AccessibilitySettings {
    // Visual
    highContrastMode: boolean;
    textSize: TextSize;
    reducedMotion: boolean;

    // Language
    language: Language;

    // Navigation
    keyboardNavigationEnabled: boolean;
    screenReaderOptimized: boolean;

    // Audio
    soundEnabled: boolean;
    voiceEnabled: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (updates: Partial<AccessibilitySettings>) => void;
    toggleHighContrast: () => void;
    setTextSize: (size: TextSize) => void;
    setLanguage: (lang: Language) => void;
    announceToScreenReader: (message: string) => void;
}

const defaultSettings: AccessibilitySettings = {
    highContrastMode: false,
    textSize: 'medium',
    reducedMotion: false,
    language: 'en-AU',
    keyboardNavigationEnabled: true,
    screenReaderOptimized: false,
    soundEnabled: true,
    voiceEnabled: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        // Load from localStorage
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse accessibility settings:', e);
            }
        }

        // Check system preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

        return {
            ...defaultSettings,
            reducedMotion: prefersReducedMotion,
            highContrastMode: prefersHighContrast,
        };
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        // Apply settings to document
        applySettingsToDocument(settings);
    }, [settings]);

    // Listen for system preference changes
    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');

        const handleMotionChange = (e: MediaQueryListEvent) => {
            setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
        };

        const handleContrastChange = (e: MediaQueryListEvent) => {
            setSettings(prev => ({ ...prev, highContrastMode: e.matches }));
        };

        motionQuery.addEventListener('change', handleMotionChange);
        contrastQuery.addEventListener('change', handleContrastChange);

        return () => {
            motionQuery.removeEventListener('change', handleMotionChange);
            contrastQuery.removeEventListener('change', handleContrastChange);
        };
    }, []);

    const updateSettings = (updates: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const toggleHighContrast = () => {
        setSettings(prev => ({ ...prev, highContrastMode: !prev.highContrastMode }));
    };

    const setTextSize = (size: TextSize) => {
        setSettings(prev => ({ ...prev, textSize: size }));
    };

    const setLanguage = (lang: Language) => {
        setSettings(prev => ({ ...prev, language: lang }));
    };

    const announceToScreenReader = (message: string) => {
        const announcement = document.getElementById('screen-reader-announcements');
        if (announcement) {
            announcement.textContent = message;
            // Clear after a delay
            setTimeout(() => {
                announcement.textContent = '';
            }, 1000);
        }
    };

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                updateSettings,
                toggleHighContrast,
                setTextSize,
                setLanguage,
                announceToScreenReader,
            }}
        >
            {children}
            {/* Screen reader announcement region */}
            <div
                id="screen-reader-announcements"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

// Helper function to apply settings to document
function applySettingsToDocument(settings: AccessibilitySettings) {
    const root = document.documentElement;

    // High contrast mode
    if (settings.highContrastMode) {
        root.classList.add('high-contrast');
    } else {
        root.classList.remove('high-contrast');
    }

    // Text size
    root.setAttribute('data-text-size', settings.textSize);

    // Reduced motion
    if (settings.reducedMotion) {
        root.classList.add('reduce-motion');
    } else {
        root.classList.remove('reduce-motion');
    }

    // Language
    root.setAttribute('lang', settings.language);
}
