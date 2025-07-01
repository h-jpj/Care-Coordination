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

Once connected to MariaDB, run the following SQL commands:

```sql
-- Create the database (if not already created)
CREATE DATABASE IF NOT EXISTS care_coordination;
USE care_coordination;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'coordinator', 'supervisor', 'ground_worker', 'office_worker') NOT NULL,
  employment_type ENUM('full_time', 'part_time', 'contract', 'volunteer') NOT NULL,
  start_date DATE NOT NULL,
  contract_hours_per_week DECIMAL(5,2),
  hourly_rate DECIMAL(8,2),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  transport_type ENUM('walking', 'bicycle', 'car', 'public_transport', 'other'),
  availability TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  sex ENUM('male', 'female', 'other', 'prefer_not_to_say') NOT NULL,
  nhs_number VARCHAR(20),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  medical_conditions TEXT,
  allergies TEXT,
  mobility_level VARCHAR(50),
  cognitive_status VARCHAR(50),
  communication_needs TEXT,
  preferred_language VARCHAR(50),
  dietary_requirements TEXT,
  fall_risk BOOLEAN DEFAULT FALSE,
  service_start_date DATE,
  funding_source VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create medications table
CREATE TABLE medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  time_of_day VARCHAR(100),
  with_food BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create client_tasks table
CREATE TABLE client_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency ENUM('daily', 'weekly', 'monthly', 'as_needed') NOT NULL,
  estimated_duration INT, -- in minutes
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  requires_training BOOLEAN DEFAULT FALSE,
  special_equipment TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

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
