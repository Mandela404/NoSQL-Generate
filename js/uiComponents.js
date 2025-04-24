/**
 * NoSQL Generator - UI Components Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles all UI-related functionality including:
 * - Sidebar toggling
 * - Theme switching
 * - CMD log panel
 * - Responsive design adjustments
 */

import { logInfo } from './logger.js';

// UI state
const uiState = {
    sidebarCollapsed: false,
    cmdLogOpen: false,
    isMobile: window.innerWidth < 992,
    activeTooltip: null
};

/**
 * Initialize UI components
 */
function initUI() {
    logInfo('Initializing UI components...');
    
    // Check if we're on mobile
    checkMobileView();
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize syntax highlighting if available
    initSyntaxHighlighting();
    
    // Initialize line numbers if enabled
    initLineNumbers();
    
    // Set up auto-resize for textareas
    initTextareaAutoResize();
    
    // Add input event listeners
    addInputListeners();
}

/**
 * Check if we're on mobile and adjust UI accordingly
 */
function checkMobileView() {
    uiState.isMobile = window.innerWidth < 992;
    
    if (uiState.isMobile) {
        document.querySelector('.sidebar').classList.add('collapsed');
        uiState.sidebarCollapsed = true;
    }
}

/**
 * Handle window resize events
 */
function handleResize() {
    const wasMobile = uiState.isMobile;
    uiState.isMobile = window.innerWidth < 992;
    
    // If transitioning between mobile and desktop
    if (wasMobile !== uiState.isMobile) {
        if (uiState.isMobile) {
            document.querySelector('.sidebar').classList.add('collapsed');
            uiState.sidebarCollapsed = true;
        } else {
            document.querySelector('.sidebar').classList.remove('collapsed');
            uiState.sidebarCollapsed = false;
        }
    }
    
    // Adjust any open tooltips
    if (uiState.activeTooltip) {
        positionTooltip(uiState.activeTooltip);
    }
}

/**
 * Toggle sidebar expanded/collapsed state
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    
    if (uiState.isMobile) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        uiState.sidebarCollapsed = sidebar.classList.contains('collapsed');
    }
    
    logInfo(`Sidebar ${uiState.sidebarCollapsed ? 'collapsed' : 'expanded'}`);
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    const themeIcon = document.getElementById('theme-toggle').querySelector('i');
    if (isDark) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    logInfo(`Theme switched to ${isDark ? 'dark' : 'light'} mode`);
}

/**
 * Toggle CMD log panel visibility
 */
function toggleCmdLog() {
    const cmdLogPanel = document.getElementById('cmd-log-panel');
    cmdLogPanel.classList.toggle('open');
    uiState.cmdLogOpen = cmdLogPanel.classList.contains('open');
    
    logInfo(`CMD log panel ${uiState.cmdLogOpen ? 'opened' : 'closed'}`);
}

/**
 * Initialize tooltips for buttons and controls
 */
function initTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '1000';
    tooltip.style.backgroundColor = 'var(--bg-primary)';
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = 'var(--border-radius-sm)';
    tooltip.style.boxShadow = 'var(--shadow-md)';
    tooltip.style.fontSize = 'var(--font-size-sm)';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s ease-in-out';
    document.body.appendChild(tooltip);
    
    // Add tooltip functionality to elements with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            tooltip.textContent = e.target.dataset.tooltip;
            tooltip.style.opacity = '1';
            uiState.activeTooltip = e.target;
            positionTooltip(e.target, tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            uiState.activeTooltip = null;
        });
    });
}

/**
 * Position tooltip relative to target element
 * @param {HTMLElement} target - The element to position tooltip near
 * @param {HTMLElement} tooltip - The tooltip element
 */
