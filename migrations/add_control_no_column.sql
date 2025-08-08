-- Migration to add control_no column to student_activity_requests table
USE uc_fmo_db;

-- Add control_no column if it doesn't exist
ALTER TABLE student_activity_requests 
ADD COLUMN IF NOT EXISTS control_no VARCHAR(50) AFTER pdf_url;

-- Verify the column was added
DESCRIBE student_activity_requests;
