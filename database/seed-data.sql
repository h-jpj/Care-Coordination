-- Care Coordination System - Real Data Seed
-- This includes all the workers and clients that have been added to the system

-- Insert real workers that have been created
INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role, employment_type, start_date, contract_hours_per_week, hourly_rate, phone, mobile, address_line1, address_line2, city, postal_code, transport_type, availability, is_active, created_at) VALUES 

-- Admin user
('EMP001', 'admin@carecompany.com', '$2b$10$rQZ9vZ9Z9Z9Z9Z9Z9Z9Z9O', 'Admin', 'User', 'admin', 'full_time', '2024-01-01', 40.00, 25.00, '01234567890', '', '', '', '', '', '', '', TRUE, NOW()),

-- Real workers that were added
('EMP002', 'jay@gmail.com', '$2b$10$rQZ9vZ9Z9Z9Z9Z9Z9Z9Z9O', 'Jay', 'Jones', 'ground_worker', 'full_time', '2020-01-01', 37.5, 12.50, '0777555897', '', '123 Street', '', 'Hull', 'hu1 1as', '', '', TRUE, NOW()),

('EMP003', 'bricker@gmail.com', '$2b$10$rQZ9vZ9Z9Z9Z9Z9Z9Z9Z9O', 'Betty', 'Bricks', 'ground_worker', 'full_time', '2023-01-01', 30.0, 11.50, '07778999999', '', 'The Grove', '', 'Hull', 'hu1 6ty', '', '', TRUE, NOW());

-- Insert real clients that have been created
INSERT INTO clients (first_name, last_name, preferred_name, date_of_birth, sex, nhs_number, phone, mobile, address_line1, address_line2, city, postal_code, medical_conditions, allergies, mobility_level, cognitive_status, communication_needs, preferred_language, dietary_requirements, fall_risk, service_start_date, funding_source, is_active, created_at) VALUES 

-- Real clients that were added
('James', 'Freeman', 'Nonce', '1998-04-01', 'prefer_not_to_say', '1892498374912', 'n/a', '07794587822', 'Prison', '', 'Hull', 'hu10ql', 'Nonce and Stalker', 'Harvey', 'bed_bound', 'moderate_impairment', 'Text to speech', 'English', 'Just no food at all.', FALSE, '2025-01-01', 'private', TRUE, NOW()),

('Jessica', 'Jones', 'Jess', '1945-01-01', 'prefer_not_to_say', '123123123123', 'n/a', '07778555342', '123 Street', '', 'Hull', 'hu1 4gs', 'Epilepsy', 'n/a', 'independent', 'alert', 'n/a', 'English', 'Vegan', FALSE, '2020-01-01', 'private', TRUE, NOW());

-- Add some sample medications for the clients
INSERT INTO medications (client_id, medication_name, dosage, frequency, time_of_day, with_food, special_instructions, start_date, end_date, is_active, created_at) VALUES 
(1, 'Epilepsy Medication', '200mg', 'twice daily', 'morning,evening', TRUE, 'Take with food to avoid stomach upset', '2025-01-01', NULL, TRUE, NOW()),
(2, 'Vitamin D', '1000IU', 'daily', 'morning', FALSE, 'Can be taken on empty stomach', '2020-01-01', NULL, TRUE, NOW());

-- Add some sample care tasks for the clients
INSERT INTO client_tasks (client_id, task_name, description, frequency, estimated_duration, priority, requires_training, special_equipment, notes, is_active, created_at) VALUES 
(1, 'Personal Care', 'Assistance with washing and dressing', 'daily', 30, 'high', FALSE, 'None', 'Client prefers morning routine', TRUE, NOW()),
(1, 'Meal Preparation', 'Prepare nutritious meals', 'daily', 45, 'high', FALSE, 'Kitchen equipment', 'No food restrictions noted', TRUE, NOW()),
(2, 'Medication Reminder', 'Ensure medication is taken on time', 'daily', 10, 'urgent', FALSE, 'Pill organizer', 'Very important for epilepsy management', TRUE, NOW()),
(2, 'Light Housekeeping', 'Basic cleaning and tidying', 'weekly', 60, 'medium', FALSE, 'Cleaning supplies', 'Focus on kitchen and bathroom', TRUE, NOW()),
(2, 'Companionship', 'Social interaction and conversation', 'daily', 30, 'medium', FALSE, 'None', 'Client enjoys discussing current events', TRUE, NOW());
