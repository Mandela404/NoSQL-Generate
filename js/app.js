/**
 * NoSQL Generator - Main Application Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This is the main entry point for the NoSQL Generator application.
 * It initializes all modules and coordinates their interactions.
 */

// Import modules
import { initUI, toggleTheme, toggleSidebar, toggleCmdLog } from './uiComponents.js';
import { initJsonFormatter, formatJson, validateJson } from './jsonFormatter.js';
import { initNoSQLGenerator, generateNoSQL } from './nosqlGenerator.js';
import { initPdfGenerator, generatePDF, previewPDF } from './pdfGenerator.js';
import { initSecurityTools } from './security.js';
import { initLogger, logInfo, logSuccess, logWarning, logError } from './logger.js';
import { showNotification, initNotifications } from './notifications.js';
import { initModal, showModal } from './modal.js';
import { saveSettings, loadSettings, initSettings } from './settings.js';
import { downloadFile } from './utils.js';
import { initI18n, translate, setLanguage, getCurrentLanguage, translatePage } from './i18n.js';

// Application state
const appState = {
    currentSection: 'json-formatter',
    theme: 'light',
    jsonData: null,
    nosqlData: null,
    settings: null,
    language: null,
    initialized: false
};

/**
 * Initialize the application
 */
function initApp() {
    logInfo('Initializing NoSQL Generator application...');
    
    // Load user settings
    appState.settings = loadSettings();
    
    // Initialize UI components
    initUI();
    initNotifications();
    initModal();
    initLogger();
    
    // Initialize internationalization
    initI18n();
    appState.language = getCurrentLanguage();
    
    // Initialize functional modules
    initJsonFormatter();
    initNoSQLGenerator();
    initPdfGenerator();
    initSecurityTools();
    initSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply saved theme
    if (appState.settings.theme) {
        applyTheme(appState.settings.theme);
    }
    
    // Mark as initialized
    appState.initialized = true;
    
    logSuccess('Application initialized successfully');
    showWelcomeMessage();
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Language change event listener
    document.addEventListener('language-changed', handleLanguageChange);
    
    // Language selector change
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', (event) => {
            setLanguage(event.target.value);
        });
    }
    logInfo('Setting up event listeners...');
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            navigateToSection(item.dataset.section);
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(newTheme);
        saveThemePreference(newTheme);
    });
    
    // CMD Log toggle
    document.getElementById('cmd-log-toggle').addEventListener('click', toggleCmdLog);
    document.getElementById('cmd-log-close').addEventListener('click', toggleCmdLog);
    
    // JSON Formatter buttons
    document.getElementById('format-json').addEventListener('click', handleFormatJson);
    document.getElementById('clear-json').addEventListener('click', handleClearJson);
    document.getElementById('copy-json').addEventListener('click', handleCopyJson);
    document.getElementById('download-json').addEventListener('click', handleDownloadJson);
    
    // NoSQL Generator buttons
    document.getElementById('generate-nosql').addEventListener('click', handleGenerateNoSQL);
    document.getElementById('copy-nosql').addEventListener('click', handleCopyNoSQL);
    document.getElementById('download-nosql').addEventListener('click', handleDownloadNoSQL);
    
    // PDF Generator buttons
    document.getElementById('preview-pdf').addEventListener('click', handlePreviewPDF);
    document.getElementById('generate-pdf').addEventListener('click', handleGeneratePDF);
    
    // Security tools buttons
    document.getElementById('generate-hash').addEventListener('click', handleGenerateHash);
    document.getElementById('encrypt-data').addEventListener('click', handleEncryptData);
    document.getElementById('decrypt-data').addEventListener('click', handleDecryptData);
    document.getElementById('copy-hash').addEventListener('click', () => handleCopySecurityOutput('hash-output'));
    document.getElementById('copy-encryption').addEventListener('click', () => handleCopySecurityOutput('encryption-output'));
    
    // Settings form changes
    document.getElementById('theme-select').addEventListener('change', handleThemeChange);
    document.getElementById('font-size').addEventListener('input', handleFontSizeChange);
    document.getElementById('auto-format').addEventListener('change', handleSettingChange);
    document.getElementById('line-numbers').addEventListener('change', handleSettingChange);
    document.getElementById('syntax-highlight').addEventListener('change', handleSettingChange);
    document.getElementById('default-filename').addEventListener('change', handleSettingChange);
    document.getElementById('include-metadata').addEventListener('change', handleSettingChange);
    
    logSuccess('Event listeners set up successfully');
}

