import React, { useState } from 'react';
import { AccessibilityButton } from './AccessibilityButton';
import { SkipToContent } from './SkipToContent';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { translationService } from '../../services/translationService';

export const AccessibilityDemo: React.FC = () => {
    const { settings, announceToScreenReader } = useAccessibility();
    const [translatedText, setTranslatedText] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTestTranslation = async () => {
        setIsTranslating(true);
        announceToScreenReader('Translating text...');

        try {
            const result = await translationService.translate(
                'Welcome to Rural Connect AI',
                settings.language
            );
            setTranslatedText(result);
            announceToScreenReader('Translation complete');
        } catch (error) {
            console.error('Translation error:', error);
            announceToScreenReader('Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };

    const aboriginalTerms = translationService.getAllAboriginalTerms();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SkipToContent />

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow" role="banner">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Accessibility & Multi-Language Demo
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Test the accessibility features and language support
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 py-8">
                {/* Current Settings Display */}
                <section aria-labelledby="current-settings-heading" className="mb-8">
                    <h2 id="current-settings-heading" className="text-2xl font-semibold mb-4">
                        Current Settings
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-3">
                        <div className="flex justify-between">
                            <span className="font-medium">High Contrast Mode:</span>
                            <span className={settings.highContrastMode ? 'text-green-600' : 'text-gray-500'}>
                                {settings.highContrastMode ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Text Size:</span>
                            <span className="capitalize">{settings.textSize}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Language:</span>
                            <span>{settings.language}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Reduced Motion:</span>
                            <span className={settings.reducedMotion ? 'text-green-600' : 'text-gray-500'}>
                                {settings.reducedMotion ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Screen Reader Optimized:</span>
                            <span className={settings.screenReaderOptimized ? 'text-green-600' : 'text-gray-500'}>
                                {settings.screenReaderOptimized ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Translation Test */}
                <section aria-labelledby="translation-heading" className="mb-8">
                    <h2 id="translation-heading" className="text-2xl font-semibold mb-4">
                        Translation Test
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            Current language: <strong>{settings.language}</strong>
                        </p>
                        <button
                            onClick={handleTestTranslation}
                            disabled={isTranslating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300"
                            aria-busy={isTranslating}
                        >
                            {isTranslating ? 'Translating...' : 'Test Translation'}
                        </button>
                        {translatedText && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-medium mb-2">Translated Text:</p>
                                <p className="text-lg">{translatedText}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Aboriginal Language Terms */}
                {settings.language === 'aboriginal' && (
                    <section aria-labelledby="aboriginal-terms-heading" className="mb-8">
                        <h2 id="aboriginal-terms-heading" className="text-2xl font-semibold mb-4">
                            Aboriginal Language Terms
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <p className="mb-4 text-gray-700 dark:text-gray-300">
                                Key terms and phrases in Aboriginal language:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(aboriginalTerms).map(([english, aboriginal]) => (
                                    <div
                                        key={english}
                                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {aboriginal}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {english}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Keyboard Navigation Test */}
                <section aria-labelledby="keyboard-nav-heading" className="mb-8">
                    <h2 id="keyboard-nav-heading" className="text-2xl font-semibold mb-4">
                        Keyboard Navigation Test
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            Try navigating these buttons using Tab and Enter keys:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                onClick={() => announceToScreenReader('Button 1 clicked')}
                            >
                                Button 1
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
                                onClick={() => announceToScreenReader('Button 2 clicked')}
                            >
                                Button 2
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
                                onClick={() => announceToScreenReader('Button 3 clicked')}
                            >
                                Button 3
                            </button>
                        </div>
                    </div>
                </section>

                {/* Form Accessibility Test */}
                <section aria-labelledby="form-heading" className="mb-8">
                    <h2 id="form-heading" className="text-2xl font-semibold mb-4">
                        Form Accessibility Test
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                announceToScreenReader('Form submitted successfully');
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Name <span className="text-red-600" aria-label="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    aria-required="true"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Email <span className="text-red-600" aria-label="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    aria-required="true"
                                    aria-describedby="email-help"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="your@email.com"
                                />
                                <p id="email-help" className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    We'll never share your email with anyone else.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your message"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                            >
                                Submit Form
                            </button>
                        </form>
                    </div>
                </section>

                {/* ARIA Live Region Test */}
                <section aria-labelledby="live-region-heading" className="mb-8">
                    <h2 id="live-region-heading" className="text-2xl font-semibold mb-4">
                        Screen Reader Announcements
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            Click the button to test screen reader announcements:
                        </p>
                        <button
                            onClick={() => announceToScreenReader('This is a test announcement for screen readers')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Test Screen Reader Announcement
                        </button>
                    </div>
                </section>
            </main>

            {/* Accessibility Button */}
            <AccessibilityButton />
        </div>
    );
};
