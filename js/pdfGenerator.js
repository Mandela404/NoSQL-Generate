/**
 * NoSQL Generator - PDF Generator Module
 * Author: Mandela404
 * Version: 1.0.0
 * 
 * This module handles PDF generation from NoSQL data:
 * - Creating tabular PDFs with jsPDF
 * - Adding watermarks and timestamps
 * - Previewing PDFs before download
 */

import { logInfo, logSuccess, logWarning, logError } from './logger.js';
import { formatDate } from './utils.js';

// Module state
const pdfState = {
    initialized: false,
    lastData: null,
    lastOptions: null
};

/**
 * Initialize the PDF generator
 */
function initPdfGenerator() {
    if (pdfState.initialized) return;
    
    // Check if jsPDF is available
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        logError('PDF Generator initialization failed: jsPDF not found');
        return;
    }
    
    // Mark as initialized
    pdfState.initialized = true;
    logInfo('PDF Generator initialized');
}

/**
 * Generate a PDF from NoSQL data
 * @param {string} nosqlData - The NoSQL data to include in the PDF
 * @param {Object} options - PDF generation options
 * @returns {Object} The generated PDF document
 */
function generatePDF(nosqlData, options = {}) {
    if (!pdfState.initialized) {
        initPdfGenerator();
    }
    
    logInfo('Generating PDF...');
    
    try {
        // Save data and options for potential reuse
        pdfState.lastData = nosqlData;
        pdfState.lastOptions = options;
        
        // Create PDF document
        const { jsPDF } = jspdf;
        const orientation = options.orientation || 'portrait';
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties
        doc.setProperties({
            title: options.title || 'NoSQL Data Export',
            subject: 'NoSQL Generator Export',
            author: options.author || 'NoSQL Generator',
            keywords: 'NoSQL, JSON, Database',
            creator: 'NoSQL Generator'
        });
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(options.title || 'NoSQL Data Export', 14, 20);
        
        // Add subtitle with database type if available
        if (options.dbType) {
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text(`Database Type: ${options.dbType.toUpperCase()}`, 14, 28);
        }
        
        // Parse NoSQL data to extract table data
        const tableData = parseNoSQLDataForTable(nosqlData);
        
        // Add table
        addTableToPDF(doc, tableData, 14, 35);
        
        // Add timestamp if enabled
        if (options.includeTimestamp) {
            addTimestampToPDF(doc);
        }
        
        // Add watermark if enabled
        if (options.includeWatermark) {
            addWatermarkToPDF(doc);
        }
        
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }
        
        // Save the PDF
        doc.save(`${options.title || 'nosql_export'}.pdf`);
        
        logSuccess('PDF generated and downloaded');
        
        return doc;
    } catch (error) {
        logError(`PDF generation error: ${error.message}`);
        throw error;
    }
}

/**
 * Preview a PDF from NoSQL data
 * @param {string} nosqlData - The NoSQL data to include in the PDF
 * @param {Object} options - PDF generation options
 */
