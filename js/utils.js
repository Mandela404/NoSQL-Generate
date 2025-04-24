/**
 * NoSQL Generator - Utilities Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module provides utility functions used throughout the application:
 * - File operations
 * - String manipulation
 * - ID generation
 * - Data validation
 * - Date formatting
 */

import { logInfo, logError } from './logger.js';

/**
 * Generate a random ID
 * @param {boolean} [short=false] - Whether to generate a short ID
 * @returns {string} The generated ID
 */
function generateId(short = false) {
    if (short) {
        return Math.random().toString(36).substring(2, 10);
    }
    
    // Generate a MongoDB-style ObjectId
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    
    return timestamp + machineId + processId + counter;
}

/**
 * Download content as a file
 * @param {string} content - The content to download
 * @param {string} filename - The filename
 * @param {string} [contentType='text/plain'] - The content type
 */
function downloadFile(content, filename, contentType = 'text/plain') {
    try {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        logInfo(`File downloaded: ${filename}`);
    } catch (error) {
        logError(`Error downloading file: ${error.message}`);
        throw error;
    }
}

/**
 * Format a date
 * @param {Date} date - The date to format
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - The format string
 * @returns {string} The formatted date
 */
function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const pad = (num, size = 2) => num.toString().padStart(size, '0');
    
    const replacements = {
        yyyy: date.getFullYear(),
        MM: pad(date.getMonth() + 1),
        dd: pad(date.getDate()),
        HH: pad(date.getHours()),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds()),
        SSS: pad(date.getMilliseconds(), 3)
    };
    
    return format.replace(/yyyy|MM|dd|HH|mm|ss|SSS/g, match => replacements[match]);
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} The throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} The cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    
    const clonedObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

/**
 * Validate JSON string
 * @param {string} jsonString - The JSON string to validate
 * @returns {Object} Validation result with isValid and error properties
 */
function validateJson(jsonString) {
    try {
        JSON.parse(jsonString);
        return { isValid: true, error: null };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
}

/**
 * Escape HTML special characters
 * @param {string} html - The HTML string to escape
 * @returns {string} The escaped HTML string
 */
function escapeHtml(html) {
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return html.replace(/[&<>"']/g, match => escapeMap[match]);
}

/**
 * Convert bytes to a human-readable size
 * @param {number} bytes - The size in bytes
 * @param {number} [decimals=2] - The number of decimal places
 * @returns {string} The formatted size
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Get a value from a nested object using a dot-notation path
 * @param {Object} obj - The object to get the value from
 * @param {string} path - The path to the value (e.g., 'user.address.city')
 * @param {*} [defaultValue=null] - The default value if the path doesn't exist
 * @returns {*} The value at the path or the default value
 */
function getNestedValue(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return defaultValue;
        }
        
        result = result[key];
    }
    
    return result === undefined ? defaultValue : result;
}

/**
 * Set a value in a nested object using a dot-notation path
 * @param {Object} obj - The object to set the value in
 * @param {string} path - The path to set the value at (e.g., 'user.address.city')
 * @param {*} value - The value to set
 * @returns {Object} The modified object
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        
        if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
            current[key] = {};
        }
        
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    
    return obj;
}

/**
 * Flatten a nested object
 * @param {Object} obj - The object to flatten
 * @param {string} [prefix=''] - The current key prefix
 * @param {string} [separator='.'] - The separator for nested keys
 * @returns {Object} The flattened object
 */
function flattenObject(obj, prefix = '', separator = '.') {
    const flattened = {};
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = prefix ? `${prefix}${separator}${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(flattened, flattenObject(obj[key], newKey, separator));
            } else {
                flattened[newKey] = obj[key];
            }
        }
    }
    
    return flattened;
}

/**
 * Unflatten a flattened object
 * @param {Object} obj - The flattened object
 * @param {string} [separator='.'] - The separator used for nested keys
 * @returns {Object} The unflattened object
 */
function unflattenObject(obj, separator = '.') {
    const result = {};
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            setNestedValue(result, key.replace(/\[(\d+)\]/g, '.$1'), obj[key]);
        }
    }
    
    return result;
}

/**
 * Generate a random color
 * @param {boolean} [asRgb=false] - Whether to return the color as RGB
 * @returns {string} The random color
 */
function randomColor(asRgb = false) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    if (asRgb) {
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Check if an object is empty
 * @param {Object} obj - The object to check
 * @returns {boolean} Whether the object is empty
 */
function isEmptyObject(obj) {
    return obj !== null && typeof obj === 'object' && Object.keys(obj).length === 0;
}

/**
 * Convert a string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} The camelCase string
 */
function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+|[-_]/g, '');
}

/**
 * Convert a string to snake_case
 * @param {string} str - The string to convert
 * @returns {string} The snake_case string
 */
function toSnakeCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : '_' + word.toLowerCase()
        )
        .replace(/\s+|[-]/g, '_');
}

/**
 * Convert a string to kebab-case
 * @param {string} str - The string to convert
 * @returns {string} The kebab-case string
 */
function toKebabCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : '-' + word.toLowerCase()
        )
        .replace(/\s+|[_]/g, '-');
}

// Export functions
export {
    generateId,
    downloadFile,
    formatDate,
    debounce,
    throttle,
    deepClone,
    validateJson,
    escapeHtml,
    formatBytes,
    getNestedValue,
    setNestedValue,
    flattenObject,
    unflattenObject,
    randomColor,
    isEmptyObject,
    toCamelCase,
    toSnakeCase,
    toKebabCase
};
