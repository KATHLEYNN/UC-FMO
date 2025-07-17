const BasePDFFormat = require('./basePDFFormat');

/**
 * Internal Client PDF Format class for generating Internal Client form PDFs
 */
class InternalClientPDFFormat extends BasePDFFormat {

  /**
   * Format time from 24-hour to 12-hour format with AM/PM
   * @param {string} time24 - Time in 24-hour format (HH:MM)
   * @returns {string} - Time in 12-hour format with AM/PM
   */
  formatTime(time24) {
    if (!time24) return '';

    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  }

  /**
   * Check if curfew exemption is needed based on form data
   * @param {Object} formData - Form data
   * @returns {boolean} - True if exemption is needed
   */
  needsCurfewExemption(formData) {
    const startTime = formData.u_start;
    const endTime = formData.u_end;
    const eventDate = formData.u_date;

    if (!startTime || !endTime) return false;

    // Convert time to minutes for calculation
    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const duration = endMinutes - startMinutes;

    // Check if duration exceeds 4 hours (240 minutes)
    if (duration > 240) return true;

    // Check if event is on Sunday
    if (eventDate) {
      const [year, month, day] = eventDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getDay() === 0) return true; // Sunday
    }

    // Check if starts before 7:30 AM or ends after 7:30 PM
    const earliestMinutes = toMinutes('07:30');
    const latestMinutes = toMinutes('19:30');

    if (startMinutes < earliestMinutes || endMinutes > latestMinutes) return true;

