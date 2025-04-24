/**
 * NoSQL Generator - Settings Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles application settings:
 * - Loading and saving settings to localStorage
 * - Default settings
 * - Settings UI interactions
 */

import { logInfo, logWarning, logError } from './logger.js';
import { showNotification } from './notifications.js';

// Default settings
const DEFAULT_SETTINGS = {
    theme: 'light',
    fontSize: 14,
    autoFormat: true,
    lineNumbers: true,
    syntaxHighlight: true,
    defaultFilename: 'nosql_export',
    includeMetadata: true
};

// Module state
const settingsState = {
    initialized: false,
    settings: { ...DEFAULT_SETTINGS }
};

/**
 * Initialize the settings module
 */
function initSettings() {
    if (settingsState.initialized) return;
    
    // Load settings from localStorage
    loadSettings();
    
    // Apply settings to UI
    applySettingsToUI();
    
    // Set up event listeners
    setupSettingsEventListeners();
    
    // Mark as initialized
    settingsState.initialized = true;
    logInfo('Settings module initialized');
}

/**
 * Load settings from localStorage
 * @returns {Object} The loaded settings
 */
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('nosqlGeneratorSettings');
        
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            settingsState.settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
            logInfo('Settings loaded from localStorage');
        } else {
            settingsState.settings = { ...DEFAULT_SETTINGS };
            logInfo('No saved settings found, using defaults');
        }
    } catch (error) {
        logError(`Error loading settings: ${error.message}`);
        settingsState.settings = { ...DEFAULT_SETTINGS };
    }
    
    return settingsState.settings;
}

/**
 * Save settings to localStorage
 * @param {Object} settings - The settings to save
 * @returns {boolean} Whether the save was successful
 */
function saveSettings(settings) {
    try {
        // Update settings state
        settingsState.settings = { ...settingsState.settings, ...settings };
        
        // Save to localStorage
        localStorage.setItem('nosqlGeneratorSettings', JSON.stringify(settingsState.settings));
        
        logInfo('Settings saved to localStorage');
        return true;
    } catch (error) {
        logError(`Error saving settings: ${error.message}`);
        return false;
    }
}

/**
 * Apply settings to UI elements
 */
function applySettingsToUI() {
    const settings = settingsState.settings;
    
    // Theme
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = settings.theme;
    }
    
    // Font size
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.value = settings.fontSize;
        fontSizeValue.textContent = `${settings.fontSize}px`;
        document.documentElement.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    }
    
    // Editor settings
    const autoFormat = document.getElementById('auto-format');
    const lineNumbers = document.getElementById('line-numbers');
    const syntaxHighlight = document.getElementById('syntax-highlight');
    
    if (autoFormat) autoFormat.checked = settings.autoFormat;
    if (lineNumbers) lineNumbers.checked = settings.lineNumbers;
    if (syntaxHighlight) syntaxHighlight.checked = settings.syntaxHighlight;
    
    // Export settings
    const defaultFilename = document.getElementById('default-filename');
    const includeMetadata = document.getElementById('include-metadata');
    
    if (defaultFilename) defaultFilename.value = settings.defaultFilename;
    if (includeMetadata) includeMetadata.checked = settings.includeMetadata;
    
    logInfo('Settings applied to UI');
}

/**
 * Set up event listeners for settings UI
 */
