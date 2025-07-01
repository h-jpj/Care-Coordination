# Care Coordination App - Deployment Guide

## Production Deployment

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name and SSL certificate
- Minimum 4GB RAM, 2 CPU cores, 50GB storage

### 1. Server Setup

#### Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Setup Firewall
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Application Deployment

#### Clone Repository
```bash
git clone <your-repository-url>
cd care-app
```

#### Production Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit production environment variables
nano .env
```

#### Production Environment Variables
```bash
# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_NAME=care_coordination
DB_USER=care_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_STRONG_RANDOM_STRING
JWT_EXPIRES_IN=24h

# Server Configuration
NODE_ENV=production
PORT=3002

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend Configuration
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com

# Production Database Root Password
MYSQL_ROOT_PASSWORD=CHANGE_THIS_ROOT_PASSWORD
```

#### Production Docker Compose
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  # MariaDB Database
  database:
    image: mariadb:10.11
    container_name: care_coordination_db_prod
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: care_coordination
      MYSQL_USER: care_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/init-data.sql:/docker-entrypoint-initdb.d/02-init-data.sql
    networks:
      - care_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "care_user", "-p${DB_PASSWORD}"]
      timeout: 20s
      retries: 10

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: care_coordination_api_prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3002
      DB_HOST: database
      DB_PORT: 3306
      DB_NAME: care_coordination
      DB_USER: care_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      database:
        condition: service_healthy
    networks:
      - care_network

  # Frontend Web App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: care_coordination_web_prod
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL}
      REACT_APP_WS_URL: ${REACT_APP_WS_URL}
    depends_on:
      - backend
    networks:
      - care_network

  # Redis for session management
  redis:
    image: redis:7-alpine
    container_name: care_coordination_redis_prod
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - care_network
    command: redis-server --appendonly yes

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: care_coordination_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - care_network

volumes:
  mariadb_data:
  redis_data:

networks:
  care_network:
    driver: bridge
```

#### Production Dockerfiles

Create `backend/Dockerfile.prod`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002

USER node

CMD ["npm", "start"]
```

Create `frontend/Dockerfile.prod`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3002;
    }

    upstream frontend {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 3. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot

# Stop nginx temporarily
sudo docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl
```

#### Certificate Renewal
```bash
# Add to crontab for automatic renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /path/to/care-app/docker-compose.prod.yml restart nginx
```

### 4. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Database Backup Setup

Create backup script `scripts/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/care-coordination"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="care_coordination_db_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker exec $CONTAINER_NAME mysqldump -u care_user -p$DB_PASSWORD care_coordination > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
# Make script executable
chmod +x scripts/backup.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM:
0 2 * * * /path/to/care-app/scripts/backup.sh
```

### 6. Monitoring Setup

#### Health Check Script
Create `scripts/health-check.sh`:
```bash
#!/bin/bash

# Check if services are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "Some services are down!"
    # Send alert (email, Slack, etc.)
    exit 1
fi

# Check API health
if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "API health check failed!"
    exit 1
fi

echo "All services healthy"
```

#### Log Rotation
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json

# Add:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

### 7. Mobile App Deployment

#### Android APK Build
```bash
cd mobile

# Generate release keystore (first time only)
keytool -genkey -v -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

#### iOS App Store Build
```bash
cd mobile

# Build for iOS (requires macOS and Xcode)
npx react-native run-ios --configuration Release

# Archive for App Store (in Xcode)
# Product -> Archive -> Distribute App
```

### 8. Security Hardening

#### Server Security
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

#### Application Security
1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS only
4. Implement rate limiting
5. Regular security updates

### 9. Maintenance

#### Regular Tasks
```bash
# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Clean up unused Docker resources
docker system prune -f

# Monitor disk space
df -h

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100
```

#### Troubleshooting
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Access database
docker exec -it care_coordination_db_prod mysql -u care_user -p care_coordination
```

## Production Checklist

### Pre-deployment
- [ ] Update all environment variables
- [ ] Change default passwords
- [ ] Configure SSL certificates
- [ ] Set up domain DNS records
- [ ] Test backup and restore procedures

### Post-deployment
- [ ] Verify all services are running
- [ ] Test web application functionality
- [ ] Test API endpoints
- [ ] Verify database connectivity
- [ ] Test real-time features
- [ ] Set up monitoring and alerts
- [ ] Configure log rotation
- [ ] Schedule regular backups

### Security
- [ ] HTTPS enabled and working
- [ ] Strong passwords configured
- [ ] Firewall properly configured
- [ ] Regular security updates scheduled
- [ ] Access logs monitored

### Performance
- [ ] Database performance optimized
- [ ] API response times acceptable
- [ ] Frontend loading times reasonable
- [ ] WebSocket connections stable
- [ ] Resource usage monitored
