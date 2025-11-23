# AGASEKE Deployment Guide

## Overview

This guide covers deployment strategies for the AGASEKE digital piggy bank application, including both development and production environments. The guide includes containerization, cloud deployment, mobile app distribution, and CI/CD pipeline setup.

## Deployment Architecture

### Production Architecture Overview
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Mobile Apps      │    │   Load Balancer     │    │   Database Cluster  │
│   iOS App Store     │───▶│   (Nginx/ALB)      │───▶│   MongoDB Atlas     │
│   Google Play       │    │                     │    │   Replica Set       │
│   (React Native)    │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │   Backend Servers   │
                           │   (Node.js/Express) │
                           │   Auto-scaling      │
                           │   Multiple Instances│
                           └─────────────────────┘
```

## Environment Setup

### Environment Variables

#### Backend Production Environment
```env
# Production .env file
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas recommended)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agaseke?retryWrites=true&w=majority

# Security
JWT_SECRET=super-secure-256-bit-secret-key-for-production
BCRYPT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# SSL/TLS
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private-key.pem
```

#### Frontend Production Environment
```env
# Expo production configuration
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Backend Deployment

### 1. Traditional Server Deployment

#### Prerequisites
- Ubuntu 20.04 LTS or CentOS 8+
- Node.js 18+ installed
- MongoDB (local or Atlas)
- Nginx for reverse proxy
- PM2 for process management
- SSL certificates (Let's Encrypt recommended)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### Step 2: Application Setup
```bash
# Clone repository
git clone <your-repo-url> /var/www/agaseke
cd /var/www/agaseke/backend

# Install dependencies
npm install --production

# Create production environment file
sudo nano .env.production
# Add production environment variables

# Set proper permissions
sudo chown -R $USER:$USER /var/www/agaseke
sudo chmod -R 755 /var/www/agaseke
```

#### Step 3: PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'agaseke-api',
    script: './app.js',
    cwd: '/var/www/agaseke/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/agaseke-api-error.log',
    out_file: '/var/log/pm2/agaseke-api-out.log',
    log_file: '/var/log/pm2/agaseke-api.log',
    max_restarts: 10,
    restart_delay: 1000
  }]
}
```

#### Step 4: Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/agaseke-api
```

```nginx
# /etc/nginx/sites-available/agaseke-api
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

#### Step 5: SSL Certificate & Start Services
```bash
# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/agaseke-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start application with PM2
cd /var/www/agaseke/backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor application
pm2 monit
```

### 2. Docker Deployment

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /usr/src/app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "app.js"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  agaseke-api:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/agaseke
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    networks:
      - agaseke-network
    volumes:
      - ./logs:/usr/src/app/logs

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=agaseke
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    networks:
      - agaseke-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - agaseke-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - agaseke-api
    restart: unless-stopped
    networks:
      - agaseke-network

volumes:
  mongo_data:
  redis_data:

networks:
  agaseke-network:
    driver: bridge
```

#### Deploy with Docker Compose
```bash
# Create environment file
cp .env.example .env.production
nano .env.production

# Build and start services
docker-compose --env-file .env.production up -d

# View logs
docker-compose logs -f agaseke-api

# Scale application
docker-compose up -d --scale agaseke-api=3
```

### 3. Cloud Deployment (AWS)

#### AWS ECS Deployment
```json
{
  "family": "agaseke-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "agaseke-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/agaseke-api:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGO_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:agaseke/mongo-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:agaseke/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/aws/ecs/agaseke-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Terraform Infrastructure
```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "agaseke" {
  name = "agaseke-cluster"
  
  capacity_providers = ["FARGATE"]
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "agaseke" {
  name               = "agaseke-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = var.public_subnet_ids
  
  enable_deletion_protection = true
}

# ECS Service
resource "aws_ecs_service" "agaseke_api" {
  name            = "agaseke-api"
  cluster         = aws_ecs_cluster.agaseke.id
  task_definition = aws_ecs_task_definition.agaseke_api.arn
  desired_count   = 2
  
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 100
  }
  
  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = var.private_subnet_ids
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.agaseke_api.arn
    container_name   = "agaseke-api"
    container_port   = 5000
  }
}
```

## Frontend Deployment

### 1. Expo Application Services (EAS) Build

#### Install EAS CLI
```bash
npm install -g eas-cli

