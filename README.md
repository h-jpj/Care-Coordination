# 🏥 Care Coordination System

> This open-source system will do everything the expensive ones do - for FREE...
> It's also just a demo for a friend and the company they work for.

**📋 Windows users: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed setup instructions**

## ✨ What Will It Do

### For Care Managers / Office Workers
- **Worker Management**: Add staff, track hours, manage schedules 
- **Client Management**: Complete client profiles with medical info 
- **Medication Tracking**: Daily medication schedules and reminders
- **Task Management**: Assign care tasks (bathing, cooking, cleaning,etc)
- **Real-time Updates**: See what's happening across all sites

### For Care Workers
- **Simple Interface**: Easy to use on any device
- **Client Information**: Quick access to care plans and medical info
- **Task Lists**: Clear daily tasks for each client
- **Medication Reminders**: Never miss medication times
- **Quick Updates**: Log completed tasks instantly

## 🚀 Getting Started

### For Windows Users (Easy Setup)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart your computer
   - Make sure Docker is running (whale icon in system tray)

2. **Download This Project**
   - Download as ZIP from GitHub or clone with Git
   - Extract to a folder like `C:\care-coordination`

3. **Run the Setup**
   - Double-click `setup-windows.bat`
   - Wait for everything to download and start (5-10 minutes first time)
   - Open your browser to: http://localhost:3004

### For Mac/Linux Users

```bash
git clone <repository-url>
cd care-app
./deploy.sh
```

### 🌐 Access Your System
- **Web App**: http://localhost:3004
- **API**: http://localhost:3003
- **Database**: localhost:3307
- **Login**: admin@carecompany.com / password123

### 🗄️ Database Access
```bash
# Connect to database
sudo docker exec -it care_coordination_db mariadb -u care_user -pcare_password care_coordination

# View tables
SHOW TABLES;

# Check sample data
SELECT * FROM users;
SELECT * FROM clients;
```

## 📋 How to Use

> ⭐ = Done

### Adding Workers ⭐
1. Go to "Workers" section
2. Click "Add Worker"
3. Fill in details (name, role, contact info, hours)
4. Worker can now log in and see their tasks

### Adding Clients ⭐
1. Go to "Clients" section  
2. Click "Add Client"
3. Add personal info, medical conditions, care needs
4. Assign workers to this client

### Managing Medications
1. Open a client's profile
2. Click "Medications"
3. Add medications with dosage, timing, special instructions
4. Workers will see medication reminders

### Assigning Tasks
1. Open a client's profile
2. Click "Tasks"
3. Add care tasks (bathing, cooking, cleaning, etc.)
4. Set frequency and priority
5. Workers see these on their task list

## 🔧 For Developers

### Built With
- **Web Interface**: React (modern, fast)
- **Server**: Node.js (reliable, scalable)
- **Database**: MariaDB (secure, professional-grade)
- **Deployment**: Docker (works anywhere)

### Project Structure
```
care-app/
├── backend/              # Node.js API server
├── frontend/             # React web interface
├── database/             # Database initialization
│   └── init/            # Schema and sample data
├── docker-compose.yml    # Container setup
├── deploy.sh            # Mac/Linux deployment
├── start.sh             # Server startup script
├── SETUP.md             # Complete setup guide
└── README.md            # This file
```

### Local Development
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Individual service development
cd backend && npm install && npm run dev
cd frontend && npm install && npm start

# Database access
sudo docker exec -it care_coordination_db mariadb -u care_user -pcare_password care_coordination

# Stop services
docker-compose down
```

### Contributing
1. Fork this repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test them
4. Commit: `git commit -m 'Add new feature'`
5. Push: `git push origin feature/new-feature`
6. Open a Pull Request

## 🆘 Need Help?

### Common Issues
- **Docker not starting**: Make sure Docker Desktop is running
- **Can't access website**: Check if port 3004 is available
- **Worker/Client creation fails**: Check backend logs with `docker-compose logs backend`
- **Database errors**: Use `sudo docker exec -it care_coordination_db mariadb -u care_user -pcare_password care_coordination`
- **Missing database columns**: See SETUP.md troubleshooting section

### Getting Support
- **Bug Reports**: Create a GitHub Issue
- **Questions**: Start a GitHub Discussion
- **Feature Requests**: Create a GitHub Issue with "enhancement" label

## 📄 License

MIT License - You can use this commercially, modify it, and distribute it freely.

## 🎯 What Else Might Be Added?

- [ ] Advanced reporting 
- [ ] Integration with payroll systems

---

**Stop paying ridiculous monthly fees. Take control of your care coordination today!** ⭐