/**
 * Handle language change event
 * @param {CustomEvent} event - The language change event
 */
function handleLanguageChange(event) {
    const { language } = event.detail;
    appState.language = language;
    
    // Update section title
    updateSectionTitle();
    
    logInfo(`Language changed to: ${language}`);
    
    // Show notification
    showNotification({
        type: 'success',
        message: translate('common.languageChanged', { language: language }),
        duration: 3000
    });
}

/**
 * Update section title based on current section and language
 */
function updateSectionTitle() {
    const sectionTitle = document.getElementById('section-title');
    if (!sectionTitle) return;
    
    let titleKey = '';
    
    switch (appState.currentSection) {
        case 'json-formatter':
            titleKey = 'json.title';
            break;
        case 'nosql-generator':
            titleKey = 'nosql.title';
            break;
        case 'pdf-generator':
            titleKey = 'pdf.title';
            break;
        case 'security-tools':
            titleKey = 'security.title';
            break;
        case 'settings':
            titleKey = 'settings.title';
            break;
        default:
            titleKey = 'json.title';
    }
    
    sectionTitle.textContent = translate(titleKey);
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - The ID of the section to navigate to
 */
function navigateToSection(sectionId) {
    logInfo(`Navigating to section: ${sectionId}`);
    
    // Update active section in sidebar
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    // Show the selected section, hide others
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Update section title
    const sectionTitle = document.getElementById('section-title');
    const sectionNames = {
        'json-formatter': 'JSON Formatter',
        'nosql-generator': 'NoSQL Generator',
        'pdf-generator': 'PDF Export',
        'security-tools': 'Security Tools',
        'settings': 'Settings'
    };
    
    sectionTitle.textContent = sectionNames[sectionId] || 'Unknown Section';
    
    // Update app state
    appState.currentSection = sectionId;
}

/**
 * Apply theme to the application
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
    logInfo(`Applying theme: ${theme}`);
    
    const themeToggleIcon = document.getElementById('theme-toggle').querySelector('i');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleIcon.classList.remove('fa-moon');
        themeToggleIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
    }
    
    appState.theme = theme;
}

/**
 * Save theme preference to settings
 * @param {string} theme - The theme preference to save
 */
function saveThemePreference(theme) {
    appState.settings.theme = theme;
    saveSettings(appState.settings);
    logInfo(`Theme preference saved: ${theme}`);
}

/**
 * Handle JSON formatting
 */
function handleFormatJson() {
    logInfo('Formatting JSON...');
    
    const jsonInput = document.getElementById('json-input').value.trim();
    
    if (!jsonInput) {
        showNotification('warning', 'Empty Input', 'Please enter JSON data to format');
        logWarning('JSON formatting attempted with empty input');
        return;
    }
    
    try {
        const result = formatJson(jsonInput);
        appState.jsonData = result.data;
        showNotification('success', 'JSON Formatted', 'JSON data formatted successfully');
        logSuccess('JSON formatted successfully');
    } catch (error) {
        showNotification('error', 'Format Error', error.message);
        logError(`JSON formatting error: ${error.message}`);
    }
}

/**
 * Handle clearing JSON input and output
 */
function handleClearJson() {
    document.getElementById('json-input').value = '';
    document.getElementById('json-output').textContent = '';
    appState.jsonData = null;
    logInfo('JSON input and output cleared');
    showNotification('info', 'Cleared', 'JSON input and output cleared');
}

/**
 * Handle copying formatted JSON to clipboard
 */
function handleCopyJson() {
    const jsonOutput = document.getElementById('json-output').textContent;
    
    if (!jsonOutput) {
        showNotification('warning', 'Nothing to Copy', 'Format JSON data first');
        logWarning('Copy attempted with empty JSON output');
        return;
    }
    
    navigator.clipboard.writeText(jsonOutput)
        .then(() => {
            showNotification('success', 'Copied!', 'JSON copied to clipboard');
            logSuccess('JSON copied to clipboard');
        })
        .catch(err => {
            showNotification('error', 'Copy Failed', 'Could not copy to clipboard');
            logError(`Copy to clipboard failed: ${err.message}`);
        });
}

/**
 * Handle downloading formatted JSON
 */
function handleDownloadJson() {
    const jsonOutput = document.getElementById('json-output').textContent;
    
    if (!jsonOutput) {
        showNotification('warning', 'Nothing to Download', 'Format JSON data first');
        logWarning('Download attempted with empty JSON output');
        return;
    }
    
    const filename = `${appState.settings.defaultFilename || 'json_export'}.json`;
    downloadFile(jsonOutput, filename, 'application/json');
    showNotification('success', 'Downloaded', `JSON saved as ${filename}`);
    logSuccess(`JSON downloaded as ${filename}`);
}

/**
 * Handle NoSQL generation
 */
function handleGenerateNoSQL() {
    logInfo('Generating NoSQL...');
    
    if (!appState.jsonData) {
        showNotification('warning', 'No JSON Data', 'Format JSON data first');
        logWarning('NoSQL generation attempted without JSON data');
        return;
    }
    
    try {
        const dbType = document.querySelector('input[name="db-type"]:checked').value;
        const structure = document.getElementById('doc-structure').value;
        const options = {
            addTimestamps: document.getElementById('add-timestamps').checked,
            addIds: document.getElementById('add-ids').checked,
            addIndexes: document.getElementById('add-indexes').checked
        };
        
        const result = generateNoSQL(appState.jsonData, dbType, structure, options);
        appState.nosqlData = result.data;
        
        showNotification('success', 'NoSQL Generated', `${dbType.toUpperCase()} document generated`);
        logSuccess(`NoSQL document generated for ${dbType}`);
    } catch (error) {
        showNotification('error', 'Generation Error', error.message);
        logError(`NoSQL generation error: ${error.message}`);
    }
}

/**
 * Handle copying NoSQL to clipboard
 */
function handleCopyNoSQL() {
    const nosqlOutput = document.getElementById('nosql-output').textContent;
    
    if (!nosqlOutput) {
        showNotification('warning', 'Nothing to Copy', 'Generate NoSQL data first');
        logWarning('Copy attempted with empty NoSQL output');
        return;
    }
    
    navigator.clipboard.writeText(nosqlOutput)
        .then(() => {
            showNotification('success', 'Copied!', 'NoSQL copied to clipboard');
            logSuccess('NoSQL copied to clipboard');
        })
        .catch(err => {
            showNotification('error', 'Copy Failed', 'Could not copy to clipboard');
            logError(`Copy to clipboard failed: ${err.message}`);
        });
}

/**
 * Handle downloading NoSQL
 */
function handleDownloadNoSQL() {
    const nosqlOutput = document.getElementById('nosql-output').textContent;
    
    if (!nosqlOutput) {
        showNotification('warning', 'Nothing to Download', 'Generate NoSQL data first');
        logWarning('Download attempted with empty NoSQL output');
        return;
    }
    
    const dbType = document.querySelector('input[name="db-type"]:checked').value;
    const filename = `${appState.settings.defaultFilename || 'nosql_export'}_${dbType}.js`;
    downloadFile(nosqlOutput, filename, 'application/javascript');
    showNotification('success', 'Downloaded', `NoSQL saved as ${filename}`);
    logSuccess(`NoSQL downloaded as ${filename}`);
}

/**
 * Handle PDF preview
 */
function handlePreviewPDF() {
    logInfo('Previewing PDF...');
    
    if (!appState.nosqlData) {
        showNotification('warning', 'No NoSQL Data', 'Generate NoSQL data first');
        logWarning('PDF preview attempted without NoSQL data');
        return;
    }
    
    try {
        const options = getPdfOptions();
        previewPDF(appState.nosqlData, options);
        showNotification('success', 'Preview Generated', 'PDF preview generated');
        logSuccess('PDF preview generated');
    } catch (error) {
        showNotification('error', 'Preview Error', error.message);
        logError(`PDF preview error: ${error.message}`);
    }
}

/**
 * Handle PDF generation and download
 */
function handleGeneratePDF() {
    logInfo('Generating PDF...');
    
    if (!appState.nosqlData) {
        showNotification('warning', 'No NoSQL Data', 'Generate NoSQL data first');
        logWarning('PDF generation attempted without NoSQL data');
        return;
    }
    
    try {
        const options = getPdfOptions();
        generatePDF(appState.nosqlData, options);
        showNotification('success', 'PDF Generated', 'PDF generated and downloaded');
        logSuccess('PDF generated and downloaded');
    } catch (error) {
        showNotification('error', 'Generation Error', error.message);
        logError(`PDF generation error: ${error.message}`);
    }
}

/**
 * Get PDF options from form
 * @returns {Object} PDF generation options
 */
function getPdfOptions() {
    return {
        title: document.getElementById('pdf-title').value || 'NoSQL Data Export',
        author: document.getElementById('pdf-author').value || 'Generated by NoSQL Generator',
        orientation: document.getElementById('pdf-orientation').value,
        includeTimestamp: document.getElementById('include-timestamp').checked,
        includeWatermark: document.getElementById('include-watermark').checked
    };
}

/**
 * Handle hash generation
 */
function handleGenerateHash() {
    logInfo('Generating hash...');
    
    const input = document.getElementById('hash-input').value.trim();
    const algorithm = document.getElementById('hash-algorithm').value;
    
    if (!input) {
        showNotification('warning', 'Empty Input', 'Please enter text to hash');
        logWarning('Hash generation attempted with empty input');
        return;
    }
    
    try {
        // The actual hash generation is in the security.js module
        // This just triggers the event and handles UI updates
        const event = new CustomEvent('generate-hash', {
            detail: { input, algorithm }
        });
        document.dispatchEvent(event);
        
        showNotification('success', 'Hash Generated', `${algorithm.toUpperCase()} hash generated`);
        logSuccess(`${algorithm.toUpperCase()} hash generated`);
    } catch (error) {
        showNotification('error', 'Hash Error', error.message);
        logError(`Hash generation error: ${error.message}`);
    }
}

/**
 * Handle data encryption
 */
function handleEncryptData() {
    logInfo('Encrypting data...');
    
    const input = document.getElementById('encryption-input').value.trim();
    const key = document.getElementById('encryption-key').value.trim();
    const algorithm = document.getElementById('encryption-algorithm').value;
    
    if (!input) {
        showNotification('warning', 'Empty Input', 'Please enter text to encrypt');
        logWarning('Encryption attempted with empty input');
        return;
    }
    
    if (!key) {
        showNotification('warning', 'No Key', 'Please enter an encryption key');
        logWarning('Encryption attempted without key');
        return;
    }
    
    try {
        // The actual encryption is in the security.js module
        // This just triggers the event and handles UI updates
        const event = new CustomEvent('encrypt-data', {
            detail: { input, key, algorithm }
        });
        document.dispatchEvent(event);
        
        showNotification('success', 'Data Encrypted', `Data encrypted using ${algorithm.toUpperCase()}`);
        logSuccess(`Data encrypted using ${algorithm.toUpperCase()}`);
    } catch (error) {
        showNotification('error', 'Encryption Error', error.message);
        logError(`Encryption error: ${error.message}`);
    }
}

/**
 * Handle data decryption
 */
function handleDecryptData() {
    logInfo('Decrypting data...');
    
    const input = document.getElementById('encryption-output').textContent.trim();
    const key = document.getElementById('encryption-key').value.trim();
    const algorithm = document.getElementById('encryption-algorithm').value;
    
    if (!input) {
        showNotification('warning', 'No Encrypted Data', 'Please encrypt data first');
        logWarning('Decryption attempted without encrypted data');
        return;
    }
    
    if (!key) {
        showNotification('warning', 'No Key', 'Please enter the decryption key');
        logWarning('Decryption attempted without key');
        return;
    }
    
    try {
        // The actual decryption is in the security.js module
        // This just triggers the event and handles UI updates
        const event = new CustomEvent('decrypt-data', {
            detail: { input, key, algorithm }
        });
        document.dispatchEvent(event);
        
        showNotification('success', 'Data Decrypted', `Data decrypted using ${algorithm.toUpperCase()}`);
        logSuccess(`Data decrypted using ${algorithm.toUpperCase()}`);
    } catch (error) {
        showNotification('error', 'Decryption Error', error.message);
        logError(`Decryption error: ${error.message}`);
    }
}

/**
 * Handle copying security output to clipboard
 * @param {string} elementId - The ID of the element containing the output to copy
 */
function handleCopySecurityOutput(elementId) {
    const output = document.getElementById(elementId).textContent;
    
    if (!output) {
        showNotification('warning', 'Nothing to Copy', 'Generate output first');
        logWarning(`Copy attempted with empty ${elementId}`);
        return;
    }
    
    navigator.clipboard.writeText(output)
        .then(() => {
            showNotification('success', 'Copied!', 'Output copied to clipboard');
            logSuccess('Security output copied to clipboard');
        })
        .catch(err => {
            showNotification('error', 'Copy Failed', 'Could not copy to clipboard');
            logError(`Copy to clipboard failed: ${err.message}`);
        });
}

/**
 * Handle theme change from settings
 */
function handleThemeChange() {
    const theme = document.getElementById('theme-select').value;
    applyTheme(theme);
    saveThemePreference(theme);
    logInfo(`Theme changed to ${theme}`);
}

/**
 * Handle font size change from settings
 */
function handleFontSizeChange() {
    const fontSize = document.getElementById('font-size').value;
    document.getElementById('font-size-value').textContent = `${fontSize}px`;
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
    
    appState.settings.fontSize = fontSize;
    saveSettings(appState.settings);
    logInfo(`Font size changed to ${fontSize}px`);
}

/**
 * Handle general setting changes
 */
function handleSettingChange() {
    // Update settings object with all current values
    appState.settings = {
        ...appState.settings,
        theme: document.getElementById('theme-select').value,
        fontSize: document.getElementById('font-size').value,
        autoFormat: document.getElementById('auto-format').checked,
        lineNumbers: document.getElementById('line-numbers').checked,
        syntaxHighlight: document.getElementById('syntax-highlight').checked,
        defaultFilename: document.getElementById('default-filename').value,
        includeMetadata: document.getElementById('include-metadata').checked
    };
    
    // Save updated settings
    saveSettings(appState.settings);
    logInfo('Settings updated');
}

/**
 * Show welcome message on first load
 */
function showWelcomeMessage() {
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            showModal(
                'Welcome to NoSQL Generator',
                `
                <p>Welcome to NoSQL Generator, a powerful tool for working with JSON and NoSQL databases!</p>
                <p>This application allows you to:</p>
                <ul>
                    <li>Format and validate JSON data</li>
                    <li>Generate NoSQL documents for various databases</li>
                    <li>Export data to beautifully formatted PDFs</li>
                    <li>Perform various security operations like hashing and encryption</li>
                </ul>
                <p>Get started by pasting your JSON data in the formatter!</p>
                `,
                'Get Started',
                () => {
                    localStorage.setItem('welcomeShown', 'true');
                }
            );
        }, 1000);
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions and state for other modules
export {
    appState,
    navigateToSection,
    applyTheme,
    handleLanguageChange,
    updateSectionTitle
};
