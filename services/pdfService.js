const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    this.ensureUploadsDirectory();
    this.startCleanupScheduler();
  }

  /**
   * Ensure uploads directory exists
   */
  async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log('Created uploads/pdfs directory');
    }
  }

  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - The HTML content to convert
   * @param {string} filename - The filename for the PDF
   * @returns {Promise<string>} - Path to the generated PDF
   */
  async generatePDF(htmlContent, filename) {
    let browser;
    try {
      // Launch browser with optimized settings
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

      // Set content with faster loading
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Generate PDF with optimized settings
      const pdfPath = path.join(this.uploadsDir, filename);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
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

  /**
   * Generate PDF from SARF form data
   * @param {Object} formData - The form data
   * @param {string} controlNo - Control number for filename
   * @returns {Promise<Object>} - Result with PDF path and URL
   */
  async generateSARFPDF(formData, controlNo) {
    try {
      // Create HTML content from form data
      const htmlContent = this.createSARFHTML(formData);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SARF-${controlNo}-${timestamp}.pdf`;
      
      // Generate PDF
      const pdfPath = await this.generatePDF(htmlContent, filename);
      
      // Create URL for accessing the PDF
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

  /**
   * Generate PDF from Internal Client form data
   * @param {Object} formData - The form data
   * @param {string} controlNo - Control number for filename
   * @returns {Promise<Object>} - Result with PDF path and URL
   */
  async generateInternalClientPDF(formData, controlNo) {
    try {
      // Create HTML content from form data
      const htmlContent = this.createInternalClientHTML(formData, controlNo);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `INTERNAL-CLIENT-${controlNo}-${timestamp}.pdf`;

      // Generate PDF
      const pdfPath = await this.generatePDF(htmlContent, filename);

      // Create URL for accessing the PDF
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

  /**
   * Generate PDF from External Client form data
   * @param {Object} formData - The form data
   * @param {string} controlNo - Control number for filename
   * @returns {Promise<Object>} - Result with PDF path and URL
   */
  async generateExternalClientPDF(formData, controlNo) {
    try {
      // Create HTML content from form data
      const htmlContent = this.createExternalClientHTML(formData, controlNo);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `EXTERNAL-CLIENT-${controlNo}-${timestamp}.pdf`;

      // Generate PDF
      const pdfPath = await this.generatePDF(htmlContent, filename);

      // Create URL for accessing the PDF
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
   * Safely get field value with fallback
   * @param {any} value - The field value
   * @param {string} defaultValue - Default value if empty
   * @returns {string} - Safe field value
   */
  safeFieldValue(value, defaultValue = '') {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return String(value);
  }

  /**
   * Format numeric value for display
   * @param {any} value - The numeric value
   * @returns {string} - Formatted number
   */
  formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toString();
  }

  /**
   * Create checkbox HTML with proper checked state
   * @param {boolean} isChecked - Whether checkbox should be checked
   * @returns {string} - Checkbox HTML
   */
  createCheckbox(isChecked) {
    return `<span class="checkbox ${isChecked ? 'checkbox-checked' : ''}"></span>`;
  }

  /**
   * Create HTML content for SARF form
   * @param {Object} formData - The form data
   * @returns {string} - HTML content
   */
  createSARFHTML(formData) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Combined On-Campus Registration Form - ${formData.control || 'N/A'}</title>
      <style>
        @page {
          size: A4;
          margin: 0.75in;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          margin: 0;
          padding: 0;
          line-height: 1.3;
          color: black;
        }
        .form-container {
          width: 100%;
          max-width: 100%;
        }
        .header {
          display: table;
          width: 100%;
          margin-bottom: 15px;
          font-size: 10px;
        }
        .header-left {
          display: table-cell;
          width: 25%;
          vertical-align: top;
        }
        .header-center {
          display: table-cell;
          width: 50%;
          text-align: center;
          vertical-align: top;
        }
        .header-right {
          display: table-cell;
          width: 25%;
          text-align: right;
          vertical-align: top;
        }
        .form-title {
          background-color: #f5f5f5;
          text-align: center;
          font-weight: bold;
          padding: 8px;
          margin-bottom: 15px;
          border: 2px solid black;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        td, th {
          border: 1px solid black;
          padding: 6px;
          vertical-align: top;
          font-size: 10px;
        }
        .no-border {
          border: none !important;
        }
        .center {
          text-align: center;
        }
        .bold {
          font-weight: bold;
        }
        .small-text {
          font-size: 9px;
        }
        .checkbox {
          width: 14px;
          height: 14px;
          border: 2px solid black;
          display: inline-block;
          text-align: center;
          margin-right: 8px;
          font-size: 10px;
          font-weight: bold;
          line-height: 10px;
          vertical-align: middle;
        }
        .checkbox-checked::before {
          content: "✓";
        }
        .field-input {
          border-bottom: 1px solid black;
          min-height: 18px;
          padding: 3px;
          display: block;
          width: calc(100% - 6px);
          font-size: 10px;
        }
        .signature-box {
          height: 50px;
          border: 1px solid black;
          margin: 5px 0;
        }
        .page-break {
          page-break-before: always;
        }
        .liability-text {
          font-size: 9px;
          text-align: justify;
          padding: 8px;
          border: 1px solid black;
          margin: 8px 0;
          line-height: 1.4;
        }
        .two-col {
          width: 50%;
        }
        .wide-col {
          width: 65%;
        }
        .narrow-col {
          width: 35%;
        }
        .page-number {
          text-align: center;
          font-size: 10px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <!-- Page Header -->
        <div class="header">
          <div class="header-left">${currentDate}, ${currentTime}</div>
          <div class="header-center bold">Combined On-Campus Registration Form</div>
          <div class="header-right">
            <div class="bold">VICE PRESIDENT FOR ACADEMICS AND RESEARCH</div>
            <div style="margin-top: 5px;">College: _______________</div>
          </div>
        </div>

        <!-- Main Title Box -->
        <div class="form-title">
          STUDENT ACTIVITY REQUEST FORM FOR ON-CAMPUS
        </div>

        <!-- Main Information Table -->
        <table>
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-size: 9px; margin-bottom: 15px;">
                This SARF is to be used by colleges, offices, recognized student organizations, student councils and faculty members for requesting approval of student activities in the campus. Submit SARF in Triplicate, two (2) weeks prior to start date of activity.
              </div>
            </td>
            <td style="width: 25%; vertical-align: top; text-align: center;">
              <div class="bold" style="margin-bottom: 8px;">Type of Activity</div>
              <div style="text-align: left;">
                ${this.createCheckbox(formData.activity_type === 'Academic')} Academic<br>
                ${this.createCheckbox(formData.activity_type === 'Non-Academic')} Non-Academic<br>
                ${this.createCheckbox(formData.activity_type === 'College/Institutional')} College/Institutional
              </div>
            </td>
            <td style="width: 25%; vertical-align: top;">
              <div class="bold">SARF/Control No.:</div>
              <div style="border: 1px solid black; padding: 5px; margin: 3px 0; text-align: center;">
                ${formData.control || '231317'}
              </div>
              <div class="bold">Received:</div>
              <div style="border: 1px solid black; padding: 5px; margin: 3px 0; text-align: center;">
                ${formData.received_date || '2024-07-03'}
              </div>
            </td>
          </tr>
        </table>

        <!-- Form Fields Section -->
        <table>
          <tr>
            <td style="width: 60%;">
              <div class="bold">Name of Organization/Office/College:</div>
              <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
                ${formData.organization_name || 'SD INC'}
              </div>
            </td>
            <td style="width: 40%;">
              <div class="bold">Remarks/Conditions:</div>
              <div style="border: 1px solid black; padding: 3px; height: 40px;">
                ${formData.remarks || ''}
              </div>
            </td>
          </tr>
        </table>

        <table>
          <tr>
            <td>
              <div class="bold">Title of Activity/Program:</div>
              <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
                ${formData.title || 'Intern'}
              </div>
            </td>
          </tr>
        </table>

        <table>
          <tr>
            <td>
              <div class="bold">Nature of Activity:</div>
              <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
                ${formData.nature || ''}
              </div>
            </td>
          </tr>
        </table>
        <table>
          <tr>
            <td style="width: 50%;">
              <div class="bold">Activity Date/Time:</div>
              <div>Start: <span style="border-bottom: 1px solid black; display: inline-block; width: 150px; padding: 2px;">${formData.start_time || '22:28'}</span></div>
              <div>End: <span style="border-bottom: 1px solid black; display: inline-block; width: 150px; padding: 2px;">${formData.end_time || '18:28'}</span></div>
            </td>
            <td style="width: 50%;">
              <div class="bold">Checklist (for Review Use Only)</div>
              <div style="font-size: 9px;">
                ${this.createCheckbox(formData.checklist_invitation)} Copy of Letter of Invitation/MOA (if with outside partner)<br>
                ${this.createCheckbox(formData.checklist_resume)} Speaker/Facilitator Resume<br>
                ${this.createCheckbox(formData.checklist_committee)} Organizing Committee<br>
                ${this.createCheckbox(formData.checklist_budget)} Budget Request Form<br>
                ${this.createCheckbox(formData.checklist_risk)} Copy of USC/CSC/Alternative Resolutions<br>
                ${this.createCheckbox(formData.checklist_program)} Copy of Program/Schedule of Activities<br>
                ${this.createCheckbox(formData.checklist_promotional)} Copy of Promotional Material/Poster<br>
                ${this.createCheckbox(formData.checklist_excuse)} Excuse Letter of Students<br>
                ${this.createCheckbox(formData.checklist_participants)} List of Participants<br>
                ${this.createCheckbox(formData.checklist_venue)} Venue Floor Plan/Physical Set-up<br>
                ${this.createCheckbox(formData.checklist_curfew)} Curfew Form (if applicable)
              </div>
            </td>
          </tr>
        </table>

        <table>
          <tr>
            <td>
              <div class="bold">Venue/Location:</div>
              <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
                ${formData.location || 'Tagum, Davao del Norte, Cordillera, PHL'}
              </div>
            </td>
          </tr>
        </table>
        <!-- Participants and Budget Section -->
        <table>
          <tr>
            <td>
              <div class="bold">Participants:</div>
              <div class="small-text">
                <span class="checkbox">☐</span> Members/Office Staff Only<br>
                <span class="checkbox">☐</span> With other UC Students/Employees<br>
                <span class="checkbox">☐</span> With Outsiders
              </div>
              <div class="bold" style="margin-top: 10px;">Estimated Total No. of Participants:</div>
              <div class="field-input">${formData.est_participants || ''}</div>
            </td>
            <td>
              <div class="bold">SIGNATURES: Printed Name and Signature, Date</div>
              <div class="bold small-text">Submitted By:</div>
              <div class="signature-box"></div>
              <div class="center small-text">President/Organizer</div>

              <div class="bold small-text" style="margin-top: 10px;">Noted By:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Adviser/Coordinator</div>
            </td>
          </tr>
        </table>

        <!-- Budget Section -->
        <table>
          <tr>
            <td class="two-col">
              <div class="bold">Source of Budget:</div>
              <div class="field-input">${formData.budget_source || ''}</div>
            </td>
            <td class="two-col">
              <div class="bold">Estimated Total Budget:</div>
              <div class="field-input">${formData.estimated_budget || ''}</div>
            </td>
          </tr>
        </table>

        <!-- In-Charge Section -->
        <table>
          <tr>
            <td colspan="2" class="center bold">In-Charge of Activity</td>
          </tr>
          <tr>
            <td class="bold">Name:</td>
            <td class="field-input">${formData.incharge_name || ''}</td>
          </tr>
          <tr>
            <td class="bold">Designation:</td>
            <td class="field-input">${formData.incharge_designation || ''}</td>
          </tr>
          <tr>
            <td class="bold">Contact No.:</td>
            <td class="field-input">${formData.incharge_contact || ''}</td>
          </tr>
          <tr>
            <td class="bold">Email Address:</td>
            <td class="field-input">${formData.incharge_email || ''}</td>
          </tr>
        </table>

        <!-- Liability Waiver -->
        <div class="liability-text">
          <div class="bold center">Liability Waiver</div>
          <div class="bold">(To be accomplished by the Adviser/Coordinator)</div>
          <p>I certify that the undersigned will, with the student and participants for the duration of the above-mentioned activity. Further, I understand that the University of the Cordilleras, its officers, employees, agents, and the organizing body, I am fully liable to any untoward events that may arise during the conduct of the above activity. My signature below indicates that I have read the policy and that I understand and agree to abide by this policy.</p>

          <table class="no-border" style="margin-top: 10px;">
            <tr>
              <td class="no-border" style="width: 70%;"></td>
              <td class="no-border center">
                <div style="border-bottom: 1px solid black; margin-bottom: 5px; height: 20px;"></div>
                <div class="small-text">Adviser/Coordinator &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Approval Section -->
        <table>
          <tr>
            <td class="two-col">
              <div class="bold">Recommending Approval:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Academic Dean/Prog. Chair</div>
            </td>
            <td class="two-col">
              <div class="bold">Approved by:</div>
              <div class="signature-box"></div>
              <div class="center small-text">VP for Academics and Research</div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="bold">Venue Reserved:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Campus Facilities, Planning & Dev'l Officer</div>
            </td>
          </tr>
        </table>

        <div class="center small-text" style="margin-top: 10px;">Page 1 of 3</div>

        <!-- Page Break for Page 2 -->
        <div class="page-break"></div>

        <!-- Page 2 Header -->
        <div class="header">
          <div>${currentDate}, ${currentTime}</div>
          <div class="center bold">Combined On-Campus Registration Form</div>
          <div class="header-right"></div>
        </div>

        <!-- Insurance Table -->
        <table>
          <tr>
            <td class="center bold" style="width: 20%;">Description of Persons to be Covered</td>
            <td class="center bold" style="width: 15%;">Basic Life</td>
            <td class="center bold" style="width: 20%;">Accidental Death & Dismemberment</td>
            <td class="center bold" style="width: 15%;">Double Indemnity for Public Conveyance</td>
            <td class="center bold" style="width: 15%;">Accidental Medical Expense</td>
            <td class="center bold" style="width: 15%;">Daily Accident Hospital Benefit</td>
            <td class="center bold" style="width: 15%;">Unprovoked Murder & Assault</td>
          </tr>
          <tr>
            <td class="center">All Eligible Students</td>
            <td class="center">15,000</td>
            <td class="center">150,000</td>
            <td class="center">300,000</td>
            <td class="center">50,000</td>
            <td class="center">500</td>
            <td class="center">150,000</td>
          </tr>
        </table>

        <div class="center small-text" style="margin: 10px 0;">Page 1 of 2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Next Page →</div>

        <!-- Support Sections -->
        <table>
          <tr>
            <td class="two-col">
              <div class="center bold">For BMO Support (if applicable)</div>
              <div class="center bold">Venue:</div>

              <div class="bold">Technical Requirements:</div>
              <div class="small-text">
                <span class="checkbox">☐</span> ___ pcs of WL microphones<br>
                <span class="checkbox">☐</span> ___ pcs of wired microphones<br>
                <span class="checkbox">☐</span> ___ pcs of microphone stands<br>
                <span class="checkbox">☐</span> Laptop<br>
                <span class="checkbox">☐</span> Projector<br>
                <span class="checkbox">☐</span> PA System<br>
                <span class="checkbox">☐</span> VA mixer<br>
                <span class="checkbox">☐</span> ___ pcs lights<br>
                <span class="checkbox">☐</span> Moving intelligent lights<br>
                <span class="checkbox">☐</span> Follow Spot
              </div>

              <div class="bold">Other Requirements:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Noted and Proved:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Head, BMO</div>
            </td>
            <td class="two-col">
              <div class="center bold">For LMO Support (if applicable)</div>

              <div class="bold">Property Requirements:</div>
              <div class="small-text">
                <span class="checkbox">☐</span> Podium<br>
                <span class="checkbox">☐</span> Philippine Flag<br>
                <span class="checkbox">☐</span> UC Flag<br>
                <span class="checkbox">☐</span> Flagpoles<br>
                <span class="checkbox">☐</span> ___ pcs of long tables<br>
                <span class="checkbox">☐</span> ___ pcs of teacher tables<br>
                <span class="checkbox">☐</span> ___ pcs of platforms<br>
                <span class="checkbox">☐</span> ___ pcs of chairs<br>
                <span class="checkbox">☐</span> ___ pcs of trashcans<br>
                <span class="checkbox">☐</span> Others _______________
              </div>

              <div class="bold">Other Requirements:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Remarks:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Noted and Proved:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Head, LMO</div>
            </td>
          </tr>
        </table>

        <!-- ITSS and Administrative Support -->
        <table>
          <tr>
            <td class="two-col">
              <div class="center bold">For ITSS Support (if applicable)</div>

              <div class="bold">Support Requirements:</div>
              <div class="small-text">
                <span class="checkbox">☐</span> Internet Connection<br>
                <span class="checkbox">☐</span> Laptop<br>
                <span class="checkbox">☐</span> Internet network support<br>
                <span class="checkbox">☐</span> WiFi/FB posting
              </div>

              <div class="bold">Other Requirements:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Remarks:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Additional multimedia equipment:</div>
              <div style="height: 20px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Others:</div>
              <div style="height: 20px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Noted and Approved:</div>
              <div class="signature-box"></div>
              <div class="center small-text">Director</div>
            </td>
            <td class="two-col">
              <div class="center bold">For ADMINISTRATIVE Support (if applicable)</div>

              <div class="bold">Property Requirements:</div>
              <div class="small-text">
                <span class="checkbox">☐</span> Medical/first-aid<br>
                <span class="checkbox">☐</span> Security/safety assistance<br>
                <span class="checkbox">☐</span> Parking for ___ vehicles<br>
                <span class="checkbox">☐</span> Other commercial
              </div>

              <div class="bold">Other Requirements:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Remarks:</div>
              <div style="height: 30px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Transportation:</div>
              <div style="height: 20px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Green board posting:</div>
              <div class="small-text">(write text below, all subject to approval and editing)</div>
              <div style="height: 20px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Noted and Approved:</div>
              <div class="signature-box"></div>
              <div class="center small-text">VP for Admin and Acad Services</div>
            </td>
          </tr>
        </table>

        <div class="center small-text" style="margin: 10px 0;">Page 2 of 3</div>

        <!-- Page Break for Page 3 -->
        <div class="page-break"></div>

        <!-- Page 3 Header -->
        <div class="header">
          <div>${currentDate}, ${currentTime}</div>
          <div class="center bold">Combined On-Campus Registration Form</div>
          <div class="header-right"></div>
        </div>

        <!-- FMO Use Section -->
        <table>
          <tr>
            <td colspan="2" class="center bold">For FMO Use:</td>
          </tr>
        </table>

        <!-- FMO Charges Table -->
        <table>
          <tr>
            <td class="two-col">
              <div class="bold">Applicable Charges: (if any)</div>
              <div class="small-text">
                <span class="checkbox">☐</span> Janitorial _____ PhP<br>
                <span class="checkbox">☐</span> _____ PhP<br>
                <span class="checkbox">☐</span> Houselights _____ PhP<br>
                <span class="checkbox">☐</span> _____ PhP<br>
                <span class="checkbox">☐</span> Technical _____ PhP<br>
                <span class="checkbox">☐</span> _____ PhP<br>
                <span class="checkbox">☐</span> Water _____ PhP<br>
                <span class="checkbox">☐</span> _____ PhP<br>
                <span class="checkbox">☐</span> Staff OT _____ PhP<br>
                <span class="checkbox">☐</span> _____ PhP<br>
                <span class="checkbox">☐</span> Others _____ PhP
              </div>

              <div class="bold" style="margin-top: 10px;">Total: _____ PhP</div>
            </td>
            <td class="two-col">
              <div class="bold">Other Requirements:</div>
              <div style="height: 100px; border: 1px solid black; margin: 5px 0;"></div>

              <div class="bold">Remarks:</div>
              <div style="height: 100px; border: 1px solid black; margin: 5px 0;"></div>
            </td>
          </tr>
        </table>

        <!-- Service Agreement -->
        <table>
          <tr>
            <td class="center bold">Service Agreement</td>
          </tr>
          <tr>
            <td class="small-text">
              I have read and understood with the Director of FMO the policies and guidelines on the use of UC facilities and accept personal responsibility to abide by them. I understand that the use of UC facilities is a privilege and not a right for the concerned officials. I also understand that there may be additional charges as enumerated here.
              <br><br>
              By signing here, I acknowledge responsibility for the care and condition of facilities and equipment used during the activity.
              <br><br>
              <div style="text-align: right; margin-top: 30px;">
                _________________________________<br>
                In-charge of Activity<br>
                (Printed Name and Signature)<br>
                <br>
                Date: _______________
              </div>
            </td>
          </tr>
        </table>

        <!-- Final Approval -->
        <table>
          <tr>
            <td colspan="2" class="center bold">Approved and Reserved:</td>
          </tr>
          <tr>
            <td class="center">
              <div class="signature-box"></div>
              <div class="small-text">Campus Facilities, Planning & Dev'l Officer</div>
            </td>
            <td class="center">
              <div class="small-text">Date: _______________</div>
            </td>
          </tr>
        </table>

        <div class="center small-text" style="margin-top: 20px;">Page 3 of 3</div>

      </div>
    </body>
    </html>
    `;
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

  /**
   * Create HTML content for Internal Client form
   * @param {Object} formData - The form data
   * @param {string} controlNo - Control number
   * @returns {string} - HTML content
   */
  createInternalClientHTML(formData, controlNo) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Helper function to get checkbox state
    const getCheckboxState = (fieldName, value) => {
      if (Array.isArray(formData[fieldName])) {
        return formData[fieldName].includes(value) ? '☑' : '☐';
      }
      return formData[fieldName] === value ? '☑' : '☐';
    };

    // Helper function to get field value
    const getValue = (fieldName, defaultValue = '') => {
      return this.safeFieldValue(formData[fieldName], defaultValue);
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facilities and Services Request Form for Internal Clients - ${controlNo}</title>
      <style>
        @page {
          size: 8.5in 13in;
          margin: 1cm;
        }
        body {
          font-family: Century Gothic, sans-serif;
          font-size: 11px;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          color: black;
        }
        .form-container {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        td, th {
          border: 1px solid black;
          padding: 5px;
          vertical-align: top;
        }
        .no-border {
          border: none !important;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .outer-border {
          border: 1px solid black;
          border-collapse: separate;
          border-spacing: 0;
        }
        .outer-border td, .outer-border th {
          border: none;
          padding: 8px;
        }
        .no-border {
          border-collapse: collapse;
          border: none;
        }
        .no-border td, .no-border th {
          border: none;
          padding: 5px;
        }
        .checkbox {
          font-size: 14px;
          font-weight: bold;
        }
        .section-title {
          font-weight: bold;
          background-color: #747272;
        }
        .footer-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 11px;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <!-- Header Section -->
        <div class="header-row">
          <div style="width: 60px; height: 40px; border: 1px solid black; text-align: center; line-height: 40px;">
            <img
          </div>
          <div style="text-align: right;">
            <strong>CAMPUS MANAGEMENT OFFICE</strong><br />
            <strong>Facilities Management Operations Unit</strong>
          </div>
        </div>

        <!-- Title Section -->
        <div style="text-align: center; margin-bottom: 15px;">
          <strong style="font-size: 14px;">FACILITIES AND SERVICES REQUEST FORM FOR INTERNAL CLIENTS</strong>
        </div>

        <strong>NOTE: Submit two (2) copies of this form at least two (2) weeks prior to your event.</strong>

        <!-- Main Form Table -->
        <table>
          <tr>
            <td colspan="2" style="width: 50%;">
              <strong>College/ Office/ Department/ Organization:</strong><br />
              ${getValue('organization_name')}
            </td>
            <td colspan="1" style="width: 25%;">
              <strong>Contact Number/ *Email:</strong><br />
              ${getValue('contact')}
            </td>
            <td colspan="1" style="width: 25%;">
              <strong>Budget Source:</strong><br />
              ${getValue('budget_source')}
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Function/Event:</strong><br />
              ${getValue('event_name')}
            </td>
            <td colspan="2">
              <strong>Date/Day of Event:</strong><br />
              ${getValue('event_date')}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="width: 35%;">
              <strong>Requested Venue/Room:</strong><br />
              ${getValue('requested_room')}
            </td>
            <td colspan="1" style="width: 25%;">
              <strong>Number of Attendees:</strong><br />
              ${getValue('attendees')}
            </td>
            <td colspan="1" style="width: 20%;">
              <strong>Time Start:</strong><br />
              ${getValue('time_start')}
            </td>
            <td colspan="1" style="width: 20%;">
              <strong>Time End:</strong><br />
              ${getValue('time_end')}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="width: 35%;">
              <strong>Admission Fee:</strong><br />
              <div style="text-align: center;">
                <span class="checkbox">${getCheckboxState('admission_fee', 'free')}</span> Free &nbsp;&nbsp;&nbsp;
                <span class="checkbox">${getCheckboxState('admission_fee', 'php')}</span> PHP ${getValue('admission_amount')}
              </div>
              <div style="margin-top: 3px; font-style: italic; font-size: 9px;">
                ***for other fees, please indicate: ${getValue('indicated_fees')}
              </div>
            </td>
            <td colspan="1" style="width: 25%;">
              <strong>Scope of Activity:</strong><br />
              <span class="checkbox">${getCheckboxState('audience_type', 'general')}</span> General Public<br />
              <span class="checkbox">${getCheckboxState('audience_type', 'exclusive')}</span> Exclusive
            </td>
            <td colspan="2" style="width: 40%;">
              <div style="display: flex; justify-content: space-between;">
                <div style="width: 50%;">
                  <strong>*With Food/Canteen Services?</strong><br />
                  <span class="checkbox">${getCheckboxState('food_service', 'yes')}</span> Yes &nbsp;&nbsp;
                  <span class="checkbox">${getCheckboxState('food_service', 'no')}</span> No
                </div>
                <div style="width: 50%; text-align: center;">
                  <strong>Canteen:</strong><br /><br />
                  <strong>____________________________</strong><br />
                  <strong>(Name | Signature | Date)</strong>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Facilities Services Section -->
        <table>
          <tr>
            <td>
              <strong>*Facilities Services</strong><br />
              Please attach a floor plan and include all set-up needs. (Podium, chairs, tables, riser, platform, *native cloth, etc)
            </td>
          </tr>
        </table>

        <!-- Audio-Visual Requirements -->
        <table class="outer-border">
          <tr>
            <td colspan="3"><strong>Audio-Visual Requirements</strong></td>
          </tr>
          <tr>
            <td colspan="1">
              <span class="checkbox">☐</span> Microphones: ${getValue('mic')} pcs<br />
              <span class="checkbox">☐</span> Microphone Stands: ${getValue('mic_stands')} pcs<br />
              <span class="checkbox">☐</span> Projector<br />
              <span class="checkbox">☐</span> PA System
            </td>
            <td colspan="1">
              <span class="checkbox">☐</span> Laptop<br />
              <span class="checkbox">☐</span> Lights<br />
              <span class="checkbox">☐</span> Other AV needs:<br />
              ${getValue('others_AV')}
            </td>
            <td colspan="1">
              <span class="checkbox">☐</span> WiFi Connection<br />
              <span class="checkbox">☐</span> Podium Monitor Board<br />
              <span class="checkbox">☐</span> Live Streaming
            </td>
          </tr>
          <tr>
            <td style="text-align: center; width: 33%;">
              <strong>*Maintenance Operation Unit:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td style="text-align: center; width: 33%;">
              <strong>*Media Center:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td style="text-align: center; width: 34%;">
              <strong>iTSS:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
          </tr>
        </table>

        <!-- Medical/Safety and Security Services -->
        <table class="outer-border">
          <tr>
            <td colspan="2"><strong>Medical/ Safety and Security Services</strong></td>
          </tr>
          <tr>
            <td style="text-align: center; width: 50%;">
              <strong>Medical Team Needed?</strong><br />
              <span class="checkbox">${getCheckboxState('medical_team', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('medical_team', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 50%;">
              <strong>Security Guards Needed?</strong><br />
              <span class="checkbox">${getCheckboxState('security_guards', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('security_guards', 'no')}</span> No
            </td>
          </tr>
          <tr>
            <td style="text-align: center; width: 50%;">
              <strong>Medical Clinic:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td style="text-align: center; width: 50%;">
              <strong>*Occupational Safety and Health Office:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
          </tr>
        </table>

        <!-- Property/Equipment Needs -->
        <table class="no-border">
          <tr>
            <td colspan="3"><strong>Property/ Equipment Needs (from LMO)</strong></td>
          </tr>
          <tr>
            <td style="text-align: center; width: 33%;">
              <strong>Air Cooler</strong><br />
              <span class="checkbox">${getCheckboxState('air_cooler', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('air_cooler', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 33%;">
              <strong>Long Tables</strong><br />
              <span class="checkbox">${getCheckboxState('long_tables', 'yes')}</span> Yes, How many? ${getValue('long_tables_count')} &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('long_tables', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 34%;">
              <strong>Philippine Flag and UC Flag</strong><br />
              <span class="checkbox">${getCheckboxState('flags', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('flags', 'no')}</span> No
            </td>
          </tr>
          <tr>
            <td style="text-align: center; width: 33%;">
              <strong>Logistic Management Office:</strong><br />
              <strong>____________________________</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td colspan="2"></td>
          </tr>
        </table>

        <!-- Agreement Section -->
        <table class="outer-border">
          <tr>
            <td colspan="2">
              I have read and discussed with the Director of *Campus Management Office the policies and guidelines and accept personal responsibility to abide by them. I understand that the use of UC Facilities is contingent upon the approval of the concerned Offices.
            </td>
          </tr>
          <tr>
            <td colspan="1">
              I understand there may be additional charges for:
              <ul>
                <li>Set-up/ take-down/ if overtime is required</li>
                <li>Technician</li>
                <li>Electricity Needs</li>
                <li>Parking arrangements for large events</li>
              </ul>
            </td>
            <td colspan="1">
              <br />
              <ul>
                <li>Rental additional equipment, if any</li>
                <li>Cleaning, damage, repair of facilities or grounds</li>
                <li>Security personnel beyond regularly scheduled guards</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              By signing this form, I acknowledge responsibility for the care and condition of facilities and equipment used by our department/ organization.
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center;">
              <div style="display: inline-block; margin-right: 40px;">
                <strong>_________________________________</strong><br />
                <strong>Name and Signature of Contact Person</strong>
              </div>
              <div style="display: inline-block;">
                <strong>___________</strong><br />
                <strong>Date</strong>
              </div>
            </td>
          </tr>
        </table>

        <!-- For Office Use Only -->
        <table>
          <tr>
            <td style="width: 50%;">
              <strong>For Facilities Management Office Use Only</strong><br />
              <p>
                &nbsp;&nbsp;Catering Clean up to be completed by<br />
                &nbsp;&nbsp;${getValue('catering')}&nbsp;&nbsp;&nbsp;Date: ___________<br />
                &nbsp;&nbsp;Retrieval of Audio-Visual Equipment to be done by<br />
                &nbsp;&nbsp;${getValue('AV_retrieval')}&nbsp;&nbsp;&nbsp;Date: ___________
              </p>
            </td>
            <td style="width: 50%;">
              <br />
              <strong>With Payment?</strong> &nbsp;&nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('payment', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('payment', 'no')}</span> No<br />
              <ul>
                <li><strong>Rental Fees ${getValue('rental_fees')} &nbsp;O.R. # ${getValue('rental_or')}</strong></li>
                <li><strong>Other Fees ${getValue('other_fees')} &nbsp;O.R. # ${getValue('other_or')}</strong></li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="background-color: #918f8f;">
              <strong>Approved By</strong>
            </td>
            <td style="background-color: #918f8f;">
              <strong>Health &amp; Safety Protocol Approved By</strong>
            </td>
          </tr>
          <tr>
            <td><br /></td>
            <td><br /></td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <strong>Director, *Campus Management Office</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td style="text-align: center;">
              <strong>VP for Administration &amp; Student Services</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div class="footer-info">
          <div style="text-align: left;">
            <div><strong>UC-CMO-FORM-62</strong></div>
            <div>${currentDate}</div>
          </div>
          <div style="text-align: right;">
            <div>Page 1 of 1</div>
            <div><strong>Control No.: ${controlNo}</strong></div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Create HTML content for External Client form
   * @param {Object} formData - The form data
   * @param {string} controlNo - Control number
   * @returns {string} - HTML content
   */
  createExternalClientHTML(formData, controlNo) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Helper function to get checkbox state
    const getCheckboxState = (fieldName, value) => {
      if (Array.isArray(formData[fieldName])) {
        return formData[fieldName].includes(value) ? '☑' : '☐';
      }
      return formData[fieldName] === value ? '☑' : '☐';
    };

    // Helper function to get field value
    const getValue = (fieldName, defaultValue = '') => {
      return this.safeFieldValue(formData[fieldName], defaultValue);
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facilities and Services Request Form for External Clients - ${controlNo}</title>
      <style>
        @page {
          size: 8.5in 13in;
          margin: 1cm;
        }
        body {
          font-family: Century Gothic, sans-serif;
          font-size: 11px;
          margin: 0;
          padding: 0;
          line-height: 1.2;
          color: black;
        }
        .form-container {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        td, th {
          border: 1px solid black;
          padding: 5px;
          vertical-align: top;
        }
        .no-border {
          border: none !important;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .checkbox {
          font-size: 14px;
          font-weight: bold;
        }
        .section-title {
          font-weight: bold;
          background-color: #747272;
        }
        .footer-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 11px;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <!-- Header Section -->
        <div class="header-row">
          <div style="width: 60px; height: 40px; border: 1px solid black; text-align: center; line-height: 40px;">
            <img src="./images/UC_LOGO.png" alt="UC Logo" class="navbar-logo">
          </div>
          <div style="text-align: right;">
            <strong>CAMPUS MANAGEMENT OFFICE</strong><br />
            <strong>Facilities Management Operations Unit</strong>
          </div>
        </div>

        <!-- Title Section -->
        <div style="text-align: center; margin-bottom: 15px;">
          <strong style="font-size: 14px;">FACILITIES AND SERVICES REQUEST FORM FOR EXTERNAL CLIENTS</strong>
        </div>

        <strong>NOTE: Submit two (2) copies of this form at least two (2) weeks prior to your event.</strong>

        <!-- Main Form Table -->
        <table>
          <tr>
            <td colspan="2" style="width: 50%;">
              <strong>Organization/ Company/ Agency:</strong><br />
              ${getValue('organization_name')}
            </td>
            <td colspan="2" style="width: 50%;">
              <strong>Contact Person:</strong><br />
              ${getValue('contact_person')}
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Address:</strong><br />
              ${getValue('address')}
            </td>
            <td colspan="2">
              <strong>Contact Number/ *Email:</strong><br />
              ${getValue('contact_info')}
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Title/ Theme of Activity:</strong><br />
              ${getValue('title_theme')}
            </td>
            <td colspan="2">
              <strong>Date being reserved:</strong><br />
              ${getValue('reserve_date')}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="width: 35%;">
              <strong>Requested Venue/Room:</strong><br />
              ${getValue('requested_venue')}
            </td>
            <td colspan="1" style="width: 25%;">
              <strong>Number of Attendees:</strong><br />
              ${getValue('attendees')}
            </td>
            <td colspan="1" style="width: 20%;">
              <strong>Time Start:</strong><br />
              ${getValue('time_start')}
            </td>
            <td colspan="1" style="width: 20%;">
              <strong>Time End:</strong><br />
              ${getValue('time_end')}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="width: 50%;">
              <strong>Admission Fee:</strong><br />
              <div style="text-align: center;">
                <span class="checkbox">${getCheckboxState('admission_fee', 'free')}</span> Free &nbsp;&nbsp;&nbsp;
                <span class="checkbox">${getCheckboxState('admission_fee', 'php')}</span> PHP ${getValue('admission_amount')}
              </div>
              <div style="margin-top: 3px; font-style: italic; font-size: 9px;">
                ***for other fees, please indicate: ${getValue('other_fees_details')}
              </div>
            </td>
            <td colspan="2" style="width: 50%;">
              <strong>Scope of Activity:</strong><br />
              <span class="checkbox">${getCheckboxState('scope', 'general')}</span> General Public<br />
              <span class="checkbox">${getCheckboxState('scope', 'exclusive')}</span> Exclusive
            </td>
          </tr>
        </table>

        <!-- Facilities Services Section -->
        <table>
          <tr>
            <td>
              <strong>*Facilities Services</strong><br />
              Please attach a floor plan and include all set-up needs. (Podium, chairs, tables, riser, platform, *native cloth, etc)<br />
              ${getValue('facilities_details')}
            </td>
          </tr>
        </table>

        <!-- Audio-Visual Requirements -->
        <table>
          <tr>
            <td colspan="3"><strong>Audio-Visual Requirements</strong></td>
          </tr>
          <tr>
            <td colspan="1">
              <span class="checkbox">${getCheckboxState('av_microphones', 'yes')}</span> Microphones: ${getValue('microphones_count')} pcs<br />
              <span class="checkbox">${getCheckboxState('av_mic_stands', 'yes')}</span> Microphone Stands: ${getValue('mic_stands_count')} pcs<br />
              <span class="checkbox">${getCheckboxState('av_projector', 'yes')}</span> Projector<br />
              <span class="checkbox">${getCheckboxState('av_pa_system', 'yes')}</span> PA System
            </td>
            <td colspan="1">
              <span class="checkbox">${getCheckboxState('av_laptop', 'yes')}</span> Laptop<br />
              <span class="checkbox">${getCheckboxState('av_lights', 'yes')}</span> Lights<br />
              <span class="checkbox">${getCheckboxState('av_other', 'yes')}</span> Other AV needs:<br />
              ${getValue('av_other_details')}
            </td>
            <td colspan="1">
              <span class="checkbox">${getCheckboxState('av_wifi', 'yes')}</span> WiFi Connection<br />
              <span class="checkbox">${getCheckboxState('av_podium_monitor', 'yes')}</span> Podium Monitor Board<br />
              <span class="checkbox">${getCheckboxState('av_live_streaming', 'yes')}</span> Live Streaming
            </td>
          </tr>
        </table>

        <!-- Medical/Safety and Security Services -->
        <table>
          <tr>
            <td colspan="2"><strong>Medical/ Safety and Security Services</strong></td>
          </tr>
          <tr>
            <td style="text-align: center; width: 50%;">
              <strong>Medical Team Needed?</strong><br />
              <span class="checkbox">${getCheckboxState('medical_team', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('medical_team', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 50%;">
              <strong>Security Guards Needed?</strong><br />
              <span class="checkbox">${getCheckboxState('security_guards', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('security_guards', 'no')}</span> No
            </td>
          </tr>
        </table>

        <!-- Property/Equipment Needs -->
        <table>
          <tr>
            <td colspan="3"><strong>Property/ Equipment Needs (from LMO)</strong></td>
          </tr>
          <tr>
            <td style="text-align: center; width: 33%;">
              <strong>Air Cooler</strong><br />
              <span class="checkbox">${getCheckboxState('air_cooler', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('air_cooler', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 33%;">
              <strong>Long Tables</strong><br />
              <span class="checkbox">${getCheckboxState('long_tables', 'yes')}</span> Yes, How many? ${getValue('long_tables_count')} &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('long_tables', 'no')}</span> No
            </td>
            <td style="text-align: center; width: 34%;">
              <strong>Philippine Flag and UC Flag</strong><br />
              <span class="checkbox">${getCheckboxState('flags', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('flags', 'no')}</span> No
            </td>
          </tr>
        </table>

        <!-- Agreement Section -->
        <table>
          <tr>
            <td colspan="2">
              I have read and discussed with the Director of *Campus Management Office the policies and guidelines and accept personal responsibility to abide by them. I understand that the use of UC Facilities is contingent upon the approval of the concerned Offices.
            </td>
          </tr>
          <tr>
            <td colspan="1">
              I understand there may be additional charges for:
              <ul>
                <li>Set-up/ take-down/ if overtime is required</li>
                <li>Technician</li>
                <li>Electricity Needs</li>
                <li>Parking arrangements for large events</li>
              </ul>
            </td>
            <td colspan="1">
              <br />
              <ul>
                <li>Rental additional equipment, if any</li>
                <li>Cleaning, damage, repair of facilities or grounds</li>
                <li>Security personnel beyond regularly scheduled guards</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              By signing this form, I acknowledge responsibility for the care and condition of facilities and equipment used by our organization.
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center;">
              <div style="display: inline-block; margin-right: 40px;">
                <strong>_________________________________</strong><br />
                <strong>Name and Signature of Contact Person</strong>
              </div>
              <div style="display: inline-block;">
                <strong>___________</strong><br />
                <strong>Date</strong>
              </div>
            </td>
          </tr>
        </table>

        <!-- For Office Use Only -->
        <table>
          <tr>
            <td style="width: 50%;">
              <strong>For Facilities Management Office Use Only</strong><br />
              <p>
                &nbsp;&nbsp;Catering Clean up to be completed by<br />
                &nbsp;&nbsp;${getValue('catering_cleanup')}&nbsp;&nbsp;&nbsp;Date: ___________<br />
                &nbsp;&nbsp;Retrieval of Audio-Visual Equipment to be done by<br />
                &nbsp;&nbsp;${getValue('av_retrieval')}&nbsp;&nbsp;&nbsp;Date: ___________
              </p>
            </td>
            <td style="width: 50%;">
              <br />
              <strong>With Payment?</strong> &nbsp;&nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('payment', 'yes')}</span> Yes &nbsp;&nbsp;
              <span class="checkbox">${getCheckboxState('payment', 'no')}</span> No<br />
              <ul>
                <li><strong>Rental Fees ${getValue('rental_fees')} &nbsp;O.R. # ${getValue('rental_or')}</strong></li>
                <li><strong>Other Fees ${getValue('other_fees')} &nbsp;O.R. # ${getValue('other_or')}</strong></li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="background-color: #918f8f;">
              <strong>Approved By</strong>
            </td>
            <td style="background-color: #918f8f;">
              <strong>Health &amp; Safety Protocol Approved By</strong>
            </td>
          </tr>
          <tr>
            <td><br /></td>
            <td><br /></td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <strong>Director, *Campus Management Office</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
            <td style="text-align: center;">
              <strong>VP for Administration &amp; Student Services</strong><br />
              <strong>(Name | Signature | Date)</strong>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div class="footer-info">
          <div style="text-align: left;">
            <div><strong>UC-CMO-FORM-63</strong></div>
            <div>${currentDate}</div>
          </div>
          <div style="text-align: right;">
            <div>Page 1 of 1</div>
            <div><strong>Control No.: ${controlNo}</strong></div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = new PDFService();
