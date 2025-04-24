/**
 * NoSQL Generator - Firebase Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles Firebase document generation from JSON data.
 */

import { generateId } from '../utils.js';
import { logInfo } from '../logger.js';

/**
 * Generate Firebase documents from JSON data
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} structure - The document structure type
 * @param {Object} options - Generation options
 * @returns {string} Firebase document code
 */
function generateFirebaseDocuments(jsonData, structure, options) {
    logInfo('Generating Firebase documents...');
    
    let result = '';
    
    // Add Firebase import and initialization comment
    result += '// Firebase Firestore Code\n';
    result += '// Requires Firebase SDK to be initialized in your project\n\n';
    result += '// Import Firebase modules\n';
    result += 'import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";\n\n';
    result += '// Get Firestore instance\n';
    result += 'const db = getFirestore();\n\n';
    
    // Get the collection name from the first key or use a default
    const collectionName = Array.isArray(jsonData) ? 'items' : 
                          Object.keys(jsonData).length > 0 ? Object.keys(jsonData)[0] : 
                          'collection';
    
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
 * Generate nested Firebase documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} Firebase document code
 */
function generateNestedDocuments(jsonData, collectionName, options) {
    let result = `// Nested document structure\n`;
    result += `// Function to add documents to Firestore\n`;
    result += `async function addNestedDocuments() {\n`;
    result += `  const collectionRef = collection(db, "${collectionName}");\n\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate document creation code
    dataArray.forEach((item, index) => {
        // Create a variable for this document
        result += `  // Document ${index + 1}\n`;
        
        if (options.addIds) {
            const docId = generateId(true);
            result += `  const docRef${index + 1} = doc(collectionRef, "${docId}");\n`;
            result += `  await setDoc(docRef${index + 1}, {\n`;
        } else {
            result += `  await addDoc(collectionRef, {\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            result += `    createdAt: serverTimestamp(),\n`;
            result += `    updatedAt: serverTimestamp(),\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value], i) => {
            result += `    ${key}: ${firebaseValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  });\n\n`;
    });
    
    result += `  console.log("${dataArray.length} documents added to ${collectionName} collection");\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate flat Firebase documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} Firebase document code
 */
function generateFlatDocuments(jsonData, collectionName, options) {
    let result = `// Flat document structure\n`;
    result += `// Function to add flat documents to Firestore\n`;
    result += `async function addFlatDocuments() {\n`;
    result += `  const collectionRef = collection(db, "${collectionName}");\n\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate document creation code
    dataArray.forEach((item, index) => {
        // Flatten the object
        const flattenedObject = flattenObject(item);
        
        // Create a variable for this document
        result += `  // Document ${index + 1}\n`;
        
        if (options.addIds) {
            const docId = generateId(true);
            result += `  const docRef${index + 1} = doc(collectionRef, "${docId}");\n`;
            result += `  await setDoc(docRef${index + 1}, {\n`;
        } else {
            result += `  await addDoc(collectionRef, {\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            result += `    createdAt: serverTimestamp(),\n`;
            result += `    updatedAt: serverTimestamp(),\n`;
        }
        
        // Add the data fields
        Object.entries(flattenedObject).forEach(([key, value], i) => {
            result += `    ${key}: ${firebaseValueToString(value)}${i < Object.entries(flattenedObject).length - 1 ? ',' : ''}\n`;
        });
        
        result += `  });\n\n`;
    });
    
    result += `  console.log("${dataArray.length} flat documents added to ${collectionName} collection");\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate Firebase documents with references
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} Firebase document code
 */
