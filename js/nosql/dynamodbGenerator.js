/**
 * NoSQL Generator - DynamoDB Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles DynamoDB document generation from JSON data.
 */

import { generateId } from '../utils.js';
import { logInfo } from '../logger.js';

/**
 * Generate DynamoDB documents from JSON data
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} structure - The document structure type
 * @param {Object} options - Generation options
 * @returns {string} DynamoDB document code
 */
function generateDynamoDBDocuments(jsonData, structure, options) {
    logInfo('Generating DynamoDB documents...');
    
    let result = '';
    
    // Add DynamoDB SDK import and initialization
    result += '// AWS DynamoDB Code\n';
    result += '// Requires AWS SDK to be initialized in your project\n\n';
    result += '// Import AWS SDK modules\n';
    result += 'import { DynamoDBClient } from "@aws-sdk/client-dynamodb";\n';
    result += 'import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";\n\n';
    result += '// Initialize DynamoDB client\n';
    result += 'const client = new DynamoDBClient({ region: "us-east-1" });\n';
    result += 'const docClient = DynamoDBDocumentClient.from(client);\n\n';
    
    // Get the table name from the first key or use a default
    const tableName = Array.isArray(jsonData) ? 'Items' : 
                     Object.keys(jsonData).length > 0 ? Object.keys(jsonData)[0] : 
                     'DynamoTable';
    
    // Generate documents based on structure type
    switch (structure) {
        case 'nested':
            result += generateNestedDocuments(jsonData, tableName, options);
            break;
        case 'flat':
            result += generateFlatDocuments(jsonData, tableName, options);
            break;
        case 'references':
            result += generateReferencedDocuments(jsonData, tableName, options);
            break;
        case 'arrays':
            result += generateArrayBasedDocuments(jsonData, tableName, options);
            break;
        default:
            result += generateNestedDocuments(jsonData, tableName, options);
    }
    
    // Add index suggestions if enabled
    if (options.addIndexes) {
        result += generateIndexSuggestions(jsonData, tableName);
    }
    
    return result;
}

/**
 * Generate nested DynamoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} tableName - The name of the table
 * @param {Object} options - Generation options
 * @returns {string} DynamoDB document code
 */
