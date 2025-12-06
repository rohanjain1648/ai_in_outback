import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Eye,
    Globe,
    Keyboard,
    Volume2,
    X,
    Check,
} from 'lucide-react';
import { useAccessibility, TextSize, Language } from '../../contexts/AccessibilityContext';

interface AccessibilityPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const textSizeOptions: { value: TextSize; label: string; description: string }[] = [
    { value: 'small', label: 'Small', description: '14px base' },
    { value: 'medium', label: 'Medium', description: '16px base (default)' },
    { value: 'large', label: 'Large', description: '18px base' },
    { value: 'extra-large', label: 'Extra Large', description: '20px base' },
];

const languageOptions: { value: Language; label: string; nativeName: string }[] = [
    { value: 'en-AU', label: 'English (Australia)', nativeName: 'English' },
    { value: 'aboriginal', label: 'Aboriginal Terms', nativeName: 'Wudjari' },
    { value: 'es', label: 'Spanish', nativeName: 'Español' },
    { value: 'zh', label: 'Chinese', nativeName: '中文' },
    { value: 'ar', label: 'Arabic', nativeName: 'العربية' },
    { value: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings, toggleHighContrast, setTextSize, setLanguage } =
        useAccessibility();
    const [activeTab, setActiveTab] = useState<'visual' | 'language' | 'navigation'>('visual');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="accessibility-panel-title"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                <h2 id="accessibility-panel-title" className="text-xl font-semibold">
                                    Accessibility Settings
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Close accessibility panel"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div
                            className="border-b border-gray-200 dark:border-gray-700"
                            role="tablist"
                            aria-label="Accessibility settings categories"
                        >
                            <div className="flex">
                                <button
                                    role="tab"
                                    aria-selected={activeTab === 'visual'}
                                    aria-controls="visual-panel"
                                    onClick={() => setActiveTab('visual')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'visual'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Eye className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
                                    Visual
                                </button>
                                <button
                                    role="tab"
                                    aria-selected={activeTab === 'language'}
                                    aria-controls="language-panel"
                                    onClick={() => setActiveTab('language')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'language'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Globe className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
                                    Language
                                </button>
                                <button
                                    role="tab"
                                    aria-selected={activeTab === 'navigation'}
                                    aria-controls="navigation-panel"
                                    onClick={() => setActiveTab('navigation')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'navigation'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Keyboard className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
                                    Navigation
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Visual Tab */}
                            {activeTab === 'visual' && (
                                <div role="tabpanel" id="visual-panel" aria-labelledby="visual-tab">
                                    {/* High Contrast Mode */}
                                    <section aria-labelledby="contrast-heading">
                                        <h3 id="contrast-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            High Contrast Mode
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Increase contrast for better visibility (WCAG AAA compliant)
                                        </p>
                                        <button
                                            onClick={toggleHighContrast}
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${settings.highContrastMode
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                            aria-pressed={settings.highContrastMode}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {settings.highContrastMode ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {settings.highContrastMode && (
                                                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        </button>
                                    </section>

                                    {/* Text Size */}
                                    <section aria-labelledby="text-size-heading" className="mt-6">
                                        <h3 id="text-size-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Text Size
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Adjust text size for comfortable reading
                                        </p>
                                        <div
                                            className="space-y-2"
                                            role="radiogroup"
                                            aria-labelledby="text-size-heading"
                                        >
                                            {textSizeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    role="radio"
                                                    aria-checked={settings.textSize === option.value}
                                                    onClick={() => setTextSize(option.value)}
                                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${settings.textSize === option.value
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                {option.description}
                                                            </div>
                                                        </div>
                                                        {settings.textSize === option.value && (
                                                            <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Reduced Motion */}
                                    <section aria-labelledby="motion-heading" className="mt-6">
                                        <h3 id="motion-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Reduced Motion
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Minimize animations and transitions
                                        </p>
                                        <button
                                            onClick={() =>
                                                updateSettings({ reducedMotion: !settings.reducedMotion })
                                            }
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${settings.reducedMotion
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                            aria-pressed={settings.reducedMotion}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {settings.reducedMotion ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {settings.reducedMotion && (
                                                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        </button>
                                    </section>
                                </div>
                            )}

                            {/* Language Tab */}
                            {activeTab === 'language' && (
                                <div role="tabpanel" id="language-panel" aria-labelledby="language-tab">
                                    <section aria-labelledby="language-heading">
                                        <h3 id="language-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Select Language
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Choose your preferred language for the interface
                                        </p>
                                        <div
                                            className="space-y-2"
                                            role="radiogroup"
                                            aria-labelledby="language-heading"
                                        >
                                            {languageOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    role="radio"
                                                    aria-checked={settings.language === option.value}
                                                    onClick={() => setLanguage(option.value)}
                                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${settings.language === option.value
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                {option.nativeName}
                                                            </div>
                                                        </div>
                                                        {settings.language === option.value && (
                                                            <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Aboriginal Language Info */}
                                    {settings.language === 'aboriginal' && (
                                        <div
                                            className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                                            role="note"
                                        >
                                            <p className="text-sm text-amber-900 dark:text-amber-200">
                                                <strong>Note:</strong> Aboriginal language support includes key terms and
                                                phrases. Full translation is not available. English will be used for
                                                untranslated content.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Tab */}
                            {activeTab === 'navigation' && (
                                <div role="tabpanel" id="navigation-panel" aria-labelledby="navigation-tab">
                                    {/* Screen Reader Optimization */}
                                    <section aria-labelledby="screen-reader-heading">
                                        <h3 id="screen-reader-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Screen Reader Optimization
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Optimize interface for screen reader users
                                        </p>
                                        <button
                                            onClick={() =>
                                                updateSettings({
                                                    screenReaderOptimized: !settings.screenReaderOptimized,
                                                })
                                            }
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${settings.screenReaderOptimized
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                            aria-pressed={settings.screenReaderOptimized}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {settings.screenReaderOptimized ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {settings.screenReaderOptimized && (
                                                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        </button>
                                    </section>

                                    {/* Keyboard Navigation */}
                                    <section aria-labelledby="keyboard-heading" className="mt-6">
                                        <h3 id="keyboard-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Keyboard Navigation
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            Enable enhanced keyboard navigation shortcuts
                                        </p>
                                        <button
                                            onClick={() =>
                                                updateSettings({
                                                    keyboardNavigationEnabled: !settings.keyboardNavigationEnabled,
                                                })
                                            }
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${settings.keyboardNavigationEnabled
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                            aria-pressed={settings.keyboardNavigationEnabled}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {settings.keyboardNavigationEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {settings.keyboardNavigationEnabled && (
                                                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        </button>
                                    </section>

                                    {/* Keyboard Shortcuts Reference */}
                                    <section aria-labelledby="shortcuts-heading" className="mt-6">
                                        <h3 id="shortcuts-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Keyboard Shortcuts
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <span>Skip to main content</span>
                                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                                    Alt + M
                                                </kbd>
                                            </div>
                                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <span>Open accessibility panel</span>
                                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                                    Alt + A
                                                </kbd>
                                            </div>
                                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <span>Search</span>
                                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                                    Ctrl + K
                                                </kbd>
                                            </div>
                                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <span>Navigate between sections</span>
                                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                                    Tab
                                                </kbd>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Sound Settings */}
                                    <section aria-labelledby="sound-heading" className="mt-6">
                                        <h3 id="sound-heading" className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                                            Sound & Voice
                                        </h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${settings.soundEnabled
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                                aria-pressed={settings.soundEnabled}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Volume2 className="w-5 h-5 text-gray-900 dark:text-white" aria-hidden="true" />
                                                        <span className="font-medium text-gray-900 dark:text-white">Sound Effects</span>
                                                    </div>
                                                    {settings.soundEnabled && (
                                                        <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                    )}
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${settings.voiceEnabled
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                                aria-pressed={settings.voiceEnabled}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Volume2 className="w-5 h-5 text-gray-900 dark:text-white" aria-hidden="true" />
                                                        <span className="font-medium text-gray-900 dark:text-white">Voice Feedback</span>
                                                    </div>
                                                    {settings.voiceEnabled && (
                                                        <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
