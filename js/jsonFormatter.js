/**
 * NoSQL Generator - JSON Formatter Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles JSON formatting and validation functionality:
 * - Parsing and validating JSON input
 * - Formatting JSON with different indentation options
 * - Syntax highlighting for JSON output
 * - Error handling for malformed JSON
 */

import { logInfo, logWarning, logError } from './logger.js';

// Module state
const formatterState = {
    lastInput: null,
    lastOutput: null,
    indentSize: 2,
    formatOptions: {
        sorted: false,
        noQuotes: false,
        compactArrays: false
    }
};

/**
 * Initialize the JSON formatter
 */
function initJsonFormatter() {
    logInfo('Initializing JSON formatter...');
    
    // Set up syntax highlighting for JSON output
    setupJsonSyntaxHighlighting();
    
    // Add event listener for indent size changes
    document.addEventListener('indent-size-change', (e) => {
        formatterState.indentSize = e.detail.size;
        if (formatterState.lastInput) {
            formatJson(formatterState.lastInput);
        }
    });
    
    // Add event listeners for format options
    document.addEventListener('format-options-change', (e) => {
        formatterState.formatOptions = { ...formatterState.formatOptions, ...e.detail };
        if (formatterState.lastInput) {
            formatJson(formatterState.lastInput);
        }
    });
}

/**
 * Format JSON string with proper indentation and structure
 * @param {string} jsonString - The JSON string to format
 * @returns {Object} Object containing the formatted data and metadata
 */
function formatJson(jsonString) {
    logInfo('Formatting JSON...');
    
    // Save input for potential reuse
    formatterState.lastInput = jsonString;
    
    try {
        // Parse JSON to validate it
        const jsonData = parseJson(jsonString);
        
        // Format with specified indentation
        const formattedJson = JSON.stringify(
            jsonData, 
            formatterState.formatOptions.sorted ? sortJsonKeys : null, 
            formatterState.indentSize
        );
        
        // Apply syntax highlighting
        const highlightedJson = applySyntaxHighlighting(formattedJson);
        
        // Update output display
        const outputElement = document.getElementById('json-output');
        outputElement.innerHTML = highlightedJson;
        
        // Save output for potential reuse
        formatterState.lastOutput = formattedJson;
        
        // Generate metadata about the JSON
        const metadata = generateJsonMetadata(jsonData);
        
        // Log success
        logInfo('JSON formatted successfully');
        
        return {
            data: jsonData,
            formatted: formattedJson,
            metadata
        };
    } catch (error) {
        handleJsonError(error);
        throw error;
    }
}

/**
 * Parse JSON string and handle common errors with helpful messages
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object} Parsed JSON object
 */
function parseJson(jsonString) {
    try {
        // Try to parse the JSON
        return JSON.parse(jsonString);
    } catch (error) {
        // Extract line and position information from error message
        const errorInfo = extractJsonErrorInfo(error.message);
        
        // Create a more helpful error message
        let enhancedMessage = `JSON Parse Error: ${error.message}`;
        
        if (errorInfo.line && errorInfo.position) {
            enhancedMessage += `\nError at line ${errorInfo.line}, position ${errorInfo.position}`;
            
            // Get the problematic line and highlight the issue
            const lines = jsonString.split('\n');
            if (errorInfo.line <= lines.length) {
                const problemLine = lines[errorInfo.line - 1];
                enhancedMessage += `\n\n${problemLine}\n`;
                enhancedMessage += ' '.repeat(errorInfo.position - 1) + '^';
            }
            
            // Add common fixes based on error type
            if (error.message.includes('Unexpected token')) {
                enhancedMessage += '\n\nPossible fixes:';
                enhancedMessage += '\n- Check for missing or extra commas';
                enhancedMessage += '\n- Ensure property names are in double quotes';
                enhancedMessage += '\n- Verify that all brackets and braces are properly closed';
            } else if (error.message.includes('Unexpected end of JSON input')) {
                enhancedMessage += '\n\nPossible fixes:';
                enhancedMessage += '\n- Check for unclosed brackets or braces';
                enhancedMessage += '\n- Ensure the JSON is complete';
            }
        }
        
        // Create a new error with the enhanced message
        const enhancedError = new Error(enhancedMessage);
        enhancedError.originalError = error;
        enhancedError.line = errorInfo.line;
        enhancedError.position = errorInfo.position;
        
        throw enhancedError;
    }
}

