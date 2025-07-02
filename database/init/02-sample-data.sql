-- Sample data for Care Coordination System
-- This creates demo users, clients, and related data for testing

USE care_coordination;

-- Sample Users (Workers and Office Staff)
INSERT INTO users (
  employee_id, email, password_hash, first_name, last_name, role, employment_type, 
  start_date, contract_hours_per_week, hourly_rate, phone, mobile, 
  address_line1, city, postal_code, emergency_contact_name, emergency_contact_phone,
  transport_type, availability
) VALUES 
-- Office Workers
('EMP001', 'admin@carecompany.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Sarah', 'Johnson', 'admin', 'full_time', '2023-01-15', 40.00, 25.00, '01234567890', '07123456789', '123 Admin Street', 'London', 'SW1A 1AA', 'John Johnson', '07987654321', 'car', '{"monday":{"available":true,"start_time":"09:00","end_time":"17:00"},"tuesday":{"available":true,"start_time":"09:00","end_time":"17:00"},"wednesday":{"available":true,"start_time":"09:00","end_time":"17:00"},"thursday":{"available":true,"start_time":"09:00","end_time":"17:00"},"friday":{"available":true,"start_time":"09:00","end_time":"17:00"},"saturday":{"available":false,"start_time":"09:00","end_time":"17:00"},"sunday":{"available":false,"start_time":"09:00","end_time":"17:00"}}'),

('EMP002', 'coordinator@carecompany.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Michael', 'Smith', 'coordinator', 'full_time', '2023-02-01', 37.50, 22.00, '01234567891', '07123456790', '456 Coordinator Ave', 'Manchester', 'M1 1AA', 'Emma Smith', '07987654322', 'public_transport', '{"monday":{"available":true,"start_time":"08:30","end_time":"16:30"},"tuesday":{"available":true,"start_time":"08:30","end_time":"16:30"},"wednesday":{"available":true,"start_time":"08:30","end_time":"16:30"},"thursday":{"available":true,"start_time":"08:30","end_time":"16:30"},"friday":{"available":true,"start_time":"08:30","end_time":"16:30"},"saturday":{"available":false,"start_time":"09:00","end_time":"17:00"},"sunday":{"available":false,"start_time":"09:00","end_time":"17:00"}}'),

-- Ground Workers
('EMP003', 'worker1@carecompany.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Emily', 'Davis', 'ground_worker', 'full_time', '2023-03-01', 40.00, 18.50, '01234567892', '07123456791', '789 Worker Road', 'Birmingham', 'B1 1AA', 'David Davis', '07987654323', 'car', '{"monday":{"available":true,"start_time":"07:00","end_time":"15:00"},"tuesday":{"available":true,"start_time":"07:00","end_time":"15:00"},"wednesday":{"available":true,"start_time":"07:00","end_time":"15:00"},"thursday":{"available":true,"start_time":"07:00","end_time":"15:00"},"friday":{"available":true,"start_time":"07:00","end_time":"15:00"},"saturday":{"available":true,"start_time":"08:00","end_time":"14:00"},"sunday":{"available":false,"start_time":"09:00","end_time":"17:00"}}'),

