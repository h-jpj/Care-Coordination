# Care Company Coordination App

A real-time care coordination system with mobile app for ground workers and web dashboard for office workers.

## Features

- **Real-time job coordination** with color-coded status updates
- **GPS-based check-in/check-out** for care workers
- **Role-based access control** (office workers vs ground workers)
- **Live location tracking** and mapping
- **Care notes and communication** system
- **Offline functionality** for mobile app
- **Real-time notifications** via WebSocket

## Technology Stack

- **Backend**: Node.js + Express + TypeScript + Socket.io
- **Database**: MariaDB
- **Frontend**: React + TypeScript + Material-UI
- **Mobile**: React Native + TypeScript
- **Infrastructure**: Docker + Docker Compose
- **Authentication**: JWT with role-based access

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)
```bash
git clone <repository-url>
cd care-app
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup
```bash
# 1. Clone and setup
git clone <repository-url>
cd care-app
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be ready (check logs)
docker-compose logs -f
```

### 🌐 Access Points
- **Web Dashboard**: http://localhost:3000 (or http://192.168.0.103:3000)
- **API**: http://localhost:3002 (or http://192.168.0.103:3002)
- **Database**: localhost:3306 (or 192.168.0.103:3306)

### 📱 Mobile App Setup
```bash
# Install dependencies and start Metro
chmod +x launch-mobile.sh
./launch-mobile.sh

# In another terminal, run on device:
cd mobile
npx react-native run-android  # For Android
npx react-native run-ios      # For iOS (macOS only)
```

## Default Login Credentials

### Office Workers
- **Admin**: admin@carecompany.com / password123
- **Manager**: manager@carecompany.com / password123

### Ground Workers
- **Worker 1**: worker1@carecompany.com / password123
- **Worker 2**: worker2@carecompany.com / password123
- **Worker 3**: worker3@carecompany.com / password123

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Mobile Development
```bash
cd mobile
npm install
npx react-native run-android
# or
npx react-native run-ios
```

## Database Schema

The system includes the following main entities:
- **Users** (office_worker, ground_worker)
- **Clients** (service users with addresses)
- **Jobs** (care visits with scheduling)
- **Location Logs** (GPS check-in/out tracking)
- **Notes** (care notes and internal communications)
- **Job Status History** (audit trail)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List jobs (filtered by role)
- `POST /api/jobs` - Create new job (office workers only)
- `PUT /api/jobs/:id` - Update job
- `PUT /api/jobs/:id/status` - Update job status

### Location
- `POST /api/location/checkin` - Check in to job
- `POST /api/location/checkout` - Check out from job
- `GET /api/location/worker/:id` - Get worker location

### Notes
- `GET /api/notes/job/:id` - Get notes for job
- `POST /api/notes` - Add new note

## Real-time Events

The system uses WebSocket for real-time updates:
- `job_status_updated` - Job status changes
- `worker_location_updated` - Worker location updates
- `new_note_added` - New care notes
- `job_assigned` - Job assignments

## Mobile App Features

- **Job List**: View assigned jobs with status
- **GPS Check-in**: Location-verified check-in/out
- **Care Notes**: Add notes with voice-to-text
- **Offline Mode**: Basic functionality without internet
- **Push Notifications**: Job updates and assignments

## Web Dashboard Features

- **Live Status Board**: Real-time job status with color coding
- **Job Management**: Create, edit, assign jobs
- **Worker Map**: Live worker locations
- **Notes Management**: View and add care notes
- **User Management**: Manage workers and permissions

## Status Color Coding

- 🟢 **Green**: Completed jobs
- 🟡 **Yellow/Orange**: Late jobs
- 🔴 **Red**: Cancelled jobs
- 🔵 **Blue**: In progress jobs
- ⚪ **Gray**: Pending/assigned jobs

## 🚀 Server Deployment

### Deploy to jay@192.168.0.103
```bash
# Deploy backend and start services
chmod +x deploy.sh
./deploy.sh

# SSH to server and start
ssh jay@192.168.0.103
cd care-app
./start.sh
```

### Launch Web App
```bash
# After deployment, access:
# Web Dashboard: http://192.168.0.103:3000
# API: http://192.168.0.103:3002
```

### Launch Mobile App
```bash
# On your development machine:
chmod +x launch-mobile.sh
./launch-mobile.sh

# In another terminal:
cd mobile
npx react-native run-android
```

## 📚 Documentation

- **SETUP.md** - Detailed setup instructions
- **TESTING.md** - Testing procedures and guidelines
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_SUMMARY.md** - Complete project overview

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for the care company.
