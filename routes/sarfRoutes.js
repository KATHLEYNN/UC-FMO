const express = require('express');
const router = express.Router();
const { auth, checkRole, checkAdminRole, checkUserRole } = require('../middleware/auth');
const { isAdminRole, isUserRole } = require('../utils/roleUtils');
const pdfService = require('../services/pdfService');
const sarfService = require('../services/sarfService');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

router.post('/preview-pdf', auth, async (req, res) => {
  try {
    const formData = req.body;

    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can preview SARF forms.'
      });
    }

    const tempControl = `PREVIEW-${Date.now()}`;

    const pdfResult = await pdfService.generateSARFPDF(formData, tempControl);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate preview PDF'
      });
    }

    res.json({
      success: true,
      message: 'Preview PDF generated successfully',
      pdfUrl: pdfResult.pdfUrl,
      control: tempControl
    });

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview PDF',
      error: error.message
    });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    // Validate user role
    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can submit SARF forms.'
      });
    }

    const sarfResult = await sarfService.submitSARF(formData, userId);
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    const pdfResult = await pdfService.generateSARFPDF(formData, sarfResult.data.control);
    
    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'SARF submitted but PDF generation failed',
        sarfData: sarfResult.data
      });
    }

    await pool.execute(
      `UPDATE student_activity_requests SET pdf_url = ? WHERE id = ?`,
      [
        pdfResult.pdfUrl,
        sarfResult.data.id
      ]
    );

    res.json({
      success: true,
      message: 'SARF form submitted successfully and PDF generated',
      data: {
        ...sarfResult.data,
        pdfUrl: pdfResult.pdfUrl
      },
      warnings: sarfResult.warnings || []
    });

  } catch (error) {
    console.error('Error submitting SARF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit SARF form',
      error: error.message
    });
  }
});

router.get('/my-forms', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const sarfResult = await sarfService.getUserSARFs(userId, { page, limit, status });
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    const sarfsWithPDFs = sarfResult.data.map(sarf => ({
      ...sarf,
      pdf: sarf.pdf_url ? {
        id: sarf.id,
        pdf_url: sarf.pdf_url,
        status: sarf.status,
        created_at: sarf.created_at
      } : null
    }));

    res.json({
      success: true,
      data: sarfsWithPDFs,
      pagination: sarfResult.pagination
    });

  } catch (error) {
    console.error('Error fetching user SARFs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SARF forms',
      error: error.message
    });
  }
});


router.get('/download/:pdfId', auth, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const [pdfRows] = await pool.execute(
      'SELECT * FROM student_activity_requests WHERE id = ? AND reservation_type = ?',
      [pdfId, 'campus']
    );

    if (pdfRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    const pdfRecord = pdfRows[0];

    if (pdfRecord.user_id !== userId && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download your own PDFs.'
      });
    }

    const pdfFilename = path.basename(pdfRecord.pdf_url);


    const pdfExists = await pdfService.pdfExists(pdfFilename);

    if (!pdfExists) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server. It may have been automatically deleted after 7 days.'
      });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SARF-${pdfRecord.id}.pdf"`);

    // Stream the PDF file
    const pdfPath = pdfService.getPDFPath(pdfFilename);
    const fileStream = require('fs').createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});


router.get('/admin/all', [auth, checkAdminRole()], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const sarfResult = await sarfService.getAllSARFs({ page, limit, status, search });
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    const sarfsWithPDFs = sarfResult.data.map(sarf => ({
      ...sarf,
      pdf: sarf.pdf_url ? {
        id: sarf.id,
        pdf_url: sarf.pdf_url,
        status: sarf.status,
        created_at: sarf.createdAt
      } : null
    }));

    res.json({
      success: true,
      data: sarfsWithPDFs,
      pagination: sarfResult.pagination
    });

  } catch (error) {
    console.error('Error fetching all SARFs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SARF forms',
      error: error.message
    });
  }
});

router.put('/admin/:sarfId/status', [auth, checkAdminRole()], async (req, res) => {
  try {
    const { sarfId } = req.params;
    const { action, remarks } = req.body;
    const adminUserId = req.user.id;

    const result = await sarfService.updateSARFStatus(sarfId, action, adminUserId, remarks);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Error updating SARF status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SARF status',
      error: error.message
    });
  }
});

