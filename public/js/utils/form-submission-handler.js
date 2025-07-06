/**
 * Centralized Form Submission Handler
 * Handles form submission for all form types (SARF, Internal Client, External Client)
 */

class FormSubmissionHandler {
    constructor(formType, options = {}) {
        this.formType = formType; // 'sarf', 'internal', 'external'
        this.options = {
            formId: 'combinedForm',
            confirmationTitle: 'Submit Form',
            confirmationMessage: 'Are you sure you want to submit this form?',
            successTitle: 'Form Submitted Successfully!',
            successMessage: 'Your form has been submitted and PDF generated.',
            ...options
        };
        
        this.apiEndpoints = {
            sarf: {
                submit: '/api/sarf/submit',
                preview: '/api/sarf/preview-pdf'
            },
            internal: {
                submit: '/api/sarf/internal/submit',
                preview: '/api/sarf/internal/preview-pdf'
            },
            external: {
                submit: '/api/sarf/external/submit',
                preview: '/api/sarf/external/preview-pdf'
            }
        };
    }

    /**
     * Initialize the form submission handler
     */
    init() {
        const form = document.getElementById(this.options.formId);
        if (form) {
            // Replace the existing onsubmit handler
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            };
        }
    }

    /**
     * Handle form submission with confirmation and PDF generation
     */
    async handleFormSubmission() {
        try {
            // Show confirmation modal
            const confirmed = await showConfirmationModal({
                title: this.options.confirmationTitle,
                message: this.options.confirmationMessage,
                confirmText: 'Submit',
                cancelText: 'Cancel',
                type: 'info'
            });

            if (!confirmed) {
                return;
            }

            // Collect and validate form data
            const formData = this.collectFormData();
            const validation = this.validateFormData(formData);
            
            if (!validation.isValid) {
                await showErrorModal({
                    title: 'Validation Error',
                    message: validation.message
                });
                return;
            }

            // Submit form
            await this.submitForm(formData);

        } catch (error) {
            console.error('Error submitting form:', error);
            await showErrorModal({
                title: 'Submission Error',
                message: 'An error occurred while submitting the form. Please try again.'
            });
        }
    }

    /**
     * Collect form data from all inputs
     */
    collectFormData() {
        const form = document.getElementById(this.options.formId);
        const formData = {};

        // Get all input elements
        const inputs = form.querySelectorAll('input[name], select[name], textarea[name]');
        
        inputs.forEach(input => {
            const name = input.name;
            if (!name) return;

            if (input.type === 'checkbox') {
                if (!formData[name]) {
                    formData[name] = [];
                }
                if (input.checked) {
                    formData[name].push(input.value);
                }
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[name] = input.value;
                }
            } else {
                formData[name] = input.value;
            }
        });

        // Convert single-item arrays to strings for radio-like checkboxes
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key]) && formData[key].length === 1) {
                formData[key] = formData[key][0];
            } else if (Array.isArray(formData[key]) && formData[key].length === 0) {
                formData[key] = '';
            }
        });

        return formData;
    }

    /**
     * Validate form data based on form type
     */
    validateFormData(formData) {
        const requiredFields = this.getRequiredFields();

        for (const required of requiredFields) {
            if (!formData[required.field] || formData[required.field].toString().trim() === '') {
                return {
                    isValid: false,
                    message: `${required.label} is required.`
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Get required fields based on form type
     */
    getRequiredFields() {
        const fieldMaps = {
            sarf: [
                { field: 'organization_name', label: 'Organization Name' },
                { field: 'activity_title', label: 'Activity Title' },
                { field: 'activity_date', label: 'Activity Date' },
                { field: 'contact_person', label: 'Contact Person' }
            ],
            internal: [
                { field: 'organization_name', label: 'Organization Name' },
                { field: 'event_name', label: 'Function/Event' },
                { field: 'event_date', label: 'Event Date' },
                { field: 'contact', label: 'Contact Information' }
            ],
            external: [
                { field: 'organization_name', label: 'Organization Name' },
                { field: 'contact_person', label: 'Contact Person' },
                { field: 'title_theme', label: 'Title/Theme of Activity' },
                { field: 'reserve_date', label: 'Date being reserved' }
            ]
        };

        return fieldMaps[this.formType] || [];
    }

    /**
     * Submit form to backend
     */
    async submitForm(formData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const endpoint = this.apiEndpoints[this.formType].submit;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                await showSuccessModalWithPDF({
                    title: this.options.successTitle,
                    message: this.options.successMessage,
                    pdfUrl: result.data.pdfUrl,
                    pdfId: result.data.id,
                    controlNumber: result.data.control
                });

                // Reset form
                document.getElementById(this.options.formId).reset();
                
                // Optional redirect
                if (this.options.redirectAfterSubmit) {
                    setTimeout(() => {
                        window.location.href = this.options.redirectAfterSubmit;
                    }, 2000);
                }
            } else {
                await showErrorModal({
                    title: 'Submission Failed',
                    message: result.message || 'Failed to submit form. Please try again.'
                });
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            await showErrorModal({
                title: 'Network Error',
                message: 'Unable to connect to the server. Please check your internet connection and try again.'
            });
        }
    }

    /**
     * Preview form as PDF without submitting
     */
    async previewForm() {
        try {
            const formData = this.collectFormData();
            const validation = this.validateFormData(formData);
            
            if (!validation.isValid) {
                await showErrorModal({
                    title: 'Validation Error',
                    message: validation.message
                });
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const endpoint = this.apiEndpoints[this.formType].preview;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                window.open(result.data.pdfUrl, '_blank');
            } else {
                await showErrorModal({
                    title: 'Preview Failed',
                    message: result.message || 'Failed to generate preview.'
                });
            }

        } catch (error) {
            console.error('Error previewing form:', error);
            await showErrorModal({
                title: 'Preview Error',
                message: 'Failed to generate preview. Please try again.'
            });
        }
    }

    /**
     * Add preview button to form
     */
    addPreviewButton(containerId = 'previewButtonContainer') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <button type="button" onclick="formHandler.previewForm()" class="btn btn-secondary">
                    <i class="fas fa-eye"></i> Preview PDF
                </button>
            `;
        }
    }
}

// Export for use in other files
window.FormSubmissionHandler = FormSubmissionHandler;
