const BasePDFFormat = require('./basePDFFormat');

/**
 * SARF PDF Format class for generating Student Activity Request Form PDFs
 */
class SARFPDFFormat extends BasePDFFormat {
  constructor() {
    super();
  }

  /**
   * Get SARF-specific CSS styles
   * @returns {string} - CSS styles
   */
  getSARFStyles() {
    return `
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
    `;
  }

  /**
   * Generate SARF PDF HTML content
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  generateHTML(formData) {
    const currentDate = this.getCurrentDate();
    const currentTime = this.getCurrentTime();
    
    const content = this.createSARFContent(formData, currentDate, currentTime);
    
    return this.createHTMLDocument(
      `Combined On-Campus Registration Form - ${formData.control || 'N/A'}`,
      this.getSARFStyles(),
      content
    );
  }

  /**
   * Create SARF content
   * @param {Object} formData - Form data
   * @param {string} currentDate - Current date
   * @param {string} currentTime - Current time
   * @returns {string} - SARF content HTML
   */
  createSARFContent(formData, currentDate, currentTime) {
    return `
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

      ${this.createMainInfoSection(formData)}
      ${this.createFormFieldsSection(formData)}
      ${this.createParticipantsSection(formData)}
      ${this.createBudgetSection(formData)}
      ${this.createInChargeSection(formData)}
      ${this.createLiabilitySection()}
      ${this.createApprovalSection()}
      
      <div class="center small-text" style="margin-top: 10px;">Page 1 of 3</div>
      
      ${this.createPage2Content(currentDate, currentTime)}
      ${this.createPage3Content(currentDate, currentTime)}
    `;
  }

  /**
   * Create main information section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createMainInfoSection(formData) {
    return `
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
              ${this.getValue(formData, 'control', '231317')}
            </div>
            <div class="bold">Received:</div>
            <div style="border: 1px solid black; padding: 5px; margin: 3px 0; text-align: center;">
              ${this.getValue(formData, 'received_date', '2024-07-03')}
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create form fields section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createFormFieldsSection(formData) {
    return `
      <table>
        <tr>
          <td style="width: 60%;">
            <div class="bold">Name of Organization/Office/College:</div>
            <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
              ${this.getValue(formData, 'organization_name', 'SD INC')}
            </div>
          </td>
          <td style="width: 40%;">
            <div class="bold">Remarks/Conditions:</div>
            <div style="border: 1px solid black; padding: 3px; height: 40px;">
              ${this.getValue(formData, 'remarks')}
            </div>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td>
            <div class="bold">Title of Activity/Program:</div>
            <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
              ${this.getValue(formData, 'title', 'Intern')}
            </div>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td>
            <div class="bold">Nature of Activity:</div>
            <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
              ${this.getValue(formData, 'nature')}
            </div>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td style="width: 50%;">
            <div class="bold">Activity Date/Time:</div>
            <div>Start: <span style="border-bottom: 1px solid black; display: inline-block; width: 150px; padding: 2px;">${this.getValue(formData, 'start_time', '22:28')}</span></div>
            <div>End: <span style="border-bottom: 1px solid black; display: inline-block; width: 150px; padding: 2px;">${this.getValue(formData, 'end_time', '18:28')}</span></div>
          </td>
          <td style="width: 50%;">
            ${this.createChecklistSection(formData)}
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td>
            <div class="bold">Venue/Location:</div>
            <div style="border-bottom: 1px solid black; padding: 3px; min-height: 18px;">
              ${this.getValue(formData, 'location', 'Tagum, Davao del Norte, Cordillera, PHL')}
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create checklist section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createChecklistSection(formData) {
    return `
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
    `;
  }

  /**
   * Create participants section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createParticipantsSection(formData) {
    return `
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
            <div class="field-input">${this.getValue(formData, 'est_participants')}</div>
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
    `;
  }

  /**
   * Create budget section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createBudgetSection(formData) {
    return `
      <table>
        <tr>
          <td class="two-col">
            <div class="bold">Source of Budget:</div>
            <div class="field-input">${this.getValue(formData, 'budget_source')}</div>
          </td>
          <td class="two-col">
            <div class="bold">Estimated Total Budget:</div>
            <div class="field-input">${this.getValue(formData, 'estimated_budget')}</div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create in-charge section
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createInChargeSection(formData) {
    return `
      <table>
        <tr>
          <td colspan="2" class="center bold">In-Charge of Activity</td>
        </tr>
        <tr>
          <td class="bold">Name:</td>
          <td class="field-input">${this.getValue(formData, 'incharge_name')}</td>
        </tr>
        <tr>
          <td class="bold">Designation:</td>
          <td class="field-input">${this.getValue(formData, 'incharge_designation')}</td>
        </tr>
        <tr>
          <td class="bold">Contact No.:</td>
          <td class="field-input">${this.getValue(formData, 'incharge_contact')}</td>
        </tr>
        <tr>
          <td class="bold">Email Address:</td>
          <td class="field-input">${this.getValue(formData, 'incharge_email')}</td>
        </tr>
      </table>
    `;
  }

  /**
   * Create liability section
   * @returns {string} - HTML content
   */
  createLiabilitySection() {
    return `
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
    `;
  }

  /**
   * Create approval section
   * @returns {string} - HTML content
   */
  createApprovalSection() {
    return `
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
    `;
  }

  /**
   * Create page 2 content
   * @param {string} currentDate - Current date
   * @param {string} currentTime - Current time
   * @returns {string} - HTML content
   */
  createPage2Content(currentDate, currentTime) {
    return `
      <div class="page-break"></div>
      <div class="header">
        <div>${currentDate}, ${currentTime}</div>
        <div class="center bold">Combined On-Campus Registration Form</div>
        <div class="header-right"></div>
      </div>
      <div class="center small-text" style="margin: 10px 0;">Page 2 of 3</div>
    `;
  }

  /**
   * Create page 3 content
   * @param {string} currentDate - Current date
   * @param {string} currentTime - Current time
   * @returns {string} - HTML content
   */
  createPage3Content(currentDate, currentTime) {
    return `
      <div class="page-break"></div>
      <div class="header">
        <div>${currentDate}, ${currentTime}</div>
        <div class="center bold">Combined On-Campus Registration Form</div>
        <div class="header-right"></div>
      </div>
      <div class="center small-text" style="margin-top: 20px;">Page 3 of 3</div>
    `;
  }
}

module.exports = SARFPDFFormat;