router.post('/:sarfId/regenerate-pdf', auth, async (req, res) => {
  try {
    const { sarfId } = req.params;
    const userId = req.user.id;

    // Get SARF from MongoDB
    const sarfResult = await sarfService.getSARFById(sarfId, userId, req.user.role);
    
    if (!sarfResult.success) {
      return res.status(404).json(sarfResult);
    }

    const sarf = sarfResult.data;

    // Generate new PDF
    const pdfResult = await pdfService.generateSARFPDF(sarf, sarf.control);
    
    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to regenerate PDF'
      });
    }

    // Update PDF URL in the existing record
    await pool.execute(
      'UPDATE student_activity_requests SET pdf_url = ?, version = version + 1 WHERE id = ?',
      [pdfResult.pdfUrl, sarfId]
    );

    res.json({
      success: true,
      message: 'PDF regenerated successfully',
      data: {
        pdfUrl: pdfResult.pdfUrl,
        control: sarf.control
      }
    });

  } catch (error) {
    console.error('Error regenerating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate PDF',
      error: error.message
    });
  }
});

/**
 * Generate preview PDF for internal client form without saving to database
 * POST /api/sarf/internal/preview-pdf
 */
router.post('/internal/preview-pdf', auth, async (req, res) => {
  try {
    const formData = req.body;

    // Validate user role
    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can preview internal client forms.'
      });
    }

    // Generate a temporary control number for preview
    const tempControl = `PREVIEW-${Date.now()}`;

    // Generate PDF for preview
    const pdfResult = await pdfService.generateInternalClientPDF(formData, tempControl);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate preview PDF'
      });
    }

    res.json({
      success: true,
      message: 'Preview PDF generated successfully',
      data: {
        pdfUrl: pdfResult.pdfUrl,
        filename: pdfResult.filename
      }
    });

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview PDF',
      error: error.message
    });
  }
});

/**
 * Submit internal client form with PDF generation
 * POST /api/sarf/internal/submit
 */
router.post('/internal/submit', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    // Validate user role
    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can submit internal client forms.'
      });
    }

    // Generate PDF first (without control number)
    const pdfResult = await pdfService.generateInternalClientPDF(formData, null);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF'
      });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO student_activity_requests (
        user_id, reservation_type, pdf_url, status, version
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      'internal', // Internal client forms use 'internal' reservation type
      pdfResult.pdfUrl,
      'pending',
      1
    ];

    const [result] = await pool.execute(insertQuery, values);

    res.json({
      success: true,
      message: 'Internal client form submitted successfully and PDF generated',
      data: {
        id: result.insertId,
        control: null, // Control number will be assigned when approved
        status: 'pending',
        reservation_type: 'internal',
        pdfUrl: pdfResult.pdfUrl,
        organization_name: formData.organization_name,
        event_name: formData.event_name,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error submitting internal client form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit internal client form',
      error: error.message
    });
  }
});