function setupSettingsEventListeners() {
    // Theme select
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            const theme = themeSelect.value;
            saveSettings({ theme });
            
            // Dispatch theme change event
            document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
        });
    }
    
    // Font size slider
    const fontSizeSlider = document.getElementById('font-size');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', () => {
            const fontSize = parseInt(fontSizeSlider.value);
            document.getElementById('font-size-value').textContent = `${fontSize}px`;
            document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
        });
        
        fontSizeSlider.addEventListener('change', () => {
            const fontSize = parseInt(fontSizeSlider.value);
            saveSettings({ fontSize });
        });
    }
    
    // Editor settings
    const autoFormat = document.getElementById('auto-format');
    const lineNumbers = document.getElementById('line-numbers');
    const syntaxHighlight = document.getElementById('syntax-highlight');
    
    if (autoFormat) {
        autoFormat.addEventListener('change', () => {
            saveSettings({ autoFormat: autoFormat.checked });
        });
    }
    
    if (lineNumbers) {
        lineNumbers.addEventListener('change', () => {
            saveSettings({ lineNumbers: lineNumbers.checked });
            
            // Update line numbers in UI
            document.dispatchEvent(new CustomEvent('line-numbers-change', { 
                detail: { enabled: lineNumbers.checked } 
            }));
        });
    }
    
    if (syntaxHighlight) {
        syntaxHighlight.addEventListener('change', () => {
            saveSettings({ syntaxHighlight: syntaxHighlight.checked });
            
            // Update syntax highlighting in UI
            document.dispatchEvent(new CustomEvent('syntax-highlight-change', { 
                detail: { enabled: syntaxHighlight.checked } 
            }));
        });
    }
    
    // Export settings
    const defaultFilename = document.getElementById('default-filename');
    const includeMetadata = document.getElementById('include-metadata');
    
    if (defaultFilename) {
        defaultFilename.addEventListener('change', () => {
            saveSettings({ defaultFilename: defaultFilename.value });
        });
    }
    
    if (includeMetadata) {
        includeMetadata.addEventListener('change', () => {
            saveSettings({ includeMetadata: includeMetadata.checked });
        });
    }
    
    // Reset settings button
    const resetSettingsButton = document.getElementById('reset-settings');
    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', resetSettings);
    }
    
    logInfo('Settings event listeners set up');
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
    // Reset settings state
    settingsState.settings = { ...DEFAULT_SETTINGS };
    
    // Save to localStorage
    localStorage.setItem('nosqlGeneratorSettings', JSON.stringify(settingsState.settings));
    
    // Apply to UI
    applySettingsToUI();
    
    // Show notification
    showNotification('info', 'Settings Reset', 'Settings have been reset to defaults');
    
    logInfo('Settings reset to defaults');
}

/**
 * Get a specific setting value
 * @param {string} key - The setting key
 * @returns {*} The setting value
 */
function getSetting(key) {
    return settingsState.settings[key];
}

/**
 * Update a specific setting
 * @param {string} key - The setting key
 * @param {*} value - The setting value
 * @returns {boolean} Whether the update was successful
 */
function updateSetting(key, value) {
    if (key in settingsState.settings) {
        const updatedSettings = { [key]: value };
        return saveSettings(updatedSettings);
    } else {
        logWarning(`Attempted to update unknown setting: ${key}`);
        return false;
    }
}

/**
 * Export settings to a file
 */
function exportSettings() {
    try {
        const settingsJson = JSON.stringify(settingsState.settings, null, 2);
        const blob = new Blob([settingsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nosql-generator-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
        
        showNotification('success', 'Settings Exported', 'Settings exported to file');
        logInfo('Settings exported to file');
    } catch (error) {
        showNotification('error', 'Export Failed', `Could not export settings: ${error.message}`);
        logError(`Error exporting settings: ${error.message}`);
    }
}

/**
 * Import settings from a file
 * @param {File} file - The settings file
 */
function importSettings(file) {
    try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                
                // Validate settings
                const validatedSettings = {};
                for (const key in DEFAULT_SETTINGS) {
                    if (key in importedSettings) {
                        validatedSettings[key] = importedSettings[key];
                    }
                }
                
                // Save settings
                saveSettings(validatedSettings);
                
                // Apply to UI
                applySettingsToUI();
                
                showNotification('success', 'Settings Imported', 'Settings imported successfully');
                logInfo('Settings imported from file');
            } catch (parseError) {
                showNotification('error', 'Import Failed', `Invalid settings file: ${parseError.message}`);
                logError(`Error parsing settings file: ${parseError.message}`);
            }
        };
        
        reader.onerror = () => {
            showNotification('error', 'Import Failed', 'Could not read settings file');
            logError('Error reading settings file');
        };
        
        reader.readAsText(file);
    } catch (error) {
        showNotification('error', 'Import Failed', `Could not import settings: ${error.message}`);
        logError(`Error importing settings: ${error.message}`);
    }
}

// Export functions
export {
    initSettings,
    loadSettings,
    saveSettings,
    resetSettings,
    getSetting,
    updateSetting,
    exportSettings,
    importSettings
};
