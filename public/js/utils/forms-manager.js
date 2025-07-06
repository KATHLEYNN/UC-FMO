class FormsManager {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: '/api/sarf/my-all-forms',
            itemsPerPage: 4,
            isAdmin: false,
            containerId: 'formsContainer',
            paginationId: 'pagination',
            statsEnabled: true,
            ...options
        };
        
        this.currentPage = 1;
        this.currentFilters = {};
        this.totalItems = 0;
        this.isLoading = false;
    }

    async loadForms(page = 1, filters = {}) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;
        this.currentFilters = filters;
        
        try {
            this.showLoading();
            
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            
            const params = new URLSearchParams({
                page: page,
                limit: this.options.itemsPerPage
            });
            
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== '') {
                    if (key === 'search') {
                        params.append('search', filters[key]);
                    } else {
                        params.append(key, filters[key]);
                    }
                }
            });

            const response = await fetch(`${this.options.apiEndpoint}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.displayForms(result.data);
                this.displayPagination(result.pagination);
                this.totalItems = result.pagination.total_items;
                
                if (this.options.statsEnabled) {
                    this.updateStats();
                }
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error loading forms:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    displayForms(forms) {
        const container = document.getElementById(this.options.containerId);
        
        if (forms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3>No Forms Found</h3>
                    <p>No forms match your current filter criteria.</p>
                    ${!this.options.isAdmin ? `
                        <a href="/user/reservation" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Create New Form
                        </a>
                    ` : ''}
                </div>
            `;
            return;
        }

        const formsGrid = forms.map(form => this.renderFormCard(form)).join('');
        container.innerHTML = `<div class="forms-grid">${formsGrid}</div>`;
    }

    renderFormCard(form) {
        const isAdmin = this.options.isAdmin;
        
        return `
            <div class="form-card ${form.reservation_type}" data-form-id="${form.id}">
                <div class="form-header">
                    <h3 class="form-title">
                        <i class="${form.icon}"></i>
                        ${form.type}
                    </h3>
                    <span class="form-type-badge ${form.reservation_type}">
                        ${form.control_prefix}-${form.id.toString().padStart(4, '0')}
                    </span>
                </div>
                
                <div class="form-details">
                    ${isAdmin ? `
                        <div class="form-detail">
                            <strong>Submitted By</strong>
                            <span>${form.user.username}</span>
                        </div>
                        <div class="form-detail">
                            <strong>Email</strong>
                            <span>${form.user.email}</span>
                        </div>
                        <div class="form-detail">
                            <strong>User Role</strong>
                            <span class="role-badge ${form.user.role}">${form.user.role.charAt(0).toUpperCase() + form.user.role.slice(1)}</span>
                        </div>
                    ` : ''}
                    <div class="form-detail">
                        <strong>Form Type</strong>
                        <span>${form.type}</span>
                    </div>
                    <div class="form-detail">
                        <strong>Submitted Date</strong>
                        <span>${this.formatDate(form.submitted_at)}</span>
                    </div>
                    <div class="form-detail">
                        <strong>Status</strong>
                        <span class="status-badge status-${form.status}">
                            ${this.getStatusIcon(form.status)} ${form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        </span>
                    </div>
                    <div class="form-detail">
                        <strong>Version</strong>
                        <span>v${form.version}</span>
                    </div>
                    ${form.rejection_notes ? `
                        <div class="form-detail rejection-notes">
                            <strong>Rejection Notes</strong>
                            <span class="rejection-text">${form.rejection_notes}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="form-actions">
                    ${form.pdf_url ? `
                        <button onclick="previewPDF('${form.pdf_url}')" class="btn btn-secondary">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button onclick="downloadFormPDF('${form.id}', '${form.reservation_type}')" class="btn btn-secondary">
                            <i class="fas fa-download"></i> Download
                        </button>
                    ` : ''}
                    
                    ${isAdmin ? this.renderAdminActions(form) : ''}
                </div>
            </div>
        `;
    }

    renderAdminActions(form) {
        if (form.status === 'pending') {
            return `
                <button onclick="updateFormStatus('${form.id}', 'accepted')" class="btn btn-success">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button onclick="showRejectModal('${form.id}')" class="btn btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else if (form.status === 'accepted') {
            return `
                <button onclick="updateFormStatus('${form.id}', 'pending')" class="btn btn-warning">
                    <i class="fas fa-undo"></i> Set Pending
                </button>
                <button onclick="showRejectModal('${form.id}')" class="btn btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else {
            return `
                <button onclick="updateFormStatus('${form.id}', 'pending')" class="btn btn-warning">
                    <i class="fas fa-undo"></i> Set Pending
                </button>
                <button onclick="updateFormStatus('${form.id}', 'accepted')" class="btn btn-success">
                    <i class="fas fa-check"></i> Approve
                </button>
            `;
        }
    }

    displayPagination(pagination) {
        const container = document.getElementById(this.options.paginationId);
        
        if (pagination.total_pages <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        
        let paginationHTML = '';
        
        paginationHTML += `
            <button onclick="formsManager.loadForms(${pagination.current_page - 1}, formsManager.currentFilters)" 
                    class="pagination-btn ${pagination.current_page === 1 ? 'disabled' : ''}"
                    ${pagination.current_page === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
        
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.total_pages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="formsManager.loadForms(${i}, formsManager.currentFilters)" 
                        class="pagination-btn ${i === pagination.current_page ? 'current-page' : ''}">
                    ${i}
                </button>
            `;
        }
        
        paginationHTML += `
            <button onclick="formsManager.loadForms(${pagination.current_page + 1}, formsManager.currentFilters)" 
                    class="pagination-btn ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}"
                    ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = paginationHTML;
    }

    async updateStats() {
        if (!this.options.statsEnabled) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.options.apiEndpoint}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                const forms = result.data;
                const stats = {
                    total: forms.length,
                    pending: forms.filter(f => f.status === 'pending').length,
                    accepted: forms.filter(f => f.status === 'accepted').length,
                    rejected: forms.filter(f => f.status === 'rejected').length
                };

                this.displayStats(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    displayStats(stats) {
        const elements = {
            total: document.getElementById('totalForms'),
            pending: document.getElementById('pendingForms'),
            accepted: document.getElementById('acceptedForms'),
            rejected: document.getElementById('rejectedForms')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key] || 0;
            }
        });
    }

    showLoading() {
        const container = document.getElementById(this.options.containerId);
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading forms...</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById(this.options.containerId);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error Loading Forms</h3>
                <p>${message}</p>
                <button onclick="formsManager.loadForms(1, {})" class="btn btn-primary">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        });
    }

    getStatusIcon(status) {
        const icons = {
            pending: '',
            accepted: '',
            rejected: ''
        };
        return icons[status] || '';
    }

    refresh() {
        this.loadForms(this.currentPage, this.currentFilters);
    }

    applyFilters(filters) {
        this.loadForms(1, filters);
    }

    getCurrentFilters() {
        return { ...this.currentFilters };
    }
}

window.FormsManager = FormsManager;