router.get('/internal/download/:pdfId', auth, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const [pdfRows] = await pool.execute(
      'SELECT * FROM student_activity_requests WHERE id = ? AND reservation_type = ?',
      [pdfId, 'internal']
    );

    if (pdfRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    const pdfRecord = pdfRows[0];

    if (pdfRecord.user_id !== userId && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download your own PDFs.'
      });
    }

    const pdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', path.basename(pdfRecord.pdf_url));

    try {
      await fs.access(pdfPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    const filename = `Internal-Client-Form-${pdfRecord.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.sendFile(pdfPath);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});

router.get('/my-all-forms', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, type } = req.query;

    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    let whereClause = 'WHERE user_id = ?';
    let queryParams = [userId];

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    if (type && ['campus', 'internal', 'external'].includes(type)) {
      whereClause += ' AND reservation_type = ?';
      queryParams.push(type);
    }

    const offset = (page - 1) * limit;

    const formsQuery = `
      SELECT id, reservation_type, status, pdf_url, version,
             submitted_at, updated_at
      FROM student_activity_requests
      ${whereClause}
      ORDER BY submitted_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [forms] = await pool.execute(formsQuery, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM student_activity_requests
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;

    const formattedForms = forms.map(form => {
      let formType = '';
      let formIcon = '';
      let controlPrefix = '';

      switch (form.reservation_type) {
        case 'campus':
          formType = 'SARF (On-Campus)';
          formIcon = 'fas fa-university';
          controlPrefix = 'SARF';
          break;
        case 'internal':
          formType = 'Internal Client';
          formIcon = 'fas fa-building';
          controlPrefix = 'IC';
          break;
        case 'external':
          formType = 'External Client';
          formIcon = 'fas fa-users';
          controlPrefix = 'EC';
          break;
      }

      return {
        id: form.id,
        type: formType,
        icon: formIcon,
        reservation_type: form.reservation_type,
        status: form.status,
        pdf_url: form.pdf_url,
        version: form.version,
        submitted_at: form.submitted_at,
        updated_at: form.updated_at,
        control_prefix: controlPrefix
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: formattedForms,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms',
      error: error.message
    });
  }
});

router.get('/admin/all-forms', [auth, checkAdminRole()], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      whereClause += ' AND s.status = ?';
      queryParams.push(status);
    }

    if (type && ['campus', 'internal', 'external'].includes(type)) {
      whereClause += ' AND s.reservation_type = ?';
      queryParams.push(type);
    }

    if (search) {
      whereClause += ' AND (u.username LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const offset = (page - 1) * limit;

    const formsQuery = `
      SELECT s.id, s.reservation_type, s.status, s.pdf_url, s.version,
             s.submitted_at, s.updated_at, s.rejection_notes,
             u.id as user_id, u.username, u.email, u.role
      FROM student_activity_requests s
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY s.submitted_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [forms] = await pool.execute(formsQuery, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM student_activity_requests s
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;

    const formattedForms = forms.map(form => {
      let formType = '';
      let formIcon = '';
      let controlPrefix = '';

      switch (form.reservation_type) {
        case 'campus':
          formType = 'SARF (On-Campus)';
          formIcon = 'fas fa-university';
          controlPrefix = 'SARF';
          break;
        case 'internal':
          formType = 'Internal Client';
          formIcon = 'fas fa-building';
          controlPrefix = 'IC';
          break;
        case 'external':
          formType = 'External Client';
          formIcon = 'fas fa-users';
          controlPrefix = 'EC';
          break;
      }

      return {
        id: form.id,
        type: formType,
        icon: formIcon,
        reservation_type: form.reservation_type,
        status: form.status,
        pdf_url: form.pdf_url,
        version: form.version,
        submitted_at: form.submitted_at,
        updated_at: form.updated_at,
        rejection_notes: form.rejection_notes,
        control_prefix: controlPrefix,
        user: {
          id: form.user_id,
          username: form.username,
          email: form.email,
          role: form.role
        }
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: formattedForms,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching admin forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forms',
      error: error.message
    });
  }
});

router.put('/admin/update-status/:formId', [auth, checkAdminRole()], async (req, res) => {
  try {
    const { formId } = req.params;
    const { status, rejection_notes } = req.body;

    // Validate status
    const validationResult = validateStatusUpdate(status, rejection_notes);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    // Check if form exists
    const [formRows] = await pool.execute(
      'SELECT * FROM student_activity_requests WHERE id = ?',
      [formId]
    );

    if (formRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Form not found.'
      });
    }

    // Process status update
    const updateResult = await processFormStatusUpdate(formRows[0], status, rejection_notes);

    res.json({
      success: true,
      message: `Form ${status} successfully.`,
      data: {
        id: formId,
        status: status,
        control_no: updateResult.controlNumber,
        rejection_notes: status === 'rejected' ? rejection_notes : null
      }
    });

  } catch (error) {
    console.error('Error updating form status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update form status',
      error: error.message
    });
  }
});

/**
 * Generate preview PDF for external client form without saving to database
 * POST /api/sarf/external/preview-pdf
 */
router.post('/external/preview-pdf', auth, async (req, res) => {
  try {
    const formData = req.body;

    // Validate user role
    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can preview external client forms.'
      });
    }

    // Generate a temporary control number for preview
    const tempControl = `PREVIEW-${Date.now()}`;

    // Generate PDF for preview
    const pdfResult = await pdfService.generateExternalClientPDF(formData, tempControl);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate preview PDF'
      });
    }

    res.json({
      success: true,
      message: 'Preview PDF generated successfully',
      data: {
        pdfUrl: pdfResult.pdfUrl,
        filename: pdfResult.filename
      }
    });

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview PDF',
      error: error.message
    });
  }
});

router.post('/external/submit', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    // Validate user role
    if (!isUserRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can submit external client forms.'
      });
    }

    // Generate PDF first (without control number)
    const pdfResult = await pdfService.generateExternalClientPDF(formData, null);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF'
      });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO student_activity_requests (
        user_id, reservation_type, pdf_url, status, version
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      'external', // External client forms use 'external' reservation type
      pdfResult.pdfUrl,
      'pending',
      1
    ];

    const [result] = await pool.execute(insertQuery, values);

    res.json({
      success: true,
      message: 'External client form submitted successfully and PDF generated',
      data: {
        id: result.insertId,
        control: null, // Control number will be assigned when approved
        status: 'pending',
        reservation_type: 'external',
        pdfUrl: pdfResult.pdfUrl,
        organization_name: formData.organization_name,
        title_theme: formData.title_theme,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error submitting external client form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit external client form',
      error: error.message
    });
  }
});

/**
 * Download PDF file for external client forms
 * GET /api/sarf/external/download/:pdfId
 */
router.get('/external/download/:pdfId', auth, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    // Get PDF information from database
    const [pdfRows] = await pool.execute(
      'SELECT * FROM student_activity_requests WHERE id = ? AND reservation_type = ?',
      [pdfId, 'external']
    );

    if (pdfRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    const pdfRecord = pdfRows[0];

    // Check access permissions
    if (pdfRecord.user_id !== userId && !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download your own PDFs.'
      });
    }

    // Check if PDF file exists
    const pdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', path.basename(pdfRecord.pdf_url));

    try {
      await fs.access(pdfPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Set headers for download
    const filename = `External-Client-Form-${pdfRecord.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.sendFile(pdfPath);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});

/**
 * Validate status update request
 */
function validateStatusUpdate(status, rejection_notes) {
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return {
      isValid: false,
      message: 'Invalid status. Must be pending, accepted, or rejected.'
    };
  }

  if (status === 'rejected' && (!rejection_notes || typeof rejection_notes !== 'string' || rejection_notes.trim() === '')) {
    return {
      isValid: false,
      message: 'Rejection notes are required when rejecting a form.'
    };
  }

  return { isValid: true };
}