function generateReferencedDocuments(jsonData, collectionName, options) {
    let result = `// Referenced document structure\n`;
    result += `// Function to add documents with references to Firestore\n`;
    result += `async function addReferencedDocuments() {\n`;
    
    // Extract collections
    const collections = {};
    
    if (Array.isArray(jsonData)) {
        collections[collectionName] = jsonData;
        extractReferencedCollections(jsonData, collections);
    } else {
        collections[collectionName] = [jsonData];
        extractReferencedCollections([jsonData], collections);
    }
    
    // Generate document creation code for each collection
    Object.entries(collections).forEach(([collection, items]) => {
        result += `  // Collection: ${collection}\n`;
        result += `  const ${collection}Ref = collection(db, "${collection}");\n\n`;
        
        // Generate document creation code
        items.forEach((item, index) => {
            // Create a variable for this document
            result += `  // ${collection} document ${index + 1}\n`;
            
            if (options.addIds) {
                const docId = generateId(true);
                result += `  const ${collection}Doc${index + 1} = doc(${collection}Ref, "${docId}");\n`;
                result += `  await setDoc(${collection}Doc${index + 1}, {\n`;
            } else {
                result += `  const ${collection}Doc${index + 1} = await addDoc(${collection}Ref, {\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                result += `    createdAt: serverTimestamp(),\n`;
                result += `    updatedAt: serverTimestamp(),\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value], i) => {
                // Skip nested objects that became separate collections
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                    result += `    ${key}Ref: doc(db, "${key}s", "${generateId(true)}"),\n`;
                } else {
                    result += `    ${key}: ${firebaseValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
                }
            });
            
            result += `  });\n\n`;
        });
    });
    
    result += `  console.log("Referenced documents added to Firestore");\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate array-based Firebase documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} collectionName - The name of the collection
 * @param {Object} options - Generation options
 * @returns {string} Firebase document code
 */
function generateArrayBasedDocuments(jsonData, collectionName, options) {
    let result = `// Array-based document structure\n`;
    result += `// Function to add array-based document to Firestore\n`;
    result += `async function addArrayBasedDocument() {\n`;
    result += `  const collectionRef = collection(db, "${collectionName}");\n\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // Generate document creation code
    result += `  // Create a single document with items array\n`;
    
    if (options.addIds) {
        const docId = generateId(true);
        result += `  const docRef = doc(collectionRef, "${docId}");\n`;
        result += `  await setDoc(docRef, {\n`;
    } else {
        result += `  await addDoc(collectionRef, {\n`;
    }
    
    // Add timestamps if enabled
    if (options.addTimestamps) {
        result += `    createdAt: serverTimestamp(),\n`;
        result += `    updatedAt: serverTimestamp(),\n`;
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
            result += `        ${key}: ${firebaseValueToString(value)}${i < Object.entries(item).length - 1 ? ',' : ''}\n`;
        });
        
        result += `      }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += `    ]\n`;
    result += `  });\n\n`;
    
    result += `  console.log("Array-based document added to ${collectionName} collection");\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate index suggestions for Firebase
 * @param {Object} jsonData - The JSON data to analyze
 * @param {string} collectionName - The name of the collection
 * @returns {string} Firebase index suggestions
 */
function generateIndexSuggestions(jsonData, collectionName) {
    let result = `// Index Suggestions for Firebase\n`;
    result += `// Add these indexes in the Firebase console or using the Firebase CLI\n\n`;
    
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
    
    // Generate index suggestions
    if (indexFields.length > 0) {
        result += `// Firebase indexes for collection: ${collectionName}\n`;
        result += `/*\n`;
        
        indexFields.forEach(field => {
            result += `  Field: ${field}, Order: ASCENDING\n`;
        });
        
        // If we have multiple fields, suggest a compound index
        if (indexFields.length > 1) {
            result += `\n  // Compound index suggestion:\n`;
            indexFields.slice(0, 2).forEach(field => {
                result += `  Field: ${field}, Order: ASCENDING\n`;
            });
        }
        
        result += `*/\n\n`;
        
        // Add Firebase CLI command example
        result += `// Firebase CLI command example:\n`;
        result += `// firebase firestore:indexes --project your-project-id\n\n`;
    } else {
        result += `// No obvious index candidates found in this data structure\n\n`;
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
 * Convert JavaScript value to Firebase syntax string
 * @param {*} value - The value to convert
 * @returns {string} Firebase syntax string
 */
function firebaseValueToString(value) {
    if (value === null) {
        return 'null';
    } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    } else if (value instanceof Date) {
        return `new Date("${value.toISOString()}")`;
    } else if (Array.isArray(value)) {
        return `[${value.map(item => firebaseValueToString(item)).join(', ')}]`;
    } else if (typeof value === 'object') {
        const entries = Object.entries(value).map(([k, v]) => `${k}: ${firebaseValueToString(v)}`);
        return `{ ${entries.join(', ')} }`;
    }
    
    return String(value);
}

export { generateFirebaseDocuments };
