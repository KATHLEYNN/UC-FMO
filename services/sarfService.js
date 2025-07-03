const SARFValidator = require('../utils/sarfValidator');
const { pool } = require('../config/database');

class SARFService {
  constructor() {
    this.validator = new SARFValidator();
  }

  /**
   * Submit a new SARF form
   * @param {Object} formData - The form data from frontend
   * @param {String} userId - The user ID from authentication
   * @returns {Object} - Result with success/error
   */
  async submitSARF(formData, userId) {
    try {
      // Get user information from MySQL
      const [userRows] = await pool.execute(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [userId]
      );

      if (userRows.length === 0) {
        throw new Error('User not found');
      }

      const user = userRows[0];

      // Only allow students, external users, and admins to submit
      if (!['student', 'external', 'admin'].includes(user.role)) {
        throw new Error('Access denied. Only students, external users, and admins can submit SARF forms.');
      }

      // Validate the form data
      const validationResult = this.validator.validate(formData);

      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Form validation failed',
          errors: validationResult.errors,
          warnings: validationResult.warnings
        };
      }

      // Generate control number if not provided
      if (!formData.control_no) {
        formData.control_no = await this.generateControlNumber();
      }

      // Insert SARF into simplified student_activity_requests table
      // Note: PDF URL will be updated after PDF generation
      const insertQuery = `
        INSERT INTO student_activity_requests (
          user_id, reservation_type, pdf_url, status, version
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        userId,
        'campus', // SARF forms are campus reservation type
        '', // Will be updated after PDF generation
        'pending',
        1
      ];

      const [result] = await pool.execute(insertQuery, values);

      // Return success response
      const response = {
        success: true,
        message: 'Student Activity Request Form submitted successfully',
        data: {
          id: result.insertId,
          control: formData.control_no,
          status: 'pending',
          reservation_type: 'campus',
          organization_name: formData.organization_name,
          title: formData.title,
          created_at: new Date()
        }
      };

      if (validationResult.warnings.length > 0) {
        response.warnings = validationResult.warnings;
      }

      return response;

    } catch (error) {
      console.error('Error submitting SARF:', error);
      throw error;
    }
  }

  /**
   * Get user's SARF forms
   * @param {String} userId - User ID
   * @param {Object} filters - Filters (status, page, limit)
   * @returns {Object} - User's SARF forms
   */
  async getUserSARFs(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status } = filters;

      let whereClause = 'WHERE user_id = ? AND reservation_type = ?';
      let queryParams = [userId, 'campus']; // Only get campus (SARF) forms

      if (status) {
        whereClause += ' AND status = ?';
        queryParams.push(status);
      }

      const offset = (page - 1) * limit;

      // Get SARF forms from student_activity_requests
      const sarfsQuery = `
        SELECT id, reservation_type, status, pdf_url, version,
               submitted_at, updated_at
        FROM student_activity_requests
        ${whereClause}
        ORDER BY submitted_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);
      const [sarfs] = await pool.execute(sarfsQuery, queryParams);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM student_activity_requests ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;

      return {
        success: true,
        data: sarfs.map(sarf => ({
          ...sarf,
          control: `SARF-${sarf.id}`, // Generate control number from ID
          createdAt: sarf.submitted_at,
          updatedAt: sarf.updated_at,
          // Extract basic info from PDF filename or use defaults
          organization_name: 'Student Organization',
          title: 'Campus Activity Request',
          activity_type: 'Campus',
          location: 'UC Campus'
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: parseInt(limit)
        }
      };

    } catch (error) {
      console.error('Error fetching user SARFs:', error);
      throw error;
    }
  }

  /**
   * Admin: Get all SARF forms
   * @param {Object} filters - Filters (status, search, page, limit)
   * @returns {Object} - All SARF forms
   */
  async getAllSARFs(filters = {}) {
    try {
      const { page = 1, limit = 10, status, search } = filters;

      let whereClause = 'WHERE s.reservation_type = ?';
      let queryParams = ['campus']; // Only get campus (SARF) forms

      if (status) {
        whereClause += ' AND s.status = ?';
        queryParams.push(status);
      }

      if (search) {
        whereClause += ' AND (u.username LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      const offset = (page - 1) * limit;

      // Get SARF forms with user info
      const sarfsQuery = `
        SELECT s.id, s.reservation_type, s.status, s.pdf_url, s.version,
               s.submitted_at, s.updated_at, s.rejection_notes,
               u.username, u.email, u.role
        FROM student_activity_requests s
        LEFT JOIN users u ON s.user_id = u.id
        ${whereClause}
        ORDER BY s.submitted_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);
      const [sarfs] = await pool.execute(sarfsQuery, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM student_activity_requests s
        LEFT JOIN users u ON s.user_id = u.id
        ${whereClause}
      `;
      const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;

      return {
        success: true,
        data: sarfs.map(sarf => ({
          ...sarf,
          control: `SARF-${sarf.id}`,
          createdAt: sarf.submitted_at,
          updatedAt: sarf.updated_at,
          // Default values since detailed form data is in PDF
          organization_name: 'Student Organization',
          title: 'Campus Activity Request',
          activity_type: 'Campus',
          location: 'UC Campus',
          submitted_by_info: {
            username: sarf.username,
            email: sarf.email,
            role: sarf.role
          }
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: parseInt(limit)
        }
      };

    } catch (error) {
      console.error('Error fetching all SARFs:', error);
      throw error;
    }
  }

  /**
   * Admin: Update SARF status (approve/reject)
   * @param {String} sarfId - SARF ID
   * @param {String} action - 'approve' or 'reject'
   * @param {String} adminUserId - Admin user ID
   * @param {String} remarks - Optional remarks
   * @returns {Object} - Result
   */
  async updateSARFStatus(sarfId, action, adminUserId, remarks = '') {
    try {
      // Get admin information
      const [adminRows] = await pool.execute(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [adminUserId]
      );

      if (adminRows.length === 0) {
        throw new Error('Admin user not found');
      }

      // Find the SARF
      const [sarfRows] = await pool.execute(
        'SELECT * FROM student_activity_requests WHERE id = ? AND reservation_type = ?',
        [sarfId, 'campus']
      );

      if (sarfRows.length === 0) {
        throw new Error('SARF not found');
      }

      // Update status
      const newStatus = action === 'approve' ? 'accepted' : 'rejected';

      let updateQuery, updateParams;

      if (action === 'approve') {
        updateQuery = `
          UPDATE student_activity_requests
          SET status = ?
          WHERE id = ?
        `;
        updateParams = [newStatus, sarfId];
      } else {
        updateQuery = `
          UPDATE student_activity_requests
          SET status = ?, rejection_notes = ?
          WHERE id = ?
        `;
        updateParams = [newStatus, remarks, sarfId];
      }

      await pool.execute(updateQuery, updateParams);

      return {
        success: true,
        message: `SARF ${newStatus} successfully`,
        data: {
          id: sarfId,
          control: `SARF-${sarfId}`,
          status: newStatus,
          updated_at: new Date()
        }
      };

    } catch (error) {
      console.error('Error updating SARF status:', error);
      throw error;
    }
  }

  /**
   * Generate unique control number
   * @returns {String} - Control number
   */
  async generateControlNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Find the last SARF ID for this year-month to generate sequence
    const [lastSarfRows] = await pool.execute(
      'SELECT id FROM student_activity_requests WHERE reservation_type = ? ORDER BY id DESC LIMIT 1',
      ['campus']
    );

    let sequence = 1;
    if (lastSarfRows.length > 0) {
      sequence = lastSarfRows[0].id + 1;
    }

    return `SARF-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get SARF by ID with access control
   * @param {String} sarfId - SARF ID
   * @param {String} userId - User ID
   * @param {String} userRole - User role
   * @returns {Object} - SARF data
   */
  async getSARFById(sarfId, userId, userRole) {
    try {
      const [sarfRows] = await pool.execute(
        'SELECT * FROM student_activity_requests WHERE id = ? AND reservation_type = ?',
        [sarfId, 'campus']
      );

      if (sarfRows.length === 0) {
        throw new Error('SARF not found');
      }

      const sarf = sarfRows[0];

      // Access control
      if (!['admin', 'staff'].includes(userRole) && sarf.user_id.toString() !== userId) {
        throw new Error('Access denied. You can only view your own forms.');
      }

      return {
        success: true,
        data: {
          ...sarf,
          control: `SARF-${sarf.id}`,
          createdAt: sarf.submitted_at,
          updatedAt: sarf.updated_at
        }
      };

    } catch (error) {
      console.error('Error fetching SARF:', error);
      throw error;
    }
  }
}

module.exports = new SARFService();