function positionTooltip(target, tooltip) {
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Position above the element by default
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // If tooltip would go off the top of the screen, position it below the element
    if (top < 0) {
        top = rect.bottom + 10;
    }
    
    // Make sure tooltip doesn't go off left or right edge of screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

/**
 * Initialize syntax highlighting for code elements
 */
function initSyntaxHighlighting() {
    // This is a placeholder for syntax highlighting
    // In a real implementation, this would use a library like highlight.js
    // or prism.js to add syntax highlighting to code elements
    
    // For now, we'll just add a basic class to code elements
    document.querySelectorAll('pre').forEach(pre => {
        pre.classList.add('syntax-highlighted');
    });
}

/**
 * Initialize line numbers for code blocks
 */
function initLineNumbers() {
    document.querySelectorAll('pre').forEach(pre => {
        if (pre.classList.contains('line-numbers')) return;
        
        pre.classList.add('line-numbers');
        const content = pre.textContent;
        const lines = content.split('\n');
        
        // Create line number element
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers-rows';
        
        // Add line number spans
        for (let i = 0; i < lines.length; i++) {
            const span = document.createElement('span');
            lineNumbers.appendChild(span);
        }
        
        pre.appendChild(lineNumbers);
    });
}

/**
 * Initialize auto-resize for textareas
 */
function initTextareaAutoResize() {
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Initial height
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });
}

/**
 * Add input event listeners for real-time validation and formatting
 */
function addInputListeners() {
    // JSON input auto-format on paste if enabled
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) {
        jsonInput.addEventListener('paste', (e) => {
            // Check if auto-format is enabled in settings
            const autoFormat = document.getElementById('auto-format')?.checked;
            if (autoFormat) {
                // Allow the paste to complete, then format
                setTimeout(() => {
                    document.getElementById('format-json').click();
                }, 0);
            }
        });
    }
    
    // Font size slider
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', () => {
            fontSizeValue.textContent = `${fontSizeSlider.value}px`;
        });
    }
}

/**
 * Create a draggable splitter between two elements
 * @param {string} containerId - The ID of the container element
 * @param {string} leftId - The ID of the left/top element
 * @param {string} rightId - The ID of the right/bottom element
 * @param {boolean} vertical - Whether the splitter is vertical (true) or horizontal (false)
 */
