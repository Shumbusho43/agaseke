# AGASEKE System Architecture

## Overview

AGASEKE is a digital piggy bank application built with React Native (Expo) for the frontend and Node.js/Express for the backend, using MongoDB as the database. This document provides a comprehensive overview of the system architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  React Native Mobile App (Expo)                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Navigation    │ │   UI Screens    │ │   Components    │   │
│  │   Stack/Tabs    │ │   (13 screens)  │ │   Reusable      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  State Mgmt     │ │   Local Storage │ │   API Service   │   │
│  │  Context API    │ │   AsyncStorage  │ │   Axios HTTP    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS/REST API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express.js API Server                              │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Middleware    │ │     Routes      │ │   Controllers   │   │
│  │   Auth/CORS     │ │   Auth/Savings  │ │   Business      │   │
│  │   JWT Verify    │ │   Withdrawals   │ │   Logic         │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐                      │
│  │   Swagger Docs  │ │   Environment   │                      │
│  │   API Docs      │ │   Config        │                      │
│  └─────────────────┘ └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ MongoDB Driver
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database                                              │
│                                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │     Users       │ │    Savings      │ │   Withdrawals   │   │
│  │   Collection    │ │   Collection    │ │   Collection    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (React Native + Expo)
- **React Native 0.81.5**: Cross-platform mobile development
- **Expo SDK 54**: Development toolchain and runtime
- **React Navigation 6**: Navigation and routing management
- **Axios**: HTTP client for API communication
- **AsyncStorage**: Persistent local storage
- **Context API**: State management
- **Expo Vector Icons**: Icon library

### Backend (Node.js + Express)
- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **MongoDB + Mongoose 8.19.2**: NoSQL database and ODM
- **JWT + bcryptjs**: Authentication and password security
- **Swagger**: API documentation and testing
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Component Architecture

### Frontend Structure
```
front_end/
├── App.js                    # Main application entry point
├── src/
│   ├── screens/              # Application screens (13 screens)
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── SettingsScreen.js
│   │   └── ...
│   ├── components/           # Reusable UI components
│   │   ├── BalanceCard.js
│   │   ├── Numberpad.js
│   │   └── ...
│   ├── context/              # React Context providers
│   │   └── AuthContext.js
│   ├── theme/                # Theme and styling
│   │   ├── ThemeContext.js
│   │   └── colors.js
│   └── services/             # API and external services
│       └── api.js
```

### Backend Structure
```
backend/
├── app.js                    # Main server entry point
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/              # Business logic controllers
│   ├── authController.js
│   ├── savingController.js
│   └── withdrawalController.js
├── middleware/               # Custom middleware
│   └── authMiddleware.js
├── models/                   # Database models
│   ├── userModel.js
│   ├── savingModel.js
│   └── withdrawalModel.js
├── routes/                   # API route definitions
│   ├── authRoutes.js
│   ├── savingRoutes.js
│   └── withdrawalRoutes.js
└── swagger.js                # API documentation setup
```

## Data Flow and Interactions

### Authentication Flow
```
1. User Registration
   Mobile App → POST /api/auth/register → Hash Password → Store in MongoDB
   
2. User Login  
   Mobile App → POST /api/auth/login → Validate Credentials → Generate JWT → Store in AsyncStorage
   
3. Protected Requests
   Mobile App (Bearer Token) → JWT Middleware → Verify Token → Controller → MongoDB
```

### Core Application Flow

#### Savings Management
```
1. Create Saving Goal
   NewGoalScreen → POST /api/saving/create → savingController → MongoDB
   
2. Add Funds
   DepositScreen → POST /api/saving/add → Update Balance → MongoDB
   
3. View Savings
   HomeScreen → GET /api/saving → Display Balance & Goals
```

#### Withdrawal Process
```
1. Request Withdrawal
   WithdrawScreen → POST /api/withdrawal/create → Pending Status → MongoDB
   
2. Process Withdrawal
   Admin/CoSigner → PUT /api/withdrawal/:id → Approve/Reject → MongoDB
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with expiration
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Bearer Token**: Automatic token attachment via Axios interceptors
- **Protected Routes**: Middleware-based route protection
- **CORS Protection**: Cross-origin request security

### Data Security
- **Environment Variables**: Sensitive configuration isolation
- **Input Validation**: Request data validation and sanitization
- **Error Handling**: Secure error messages without sensitive data exposure

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  coSignerEmail: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Saving Model
```javascript
{
  userId: ObjectId (reference to User),
  goalName: String,
  targetAmount: Number,
  currentAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal Model
```javascript
{
  userId: ObjectId (reference to User),
  amount: Number,
  reason: String,
  status: String (pending/approved/rejected),
  requestedAt: Date,
  processedAt: Date
}
```

## Navigation Structure

### Authenticated Flow
```
MainTabs (Bottom Navigation)
├── HomeScreen          # Dashboard and balance overview
├── ActivityScreen      # Transaction history
├── TermsScreen         # Terms and conditions
└── SettingsScreen      # App settings and preferences

Stack Screens (Modal/Push)
├── DepositScreen       # Add funds to savings
├── WithdrawScreen      # Request withdrawal
├── TransferScreen      # Transfer funds
├── GoalsScreen         # View savings goals
├── NewGoalScreen       # Create new savings goal
└── DownloadInfoScreen  # App download information
```

### Unauthenticated Flow
```
AuthStack
├── GetStartedScreen    # Onboarding (first launch only)
├── LoginScreen         # User authentication
└── SignupScreen        # User registration
```

## State Management

### Context Providers
- **AuthContext**: Manages user authentication state, login/logout functions
- **ThemeContext**: Handles dark/light mode theme switching

### Local Storage
- **AsyncStorage**: Persists JWT tokens for automatic login

## API Design Patterns

### RESTful Endpoints
- **GET**: Retrieve data (user profile, savings, withdrawals)
- **POST**: Create new resources (register, login, create savings)
- **PUT**: Update existing resources (modify goals, process withdrawals)
- **DELETE**: Remove resources (delete goals, cancel withdrawals)

### Response Format
```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE"
}
```

## Performance Considerations

### Frontend Optimizations
- **Component Memoization**: Prevent unnecessary re-renders
- **Image Optimization**: Optimized asset loading
- **Bundle Splitting**: Code splitting for faster initial load

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connection management
- **Request Validation**: Early request validation to reduce processing

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: JWT-based authentication enables horizontal scaling
- **Database Sharding**: MongoDB supports horizontal scaling
- **Load Balancing**: Multiple server instances behind load balancer

### Vertical Scaling
- **Resource Optimization**: Efficient memory and CPU usage
- **Database Optimization**: Query optimization and indexing
- **Caching Strategies**: Redis integration for frequently accessed data

## Future Architecture Enhancements

### Microservices Migration
- **Service Decomposition**: Split into user, savings, and notification services
- **API Gateway**: Centralized request routing and authentication
- **Message Queues**: Asynchronous communication between services

### Real-time Features
- **WebSocket Integration**: Real-time notifications and updates
- **Push Notifications**: Mobile push notification service
- **Live Updates**: Real-time balance and transaction updates

### Advanced Security
- **OAuth Integration**: Third-party authentication providers
- **Rate Limiting**: API request rate limiting
- **Audit Logging**: Comprehensive security audit trails

-----