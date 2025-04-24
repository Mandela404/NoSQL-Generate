/**
 * NoSQL Generator - Security Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles security-related functionality:
 * - Hash generation (MD5, SHA-1, SHA-256, SHA-512)
 * - Encryption and decryption (AES, DES, Triple DES)
 * - Base64 encoding and decoding
 */

import { logInfo, logSuccess, logWarning, logError } from './logger.js';

// Module state
const securityState = {
    initialized: false,
    lastInput: null,
    lastOutput: null,
    lastOperation: null
};

/**
 * Initialize the security tools
 */
function initSecurityTools() {
    if (securityState.initialized) return;
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        logError('Security tools initialization failed: CryptoJS not found');
        return;
    }
    
    // Set up event listeners
    document.addEventListener('generate-hash', handleGenerateHash);
    document.addEventListener('encrypt-data', handleEncryptData);
    document.addEventListener('decrypt-data', handleDecryptData);
    
    // Mark as initialized
    securityState.initialized = true;
    logInfo('Security tools initialized');
}

/**
 * Handle hash generation event
 * @param {CustomEvent} event - The event with input and algorithm details
 */
function handleGenerateHash(event) {
    const { input, algorithm } = event.detail;
    
    try {
        const hash = generateHash(input, algorithm);
        
        // Update output element
        const outputElement = document.getElementById('hash-output');
        if (outputElement) {
            outputElement.textContent = hash;
        }
        
        // Update state
        securityState.lastInput = input;
        securityState.lastOutput = hash;
        securityState.lastOperation = `${algorithm} hash`;
        
        logSuccess(`${algorithm.toUpperCase()} hash generated successfully`);
    } catch (error) {
        logError(`Hash generation error: ${error.message}`);
        
        // Show error in output
        const outputElement = document.getElementById('hash-output');
        if (outputElement) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    }
}

/**
 * Handle data encryption event
 * @param {CustomEvent} event - The event with input, key, and algorithm details
 */
function handleEncryptData(event) {
    const { input, key, algorithm } = event.detail;
    
    try {
        const encrypted = encryptData(input, key, algorithm);
        
        // Update output element
        const outputElement = document.getElementById('encryption-output');
        if (outputElement) {
            outputElement.textContent = encrypted;
        }
        
        // Update state
        securityState.lastInput = input;
        securityState.lastOutput = encrypted;
        securityState.lastOperation = `${algorithm} encryption`;
        
        logSuccess(`Data encrypted using ${algorithm.toUpperCase()}`);
    } catch (error) {
        logError(`Encryption error: ${error.message}`);
        
        // Show error in output
        const outputElement = document.getElementById('encryption-output');
        if (outputElement) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    }
}

/**
 * Handle data decryption event
 * @param {CustomEvent} event - The event with input, key, and algorithm details
 */
function handleDecryptData(event) {
    const { input, key, algorithm } = event.detail;
    
    try {
        const decrypted = decryptData(input, key, algorithm);
        
        // Update input element with decrypted data
        const inputElement = document.getElementById('encryption-input');
        if (inputElement) {
            inputElement.value = decrypted;
        }
        
        // Clear output element
        const outputElement = document.getElementById('encryption-output');
        if (outputElement) {
            outputElement.textContent = '';
        }
        
        // Update state
        securityState.lastInput = input;
        securityState.lastOutput = decrypted;
        securityState.lastOperation = `${algorithm} decryption`;
        
        logSuccess(`Data decrypted using ${algorithm.toUpperCase()}`);
    } catch (error) {
        logError(`Decryption error: ${error.message}`);
        
        // Show error in input
        const inputElement = document.getElementById('encryption-input');
        if (inputElement) {
            inputElement.value = `Error: ${error.message}`;
        }
    }
}

/**
 * Generate a hash from input text
 * @param {string} input - The input text to hash
 * @param {string} algorithm - The hash algorithm to use
 * @returns {string} The generated hash
 */
function generateHash(input, algorithm) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    let hash;
    
    switch (algorithm.toLowerCase()) {
        case 'md5':
            hash = CryptoJS.MD5(input).toString();
            break;
        case 'sha1':
            hash = CryptoJS.SHA1(input).toString();
            break;
        case 'sha256':
            hash = CryptoJS.SHA256(input).toString();
            break;
        case 'sha512':
            hash = CryptoJS.SHA512(input).toString();
            break;
        default:
            throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }
    
    return hash;
}

/**
 * Encrypt data using the specified algorithm
 * @param {string} input - The input text to encrypt
 * @param {string} key - The encryption key
 * @param {string} algorithm - The encryption algorithm to use
 * @returns {string} The encrypted data
 */
function encryptData(input, key, algorithm) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    if (!key) {
        throw new Error('Encryption key is required');
    }
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    let encrypted;
    
    switch (algorithm.toLowerCase()) {
        case 'aes':
            encrypted = CryptoJS.AES.encrypt(input, key).toString();
            break;
        case 'des':
            encrypted = CryptoJS.DES.encrypt(input, key).toString();
            break;
        case 'tripledes':
            encrypted = CryptoJS.TripleDES.encrypt(input, key).toString();
            break;
        default:
            throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
    }
    
    return encrypted;
}

/**
 * Decrypt data using the specified algorithm
 * @param {string} input - The encrypted text to decrypt
 * @param {string} key - The decryption key
 * @param {string} algorithm - The decryption algorithm to use
 * @returns {string} The decrypted data
 */
function decryptData(input, key, algorithm) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    if (!key) {
        throw new Error('Decryption key is required');
    }
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    let decrypted;
    
    try {
        switch (algorithm.toLowerCase()) {
            case 'aes':
                decrypted = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
                break;
            case 'des':
                decrypted = CryptoJS.DES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
                break;
            case 'tripledes':
                decrypted = CryptoJS.TripleDES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
                break;
            default:
                throw new Error(`Unsupported decryption algorithm: ${algorithm}`);
        }
        
        if (!decrypted) {
            throw new Error('Decryption failed. Check your key and try again.');
        }
        
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed. Check your key and try again.');
    }
}

/**
 * Encode data to Base64
 * @param {string} input - The input text to encode
 * @returns {string} The Base64 encoded string
 */
function encodeBase64(input) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
}

/**
 * Decode Base64 data
 * @param {string} input - The Base64 encoded string to decode
 * @returns {string} The decoded string
 */
function decodeBase64(input) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    try {
        return CryptoJS.enc.Base64.parse(input).toString(CryptoJS.enc.Utf8);
    } catch (error) {
        throw new Error('Invalid Base64 string');
    }
}

/**
 * Generate a random encryption key
 * @param {number} [length=32] - The key length in characters
 * @returns {string} The generated key
 */
function generateRandomKey(length = 32) {
    // Check if CryptoJS is available
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not found');
    }
    
    // Generate random words
    const words = CryptoJS.lib.WordArray.random(length / 2); // 2 characters per byte
    
    return words.toString(CryptoJS.enc.Hex);
}

/**
 * Get the current security state
 * @returns {Object} The current security state
 */
function getSecurityState() {
    return { ...securityState };
}

// Export functions
export {
    initSecurityTools,
    generateHash,
    encryptData,
    decryptData,
    encodeBase64,
    decodeBase64,
    generateRandomKey,
    getSecurityState
};