function createSplitter(containerId, leftId, rightId, vertical = true) {
    const container = document.getElementById(containerId);
    const leftElement = document.getElementById(leftId);
    const rightElement = document.getElementById(rightId);
    
    if (!container || !leftElement || !rightElement) return;
    
    // Create splitter element
    const splitter = document.createElement('div');
    splitter.className = vertical ? 'vertical-splitter' : 'horizontal-splitter';
    container.insertBefore(splitter, rightElement);
    
    // Add styling
    splitter.style.position = 'absolute';
    splitter.style.backgroundColor = 'var(--border-color)';
    splitter.style.cursor = vertical ? 'col-resize' : 'row-resize';
    
    if (vertical) {
        splitter.style.width = '4px';
        splitter.style.top = '0';
        splitter.style.bottom = '0';
        splitter.style.left = `${leftElement.offsetWidth}px`;
    } else {
        splitter.style.height = '4px';
        splitter.style.left = '0';
        splitter.style.right = '0';
        splitter.style.top = `${leftElement.offsetHeight}px`;
    }
    
    // Add hover effect
    splitter.addEventListener('mouseenter', () => {
        splitter.style.backgroundColor = 'var(--primary-color)';
    });
    
    splitter.addEventListener('mouseleave', () => {
        splitter.style.backgroundColor = 'var(--border-color)';
    });
    
    // Add drag functionality
    let startPos, startLeftWidth, startRightWidth, startLeftHeight, startRightHeight;
    
    splitter.addEventListener('mousedown', (e) => {
        startPos = vertical ? e.clientX : e.clientY;
        startLeftWidth = leftElement.offsetWidth;
        startRightWidth = rightElement.offsetWidth;
        startLeftHeight = leftElement.offsetHeight;
        startRightHeight = rightElement.offsetHeight;
        
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    function mousemove(e) {
        if (vertical) {
            const pos = e.clientX;
            const diff = pos - startPos;
            
            const newLeftWidth = startLeftWidth + diff;
            const newRightWidth = startRightWidth - diff;
            
            if (newLeftWidth > 100 && newRightWidth > 100) {
                leftElement.style.width = `${newLeftWidth}px`;
                rightElement.style.width = `${newRightWidth}px`;
                splitter.style.left = `${newLeftWidth}px`;
            }
        } else {
            const pos = e.clientY;
            const diff = pos - startPos;
            
            const newLeftHeight = startLeftHeight + diff;
            const newRightHeight = startRightHeight - diff;
            
            if (newLeftHeight > 100 && newRightHeight > 100) {
                leftElement.style.height = `${newLeftHeight}px`;
                rightElement.style.height = `${newRightHeight}px`;
                splitter.style.top = `${newLeftHeight}px`;
            }
        }
    }
    
    function mouseup() {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
}

/**
 * Create a custom scrollbar for an element
 * @param {string} elementId - The ID of the element to add custom scrollbar to
 */
function createCustomScrollbar(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Add custom scrollbar class
    element.classList.add('custom-scrollbar');
    
    // Add styling if not already in CSS
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--border-dark);
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-color);
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Create a resizable panel
 * @param {string} elementId - The ID of the element to make resizable
 * @param {Object} options - Options for the resizable panel
 */
function createResizablePanel(elementId, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const defaults = {
        minWidth: 200,
        minHeight: 100,
        maxWidth: Infinity,
        maxHeight: Infinity,
        handles: ['e', 's', 'se'] // east, south, southeast
    };
    
    const settings = { ...defaults, ...options };
    
    // Add necessary styling
    element.style.position = 'relative';
    element.style.overflow = 'auto';
    
    // Create resize handles
    settings.handles.forEach(handle => {
        const div = document.createElement('div');
        div.className = `resize-handle resize-handle-${handle}`;
        
        // Style the handle
        div.style.position = 'absolute';
        div.style.width = handle.includes('e') ? '10px' : 'auto';
        div.style.height = handle.includes('s') ? '10px' : 'auto';
        div.style.right = handle.includes('e') ? '0' : 'auto';
        div.style.bottom = handle.includes('s') ? '0' : 'auto';
        div.style.cursor = handle === 'e' ? 'ew-resize' : 
                          handle === 's' ? 'ns-resize' : 
                          'nwse-resize';
        
        element.appendChild(div);
        
        // Add event listeners
        let startX, startY, startWidth, startHeight;
        
        div.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            
            e.preventDefault();
        });
        
        function mousemove(e) {
            if (handle.includes('e')) {
                const newWidth = startWidth + (e.clientX - startX);
                if (newWidth >= settings.minWidth && newWidth <= settings.maxWidth) {
                    element.style.width = `${newWidth}px`;
                }
            }
            
            if (handle.includes('s')) {
                const newHeight = startHeight + (e.clientY - startY);
                if (newHeight >= settings.minHeight && newHeight <= settings.maxHeight) {
                    element.style.height = `${newHeight}px`;
                }
            }
        }
        
        function mouseup() {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
    });
}

/**
 * Create a collapsible panel
 * @param {string} headerId - The ID of the header element that toggles collapse
 * @param {string} contentId - The ID of the content element to collapse
 */
function createCollapsiblePanel(headerId, contentId) {
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);
    
    if (!header || !content) return;
    
    // Add collapse icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-chevron-down collapse-icon';
    icon.style.marginLeft = 'auto';
    icon.style.transition = 'transform 0.3s ease';
    header.appendChild(icon);
    
    // Add initial styling
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease';
    content.style.maxHeight = `${content.scrollHeight}px`;
    
    // Add click handler
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
        const isCollapsed = content.style.maxHeight === '0px';
        
        if (isCollapsed) {
            content.style.maxHeight = `${content.scrollHeight}px`;
            icon.style.transform = 'rotate(0deg)';
        } else {
            content.style.maxHeight = '0px';
            icon.style.transform = 'rotate(-90deg)';
        }
    });
}

/**
 * Create tabs interface
 * @param {string} containerId - The ID of the container element
 * @param {Array} tabs - Array of tab objects with id, label, and content properties
 */