function generateNestedDocuments(jsonData, tableName, options) {
    let result = `// Nested document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    if (dataArray.length <= 25) {
        // Use BatchWriteCommand for smaller datasets (DynamoDB batch write limit is 25 items)
        result += `// Function to add items using BatchWriteCommand\n`;
        result += `async function addNestedItems() {\n`;
        result += `  const items = [];\n\n`;
        
        // Generate items array
        dataArray.forEach((item, index) => {
            result += `  // Item ${index + 1}\n`;
            result += `  items.push({\n`;
            result += `    PutRequest: {\n`;
            result += `      Item: {\n`;
            
            // Add primary key
            if (options.addIds) {
                result += `        id: "${generateId(true)}",\n`;
            } else {
                result += `        id: "${index + 1}",\n`;
            }
            
            // Add sort key if specified
            if (options.sortKey) {
                result += `        ${options.sortKey}: "${new Date().toISOString()}",\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                result += `        createdAt: "${new Date().toISOString()}",\n`;
                result += `        updatedAt: "${new Date().toISOString()}",\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value]) => {
                result += `        ${key}: ${dynamoValueToString(value)},\n`;
            });
            
            result += `      }\n`;
            result += `    }\n`;
            result += `  });\n\n`;
        });
        
        // Add batch write command
        result += `  const command = new BatchWriteCommand({\n`;
        result += `    RequestItems: {\n`;
        result += `      "${tableName}": items\n`;
        result += `    }\n`;
        result += `  });\n\n`;
        result += `  try {\n`;
        result += `    const response = await docClient.send(command);\n`;
        result += `    console.log("Success - items added to ${tableName}");\n`;
        result += `    return response;\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error:", err);\n`;
        result += `  }\n`;
        result += `}\n\n`;
    } else {
        // Use individual PutCommand for larger datasets
        result += `// Function to add items using individual PutCommand\n`;
        result += `async function addNestedItems() {\n`;
        result += `  try {\n`;
        
        // Generate put commands for each item
        dataArray.forEach((item, index) => {
            result += `    // Item ${index + 1}\n`;
            result += `    await docClient.send(\n`;
            result += `      new PutCommand({\n`;
            result += `        TableName: "${tableName}",\n`;
            result += `        Item: {\n`;
            
            // Add primary key
            if (options.addIds) {
                result += `          id: "${generateId(true)}",\n`;
            } else {
                result += `          id: "${index + 1}",\n`;
            }
            
            // Add sort key if specified
            if (options.sortKey) {
                result += `          ${options.sortKey}: "${new Date().toISOString()}",\n`;
            }
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                result += `          createdAt: "${new Date().toISOString()}",\n`;
                result += `          updatedAt: "${new Date().toISOString()}",\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value]) => {
                result += `          ${key}: ${dynamoValueToString(value)},\n`;
            });
            
            result += `        }\n`;
            result += `      })\n`;
            result += `    );\n\n`;
        });
        
        result += `    console.log("Success - ${dataArray.length} items added to ${tableName}");\n`;
        result += `  } catch (err) {\n`;
        result += `    console.error("Error:", err);\n`;
        result += `  }\n`;
        result += `}\n\n`;
    }
    
    return result;
}

/**
 * Generate flat DynamoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} tableName - The name of the table
 * @param {Object} options - Generation options
 * @returns {string} DynamoDB document code
 */
function generateFlatDocuments(jsonData, tableName, options) {
    let result = `// Flat document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    result += `// Function to add flattened items\n`;
    result += `async function addFlatItems() {\n`;
    result += `  try {\n`;
    
    // Generate put commands for each item
    dataArray.forEach((item, index) => {
        // Flatten the object
        const flattenedObject = flattenObject(item);
        
        result += `    // Item ${index + 1}\n`;
        result += `    await docClient.send(\n`;
        result += `      new PutCommand({\n`;
        result += `        TableName: "${tableName}",\n`;
        result += `        Item: {\n`;
        
        // Add primary key
        if (options.addIds) {
            result += `          id: "${generateId(true)}",\n`;
        } else {
            result += `          id: "${index + 1}",\n`;
        }
        
        // Add sort key if specified
        if (options.sortKey) {
            result += `          ${options.sortKey}: "${new Date().toISOString()}",\n`;
        }
        
        // Add timestamps if enabled
        if (options.addTimestamps) {
            result += `          createdAt: "${new Date().toISOString()}",\n`;
            result += `          updatedAt: "${new Date().toISOString()}",\n`;
        }
        
        // Add the flattened data fields
        Object.entries(flattenedObject).forEach(([key, value]) => {
            result += `          ${key}: ${dynamoValueToString(value)},\n`;
        });
        
        result += `        }\n`;
        result += `      })\n`;
        result += `    );\n\n`;
    });
    
    result += `    console.log("Success - ${dataArray.length} flat items added to ${tableName}");\n`;
    result += `  } catch (err) {\n`;
    result += `    console.error("Error:", err);\n`;
    result += `  }\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate DynamoDB documents with references
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} tableName - The name of the table
 * @param {Object} options - Generation options
 * @returns {string} DynamoDB document code
 */
function generateReferencedDocuments(jsonData, tableName, options) {
    let result = `// Referenced document structure using single table design\n`;
    result += `// This approach uses a single table with different item types\n\n`;
    
    result += `// Function to add items with references\n`;
    result += `async function addReferencedItems() {\n`;
    result += `  try {\n`;
    
    // Extract entity types and their items
    const entities = {};
    
    if (Array.isArray(jsonData)) {
        entities['Main'] = jsonData;
        extractEntities(jsonData, entities);
    } else {
        entities['Main'] = [jsonData];
        extractEntities([jsonData], entities);
    }
    
    // Generate put commands for each entity type
    Object.entries(entities).forEach(([entityType, items]) => {
        items.forEach((item, index) => {
            const itemId = generateId(true);
            
            result += `    // ${entityType} item ${index + 1}\n`;
            result += `    await docClient.send(\n`;
            result += `      new PutCommand({\n`;
            result += `        TableName: "${tableName}",\n`;
            result += `        Item: {\n`;
            result += `          PK: "${entityType}#${itemId}",\n`;
            result += `          SK: "${entityType}#${itemId}",\n`;
            result += `          type: "${entityType}",\n`;
            result += `          id: "${itemId}",\n`;
            
            // Add timestamps if enabled
            if (options.addTimestamps) {
                result += `          createdAt: "${new Date().toISOString()}",\n`;
                result += `          updatedAt: "${new Date().toISOString()}",\n`;
            }
            
            // Add the data fields
            Object.entries(item).forEach(([key, value]) => {
                // Skip nested objects that became separate entities
                if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                    const refId = generateId(true);
                    const refType = key.charAt(0).toUpperCase() + key.slice(1);
                    result += `          ${key}Id: "${refId}",\n`;
                    result += `          ${key}Type: "${refType}",\n`;
                } else {
                    result += `          ${key}: ${dynamoValueToString(value)},\n`;
                }
            });
            
            result += `        }\n`;
            result += `      })\n`;
            result += `    );\n\n`;
        });
    });
    
    // Add code for creating relationships
    if (Object.keys(entities).length > 1) {
        result += `    // Note: In a real application, you would create relationships\n`;
        result += `    // between entities using GSIs (Global Secondary Indexes)\n`;
        result += `    // Example: PK: "Main#123", SK: "RelatedEntity#456"\n\n`;
    }
    
    result += `    console.log("Success - items added to ${tableName} with references");\n`;
    result += `  } catch (err) {\n`;
    result += `    console.error("Error:", err);\n`;
    result += `  }\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate array-based DynamoDB documents
 * @param {Object} jsonData - The JSON data to convert
 * @param {string} tableName - The name of the table
 * @param {Object} options - Generation options
 * @returns {string} DynamoDB document code
 */
function generateArrayBasedDocuments(jsonData, tableName, options) {
    let result = `// Array-based document structure\n`;
    
    // Convert data to array if it's not already
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    result += `// Function to add a single item with array of sub-items\n`;
    result += `async function addArrayBasedItem() {\n`;
    result += `  try {\n`;
    result += `    // Create a single item with sub-items array\n`;
    result += `    await docClient.send(\n`;
    result += `      new PutCommand({\n`;
    result += `        TableName: "${tableName}",\n`;
    result += `        Item: {\n`;
    
    // Add primary key
    if (options.addIds) {
        result += `          id: "${generateId(true)}",\n`;
    } else {
        result += `          id: "main-item",\n`;
    }
    
    // Add timestamps if enabled
    if (options.addTimestamps) {
        result += `          createdAt: "${new Date().toISOString()}",\n`;
        result += `          updatedAt: "${new Date().toISOString()}",\n`;
    }
    
    // Add items array
    result += `          items: [\n`;
    
    dataArray.forEach((item, index) => {
        result += `            {\n`;
        
        // Add item ID if enabled
        if (options.addIds) {
            result += `              id: "${generateId(true)}",\n`;
        } else {
            result += `              id: "item-${index + 1}",\n`;
        }
        
        // Add the data fields
        Object.entries(item).forEach(([key, value]) => {
            result += `              ${key}: ${dynamoValueToString(value)},\n`;
        });
        
        result += `            }${index < dataArray.length - 1 ? ',' : ''}\n`;
    });
    
    result += `          ]\n`;
    result += `        }\n`;
    result += `      })\n`;
    result += `    );\n\n`;
    
    result += `    console.log("Success - array-based item added to ${tableName}");\n`;
    result += `  } catch (err) {\n`;
    result += `    console.error("Error:", err);\n`;
    result += `  }\n`;
    result += `}\n\n`;
    
    return result;
}

