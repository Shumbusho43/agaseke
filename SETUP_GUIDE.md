# AGASEKE Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the AGASEKE digital piggy bank application on your local development environment. The setup includes both the React Native frontend and Node.js backend components.

## Prerequisites

### System Requirements

#### General Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 20GB free disk space
- **Internet Connection**: Required for dependency installation

#### Required Software

1. **Node.js (v18.0.0 or higher)**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm (usually comes with Node.js)**
   - Verify installation: `npm --version`
   - Update if needed: `npm install -g npm@latest`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Mobile Development Setup

#### For Android Development

1. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 33 or higher)
   - Set up Android Virtual Device (AVD)

2. **Environment Variables**
   Add to your system PATH:
   ```bash
   # macOS/Linux (~/.bashrc or ~/.zshrc)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools

   # Windows (System Environment Variables)
   ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   Path=%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   ```

#### For iOS Development (macOS only)

1. **Xcode**
   - Install from Mac App Store
   - Version 14 or higher required
   - Install iOS Simulator

2. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

### Database Setup

#### MongoDB Installation

**Option 1: Local Installation**
1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Follow platform-specific installation instructions
3. Start MongoDB service:
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

**Option 2: MongoDB Atlas (Cloud)**
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string for environment variables

## Project Setup

### 1. Clone the Repository

```bash
# Clone the project
git clone <repository-url>
cd agaseke

# Verify project structure
ls -la
# Should show: backend/, front_end/, README.md
```

### 2. Backend Setup

#### Install Dependencies
```bash
# Navigate to backend directory
cd backend

# Install npm dependencies
npm install

# Verify installation
npm ls
```

#### Environment Configuration
```bash
# Create environment file
touch .env

# Add configuration (edit with your preferred editor)
nano .env
```

Add the following content to `.env`:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/agaseke

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: If using MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agaseke?retryWrites=true&w=majority
```

**Important Security Notes:**
- Generate a secure JWT secret (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Never commit `.env` file to version control
- Use different secrets for development and production

#### Database Initialization
```bash
# Start MongoDB (if running locally)
# MongoDB should be running before starting the backend

# Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agaseke')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

#### Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Verify server is running
curl http://localhost:5000/api/documentation
```

Expected output:
```
Server running on port 5000
MongoDB Connected...
```

### 3. Frontend Setup

#### Install Global Dependencies
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

#### Install Project Dependencies
```bash
# Navigate to frontend directory (from project root)
cd front_end

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

#### Configure API Endpoint
```bash
# Edit API configuration
nano src/services/api.js
```

Update the API base URL:
```javascript
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
```

For Android emulator, use:
```javascript
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";
```

## Running the Application

### 1. Start Backend Server
```bash
# In backend directory
cd backend
npm run dev
```

### 2. Start Frontend Application

#### Method 1: Expo Development Server
```bash
# In front_end directory
cd front_end
npx expo start

# This will open a QR code in terminal
# Scan with Expo Go app on mobile device
```

#### Method 2: Android Emulator
```bash
# Ensure Android emulator is running
# In front_end directory
npx expo run:android
```

#### Method 3: iOS Simulator (macOS only)
```bash
# In front_end directory
npx expo run:ios
```

#### Method 4: Web Browser
```bash
# In front_end directory
npx expo start --web
```

## Verification Steps

### 1. Backend Verification

#### Test API Endpoints
```bash
# Test server health
curl http://localhost:5000/api/documentation

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "coSignerEmail": "cosigner@example.com"
  }'

# Expected response: {"message": "User registered successfully"}
```

#### Check Database
```bash
# Connect to MongoDB
mongo agaseke

# List collections
show collections

# View users (should show test user)
db.users.find().pretty()
```

### 2. Frontend Verification

#### Check App Launch
- App should launch without errors
- Navigate through different screens
- Test theme toggle in Settings
- Verify navigation works properly

