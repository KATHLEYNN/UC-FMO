const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Check current table structure
    console.log('Current table structure:');
    const [columns] = await pool.execute('DESCRIBE student_activity_requests');
    console.table(columns);
    
    // Check if control_no column exists
    const controlNoExists = columns.some(col => col.Field === 'control_no');
    
    if (controlNoExists) {
      console.log('✅ control_no column already exists');
    } else {
      console.log('❌ control_no column missing, adding it...');
      
      // Add the control_no column
      await pool.execute(`
        ALTER TABLE student_activity_requests 
        ADD COLUMN control_no VARCHAR(50) AFTER pdf_url
      `);
      
      console.log('✅ control_no column added successfully');
    }
    
    // Verify the final structure
    console.log('\nFinal table structure:');
    const [finalColumns] = await pool.execute('DESCRIBE student_activity_requests');
    console.table(finalColumns);
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