# Login to Expo account
eas login
```

#### Configure EAS Build
```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

#### Build for Production
```bash
# Android production build
eas build --platform android --profile production

# iOS production build (macOS only)
eas build --platform ios --profile production

# Build for both platforms
eas build --platform all --profile production
```

### 2. App Store Deployment

#### Android (Google Play Console)

1. **Prepare Release**:
   ```bash
   # Build Android App Bundle
   eas build --platform android --profile production
   
   # Download the .aab file when build completes
   ```

2. **Upload to Google Play Console**:
   - Create app listing
   - Upload .aab file
   - Configure store listing
   - Set up content rating
   - Configure pricing & distribution

3. **Automated Submission**:
   ```bash
   # Submit to Google Play (requires service account key)
   eas submit --platform android --profile production
   ```

#### iOS (App Store Connect)

1. **Prerequisites**:
   - Apple Developer Account ($99/year)
   - App Store Connect access
   - iOS Distribution Certificate

2. **Build and Submit**:
   ```bash
   # Build for iOS
   eas build --platform ios --profile production
   
   # Submit to App Store
   eas submit --platform ios --profile production
   ```

3. **App Store Review Process**:
   - Submit for review
   - Respond to review feedback
   - Release when approved

### 3. Over-the-Air (OTA) Updates

#### Configure Expo Updates
```bash
# Install expo-updates
npx expo install expo-updates
```

#### Update Configuration
```json
// app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 30000,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

#### Publish Updates
```bash
# Publish update to production
eas update --branch production --message "Bug fixes and performance improvements"

# Publish to specific channel
eas update --branch staging --message "Testing new features"
```

## Database Deployment

### MongoDB Atlas Setup

#### 1. Create Cluster
```bash
# Using MongoDB Atlas CLI (optional)
atlas clusters create agaseke-prod \
  --provider AWS \
  --region US_EAST_1 \
  --tier M10 \
  --diskSizeGB 20
```

#### 2. Security Configuration
```bash
# Create database user
atlas dbusers create \
  --username agaseke-api \
  --password <secure-password> \
  --role readWrite@agaseke

# Configure network access
atlas accessLists create \
  --type ipAddress \
  --value <your-server-ip>/32
```

#### 3. Connection String
```env
MONGO_URI=mongodb+srv://agaseke-api:<password>@agaseke-prod.abc123.mongodb.net/agaseke?retryWrites=true&w=majority
```

### Database Migration & Seeding

#### Migration Scripts
```javascript
// scripts/migrate.js
const mongoose = require('mongoose');

const migrations = [
  {
    version: '1.0.0',
    up: async () => {
      // Create indexes
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.collection('savings').createIndex({ userId: 1 });
      await mongoose.connection.collection('withdrawals').createIndex({ userId: 1, status: 1 });
    }
  }
];

async function runMigrations() {
  for (const migration of migrations) {
    console.log(`Running migration ${migration.version}`);
    await migration.up();
  }
}
```

#### Run Migrations
```bash
# Production migration
NODE_ENV=production node scripts/migrate.js
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Backend CI/CD
```yaml
# .github/workflows/backend-deploy.yml
name: Backend Deploy

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run tests
        run: |
          cd backend
          npm test
          
      - name: Run linting
        run: |
          cd backend
          npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Login to ECR
        run: aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
        env:
          ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
          
      - name: Build and push Docker image
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/agaseke-api:$GITHUB_SHA .
          docker push $ECR_REGISTRY/agaseke-api:$GITHUB_SHA
          docker tag $ECR_REGISTRY/agaseke-api:$GITHUB_SHA $ECR_REGISTRY/agaseke-api:latest
          docker push $ECR_REGISTRY/agaseke-api:latest
        env:
          ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
          
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster agaseke-cluster \
            --service agaseke-api \
            --force-new-deployment
```