/**
 * Generate index suggestions for DynamoDB
 * @param {Object} jsonData - The JSON data to analyze
 * @param {string} tableName - The name of the table
 * @returns {string} DynamoDB index suggestions
 */
function generateIndexSuggestions(jsonData, tableName) {
    let result = `// DynamoDB Index Suggestions\n`;
    result += `// These are suggestions for Global Secondary Indexes (GSIs)\n\n`;
    
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
        result += `// CloudFormation template snippet for GSIs\n`;
        result += `/*\n`;
        result += `Resources:\n`;
        result += `  ${tableName}Table:\n`;
        result += `    Type: AWS::DynamoDB::Table\n`;
        result += `    Properties:\n`;
        result += `      TableName: ${tableName}\n`;
        result += `      AttributeDefinitions:\n`;
        result += `        - AttributeName: id\n`;
        result += `          AttributeType: S\n`;
        
        // Add attribute definitions for index fields
        indexFields.forEach(field => {
            result += `        - AttributeName: ${field}\n`;
            result += `          AttributeType: S\n`;
        });
        
        result += `      KeySchema:\n`;
        result += `        - AttributeName: id\n`;
        result += `          KeyType: HASH\n`;
        result += `      GlobalSecondaryIndexes:\n`;
        
        // Add GSIs for each field
        indexFields.forEach((field, index) => {
            result += `        - IndexName: ${field}Index\n`;
            result += `          KeySchema:\n`;
            result += `            - AttributeName: ${field}\n`;
            result += `              KeyType: HASH\n`;
            result += `          Projection:\n`;
            result += `            ProjectionType: ALL\n`;
            
            if (index < indexFields.length - 1) {
                result += `\n`;
            }
        });
        
        result += `*/\n\n`;
        
        // Add AWS CLI example
        result += `// AWS CLI command example:\n`;
        result += `// aws dynamodb update-table \\\n`;
        result += `//   --table-name ${tableName} \\\n`;
        result += `//   --attribute-definitions AttributeName=${indexFields[0]},AttributeType=S \\\n`;
        result += `//   --global-secondary-index-updates "[{\\"Create\\":{\\"IndexName\\":\\"${indexFields[0]}Index\\",\\"KeySchema\\":[{\\"AttributeName\\":\\"${indexFields[0]}\\",\\"KeyType\\":\\"HASH\\"}],\\"Projection\\":{\\"ProjectionType\\":\\"ALL\\"}}}]"\n\n`;
    } else {
        result += `// No obvious index candidates found in this data structure\n\n`;
    }
    
    return result;
}

