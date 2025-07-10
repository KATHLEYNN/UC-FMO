const BasePDFFormat = require('./basePDFFormat');

/**
 * External Client PDF Format class for generating External Client form PDFs
 */
class ExternalClientPDFFormat extends BasePDFFormat {
  constructor() {
    super();
  }

  /**
   * Get External Client specific CSS styles
   * @returns {string} - CSS styles
   */
  getExternalClientStyles() {
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
      .signature-line {
        border-bottom: 1px solid black;
        display: inline-block;
        width: 200px;
        height: 20px;
      }
      .underline-field {
        border-bottom: 1px solid black;
        display: inline-block;
        min-width: 100px;
        padding: 2px;
      }
      .footer-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 11px;
        margin-top: 40px;
      }
    `;
  }

  /**
   * Generate External Client PDF HTML content
   * @param {Object} formData - Form data
   * @param {string} controlNo - Control number
   * @returns {string} - HTML content
   */
  generateHTML(formData, controlNo) {
    const content = this.createExternalClientContent(formData, controlNo);
    
    return this.createHTMLDocument(
      `Facilities and Services Request Form for External Clients - ${controlNo}`,
      this.getExternalClientStyles(),
      content
    );
  }

  /**
   * Create External Client content
   * @param {Object} formData - Form data
   * @param {string} controlNo - Control number
   * @returns {string} - External Client content HTML
   */
  createExternalClientContent(formData, controlNo) {
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
        <strong style="font-size: 15px;">FACILITIES AND SERVICES REQUEST FORM FOR EXTERNAL CLIENTS</strong><br/>
        <span style="font-size: 13px;">(Please read House Rules / Policy before filing out this form.)</span>
      </div>

      ${this.createMainInfoTable(formData)}
      ${this.createFacilitiesAndActivitySection(formData)}
      ${this.createEquipmentAndAVSection(formData)}
      ${this.createFacilitiesServicesSection(formData)}
      ${this.createCancellationPolicySection()}
      ${this.createBillingSection(formData)}
      ${this.createApprovalSection(formData)}

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
    `;
  }

  /**
   * Create main form table
   * @param {Object} formData - Form data
   * @returns {string} - HTML content
   */
  createMainInfoTable(formData) {
    return `
      <table>
        <tr>
          <td colspan="2" style="width: 50%;">
            <strong>Name of Agency/Organization:</strong><br/>
            ${this.getValue(formData, 'organization_name')}
          </td>
          <td colspan="1" style="width: 30%;">
            <strong>Contact Person:</strong><br/>
            ${this.getValue(formData, 'contact_person')}
          </td>
          <td colspan="1" style="width: 20%;">
            <strong>Contact No.:</strong><br/>
            ${this.getValue(formData, 'contact_number')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Address of Agency/Organization:</strong><br/>
            ${this.getValue(formData, 'address')}
          </td>
          <td colspan="2">
            <strong>Contact Number/ *Email:</strong><br/>
            ${this.getValue(formData, 'contact_info')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Title/Theme of Activity:</strong><br/>
            ${this.getValue(formData, 'title_theme')}
          </td>
          <td colspan="2">
            <strong>Purpose of Activity:</strong><br/>
            ${this.getValue(formData, 'purpose')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Requested Venue/Room:</strong><br/>
            ${this.getValue(formData, 'requested_venue')}
          </td>
          <td colspan="2">
            <strong>Date being reserved:</strong><br/>
            ${this.getValue(formData, 'reserve_date')}
          </td>
        </tr>
        <tr>
          <td colspan="1" style="width: 25%;">
            <strong>Number of Participants:</strong><br/>
            ${this.getValue(formData, 'attendees')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Time Start:</strong><br/>
            ${this.getValue(formData, 'time_start')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Time End:</strong><br/>
            ${this.getValue(formData, 'time_end')}
          </td>
          <td colspan="1" style="width: 25%;">
            <strong>Facilities Details:</strong><br/>
            ${this.getValue(formData, 'facilities_details')}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong>Admission Fee:</strong><br/>
            <div style="text-align: center;">
              ${this.getCheckboxState(formData, 'admission_fee', 'free')} Free<br/>
              ${this.getCheckboxState(formData, 'admission_fee', 'php')} PHP ${this.getValue(formData, 'admission_amount')}<br/>
            </div>
            <div style="margin-top: 3px; font-style: italic; font-size: 9px;">
              ***for other fees, please indicate: ${this.getValue(formData, 'other_fees_details')}
            </div>
          </td>
          <td colspan="2">
            <strong>Scope of Activity:</strong><br/>
            ${this.getCheckboxState(formData, 'scope', 'general')} General Public<br/>
            ${this.getCheckboxState(formData, 'scope', 'exclusive')} Exclusive
          </td>
        </tr>
        <tr>
          <td colspan="4">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 50%;">
                <strong>*With Food/Canteen Services?</strong><br/>
                ${this.getCheckboxState(formData, 'food_service', 'yes')} Yes &nbsp;&nbsp;
                ${this.getCheckboxState(formData, 'food_service', 'no')} No
              </div>
              <div style="width: 50%; text-align: center;">
                <strong>Canteen</strong><br/>
                <div class="signature-line"></div>
                <br>
                <strong>(Name | Signature | Date)</strong>
              </div>
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create facilities and activity section
   * @param {Object} formData - Form data
   * @returns {string} - Facilities and activity section HTML
   */
  createFacilitiesAndActivitySection(formData) {
    return `
      <table>
        <tr>
          <td colspan="2">
            <strong>Facilities Needed</strong><br/>
            ${this.getCheckboxState(formData, 'facility_type', 'classroom')} Classroom (Max Capacity = 45) Room No. ${this.getValue(formData, 'classroom_number')}<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'gym')} Gymnasium (Max Capacity = 1,500)<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'auditorium')} Auditorium (Max Capacity = 250)<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'theater')} Theater (Max Capacity = 600)<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'review_center')} G311-G312- Review Center (Max Capacity = 100)<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'training')} Training Center (Max Capacity = 40)<br/>
            ${this.getCheckboxState(formData, 'facility_type', 'other_facilities')} Others, Specify: ${this.getValue(formData, 'others_number')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Max Capacity: ${this.getValue(formData, 'others_max')}
          </td>
          <td colspan="2">
            <strong>Type of Activity</strong><br/>
            ${this.getCheckboxState(formData, 'activity-type', 'play_presentation')} Play Presentation<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'convention')} Convention<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'seminar')} Training/ Seminar/ Conference<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'graduiation')} Graduation/ Convocation<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'fellowship')} Fellowship<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'basketball_volleyball')} Basketball/ Volleyball<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'sportsfest')} Sportsfest<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'review')} Review<br/>
            ${this.getCheckboxState(formData, 'activity-type', 'other_activity')} Others, Specify: ${this.getValue(formData, 'activity_specify')}
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create equipment and AV section
   * @param {Object} formData - Form data
   * @returns {string} - Equipment and AV section HTML
   */
  createEquipmentAndAVSection(formData) {
    return `
      <table>
        <tr>
          <td colspan="1">
            <strong>Equipment Needed</strong><br/><br/>
            <strong>&nbsp;&nbsp;•&nbsp;&nbsp;Furniture</strong><br/>
            ☐ Whiteboard<br/>
            ☐ Chairs: ${this.getValue(formData, 'chairs')}<br/>
            ☐ Long/Short Table: ${this.getValue(formData, 'ls_tables')}<br/>
            ☐ Rosirum<br/>
            ☐ Round Table: ${this.getValue(formData, 'round_tables')}<br/>
            <strong>&nbsp;&nbsp;•&nbsp;&nbsp;Others, Specify:</strong><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${this.getValue(formData, 'others_equipment')}
          </td>
          <td colspan="3">
            <strong>*Audio-Visual Requirements</strong><br/><br/>
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 58%;">
                ${this.getCheckboxState(formData, 'av_microphones', 'yes')} Microphones: ${this.getValue(formData, 'microphones_count')} pcs<br/>
                ${this.getCheckboxState(formData, 'av_mic_stands', 'yes')} Microphone Stands: ${this.getValue(formData, 'mic_stands_count')} pcs<br/>
                ${this.getCheckboxState(formData, 'av_projector', 'yes')} Projector<br/>
                ${this.getCheckboxState(formData, 'av_pa_system', 'yes')} PA System
              </div>
              <div style="width: 40%;">
                ${this.getCheckboxState(formData, 'av_wifi', 'yes')} WiFi Connection<br/>
                ${this.getCheckboxState(formData, 'av_podium_monitor', 'yes')} Podium Monitor Board<br/>
                ${this.getCheckboxState(formData, 'av_live_streaming', 'yes')} Live Streaming<br/>
                ${this.getCheckboxState(formData, 'av_other', 'yes')} Other AV needs:<br/>
                ${this.getValue(formData, 'av_other_details')}
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap;">
              <strong>Lights &nbsp;</strong>
              ☐ House Lights / Par Lights &nbsp;
              ☐ Follow Spotlights &nbsp;
              ☐ Stage Lights
            </div>
            ☐ Other AV needs:<br/>
            ${this.getValue(formData, 'others_AV')}<br/><br/>
            <div style="display: flex; justify-content: space-between;">
              <div style="text-align: center; width: 50%;">
                <strong>*Maintenance Operation Unit:</strong><br/>
                <div class="signature-line"></div>
                <strong>(Name | Signature | Date)</strong>
              </div>
              <div style="text-align: center; width: 50%;">
                <strong>*Media Center:</strong><br/>
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
   * @returns {string} - HTML content
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
   * Create cancellation policy section
   * @returns {string} - Cancellation policy section HTML
   */
  createCancellationPolicySection() {
    return `
      <table>
        <tr>
          <td>
            If the activity will be cancelled, the client must inform the UC *Campus Management Office at least three (3) days before the scheduled date of activity.<br/>
            (Note: All activities are generally cancelled whenever the school is closed caused by inclement weather.)
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Create billing section
   * @param {Object} formData - Form data
   * @returns {string} - Billing section HTML
   */
  createBillingSection(formData) {
    return `
      <table class="outer-border">
        <tr>
          <td colspan="3"><strong>Billing Particulars</strong></td>
        </tr>
        <tr>
          <td colspan="1">
            Use of ${this.getValue(formData, 'billing_use')}<br/>
            Other Fees: ${this.getValue(formData, 'billing_other1')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${this.getValue(formData, 'billing_other2')}<br/><br/>
            Full Payment<br/><br/>
            Less Deposit/Payment<br/><br/>
            Balance<br/><br/>
            Additional
          </td>
          <td colspan="1">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_use')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_fees1')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_fees2')}<br/><br/>
            <strong>TOTAL</strong>&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_full')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_less')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_bal')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PhP ${this.getValue(formData, 'php_additional')}
          </td>
          <td colspan="1">
            <br/><br/><br/><br/><br/><br/>
            <strong>TOTAL</strong>&nbsp;&nbsp;O.R. # ${this.getValue(formData, 'OR_full')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O.R. # ${this.getValue(formData, 'OR_less')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O.R. # ${this.getValue(formData, 'OR_bal')}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O.R. # ${this.getValue(formData, 'OR_additional')}
          </td>
        </tr>
      </table>
    `;
  }









  /**
   * Create approval section
   * @param {Object} formData - Form data
   * @returns {string} - Approval section HTML
   */
  createApprovalSection(formData) {
    return `
      <table style="width: 100%; table-layout: fixed;">
        <colgroup>
          <col style="width: 33%;" />
          <col style="width: 33%;" />
          <col style="width: 34%;" />
        </colgroup>
        <tr>
          <td style="background-color: #918f8f;">
            <strong>Concurred with</strong>
          </td>
          <td style="background-color: #918f8f;">
            <strong>Venue Reserved by</strong>
          </td>
          <td style="background-color: #918f8f;">
            <strong>*Approved by</strong>
          </td>
        </tr>
        <tr>
          <td><br/><br/></td>
          <td><br/><br/></td>
          <td><br/><br/></td>
        </tr>
        <tr>
          <td style="text-align: center;">
            <strong>Contact Person</strong>
          </td>
          <td style="text-align: center;">
            <strong>Director, *Campus Management Office</strong>
          </td>
          <td style="text-align: center;">
            <strong>VP for Administration & Student Services</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center;">
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center;">
            <strong>(Name | Signature | Date)</strong>
          </td>
          <td style="text-align: center;">
            <strong>(Name | Signature | Date)</strong>
          </td>
        </tr>
      </table>
    `;
  }
}

module.exports = ExternalClientPDFFormat;
