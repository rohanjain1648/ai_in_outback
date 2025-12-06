import { Language } from '../contexts/AccessibilityContext';

// Aboriginal language translations for key terms
const aboriginalTranslations: Record<string, string> = {
    // Greetings and common phrases
    'hello': 'Wudjari',
    'welcome': 'Kaya',
    'thank you': 'Ngayu',
    'goodbye': 'Boorda',
    'yes': 'Yuwayi',
    'no': 'Wiya',

    // Community terms
    'community': 'Mob',
    'family': 'Yumari',
    'friend': 'Marlu',
    'elder': 'Ngangkari',
    'country': 'Ngura',
    'land': 'Boodja',

    // Nature and environment
    'water': 'Kapi',
    'fire': 'Waru',
    'tree': 'Kurara',
    'sky': 'Kanyini',
    'earth': 'Tjukurpa',
    'spirit': 'Maban',

    // Actions
    'help': 'Palya',
    'share': 'Yunti',
    'connect': 'Wangka',
    'learn': 'Kulini',
    'teach': 'Ngapartji',

    // UI terms
    'home': 'Ngura',
    'search': 'Ninti',
    'profile': 'Ngayuku',
    'message': 'Wangka',
    'notification': 'Yananyi',
    'settings': 'Kanyini',
};

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, Map<Language, string>>();

export interface TranslationOptions {
    useCache?: boolean;
    fallbackToEnglish?: boolean;
}

/**
 * Translation service for multi-language support
 */
export class TranslationService {
    private apiKey: string | null = null;
    private apiEndpoint = 'https://translation.googleapis.com/language/translate/v2';

    constructor() {
        // Get API key from environment
        this.apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || null;
    }

    /**
     * Translate text to target language
     */
    async translate(
        text: string,
        targetLang: Language,
        options: TranslationOptions = {}
    ): Promise<string> {
        const { useCache = true, fallbackToEnglish = true } = options;

        // Return original if English
        if (targetLang === 'en' || targetLang === 'en-AU') {
            return text;
        }

        // Check Aboriginal translations first
        if (targetLang === 'aboriginal') {
            const lowerText = text.toLowerCase();
            if (aboriginalTranslations[lowerText]) {
                return aboriginalTranslations[lowerText];
            }
            // Return original if no translation found
            return fallbackToEnglish ? text : `[${text}]`;
        }

        // Check cache
        if (useCache) {
            const cached = this.getCachedTranslation(text, targetLang);
            if (cached) {
                return cached;
            }
        }

        // Use Google Translate API if available
        if (this.apiKey) {
            try {
                const translated = await this.translateWithGoogle(text, targetLang);
                this.cacheTranslation(text, targetLang, translated);
                return translated;
            } catch (error) {
                console.error('Translation API error:', error);
            }
        }

        // Fallback to original text
        return fallbackToEnglish ? text : `[${text}]`;
    }

    /**
     * Translate multiple texts at once
     */
    async translateBatch(
        texts: string[],
        targetLang: Language,
        options: TranslationOptions = {}
    ): Promise<string[]> {
        return Promise.all(texts.map(text => this.translate(text, targetLang, options)));
    }

    /**
     * Get Aboriginal translation for a term
     */
    getAboriginalTerm(englishTerm: string): string | null {
        return aboriginalTranslations[englishTerm.toLowerCase()] || null;
    }

    /**
     * Get all Aboriginal translations
     */
    getAllAboriginalTerms(): Record<string, string> {
        return { ...aboriginalTranslations };
    }

    /**
     * Translate using Google Translate API
     */
    private async translateWithGoogle(text: string, targetLang: Language): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Google Translate API key not configured');
        }

        // Map our language codes to Google's
        const langMap: Record<Language, string> = {
            'en': 'en',
            'en-AU': 'en',
            'aboriginal': 'en', // Fallback
            'es': 'es',
            'zh': 'zh-CN',
            'ar': 'ar',
            'vi': 'vi',
        };

        const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: langMap[targetLang],
                format: 'text',
            }),
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.translations[0].translatedText;
    }

    /**
     * Get cached translation
     */
    private getCachedTranslation(text: string, lang: Language): string | null {
        const langCache = translationCache.get(text);
        return langCache?.get(lang) || null;
    }

    /**
     * Cache translation
     */
    private cacheTranslation(text: string, lang: Language, translation: string): void {
        let langCache = translationCache.get(text);
        if (!langCache) {
            langCache = new Map();
            translationCache.set(text, langCache);
        }
        langCache.set(lang, translation);
    }

    /**
     * Clear translation cache
     */
    clearCache(): void {
        translationCache.clear();
    }
}

// Singleton instance
export const translationService = new TranslationService();

/**
 * Hook for using translations in components
 */
export const useTranslation = () => {
    return {
        translate: (text: string, targetLang: Language, options?: TranslationOptions) =>
            translationService.translate(text, targetLang, options),
        translateBatch: (texts: string[], targetLang: Language, options?: TranslationOptions) =>
            translationService.translateBatch(texts, targetLang, options),
        getAboriginalTerm: (term: string) => translationService.getAboriginalTerm(term),
    };
};
