# 🏥 Care Coordination System

> **An open-source alternative to expensive care management software**
> 
> **Stop paying £20+ per employee per month!** Build your own care coordination system.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![MariaDB](https://img.shields.io/badge/Database-MariaDB-orange.svg)](https://mariadb.org/)

## 🎯 Why This Project?

Care management software companies are charging **£20+ per employee per month** for basic functionality. This open-source solution provides:

- ✅ **Zero monthly fees** - host it yourself
- ✅ **Full feature parity** with expensive alternatives  
- ✅ **Complete control** over your data
- ✅ **Customizable** to your specific needs
- ✅ **Community-driven** development

## 🚀 Features

### 👥 Worker Management
- Comprehensive worker profiles with roles and schedules
- Contact information and availability tracking
- Transport type and contract hours management
- Role-based access control (admin, coordinator, supervisor, ground worker)

### 🏠 Client Management  
- Detailed client profiles with medical information
- Care plans and service coordination
- Emergency contacts and GP information
- Dietary requirements and mobility assessments

### 💊 Medication Management
- Daily medication tracking and scheduling
- Dosage and administration time management
- Special instructions and food requirements
- Medication history and compliance tracking

### 📋 Task Management
- Care task assignment and tracking
- Client-specific task lists (bathing, cooking, cleaning, etc.)
- Task completion monitoring
- Priority and frequency management

### 🔄 Real-time Coordination
- Live updates between care workers
- Instant communication and notifications
- Shift coordination and handovers
- Emergency alert system

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite (Modern, fast web interface)
- **Backend**: Node.js + Express (RESTful API)
- **Database**: MariaDB 10.11 (Reliable, performant)
- **Deployment**: Docker + Docker Compose (Easy deployment)
- **Authentication**: JWT tokens (Secure access control)

## ⚡ Quick Start

### Prerequisites
- Docker and Docker Compose
- 5 minutes of your time

### One-Command Setup
```bash
# Clone and start the entire system
git clone <repository-url>
cd care-coordination-system
./deploy.sh
```

### Access Your System
- 🌐 **Web App**: http://localhost:3004
- 🔧 **API**: http://localhost:3003
- 📊 **Database**: localhost:3307

### Default Login
- **Email**: `admin@carecompany.com`
- **Password**: `password123` (change immediately!)

## 📁 Project Structure

```
care-coordination-system/
├── 🎨 frontend/          # React web application
├── ⚙️  backend/           # Node.js API server
├── 🗄️  database/          # MariaDB setup and migrations
├── 🐳 docker-compose.yml # Container orchestration
├── 📚 docs/              # Documentation
└── 🚀 deploy.sh          # One-click deployment
```

## 💰 Cost Comparison

| Solution | Monthly Cost (50 employees) | Annual Cost | Your Cost |
|----------|----------------------------|-------------|-----------|
| **Expensive SaaS** | £1,000+ | £12,000+ | 💸 |
| **This System** | £0 | £0 | 🎉 |
| **Hosting Only** | ~£20 | ~£240 | ✅ |

**Savings: £11,760+ per year for 50 employees!**

## 🏗️ Development

### Local Development
```bash
# Backend development
cd backend && npm install && npm run dev

# Frontend development  
cd frontend && npm install && npm run dev

# Database setup
# See DATABASE.md for detailed instructions
```

### Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development guidelines
- Code style standards
- How to submit pull requests
- Feature request process

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [🔧 SETUP.md](SETUP.md) | Complete setup instructions |
| [🗄️ DATABASE.md](DATABASE.md) | MariaDB configuration guide |
| [🚀 DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [📋 PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Technical overview |
| [🤝 CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Environment variable configuration
- Docker container isolation

## 🌟 Roadmap

- [ ] **Mobile App** (React Native)
- [ ] **Advanced Reporting** & Analytics
- [ ] **Integration APIs** (payroll, scheduling systems)
- [ ] **Multi-tenant Support** (for agencies managing multiple clients)
- [ ] **Automated Backups** & Recovery
- [ ] **Advanced Notifications** (SMS, email, push)

## 🤝 Community

- 🐛 **Bug Reports**: Use GitHub Issues
- 💡 **Feature Requests**: Use GitHub Discussions  
- 📧 **Questions**: Create a GitHub Discussion
- 🔧 **Pull Requests**: Always welcome!

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use this commercially, modify it, distribute it, and do whatever you want with it!

## 🙏 Acknowledgments

- Built by developers frustrated with expensive care management software
- Inspired by the open-source community
- Dedicated to making care coordination accessible and affordable

---

### 💪 **Stop paying ridiculous monthly fees. Take control of your care coordination system today!**

**Star this repo if you believe care management software should be affordable! ⭐**
