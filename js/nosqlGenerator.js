/**
 * NoSQL Generator - Main NoSQL Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module coordinates the generation of NoSQL documents from JSON data
 * by delegating to specific database generator modules.
 */

import { logInfo, logSuccess, logWarning, logError } from './logger.js';
import { generateMongoDBDocuments } from './nosql/mongodbGenerator.js';
import { generateFirebaseDocuments } from './nosql/firebaseGenerator.js';
import { generateDynamoDBDocuments } from './nosql/dynamodbGenerator.js';
import { generateCouchDBDocuments } from './nosql/couchdbGenerator.js';

// Module state
const generatorState = {
    lastInput: null,
    lastOutput: null,
    lastOptions: null
};

/**
 * Initialize the NoSQL generator
 */
function initNoSQLGenerator() {
    logInfo('Initializing NoSQL generator...');
    
    // Set up event listeners for database type changes
    document.querySelectorAll('input[name="db-type"]').forEach(radio => {
        radio.addEventListener('change', handleDatabaseTypeChange);
    });
    
    // Set up event listener for document structure changes
    document.getElementById('doc-structure').addEventListener('change', handleStructureChange);
    
    logSuccess('NoSQL generator initialized');
}

/**
 * Handle database type change
 * @param {Event} event - The change event
 */
function handleDatabaseTypeChange(event) {
    const dbType = event.target.value;
    logInfo(`Database type changed to ${dbType}`);
    
    // Update UI based on database type
    updateUIForDatabaseType(dbType);
    
    // Regenerate output if we have input data
    if (generatorState.lastInput && generatorState.lastOptions) {
        generateNoSQL(
            generatorState.lastInput,
            dbType,
            generatorState.lastOptions.structure,
            generatorState.lastOptions
        );
    }
}

/**
 * Handle document structure change
 * @param {Event} event - The change event
 */
function handleStructureChange(event) {
    const structure = event.target.value;
    logInfo(`Document structure changed to ${structure}`);
    
    // Update UI based on structure
    updateUIForStructure(structure);
    
    // Regenerate output if we have input data
    if (generatorState.lastInput && generatorState.lastOptions) {
        const dbType = document.querySelector('input[name="db-type"]:checked').value;
        
        generateNoSQL(
            generatorState.lastInput,
            dbType,
            structure,
            generatorState.lastOptions
        );
    }
}

/**
 * Update UI based on selected database type
 * @param {string} dbType - The selected database type
 */
function updateUIForDatabaseType(dbType) {
    // Show/hide database-specific options
    const mongoOptions = document.querySelectorAll('.mongodb-option');
    const firebaseOptions = document.querySelectorAll('.firebase-option');
    const dynamoOptions = document.querySelectorAll('.dynamodb-option');
    const couchOptions = document.querySelectorAll('.couchdb-option');
    
    mongoOptions.forEach(el => el.style.display = dbType === 'mongodb' ? 'block' : 'none');
    firebaseOptions.forEach(el => el.style.display = dbType === 'firebase' ? 'block' : 'none');
    dynamoOptions.forEach(el => el.style.display = dbType === 'dynamodb' ? 'block' : 'none');
    couchOptions.forEach(el => el.style.display = dbType === 'couchdb' ? 'block' : 'none');
}

/**
 * Update UI based on selected document structure
 * @param {string} structure - The selected document structure
 */
function updateUIForStructure(structure) {
    // Show/hide structure-specific options
    const nestedOptions = document.querySelectorAll('.nested-option');
    const flatOptions = document.querySelectorAll('.flat-option');
    const referencesOptions = document.querySelectorAll('.references-option');
    const arraysOptions = document.querySelectorAll('.arrays-option');
    
    nestedOptions.forEach(el => el.style.display = structure === 'nested' ? 'block' : 'none');
    flatOptions.forEach(el => el.style.display = structure === 'flat' ? 'block' : 'none');
    referencesOptions.forEach(el => el.style.display = structure === 'references' ? 'block' : 'none');
    arraysOptions.forEach(el => el.style.display = structure === 'arrays' ? 'block' : 'none');
}

/**
 * Generate NoSQL documents from JSON data
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} dbType - The database type (mongodb, firebase, etc.)
 * @param {string} structure - The document structure type
 * @param {Object} options - Generation options
 * @returns {Object} Object containing the generated code and metadata
 */
function generateNoSQL(jsonData, dbType, structure, options) {
    logInfo(`Generating ${dbType} documents with ${structure} structure...`);
    
    // Save inputs for potential reuse
    generatorState.lastInput = jsonData;
    generatorState.lastOptions = {
        ...options,
        structure
    };
    
    try {
        // Validate inputs
        if (!jsonData) {
            throw new Error('No JSON data provided');
        }
        
        if (!dbType) {
            throw new Error('No database type selected');
        }
        
        if (!structure) {
            throw new Error('No document structure selected');
        }
        
        // Generate documents based on database type
        let result;
        
        switch (dbType) {
            case 'mongodb':
                result = generateMongoDBDocuments(jsonData, structure, options);
                break;
            case 'firebase':
                result = generateFirebaseDocuments(jsonData, structure, options);
                break;
            case 'dynamodb':
                result = generateDynamoDBDocuments(jsonData, structure, options);
                break;
            case 'couchdb':
                result = generateCouchDBDocuments(jsonData, structure, options);
                break;
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
        
        // Update output display
        const outputElement = document.getElementById('nosql-output');
        outputElement.textContent = result;
        
        // Apply syntax highlighting if available
        if (window.hljs) {
            outputElement.innerHTML = window.hljs.highlight('javascript', result).value;
        }
        
        // Save output for potential reuse
        generatorState.lastOutput = result;
        
        logSuccess(`${dbType} documents generated successfully`);
        
        return {
            data: result,
            dbType,
            structure
        };
    } catch (error) {
        logError(`NoSQL generation error: ${error.message}`);
        
        // Display error in output
        const outputElement = document.getElementById('nosql-output');
        outputElement.innerHTML = `<div class="nosql-error">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="error-message">${error.message}</div>
        </div>`;
        
        throw error;
    }
}

/**
 * Get the current NoSQL output
 * @returns {string|null} The current NoSQL output or null if none
 */
function getCurrentNoSQLOutput() {
    return generatorState.lastOutput;
}

/**
 * Get the current NoSQL generation options
 * @returns {Object|null} The current options or null if none
 */
function getCurrentOptions() {
    return generatorState.lastOptions;
}

// Export functions
export {
    initNoSQLGenerator,
    generateNoSQL,
    getCurrentNoSQLOutput,
    getCurrentOptions
};
