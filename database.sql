-- Create database
CREATE DATABASE IF NOT EXISTS uc_fmo_db;
USE uc_fmo_db;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('master-admin', 'citcs-admin', 'coa-admin', 'cas-admin', 'cba-admin', 'cea-admin', 'cht-admin', 'con-admin', 'cte-admin', 'student', 'external') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT,
    location VARCHAR(100) NOT NULL,
    campus VARCHAR(50) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    facility_id INT,
    user_id INT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_activity_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reservation_type ENUM('campus', 'internal', 'external') NOT NULL,
    pdf_url VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    rejection_notes TEXT,
    version INT DEFAULT 1,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reservation Calendar Table for tracking date selections and availability
CREATE TABLE IF NOT EXISTS reservation_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    time_start TIME,
    time_end TIME,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    form_type ENUM('campus', 'internal', 'external') NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    venue VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_reservation_date (reservation_date),
    INDEX idx_user_date (user_id, reservation_date),
    INDEX idx_venue_date (venue, reservation_date)
);

-- Add venue column to existing reservation_calendar table if it doesn't exist
ALTER TABLE reservation_calendar
ADD COLUMN IF NOT EXISTS venue VARCHAR(100) AFTER location,
DROP INDEX IF EXISTS unique_user_date,
ADD INDEX IF NOT EXISTS idx_venue_date (venue, reservation_date);

-- Update existing users table to include new admin roles
ALTER TABLE users MODIFY COLUMN role ENUM('master-admin', 'citcs-admin', 'coa-admin', 'cas-admin', 'cba-admin', 'cea-admin', 'cht-admin', 'con-admin', 'cte-admin', 'student', 'external') NOT NULL;