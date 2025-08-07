/**
 * Form Validation Utility
 * Provides common validation functions for forms
 */

class FormValidator {
    constructor() {
        this.errors = [];
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = [];
        document.querySelectorAll('.error-text').forEach(error => {
            error.style.display = 'none';
            error.classList.remove('show');
        });
        document.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
        });
    }

    /**
     * Show error for a specific field
     */
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.classList.add('show');
        }
        
        const inputElement = document.getElementById(elementId.replace('-error', ''));
        if (inputElement) {
            inputElement.classList.add('error');
        }
        
        this.errors.push({ field: elementId, message });
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate required field
     */
    validateRequired(value, fieldName, errorElementId) {
        if (!value || !value.trim()) {
            this.showError(errorElementId, `${fieldName} is required`);
            return false;
        }
        return true;
    }

    /**
     * Validate email field
     */
    validateEmail(email, errorElementId) {
        if (!this.validateRequired(email, 'Email', errorElementId)) {
            return false;
        }
        if (!this.isValidEmail(email)) {
            this.showError(errorElementId, 'Please enter a valid email address');
            return false;
        }
        return true;
    }

    /**
     * Validate username
     */
    validateUsername(username, errorElementId, minLength = 3) {
        if (!this.validateRequired(username, 'Username', errorElementId)) {
            return false;
        }
        if (username.length < minLength) {
            this.showError(errorElementId, `Username must be at least ${minLength} characters`);
            return false;
        }
        return true;
    }

    /**
     * Validate password
     */
    validatePassword(password, errorElementId, minLength = 6) {
        if (!this.validateRequired(password, 'Password', errorElementId)) {
            return false;
        }
        if (password.length < minLength) {
            this.showError(errorElementId, `Password must be at least ${minLength} characters`);
            return false;
        }
        return true;
    }

    /**
     * Validate password confirmation
     */
    validatePasswordConfirmation(password, confirmPassword, errorElementId) {
        if (!this.validateRequired(confirmPassword, 'Password confirmation', errorElementId)) {
            return false;
        }
        if (password !== confirmPassword) {
            this.showError(errorElementId, 'Passwords do not match');
            return false;
        }
        return true;
    }

    /**
     * Validate select field
     */
    validateSelect(value, fieldName, errorElementId) {
        if (!value) {
            this.showError(errorElementId, `Please select a ${fieldName.toLowerCase()}`);
            return false;
        }
        return true;
    }

    /**
     * Check if form has any errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }
}

// Export for use in other files
window.FormValidator = FormValidator;
