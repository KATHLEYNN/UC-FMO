class SARFValidator {
  constructor() {
    this.requiredFields = [
      'organization_name',
      'title',
      'nature',
      'location',
      'incharge_name',
      'incharge_email'
    ];
  }

  /**
   * Validate SARF form data
   * @param {Object} formData - Form data to validate
   * @returns {Object} - Validation result
   */
  validate(formData) {
    const errors = [];
    const warnings = [];

    // Check required fields
    this.requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push(`${this.formatFieldName(field)} is required`);
      }
    });

    // Validate email format
    if (formData.incharge_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.incharge_email)) {
        errors.push('Please enter a valid email address for the person in charge');
      }
    }

    // Validate activity type
    if (!formData.activity_type) {
      errors.push('Please select an activity type');
    }

    // Validate contact number format (if provided)
    if (formData.incharge_contact) {
      const phoneRegex = /^(\+63|0)[0-9]{10}$/;
      if (!phoneRegex.test(formData.incharge_contact.replace(/\s+/g, ''))) {
        warnings.push('Contact number should be in Philippine format (e.g., 09123456789)');
      }
    }

    // Validate estimated participants (if provided)
    if (formData.est_participants) {
      const participants = parseInt(formData.est_participants);
      if (isNaN(participants) || participants <= 0) {
        errors.push('Estimated number of participants must be a positive number');
      } else if (participants > 10000) {
        warnings.push('Large number of participants may require additional approvals');
      }
    }

    // Validate dates (if provided)
    if (formData.received_date) {
      const receivedDate = new Date(formData.received_date);
      const today = new Date();
      if (receivedDate > today) {
        warnings.push('Received date is in the future');
      }
    }

    // Validate time format (if provided)
    if (formData.start_time && formData.end_time) {
      const startTime = this.parseTime(formData.start_time);
      const endTime = this.parseTime(formData.end_time);

      if (startTime && endTime && startTime >= endTime) {
        // Allow for multi-day events by adding a warning instead of error
        warnings.push('End time appears to be before start time. If this is a multi-day event, please clarify in the remarks section.');
      }
    }

    // Check for potentially missing information
    if (!formData.budget_source && !formData.estimated_budget) {
      warnings.push('Budget information is recommended for better processing');
    }

    if (!formData.remarks || formData.remarks.trim().length < 10) {
      warnings.push('Adding detailed remarks/conditions helps with approval process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Format field name for display
   * @param {String} fieldName - Field name to format
   * @returns {String} - Formatted field name
   */
  formatFieldName(fieldName) {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Parse time string to minutes for comparison
   * @param {String} timeStr - Time string (HH:MM)
   * @returns {Number|null} - Minutes since midnight or null if invalid
   */
  parseTime(timeStr) {
    if (!timeStr) return null;
    
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return null;
    
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    
    return hours * 60 + minutes;
  }

  /**
   * Sanitize form data
   * @param {Object} formData - Form data to sanitize
   * @returns {Object} - Sanitized form data
   */
  sanitize(formData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Trim whitespace and remove excessive spaces
        sanitized[key] = value.trim().replace(/\s+/g, ' ');
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

module.exports = SARFValidator;
