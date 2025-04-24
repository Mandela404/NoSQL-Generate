/**
 * NoSQL Generator MVP - Main Application Script
 * Author: Mandela404
 * Version: 1.0.0
 */

// Application state
const appState = {
    theme: localStorage.getItem('theme') || 'light',
    currentTab: 'json-formatter',
    jsonData: null,
    nosqlData: null
};

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // JSON Formatter
    jsonInput: document.getElementById('json-input'),
    jsonOutput: document.getElementById('json-output'),
    formatJsonBtn: document.getElementById('format-json'),
    clearJsonBtn: document.getElementById('clear-json'),
    copyJsonBtn: document.getElementById('copy-json'),
    
    // NoSQL Generator
    dbTypeRadios: document.querySelectorAll('input[name="db-type"]'),
    docStructure: document.getElementById('doc-structure'),
    addIds: document.getElementById('add-ids'),
    addTimestamps: document.getElementById('add-timestamps'),
    nosqlOutput: document.getElementById('nosql-output'),
    generateNosqlBtn: document.getElementById('generate-nosql'),
    copyNosqlBtn: document.getElementById('copy-nosql'),
    
    // Security Tools
    securityOpRadios: document.querySelectorAll('input[name="security-op"]'),
    securityAlgorithm: document.getElementById('security-algorithm'),
    cryptoKeyGroup: document.querySelector('.crypto-key-group'),
    cryptoKey: document.getElementById('crypto-key'),
    securityInput: document.getElementById('security-input'),
    securityOutput: document.getElementById('security-output'),
    processSecurityBtn: document.getElementById('process-security'),
    copySecurityBtn: document.getElementById('copy-security'),
    
    // Notifications
    notificationContainer: document.getElementById('notification-container')
};

// Initialize the application
function initApp() {
    // Apply saved theme
    applyTheme(appState.theme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Show welcome notification
    showNotification('Welcome to NoSQL Generator MVP!', 'info');
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
    
    // JSON Formatter
    elements.formatJsonBtn.addEventListener('click', formatJson);
    elements.clearJsonBtn.addEventListener('click', clearJson);
    elements.copyJsonBtn.addEventListener('click', copyJson);
    
    // NoSQL Generator
    elements.generateNosqlBtn.addEventListener('click', generateNoSQL);
    elements.copyNosqlBtn.addEventListener('click', copyNoSQL);
    
    // Security Tools
    elements.securityOpRadios.forEach(radio => {
        radio.addEventListener('change', toggleSecurityOptions);
    });
    elements.processSecurityBtn.addEventListener('click', processSecurityOperation);
    elements.copySecurityBtn.addEventListener('click', copySecurityOutput);
    
    // Initial setup for security tools
    toggleSecurityOptions();
}

// Toggle theme between light and dark
function toggleTheme() {
    const newTheme = appState.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    appState.theme = newTheme;
    localStorage.setItem('theme', newTheme);
}

// Apply theme to the document
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab
    elements.tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active content
    elements.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    appState.currentTab = tabId;
}

// Format JSON
function formatJson() {
    const input = elements.jsonInput.value.trim();
    
    if (!input) {
        showNotification('Please enter JSON to format', 'warning');
        return;
    }
    
    try {
        // Parse and format JSON
        const parsedJson = JSON.parse(input);
        appState.jsonData = parsedJson;
        const formattedJson = JSON.stringify(parsedJson, null, 2);
        elements.jsonOutput.textContent = formattedJson;
        showNotification('JSON formatted successfully', 'success');
    } catch (error) {
        elements.jsonOutput.textContent = `Error: ${error.message}`;
        showNotification('Invalid JSON format', 'error');
    }
}

// Clear JSON input and output
function clearJson() {
    elements.jsonInput.value = '';
    elements.jsonOutput.textContent = '';
    appState.jsonData = null;
    showNotification('JSON cleared', 'info');
}

