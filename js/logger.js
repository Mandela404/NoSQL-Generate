/**
 * NoSQL Generator - Logger Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles logging functionality for the application:
 * - Displaying logs in the CMD log panel
 * - Different log levels (info, success, warning, error)
 * - Timestamps for logs
 */

// Module state
const loggerState = {
    initialized: false,
    logLevel: 'info', // 'debug', 'info', 'warning', 'error'
    maxLogs: 100,
    logs: []
};

/**
 * Initialize the logger
 */
function initLogger() {
    if (loggerState.initialized) return;
    
    // Get the log container element
    const logContainer = document.getElementById('cmd-log-content');
    
    if (!logContainer) {
        console.error('Logger initialization failed: Log container not found');
        return;
    }
    
    // Add initial log
    logInfo('Logger initialized');
    
    // Mark as initialized
    loggerState.initialized = true;
}

/**
 * Log an informational message
 * @param {string} message - The message to log
 */
function logInfo(message) {
    addLogEntry(message, 'info');
}

/**
 * Log a success message
 * @param {string} message - The message to log
 */
function logSuccess(message) {
    addLogEntry(message, 'success');
}

/**
 * Log a warning message
 * @param {string} message - The message to log
 */
function logWarning(message) {
    addLogEntry(message, 'warning');
}

/**
 * Log an error message
 * @param {string} message - The message to log
 */
function logError(message) {
    addLogEntry(message, 'error');
}

/**
 * Add a log entry to the log container
 * @param {string} message - The message to log
 * @param {string} level - The log level
 */
function addLogEntry(message, level) {
    // Check if we should log based on log level
    if (!shouldLog(level)) return;
    
    // Create log entry object
    const logEntry = {
        timestamp: new Date(),
        message,
        level
    };
    
    // Add to logs array
    loggerState.logs.push(logEntry);
    
    // Trim logs if needed
    if (loggerState.logs.length > loggerState.maxLogs) {
        loggerState.logs.shift();
    }
    
    // Add to DOM if initialized
    if (loggerState.initialized) {
        appendLogToDOM(logEntry);
    }
    
    // Also log to console
    logToConsole(logEntry);
}

/**
 * Append a log entry to the DOM
 * @param {Object} logEntry - The log entry to append
 */
function appendLogToDOM(logEntry) {
    const logContainer = document.getElementById('cmd-log-content');
    if (!logContainer) return;
    
    // Create log element
    const logElement = document.createElement('div');
    logElement.className = `log-entry ${logEntry.level}`;
    
    // Add icon based on level
    const icon = document.createElement('i');
    icon.className = getIconForLevel(logEntry.level);
    logElement.appendChild(icon);
    
    // Add timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = formatTimestamp(logEntry.timestamp);
    logElement.appendChild(timeSpan);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.className = 'log-message';
    messageSpan.textContent = logEntry.message;
    logElement.appendChild(messageSpan);
    
    // Add to container
    logContainer.appendChild(logElement);
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Get the appropriate icon class for a log level
 * @param {string} level - The log level
 * @returns {string} The icon class
 */
function getIconForLevel(level) {
    switch (level) {
        case 'info':
            return 'fas fa-info-circle';
        case 'success':
            return 'fas fa-check-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        case 'error':
            return 'fas fa-times-circle';
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * Format a timestamp for display
 * @param {Date} timestamp - The timestamp to format
 * @returns {string} The formatted timestamp
 */
function formatTimestamp(timestamp) {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    const milliseconds = timestamp.getMilliseconds().toString().padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Log to the browser console
 * @param {Object} logEntry - The log entry to log
 */
function logToConsole(logEntry) {
    const formattedMessage = `[${formatTimestamp(logEntry.timestamp)}] [${logEntry.level.toUpperCase()}] ${logEntry.message}`;
    
    switch (logEntry.level) {
        case 'info':
            console.info(formattedMessage);
            break;
        case 'success':
            console.log('%c' + formattedMessage, 'color: green');
            break;
        case 'warning':
            console.warn(formattedMessage);
            break;
        case 'error':
            console.error(formattedMessage);
            break;
        default:
            console.log(formattedMessage);
    }
}

/**
 * Check if a message should be logged based on the current log level
 * @param {string} level - The log level to check
 * @returns {boolean} Whether the message should be logged
 */
function shouldLog(level) {
    const levels = ['debug', 'info', 'success', 'warning', 'error'];
    const currentLevelIndex = levels.indexOf(loggerState.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
}

/**
 * Clear all logs
 */
function clearLogs() {
    loggerState.logs = [];
    
    const logContainer = document.getElementById('cmd-log-content');
    if (logContainer) {
        logContainer.innerHTML = '';
    }
    
    logInfo('Logs cleared');
}

/**
 * Set the log level
 * @param {string} level - The log level to set
 */
function setLogLevel(level) {
    if (['debug', 'info', 'warning', 'error'].includes(level)) {
        loggerState.logLevel = level;
        logInfo(`Log level set to ${level}`);
    } else {
        logError(`Invalid log level: ${level}`);
    }
}

/**
 * Get all logs
 * @returns {Array} The logs array
 */
function getLogs() {
    return [...loggerState.logs];
}

/**
 * Export logs to a file
 */
function exportLogs() {
    const logText = loggerState.logs.map(log => 
        `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nosql-generator-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    logInfo('Logs exported to file');
}

// Export functions
export {
    initLogger,
    logInfo,
    logSuccess,
    logWarning,
    logError,
    clearLogs,
    setLogLevel,
    getLogs,
    exportLogs
};