/**
 * Process form status update with control number generation
 */
async function processFormStatusUpdate(form, status, rejection_notes) {
  let controlNumber = null;
  let updateQuery, updateParams;

  if (status === 'accepted') {
    const formType = form.reservation_type;

    if (formType === 'campus') {
      controlNumber = await generateSARFControlNumber();
    } else if (formType === 'internal') {
      controlNumber = await generateControlNumber();
    } else if (formType === 'external') {
      controlNumber = await generateExternalControlNumber();
    }

    updateQuery = `
      UPDATE student_activity_requests
      SET status = ?, control_no = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    updateParams = [status, controlNumber, form.id];
  } else {
    updateQuery = `
      UPDATE student_activity_requests
      SET status = ?, rejection_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    updateParams = [status, status === 'rejected' ? rejection_notes : null, form.id];
  }

  await pool.execute(updateQuery, updateParams);

  return { controlNumber };
}

/**
 * Generate control number for SARF forms
 */
async function generateSARFControlNumber() {
  try {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Get the count of all SARF forms (simpler approach)
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM student_activity_requests
       WHERE reservation_type = 'campus'`,
      []
    );

    const sequence = String(countResult[0].count + 1).padStart(4, '0');
    return `SARF-${year}${month}-${sequence}`;
  } catch (error) {
    console.error('Error generating SARF control number:', error);
    // Fallback to timestamp-based sequence
    const timestamp = Date.now().toString().slice(-6);
    return `SARF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${timestamp}`;
  }
}

/**
 * Generate control number for internal client forms
 */
async function generateControlNumber() {
  try {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Get the count of all internal forms (simpler approach)
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM student_activity_requests
       WHERE reservation_type = 'internal'`,
      []
    );

    const sequence = String(countResult[0].count + 1).padStart(4, '0');
    return `IC-${year}${month}-${sequence}`;
  } catch (error) {
    console.error('Error generating internal control number:', error);
    // Fallback to timestamp-based sequence
    const timestamp = Date.now().toString().slice(-6);
    return `IC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${timestamp}`;
  }
}

/**
 * Generate control number for external client forms
 */
async function generateExternalControlNumber() {
  try {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Get the count of all external forms (simpler approach)
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM student_activity_requests
       WHERE reservation_type = 'external'`,
      []
    );

    const sequence = String(countResult[0].count + 1).padStart(4, '0');
    return `EC-${year}${month}-${sequence}`;
  } catch (error) {
    console.error('Error generating external control number:', error);
    // Fallback to timestamp-based sequence
    const timestamp = Date.now().toString().slice(-6);
    return `EC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${timestamp}`;
  }
}

module.exports = router;
