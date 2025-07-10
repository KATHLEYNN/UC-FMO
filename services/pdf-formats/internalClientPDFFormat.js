const BasePDFFormat = require('./basePDFFormat');

/**
 * Internal Client PDF Format class for generating Internal Client form PDFs
 */
class InternalClientPDFFormat extends BasePDFFormat {
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
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .header-row img {
        height: 40px;
      }
      .title-section {
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 15px;
      }
      .note-section {
        font-weight: bold;
        margin-bottom: 15px;
        font-size: 11px;
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
        font-size: 11px;
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
        padding: 8px;
      }
      .section-title {
        font-weight: bold;
        background-color: #747272;
      }
      .small {
        font-size: 10px;
      }
      .footer-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 11px;
        margin-top: 40px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
      td, th {
        border: 1px solid black;
        padding: 4px;
        vertical-align: top;
        font-size: 9px;
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
        height: 20px;
        margin-bottom: 3px;
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
      ${this.createFacilitiesServicesSection(formData)}
      ${this.createAudioVisualSection(formData)}
      ${this.createMedicalSecuritySection(formData)}
      ${this.createPropertyEquipmentSection(formData)}
      ${this.createAgreementSection(formData)}
      ${this.createOfficeUseSection(formData)}

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
            ${this.getValue(formData, 'organization_name')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Contact Number/ *Email:</strong><br/>
            ${this.getValue(formData, 'contact')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Budget Source:</strong><br/>
            ${this.getValue(formData, 'budget_source')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Function/Event:</strong><br/>
            ${this.getValue(formData, 'event_name')}
          </td>
          <td colspan="2">
            <strong>Date/Day of Event:</strong><br/>
            ${this.getValue(formData, 'event_date')}
          </td>
        </tr>
        <tr>
          <td colspan="1" style="width: 35%;">
            <strong>Requested Venue/Room:</strong><br/>
            ${this.getValue(formData, 'venue')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Number of Attendees:</strong><br/>
            ${this.getValue(formData, 'attendees')}
          </td>
          <td colspan="1" style="width: 20%;">
            <strong>Time Start:</strong><br/>
            ${this.getValue(formData, 'time_start')}
          </td>
          <td colspan="1" style="width: 20%;">
            <strong>Time End:</strong><br/>
            ${this.getValue(formData, 'time_end')}
          </td>
        </tr>
        <tr>
          <td colspan="1" style="width: 35%;">
            <strong>Admission Fee:</strong><br/>
            <div style="text-align: center;">
              ${this.getCheckboxState(formData, 'admission_fee', 'free')} Free<br/>
              ${this.getCheckboxState(formData, 'admission_fee', 'php')} PHP ${this.getValue(formData, 'admission_amount')}<br/>
            </div>
            <div style="margin-top: 3px; font-style: italic; font-size: 9px;">
              ***for other fees, please indicate: ${this.getValue(formData, 'other_fees')}
            </div>
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Scope of Activity:</strong><br/>
            ${this.getCheckboxState(formData, 'audience_type', 'general')} General Public<br/>
            ${this.getCheckboxState(formData, 'audience_type', 'exclusive')} Exclusive
          </td>
          <td colspan="2" style="width: 40%;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 50%;">
                <strong>*With Food/Canteen Services?</strong><br/>
                ${this.getCheckboxState(formData, 'food_service', 'yes')} Yes<br/>
                ${this.getCheckboxState(formData, 'food_service', 'no')} No
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
            ${this.getCheckboxState(formData, 'mic_checkbox', 'Microphones')} Microphones: ${this.getValue(formData, 'mic')} pcs<br/>
            ${this.getCheckboxState(formData, 'mic_stands_checkbox', 'Mic_Stands')} Microphone Stands: ${this.getValue(formData, 'mic_stands')} pcs<br/>
            ${this.getCheckboxState(formData, 'projector_checkbox', 'Projector')} Projector<br/>
            ${this.getCheckboxState(formData, 'pa_system_checkbox', 'PA_System')} PA System
          </td>
          <td colspan="1">
            ${this.getCheckboxState(formData, 'laptop_checkbox', 'Laptop')} Laptop<br/>
            ${this.getCheckboxState(formData, 'lights_checkbox', 'Lights')} Lights<br/>
            Other AV needs:<br/>
            ${this.getValue(formData, 'others_AV')}
          </td>
          <td colspan="1">
            ${this.getCheckboxState(formData, 'wifi_checkbox', 'WiFi_Connection')} WiFi Connection<br/>
            ${this.getCheckboxState(formData, 'podium_checkbox', 'Podium_Monitor')} Podium Monitor Board<br/>
            ${this.getCheckboxState(formData, 'stream_checkbox', 'Live_Streaming')} Live Streaming
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
            ${this.getCheckboxState(formData, 'medical_team', 'yes')} Yes &nbsp;&nbsp;&nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'medical_team', 'no')} No
          </td>
          <td style="text-align: center; width: 50%;">
            <strong>Security Guards Needed?</strong><br/>
            ${this.getCheckboxState(formData, 'security_guards', 'yes')} Yes &nbsp;&nbsp;&nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'security_guards', 'no')} No
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
            ${this.getCheckboxState(formData, 'air_cooler', 'yes')} Yes &nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'air_cooler', 'no')} No
          </td>
          <td style="text-align: center; width: 33%;">
            ${this.getCheckboxState(formData, 'long_tables', 'yes')} Yes, How many? ${this.getValue(formData, 'long_tables_count')}<br/>
            ${this.getCheckboxState(formData, 'long_tables', 'no')} No
          </td>
          <td style="text-align: center; width: 34%;">
            ${this.getCheckboxState(formData, 'flags', 'yes')} Yes &nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'flags', 'no')} No
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
   * Create agreement section
   * @param {Object} formData - Form data
   * @returns {string} - Agreement section HTML
   */
  createAgreementSection(formData) {
    return `
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
            <br/>
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
          <td style="width: 50%;">
            <strong>For Facilities Management Office Use Only</strong><br/>
            <p>
              &nbsp;&nbsp;Catering Clean up to be completed by<br/>
              &nbsp;&nbsp;${this.getValue(formData, 'catering')}&nbsp;&nbsp;&nbsp;Date: ___________<br/>
              &nbsp;&nbsp;Retrieval of Audio-Visual Equipment to be done by<br/>
              &nbsp;&nbsp;${this.getValue(formData, 'AV_retrieval')}&nbsp;&nbsp;&nbsp;Date: ___________
            </p>
          </td>
          <td style="width: 50%;">
            <br/>
            <strong>With Payment?</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'payment', 'yes')} Yes &nbsp;&nbsp;&nbsp;&nbsp;
            ${this.getCheckboxState(formData, 'payment', 'no')} No<br/>
            <ul>
              <li>
                <strong>
                  Rental Fees ${this.getValue(formData, 'rental_fees')}
                  &nbsp;O.R. # ${this.getValue(formData, 'rental_or')}
                </strong>
              </li>
              <li>
                <strong>
                  Other Fees ${this.getValue(formData, 'other_fees')}
                  &nbsp;O.R. # ${this.getValue(formData, 'other_or')}
                </strong>
              </li>
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