('EMP004', 'worker2@carecompany.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'James', 'Wilson', 'ground_worker', 'part_time', '2023-04-15', 25.00, 17.75, '01234567893', '07123456792', '321 Care Lane', 'Leeds', 'LS1 1AA', 'Lisa Wilson', '07987654324', 'bicycle', '{"monday":{"available":false,"start_time":"09:00","end_time":"17:00"},"tuesday":{"available":true,"start_time":"14:00","end_time":"20:00"},"wednesday":{"available":true,"start_time":"14:00","end_time":"20:00"},"thursday":{"available":true,"start_time":"14:00","end_time":"20:00"},"friday":{"available":true,"start_time":"14:00","end_time":"20:00"},"saturday":{"available":true,"start_time":"09:00","end_time":"17:00"},"sunday":{"available":true,"start_time":"09:00","end_time":"17:00"}}'),

('EMP005', 'worker3@carecompany.com', '$2b$10$rQZ9vKzqzQzqzQzqzQzqzOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Sophie', 'Brown', 'ground_worker', 'full_time', '2023-05-01', 40.00, 19.25, '01234567894', '07123456793', '654 Helper Street', 'Liverpool', 'L1 1AA', 'Mark Brown', '07987654325', 'walking', '{"monday":{"available":true,"start_time":"06:00","end_time":"14:00"},"tuesday":{"available":true,"start_time":"06:00","end_time":"14:00"},"wednesday":{"available":true,"start_time":"06:00","end_time":"14:00"},"thursday":{"available":true,"start_time":"06:00","end_time":"14:00"},"friday":{"available":true,"start_time":"06:00","end_time":"14:00"},"saturday":{"available":false,"start_time":"09:00","end_time":"17:00"},"sunday":{"available":false,"start_time":"09:00","end_time":"17:00"}}');

-- Sample Clients
INSERT INTO clients (
  first_name, last_name, preferred_name, date_of_birth, sex, nhs_number, 
  phone, mobile, address_line1, address_line2, city, postal_code,
  medical_conditions, allergies, mobility_level, cognitive_status, fall_risk,
  preferred_language, communication_needs, dietary_requirements,
  service_start_date, funding_source, primary_contact_name, primary_contact_phone,
  primary_contact_relationship, gp_name, gp_phone, gp_email
) VALUES 
('Margaret', 'Thompson', 'Maggie', '1935-06-15', 'female', 'NHS1234567890', '01234567800', '07123456700', '12 Elderly Care Road', 'Flat 2A', 'London', 'SW2 1BB', 'Diabetes Type 2, Arthritis', 'Penicillin', 'walking_aid', 'alert', 'medium', 'English', 'Hearing aid required', 'Diabetic diet, low sodium', '2023-01-20', 'local_authority', 'Susan Thompson', '07987654300', 'Daughter', 'Dr. Smith', '01234567801', 'dr.smith@nhs.uk'),

('Robert', 'Williams', 'Bob', '1940-03-22', 'male', 'NHS2345678901', '01234567802', NULL, '45 Senior Street', NULL, 'Manchester', 'M2 2CC', 'Heart condition, High blood pressure', 'None known', 'independent', 'mild_impairment', 'low', 'English', 'Large print materials', 'Heart-healthy diet', '2023-02-15', 'private', 'Mary Williams', '07987654301', 'Wife', 'Dr. Jones', '01234567803', 'dr.jones@nhs.uk'),

('Dorothy', 'Evans', 'Dot', '1938-11-08', 'female', 'NHS3456789012', '01234567804', '07123456701', '78 Retirement Avenue', 'Ground Floor', 'Birmingham', 'B3 3DD', 'Dementia (early stage), Osteoporosis', 'Shellfish', 'wheelchair', 'moderate_impairment', 'high', 'English', 'Simple language, visual cues helpful', 'Soft foods, no shellfish', '2023-03-10', 'nhs', 'Peter Evans', '07987654302', 'Son', 'Dr. Brown', '01234567805', 'dr.brown@nhs.uk');

-- Sample Medications
INSERT INTO client_medications (
  client_id, medication_name, dosage, frequency, time_of_day, with_food, special_instructions
) VALUES 
(1, 'Metformin', '500mg', 'Twice daily', 'Morning and Evening', 'yes', 'Take with breakfast and dinner'),
(1, 'Ibuprofen', '200mg', 'As needed', 'As required', 'yes', 'For arthritis pain, maximum 3 times daily'),
(2, 'Lisinopril', '10mg', 'Once daily', 'Morning', 'either', 'For blood pressure'),
(2, 'Aspirin', '75mg', 'Once daily', 'Morning', 'yes', 'Blood thinner - take with food'),
(3, 'Donepezil', '5mg', 'Once daily', 'Evening', 'either', 'For dementia - take at bedtime'),
(3, 'Calcium + Vitamin D', '1 tablet', 'Once daily', 'Morning', 'yes', 'For bone health');

-- Sample Tasks
INSERT INTO client_tasks (
  client_id, task_name, description, frequency, estimated_duration, priority, category
) VALUES 
-- Tasks for Margaret Thompson
(1, 'Morning medication', 'Administer morning medications with breakfast', 'daily', 10, 'high', 'medication'),
(1, 'Blood sugar check', 'Check blood glucose levels', 'daily', 5, 'high', 'medical'),
(1, 'Personal hygiene assistance', 'Help with washing and dressing', 'daily', 30, 'high', 'personal_care'),
(1, 'Light housekeeping', 'Tidy living areas, wash dishes', 'daily', 20, 'medium', 'household'),
(1, 'Social interaction', 'Chat and provide companionship', 'daily', 15, 'medium', 'social'),

-- Tasks for Robert Williams  
(2, 'Evening medication', 'Administer evening medications', 'daily', 10, 'high', 'medication'),
(2, 'Blood pressure check', 'Monitor blood pressure', 'daily', 5, 'high', 'medical'),
(2, 'Meal preparation', 'Prepare heart-healthy meals', 'daily', 45, 'high', 'household'),
(2, 'Light exercise', 'Gentle walking or stretching', 'daily', 20, 'medium', 'personal_care'),

-- Tasks for Dorothy Evans
(3, 'Medication supervision', 'Supervise all medication taking', 'daily', 15, 'high', 'medication'),
(3, 'Personal care assistance', 'Full assistance with personal hygiene', 'daily', 45, 'high', 'personal_care'),
(3, 'Meal assistance', 'Help with eating soft foods', 'daily', 30, 'high', 'personal_care'),
(3, 'Safety check', 'Ensure safe environment, fall prevention', 'daily', 10, 'high', 'other'),
(3, 'Cognitive stimulation', 'Simple activities to maintain cognitive function', 'daily', 20, 'medium', 'social');
