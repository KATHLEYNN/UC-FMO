const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Import PDF format modules
const SARFPDFFormat = require('./pdf-formats/sarfPDFFormat');
const InternalClientPDFFormat = require('./pdf-formats/internalClientPDFFormat');
const ExternalClientPDFFormat = require('./pdf-formats/externalClientPDFFormat');

class PDFService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    this.ensureUploadsDirectory();
    this.startCleanupScheduler();

    // Initialize PDF format handlers
    this.sarfFormat = new SARFPDFFormat();
    this.internalFormat = new InternalClientPDFFormat();
    this.externalFormat = new ExternalClientPDFFormat();
  }

  async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch (error) {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log('Created uploads/pdfs directory');
    }
  }

  async generatePDF(htmlContent, filename) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-default-apps'
        ]
      });

      const page = await browser.newPage();

      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      const pdfPath = path.join(this.uploadsDir, filename);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: false, 
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        preferCSSPageSize: true
      });

      console.log(`PDF generated successfully: ${pdfPath}`);
      return pdfPath;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async generateSARFPDF(formData, controlNo) {
    try {
      const htmlContent = this.sarfFormat.generateHTML(formData);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SARF-${controlNo}-${timestamp}.pdf`;

      const pdfPath = await this.generatePDF(htmlContent, filename);

      const pdfUrl = `/uploads/pdfs/${filename}`;

      return {
        success: true,
        pdfPath,
        pdfUrl,
        filename
      };

    } catch (error) {
      console.error('Error generating SARF PDF:', error);
      throw error;
    }
  }

  async generateInternalClientPDF(formData, controlNo) {
    try {
      const htmlContent = this.internalFormat.generateHTML(formData, controlNo);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `INTERNAL-CLIENT-${controlNo}-${timestamp}.pdf`;

      const pdfPath = await this.generatePDF(htmlContent, filename);

      const pdfUrl = `/uploads/pdfs/${filename}`;

      return {
        success: true,
        pdfPath,
        pdfUrl,
        filename
      };

    } catch (error) {
      console.error('Error generating Internal Client PDF:', error);
      throw error;
    }
  }

  async generateExternalClientPDF(formData, controlNo) {
    try {
      const htmlContent = this.externalFormat.generateHTML(formData, controlNo);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `EXTERNAL-CLIENT-${controlNo}-${timestamp}.pdf`;

      const pdfPath = await this.generatePDF(htmlContent, filename);

      const pdfUrl = `/uploads/pdfs/${filename}`;

      return {
        success: true,
        pdfPath,
        pdfUrl,
        filename
      };

    } catch (error) {
      console.error('Error generating External Client PDF:', error);
      throw error;
    }
  }

  /**
   * Start cleanup scheduler to delete PDFs older than 7 days
   */
  startCleanupScheduler() {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.cleanupOldPDFs();
    }, 24 * 60 * 60 * 1000);

    // Run initial cleanup
    this.cleanupOldPDFs();
  }

  /**
   * Delete PDFs older than 7 days
   */
  async cleanupOldPDFs() {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.uploadsDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < sevenDaysAgo) {
            await fs.unlink(filePath);
            console.log(`Deleted old PDF: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error during PDF cleanup:', error);
    }
  }

  /**
   * Get PDF file path
   * @param {string} filename - PDF filename
   * @returns {string} - Full path to PDF
   */
  getPDFPath(filename) {
    return path.join(this.uploadsDir, filename);
  }

  /**
   * Check if PDF exists
   * @param {string} filename - PDF filename
   * @returns {Promise<boolean>} - Whether PDF exists
   */
  async pdfExists(filename) {
    try {
      const filePath = this.getPDFPath(filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new PDFService();
