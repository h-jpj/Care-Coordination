# Care Coordination App - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### One-Command Setup
```bash
git clone <repository-url>
cd care-app
chmod +x start.sh
./start.sh
```

This will automatically:
- Set up environment variables
- Build and start all services
- Initialize the database with sample data
- Verify all services are running

**Access Points:**
- Web Dashboard: http://localhost:3000
- API: http://localhost:3002
- Database: localhost:3306

## 📋 Manual Setup (Development)

### 1. System Requirements

**Required Software:**
- Node.js 18+ 
- Docker & Docker Compose
- Git

**For Mobile Development:**
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### 2. Clone Repository
```bash
git clone <repository-url>
cd care-app
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (optional for development)
nano .env
```

**Key Environment Variables:**
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=care_coordination
DB_USER=care_user
DB_PASSWORD=care_password123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# API
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:3002
REACT_APP_WS_URL=ws://localhost:3002
```

### 4. Database Setup

**Using Docker (Recommended):**
```bash
# Start database only
docker-compose up -d database

# Wait for database to be ready
docker-compose logs -f database
```

**Manual Database Setup:**
```bash
# Install MariaDB
sudo apt install mariadb-server

# Create database and user
sudo mysql -u root -p
CREATE DATABASE care_coordination;
CREATE USER 'care_user'@'localhost' IDENTIFIED BY 'care_password123';
GRANT ALL PRIVILEGES ON care_coordination.* TO 'care_user'@'localhost';
FLUSH PRIVILEGES;

# Import schema
mysql -u care_user -p care_coordination < database/schema.sql
mysql -u care_user -p care_coordination < database/init-data.sql
```

### 5. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

**Backend Structure:**
```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic and WebSocket
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main server file
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

**API Endpoints:**
- Health: `GET /health`
- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Jobs: `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:id`
- Users: `GET /api/users`, `POST /api/users`
- Clients: `GET /api/clients`, `POST /api/clients`
- Location: `POST /api/location/checkin`, `POST /api/location/checkout`
- Notes: `GET /api/notes/job/:id`, `POST /api/notes`

### 6. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm start

# Production build
npm run build
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── services/        # API and WebSocket services
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main application component
├── public/              # Static assets
├── Dockerfile           # Docker configuration
└── package.json         # Dependencies and scripts
```

### 7. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# For Android development
npx react-native run-android

# For iOS development (macOS only)
npx react-native run-ios
```

**Mobile Structure:**
```
mobile/
├── src/
│   ├── screens/         # Mobile screens
│   ├── contexts/        # React contexts
│   ├── services/        # API and location services
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main app component
├── android/             # Android-specific files
├── ios/                 # iOS-specific files (if on macOS)
└── package.json         # Dependencies and scripts
```

**Mobile Development Notes:**
- Update API URL in `mobile/src/services/api.ts` to your computer's IP for device testing
- Ensure location permissions are granted for GPS features
- For physical device testing, use your local IP instead of localhost

## 🔧 Development Workflow

### Starting Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Service Development
```bash
# Backend only
cd backend && npm run dev

# Frontend only  
cd frontend && npm start

# Mobile only
cd mobile && npx react-native start
```

### Database Management
```bash
# Access database
docker exec -it care_coordination_db mysql -u care_user -pcare_password123 care_coordination

# View tables
SHOW TABLES;

# Check sample data
SELECT * FROM users;
SELECT * FROM jobs;
```

## 🧪 Testing

### API Testing
```bash
# Test login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@carecompany.com", "password": "password123"}'

# Test protected endpoint
curl -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Web App Testing
1. Navigate to http://localhost:3000
2. Login with demo credentials
3. Test job management, dashboard, and real-time features

### Mobile App Testing
1. Start Metro bundler: `npx react-native start`
2. Run on device/emulator
3. Test GPS check-in/out functionality

## 🔐 Demo Accounts

**Office Workers (Web Dashboard):**
- admin@carecompany.com / password123
- manager@carecompany.com / password123

**Ground Workers (Mobile App):**
- worker1@carecompany.com / password123
- worker2@carecompany.com / password123
- worker3@carecompany.com / password123

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart database

# Check logs
docker-compose logs database
```

**API Not Responding:**
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

**Frontend Build Errors:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Mobile App Issues:**
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Clean build
cd android && ./gradlew clean
```

### Port Conflicts
If ports 3000, 3001, or 3306 are in use:
```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :3002
sudo lsof -i :3306

# Kill processes or change ports in docker-compose.yml
```

## 📱 Mobile Device Testing

### Android Device Setup
1. Enable Developer Options and USB Debugging
2. Connect device via USB
3. Update API URL in `mobile/src/services/api.ts`:
   ```typescript
   baseURL: 'http://YOUR_COMPUTER_IP:3002/api'
   ```
4. Run: `npx react-native run-android`

### iOS Device Setup (macOS only)
1. Open `mobile/ios/CareCoordinationMobile.xcworkspace` in Xcode
2. Select your device as target
3. Update API URL as above
4. Build and run from Xcode

## 🚀 Production Deployment

See `DEPLOYMENT.md` for complete production setup including:
- Server configuration
- SSL certificates
- Production Docker setup
- Security hardening
- Monitoring and backups

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test API health: `curl http://localhost:3002/health`
4. Check database connectivity
5. Review environment variables

## 🎯 Next Steps

After setup:
1. Explore the web dashboard with office worker account
2. Test mobile app with ground worker account
3. Try GPS check-in/out functionality
4. Test real-time updates between web and mobile
5. Review API documentation for custom integrations
