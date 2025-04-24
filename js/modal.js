/**
 * NoSQL Generator - Modal Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles modal dialog functionality:
 * - Displaying modal dialogs
 * - Customizable content and buttons
 * - Animation effects
 * - Callback handling
 */

import { logInfo } from './logger.js';

// Module state
const modalState = {
    overlay: null,
    container: null,
    title: null,
    content: null,
    cancelButton: null,
    confirmButton: null,
    closeButton: null,
    initialized: false,
    isOpen: false,
    currentCallback: null
};

/**
 * Initialize the modal system
 */
function initModal() {
    if (modalState.initialized) return;
    
    // Get modal elements
    modalState.overlay = document.getElementById('modal-overlay');
    modalState.container = document.getElementById('modal-container');
    modalState.title = document.getElementById('modal-title');
    modalState.content = document.getElementById('modal-content');
    modalState.cancelButton = document.getElementById('modal-cancel');
    modalState.confirmButton = document.getElementById('modal-confirm');
    modalState.closeButton = document.getElementById('modal-close');
    
    if (!modalState.overlay || !modalState.container) {
        console.error('Modal initialization failed: Elements not found');
        return;
    }
    
    // Set up event listeners
    modalState.closeButton.addEventListener('click', closeModal);
    modalState.cancelButton.addEventListener('click', closeModal);
    modalState.confirmButton.addEventListener('click', handleConfirm);
    
    // Close modal when clicking outside
    modalState.overlay.addEventListener('click', (e) => {
        if (e.target === modalState.overlay) {
            closeModal();
        }
    });
    
    // Add keyboard event listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalState.isOpen) {
            closeModal();
        }
    });
    
    // Mark as initialized
    modalState.initialized = true;
    logInfo('Modal system initialized');
}

/**
 * Show a modal dialog
 * @param {string} title - The modal title
 * @param {string} content - The modal content (can include HTML)
 * @param {string} [confirmText='OK'] - The text for the confirm button
 * @param {Function} [callback] - Callback function to execute when confirmed
 * @param {boolean} [showCancel=true] - Whether to show the cancel button
 * @param {string} [cancelText='Cancel'] - The text for the cancel button
 */
function showModal(title, content, confirmText = 'OK', callback = null, showCancel = true, cancelText = 'Cancel') {
    if (!modalState.initialized) {
        initModal();
    }
    
    // Set modal content
    modalState.title.textContent = title;
    modalState.content.innerHTML = content;
    modalState.confirmButton.textContent = confirmText;
    modalState.cancelButton.textContent = cancelText;
    
    // Show/hide cancel button
    modalState.cancelButton.style.display = showCancel ? 'block' : 'none';
    
    // Store callback
    modalState.currentCallback = callback;
    
    // Show modal
    modalState.overlay.classList.add('open');
    modalState.isOpen = true;
    
    // Focus confirm button
    setTimeout(() => {
        modalState.confirmButton.focus();
    }, 100);
    
    logInfo(`Modal shown: ${title}`);
}

/**
 * Close the modal dialog
 */
function closeModal() {
    if (!modalState.isOpen) return;
    
    // Hide modal
    modalState.overlay.classList.remove('open');
    modalState.isOpen = false;
    
    // Clear callback
    modalState.currentCallback = null;
    
    logInfo('Modal closed');
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    // Execute callback if exists
    if (typeof modalState.currentCallback === 'function') {
        modalState.currentCallback();
    }
    
    // Close modal
    closeModal();
}

/**
 * Show a confirmation modal
 * @param {string} title - The modal title
 * @param {string} message - The confirmation message
 * @param {Function} onConfirm - Callback function to execute when confirmed
 * @param {string} [confirmText='Confirm'] - The text for the confirm button
 * @param {string} [cancelText='Cancel'] - The text for the cancel button
 */
function showConfirmation(title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') {
    showModal(title, message, confirmText, onConfirm, true, cancelText);
}

/**
 * Show an alert modal
 * @param {string} title - The modal title
 * @param {string} message - The alert message
 * @param {Function} [onClose] - Callback function to execute when closed
 * @param {string} [buttonText='OK'] - The text for the button
 */
function showAlert(title, message, onClose = null, buttonText = 'OK') {
    showModal(title, message, buttonText, onClose, false);
}

/**
 * Show a form modal
 * @param {string} title - The modal title
 * @param {Array} fields - Array of field objects with name, label, type, and value properties
 * @param {Function} onSubmit - Callback function to execute when submitted, receives form data
 * @param {string} [submitText='Submit'] - The text for the submit button
 * @param {string} [cancelText='Cancel'] - The text for the cancel button
 */