function previewPDF(nosqlData, options = {}) {
    if (!pdfState.initialized) {
        initPdfGenerator();
    }
    
    logInfo('Previewing PDF...');
    
    try {
        // Save data and options for potential reuse
        pdfState.lastData = nosqlData;
        pdfState.lastOptions = options;
        
        // Create PDF document
        const { jsPDF } = jspdf;
        const orientation = options.orientation || 'portrait';
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties
        doc.setProperties({
            title: options.title || 'NoSQL Data Export',
            subject: 'NoSQL Generator Export',
            author: options.author || 'NoSQL Generator',
            keywords: 'NoSQL, JSON, Database',
            creator: 'NoSQL Generator'
        });
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(options.title || 'NoSQL Data Export', 14, 20);
        
        // Add subtitle with database type if available
        if (options.dbType) {
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text(`Database Type: ${options.dbType.toUpperCase()}`, 14, 28);
        }
        
        // Parse NoSQL data to extract table data
        const tableData = parseNoSQLDataForTable(nosqlData);
        
        // Add table
        addTableToPDF(doc, tableData, 14, 35);
        
        // Add timestamp if enabled
        if (options.includeTimestamp) {
            addTimestampToPDF(doc);
        }
        
        // Add watermark if enabled
        if (options.includeWatermark) {
            addWatermarkToPDF(doc);
        }
        
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }
        
        // Get PDF data URL
        const pdfDataUri = doc.output('datauristring');
        
        // Display in preview container
        const previewContainer = document.getElementById('pdf-preview-container');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <iframe 
                    src="${pdfDataUri}" 
                    width="100%" 
                    height="100%" 
                    style="border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
                </iframe>
            `;
        }
        
        logSuccess('PDF preview generated');
        
        return doc;
    } catch (error) {
        logError(`PDF preview error: ${error.message}`);
        throw error;
    }
}

/**
 * Parse NoSQL data to extract table data
 * @param {string} nosqlData - The NoSQL data to parse
 * @returns {Object} Object containing headers and rows for the table
 */
function parseNoSQLDataForTable(nosqlData) {
    // Try to extract JSON-like structures from the NoSQL code
    const jsonPattern = /\{[^{}]*(\{[^{}]*\})*[^{}]*\}/g;
    const matches = nosqlData.match(jsonPattern);
    
    if (!matches || matches.length === 0) {
        // If no JSON-like structures found, just use the code as text
        return {
            headers: ['Code'],
            rows: nosqlData.split('\n').map(line => [line])
        };
    }
    
    try {
        // Try to extract data from the first match
        const cleanedJson = matches[0]
            .replace(/([a-zA-Z0-9_$]+):/g, '"$1":') // Add quotes to keys
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            .replace(/([a-zA-Z0-9_$]+)\(/g, '"$1(') // Handle function calls
            .replace(/\)([,}])/g, ')\"$1'); // Handle function calls
        
        // Try to parse as JSON
        const parsedData = JSON.parse(cleanedJson);
        
        // Extract headers and rows
        if (Array.isArray(parsedData)) {
            // If it's an array, use the keys from the first object as headers
            if (parsedData.length > 0 && typeof parsedData[0] === 'object') {
                const headers = Object.keys(parsedData[0]);
                const rows = parsedData.map(item => 
                    headers.map(header => formatValueForTable(item[header]))
                );
                
                return { headers, rows };
            }
        } else if (typeof parsedData === 'object') {
            // If it's an object, use the keys as headers and values as a single row
            const headers = Object.keys(parsedData);
            const rows = [headers.map(header => formatValueForTable(parsedData[header]))];
            
            return { headers, rows };
        }
    } catch (error) {
        logWarning(`Could not parse NoSQL data as JSON: ${error.message}`);
    }
    
    // Fallback: Just use the code as text
    return {
        headers: ['Code'],
        rows: nosqlData.split('\n').map(line => [line])
    };
}

/**
 * Format a value for display in a table
 * @param {*} value - The value to format
 * @returns {string} The formatted value
 */
function formatValueForTable(value) {
    if (value === null || value === undefined) {
        return '';
    } else if (typeof value === 'object') {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}

/**
 * Add a table to a PDF document
 * @param {Object} doc - The jsPDF document
 * @param {Object} tableData - The table data with headers and rows
 * @param {number} x - The x position
 * @param {number} y - The y position
 */
function addTableToPDF(doc, tableData, x, y) {
    // Check if jsPDF-AutoTable is available
    if (typeof doc.autoTable !== 'function') {
        logError('Cannot add table: jsPDF-AutoTable not found');
        
        // Fallback: Add text
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        
        let yPos = y;
        tableData.rows.forEach(row => {
            doc.text(row.join(', '), x, yPos);
            yPos += 5;
        });
        
        return;
    }
    
    // Configure table
    doc.autoTable({
        head: [tableData.headers],
        body: tableData.rows,
        startY: y,
        margin: { left: x },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [66, 139, 202],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        columnStyles: {
            0: { fontStyle: 'bold' }
        },
        didDrawPage: function(data) {
            // Add some padding at the bottom of each page
            data.settings.margin.bottom = 20;
        }
    });
}

/**
 * Add a timestamp to a PDF document
 * @param {Object} doc - The jsPDF document
 */
function addTimestampToPDF(doc) {
    const timestamp = formatDate(new Date());
    
    // Add to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated: ${timestamp}`, 14, doc.internal.pageSize.getHeight() - 10);
    }
}

/**
 * Add a watermark to a PDF document
 * @param {Object} doc - The jsPDF document
 */
function addWatermarkToPDF(doc) {
    // Add to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Save current state
        doc.saveGraphicsState();
        
        // Set watermark properties
        doc.setTextColor(230, 230, 230);
        doc.setFontSize(30);
        doc.setFont('helvetica', 'italic');
        
        // Calculate center position
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Rotate and position watermark
        doc.translate(pageWidth / 2, pageHeight / 2);
        doc.rotate(-45);
        doc.text('Mandela404', 0, 0, { align: 'center' });
        
        // Add GitHub URL
        doc.setFontSize(12);
        doc.text('github.com/Mandela404', 0, 10, { align: 'center' });
        
        // Restore state
        doc.restoreGraphicsState();
    }
}

/**
 * Get the current PDF data
 * @returns {Object} Object containing the last data and options
 */
function getCurrentPdfData() {
    return {
        data: pdfState.lastData,
        options: pdfState.lastOptions
    };
}

// Export functions
export {
    initPdfGenerator,
    generatePDF,
    previewPDF,
    getCurrentPdfData
};
