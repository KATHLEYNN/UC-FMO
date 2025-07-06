// Reusable Modal System
// This file contains functions to create and manage modals for the UC Campus Management System

/**
 * Initialize modal system - call this once when page loads
 */
function initializeModals() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('modal-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
}

/**
 * Show confirmation modal
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.confirmText - Confirm button text (default: "Confirm")
 * @param {string} options.cancelText - Cancel button text (default: "Cancel")
 * @param {string} options.type - Modal type: 'danger', 'warning', 'info' (default: 'info')
 * @param {Function} options.onConfirm - Callback when confirmed
 * @param {Function} options.onCancel - Callback when cancelled (optional)
 * @returns {Promise} - Resolves with true/false based on user choice
 */
function showConfirmationModal(options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to proceed?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'info',
            onConfirm = null,
            onCancel = null
        } = options;

        const modalId = 'confirmation-modal-' + Date.now();
        const iconClass = getModalIcon(type);
        const colorClass = getModalColor(type);

        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content confirmation-modal">
                    <div class="modal-header ${colorClass}">
                        <i class="${iconClass}"></i>
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn cancel-btn" data-action="cancel">
                            <i class="fas fa-times"></i>
                            ${cancelText}
                        </button>
                        <button class="modal-btn confirm-btn ${colorClass}" data-action="confirm">
                            <i class="fas fa-check"></i>
                            ${confirmText}
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
                closeModal(modalId, false, resolve, onCancel);
            }
        });

        modal.querySelectorAll('.modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                const confirmed = action === 'confirm';
                closeModal(modalId, confirmed, resolve, confirmed ? onConfirm : onCancel);
            });
        });

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
    });
}

/**
 * Show success modal
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title (default: "Success!")
 * @param {string} options.message - Modal message
 * @param {string} options.buttonText - Button text (default: "OK")
 * @param {number} options.autoClose - Auto close after milliseconds (optional)
 * @param {Function} options.onClose - Callback when closed (optional)
 * @returns {Promise} - Resolves when modal is closed
 */
function showSuccessModal(options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Success!',
            message = 'Operation completed successfully.',
            buttonText = 'OK',
            autoClose = null,
            onClose = null
        } = options;

        const modalId = 'success-modal-' + Date.now();

        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content success-modal">
                    <div class="modal-header success">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn success-btn" data-action="close">
                            <i class="fas fa-check"></i>
                            ${buttonText}
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
                closeModal(modalId, true, resolve, onClose);
            }
        });

        modal.querySelector('.modal-btn').addEventListener('click', () => {
            closeModal(modalId, true, resolve, onClose);
        });

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Auto close if specified
        if (autoClose && autoClose > 0) {
            setTimeout(() => {
                if (document.getElementById(modalId)) {
                    closeModal(modalId, true, resolve, onClose);
                }
            }, autoClose);
        }
    });
}

/**
 * Show error modal
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title (default: "Error")
 * @param {string} options.message - Modal message
 * @param {string} options.buttonText - Button text (default: "OK")
 * @param {Function} options.onClose - Callback when closed (optional)
 * @returns {Promise} - Resolves when modal is closed
 */
function showErrorModal(options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Error',
            message = 'An error occurred.',
            buttonText = 'OK',
            onClose = null
        } = options;

        const modalId = 'error-modal-' + Date.now();

        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content error-modal">
                    <div class="modal-header danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn danger-btn" data-action="close">
                            <i class="fas fa-times"></i>
                            ${buttonText}
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
                closeModal(modalId, true, resolve, onClose);
            }
        });

        modal.querySelector('.modal-btn').addEventListener('click', () => {
            closeModal(modalId, true, resolve, onClose);
        });

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
    });
}

/**
 * Close modal with animation
 * @private
 */
function closeModal(modalId, result, resolve, callback) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hide');
        setTimeout(() => {
            modal.remove();
            if (callback) callback(result);
            resolve(result);
        }, 300);
    }
}

/**
 * Get modal icon based on type
 * @private
 */
function getModalIcon(type) {
    const icons = {
        danger: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Get modal color class based on type
 * @private
 */
function getModalColor(type) {
    const colors = {
        danger: 'danger',
        warning: 'warning',
        info: 'info',
        success: 'success'
    };
    return colors[type] || colors.info;
}

/**
 * Show success modal with PDF actions (download and preview)
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title (default: "Success!")
 * @param {string} options.message - Modal message
 * @param {string} options.pdfUrl - URL to the PDF file
 * @param {number} options.pdfId - ID of the PDF record for download
 * @param {string} options.controlNumber - Control number for display
 * @param {Function} options.onClose - Callback when closed (optional)
 * @returns {Promise} - Resolves when modal is closed
 */
function showSuccessModalWithPDF(options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Form Submitted Successfully!',
            message = 'Your form has been submitted and PDF generated.',
            pdfUrl = '',
            pdfId = '',
            controlNumber = '',
            onClose = null
        } = options;

        const modalId = 'success-pdf-modal-' + Date.now();

        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content success-modal">
                    <div class="modal-header success">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        ${controlNumber ? `<p><strong>Control Number:</strong> ${controlNumber}</p>` : ''}
                        <div class="pdf-actions" style="margin-top: 20px; text-align: center;">
                            <button class="modal-btn info-btn" data-action="preview" style="margin-right: 10px;">
                                <i class="fas fa-eye"></i>
                                Preview PDF
                            </button>
                            <button class="modal-btn success-btn" data-action="download" style="margin-right: 10px;">
                                <i class="fas fa-download"></i>
                                Download PDF
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn secondary-btn" data-action="close">
                            <i class="fas fa-times"></i>
                            Close
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
                closeModal(modalId, true, resolve, onClose);
            }
        });

        modal.querySelectorAll('.modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');

                if (action === 'preview') {
                    // Open PDF in new tab for preview
                    window.open(pdfUrl, '_blank');
                } else if (action === 'download') {
                    // Trigger download
                    downloadPDF(pdfId);
                } else if (action === 'close') {
                    closeModal(modalId, true, resolve, onClose);
                }
            });
        });

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
    });
}

/**
 * Download PDF file
 * @param {string} pdfId - The PDF record ID
 */
async function downloadPDF(pdfId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            await showErrorModal({
                title: 'Authentication Required',
                message: 'Please log in to download the PDF.'
            });
            return;
        }

        // Create a temporary link to trigger download
        const downloadUrl = `/api/sarf/internal/download/${pdfId}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.style.display = 'none';

        // Add authorization header by creating a fetch request and converting to blob
        const response = await fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            await showErrorModal({
                title: 'Download Failed',
                message: errorData.message || 'Failed to download PDF.'
            });
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `Internal-Client-Form-${pdfId}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error downloading PDF:', error);
        await showErrorModal({
            title: 'Download Error',
            message: 'An error occurred while downloading the PDF.'
        });
    }
}

/**
 * Close any open modal
 */
function closeAnyModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.innerHTML = '';
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeModals);

// Global keyboard event listener for ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.show');
        if (activeModal) {
            activeModal.click(); // Trigger overlay click to close
        }
    }
});

// Export functions for use in other files
window.showConfirmationModal = showConfirmationModal;
window.showSuccessModal = showSuccessModal;
window.showSuccessModalWithPDF = showSuccessModalWithPDF;
window.showErrorModal = showErrorModal;
window.closeAnyModal = closeAnyModal;
window.downloadPDF = downloadPDF;
