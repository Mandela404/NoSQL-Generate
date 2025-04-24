/**
 * NoSQL Generator - MongoDB Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles MongoDB document generation from JSON data.
 */

import { generateId } from '../utils.js';
import { logInfo } from '../logger.js';

/**
 * Generate MongoDB documents from JSON data
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} structure - The document structure type
 * @param {Object} options - Generation options
 * @returns {string} MongoDB document code
 */
function generateMongoDBDocuments(jsonData, structure, options) {
    logInfo('Generating MongoDB documents...');
    
    let result = '';
    
    // Add MongoDB shell commands
    result += '// MongoDB Shell Commands\n';
    result += '// Run these commands in MongoDB shell or MongoDB Compass\n\n';
    
    // Get the collection name from the first key or use a default
    const collectionName = Array.isArray(jsonData) ? 'items' : 
                          Object.keys(jsonData).length > 0 ? Object.keys(jsonData)[0] : 
                          'collection';
    
    // Add use database statement
    result += `use ${options.dbName || 'nosql_generator_db'};\n\n`;
    
    // Generate documents based on structure type
    switch (structure) {
        case 'nested':
            result += generateNestedDocuments(jsonData, collectionName, options);
            break;
        case 'flat':
            result += generateFlatDocuments(jsonData, collectionName, options);
            break;
        case 'references':
            result += generateReferencedDocuments(jsonData, collectionName, options);
            break;
        case 'arrays':
            result += generateArrayBasedDocuments(jsonData, collectionName, options);
            break;
        default:
            result += generateNestedDocuments(jsonData, collectionName, options);
    }
    
    // Add index suggestions if enabled
    if (options.addIndexes) {
        result += generateIndexSuggestions(jsonData, collectionName);
    }
    
    return result;
}

/**
 * Generate nested MongoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} MongoDB document code
 */