// Copy formatted JSON to clipboard
function copyJson() {
    const output = elements.jsonOutput.textContent;
    
    if (!output) {
        showNotification('Nothing to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output)
        .then(() => {
            showNotification('JSON copied to clipboard', 'success');
        })
        .catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
}

// Generate NoSQL documents
function generateNoSQL() {
    if (!appState.jsonData) {
        // Try to format JSON first if we don't have data
        formatJson();
        if (!appState.jsonData) {
            showNotification('Please format valid JSON first', 'warning');
            return;
        }
    }
    
    const dbType = document.querySelector('input[name="db-type"]:checked').value;
    const structure = elements.docStructure.value;
    const options = {
        addIds: elements.addIds.checked,
        addTimestamps: elements.addTimestamps.checked
    };
    
    try {
        const result = generateNoSQLDocument(appState.jsonData, dbType, structure, options);
        elements.nosqlOutput.textContent = result;
        appState.nosqlData = result;
        showNotification(`${dbType.toUpperCase()} document generated successfully`, 'success');
    } catch (error) {
        elements.nosqlOutput.textContent = `Error: ${error.message}`;
        showNotification('Error generating NoSQL document', 'error');
    }
}

// Generate NoSQL document based on type, structure and options
function generateNoSQLDocument(jsonData, dbType, structure, options) {
    let result = '';
    const collectionName = 'myCollection';
    const timestamp = new Date().toISOString();
    
    // Helper to generate random ID
    const generateId = () => Math.random().toString(36).substring(2, 15);
    
    switch (dbType) {
        case 'mongodb':
            result = generateMongoDBDocument(jsonData, collectionName, structure, options);
            break;
        case 'firebase':
            result = generateFirebaseDocument(jsonData, structure, options);
            break;
        case 'dynamodb':
            result = generateDynamoDBDocument(jsonData, structure, options);
            break;
        default:
            result = generateMongoDBDocument(jsonData, collectionName, structure, options);
    }
    
    return result;
}

// Generate MongoDB document
function generateMongoDBDocument(data, collectionName, structure, options) {
    let result = `// MongoDB ${structure} structure\n`;
    result += `db.${collectionName}.insertOne(\n`;
    
    // Clone data to avoid modifying original
    const docData = JSON.parse(JSON.stringify(data));
    
    // Add ID and timestamps if needed
    if (options.addIds) {
        docData._id = { $oid: generateObjectId() };
    }
    
    if (options.addTimestamps) {
        docData.createdAt = new Date().toISOString();
        docData.updatedAt = new Date().toISOString();
    }
    
    // Format based on structure
    if (structure === 'flat') {
        // Flatten nested objects
        const flatData = flattenObject(docData);
        result += JSON.stringify(flatData, null, 2);
    } else {
        // Keep nested structure
        result += JSON.stringify(docData, null, 2);
    }
    
    result += '\n);';
    
    // Add index suggestion
    result += '\n\n// Suggested indexes:\n';
    result += `db.${collectionName}.createIndex({ "_id": 1 });`;
    
    return result;
}

// Generate Firebase document
function generateFirebaseDocument(data, structure, options) {
    let result = `// Firebase ${structure} structure\n`;
    
    // Clone data to avoid modifying original
    const docData = JSON.parse(JSON.stringify(data));
    
    // Add ID and timestamps if needed
    const docId = generateFirebaseId();
    
    if (options.addTimestamps) {
        docData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        docData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    // Format based on structure
    if (structure === 'flat') {
        // Flatten nested objects
        const flatData = flattenObject(docData);
        result += `firebase.firestore().collection("myCollection").doc("${docId}")\n  .set(${JSON.stringify(flatData, null, 2)});`;
    } else {
        // Keep nested structure
        result += `firebase.firestore().collection("myCollection").doc("${docId}")\n  .set(${JSON.stringify(docData, null, 2)});`;
    }
    
    return result;
}

// Generate DynamoDB document
function generateDynamoDBDocument(data, structure, options) {
    let result = `// DynamoDB ${structure} structure\n`;
    
    // Clone data to avoid modifying original
    const docData = JSON.parse(JSON.stringify(data));
    
    // Add ID and timestamps if needed
    if (options.addIds) {
        docData.id = generateDynamoId();
    }
    
    if (options.addTimestamps) {
        docData.createdAt = Math.floor(Date.now() / 1000);
        docData.updatedAt = Math.floor(Date.now() / 1000);
    }
    
    // Convert to DynamoDB format
    const dynamoItem = convertToDynamoFormat(docData, structure === 'flat');
    
    result += `const params = {\n`;
    result += `  TableName: "myTable",\n`;
    result += `  Item: ${JSON.stringify(dynamoItem, null, 2)}\n`;
    result += `};\n\n`;
    result += `dynamoDb.put(params, (err, data) => {\n`;
    result += `  if (err) console.error(err);\n`;
    result += `  else console.log("Item added successfully");\n`;
    result += `});`;
    
    return result;
}

// Copy NoSQL output to clipboard
function copyNoSQL() {
    const output = elements.nosqlOutput.textContent;
    
    if (!output) {
        showNotification('Nothing to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output)
        .then(() => {
            showNotification('NoSQL code copied to clipboard', 'success');
        })
        .catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
}

// Toggle security options based on selected operation
function toggleSecurityOptions() {
    const operation = document.querySelector('input[name="security-op"]:checked').value;
    const algorithmSelect = elements.securityAlgorithm;
    
    // Reset options
    Array.from(algorithmSelect.options).forEach(option => {
        option.style.display = 'block';
    });
    
    // Show/hide crypto key input
    if (operation === 'encrypt' || operation === 'decrypt') {
        elements.cryptoKeyGroup.style.display = 'block';
        
        // Filter algorithm options to only show encryption algorithms
        Array.from(algorithmSelect.options).forEach(option => {
            if (!option.classList.contains('crypto-only') && 
                !['aes', 'des', 'tripledes'].includes(option.value)) {
                option.style.display = 'none';
            }
        });
        
        // Select AES by default for encryption/decryption
        algorithmSelect.value = 'aes';
    } else {
        elements.cryptoKeyGroup.style.display = 'none';
        
        // Filter algorithm options to only show hash algorithms
        Array.from(algorithmSelect.options).forEach(option => {
            if (option.classList.contains('crypto-only')) {
                option.style.display = 'none';
            }
        });
        
        // Select SHA-256 by default for hashing
        algorithmSelect.value = 'sha256';
    }
}

// Process security operation (hash, encrypt, decrypt)
function processSecurityOperation() {
    const operation = document.querySelector('input[name="security-op"]:checked').value;
    const algorithm = elements.securityAlgorithm.value;
    const input = elements.securityInput.value.trim();
    
    if (!input) {
        showNotification('Please enter text to process', 'warning');
        return;
    }
    
    try {
        let result = '';
        
        switch (operation) {
            case 'hash':
                result = generateHash(input, algorithm);
                break;
            case 'encrypt':
                const encryptKey = elements.cryptoKey.value.trim();
                if (!encryptKey) {
                    showNotification('Encryption key is required', 'warning');
                    return;
                }
                result = encryptData(input, encryptKey, algorithm);
                break;
            case 'decrypt':
                const decryptKey = elements.cryptoKey.value.trim();
                if (!decryptKey) {
                    showNotification('Decryption key is required', 'warning');
                    return;
                }
                result = decryptData(input, decryptKey, algorithm);
                break;
        }
        
        elements.securityOutput.textContent = result;
        showNotification(`${operation} operation completed successfully`, 'success');
    } catch (error) {
        elements.securityOutput.textContent = `Error: ${error.message}`;
        showNotification(`Error during ${operation} operation`, 'error');
    }
}

// Generate hash from input
function generateHash(input, algorithm) {
    if (!CryptoJS) {
        throw new Error('CryptoJS library not loaded');
    }
    
    let hash = '';
    
    switch (algorithm) {
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

// Encrypt data
function encryptData(input, key, algorithm) {
    if (!CryptoJS) {
        throw new Error('CryptoJS library not loaded');
    }
    
    let encrypted = '';
    
    switch (algorithm) {
        case 'aes':
            encrypted = CryptoJS.AES.encrypt(input, key).toString();
            break;
        default:
            throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
    }
    
    return encrypted;
}

// Decrypt data
function decryptData(input, key, algorithm) {
    if (!CryptoJS) {
        throw new Error('CryptoJS library not loaded');
    }
    
    let decrypted = '';
    
    try {
        switch (algorithm) {
            case 'aes':
                decrypted = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
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

// Copy security output to clipboard
function copySecurityOutput() {
    const output = elements.securityOutput.textContent;
    
    if (!output) {
        showNotification('Nothing to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output)
        .then(() => {
            showNotification('Output copied to clipboard', 'success');
        })
        .catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    elements.notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Helper functions
function generateObjectId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    
    return timestamp + machineId + processId + counter;
}

function generateFirebaseId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateDynamoId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], pre + key));
        } else {
            acc[pre + key] = obj[key];
        }
        return acc;
    }, {});
}

function convertToDynamoFormat(obj, flatten = false) {
    const result = {};
    
    // Flatten object if needed
    const data = flatten ? flattenObject(obj) : obj;
    
    // Convert to DynamoDB format
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
            result[key] = { S: value };
        } else if (typeof value === 'number') {
            result[key] = { N: value.toString() };
        } else if (typeof value === 'boolean') {
            result[key] = { BOOL: value };
        } else if (Array.isArray(value)) {
            if (value.length > 0) {
                if (typeof value[0] === 'string') {
                    result[key] = { SS: value };
                } else if (typeof value[0] === 'number') {
                    result[key] = { NS: value.map(n => n.toString()) };
                } else {
                    result[key] = { L: value.map(item => ({ S: JSON.stringify(item) })) };
                }
            } else {
                result[key] = { L: [] };
            }
        } else if (value === null) {
            result[key] = { NULL: true };
        } else if (typeof value === 'object') {
            result[key] = { M: convertToDynamoFormat(value) };
        }
    });
    
    return result;
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
