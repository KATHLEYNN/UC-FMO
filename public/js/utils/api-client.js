/**
 * API Client Utility
 * Provides common API operations with authentication
 */

class ApiClient {
    constructor() {
        this.baseUrl = '';
    }

    /**
     * Get authentication token from localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Get default headers with authentication
     */
    getHeaders(includeContentType = true) {
        const headers = {};
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    }

    /**
     * GET request
     */
    async get(endpoint) {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    /**
     * POST request with JSON data
     */
    async post(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    /**
     * POST request with FormData (for file uploads)
     */
    async postFormData(endpoint, formData) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: this.getHeaders(false), // Don't include Content-Type for FormData
            body: formData
        });
        return this.handleResponse(response);
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    /**
     * Check authentication status
     */
    async checkAuth() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch('/api/auth/verify', {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            return await response.json();
        } catch (error) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw error;
        }
    }

    /**
     * Check admin authentication
     */
    async checkAdminAuth() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch('/api/auth/admin/verify', {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Admin authentication failed');
            }

            return await response.json();
        } catch (error) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw error;
        }
    }
}

// Create global instance
window.apiClient = new ApiClient();
