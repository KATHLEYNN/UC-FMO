/**
 * Admin Form Management Utilities
 * Handles form status updates, PDF operations, and modal interactions
 */

class AdminFormManager {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    /**
     * Update form status (approve/pending)
     */
    async updateFormStatus(formId, status) {
        try {
            const response = await fetch(`/api/sarf/admin/update-status/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (result.success) {
                await showSuccessModal({
                    title: 'Status Updated',
                    message: `Form has been ${status} successfully.`,
                    onClose: () => {
                        this.refreshFormsData();
                    }
                });
            } else {
                await showErrorModal({
                    title: 'Update Failed',
                    message: result.message || 'Failed to update form status'
                });
            }
        } catch (error) {
            console.error('Error updating form status:', error);
            await showErrorModal({
                title: 'Update Error',
                message: 'Failed to update form status. Please try again.'
            });
        }
    }

    /**
     * Show rejection modal and handle rejection process
     */
    async showRejectModal(formId) {
        return new Promise((resolve) => {
            const modalId = 'reject-modal-' + Date.now();

            const modalHTML = `
                <div class="modal-overlay" id="${modalId}">
                    <div class="modal-content confirmation-modal">
                        <div class="modal-header danger">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Reject Form</h3>
                        </div>
                        <div class="modal-body">
                            <div style="margin-bottom: 15px;">
                                Are you sure you want to reject this form? Please provide a reason:
                            </div>
                            <textarea id="rejectionNotes" placeholder="Enter rejection reason..."
                                      style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button class="modal-btn cancel-btn" data-action="cancel">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                            <button class="modal-btn confirm-btn danger" data-action="confirm">
                                <i class="fas fa-check"></i>
                                Reject Form
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('modal-container').innerHTML = modalHTML;
            const modal = document.getElementById(modalId);

            // Add event listeners
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeRejectModal(modalId, resolve);
                }
            });

            modal.querySelectorAll('.modal-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const action = e.currentTarget.getAttribute('data-action');

                    if (action === 'confirm') {
                        const rejectionNotesElement = document.getElementById('rejectionNotes');
                        const rejectionNotes = rejectionNotesElement ? rejectionNotesElement.value.trim() : '';

                        if (!rejectionNotes) {
                            await showErrorModal({
                                title: 'Rejection Notes Required',
                                message: 'Please provide a reason for rejecting this form.'
                            });
                            return;
                        }

                        this.closeRejectModal(modalId, resolve);
                        await this.processRejection(formId, rejectionNotes);
                    } else {
                        this.closeRejectModal(modalId, resolve);
                    }
                });
            });

            // Show modal with animation
            setTimeout(() => modal.classList.add('show'), 10);
        });
    }

    /**
     * Close rejection modal
     */
    closeRejectModal(modalId, resolve) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hide');
            setTimeout(() => {
                modal.remove();
                resolve();
            }, 300);
        }
    }

    /**
     * Process form rejection
     */
    async processRejection(formId, rejectionNotes) {
        try {
            const response = await fetch(`/api/sarf/admin/update-status/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    status: 'rejected',
                    rejection_notes: rejectionNotes
                })
            });

            const result = await response.json();

            if (result.success) {
                await showSuccessModal({
                    title: 'Form Rejected',
                    message: 'Form has been rejected successfully.',
                    onClose: () => {
                        this.refreshFormsData();
                    }
                });
            } else {
                await showErrorModal({
                    title: 'Rejection Failed',
                    message: result.message || 'Failed to reject form'
                });
            }
        } catch (error) {
            console.error('Error rejecting form:', error);
            await showErrorModal({
                title: 'Rejection Error',
                message: 'Failed to reject form. Please try again.'
            });
        }
    }

    /**
     * Download form PDF
     */
    async downloadFormPDF(formId, formType) {
        try {
            let downloadUrl = '';

            // Determine the correct download endpoint based on form type
            if (formType === 'campus') {
                downloadUrl = `/api/sarf/download/${formId}`;
            } else if (formType === 'internal') {
                downloadUrl = `/api/sarf/internal/download/${formId}`;
            } else if (formType === 'external') {
                downloadUrl = `/api/sarf/external/download/${formId}`;
            }

            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formType.toUpperCase()}-Form-${formId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const error = await response.json();
                await showErrorModal({
                    title: 'Download Failed',
                    message: error.message || 'Failed to download PDF'
                });
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            await showErrorModal({
                title: 'Download Error',
                message: 'Failed to download PDF. Please try again.'
            });
        }
    }

    /**
     * Preview PDF in new tab
     */
    previewPDF(pdfUrl) {
        window.open(pdfUrl, '_blank');
    }

    /**
     * Refresh forms data after operations
     */
    refreshFormsData() {
        try {
            if (window.formsManager) {
                window.formsManager.updateStats();
                window.formsManager.refresh();
            }
        } catch (error) {
            console.error('Error refreshing forms data:', error);
        }
    }
}

// Create global instance
window.adminFormManager = new AdminFormManager();

// Global functions for backward compatibility
window.updateFormStatus = (formId, status) => window.adminFormManager.updateFormStatus(formId, status);
window.showRejectModal = (formId) => window.adminFormManager.showRejectModal(formId);
window.downloadFormPDF = (formId, formType) => window.adminFormManager.downloadFormPDF(formId, formType);
window.previewPDF = (pdfUrl) => window.adminFormManager.previewPDF(pdfUrl);
