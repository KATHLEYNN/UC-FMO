const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const pdfService = require('../services/pdfService');
const sarfService = require('../services/sarfService');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate preview PDF without saving to database
 * POST /api/sarf/preview-pdf
 */
router.post('/preview-pdf', auth, async (req, res) => {
  try {
    const formData = req.body;

    // Validate user role
    if (!['student', 'external', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can preview SARF forms.'
      });
    }

    // Generate a temporary control number for preview
    const tempControl = `PREVIEW-${Date.now()}`;

    // Generate PDF for preview
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

/**
 * Submit SARF form with PDF generation
 * POST /api/sarf/submit
 */
router.post('/submit', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    // Validate user role
    if (!['student', 'external', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, external users, and admins can submit SARF forms.'
      });
    }

    // Submit SARF to MongoDB (existing functionality)
    const sarfResult = await sarfService.submitSARF(formData, userId);
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    // Generate PDF
    const pdfResult = await pdfService.generateSARFPDF(formData, sarfResult.data.control);
    
    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: 'SARF submitted but PDF generation failed',
        sarfData: sarfResult.data
      });
    }

    // Update PDF information in the existing SARF record
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

/**
 * Get user's SARF forms with PDF links
 * GET /api/sarf/my-forms
 */
router.get('/my-forms', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Get SARF forms from MongoDB
    const sarfResult = await sarfService.getUserSARFs(userId, { page, limit, status });
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    // Data already includes PDF information from MySQL
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

/**
 * Download PDF file
 * GET /api/sarf/download/:pdfId
 */
router.get('/download/:pdfId', auth, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    // Get PDF information from database
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

    // Check access permissions
    if (pdfRecord.user_id !== userId && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download your own PDFs.'
      });
    }

    // Extract filename from PDF URL
    const pdfFilename = path.basename(pdfRecord.pdf_url);

    // Check if PDF file exists
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

/**
 * Admin: Get all SARF forms with PDFs
 * GET /api/sarf/admin/all
 */
router.get('/admin/all', [auth, checkRole(['admin', 'staff'])], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Get all SARF forms from MongoDB
    const sarfResult = await sarfService.getAllSARFs({ page, limit, status, search });
    
    if (!sarfResult.success) {
      return res.status(400).json(sarfResult);
    }

    // Data already includes PDF information from MySQL
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

/**
 * Admin: Update SARF status
 * PUT /api/sarf/admin/:sarfId/status
 */
router.put('/admin/:sarfId/status', [auth, checkRole(['admin', 'staff'])], async (req, res) => {
  try {
    const { sarfId } = req.params;
    const { action, remarks } = req.body;
    const adminUserId = req.user.id;

    // Update SARF status in MongoDB
    const result = await sarfService.updateSARFStatus(sarfId, action, adminUserId, remarks);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Status is already updated in the sarfService.updateSARFStatus method

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

/**
 * Regenerate PDF for existing SARF
 * POST /api/sarf/:sarfId/regenerate-pdf
 */
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

module.exports = router;