#### Test API Integration
1. **Registration Flow**:
   - Open SignupScreen
   - Fill registration form
   - Submit and verify success

2. **Login Flow**:
   - Navigate to LoginScreen
   - Enter credentials
   - Verify successful login and navigation to HomeScreen

3. **Core Features**:
   - Create savings goal
   - Add funds
   - Request withdrawal

## Troubleshooting

### Common Backend Issues

#### MongoDB Connection Errors
```bash
# Error: MongooseServerSelectionError
# Solution 1: Check if MongoDB is running
brew services list | grep mongodb

# Solution 2: Check connection string
echo $MONGO_URI

# Solution 3: Test direct connection
mongo mongodb://localhost:27017/agaseke
```

#### Port Already in Use
```bash
# Error: EADDRINUSE :::5000
# Solution: Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

#### JWT Secret Missing
```bash
# Error: JWT secret not defined
# Solution: Ensure .env file has JWT_SECRET
grep JWT_SECRET .env

# Generate new secret if missing
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Common Frontend Issues

#### Expo CLI Not Found
```bash
# Error: expo command not found
# Solution: Reinstall Expo CLI
npm uninstall -g expo-cli @expo/cli
npm install -g @expo/cli
```

#### Metro Bundler Issues
```bash
# Error: Metro bundler can't resolve module
# Solution: Clear cache and restart
npx expo start --clear

# Or reset metro cache
npx expo r -c
```

#### Android Emulator Connection
```bash
# Error: Could not connect to Android emulator
# Solution 1: Check emulator is running
adb devices

# Solution 2: Use correct API URL for emulator
# In api.js, use: http://10.0.2.2:5000/api
```

#### iOS Simulator Issues (macOS)
```bash
# Error: iOS Simulator not found
# Solution: Install Xcode command line tools
xcode-select --install

# Verify iOS Simulator
xcrun simctl list devices
```

### Network Issues

#### API Not Reachable from Mobile Device
1. **Check Network Connection**:
   - Ensure device and computer on same network
   - Use computer's IP address instead of localhost

2. **Find Computer IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

3. **Update API URL**:
   ```javascript
   // Use your computer's IP address
   const API_BASE_URL = "http://192.168.1.XXX:5000/api";
   ```

#### CORS Issues
```bash
# Error: CORS policy blocking request
# Solution: Verify CORS configuration in backend
# In app.js, ensure CORS allows your frontend origin
```

## Development Workflow

### 1. Daily Development Setup
```bash
# Terminal 1: Start MongoDB (if local)
brew services start mongodb-community

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
cd front_end && npx expo start
```

### 2. Code Changes Workflow
1. Make code changes
2. Backend: Nodemon auto-restarts server
3. Frontend: Metro bundler hot-reloads app
4. Test changes on device/emulator

### 3. Database Management
```bash
# View database contents
mongo agaseke
db.users.find().pretty()
db.savings.find().pretty()
db.withdrawals.find().pretty()

# Clear database for testing
db.users.deleteMany({})
db.savings.deleteMany({})
db.withdrawals.deleteMany({})
```

## IDE Setup Recommendations

### Visual Studio Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **React Native Tools**
- **Expo Tools**
- **Thunder Client** (API testing)
- **MongoDB for VS Code**
- **ESLint**
- **Prettier**

### Android Studio Configuration
- Enable USB Debugging on physical device
- Create AVD with API level 33+
- Install React Native debugger

## Next Steps

After successful setup:

1. **Explore the codebase**: Review ARCHITECTURE.md
2. **Read API documentation**: Check API_DOCUMENTATION.md
3. **Test core features**: Create savings goals, add funds, request withdrawals
4. **Review deployment guide**: Check DEPLOYMENT.md for production setup

## Support

If you encounter issues not covered in this guide:

1. Check the project's GitHub issues
2. Review logs for specific error messages
3. Verify all prerequisites are correctly installed
4. Ensure environment variables are properly set



-------