function generateNestedDocuments(jsonData, collectionName, options) {
    let result = `// Nested document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate insert statements
    result += `db.${collectionName}.insertMany([\n`;
    
    dataArray.forEach((item, index) => {
        result += '  {\n';
        
        // Add _id if enabled
        if (options.addIds) {
            result += `    _id: ObjectId("${generateId()}"),\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            const now = new Date().toISOString();
            result += `    createdAt: ISODate("${now}"),\n`;
            result += `    updatedAt: ISODate("${now}"),\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value], i) => {
            result += `    ${key}: ${mongoValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += ']);\n\n';
    
    return result;
}

/**
 * Generate flat MongoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} MongoDB document code
 */
function generateFlatDocuments(jsonData, collectionName, options) {
    let result = `// Flat document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate insert statements
    result += `db.${collectionName}.insertMany([\n`;
    
    dataArray.forEach((item, index) => {
        result += '  {\n';
        
        // Add _id if enabled
        if (options.addIds) {
            result += `    _id: ObjectId("${generateId()}"),\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            const now = new Date().toISOString();
            result += `    createdAt: ISODate("${now}"),\n`;
            result += `    updatedAt: ISODate("${now}"),\n`;
        }
        
        // Flatten the object and add fields
        const flattenedObject = flattenObject(item);
        Object.entries(flattenedObject).forEach(([key, value], i) => {
            result += `    ${key}: ${mongoValueToString(value)}${i < Object.entries(flattenedObject).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += ']);\n\n';
    
    return result;
}

/**
 * Generate MongoDB documents with references
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} MongoDB document code
 */
function generateReferencedDocuments(jsonData, collectionName, options) {
    let result = `// Referenced document structure\n`;
    const collections = {};
    
    // Extract potential collections from nested objects
    if (Array.isArray(jsonData)) {
        collections[collectionName] = jsonData;
        extractReferencedCollections(jsonData, collections);
    } else {
        collections[collectionName] = [jsonData];
        extractReferencedCollections([jsonData], collections);
    }
    
    // Generate documents for each collection
    Object.entries(collections).forEach(([collection, items]) => {
        result += `// Collection: ${collection}\n`;
        result += `db.${collection}.insertMany([\n`;
        
        items.forEach((item, index) => {
            result += '  {\n';
            
            // Add _id if enabled
            if (options.addIds) {
                result += `    _id: ObjectId("${generateId()}"),\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                const now = new Date().toISOString();
                result += `    createdAt: ISODate("${now}"),\n`;
                result += `    updatedAt: ISODate("${now}"),\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value], i) => {
                // Skip nested objects that became separate collections
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                    result += `    ${key}Ref: ObjectId("${generateId()}"),\n`;
                } else {
                    result += `    ${key}: ${mongoValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
                }
            });
            
            result += `  }${index < items.length - 1 ? ',' : ''}\n`;
        });
        
        result += ']);\n\n';
    });
    
    return result;
}

/**
 * Generate array-based MongoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} MongoDB document code
 */
function generateArrayBasedDocuments(jsonData, collectionName, options) {
    let result = `// Array-based document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate a single document with arrays
    result += `db.${collectionName}.insertOne({\n`;
    
    // Add _id if enabled
    if (options.addIds) {
        result += `  _id: ObjectId("${generateId()}"),\n`;
    }
    
    // Add timestamps if enabled
    if (options.addTimestamps) {
        const now = new Date().toISOString();
        result += `  createdAt: ISODate("${now}"),\n`;
        result += `  updatedAt: ISODate("${now}"),\n`;
    }
    
    // Add items array
    result += `  items: [\n`;
    
    dataArray.forEach((item, index) => {
        result += '    {\n';
        
        // Add item _id if enabled
        if (options.addIds) {
            result += `      _id: ObjectId("${generateId()}"),\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value], i) => {
            result += `      ${key}: ${mongoValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `    }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += '  ]\n';
    result += '});\n\n';
    
    return result;
}

/**
 * Generate index suggestions for MongoDB
 * @param {Object} jsonData - The JSON data to analyze
 * @param {string} collectionName - The name of the collection
 * @returns {string} MongoDB index suggestions
 */
function generateIndexSuggestions(jsonData, collectionName) {
    let result = `// Index Suggestions\n`;
    const indexFields = [];
    
    // Analyze data to find potential index fields
    if (Array.isArray(jsonData) && jsonData.length > 0) {
        const sampleItem = jsonData[0];
        
        // Look for common index candidates
        Object.entries(sampleItem).forEach(([key, value]) => {
            // ID fields are good candidates
            if (key.toLowerCase().includes('id') || key.toLowerCase().endsWith('_id')) {
                indexFields.push(key);
            }
            
            // Date fields are good candidates
            if (
                (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) ||
                value instanceof Date ||
                key.toLowerCase().includes('date') ||
                key.toLowerCase().includes('time')
            ) {
                indexFields.push(key);
            }
            
            // Name, email, username fields are good candidates
            if (
                key.toLowerCase().includes('name') ||
                key.toLowerCase().includes('email') ||
                key.toLowerCase().includes('username')
            ) {
                indexFields.push(key);
            }
        });
    }
    
    // Generate index creation commands
    if (indexFields.length > 0) {
        indexFields.forEach(field => {
            result += `db.${collectionName}.createIndex({ ${field}: 1 }, { name: "${field}_index" });\n`;
        });
        
        // If we have multiple fields, suggest a compound index
        if (indexFields.length > 1) {
            result += '\n// Compound Index Suggestion\n';
            result += `db.${collectionName}.createIndex({ `;
            
            indexFields.slice(0, 2).forEach((field, index) => {
                result += `${field}: 1${index < 1 ? ', ' : ''}`;
            });
            
            result += ` }, { name: "compound_index" });\n`;
        }
    } else {
        result += '// No obvious index candidates found in this data structure\n';
    }
    
    return result;
}

/**
 * Extract collections for referenced document structure
 * @param {Array} items - The items to analyze
 * @param {Object} collections - Collections object to update
 */
function extractReferencedCollections(items, collections) {
    items.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            // If it's an object, make it a separate collection
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                const collectionName = key.endsWith('s') ? key : `${key}s`;
                
                if (!collections[collectionName]) {
                    collections[collectionName] = [];
                }
                
                collections[collectionName].push(value);
            }
            
            // If it's an array of objects, make each object a separate document
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                const collectionName = key.endsWith('s') ? key : `${key}s`;
                
                if (!collections[collectionName]) {
                    collections[collectionName] = [];
                }
                
                collections[collectionName].push(...value);
                extractReferencedCollections(value, collections);
            }
        });
    });
}

/**
 * Flatten a nested object
 * @param {Object} obj - The object to flatten
 * @param {string} [prefix=''] - The current key prefix
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};
    
    Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    });
    
    return flattened;
}

/**
 * Convert JavaScript value to MongoDB syntax string
 * @param {*} value - The value to convert
 * @returns {string} MongoDB syntax string
 */
function mongoValueToString(value) {
    if (value === null) {
        return 'null';
    } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    } else if (value instanceof Date) {
        return `ISODate("${value.toISOString()}")`;
    } else if (Array.isArray(value)) {
        return `[${value.map(item => mongoValueToString(item)).join(', ')}]`;
    } else if (typeof value === 'object') {
        const entries = Object.entries(value).map(([k, v]) => `${k}: ${mongoValueToString(v)}`);
        return `{ ${entries.join(', ')} }`;
    }
    
    return String(value);
}

export { generateMongoDBDocuments };