/**
 * Extract line and position information from JSON error message
 * @param {string} errorMessage - The error message from JSON.parse
 * @returns {Object} Object containing line and position information
 */
function extractJsonErrorInfo(errorMessage) {
    // Default values
    const info = {
        line: null,
        position: null
    };
    
    // Try to extract line and position from error message
    // Different browsers format this differently
    
    // Chrome format: "Unexpected token } in JSON at position 15"
    const chromeMatch = errorMessage.match(/at position (\d+)/);
    if (chromeMatch) {
        info.position = parseInt(chromeMatch[1], 10) + 1;
        
        // Calculate line number based on position
        if (formatterState.lastInput) {
            const inputUpToError = formatterState.lastInput.substring(0, parseInt(chromeMatch[1], 10));
            info.line = (inputUpToError.match(/\n/g) || []).length + 1;
        }
    }
    
    // Firefox format: "JSON.parse: unexpected character at line 2 column 3 of the JSON data"
    const firefoxMatch = errorMessage.match(/at line (\d+) column (\d+)/);
    if (firefoxMatch) {
        info.line = parseInt(firefoxMatch[1], 10);
        info.position = parseInt(firefoxMatch[2], 10);
    }
    
    return info;
}

/**
 * Handle JSON parsing or formatting errors
 * @param {Error} error - The error object
 */
function handleJsonError(error) {
    logError(`JSON Error: ${error.message}`);
    
    // Display error in output
    const outputElement = document.getElementById('json-output');
    outputElement.innerHTML = `<div class="json-error">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="error-message">${error.message.replace(/\n/g, '<br>')}</div>
    </div>`;
    
    // Add error styling if not already in CSS
    const style = document.createElement('style');
    style.textContent = `
        .json-error {
            color: var(--danger-color);
            padding: 10px;
            border-left: 3px solid var(--danger-color);
            background-color: rgba(220, 53, 69, 0.1);
        }
        
        .json-error i {
            margin-right: 10px;
        }
        
        .error-message {
            margin-top: 10px;
            font-family: var(--font-family-mono);
            white-space: pre-wrap;
        }
    `;
    
    // Only add the style once
    if (!document.querySelector('style[data-for="json-error"]')) {
        style.setAttribute('data-for', 'json-error');
        document.head.appendChild(style);
    }
}

/**
 * Sort JSON object keys for consistent output
 * @param {string} key - The key being processed
 * @param {*} value - The value being processed
 * @returns {*} The processed value
 */
function sortJsonKeys(key, value) {
    // If this is an object but not an array or null, sort its keys
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value)
            .sort()
            .reduce((sorted, key) => {
                sorted[key] = value[key];
                return sorted;
            }, {});
    }
    
    return value;
}

/**
 * Set up syntax highlighting for JSON output
 */
