/**
 * NoSQL Generator - Internationalization Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles internationalization (i18n) for the application:
 * - Language selection
 * - Text translation
 * - RTL support for languages like Arabic
 */

import { logInfo, logSuccess, logWarning, logError } from './logger.js';
import { saveSettings, loadSettings } from './settings.js';

// Available languages
const AVAILABLE_LANGUAGES = {
    'pt-BR': {
        name: 'Português (Brasil)',
        nativeName: 'Português (Brasil)',
        direction: 'ltr'
    },
    'en': {
        name: 'English',
        nativeName: 'English',
        direction: 'ltr'
    },
    'fr': {
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr'
    },
    'ru': {
        name: 'Russian',
        nativeName: 'Русский',
        direction: 'ltr'
    },
    'it': {
        name: 'Italian',
        nativeName: 'Italiano',
        direction: 'ltr'
    },
    'zh': {
        name: 'Chinese',
        nativeName: '中文',
        direction: 'ltr'
    },
    'ja': {
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr'
    },
    'es': {
        name: 'Spanish',
        nativeName: 'Español',
        direction: 'ltr'
    },
    'ar': {
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl'
    }
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Current language
let currentLanguage = DEFAULT_LANGUAGE;

// Translation data
let translations = {};

/**
 * Initialize the i18n module
 * @returns {Promise<void>}
 */
async function initI18n() {
    logInfo('Initializing i18n module...');
    
    // Load saved language preference
    const settings = loadSettings();
    const savedLanguage = settings.language || DEFAULT_LANGUAGE;
    
    try {
        // Load translations for the saved language
        await setLanguage(savedLanguage);
        logSuccess(`i18n module initialized with language: ${savedLanguage}`);
    } catch (error) {
        logError(`Failed to initialize i18n module: ${error.message}`);
        // Fall back to default language
        await setLanguage(DEFAULT_LANGUAGE);
    }
    
    // Set up language selector in UI
    setupLanguageSelector();
}

/**
 * Set up the language selector in the UI
 */
function setupLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    if (!languageSelector) {
        logWarning('Language selector element not found');
        return;
    }
    
    // Clear existing options
    languageSelector.innerHTML = '';
    
    // Add options for each available language
    Object.entries(AVAILABLE_LANGUAGES).forEach(([code, langInfo]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = langInfo.nativeName;
        option.selected = code === currentLanguage;
        languageSelector.appendChild(option);
    });
    
    // Add change event listener
    languageSelector.addEventListener('change', async (event) => {
        const newLanguage = event.target.value;
        await setLanguage(newLanguage);
    });
}

/**
 * Set the application language
 * @param {string} languageCode - The language code to set
 * @returns {Promise<void>}
 */
async function setLanguage(languageCode) {
    if (!AVAILABLE_LANGUAGES[languageCode]) {
        logWarning(`Language ${languageCode} not supported, falling back to ${DEFAULT_LANGUAGE}`);
        languageCode = DEFAULT_LANGUAGE;
    }
    
    try {
        // Load translations for the selected language
        await loadTranslations(languageCode);
        
        // Update current language
        currentLanguage = languageCode;
        
        // Save language preference
        const settings = loadSettings();
        settings.language = languageCode;
        saveSettings(settings);
        
        // Update document direction for RTL languages
        document.documentElement.dir = AVAILABLE_LANGUAGES[languageCode].direction;
        document.documentElement.lang = languageCode;
        
        // Update all translated elements
        translatePage();
        
        logSuccess(`Language changed to ${languageCode}`);
        
        // Dispatch language change event
        document.dispatchEvent(new CustomEvent('language-changed', {
            detail: { language: languageCode }
        }));
    } catch (error) {
        logError(`Failed to set language to ${languageCode}: ${error.message}`);
        throw error;
    }
}

/**
 * Load translations for a specific language
 * @param {string} languageCode - The language code to load translations for
 * @returns {Promise<void>}
 */
async function loadTranslations(languageCode) {
    try {
        const response = await fetch(`./locales/${languageCode}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${languageCode}`);
        }
        
        translations = await response.json();
        logInfo(`Loaded translations for ${languageCode}`);
    } catch (error) {
        logError(`Error loading translations: ${error.message}`);
        
        // If we can't load the translations file, create an empty one
        translations = {};
        
        // Only throw for non-default language
        if (languageCode !== DEFAULT_LANGUAGE) {
            throw error;
        }
    }
}

/**
 * Translate the entire page
 */
function translatePage() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        translateElement(element, key);
    });
    
    // Translate all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = translate(key);
    });
    
    // Translate all elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = translate(key);
    });
}

/**
 * Translate a specific element
 * @param {HTMLElement} element - The element to translate
 * @param {string} key - The translation key
 */
function translateElement(element, key) {
    element.textContent = translate(key);
}

/**
 * Translate a key to the current language
 * @param {string} key - The translation key
 * @param {Object} [params={}] - Parameters for interpolation
 * @returns {string} The translated text
 */
function translate(key, params = {}) {
    // Get the translation or fall back to the key itself
    let text = translations[key] || key;
    
    // Replace parameters in the format {{paramName}}
    Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    });
    
    return text;
}

/**
 * Get the current language code
 * @returns {string} The current language code
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get the list of available languages
 * @returns {Object} The available languages
 */
function getAvailableLanguages() {
    return { ...AVAILABLE_LANGUAGES };
}

/**
 * Check if the current language is RTL
 * @returns {boolean} True if the current language is RTL
 */
function isRTL() {
    return AVAILABLE_LANGUAGES[currentLanguage]?.direction === 'rtl';
}

// Export functions
export {
    initI18n,
    setLanguage,
    translate,
    translatePage,
    getCurrentLanguage,
    getAvailableLanguages,
    isRTL
};
