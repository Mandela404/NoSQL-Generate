/**
 * NoSQL Generator - CouchDB Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles CouchDB document generation from JSON data.
 */

import { generateId } from '../utils.js';
import { logInfo } from '../logger.js';

/**
 * Generate CouchDB documents from JSON data
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} structure - The document structure type
 * @param {Object} options - Generation options
 * @returns {string} CouchDB document code
 */
function generateCouchDBDocuments(jsonData, structure, options) {
    logInfo('Generating CouchDB documents...');
    
    let result = '';
    
    // Add CouchDB client initialization
    result += '// CouchDB Code\n';
    result += '// Requires nano (CouchDB client) to be installed\n\n';
    result += '// Import nano\n';
    result += 'const nano = require("nano")("http://localhost:5984");\n\n';
    
    // Get the database name from the first key or use a default
    const dbName = options.dbName || 'nosql_generator_db';
    
    // Add database creation
    result += `// Create database if it doesn't exist\n`;
    result += `async function createDatabase() {\n`;
    result += `  try {\n`;
    result += `    await nano.db.create("${dbName}");\n`;
    result += `    console.log("Database '${dbName}' created");\n`;
    result += `  } catch (err) {\n`;
    result += `    if (err.statusCode === 412) {\n`;
    result += `      console.log("Database '${dbName}' already exists");\n`;
    result += `    } else {\n`;
    result += `      console.error("Error creating database:", err);\n`;
    result += `    }\n`;
    result += `  }\n`;
    result += `}\n\n`;
    
    // Get database reference
    result += `// Get database reference\n`;
    result += `const db = nano.use("${dbName}");\n\n`;
    
    // Generate documents based on structure type
    switch (structure) {
        case 'nested':
            result += generateNestedDocuments(jsonData, options);
            break;
        case 'flat':
            result += generateFlatDocuments(jsonData, options);
            break;
        case 'references':
            result += generateReferencedDocuments(jsonData, options);
            break;
        case 'arrays':
            result += generateArrayBasedDocuments(jsonData, options);
            break;
        default:
            result += generateNestedDocuments(jsonData, options);
    }
    
    // Add index suggestions if enabled
    if (options.addIndexes) {
        result += generateIndexSuggestions(jsonData);
    }
    
    // Add main function to execute all operations
    result += `// Main function to execute all operations\n`;
    result += `async function main() {\n`;
    result += `  await createDatabase();\n`;
    
    switch (structure) {
        case 'nested':
            result += `  await addNestedDocuments();\n`;
            break;
        case 'flat':
            result += `  await addFlatDocuments();\n`;
            break;
        case 'references':
            result += `  await addReferencedDocuments();\n`;
            break;
        case 'arrays':
            result += `  await addArrayBasedDocument();\n`;
            break;
        default:
            result += `  await addNestedDocuments();\n`;
    }
    
    if (options.addIndexes) {
        result += `  await createIndexes();\n`;
    }
    
    result += `}\n\n`;
    result += `// Run the main function\n`;
    result += `main().catch(err => console.error("Error:", err));\n`;
    
    return result;
}

/**
 * Generate nested CouchDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {Object} options - Generation options
 * @returns {string} CouchDB document code
 */
