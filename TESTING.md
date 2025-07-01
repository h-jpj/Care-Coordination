# Care Coordination App - Testing Guide

## Manual Testing Procedures

### Prerequisites
1. Ensure Docker and Docker Compose are installed
2. Start the development environment: `docker-compose up -d`
3. Verify all services are running:
   - Database: localhost:3306
   - Backend API: localhost:3002
   - Frontend Web: localhost:3000

### Backend API Testing

#### 1. Authentication Tests
```bash
# Test login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@carecompany.com", "password": "password123"}'

# Test protected endpoint
curl -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2. User Management Tests
```bash
# Get all users (office worker only)
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get ground workers
curl -X GET http://localhost:3002/api/users/workers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Job Management Tests
```bash
# Get jobs
curl -X GET http://localhost:3002/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create job (office worker only)
curl -X POST http://localhost:3002/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientId": 1,
    "assignedWorkerId": 3,
    "title": "Test Job",
    "scheduledStartTime": "2025-01-02T10:00:00Z",
    "scheduledEndTime": "2025-01-02T11:00:00Z",
    "durationMinutes": 60,
    "priority": "medium"
  }'
```

#### 4. Location Tracking Tests
```bash
# Check in to job (ground worker only)
curl -X POST http://localhost:3002/api/location/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jobId": 1,
    "latitude": 51.5074,
    "longitude": -0.1278,
    "accuracy": 5.0
  }'

# Check out from job
curl -X POST http://localhost:3002/api/location/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jobId": 1,
    "latitude": 51.5074,
    "longitude": -0.1278,
    "accuracy": 5.0
  }'
```

### Web Application Testing

#### 1. Login Flow
1. Navigate to http://localhost:3000
2. Should redirect to login page
3. Test with demo credentials:
   - Office Worker: admin@carecompany.com / password123
   - Ground Worker: worker1@carecompany.com / password123
4. Verify successful login redirects to dashboard

#### 2. Dashboard Testing
1. Verify stats cards display correct numbers
2. Check today's jobs are displayed
3. Verify real-time updates (use WebSocket events)
4. Test navigation to other pages

#### 3. Jobs Management (Office Workers)
1. Navigate to Jobs page
2. Test job creation dialog
3. Verify job filtering and search
4. Test job editing and status updates
5. Check job assignment to workers

#### 4. Client Management (Office Workers)
1. Navigate to Clients page
2. Test client creation
3. Verify client search functionality
4. Test client editing and deactivation

#### 5. User Management (Office Workers)
1. Navigate to Users page
2. Test user creation
3. Verify role-based filtering
4. Test user editing and deactivation

### Mobile Application Testing

#### 1. Setup for Testing
1. Install React Native development environment
2. For Android: `cd mobile && npx react-native run-android`
3. For iOS: `cd mobile && npx react-native run-ios`
4. Update API URL in mobile/src/services/api.ts to your computer's IP

#### 2. Authentication Testing
1. Test login with ground worker credentials
2. Verify token storage and persistence
3. Test logout functionality

#### 3. Jobs List Testing
1. Verify today's jobs are displayed
2. Test job filtering by status
3. Test search functionality
4. Verify pull-to-refresh works

#### 4. Job Details Testing
1. Navigate to a job from the list
2. Test GPS check-in functionality
3. Verify location permissions are requested
4. Test check-out functionality
5. Test adding care notes

#### 5. Location Services Testing
1. Enable location services on device
2. Test GPS accuracy and geofencing
3. Verify location data is sent to server
4. Test offline functionality

### Real-time Features Testing

#### 1. WebSocket Connection
1. Open web app in multiple browser tabs
2. Login as different users (office worker and ground worker)
3. Verify WebSocket connections are established

#### 2. Job Status Updates
1. Update job status from web app
2. Verify real-time updates in other browser tabs
3. Test mobile app receives updates

#### 3. Location Updates
1. Use mobile app to check in/out
2. Verify location updates appear in web dashboard
3. Test worker location tracking

### Database Testing

#### 1. Data Integrity
```sql
-- Connect to database
docker exec -it care_coordination_db mysql -u care_user -pcare_password123 care_coordination

-- Verify sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM jobs;

-- Check relationships
SELECT j.title, c.first_name, c.last_name, u.first_name as worker_name
FROM jobs j
LEFT JOIN clients c ON j.client_id = c.id
LEFT JOIN users u ON j.assigned_worker_id = u.id;
```

#### 2. Performance Testing
1. Create multiple jobs and users
2. Test API response times
3. Verify database queries are optimized

### Security Testing

#### 1. Authentication
1. Test invalid credentials
2. Verify JWT token expiration
3. Test unauthorized access to protected endpoints

#### 2. Authorization
1. Test ground worker cannot access office worker endpoints
2. Verify users can only see their own data
3. Test role-based access control

#### 3. Input Validation
1. Test SQL injection attempts
2. Verify input sanitization
3. Test XSS prevention

### Error Handling Testing

#### 1. Network Errors
1. Disconnect internet and test offline functionality
2. Test API timeout handling
3. Verify error messages are user-friendly

#### 2. Server Errors
1. Stop backend service and test error handling
2. Test database connection failures
3. Verify graceful degradation

### Performance Testing

#### 1. Load Testing
1. Create multiple concurrent users
2. Test API response times under load
3. Monitor database performance

#### 2. Mobile Performance
1. Test app performance on low-end devices
2. Verify battery usage is reasonable
3. Test memory usage and leaks

## Test Checklist

### Backend API
- [ ] Authentication endpoints work
- [ ] User management CRUD operations
- [ ] Job management CRUD operations
- [ ] Client management CRUD operations
- [ ] Location tracking endpoints
- [ ] Notes management endpoints
- [ ] WebSocket real-time updates
- [ ] Role-based access control
- [ ] Input validation and sanitization
- [ ] Error handling and logging

### Web Application
- [ ] Login/logout functionality
- [ ] Dashboard displays correct data
- [ ] Job management interface
- [ ] Client management interface
- [ ] User management interface
- [ ] Real-time updates via WebSocket
- [ ] Responsive design
- [ ] Cross-browser compatibility

### Mobile Application
- [ ] Authentication flow
- [ ] Jobs list and filtering
- [ ] Job details and navigation
- [ ] GPS check-in/check-out
- [ ] Location permissions
- [ ] Care notes functionality
- [ ] Offline data storage
- [ ] Push notifications (if implemented)

### Integration
- [ ] Real-time communication between web and mobile
- [ ] Database consistency
- [ ] API error handling
- [ ] Security measures
- [ ] Performance under load

## Known Issues and Limitations

1. **Mobile App**: Requires manual IP configuration for testing on physical devices
2. **Real-time Updates**: WebSocket reconnection logic could be improved
3. **Offline Functionality**: Limited offline capabilities in current version
4. **Push Notifications**: Not implemented in current version
5. **Voice-to-Text**: Placeholder implementation, needs actual voice recognition

## Deployment Considerations

1. **Environment Variables**: Update all environment variables for production
2. **Database Security**: Change default passwords and restrict access
3. **SSL/TLS**: Implement HTTPS for production deployment
4. **Mobile App**: Build and sign apps for app store distribution
5. **Monitoring**: Implement logging and monitoring solutions
6. **Backup**: Set up automated database backups
