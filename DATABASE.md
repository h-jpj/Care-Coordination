# Database Setup Guide

This guide covers the complete setup of the MariaDB database for the Care Coordination application.

## Prerequisites

- Docker and Docker Compose installed
- SSH access to the deployment server (if deploying remotely)
- Basic knowledge of SQL commands

## Database Overview

The application uses **MariaDB 10.11** (NOT MySQL) running in a Docker container with the following configuration:

- **Database Name**: `care_coordination`
- **Root Password**: `rootpassword`
- **Application User**: `care_user`
- **Application Password**: `care_password`
- **External Port**: `3307`
- **Internal Port**: `3306`

## Quick Setup (Automated)

If you're using the provided deployment scripts:

```bash
# Deploy the entire application (includes database setup)
./deploy.sh
```

The database will be automatically created and initialized.

## Manual Database Setup

### 1. Start the Database Container

```bash
# Navigate to project directory
cd /path/to/care-app

# Start only the database service
sudo docker-compose up -d database

# Check if the database is healthy
sudo docker-compose ps
```

### 2. Connect to MariaDB

```bash
# Connect as root user
sudo docker exec -it care_coordination_db mysql -u root -p
# Password: rootpassword
```

### 3. Create Database and Tables

**Note**: These SQL commands exactly match the automatic initialization scripts in `database/init/01-schema.sql`. You can copy and paste these directly into MariaDB terminal.

Once connected to MariaDB, run the following SQL commands:

```sql
-- Create the database (if not already created)
CREATE DATABASE IF NOT EXISTS care_coordination;
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

-- Insert default admin user
INSERT INTO users (
  employee_id, email, password_hash, first_name, last_name, 
  role, employment_type, start_date, contract_hours_per_week, 
  hourly_rate, phone, is_active
) VALUES (
  'EMP001', 
  'admin@carecompany.com', 
  '$2b$10$rQZ9vZ9Z9Z9Z9Z9Z9Z9Z9O', -- This is a placeholder hash
  'Admin', 
  'User', 
  'admin', 
  'full_time', 
  '2024-01-01', 
  40.00, 
  25.00, 
  '01234567890', 
  TRUE
);

-- Exit MariaDB
exit
```

### 4. Verify Database Setup

```bash
# Check if tables were created successfully
sudo docker exec -it care_coordination_db mysql -u root -p -e "USE care_coordination; SHOW TABLES;"

# Check if admin user was created
sudo docker exec -it care_coordination_db mysql -u root -p -e "USE care_coordination; SELECT id, email, first_name, last_name, role FROM users;"
```

## Database Connection Details

The backend connects to the database using these environment variables (defined in docker-compose.yml):

```yaml
environment:
  - DB_HOST=database
  - DB_PORT=3306
  - DB_NAME=care_coordination
  - DB_USER=care_user
  - DB_PASSWORD=care_password
```

## Troubleshooting

### Database Connection Issues

1. **Check if container is running:**
   ```bash
   sudo docker ps | grep care_coordination_db
   ```

2. **Check container logs:**
   ```bash
   sudo docker logs care_coordination_db
   ```

3. **Restart database container:**
   ```bash
   sudo docker-compose restart database
   ```

### Permission Issues

If you get permission denied errors:

```bash
# Check if the care_user exists and has proper permissions
sudo docker exec -it care_coordination_db mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='care_user';"

# If user doesn't exist, create it:
sudo docker exec -it care_coordination_db mysql -u root -p -e "CREATE USER 'care_user'@'%' IDENTIFIED BY 'care_password'; GRANT ALL PRIVILEGES ON care_coordination.* TO 'care_user'@'%'; FLUSH PRIVILEGES;"
```

### Data Reset

To completely reset the database:

```bash
# Stop containers
sudo docker-compose down

# Remove database volume (WARNING: This deletes all data!)
sudo docker volume rm care-app_care_db_data

# Restart containers (will recreate empty database)
sudo docker-compose up -d
```

## Important Notes

- **Always use MariaDB terminology** - this is MariaDB, not MySQL
- **Port 3307** is used externally to avoid conflicts with other database instances
- **Backup your data** before making schema changes
- **The default admin password** needs to be changed after first login
- **Database persists** in Docker volume `care_db_data` even when containers are stopped

## Default Login Credentials

After setup, you can log into the application with:
- **Email**: `admin@carecompany.com`
- **Password**: `password123` (change this immediately after first login)

## Schema Updates

When updating the database schema, always:
1. Backup existing data
2. Test changes on a copy first
3. Use proper migration scripts
4. Update this documentation

For any database-related issues, check the backend logs:
```bash
sudo docker logs care_coordination_api
```
