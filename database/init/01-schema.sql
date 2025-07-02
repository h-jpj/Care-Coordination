-- Care Coordination Database Schema
-- This file creates all the necessary tables for the care coordination system

USE care_coordination;

-- Users table (workers and office staff)
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  employee_id varchar(50) NOT NULL,
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role enum('admin','coordinator','supervisor','ground_worker','office_worker') NOT NULL,
  employment_type enum('full_time','part_time','contract','volunteer') NOT NULL,
  start_date date NOT NULL,
  contract_hours_per_week decimal(5,2) DEFAULT NULL,
  hourly_rate decimal(8,2) DEFAULT NULL,
  phone varchar(20) DEFAULT NULL,
  mobile varchar(20) DEFAULT NULL,
  address_line1 varchar(255) DEFAULT NULL,
  address_line2 varchar(255) DEFAULT NULL,
  city varchar(100) DEFAULT NULL,
  postal_code varchar(20) DEFAULT NULL,
  emergency_contact_name varchar(255) DEFAULT NULL,
  emergency_contact_phone varchar(20) DEFAULT NULL,
  transport_type enum('walking','bicycle','car','public_transport','other') DEFAULT NULL,
  has_own_transport tinyint(1) DEFAULT 0,
  availability text DEFAULT NULL,
  is_active tinyint(1) DEFAULT 1,
  last_login timestamp NULL DEFAULT NULL,
  created_at timestamp DEFAULT current_timestamp(),
  updated_at timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY employee_id (employee_id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Worker availability table
CREATE TABLE IF NOT EXISTS worker_availability (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  day_of_week enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available tinyint(1) DEFAULT 1,
  created_at timestamp DEFAULT current_timestamp(),
  updated_at timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_worker_availability_user (user_id),
  CONSTRAINT fk_worker_availability_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_day (user_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id int(11) NOT NULL AUTO_INCREMENT,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  preferred_name varchar(100) DEFAULT NULL,
  date_of_birth date NOT NULL,
  sex enum('male','female','other','prefer_not_to_say') NOT NULL,
  nhs_number varchar(20) DEFAULT NULL,
  phone varchar(20) DEFAULT NULL,
  mobile varchar(20) DEFAULT NULL,
  address_line1 varchar(255) DEFAULT NULL,
  address_line2 varchar(255) DEFAULT NULL,
  city varchar(100) DEFAULT NULL,
  postal_code varchar(20) DEFAULT NULL,
  medical_conditions text DEFAULT NULL,
  allergies text DEFAULT NULL,
  mobility_level enum('independent','walking_aid','wheelchair','bed_bound') DEFAULT 'independent',
  cognitive_status enum('alert','mild_impairment','moderate_impairment','severe_impairment') DEFAULT 'alert',
  fall_risk enum('low','medium','high') DEFAULT 'low',
  preferred_language varchar(50) DEFAULT 'English',
  communication_needs text DEFAULT NULL,
  dietary_requirements text DEFAULT NULL,
  service_start_date date DEFAULT NULL,
  funding_source enum('private','local_authority','nhs','insurance','mixed') DEFAULT NULL,
  primary_contact_name varchar(100) DEFAULT NULL,
  primary_contact_phone varchar(20) DEFAULT NULL,
  primary_contact_relationship varchar(50) DEFAULT NULL,
  gp_name varchar(100) DEFAULT NULL,
  gp_phone varchar(20) DEFAULT NULL,
  gp_email varchar(100) DEFAULT NULL,
  is_active tinyint(1) DEFAULT 1,
  created_at timestamp DEFAULT current_timestamp(),
  updated_at timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_clients_name (first_name, last_name),
  KEY idx_clients_nhs (nhs_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client medications table
CREATE TABLE IF NOT EXISTS client_medications (
  id int(11) NOT NULL AUTO_INCREMENT,
  client_id int(11) NOT NULL,
  medication_name varchar(255) NOT NULL,
  dosage varchar(100) NOT NULL,
  frequency varchar(100) NOT NULL,
  time_of_day varchar(100) DEFAULT NULL,
  with_food enum('yes','no','either') DEFAULT 'either',
  special_instructions text DEFAULT NULL,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  is_active tinyint(1) DEFAULT 1,
  created_at timestamp DEFAULT current_timestamp(),
  updated_at timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_client_medications_client (client_id),
  CONSTRAINT fk_client_medications_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client tasks table
CREATE TABLE IF NOT EXISTS client_tasks (
  id int(11) NOT NULL AUTO_INCREMENT,
  client_id int(11) NOT NULL,
  task_name varchar(255) NOT NULL,
  description text DEFAULT NULL,
  frequency enum('daily','weekly','monthly','as_needed') DEFAULT 'daily',
  estimated_duration int(11) DEFAULT NULL COMMENT 'Duration in minutes',
  priority enum('low','medium','high','urgent') DEFAULT 'medium',
  category enum('personal_care','medication','household','social','medical','other') DEFAULT 'other',
  is_active tinyint(1) DEFAULT 1,
  created_at timestamp DEFAULT current_timestamp(),
  updated_at timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_client_tasks_client (client_id),
  CONSTRAINT fk_client_tasks_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