#### Frontend CI/CD
```yaml
# .github/workflows/mobile-build.yml
name: Mobile App Build

on:
  push:
    branches: [main]
    paths: ['front_end/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Expo CLI
        run: npm install -g @expo/cli
        
      - name: Install dependencies
        run: |
          cd front_end
          npm ci
          
      - name: Run tests
        run: |
          cd front_end
          npm test
          
      - name: Build for production
        run: |
          cd front_end
          eas build --platform all --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Monitoring & Logging

### Application Monitoring

#### Health Check Endpoint
```javascript
// backend/routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'DOWN'
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.database = 'UP';
  } catch (error) {
    health.status = 'DOWN';
    health.database = 'DOWN';
  }
  
  const statusCode = health.status === 'UP' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

#### Logging Configuration
```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'agaseke-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### Performance Monitoring

#### APM Integration (New Relic)
```javascript
// backend/app.js (at the very top)
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

// Rest of your application code...
```

#### Error Tracking (Sentry)
```javascript
// Frontend error tracking
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
});

// Backend error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

## Security Considerations

### Production Security Checklist

#### Backend Security
- [ ] Use HTTPS/TLS encryption
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set security headers
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Implement proper error handling
- [ ] Add request logging
- [ ] Use secure session management
- [ ] Implement API versioning

#### Mobile App Security
- [ ] Enable app transport security (iOS)
- [ ] Use certificate pinning
- [ ] Implement proper token storage
- [ ] Add jailbreak/root detection
- [ ] Obfuscate sensitive code
- [ ] Implement proper deep linking
- [ ] Use secure storage for sensitive data

#### Infrastructure Security
- [ ] Use VPC and private subnets
- [ ] Implement WAF rules
- [ ] Set up security groups properly
- [ ] Enable CloudTrail logging
- [ ] Use secrets management service
- [ ] Implement backup strategies
- [ ] Set up monitoring alerts
- [ ] Regular security updates

## Backup & Recovery

### Database Backup Strategy
```bash
# Automated MongoDB Atlas backup
# Atlas provides automatic continuous backup

# Manual backup script for local MongoDB
#!/bin/bash
BACKUP_NAME="agaseke-backup-$(date +%Y%m%d_%H%M%S)"
mongodump --db agaseke --out /backups/$BACKUP_NAME
tar -czf /backups/$BACKUP_NAME.tar.gz /backups/$BACKUP_NAME
rm -rf /backups/$BACKUP_NAME

# Upload to S3 for offsite storage
aws s3 cp /backups/$BACKUP_NAME.tar.gz s3://agaseke-backups/
```

### Application Recovery Plan
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Deploy from latest known good image
3. **DNS Failover**: Point traffic to backup region
4. **Data Synchronization**: Sync any lost data
5. **Testing**: Verify all systems operational

## Performance Optimization

### Backend Optimizations
```javascript
// Connection pooling
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
});

// Response compression
const compression = require('compression');
app.use(compression());

// Caching middleware
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### Frontend Optimizations
```javascript
// Image optimization in Expo
import { Image } from 'expo-image';

// Use optimized image component
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  placeholder={blurhash}
  contentFit="cover"
  transition={1000}
/>

// Bundle splitting
const LazyScreen = React.lazy(() => import('./screens/LazyScreen'));

// Performance monitoring
import { Performance } from 'expo-performance';

Performance.mark('app-start');
// ... app initialization
Performance.mark('app-ready');
Performance.measure('app-startup', 'app-start', 'app-ready');
```

------