function showFormModal(title, fields, onSubmit, submitText = 'Submit', cancelText = 'Cancel') {
    // Create form HTML
    let formHtml = '<form id="modal-form">';
    
    fields.forEach(field => {
        formHtml += `<div class="form-group">`;
        formHtml += `<label for="modal-field-${field.name}">${field.label}</label>`;
        
        if (field.type === 'textarea') {
            formHtml += `<textarea id="modal-field-${field.name}" name="${field.name}" 
                          ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`;
        } else if (field.type === 'select') {
            formHtml += `<div class="select-wrapper">`;
            formHtml += `<select id="modal-field-${field.name}" name="${field.name}" 
                          ${field.required ? 'required' : ''}>`;
            
            if (field.options && Array.isArray(field.options)) {
                field.options.forEach(option => {
                    const isSelected = option.value === field.value;
                    formHtml += `<option value="${option.value}" ${isSelected ? 'selected' : ''}>${option.label}</option>`;
                });
            }
            
            formHtml += `</select>`;
            formHtml += `</div>`;
        } else if (field.type === 'checkbox') {
            formHtml += `<label class="checkbox-label">`;
            formHtml += `<input type="checkbox" id="modal-field-${field.name}" name="${field.name}" 
                          ${field.value ? 'checked' : ''} ${field.required ? 'required' : ''}>`;
            formHtml += `<span>${field.checkboxLabel || ''}</span>`;
            formHtml += `</label>`;
        } else if (field.type === 'radio' && field.options) {
            formHtml += `<div class="radio-group">`;
            
            field.options.forEach(option => {
                const isChecked = option.value === field.value;
                formHtml += `<label>`;
                formHtml += `<input type="radio" name="${field.name}" value="${option.value}" 
                              ${isChecked ? 'checked' : ''} ${field.required ? 'required' : ''}>`;
                formHtml += `<span>${option.label}</span>`;
                formHtml += `</label>`;
            });
            
            formHtml += `</div>`;
        } else {
            formHtml += `<input type="${field.type || 'text'}" id="modal-field-${field.name}" 
                          name="${field.name}" value="${field.value || ''}" 
                          ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} 
                          ${field.required ? 'required' : ''}>`;
        }
        
        formHtml += `</div>`;
    });
    
    formHtml += '</form>';
    
    // Show modal with form
    showModal(title, formHtml, submitText, () => {
        // Get form data
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add checkbox values that might be missing (unchecked)
        fields.forEach(field => {
            if (field.type === 'checkbox' && !data[field.name]) {
                data[field.name] = false;
            }
        });
        
        // Call onSubmit with form data
        onSubmit(data);
    }, true, cancelText);
    
    // Add form submit handler to trigger confirm button
    setTimeout(() => {
        const form = document.getElementById('modal-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                modalState.confirmButton.click();
            });
            
            // Focus first input
            const firstInput = form.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }, 100);
}

/**
 * Show a custom modal with specific buttons and actions
 * @param {string} title - The modal title
 * @param {string} content - The modal content (can include HTML)
 * @param {Array} buttons - Array of button objects with text, class, and action properties
 */
function showCustomModal(title, content, buttons) {
    if (!modalState.initialized) {
        initModal();
    }
    
    // Set modal content
    modalState.title.textContent = title;
    modalState.content.innerHTML = content;
    
    // Hide default buttons
    modalState.confirmButton.style.display = 'none';
    modalState.cancelButton.style.display = 'none';
    
    // Create custom buttons
    const footerElement = document.getElementById('modal-footer');
    const existingCustomButtons = footerElement.querySelectorAll('.custom-button');
    
    // Remove any existing custom buttons
    existingCustomButtons.forEach(button => {
        button.remove();
    });
    
    // Add new custom buttons
    buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.textContent = buttonConfig.text;
        button.className = `btn ${buttonConfig.class || 'btn-secondary'} custom-button`;
        
        button.addEventListener('click', () => {
            if (typeof buttonConfig.action === 'function') {
                buttonConfig.action();
            }
            
            if (buttonConfig.closeOnClick !== false) {
                closeModal();
            }
        });
        
        footerElement.appendChild(button);
    });
    
    // Show modal
    modalState.overlay.classList.add('open');
    modalState.isOpen = true;
    
    logInfo(`Custom modal shown: ${title}`);
    
    // Return a cleanup function to restore default buttons
    return () => {
        // Remove custom buttons
        const customButtons = footerElement.querySelectorAll('.custom-button');
        customButtons.forEach(button => {
            button.remove();
        });
        
        // Restore default buttons
        modalState.confirmButton.style.display = 'block';
        modalState.cancelButton.style.display = 'block';
    };
}

/**
 * Check if a modal is currently open
 * @returns {boolean} Whether a modal is open
 */
function isModalOpen() {
    return modalState.isOpen;
}

// Export functions
export {
    initModal,
    showModal,
    closeModal,
    showConfirmation,
    showAlert,
    showFormModal,
    showCustomModal,
    isModalOpen
};