/**
 * Extract entities for referenced document structure
 * @param {Array} items - The items to analyze
 * @param {Object} entities - Entities object to update
 */
function extractEntities(items, entities) {
    items.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            // If it's an object, make it a separate entity
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
                const entityType = key.charAt(0).toUpperCase() + key.slice(1);
                
                if (!entities[entityType]) {
                    entities[entityType] = [];
                }
                
                entities[entityType].push(value);
            }
            
            // If it's an array of objects, make each object a separate entity
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                const entityType = key.charAt(0).toUpperCase() + key.slice(1);
                const singularType = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;
                
                if (!entities[singularType]) {
                    entities[singularType] = [];
                }
                
                entities[singularType].push(...value);
                extractEntities(value, entities);
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
 * Convert JavaScript value to DynamoDB syntax string
 * @param {*} value - The value to convert
 * @returns {string} DynamoDB syntax string
 */
function dynamoValueToString(value) {
    if (value === null) {
        return 'null';
    } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
    } else if (typeof value === 'number') {
        return String(value);
    } else if (typeof value === 'boolean') {
        return String(value);
    } else if (value instanceof Date) {
        return `"${value.toISOString()}"`;
    } else if (Array.isArray(value)) {
        return `[${value.map(item => dynamoValueToString(item)).join(', ')}]`;
    } else if (typeof value === 'object') {
        const entries = Object.entries(value).map(([k, v]) => `${k}: ${dynamoValueToString(v)}`);
        return `{ ${entries.join(', ')} }`;
    }
    
    return String(value);
}

export { generateDynamoDBDocuments };