function setupJsonSyntaxHighlighting() {
    // Add CSS for syntax highlighting if not already present
    if (!document.querySelector('style[data-for="json-highlight"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-for', 'json-highlight');
        style.textContent = `
            .json-string { color: var(--success-color); }
            .json-number { color: var(--info-color); }
            .json-boolean { color: var(--warning-color); }
            .json-null { color: var(--danger-color); }
            .json-key { color: var(--primary-color); }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Apply syntax highlighting to formatted JSON
 * @param {string} json - The formatted JSON string
 * @returns {string} HTML with syntax highlighting
 */
function applySyntaxHighlighting(json) {
    // Replace JSON syntax elements with highlighted spans
    return json
        // Highlight strings (but not keys)
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    // Remove the colon from the match
                    match = match.replace(/:$/, '');
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            
            // For keys, add the colon back outside the span
            if (cls === 'json-key') {
                return `<span class="${cls}">${match}</span>:`;
            }
            
            return `<span class="${cls}">${match}</span>`;
        })
        // Make sure special characters are properly escaped for HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Validate JSON structure and provide feedback
 * @param {Object} jsonData - The parsed JSON data to validate
 * @returns {Object} Validation results with any issues found
 */
function validateJson(jsonData) {
    logInfo('Validating JSON structure...');
    
    const validation = {
        valid: true,
        issues: [],
        warnings: []
    };
    
    // Check for empty arrays or objects
    checkEmptyCollections(jsonData, '', validation);
    
    // Check for inconsistent array element types
    checkArrayConsistency(jsonData, '', validation);
    
    // Check for very deep nesting
    checkNestingDepth(jsonData, '', 0, validation);
    
    // Check for very large arrays
    checkLargeArrays(jsonData, '', validation);
    
    // Check for duplicate keys (requires original string)
    if (formatterState.lastInput) {
        checkDuplicateKeys(formatterState.lastInput, validation);
    }
    
    return validation;
}

/**
 * Check for empty arrays or objects in the JSON
 * @param {*} data - The data to check
 * @param {string} path - The current path in the JSON structure
 * @param {Object} validation - The validation results object
 */
function checkEmptyCollections(data, path, validation) {
    if (Array.isArray(data)) {
        if (data.length === 0) {
            validation.warnings.push({
                type: 'emptyArray',
                path: path || 'root',
                message: `Empty array found at ${path || 'root'}`
            });
        }
        
        // Check array elements
        data.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                checkEmptyCollections(item, itemPath, validation);
            }
        });
    } else if (typeof data === 'object' && data !== null) {
        if (Object.keys(data).length === 0) {
            validation.warnings.push({
                type: 'emptyObject',
                path: path || 'root',
                message: `Empty object found at ${path || 'root'}`
            });
        }
        
        // Check object properties
        for (const key in data) {
            const propPath = path ? `${path}.${key}` : key;
            if (typeof data[key] === 'object' && data[key] !== null) {
                checkEmptyCollections(data[key], propPath, validation);
            }
        }
    }
}

/**
 * Check for inconsistent types in arrays
 * @param {*} data - The data to check
 * @param {string} path - The current path in the JSON structure
 * @param {Object} validation - The validation results object
 */
function checkArrayConsistency(data, path, validation) {
    if (Array.isArray(data) && data.length > 1) {
        const types = data.map(item => {
            if (item === null) return 'null';
            if (Array.isArray(item)) return 'array';
            return typeof item;
        });
        
        const uniqueTypes = [...new Set(types)];
        
        if (uniqueTypes.length > 1) {
            validation.warnings.push({
                type: 'inconsistentArray',
                path: path || 'root',
                message: `Array at ${path || 'root'} contains mixed types: ${uniqueTypes.join(', ')}`
            });
        }
        
        // Check nested arrays
        data.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                checkArrayConsistency(item, itemPath, validation);
            }
        });
    }
    
    // Check arrays in objects
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        for (const key in data) {
            const propPath = path ? `${path}.${key}` : key;
            if (typeof data[key] === 'object' && data[key] !== null) {
                checkArrayConsistency(data[key], propPath, validation);
            }
        }
    }
}

/**
 * Check for excessive nesting depth
 * @param {*} data - The data to check
 * @param {string} path - The current path in the JSON structure
 * @param {number} depth - The current nesting depth
 * @param {Object} validation - The validation results object
 */
function checkNestingDepth(data, path, depth, validation) {
    const MAX_RECOMMENDED_DEPTH = 10;
    
    if (depth > MAX_RECOMMENDED_DEPTH) {
        validation.warnings.push({
            type: 'deepNesting',
            path: path || 'root',
            message: `Deep nesting (depth ${depth}) at ${path || 'root'}`
        });
    }
    
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                checkNestingDepth(item, itemPath, depth + 1, validation);
            }
        });
    } else if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            const propPath = path ? `${path}.${key}` : key;
            if (typeof data[key] === 'object' && data[key] !== null) {
                checkNestingDepth(data[key], propPath, depth + 1, validation);
            }
        }
    }
}

/**
 * Check for very large arrays that might cause performance issues
 * @param {*} data - The data to check
 * @param {string} path - The current path in the JSON structure
 * @param {Object} validation - The validation results object
 */
function checkLargeArrays(data, path, validation) {
    const LARGE_ARRAY_THRESHOLD = 1000;
    
    if (Array.isArray(data)) {
        if (data.length > LARGE_ARRAY_THRESHOLD) {
            validation.warnings.push({
                type: 'largeArray',
                path: path || 'root',
                message: `Large array (${data.length} items) at ${path || 'root'}`
            });
        }
        
        // Check nested arrays
        data.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                checkLargeArrays(item, itemPath, validation);
            }
        });
    } else if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            const propPath = path ? `${path}.${key}` : key;
            if (typeof data[key] === 'object' && data[key] !== null) {
                checkLargeArrays(data[key], propPath, validation);
            }
        }
    }
}

/**
 * Check for duplicate keys in the original JSON string
 * @param {string} jsonString - The original JSON string
 * @param {Object} validation - The validation results object
 */
function checkDuplicateKeys(jsonString, validation) {
    // This is a simple regex-based check that may not catch all cases
    // A more robust solution would use a specialized JSON parser
    
    const keyRegex = /"([^"]+)"(?=\s*:)/g;
    const keys = {};
    let match;
    
    while ((match = keyRegex.exec(jsonString)) !== null) {
        const key = match[1];
        const position = match.index;
        
        // Calculate line number
        const upToMatch = jsonString.substring(0, position);
        const lineNumber = (upToMatch.match(/\n/g) || []).length + 1;
        
        if (!keys[key]) {
            keys[key] = [];
        }
        
        keys[key].push({ line: lineNumber, position });
    }
    
    // Check for keys that appear multiple times
    for (const key in keys) {
        if (keys[key].length > 1) {
            validation.issues.push({
                type: 'duplicateKey',
                key,
                occurrences: keys[key],
                message: `Duplicate key "${key}" found at lines ${keys[key].map(o => o.line).join(', ')}`
            });
            
            validation.valid = false;
        }
    }
}

/**
 * Generate metadata about the JSON structure
 * @param {Object} jsonData - The parsed JSON data
 * @returns {Object} Metadata about the JSON
 */
function generateJsonMetadata(jsonData) {
    const metadata = {
        size: 0,
        nodeCount: 0,
        depth: 0,
        arrayCount: 0,
        objectCount: 0,
        keyCount: 0,
        valueTypes: {
            string: 0,
            number: 0,
            boolean: 0,
            null: 0,
            object: 0,
            array: 0
        }
    };
    
    // Calculate size in bytes
    metadata.size = new TextEncoder().encode(JSON.stringify(jsonData)).length;
    
    // Calculate other metrics
    calculateJsonMetrics(jsonData, metadata, 0);
    
    return metadata;
}

/**
 * Recursively calculate JSON metrics
 * @param {*} data - The current data node
 * @param {Object} metadata - The metadata object to update
 * @param {number} depth - The current depth in the JSON structure
 */
function calculateJsonMetrics(data, metadata, depth) {
    metadata.nodeCount++;
    metadata.depth = Math.max(metadata.depth, depth);
    
    if (data === null) {
        metadata.valueTypes.null++;
    } else if (Array.isArray(data)) {
        metadata.arrayCount++;
        metadata.valueTypes.array++;
        
        for (const item of data) {
            calculateJsonMetrics(item, metadata, depth + 1);
        }
    } else if (typeof data === 'object') {
        metadata.objectCount++;
        metadata.valueTypes.object++;
        metadata.keyCount += Object.keys(data).length;
        
        for (const key in data) {
            calculateJsonMetrics(data[key], metadata, depth + 1);
        }
    } else {
        metadata.valueTypes[typeof data]++;
    }
}

/**
 * Minify JSON by removing whitespace
 * @param {string} jsonString - The JSON string to minify
 * @returns {string} Minified JSON string
 */
function minifyJson(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed);
    } catch (error) {
        logError(`JSON minification error: ${error.message}`);
        throw error;
    }
}

/**
 * Convert JSON to a different format (XML, YAML, etc.)
 * @param {Object} jsonData - The parsed JSON data
 * @param {string} format - The target format
 * @returns {string} Converted data in the target format
 */
function convertJson(jsonData, format) {
    switch (format.toLowerCase()) {
        case 'xml':
            return jsonToXml(jsonData);
        case 'yaml':
        case 'yml':
            return jsonToYaml(jsonData);
        case 'csv':
            return jsonToCsv(jsonData);
        default:
            throw new Error(`Unsupported format: ${format}`);
    }
}

/**
 * Convert JSON to XML format
 * @param {Object} json - The JSON object to convert
 * @param {string} [rootName='root'] - The name of the root element
 * @returns {string} XML string
 */
function jsonToXml(json, rootName = 'root') {
    function toXml(json, name) {
        let xml = '';
        
        if (json === null || json === undefined) {
            xml += `<${name} />`;
        } else if (typeof json === 'object') {
            if (Array.isArray(json)) {
                for (let i = 0; i < json.length; i++) {
                    // For arrays, use singular form of the name if possible
                    const itemName = name.endsWith('s') ? name.slice(0, -1) : 'item';
                    xml += toXml(json[i], itemName);
                }
            } else {
                xml += `<${name}>`;
                for (const key in json) {
                    xml += toXml(json[key], key);
                }
                xml += `</${name}>`;
            }
        } else {
            xml += `<${name}>${json}</${name}>`;
        }
        
        return xml;
    }
    
    return `<?xml version="1.0" encoding="UTF-8" ?>\n${toXml(json, rootName)}`;
}

/**
 * Convert JSON to YAML format
 * @param {Object} json - The JSON object to convert
 * @param {number} [indent=2] - The indentation level
 * @returns {string} YAML string
 */
function jsonToYaml(json, indent = 2) {
    function toYaml(obj, level = 0) {
        const spaces = ' '.repeat(level * indent);
        let yaml = '';
        
        if (obj === null || obj === undefined) {
            yaml += 'null';
        } else if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                if (obj.length === 0) {
                    yaml += '[]';
                } else {
                    for (const item of obj) {
                        yaml += `\n${spaces}- `;
                        
                        if (typeof item === 'object' && item !== null) {
                            yaml += toYaml(item, level + 1).trimStart();
                        } else {
                            yaml += formatScalarForYaml(item);
                        }
                    }
                }
            } else {
                if (Object.keys(obj).length === 0) {
                    yaml += '{}';
                } else {
                    for (const key in obj) {
                        yaml += `\n${spaces}${key}: `;
                        
                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            yaml += toYaml(obj[key], level + 1).trimStart();
                        } else {
                            yaml += formatScalarForYaml(obj[key]);
                        }
                    }
                }
            }
        } else {
            yaml += formatScalarForYaml(obj);
        }
        
        return yaml;
    }
    
    function formatScalarForYaml(value) {
        if (typeof value === 'string') {
            // Check if the string needs quotes
            if (
                value.includes('\n') || 
                value.includes(':') || 
                value.includes('{') || 
                value.includes('}') || 
                value.includes('[') || 
                value.includes(']') || 
                value.includes(',') ||
                value.match(/^[\d\.\-]+$/) || // Looks like a number
                value.trim() === ''
            ) {
                return `"${value.replace(/"/g, '\\"')}"`;
            }
            return value;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
            return String(value);
        } else if (value === null || value === undefined) {
            return 'null';
        }
        return String(value);
    }
    
    return toYaml(json).trim();
}

/**
 * Convert JSON to CSV format
 * @param {Object} json - The JSON object to convert
 * @returns {string} CSV string
 */
function jsonToCsv(json) {
    // Only works for arrays of objects with the same structure
    if (!Array.isArray(json) || json.length === 0) {
        throw new Error('JSON must be an array of objects for CSV conversion');
    }
    
    // Get headers from the first object
    const headers = Object.keys(json[0]);
    
    // Create CSV rows
    const rows = [
        headers.join(','), // Header row
        ...json.map(obj => {
            return headers.map(header => {
                const value = obj[header];
                
                // Format value for CSV
                if (value === null || value === undefined) {
                    return '';
                } else if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                } else if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                } else {
                    return String(value);
                }
            }).join(',');
        })
    ];
    
    return rows.join('\n');
}

// Export functions
export {
    initJsonFormatter,
    formatJson,
    validateJson,
    minifyJson,
    convertJson
};