function generateNestedDocuments(jsonData, options) {
    let result = `// Nested document structure\n`;
    result += `// Function to add nested documents\n`;
    result += `async function addNestedDocuments() {\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Use bulk operation if there are multiple documents
    if (dataArray.length > 1) {
        result += `  // Prepare documents for bulk insert\n`;
        result += `  const docs = [\n`;
        
        dataArray.forEach((item, index) => {
            result += `    {\n`;
            
            // Add _id if enabled
            if (options.addIds) {
                result += `      _id: "${generateId(true)}",\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                const now = new Date().toISOString();
                result += `      createdAt: "${now}",\n`;
                result += `      updatedAt: "${now}",\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value], i) => {
                result += `      ${key}: ${couchValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
            });
            
            result += `    }${index < dataArray.length - 1 ? ',' : ''}\n`;
        });
        
        result += `  ];\n\n`;
        
        // Add bulk insert operation
        result += `  try {\n`;
        result += `    const response = await db.bulk({ docs });\n`;
        result += `    console.log("Bulk insert successful:", response.length, "documents inserted");\n`;
        result += `    return response;\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error inserting documents:", err);\n`;
        result += `    throw err;\n`;
        result += `  }\n`;
    } else {
        // Single document insert
        const item = dataArray[0];
        
        result += `  // Prepare document\n`;
        result += `  const doc = {\n`;
        
        // Add _id if enabled
        if (options.addIds) {
            result += `    _id: "${generateId(true)}",\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            const now = new Date().toISOString();
            result += `    createdAt: "${now}",\n`;
            result += `    updatedAt: "${now}",\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value], i) => {
            result += `    ${key}: ${couchValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  };\n\n`;
        
        // Add insert operation
        result += `  try {\n`;
        result += `    const response = await db.insert(doc);\n`;
        result += `    console.log("Document inserted successfully:", response.id);\n`;
        result += `    return response;\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error inserting document:", err);\n`;
        result += `    throw err;\n`;
        result += `  }\n`;
    }
    
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate flat CouchDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {Object} options - Generation options
 * @returns {string} CouchDB document code
 */
function generateFlatDocuments(jsonData, options) {
    let result = `// Flat document structure\n`;
    result += `// Function to add flat documents\n`;
    result += `async function addFlatDocuments() {\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Use bulk operation if there are multiple documents
    if (dataArray.length > 1) {
        result += `  // Prepare documents for bulk insert\n`;
        result += `  const docs = [\n`;
        
        dataArray.forEach((item, index) => {
            // Flatten the object
            const flattenedObject = flattenObject(item);
            
            result += `    {\n`;
            
            // Add _id if enabled
            if (options.addIds) {
                result += `      _id: "${generateId(true)}",\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                const now = new Date().toISOString();
                result += `      createdAt: "${now}",\n`;
                result += `      updatedAt: "${now}",\n`;
            }
            
            // Add the flattened data fields
            Object.entries(flattenedObject).forEach(([key, value], i) => {
                result += `      ${key}: ${couchValueToString(value)}${i < Object.entries(flattenedObject).length - 1 ? ',' : ''}\n`;
            });
            
            result += `    }${index < dataArray.length - 1 ? ',' : ''}\n`;
        });
        
        result += `  ];\n\n`;
        
        // Add bulk insert operation
        result += `  try {\n`;
        result += `    const response = await db.bulk({ docs });\n`;
        result += `    console.log("Bulk insert successful:", response.length, "flat documents inserted");\n`;
        result += `    return response;\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error inserting flat documents:", err);\n`;
        result += `    throw err;\n`;
        result += `  }\n`;
    } else {
        // Single document insert
        const item = dataArray[0];
        const flattenedObject = flattenObject(item);
        
        result += `  // Prepare flat document\n`;
        result += `  const doc = {\n`;
        
        // Add _id if enabled
        if (options.addIds) {
            result += `    _id: "${generateId(true)}",\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            const now = new Date().toISOString();
            result += `    createdAt: "${now}",\n`;
            result += `    updatedAt: "${now}",\n`;
        }
        
        // Add the flattened data fields
        Object.entries(flattenedObject).forEach(([key, value], i) => {
            result += `    ${key}: ${couchValueToString(value)}${i < Object.entries(flattenedObject).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  };\n\n`;
        
        // Add insert operation
        result += `  try {\n`;
        result += `    const response = await db.insert(doc);\n`;
        result += `    console.log("Flat document inserted successfully:", response.id);\n`;
        result += `    return response;\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error inserting flat document:", err);\n`;
        result += `    throw err;\n`;
        result += `  }\n`;
    }
    
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate CouchDB documents with references
 * @param {Object} jsonData - The JSON data to convert
 * @param {Object} options - Generation options
 * @returns {string} CouchDB document code
 */
function generateReferencedDocuments(jsonData, options) {
    let result = `// Referenced document structure\n`;
    result += `// Function to add documents with references\n`;
    result += `async function addReferencedDocuments() {\n`;
    
    // Extract document types and their items
    const docTypes = {};
    
    if (Array.isArray(jsonData)) {
        docTypes['main'] = jsonData;
        extractReferencedDocTypes(jsonData, docTypes);
    } else {
        docTypes['main'] = [jsonData];
        extractReferencedDocTypes([jsonData], docTypes);
    }
    
    // Generate documents for each type
    Object.entries(docTypes).forEach(([docType, items], typeIndex) => {
        result += `  // ${docType} documents\n`;
        result += `  const ${docType}Docs = [\n`;
        
        items.forEach((item, index) => {
            result += `    {\n`;
            
            // Add _id and type
            const docId = generateId(true);
            result += `      _id: "${docType}_${docId}",\n`;
            result += `      type: "${docType}",\n`;
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                const now = new Date().toISOString();
                result += `      createdAt: "${now}",\n`;
                result += `      updatedAt: "${now}",\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value], i) => {
                // Skip nested objects that became separate documents
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                    const refId = generateId(true);
                    const refType = key;
                    result += `      ${key}Id: "${refType}_${refId}",\n`;
                } else {
                    result += `      ${key}: ${couchValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
                }
            });
            
            result += `    }${index < items.length - 1 ? ',' : ''}\n`;
        });
        
        result += `  ];\n\n`;
    });
    
    // Add bulk insert operation for all document types
    result += `  // Combine all documents for bulk insert\n`;
    result += `  const allDocs = [\n`;
    result += `    ...${Object.keys(docTypes).join('Docs,\n    ...')}\n`;
    result += `  ];\n\n`;
    
    result += `  try {\n`;
    result += `    const response = await db.bulk({ docs: allDocs });\n`;
    result += `    console.log("Bulk insert successful:", response.length, "documents with references inserted");\n`;
    result += `    return response;\n`;
    result += `  } catch (err) {\n`;
    result += `    console.error("Error inserting documents with references:", err);\n`;
    result += `    throw err;\n`;
    result += `  }\n`;
    
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate array-based CouchDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {Object} options - Generation options
 * @returns {string} CouchDB document code
 */
function generateArrayBasedDocuments(jsonData, options) {
    let result = `// Array-based document structure\n`;
    result += `// Function to add array-based document\n`;
    result += `async function addArrayBasedDocument() {\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    result += `  // Prepare document with items array\n`;
    result += `  const doc = {\n`;
    
    // Add _id if enabled
    if (options.addIds) {
        result += `    _id: "${generateId(true)}",\n`;
    }
    
    // Add timestamps if enabled
    if (options.addTimestamps) {
        const now = new Date().toISOString();
        result += `    createdAt: "${now}",\n`;
        result += `    updatedAt: "${now}",\n`;
    }
    
    // Add items array
    result += `    items: [\n`;
    
    dataArray.forEach((item, index) => {
        result += `      {\n`;
        
        // Add item ID if enabled
        if (options.addIds) {
            result += `        id: "${generateId(true)}",\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value], i) => {
            result += `        ${key}: ${couchValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `      }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += `    ]\n`;
    result += `  };\n\n`;
    
    // Add insert operation
    result += `  try {\n`;
    result += `    const response = await db.insert(doc);\n`;
    result += `    console.log("Array-based document inserted successfully:", response.id);\n`;
    result += `    return response;\n`;
    result += `  } catch (err) {\n`;
    result += `    console.error("Error inserting array-based document:", err);\n`;
    result += `    throw err;\n`;
    result += `  }\n`;
    
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate index suggestions for CouchDB
 * @param {Object} jsonData - The JSON data to analyze
 * @returns {string} CouchDB index suggestions
 */
function generateIndexSuggestions(jsonData) {
    let result = `// CouchDB Index Suggestions\n`;
    
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
    
    // Generate index creation function
    result += `// Function to create indexes\n`;
    result += `async function createIndexes() {\n`;
    
    if (indexFields.length > 0) {
        // Add type index for referenced documents
        result += `  // Create type index for document types\n`;
        result += `  try {\n`;
        result += `    await db.createIndex({\n`;
        result += `      index: { fields: ['type'] },\n`;
        result += `      name: 'type-index'\n`;
        result += `    });\n`;
        result += `    console.log("Type index created successfully");\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error creating type index:", err);\n`;
        result += `  }\n\n`;
        
        // Add indexes for each field
        indexFields.forEach(field => {
            result += `  // Create index for ${field}\n`;
            result += `  try {\n`;
            result += `    await db.createIndex({\n`;
            result += `      index: { fields: ['${field}'] },\n`;
            result += `      name: '${field}-index'\n`;
            result += `    });\n`;
            result += `    console.log("${field} index created successfully");\n`;
            result += `  } catch (err) {\n`;
            result += `    console.error("Error creating ${field} index:", err);\n`;
            result += `  }\n\n`;
        });
        
        // If we have multiple fields, suggest a compound index
        if (indexFields.length > 1) {
            result += `  // Create compound index\n`;
            result += `  try {\n`;
            result += `    await db.createIndex({\n`;
            result += `      index: { fields: [${indexFields.slice(0, 2).map(f => `'${f}'`).join(', ')}] },\n`;
            result += `      name: 'compound-index'\n`;
            result += `    });\n`;
            result += `    console.log("Compound index created successfully");\n`;
            result += `  } catch (err) {\n`;
            result += `    console.error("Error creating compound index:", err);\n`;
            result += `  }\n`;
        }
    } else {
        result += `  console.log("No obvious index candidates found in this data structure");\n`;
    }
    
    result += `}\n\n`;
    
    return result;
}

/**
 * Extract document types for referenced document structure
 * @param {Array} items - The items to analyze
 * @param {Object} docTypes - Document types object to update
 */
function extractReferencedDocTypes(items, docTypes) {
    items.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            // If it's an object, make it a separate document type
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                if (!docTypes[key]) {
                    docTypes[key] = [];
                }
                
                docTypes[key].push(value);
            }
            
            // If it's an array of objects, make each object a separate document
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                const singularKey = key.endsWith('s') ? key.slice(0, -1) : key;
                
                if (!docTypes[singularKey]) {
                    docTypes[singularKey] = [];
                }
                
                docTypes[singularKey].push(...value);
                extractReferencedDocTypes(value, docTypes);
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
        const newKey = prefix ? `${prefix}_${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    });
    
    return flattened;
}

/**
 * Convert JavaScript value to CouchDB syntax string
 * @param {*} value - The value to convert
 * @returns {string} CouchDB syntax string
 */
function couchValueToString(value) {
    if (value === null) {
        return 'null';
    } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    } else if (value instanceof Date) {
        return `"${value.toISOString()}"`;
    } else if (Array.isArray(value)) {
        return `[${value.map(item => couchValueToString(item)).join(', ')}]`;
    } else if (typeof value === 'object') {
        const entries = Object.entries(value).map(([k, v]) => `${k}: ${couchValueToString(v)}`);
        return `{ ${entries.join(', ')} }`;
    }
    
    return String(value);
}

export { generateCouchDBDocuments };
