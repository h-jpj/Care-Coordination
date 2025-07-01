# Contributing to Care Coordination System

Thank you for your interest in contributing to this open-source care coordination system! This project aims to provide an affordable alternative to expensive care management software.

## 🎯 Project Goals

- **Affordable**: No more £20/employee/month fees
- **Open Source**: Community-driven development
- **Care-Focused**: Built specifically for care providers
- **Easy to Deploy**: Simple Docker-based setup

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd care-coordination-system
   ```

2. **Start the application**
   ```bash
   ./deploy.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3004
   - Backend API: http://localhost:3003

### Development Setup

1. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   Follow the instructions in `DATABASE.md`

## 📁 Project Structure

```
care-coordination-system/
├── backend/           # Node.js/Express API
├── frontend/          # React web application
├── mobile/           # React Native mobile app (future)
├── docs/             # Documentation
├── docker-compose.yml # Container orchestration
└── deploy.sh         # Deployment script
```

## 🛠️ Development Guidelines

### Code Style

- **Backend**: Use ES6+ features, async/await
- **Frontend**: React functional components with hooks
- **Database**: MariaDB (NOT MySQL - important distinction!)
- **Comments**: Write clear, helpful comments

### Naming Conventions

- **Files**: kebab-case (e.g., `client-management.js`)
- **Variables**: camelCase (e.g., `clientData`)
- **Components**: PascalCase (e.g., `ClientManager`)
- **Database**: snake_case (e.g., `client_id`)

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear commit messages
   - Test your changes locally
   - Update documentation if needed

3. **Submit a pull request**
   - Describe what your changes do
   - Include screenshots for UI changes
   - Reference any related issues

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Integration tests
npm run test:integration
```

### Writing Tests

- Write unit tests for new functions
- Add integration tests for API endpoints
- Include frontend component tests
- Test database operations

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Environment details** (OS, Docker version, etc.)
5. **Screenshots** (if applicable)

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** first
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Consider the scope** - keep it focused

## 🏗️ Architecture Decisions

### Technology Choices

- **Backend**: Node.js/Express for rapid development
- **Frontend**: React for modern UI
- **Database**: MariaDB for reliability and performance
- **Deployment**: Docker for consistency
- **Authentication**: JWT tokens

### Key Features

- **Worker Management**: Add, edit, track care workers
- **Client Management**: Comprehensive client profiles
- **Medication Tracking**: Daily medication management
- **Task Management**: Care tasks and scheduling
- **Real-time Updates**: Live coordination between workers

## 📚 Documentation

- **Setup**: See `SETUP.md`
- **Database**: See `DATABASE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **API**: See `backend/API.md` (coming soon)

## 🤝 Community

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Code Review**: All PRs require review
- **Be Respectful**: Follow our code of conduct

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built to challenge expensive care management software
- Inspired by the need for affordable care coordination tools
- Community-driven development

---

**Remember**: This is about making care coordination accessible and affordable for everyone! 💪
