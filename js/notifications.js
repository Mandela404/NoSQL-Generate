/**
 * NoSQL Generator - Notifications Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles notification functionality:
 * - Displaying popup notifications
 * - Different notification types (success, error, warning, info)
 * - Auto-dismissing notifications
 * - Animation effects
 */

import { logInfo } from './logger.js';

// Module state
const notificationState = {
    container: null,
    notifications: [],
    initialized: false,
    defaultDuration: 5000, // 5 seconds
    maxNotifications: 3
};

/**
 * Initialize the notifications system
 */
function initNotifications() {
    if (notificationState.initialized) return;
    
    // Get the notification container
    notificationState.container = document.getElementById('notification-container');
    
    if (!notificationState.container) {
        console.error('Notification initialization failed: Container not found');
        return;
    }
    
    // Mark as initialized
    notificationState.initialized = true;
    logInfo('Notification system initialized');
}

/**
 * Show a notification
 * @param {string} type - The notification type (success, error, warning, info)
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {number} [duration] - The duration in milliseconds before auto-dismiss
 */
function showNotification(type, title, message, duration = notificationState.defaultDuration) {
    if (!notificationState.initialized) {
        initNotifications();
    }
    
    // Check if container exists
    if (!notificationState.container) {
        console.error('Cannot show notification: Container not found');
        return;
    }
    
    // Create notification ID
    const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = id;
    
    // Add icon based on type
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.innerHTML = getIconForType(type);
    notification.appendChild(icon);
    
    // Add content
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'notification-title';
    titleElement.textContent = title;
    content.appendChild(titleElement);
    
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    content.appendChild(messageElement);
    
    notification.appendChild(content);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
        dismissNotification(id);
    });
    notification.appendChild(closeButton);
    
    // Add progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'notification-progress';
    notification.appendChild(progressBar);
    
    // Add to container
    notificationState.container.appendChild(notification);
    
    // Add to state
    notificationState.notifications.push({
        id,
        element: notification,
        type,
        title,
        message,
        timestamp: Date.now(),
        timeoutId: null
    });
    
    // Limit the number of notifications
    if (notificationState.notifications.length > notificationState.maxNotifications) {
        const oldestNotification = notificationState.notifications[0];
        dismissNotification(oldestNotification.id);
    }
    
    // Trigger entrance animation
    setTimeout(() => {
        notification.classList.add('show');
        progressBar.style.animation = `progress ${duration / 1000}s linear`;
    }, 10);
    
    // Set auto-dismiss timeout
    const timeoutId = setTimeout(() => {
        dismissNotification(id);
    }, duration);
    
    // Update timeout ID in state
    const notificationIndex = notificationState.notifications.findIndex(n => n.id === id);
    if (notificationIndex !== -1) {
        notificationState.notifications[notificationIndex].timeoutId = timeoutId;
    }
    
    // Log notification
    logInfo(`Notification shown: ${type} - ${title}`);
    
    return id;
}

/**
 * Dismiss a notification
 * @param {string} id - The notification ID
 */
function dismissNotification(id) {
    // Find notification in state
    const notificationIndex = notificationState.notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) return;
    
    const notification = notificationState.notifications[notificationIndex];
    
    // Clear timeout if exists
    if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
    }
    
    // Trigger exit animation
    notification.element.classList.remove('show');
    notification.element.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
    }, 300);
    
    // Remove from state
    notificationState.notifications.splice(notificationIndex, 1);
}

/**
 * Dismiss all notifications
 */
function dismissAllNotifications() {
    // Copy the array to avoid issues while iterating
    const notifications = [...notificationState.notifications];
    
    // Dismiss each notification
    notifications.forEach(notification => {
        dismissNotification(notification.id);
    });
    
    logInfo('All notifications dismissed');
}

/**
 * Get the appropriate icon for a notification type
 * @param {string} type - The notification type
 * @returns {string} The icon HTML
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-times-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        case 'info':
            return '<i class="fas fa-info-circle"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
}

/**
 * Show a success notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {number} [duration] - The duration in milliseconds before auto-dismiss
 * @returns {string} The notification ID
 */
function showSuccessNotification(title, message, duration) {
    return showNotification('success', title, message, duration);
}

/**
 * Show an error notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {number} [duration] - The duration in milliseconds before auto-dismiss
 * @returns {string} The notification ID
 */
function showErrorNotification(title, message, duration) {
    return showNotification('error', title, message, duration);
}

/**
 * Show a warning notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {number} [duration] - The duration in milliseconds before auto-dismiss
 * @returns {string} The notification ID
 */
function showWarningNotification(title, message, duration) {
    return showNotification('warning', title, message, duration);
}

/**
 * Show an info notification
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {number} [duration] - The duration in milliseconds before auto-dismiss
 * @returns {string} The notification ID
 */
function showInfoNotification(title, message, duration) {
    return showNotification('info', title, message, duration);
}

/**
 * Set the default notification duration
 * @param {number} duration - The duration in milliseconds
 */
function setDefaultDuration(duration) {
    if (typeof duration === 'number' && duration > 0) {
        notificationState.defaultDuration = duration;
        logInfo(`Default notification duration set to ${duration}ms`);
    } else {
        logInfo(`Invalid notification duration: ${duration}`);
    }
}

/**
 * Set the maximum number of notifications
 * @param {number} max - The maximum number of notifications
 */
function setMaxNotifications(max) {
    if (typeof max === 'number' && max > 0) {
        notificationState.maxNotifications = max;
        logInfo(`Maximum notifications set to ${max}`);
    } else {
        logInfo(`Invalid maximum notifications: ${max}`);
    }
}

// Export functions
export {
    initNotifications,
    showNotification,
    dismissNotification,
    dismissAllNotifications,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
    setDefaultDuration,
    setMaxNotifications
};
