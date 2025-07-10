/**
 * Base PDF Format class with common utilities for all PDF formats
 */
class BasePDFFormat {
  constructor() {
    this.defaultStyles = this.getDefaultStyles();
  }

  /**
   * Get default CSS styles for PDF generation
   * @returns {string} - CSS styles
   */
  getDefaultStyles() {
    return `
      @page {
        size: A4 portrait;
        margin: 0.5in;
      }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        margin: 0;
        padding: 0;
        line-height: 1.3;
        color: black;
        width: 100%;
        max-width: 8.5in;
        overflow-x: hidden;
      }
      .form-container {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
      }
      td, th {
        border: 1px solid black;
        padding: 6px;
        vertical-align: top;
        font-size: 10px;
      }
      .no-border {
        border: none !important;
      }
      .center {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
      .small-text {
        font-size: 9px;
      }
      .checkbox {
        width: 14px;
        height: 14px;
        border: 2px solid black;
        display: inline-block;
        text-align: center;
        margin-right: 8px;
        font-size: 10px;
        font-weight: bold;
        line-height: 10px;
        vertical-align: middle;
      }
      .checkbox-checked::before {
        content: "✓";
      }
      .field-input {
        border-bottom: 1px solid black;
        min-height: 18px;
        padding: 3px;
        display: block;
        width: calc(100% - 6px);
        font-size: 10px;
      }
      .signature-box {
        height: 50px;
        border: 1px solid black;
        margin: 5px 0;
      }
      .page-break {
        page-break-before: always;
      }
    `;
  }

  /**
   * Safely get field value with default fallback
   * @param {*} value - Field value
   * @param {string} defaultValue - Default value if field is empty
   * @returns {string} - Safe field value
   */
  safeFieldValue(value, defaultValue = '') {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return String(value);
  }

  /**
   * Format number value
   * @param {*} value - Number value
   * @returns {string} - Formatted number
   */
  formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toString();
  }

  /**
   * Create checkbox HTML with proper checked state
   * @param {boolean|string} isChecked - Whether checkbox is checked
   * @returns {string} - Checkbox HTML
   */
  createCheckbox(isChecked) {
    const checked = isChecked === true || isChecked === 'true' || isChecked === '1' || isChecked === 1;
    return `<span class="checkbox ${checked ? 'checkbox-checked' : ''}"></span>`;
  }

  /**
   * Get checkbox state for form fields
   * @param {Object} formData - Form data object
   * @param {string} fieldName - Field name
   * @param {string} value - Value to check against
   * @returns {string} - Checkbox symbol
   */
  getCheckboxState(formData, fieldName, value) {
    if (Array.isArray(formData[fieldName])) {
      return formData[fieldName].includes(value) ? '☑' : '☐';
    }
    return formData[fieldName] === value ? '☑' : '☐';
  }

  /**
   * Get field value safely
   * @param {Object} formData - Form data object
   * @param {string} fieldName - Field name
   * @param {string} defaultValue - Default value
   * @returns {string} - Field value
   */
  getValue(formData, fieldName, defaultValue = '') {
    return this.safeFieldValue(formData[fieldName], defaultValue);
  }

  /**
   * Get current date formatted
   * @returns {string} - Formatted current date
   */
  getCurrentDate() {
    return new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  }

  /**
   * Get current time formatted
   * @returns {string} - Formatted current time
   */
  getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Create HTML document structure
   * @param {string} title - Document title
   * @param {string} styles - Additional CSS styles
   * @param {string} content - HTML content
   * @returns {string} - Complete HTML document
   */
  createHTMLDocument(title, styles, content) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        ${this.defaultStyles}
        ${styles || ''}
      </style>
    </head>
    <body>
      <div class="form-container">
        ${content}
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = BasePDFFormat;