    return false;
  }
  constructor() {
    super();
  }

  /**
   * Get Internal Client specific CSS styles
   * @returns {string} - CSS styles
   */
  getInternalClientStyles() {
    return `
      @page {
        size: 8.5in 13in portrait;
        margin-left: 1cm;
        margin-right: 1cm;
        margin-top: 1cm;
        margin-bottom: 1cm;
      }
      body {
        font-family: Century Gothic, sans-serif;
        font-size: 9px;
        margin: 0;
        padding: 0;
        line-height: 1.1;
        color: black;
      }
      .form-container {
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2px;
      }
      .header-row img {
        height: 30px;
      }
      .title-section {
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 8px;
      }
      .note-section {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 9px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 5px;
      }
      td, th {
        border: 1px solid black;
        padding: 3px;
        vertical-align: top;
        font-size: 9px;
      }
      .no-border {
        border: none !important;
      }
      .outer-border {
        border: 1px solid black;
        border-collapse: separate;
        border-spacing: 0;
      }
      .outer-border td,
      .outer-border th {
        border: none;
        padding: 4px;
      }
      .section-title {
        font-weight: bold;
        background-color: #747272;
      }
      .small {
        font-size: 8px;
      }
      .footer-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 9px;
        margin-top: 15px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 3px;
      }
      td, th {
        border: 1px solid black;
        padding: 2px;
        vertical-align: top;
        font-size: 8px;
        line-height: 1.2;
      }
      .no-border {
        border: none !important;
      }
      .checkbox-symbol {
        font-size: 12px;
        font-weight: bold;
        margin-right: 3px;
      }
      .center {
        text-align: center;
      }
      .bold {
        font-weight: bold;
      }
      .small-text {
        font-size: 8px;
      }
      .signature-line {
        border-bottom: 1px solid black;
        height: 12px;
        margin-bottom: 2px;
      }
      .section-title {
        font-weight: bold;
        background-color: #f0f0f0;
        text-align: center;
        padding: 5px;
      }
      .facilities-note {
        font-style: italic;
        font-size: 8px;
        padding: 5px;
      }
      .control-number {
        text-align: right;
        font-weight: bold;
        margin-top: 20px;
        font-size: 10px;
      }
    `;
  }

  /**
   * Generate Internal Client PDF HTML content
   * @param {Object} formData - Form data
   * @param {string} controlNo - Control number
   * @returns {string} - HTML content
   */
  generateHTML(formData, controlNo) {
    const content = this.createInternalClientContent(formData, controlNo);
    
    return this.createHTMLDocument(
      `Facilities and Services Request Form for Internal Clients - ${controlNo}`,
      this.getInternalClientStyles(),
      content
    );
  }

  /**
   * Create Internal Client content
   * @param {Object} formData - Form data
   * @param {string} controlNo - Control number
   * @returns {string} - Internal Client content HTML
   */
  createInternalClientContent(formData, controlNo) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!-- Header Section -->
      <div class="header-row">
        <div style="width: 100px;">
          <strong>UC LOGO</strong>
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

      ${this.createMainInfoTable(formData)}
      ${this.createAudioVisualSection(formData)}
      ${this.createMedicalSecuritySection(formData)}
      ${this.createPropertyEquipmentSection(formData)}
      ${this.createAgreementSection(formData)}

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

      <!-- Conditionally include curfew exemption form -->
      ${this.needsCurfewExemption(formData) ? this.createCurfewExemptionSection(formData) : ''}
    `;
  }

  /**
   * Create main information table
   * @param {Object} formData - Form data
   * @returns {string} - Main info table HTML
   */
  createMainInfoTable(formData) {
    return `
      <table>
        <tr>
          <td colspan="2" style="width: 50%;">
            <strong>College/ Office/ Department/ Organization:</strong><br/>
            ${this.getValue(formData, 'u_org')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Contact Number/ *Email:</strong><br/>
            ${this.getValue(formData, 'u_contact')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Budget Source:</strong><br/>
            ${this.getValue(formData, 'u_budget')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Function/Event:</strong><br/>
            ${this.getValue(formData, 'u_event')}
          </td>
          <td colspan="2">
            <strong>Date/Day of Event:</strong><br/>
            ${this.getValue(formData, 'u_date')}
          </td>
        </tr>
        <tr>
          <td colspan="1" style="width: 35%;">
            <strong>Requested Venue/Room:</strong><br/>
            ${this.getValue(formData, 'u_venue')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Number of Attendees:</strong><br/>
            ${this.getValue(formData, 'u_attend')}
          </td>
          <td colspan="1" style="width: 20%;">
            <strong>Time Start:</strong><br/>
            ${this.formatTime(this.getValue(formData, 'u_start'))}
          </td>
          <td colspan="1" style="width: 20%;">
            <strong>Time End:</strong><br/>
            ${this.formatTime(this.getValue(formData, 'u_end'))}
          </td>
        </tr>
        <tr>
          <td colspan="1" style="width: 35%;">
            <strong>Admission Fee:</strong><br/>
            ${this.getValue(formData, 'u_admission')}
            <div style="margin-top: 3px; font-style: italic; font-size: 9px;">
              ***for other fees, please indicate: ${this.getValue(formData, 'u_other_fees')}
            </div>
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Scope of Activity:</strong><br/>
            ${this.getValue(formData, 'u_scope')}
          </td>
          <td colspan="2" style="width: 40%;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 50%;">
                <strong>*With Food/Canteen Services?</strong><br/>
                ${formData.u_food === 'yes' ? '☑' : '☐'} Yes<br/>
                ${formData.u_food === 'no' ? '☑' : '☐'} No
              </div>
              <div style="width: 50%; text-align: center;">
                <strong>Canteen:</strong><br/>
                <div class="signature-line"></div>
                <strong>(Name | Signature | Date)</strong>
              </div>
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create facilities services section
   * @param {Object} formData - Form data
   * @returns {string} - Facilities services section HTML
   */
  createFacilitiesServicesSection(formData) {
    return `
      <table>
        <tr>
          <td>
            <strong>*Facilities Services</strong><br/>
            Please attach a floor plan and include all set-up needs. (Podium, chairs, tables, riser, platform, *native cloth, etc)
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create audio visual section
   * @param {Object} formData - Form data
   * @returns {string} - Audio visual section HTML
   */
  createAudioVisualSection(formData) {
    return `
      <table class="outer-border">
        <tr>
          <td colspan="3"><strong>Audio-Visual Requirements</strong></td>
        </tr>
        <tr>
          <td colspan="1">
            ${formData.mic ? '☑' : '☐'} Microphones<br/>
            ${formData.mic_stand ? '☑' : '☐'} Microphone Stands<br/>
            ${formData.projector ? '☑' : '☐'} Projector<br/>
            ${formData.pa_system ? '☑' : '☐'} PA System
          </td>
          <td colspan="1">
            ${formData.laptop ? '☑' : '☐'} Laptop<br/>
            ${formData.lights ? '☑' : '☐'} Lights<br/>
            Other AV needs:<br/>
            ${this.getValue(formData, 'u_av_other')}
          </td>
          <td colspan="1">
            ${formData.wifi_connection ? '☑' : '☐'} WiFi Connection<br/>
            ${formData.podium_monitor ? '☑' : '☐'} Podium Monitor Board<br/>
            ${formData.live_streaming ? '☑' : '☐'} Live Streaming
          </td>
        </tr>
        <tr>
          <td style="text-align: center; width: 33%;">
            <strong>*Maintenance Operation Unit:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center; width: 33%;">
            <strong>*Media Center:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center; width: 34%;">
            <strong>iTSS:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create medical/security section
   * @param {Object} formData - Form data
   * @returns {string} - Medical/security section HTML
   */
  createMedicalSecuritySection(formData) {
    return `
      <table class="outer-border">
        <tr>
          <td colspan="2"><strong>Medical/ Safety and Security Services</strong></td>
        </tr>
        <tr>
          <td style="text-align: center; width: 50%;">
            <strong>Medical Team Needed?</strong><br/>
            ${formData.u_medical === 'yes' ? '☑' : '☐'} Yes &nbsp;&nbsp;&nbsp;&nbsp;
            ${formData.u_medical === 'no' ? '☑' : '☐'} No
          </td>
          <td style="text-align: center; width: 50%;">
            <strong>Security Guards Needed?</strong><br/>
            ${formData.u_security === 'yes' ? '☑' : '☐'} Yes &nbsp;&nbsp;&nbsp;&nbsp;
            ${formData.u_security === 'no' ? '☑' : '☐'} No
          </td>
        </tr>
        <tr>
          <td style="text-align: center; width: 50%;">
            <strong>Medical Clinic:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center; width: 50%;">
            <strong>*Occupational Safety and Health Office:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create property/equipment section
   * @param {Object} formData - Form data
   * @returns {string} - Property/equipment section HTML
   */
  createPropertyEquipmentSection(formData) {
    return `
      <table class="no-border">
        <tr>
          <td colspan="3"><strong>Property/ Equipment Needs (from LMO)</strong></td>
        </tr>
        <tr>
          <td style="text-align: center; width: 33%;">
            <strong>Air Cooler</strong>
          </td>
          <td style="text-align: center; width: 33%;">
            <strong>Long Tables</strong>
          </td>
          <td style="text-align: center; width: 34%;">
            <strong>Philippine Flag and UC Flag</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; width: 33%;">
            ${formData.u_air_cooler === 'yes' ? '☑' : '☐'} Yes &nbsp;&nbsp;
            ${formData.u_air_cooler === 'no' ? '☑' : '☐'} No
          </td>
          <td style="text-align: center; width: 33%;">
            ${formData.u_long_tables === 'yes' ? '☑' : '☐'} Yes<br/>
            How many? <strong>${this.getValue(formData, 'u_long_tables_count') || '___'}</strong><br/>
            ${formData.u_long_tables === 'no' ? '☑' : '☐'} No
          </td>
          <td style="text-align: center; width: 34%;">
            ${formData.u_flags === 'yes' ? '☑' : '☐'} Yes &nbsp;&nbsp;
            ${formData.u_flags === 'no' ? '☑' : '☐'} No
          </td>
        </tr>
        <tr>
          <td style="text-align: center;" colspan="3">
            <strong>Logistic Management Office:</strong><br/>
            <div class="signature-line"></div>
            <strong>(Name | Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create curfew exemption section (compact inline version)
   * @param {Object} formData - Form data
   * @returns {string} - Curfew exemption section HTML
   */
  createCurfewExemptionSection(formData) {
    return `
      <table class="outer-border" style="margin-top: 5px;">
        <tr>
          <td colspan="2" style="text-align: center; font-weight: bold; background-color: #fff3cd; font-size: 10px;">
            REQUEST FOR EXEMPTION FROM CURFEW
          </td>
        </tr>
        <tr>
          <td style="width: 50%; font-size: 8px;">
            <strong>Date:</strong> ${this.getCurrentDate()}<br/>
            <strong>Requesting Office:</strong> ${this.getValue(formData, 'u_org')}<br/>
            <strong>Venue:</strong> ${this.getValue(formData, 'u_venue')}<br/>
            <strong>Number of People:</strong> ${this.getValue(formData, 'u_attend')}
          </td>
          <td style="width: 50%; font-size: 8px;">
            <strong>Activity:</strong> ${this.getValue(formData, 'u_event')}<br/>
            <strong>Date:</strong> ${this.getValue(formData, 'u_date')}<br/>
            <strong>Time:</strong> ${this.formatTime(this.getValue(formData, 'u_start'))} to ${this.formatTime(this.getValue(formData, 'u_end'))}<br/>
            <strong>Attachment:</strong> ☑ Internal Client Form
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-size: 7px;">
            <strong>Requesting Office:</strong><br/>
            <div class="signature-line" style="height: 8px;"></div>
            <strong>(Signature | Date)</strong>
          </td>
          <td style="text-align: center; font-size: 7px;">
            <strong>Campus Management Office:</strong><br/>
            <div class="signature-line" style="height: 8px;"></div>
            <strong>(Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create agreement section
   * @param {Object} formData - Form data
   * @returns {string} - Agreement section HTML
   */
  createAgreementSection(formData) {
    return `
      <table class="outer-border">
        <tr>
          <td colspan="2">
            I have read and accept the policies and guidelines. I understand that the use of UC Facilities is contingent upon approval of the concerned Offices and acknowledge responsibility for the care and condition of facilities and equipment used.
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center;">
            <div style="display: inline-block; text-align: center; margin-right: 40px;">
              <div class="signature-line"></div>
              <strong>Name and Signature of Contact Person</strong>
            </div>
            <div style="display: inline-block; text-align: center;">
              <div class="signature-line" style="width: 100px;"></div>
              <strong>Date</strong>
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create office use section
   * @param {Object} formData - Form data
   * @returns {string} - Office use section HTML
   */
  createOfficeUseSection(formData) {
    return `
      <table>
        <tr>
          <td style="background-color: #918f8f;">
            <strong>Approved By</strong>
          </td>
          <td style="background-color: #918f8f;">
            <strong>Health &amp; Safety Protocol Approved By</strong>
          </td>
        </tr>
        <tr>
          <td><br/></td>
          <td><br/></td>
        </tr>
        <tr>
          <td style="text-align: center;">
            <strong>Director, *Campus Management Office</strong><br/>
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center;">
            <strong>VP for Administration &amp; Student Services</strong><br/>
            <strong>(Name | Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }
}

module.exports = InternalClientPDFFormat;