function createTabs(containerId, tabs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create tab navigation
    const tabNav = document.createElement('div');
    tabNav.className = 'tab-nav';
    tabNav.style.display = 'flex';
    tabNav.style.borderBottom = '1px solid var(--border-color)';
    
    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    
    // Add tabs
    tabs.forEach((tab, index) => {
        // Create tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.textContent = tab.label;
        tabButton.dataset.tabId = tab.id;
        
        // Style tab button
        tabButton.style.padding = 'var(--spacing-sm) var(--spacing-md)';
        tabButton.style.border = 'none';
        tabButton.style.background = 'none';
        tabButton.style.cursor = 'pointer';
        tabButton.style.borderBottom = '2px solid transparent';
        tabButton.style.transition = 'var(--transition-base)';
        
        // Create tab panel
        const tabPanel = document.createElement('div');
        tabPanel.className = 'tab-panel';
        tabPanel.id = `tab-panel-${tab.id}`;
        tabPanel.innerHTML = tab.content;
        
        // Style tab panel
        tabPanel.style.display = 'none';
        tabPanel.style.padding = 'var(--spacing-md)';
        
        // Set active tab
        if (index === 0) {
            tabButton.classList.add('active');
            tabButton.style.borderBottomColor = 'var(--primary-color)';
            tabButton.style.color = 'var(--primary-color)';
            tabPanel.style.display = 'block';
        }
        
        // Add click handler
        tabButton.addEventListener('click', () => {
            // Deactivate all tabs
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.style.borderBottomColor = 'transparent';
                btn.style.color = 'var(--text-primary)';
            });
            
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.style.display = 'none';
            });
            
            // Activate clicked tab
            tabButton.classList.add('active');
            tabButton.style.borderBottomColor = 'var(--primary-color)';
            tabButton.style.color = 'var(--primary-color)';
            tabPanel.style.display = 'block';
        });
        
        // Add to DOM
        tabNav.appendChild(tabButton);
        tabContent.appendChild(tabPanel);
    });
    
    // Add to container
    container.appendChild(tabNav);
    container.appendChild(tabContent);
}

/**
 * Create a dropdown menu
 * @param {string} triggerId - The ID of the trigger element
 * @param {Array} items - Array of menu items with label and action properties
 */
function createDropdownMenu(triggerId, items) {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    
    // Style dropdown
    dropdown.style.position = 'absolute';
    dropdown.style.backgroundColor = 'var(--bg-primary)';
    dropdown.style.boxShadow = 'var(--shadow-md)';
    dropdown.style.borderRadius = 'var(--border-radius-sm)';
    dropdown.style.padding = 'var(--spacing-xs) 0';
    dropdown.style.zIndex = '100';
    dropdown.style.minWidth = '150px';
    dropdown.style.display = 'none';
    
    // Add items
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'dropdown-item';
        menuItem.textContent = item.label;
        
        // Style menu item
        menuItem.style.padding = 'var(--spacing-sm) var(--spacing-md)';
        menuItem.style.cursor = 'pointer';
        menuItem.style.transition = 'var(--transition-base)';
        
        // Add hover effect
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = 'var(--bg-secondary)';
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
        });
        
        // Add click handler
        menuItem.addEventListener('click', () => {
            item.action();
            dropdown.style.display = 'none';
        });
        
        dropdown.appendChild(menuItem);
    });
    
    // Add dropdown to DOM
    document.body.appendChild(dropdown);
    
    // Position dropdown
    function positionDropdown() {
        const rect = trigger.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
    }
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
        const isVisible = dropdown.style.display === 'block';
        
        if (isVisible) {
            dropdown.style.display = 'none';
        } else {
            positionDropdown();
            dropdown.style.display = 'block';
        }
        
        e.stopPropagation();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.style.display = 'none';
    });
    
    // Update position on window resize
    window.addEventListener('resize', () => {
        if (dropdown.style.display === 'block') {
            positionDropdown();
        }
    });
}

// Export functions
export {
    initUI,
    toggleSidebar,
    toggleTheme,
    toggleCmdLog,
    createSplitter,
    createCustomScrollbar,
    createResizablePanel,
    createCollapsiblePanel,
    createTabs,
    createDropdownMenu
};
