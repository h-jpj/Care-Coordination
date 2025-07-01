const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://192.168.0.103:3004',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'care_user',
  password: process.env.DB_PASSWORD || 'care_password123',
  database: process.env.DB_NAME || 'care_coordination',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Password generation utility
function generateSecurePassword(length = 12) {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Exclude l, o
  const numbers = '23456789'; // Exclude 0, 1
  const special = '!@#$%^&*';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(0, 3) - 1).join('');
}

// Hash password utility
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Validate password utility
function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUpper ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLower ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumber ? ['Password must contain at least one number'] : []),
      ...(!hasSpecial ? ['Password must contain at least one special character (!@#$%^&*)'] : [])
    ]
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple Care Coordination API is running' });
});

// Simple login endpoint - hardcoded for now
app.post('/auth/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Hardcoded admin user for testing
    if (email === 'admin@carecompany.com' && password === 'password123') {
      console.log('Admin login successful');

      const token = jwt.sign(
        { userId: 1, email: 'admin@carecompany.com', role: 'admin', mustChangePassword: false },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: 1,
            email: 'admin@carecompany.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false
          }
        }
      });
    }

    // Try database lookup for other users
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (rows.length > 0) {
        const user = rows[0];

        // Accept 'password123' for all users (for demo purposes)
        if (password === 'password123') {
          const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, mustChangePassword: user.must_change_password },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          // Update last login
          await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
          );

          return res.json({
            success: true,
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                mustChangePassword: user.must_change_password
              }
            }
          });
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fall through to invalid credentials
    }

    console.log('Invalid credentials for:', email);
    return res.status(401).json({ success: false, error: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Worker type access control middleware
const requireWorkerType = (allowedWorkerTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Determine worker type from role
    const groundWorkerRoles = ['carer', 'senior_carer', 'trainee'];
    const officeWorkerRoles = ['admin', 'coordinator', 'supervisor'];

    let userWorkerType;
    if (groundWorkerRoles.includes(req.user.role)) {
      userWorkerType = 'ground_worker';
    } else if (officeWorkerRoles.includes(req.user.role)) {
      userWorkerType = 'office_worker';
    } else {
      return res.status(403).json({ success: false, error: 'Invalid user role' });
    }

    if (!allowedWorkerTypes.includes(userWorkerType)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required worker types: ${allowedWorkerTypes.join(', ')}. Your type: ${userWorkerType}`
      });
    }

    req.user.worker_type = userWorkerType;
    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole(['admin']);

// Management roles middleware (admin, coordinator, supervisor)
const requireManagement = requireRole(['admin', 'coordinator', 'supervisor']);

// Office workers only middleware (can access web app)
const requireOfficeWorker = requireWorkerType(['office_worker']);

// Get current user
app.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.userId,
      email: req.user.email,
      firstName: 'Admin',
      lastName: 'User',
      role: req.user.role
    }
  });
});

// Logout endpoint
app.post('/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change password endpoint (for users to change their own password)
app.put('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    // Validate new password
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'New password validation failed',
        details: passwordValidation.errors
      });
    }

    // Get current user
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password and clear must_change_password flag
    await pool.execute(
      'UPDATE users SET password_hash = ?, must_change_password = FALSE WHERE id = ?',
      [newPasswordHash, req.user.userId]
    );

    console.log(`Password changed for user ${req.user.userId} (${req.user.email})`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Reset password endpoint (for admins to reset worker passwords)
app.post('/users/:id/reset-password', authenticateToken, requireManagement, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    // Check if user has permission (only admin, coordinator, supervisor)
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to reset passwords' });
    }

    // Check if target user exists
    const [users] = await pool.execute(
      'SELECT email, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const targetUser = users[0];

    // Generate new password
    const newPassword = generateSecurePassword();
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and set must_change_password flag
    await pool.execute(
      'UPDATE users SET password_hash = ?, must_change_password = TRUE WHERE id = ?',
      [newPasswordHash, targetUserId]
    );

    console.log(`Password reset for user ${targetUserId} (${targetUser.email}) by ${req.user.email}`);

    res.json({
      success: true,
      data: {
        user_id: targetUserId,
        email: targetUser.email,
        name: `${targetUser.first_name} ${targetUser.last_name}`,
        new_password: newPassword
      },
      message: 'Password reset successfully. Please share the new password securely with the user.'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Get all users endpoint
app.get('/users', authenticateToken, requireManagement, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT
        id, employee_id, email, first_name, last_name, role, employment_type,
        start_date, contract_hours_per_week, hourly_rate, phone, is_active,
        address_line1, address_line2, city, postal_code, created_at, last_login
      FROM users
      WHERE is_active = TRUE
      ORDER BY first_name, last_name
    `);

    // Convert null values to empty strings for frontend compatibility
    const sanitizedUsers = users.map(user => ({
      ...user,
      address_line1: user.address_line1 || '',
      address_line2: user.address_line2 || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      phone: user.phone || '',
      mobile: user.mobile || '',
      employee_id: user.employee_id || '',
      transport_type: user.transport_type || '',
      availability: user.availability || ''
    }));

    res.json({
      success: true,
      data: sanitizedUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Update user endpoint
app.put('/users/:id', authenticateToken, requireManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      employment_type,
      start_date,
      hourly_rate,
      contract_hours_per_week,
      address_line1,
      address_line2,
      city,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id, email FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== existingUsers[0].email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (employment_type !== undefined) {
      updateFields.push('employment_type = ?');
      updateValues.push(employment_type);
    }
    if (start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(start_date);
    }
    if (hourly_rate !== undefined) {
      updateFields.push('hourly_rate = ?');
      updateValues.push(hourly_rate);
    }
    if (contract_hours_per_week !== undefined) {
      updateFields.push('contract_hours_per_week = ?');
      updateValues.push(contract_hours_per_week);
    }
    if (address_line1 !== undefined) {
      updateFields.push('address_line1 = ?');
      updateValues.push(address_line1);
    }
    if (address_line2 !== undefined) {
      updateFields.push('address_line2 = ?');
      updateValues.push(address_line2);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (postal_code !== undefined) {
      updateFields.push('postal_code = ?');
      updateValues.push(postal_code);
    }
    if (emergency_contact_name !== undefined) {
      updateFields.push('emergency_contact_name = ?');
      updateValues.push(emergency_contact_name);
    }
    if (emergency_contact_phone !== undefined) {
      updateFields.push('emergency_contact_phone = ?');
      updateValues.push(emergency_contact_phone);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateValues.push(userId);

    // Update the user
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    console.log(`User ${userId} updated by ${req.user.email}`);

    res.json({
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Deactivate user endpoint (soft delete)
app.delete('/users/:id', authenticateToken, requireManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT first_name, last_name, email FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = existingUsers[0];

    // Soft delete (deactivate) the user
    await pool.execute(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [userId]
    );

    console.log(`User ${userId} (${user.email}) deactivated by ${req.user.email}`);

    res.json({
      success: true,
      message: `User ${user.first_name} ${user.last_name} has been deactivated`
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Create new worker endpoint
app.post('/users', authenticateToken, requireManagement, async (req, res) => {
  try {
    console.log('Creating new worker:', req.body);

    // Check if user has permission (only admin, coordinator, supervisor)
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to create workers' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      employee_id,
      worker_type, // 'ground_worker' or 'office_worker'
      role,
      employment_type = 'full_time',
      start_date,
      hourly_rate,
      contract_hours_per_week,
      address_line1,
      address_line2,
      city,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      auto_generate_password = true,
      custom_password,
      send_welcome_email = true
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !worker_type || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: first_name, last_name, email, phone, worker_type, role'
      });
    }

    // Map frontend role values to database ENUM values
    const roleMapping = {
      'carer': 'ground_worker',
      'care_worker': 'ground_worker',
      'ground_worker': 'ground_worker',
      'office_worker': 'office_worker',
      'supervisor': 'supervisor',
      'coordinator': 'coordinator',
      'admin': 'admin'
    };

    const mappedRole = roleMapping[role] || 'ground_worker'; // Default to ground_worker if unknown

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Validate worker type and role combination
    const groundWorkerRoles = ['carer', 'senior_carer', 'trainee'];
    const officeWorkerRoles = ['admin', 'coordinator', 'supervisor'];

    if (worker_type === 'ground_worker' && !groundWorkerRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role for ground worker. Must be: carer, senior_carer, or trainee'
      });
    }

    if (worker_type === 'office_worker' && !officeWorkerRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role for office worker. Must be: admin, coordinator, or supervisor'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Generate or validate password
    let password;
    if (auto_generate_password) {
      password = generateSecurePassword();
    } else {
      if (!custom_password) {
        return res.status(400).json({ success: false, error: 'Custom password is required when auto_generate_password is false' });
      }

      const passwordValidation = validatePassword(custom_password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password validation failed',
          details: passwordValidation.errors
        });
      }
      password = custom_password;
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Generate employee ID if not provided
    const finalEmployeeId = employee_id || `EMP${Date.now().toString().slice(-6)}`;

    // Insert new worker
    const [result] = await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name, phone,
        role, employment_type, start_date, contract_hours_per_week, hourly_rate,
        address_line1, address_line2, city, postal_code,
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      finalEmployeeId, email, password_hash, first_name, last_name, phone,
      mappedRole, employment_type, start_date || null, contract_hours_per_week || null, hourly_rate || null,
      address_line1 || null, address_line2 || null, city || null, postal_code || null,
      true // is_active
    ]);

    const newUserId = result.insertId;

    // Log the creation
    console.log(`New worker created: ID ${newUserId}, Email: ${email}, Role: ${role}, Type: ${worker_type}`);

    // Prepare response with all fields to match frontend expectations
    const response = {
      success: true,
      data: {
        id: newUserId,
        employee_id: finalEmployeeId,
        email,
        first_name,
        last_name,
        role: mappedRole, // Use the mapped role
        employment_type: employment_type || 'full_time',
        start_date: start_date || null,
        contract_hours_per_week: contract_hours_per_week || null,
        hourly_rate: hourly_rate || null,
        phone: phone || '',
        mobile: '',
        address_line1: address_line1 || '',
        address_line2: address_line2 || '',
        city: city || '',
        postal_code: postal_code || '',
        transport_type: '',
        availability: '',
        is_active: true,
        last_login: null,
        created_at: new Date().toISOString()
      }
    };

    // Include generated password in response (for admin to share with worker)
    if (auto_generate_password) {
      response.data.generated_password = password;
      response.message = 'Worker created successfully. Please share the generated password securely with the worker.';
    } else {
      response.message = 'Worker created successfully.';
    }

    // TODO: Send welcome email if send_welcome_email is true
    if (send_welcome_email) {
      console.log(`TODO: Send welcome email to ${email} with login instructions`);
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Create new client endpoint
app.post('/clients', authenticateToken, requireManagement, async (req, res) => {
  try {
    console.log('Creating new client:', req.body);

    // Check if user has permission (only admin, coordinator, supervisor)
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to create clients' });
    }

    const {
      first_name,
      last_name,
      preferred_name,
      date_of_birth,
      sex, // Changed from gender to sex
      nhs_number,
      phone,
      mobile,
      address_line1,
      address_line2,
      city,
      postal_code,
      medical_conditions,
      allergies,
      mobility_level,
      cognitive_status,
      communication_needs,
      preferred_language = 'English',
      dietary_requirements,
      fall_risk,
      service_start_date,
      funding_source,
      // Emergency contacts
      primary_contact_name,
      primary_contact_phone,
      primary_contact_relationship,
      gp_name,
      gp_phone,
      gp_email
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !date_of_birth || !sex || !address_line1 || !city || !postal_code || !service_start_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: first_name, last_name, date_of_birth, sex, address_line1, city, postal_code, service_start_date'
      });
    }

    // Validate sex field
    const validSexValues = ['male', 'female', 'other', 'prefer_not_to_say'];
    if (!validSexValues.includes(sex)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sex value. Must be: male, female, other, or prefer_not_to_say'
      });
    }

    // Validate date of birth
    const dobDate = new Date(date_of_birth);
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid date of birth' });
    }

    // Validate service start date
    const serviceDate = new Date(service_start_date);
    if (isNaN(serviceDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid service start date' });
    }

    // Validate mobility level if provided
    const validMobilityLevels = ['independent', 'walking_aid', 'wheelchair', 'bed_bound'];
    if (mobility_level && !validMobilityLevels.includes(mobility_level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobility level. Must be: independent, walking_aid, wheelchair, or bed_bound'
      });
    }

    // Validate cognitive status if provided
    const validCognitiveStatuses = ['alert', 'mild_impairment', 'moderate_impairment', 'severe_impairment'];
    if (cognitive_status && !validCognitiveStatuses.includes(cognitive_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cognitive status. Must be: alert, mild_impairment, moderate_impairment, or severe_impairment'
      });
    }

    // Validate fall risk if provided
    const validFallRisks = ['low', 'medium', 'high'];
    if (fall_risk && !validFallRisks.includes(fall_risk)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fall risk. Must be: low, medium, or high'
      });
    }

    // Validate funding source if provided
    const validFundingSources = ['private', 'local_authority', 'nhs', 'insurance', 'mixed'];
    if (funding_source && !validFundingSources.includes(funding_source)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid funding source. Must be: private, local_authority, nhs, insurance, or mixed'
      });
    }

    // Insert new client
    const [result] = await pool.execute(`
      INSERT INTO clients (
        first_name, last_name, preferred_name, date_of_birth, sex, nhs_number,
        phone, mobile, address_line1, address_line2, city, postal_code,
        medical_conditions, allergies, mobility_level, cognitive_status,
        communication_needs, preferred_language, dietary_requirements, fall_risk,
        service_start_date, funding_source, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, preferred_name || null, date_of_birth, sex, nhs_number || null,
      phone || null, mobile || null, address_line1, address_line2 || null, city, postal_code,
      medical_conditions || null, allergies || null, mobility_level || null, cognitive_status || null,
      communication_needs || null, preferred_language, dietary_requirements || null, fall_risk === 'high' || fall_risk === true,
      service_start_date, funding_source || null, true
    ]);

    const newClientId = result.insertId;

    // Log the creation
    console.log(`New client created: ID ${newClientId}, Name: ${first_name} ${last_name}`);

    res.status(201).json({
      success: true,
      data: {
        id: newClientId,
        first_name,
        last_name,
        preferred_name: preferred_name || '',
        date_of_birth,
        sex,
        nhs_number: nhs_number || '',
        phone: phone || '',
        mobile: mobile || '',
        address_line1: address_line1 || '',
        address_line2: address_line2 || '',
        city: city || '',
        postal_code: postal_code || '',
        medical_conditions: medical_conditions || '',
        allergies: allergies || '',
        mobility_level: mobility_level || '',
        cognitive_status: cognitive_status || '',
        communication_needs: communication_needs || '',
        preferred_language: preferred_language || 'English',
        dietary_requirements: dietary_requirements || '',
        fall_risk: fall_risk || false,
        service_start_date: service_start_date || null,
        funding_source: funding_source || '',
        is_active: true,
        created_at: new Date().toISOString()
      },
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Get all clients endpoint
app.get('/clients', authenticateToken, async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT
        id, first_name, last_name, preferred_name, date_of_birth, sex, nhs_number,
        phone, mobile, address_line1, address_line2, city, postal_code,
        medical_conditions, allergies, mobility_level, cognitive_status,
        communication_needs, preferred_language, dietary_requirements, fall_risk,
        service_start_date, funding_source, is_active, created_at
      FROM clients
      WHERE is_active = TRUE
      ORDER BY first_name, last_name
    `);

    res.json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Get medications for a specific client
app.get('/clients/:clientId/medications', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;

    const [medications] = await pool.execute(`
      SELECT
        id, medication_name, dosage, frequency, route, instructions,
        prescriber_name, prescription_date, start_date, end_date,
        is_prn, prn_instructions, storage_instructions, side_effects,
        is_active, created_at, updated_at
      FROM medications
      WHERE client_id = ? AND is_active = 1
      ORDER BY medication_name
    `, [clientId]);

    res.json({ success: true, data: medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Add new medication for a client
app.post('/clients/:clientId/medications', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      medication_name,
      dosage,
      frequency,
      time_of_day,
      with_food,
      special_instructions,
      start_date,
      end_date
    } = req.body;

    // Validate required fields
    if (!medication_name || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: medication_name, dosage, frequency'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO medications (
        client_id, medication_name, dosage, frequency, time_of_day, with_food,
        special_instructions, start_date, end_date, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId,
      medication_name,
      dosage,
      frequency,
      time_of_day || null,
      with_food || false,
      special_instructions || null,
      start_date,
      end_date || null,
      true // is_active
    ]);

    res.json({
      success: true,
      data: {
        id: result.insertId,
        client_id: clientId,
        medication_name,
        dosage,
        frequency,
        route,
        start_date,
        is_active: true
      },
      message: 'Medication added successfully'
    });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Update medication
app.put('/medications/:medicationId', authenticateToken, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const {
      medication_name,
      dosage,
      frequency,
      route,
      instructions,
      prescriber_name,
      prescription_date,
      start_date,
      end_date,
      is_prn,
      prn_instructions,
      storage_instructions,
      side_effects,
      is_active
    } = req.body;

    await pool.execute(`
      UPDATE medications SET
        medication_name = ?,
        dosage = ?,
        frequency = ?,
        route = ?,
        instructions = ?,
        prescriber_name = ?,
        prescription_date = ?,
        start_date = ?,
        end_date = ?,
        is_prn = ?,
        prn_instructions = ?,
        storage_instructions = ?,
        side_effects = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      medication_name,
      dosage,
      frequency,
      route,
      instructions,
      prescriber_name,
      prescription_date,
      start_date,
      end_date,
      is_prn || false,
      prn_instructions,
      storage_instructions,
      side_effects,
      is_active !== undefined ? is_active : true,
      medicationId
    ]);

    res.json({
      success: true,
      message: 'Medication updated successfully'
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Delete medication (soft delete)
app.delete('/medications/:medicationId', authenticateToken, async (req, res) => {
  try {
    const { medicationId } = req.params;

    await pool.execute(`
      UPDATE medications SET
        is_active = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [medicationId]);

    res.json({
      success: true,
      message: 'Medication removed successfully'
    });
  } catch (error) {
    console.error('Error removing medication:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Update client endpoint
app.put('/clients/:id', authenticateToken, requireManagement, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID' });
    }

    const {
      first_name,
      last_name,
      preferred_name,
      date_of_birth,
      sex,
      nhs_number,
      phone,
      mobile,
      address_line1,
      address_line2,
      city,
      postal_code,
      medical_conditions,
      allergies,
      mobility_level,
      cognitive_status,
      communication_needs,
      preferred_language,
      dietary_requirements,
      fall_risk,
      service_start_date,
      funding_source
    } = req.body;

    // Check if client exists
    const [existingClients] = await pool.execute(
      'SELECT id FROM clients WHERE id = ? AND is_active = TRUE',
      [clientId]
    );

    if (existingClients.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (preferred_name !== undefined) {
      updateFields.push('preferred_name = ?');
      updateValues.push(preferred_name);
    }
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(date_of_birth);
    }
    if (sex !== undefined) {
      updateFields.push('sex = ?');
      updateValues.push(sex);
    }
    if (nhs_number !== undefined) {
      updateFields.push('nhs_number = ?');
      updateValues.push(nhs_number);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (mobile !== undefined) {
      updateFields.push('mobile = ?');
      updateValues.push(mobile);
    }
    if (address_line1 !== undefined) {
      updateFields.push('address_line1 = ?');
      updateValues.push(address_line1);
    }
    if (address_line2 !== undefined) {
      updateFields.push('address_line2 = ?');
      updateValues.push(address_line2);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (postal_code !== undefined) {
      updateFields.push('postal_code = ?');
      updateValues.push(postal_code);
    }
    if (medical_conditions !== undefined) {
      updateFields.push('medical_conditions = ?');
      updateValues.push(medical_conditions);
    }
    if (allergies !== undefined) {
      updateFields.push('allergies = ?');
      updateValues.push(allergies);
    }
    if (mobility_level !== undefined) {
      updateFields.push('mobility_level = ?');
      updateValues.push(mobility_level);
    }
    if (cognitive_status !== undefined) {
      updateFields.push('cognitive_status = ?');
      updateValues.push(cognitive_status);
    }
    if (communication_needs !== undefined) {
      updateFields.push('communication_needs = ?');
      updateValues.push(communication_needs);
    }
    if (preferred_language !== undefined) {
      updateFields.push('preferred_language = ?');
      updateValues.push(preferred_language);
    }
    if (dietary_requirements !== undefined) {
      updateFields.push('dietary_requirements = ?');
      updateValues.push(dietary_requirements);
    }
    if (fall_risk !== undefined) {
      updateFields.push('fall_risk = ?');
      updateValues.push(fall_risk);
    }
    if (service_start_date !== undefined) {
      updateFields.push('service_start_date = ?');
      updateValues.push(service_start_date);
    }
    if (funding_source !== undefined) {
      updateFields.push('funding_source = ?');
      updateValues.push(funding_source);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateValues.push(clientId);

    // Update the client
    await pool.execute(
      `UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated client
    const [updatedClient] = await pool.execute(
      'SELECT * FROM clients WHERE id = ?',
      [clientId]
    );

    console.log(`Client ${clientId} updated by ${req.user.email}`);

    res.json({
      success: true,
      data: updatedClient[0],
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Deactivate client endpoint (soft delete)
app.delete('/clients/:id', authenticateToken, requireManagement, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID' });
    }

    // Check if client exists
    const [existingClients] = await pool.execute(
      'SELECT first_name, last_name FROM clients WHERE id = ? AND is_active = TRUE',
      [clientId]
    );

    if (existingClients.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const client = existingClients[0];

    // Soft delete (deactivate) the client
    await pool.execute(
      'UPDATE clients SET is_active = FALSE WHERE id = ?',
      [clientId]
    );

    console.log(`Client ${clientId} (${client.first_name} ${client.last_name}) deactivated by ${req.user.email}`);

    res.json({
      success: true,
      message: `Client ${client.first_name} ${client.last_name} has been deactivated`
    });

  } catch (error) {
    console.error('Error deactivating client:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Get client tasks
app.get('/clients/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID' });
    }

    // Check if client exists
    const [clientCheck] = await pool.execute('SELECT id FROM clients WHERE id = ? AND is_active = TRUE', [clientId]);
    if (clientCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get all tasks for the client
    const [tasks] = await pool.execute(`
      SELECT
        id, task_name, task_category, description, frequency,
        estimated_duration_minutes, special_instructions, is_mandatory, created_at
      FROM client_tasks
      WHERE client_id = ?
      ORDER BY task_category, task_name
    `, [clientId]);

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Error fetching client tasks:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Create client task
app.post('/clients/:id/tasks', authenticateToken, requireManagement, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID' });
    }

    // Check if user has permission
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to create client tasks' });
    }

    const {
      task_name,
      task_category,
      description,
      frequency,
      estimated_duration_minutes,
      special_instructions,
      is_mandatory = false
    } = req.body;

    // Validate required fields
    if (!task_name || !task_category || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: task_name, task_category, frequency'
      });
    }

    // Validate task category
    const validCategories = ['personal_care', 'domestic', 'medication', 'social', 'mobility', 'nutrition', 'other'];
    if (!validCategories.includes(task_category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task category. Must be: ' + validCategories.join(', ')
      });
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'bi_weekly', 'monthly', 'as_needed'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid frequency. Must be: ' + validFrequencies.join(', ')
      });
    }

    // Check if client exists
    const [clientCheck] = await pool.execute('SELECT id FROM clients WHERE id = ? AND is_active = TRUE', [clientId]);
    if (clientCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Insert new task
    const [result] = await pool.execute(`
      INSERT INTO client_tasks (
        client_id, task_name, task_category, description, frequency,
        estimated_duration_minutes, special_instructions, is_mandatory, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      clientId, task_name, task_category, description || null, frequency,
      estimated_duration_minutes || null, special_instructions || null, is_mandatory
    ]);

    const newTaskId = result.insertId;

    console.log(`New task created for client ${clientId}: ${task_name} (${task_category})`);

    res.status(201).json({
      success: true,
      data: {
        id: newTaskId,
        client_id: clientId,
        task_name,
        task_category,
        description,
        frequency,
        estimated_duration_minutes,
        special_instructions,
        is_mandatory
      },
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Error creating client task:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Update client task
app.put('/clients/:id/tasks/:taskId', authenticateToken, requireManagement, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const taskId = parseInt(req.params.taskId);

    if (isNaN(clientId) || isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID or task ID' });
    }

    // Check if user has permission
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to update client tasks' });
    }

    const {
      task_name,
      task_category,
      description,
      frequency,
      estimated_duration_minutes,
      special_instructions,
      is_mandatory
    } = req.body;

    // Check if task exists and belongs to the client
    const [taskCheck] = await pool.execute(
      'SELECT id FROM client_tasks WHERE id = ? AND client_id = ?',
      [taskId, clientId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found for this client' });
    }

    // Validate task category if provided
    if (task_category) {
      const validCategories = ['personal_care', 'domestic', 'medication', 'social', 'mobility', 'nutrition', 'other'];
      if (!validCategories.includes(task_category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid task category. Must be: ' + validCategories.join(', ')
        });
      }
    }

    // Validate frequency if provided
    if (frequency) {
      const validFrequencies = ['daily', 'weekly', 'bi_weekly', 'monthly', 'as_needed'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid frequency. Must be: ' + validFrequencies.join(', ')
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (task_name !== undefined) {
      updateFields.push('task_name = ?');
      updateValues.push(task_name);
    }
    if (task_category !== undefined) {
      updateFields.push('task_category = ?');
      updateValues.push(task_category);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (frequency !== undefined) {
      updateFields.push('frequency = ?');
      updateValues.push(frequency);
    }
    if (estimated_duration_minutes !== undefined) {
      updateFields.push('estimated_duration_minutes = ?');
      updateValues.push(estimated_duration_minutes);
    }
    if (special_instructions !== undefined) {
      updateFields.push('special_instructions = ?');
      updateValues.push(special_instructions);
    }
    if (is_mandatory !== undefined) {
      updateFields.push('is_mandatory = ?');
      updateValues.push(is_mandatory);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateValues.push(taskId);

    // Update the task
    await pool.execute(
      `UPDATE client_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated task
    const [updatedTask] = await pool.execute(
      'SELECT * FROM client_tasks WHERE id = ?',
      [taskId]
    );

    console.log(`Task ${taskId} updated for client ${clientId}`);

    res.json({
      success: true,
      data: updatedTask[0],
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating client task:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Delete client task
app.delete('/clients/:id/tasks/:taskId', authenticateToken, requireManagement, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const taskId = parseInt(req.params.taskId);

    if (isNaN(clientId) || isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid client ID or task ID' });
    }

    // Check if user has permission
    if (!['admin', 'coordinator', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to delete client tasks' });
    }

    // Check if task exists and belongs to the client
    const [taskCheck] = await pool.execute(
      'SELECT task_name FROM client_tasks WHERE id = ? AND client_id = ?',
      [taskId, clientId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found for this client' });
    }

    const taskName = taskCheck[0].task_name;

    // Delete the task
    await pool.execute('DELETE FROM client_tasks WHERE id = ?', [taskId]);

    console.log(`Task ${taskId} (${taskName}) deleted for client ${clientId}`);

    res.json({
      success: true,
      message: `Task "${taskName}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting client task:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Worker detail endpoints for frontend compatibility
app.get('/workers/:id/qualifications', authenticateToken, async (req, res) => {
  try {
    // Return empty array for now - can be implemented later
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

app.get('/workers/:id/availability', authenticateToken, async (req, res) => {
  try {
    // Return empty array for now - can be implemented later
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

app.get('/workers/:id/performance', authenticateToken, async (req, res) => {
  try {
    // Return empty array for now - can be implemented later
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Catch-all for missing endpoints
app.all('*', (req, res) => {
  console.log(`404 - Missing endpoint: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    url: req.url,
    message: `${req.method} ${req.url} is not implemented`
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple Care Coordination API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/auth/login`);
  console.log(`👤 Test credentials: admin@carecompany.com / password123`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
