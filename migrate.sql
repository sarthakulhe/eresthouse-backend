-- eRestHouse Database Migration
-- MySQL Database Schema for Resthouse Booking System

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS charges;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS resthouses;

-- Create resthouses table
CREATE TABLE resthouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','user') NOT NULL DEFAULT 'user',
    status ENUM('active','paused') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resthouse_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available','booked','maintenance') NOT NULL DEFAULT 'available',
    FOREIGN KEY (resthouse_id) REFERENCES resthouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(20) NOT NULL UNIQUE,
    booking_type ENUM('online','offline') NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    designation VARCHAR(100),
    guest_type ENUM('ZP Officer','Press','GovtDeptBed','GovtDeptNoBed') NOT NULL,
    resthouse_id INT NOT NULL,
    room_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    total_days INT NOT NULL,
    total_guests INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('Cash','Online') NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    documents TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resthouse_id) REFERENCES resthouses(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create charges table
CREATE TABLE charges (
    resthouse_id INT NOT NULL,
    guest_type ENUM('ZP Officer','Press','GovtDeptBed','GovtDeptNoBed') NOT NULL,
    with_bed BOOLEAN NOT NULL,
    charge DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (resthouse_id, guest_type, with_bed),
    FOREIGN KEY (resthouse_id) REFERENCES resthouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create messages table for admin notifications
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create settings table for global flags
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default value for maintenance_mode
INSERT INTO settings (`key`, `value`) VALUES ('maintenance_mode', 'off')
    ON DUPLICATE KEY UPDATE `value` = `value`;

-- Insert default value for show_document_column
INSERT INTO settings (`key`, `value`) VALUES ('show_document_column', 'on')
    ON DUPLICATE KEY UPDATE `value` = `value`;

-- Create indexes for better performance
CREATE INDEX idx_rooms_resthouse ON rooms(resthouse_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_bookings_resthouse ON bookings(resthouse_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_dates ON bookings(checkin_date, checkout_date);
CREATE INDEX idx_bookings_guest_type ON bookings(guest_type);
CREATE INDEX idx_charges_resthouse ON charges(resthouse_id);

-- Insert seed data

-- Insert resthouses
INSERT INTO resthouses (name) VALUES
('Chikaldara'),
('Amravati'),
('Daryapur'),
('Bahiram');

-- Insert users (hard-coded for login)
INSERT INTO users (username, password_hash) VALUES
('admin', '$2b$10$hashedpassword'),
('operator', '$2b$10$hashedpassword');

-- Insert rooms
-- Chikaldara: 3 VIP Rooms
INSERT INTO rooms (resthouse_id, name, type, capacity, status) VALUES
(1, 'VIP Room 1', 'VIP', 2, 'available'),
(1, 'VIP Room 2', 'VIP', 2, 'available'),
(1, 'VIP Room 3', 'VIP', 2, 'available');

-- Amravati: 4 VIP Rooms, 10 Regular Rooms
INSERT INTO rooms (resthouse_id, name, type, capacity, status) VALUES
(2, 'VIP Room 1', 'VIP', 2, 'available'),
(2, 'VIP Room 2', 'VIP', 2, 'available'),
(2, 'VIP Room 3', 'VIP', 2, 'available'),
(2, 'VIP Room 4', 'VIP', 2, 'available'),
(2, 'Room 1', 'Regular', 2, 'available'),
(2, 'Room 2', 'Regular', 2, 'available'),
(2, 'Room 3', 'Regular', 2, 'available'),
(2, 'Room 4', 'Regular', 2, 'available'),
(2, 'Room 5', 'Regular', 2, 'available'),
(2, 'Room 6', 'Regular', 2, 'available'),
(2, 'Room 7', 'Regular', 2, 'available'),
(2, 'Room 8', 'Regular', 2, 'available'),
(2, 'Room 9', 'Regular', 2, 'available'),
(2, 'Room 10', 'Regular', 2, 'available');

-- Daryapur: 4 VIP Rooms
INSERT INTO rooms (resthouse_id, name, type, capacity, status) VALUES
(3, 'VIP Room 1', 'VIP', 2, 'available'),
(3, 'VIP Room 2', 'VIP', 2, 'available'),
(3, 'VIP Room 3', 'VIP', 2, 'available'),
(3, 'VIP Room 4', 'VIP', 2, 'available');

-- Bahiram: 8 VIP Rooms
INSERT INTO rooms (resthouse_id, name, type, capacity, status) VALUES
(4, 'VIP Room 1', 'VIP', 2, 'available'),
(4, 'VIP Room 2', 'VIP', 2, 'available'),
(4, 'VIP Room 3', 'VIP', 2, 'available'),
(4, 'VIP Room 4', 'VIP', 2, 'available'),
(4, 'VIP Room 5', 'VIP', 2, 'available'),
(4, 'VIP Room 6', 'VIP', 2, 'available'),
(4, 'VIP Room 7', 'VIP', 2, 'available'),
(4, 'VIP Room 8', 'VIP', 2, 'available');

-- Insert charges (pricing matrix)
-- Amravati & Chikaldara
INSERT INTO charges (resthouse_id, guest_type, with_bed, charge) VALUES
(1, 'ZP Officer', TRUE, 300.00),
(1, 'Press', TRUE, 500.00),
(1, 'GovtDeptBed', TRUE, 1000.00),
(1, 'GovtDeptNoBed', FALSE, 1500.00),
(2, 'ZP Officer', TRUE, 300.00),
(2, 'Press', TRUE, 500.00),
(2, 'GovtDeptBed', TRUE, 1000.00),
(2, 'GovtDeptNoBed', FALSE, 1500.00);

-- Daryapur & Bahiram
INSERT INTO charges (resthouse_id, guest_type, with_bed, charge) VALUES
(3, 'ZP Officer', TRUE, 200.00),
(3, 'Press', TRUE, 400.00),
(3, 'GovtDeptBed', TRUE, 800.00),
(3, 'GovtDeptNoBed', FALSE, 1200.00),
(4, 'ZP Officer', TRUE, 200.00),
(4, 'Press', TRUE, 400.00),
(4, 'GovtDeptBed', TRUE, 800.00),
(4, 'GovtDeptNoBed', FALSE, 1200.00);

-- Insert sample bookings with correct room_id/resthouse_id pairs
INSERT INTO bookings (
  booking_id, booking_type, guest_name, phone, designation, guest_type,
  resthouse_id, room_id, checkin_date, checkout_date, total_days, total_guests, amount, payment_mode, operator_name
) VALUES
  ('RB-00001', 'online', 'Pratik', '4545454545', 'Student', 'ZP Officer', 1, 1, '2025-07-03', '2025-07-05', 2, 1, 600.00, 'Cash', 'admin'),
  ('RB-00002', 'offline', 'Umesh Ulhe', '7588318147', 'Auditor', 'ZP Officer', 3, 19, '2025-07-06', '2025-07-08', 2, 2, 400.00, 'Cash', 'admin'),
  ('RB-00003', 'online', 'Sarthak Ulhe', '8666998525', 'Developer', 'ZP Officer', 1, 1, '2025-07-10', '2025-07-12', 2, 1, 600.00, 'Online', 'admin'),
  -- Corrected: Bahiram, VIP Room 3 (room_id 24)
  ('RB-00004', 'offline', 'Rahul Mishra', '4566544562', 'Faltu', 'GovtDeptNoBed', 4, 24, '2025-07-26', '2025-07-30', 4, 3, 4800.00, 'Cash', 'admin'); 