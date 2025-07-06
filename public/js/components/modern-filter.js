/**
 * Modern Filter Component
 * A reusable, trendy filter system for forms management
 */

class ModernFilter {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showSearch: true,
            showStatus: true,
            showType: true,
            showDateRange: false,
            placeholder: 'Search forms...',
            onFilter: null,
            onClear: null,
            ...options
        };
        
        this.filters = {
            search: '',
            status: '',
            type: '',
            dateFrom: '',
            dateTo: ''
        };
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const filterHTML = `
            <div class="modern-filter-container">
                <div class="filter-header">
                    <div class="filter-title">
                        <i class="fas fa-filter"></i>
                        <span>Filters</span>
                    </div>
                    <button class="filter-toggle" id="filterToggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                
                <div class="filter-content" id="filterContent">
                    <div class="filter-row">
                        ${this.options.showSearch ? `
                            <div class="filter-group search-group">
                                <div class="search-input-wrapper">
                                    
                                    <input 
                                        type="text" 
                                        id="searchInput" 
                                        class="search-input" 
                                        placeholder="${this.options.placeholder}"
                                        autocomplete="off"
                                    >
                                    <button class="clear-search" id="clearSearch" style="display: none;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="filter-row">
                        ${this.options.showStatus ? `
                            <div class="filter-group">
                                <label class="filter-label">
                                    <i class="fas fa-flag"></i>
                                    Status
                                </label>
                                <div class="select-wrapper">
                                    <select id="statusFilter" class="modern-select">
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <i class="fas fa-chevron-down select-arrow"></i>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${this.options.showType ? `
                            <div class="filter-group">
                                <label class="filter-label">
                                    <i class="fas fa-layer-group"></i>
                                    Form Type
                                </label>
                                <div class="select-wrapper">
                                    <select id="typeFilter" class="modern-select">
                                        <option value="">All Types</option>
                                        <option value="campus">🏫 SARF (On-Campus)</option>
                                        <option value="internal">🏢 Internal Client</option>
                                        <option value="external">👥 External Client</option>
                                    </select>
                                    <i class="fas fa-chevron-down select-arrow"></i>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${this.options.showDateRange ? `
                            <div class="filter-group">
                                <label class="filter-label">
                                    <i class="fas fa-calendar"></i>
                                    Date Range
                                </label>
                                <div class="date-range-wrapper">
                                    <input type="date" id="dateFrom" class="date-input" placeholder="From">
                                    <span class="date-separator">to</span>
                                    <input type="date" id="dateTo" class="date-input" placeholder="To">
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="filter-actions">
                        <button class="filter-btn clear-btn" id="clearFilter">
                            <i class="fas fa-eraser"></i>
                            Clear All
                        </button>
                        <div class="filter-results" id="filterResults">
                            <span class="results-text">Showing all results</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = filterHTML;
    }

    attachEventListeners() {
        // Toggle filter visibility
        const toggleBtn = document.getElementById('filterToggle');
        const filterContent = document.getElementById('filterContent');

        toggleBtn?.addEventListener('click', () => {
        filterContent.classList.toggle('collapsed');
    
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
        });

        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                clearSearch.style.display = value ? 'flex' : 'none';
                
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = value;
                    this.applyFilters();
                }, 300);
            });
            
            clearSearch?.addEventListener('click', () => {
                searchInput.value = '';
                clearSearch.style.display = 'none';
                this.filters.search = '';
                this.applyFilters();
            });
        }

        // Filter selects
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');

        statusFilter?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        dateFrom?.addEventListener('change', (e) => {
            this.filters.dateFrom = e.target.value;
            this.applyFilters();
        });

        dateTo?.addEventListener('change', (e) => {
            this.filters.dateTo = e.target.value;
            this.applyFilters();
        });

        // Action buttons
        document.getElementById('applyFilter')?.addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilter')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }

    applyFilters() {
        // Update results text
        this.updateResultsText();
        
        // Call the callback function if provided
        if (this.options.onFilter && typeof this.options.onFilter === 'function') {
            this.options.onFilter(this.filters);
        }
    }

    clearFilters() {
        // Reset all filter values
        this.filters = {
            search: '',
            status: '',
            type: '',
            dateFrom: '',
            dateTo: ''
        };

        // Reset UI elements
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const clearSearch = document.getElementById('clearSearch');

        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        if (clearSearch) clearSearch.style.display = 'none';

        this.updateResultsText();

        // Call the callback function if provided
        if (this.options.onClear && typeof this.options.onClear === 'function') {
            this.options.onClear();
        }

        // Also trigger the filter callback with empty filters
        if (this.options.onFilter && typeof this.options.onFilter === 'function') {
            this.options.onFilter(this.filters);
        }
    }

    updateResultsText() {
        const resultsElement = document.getElementById('filterResults');
        if (!resultsElement) return;

        const activeFilters = Object.values(this.filters).filter(value => value !== '').length;
        
        if (activeFilters === 0) {
            resultsElement.innerHTML = '<span class="results-text">Showing all results</span>';
        } else {
            resultsElement.innerHTML = `<span class="results-text active">${activeFilters} filter${activeFilters > 1 ? 's' : ''} active</span>`;
        }
    }

    getFilters() {
        return { ...this.filters };
    }

    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        
        // Update UI elements
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');

        if (searchInput && newFilters.search !== undefined) searchInput.value = newFilters.search;
        if (statusFilter && newFilters.status !== undefined) statusFilter.value = newFilters.status;
        if (typeFilter && newFilters.type !== undefined) typeFilter.value = newFilters.type;
        if (dateFrom && newFilters.dateFrom !== undefined) dateFrom.value = newFilters.dateFrom;
        if (dateTo && newFilters.dateTo !== undefined) dateTo.value = newFilters.dateTo;

        this.updateResultsText();
    }
}

// Export for use in other files
window.ModernFilter = ModernFilter;
