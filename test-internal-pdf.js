const InternalClientPDFFormat = require('./services/pdf-formats/internalClientPDFFormat');

// Test data that matches the new form structure
const testFormData = {
  // Basic information
  organization_name: 'College of Computer Studies',
  contact: 'test@uc-bcf.edu.ph / 09123456789',
  event_name: 'Programming Competition 2025',
  venue: 'Auditorium',
  attendees: '150',
  event_date: '2025-02-15',
  time_start: '08:00',
  time_end: '17:00',
  budget_source: 'College Budget',
  admission_fee: 'free',
  other_fees: 'Registration fee: PHP 100',
  audience_type: 'exclusive',
  food_service: 'yes',

  // Audio-Visual Requirements
  mic_checkbox: 'Microphones',
  mic_stands_checkbox: 'Mic_Stands',
  projector_checkbox: 'Projector',
  pa_system_checkbox: 'PA_System',
  laptop_checkbox: 'Laptop',
  lights_checkbox: 'Lights',
  wifi_checkbox: 'WiFi_Connection',
  podium_checkbox: 'Podium_Monitor',
  stream_checkbox: 'Live_Streaming',
  others_AV: 'Additional speakers for outdoor setup',

  // Services
  medical_team: 'yes',
  security_guards: 'yes',
  air_cooler: 'yes',
  long_tables: 'yes',
  long_tables_count: '10',
  flags: 'yes'
};

// Test the PDF format
const pdfFormat = new InternalClientPDFFormat();
const controlNo = 'IC-202501-0001';

console.log('Testing Internal Client PDF Format...');
console.log('Control Number:', controlNo);
console.log('Form Data:', JSON.stringify(testFormData, null, 2));

try {
  const htmlContent = pdfFormat.generateHTML(testFormData, controlNo);
  
  console.log('\n=== PDF HTML Content Generated Successfully ===');
  console.log('HTML Length:', htmlContent.length, 'characters');
  
  // Check if key fields are present in the HTML
  const fieldsToCheck = [
    'College of Computer Studies',
    'Programming Competition 2025',
    'Auditorium',
    '150',
    '2025-02-15',
    '08:00',
    '17:00',
    'College Budget',
    'Additional speakers for outdoor setup',
    'IC-202501-0001'
  ];
  
  console.log('\n=== Field Verification ===');
  fieldsToCheck.forEach(field => {
    const found = htmlContent.includes(field);
    console.log(`${found ? '✓' : '✗'} ${field}: ${found ? 'Found' : 'NOT FOUND'}`);
  });
  
  // Check for checkbox symbols
  const checkboxSymbols = htmlContent.match(/[☑☐]/g);
  console.log(`\n=== Checkbox Symbols ===`);
  console.log(`Found ${checkboxSymbols ? checkboxSymbols.length : 0} checkbox symbols`);
  
  console.log('\n=== Test Completed Successfully ===');
  
} catch (error) {
  console.error('Error testing PDF format:', error);
  console.error('Stack trace:', error.stack);
}
