# AGASEKE UML Diagrams & Technical Illustrations

## Overview

This document contains UML diagrams and technical illustrations that demonstrate the system architecture, data relationships, and workflow processes of the AGASEKE digital piggy bank application.

## 1. Entity Relationship Diagram (ERD)

### Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS COLLECTION                        │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId (PK)                                         │
│ name: String                                               │
│ email: String (UNIQUE)                                     │
│ password: String (HASHED)                                  │
│ coSignerEmail: String                                      │
│ createdAt: Date                                           │
│ updatedAt: Date                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SAVINGS COLLECTION                       │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId (PK)                                         │
│ userId: ObjectId (FK → Users._id)                         │
│ goalName: String                                          │
│ targetAmount: Number                                       │
│ currentAmount: Number                                      │
│ lockUntil: Date                                           │
│ createdAt: Date                                           │
│ updatedAt: Date                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 WITHDRAWALS COLLECTION                      │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId (PK)                                         │
│ userId: ObjectId (FK → Users._id)                         │
│ amount: Number                                            │
│ status: String [pending, approved, rejected]              │
│ reason: String                                            │
│ processedAt: Date                                         │
│ processedBy: String                                       │
│ createdAt: Date                                           │
│ updatedAt: Date                                           │
└─────────────────────────────────────────────────────────────┘
```

### Relationship Constraints
- **User → Savings**: One-to-One (One user can have exactly one savings goal)
- **User → Withdrawals**: One-to-Many (One user can have multiple withdrawal requests)
- **Co-Signer Relationship**: Users.coSignerEmail links to another Users.email for approval workflow

## 2. Class Diagram

### Backend Models & Controllers

```
┌─────────────────────────┐     ┌─────────────────────────┐
│      User Model         │     │   AuthController        │
├─────────────────────────┤     ├─────────────────────────┤
│ - _id: ObjectId         │     │ + register()            │
│ - name: String          │     │ + login()               │
│ - email: String         │     │ + getProfile()          │
│ - password: String      │     │ - generateToken()       │
│ - coSignerEmail: String │     │ - validateCredentials() │
│ - timestamps            │     └─────────────────────────┘
├─────────────────────────┤                │
│ + comparePassword()     │                │
│ + hashPassword()        │                │
│ + validateEmail()       │                │
└─────────────────────────┘                │
            │                              │
            │ 1:1                          │
            ▼                              │
┌─────────────────────────┐                │
│     Saving Model        │                │
├─────────────────────────┤                │
│ - _id: ObjectId         │                │
│ - userId: ObjectId      │     ┌─────────────────────────┐
│ - goalName: String      │     │   SavingController      │
│ - targetAmount: Number  │     ├─────────────────────────┤
│ - currentAmount: Number │◄────┤ + createSaving()        │
│ - lockUntil: Date       │     │ + addFunds()            │
│ - timestamps            │     │ + getUserSavings()      │
├─────────────────────────┤     │ + getSavingById()       │
│ + calculateProgress()   │     │ - validateAmount()      │
│ + isLocked()           │     │ - checkGoalExists()     │
│ + addFunds()           │     └─────────────────────────┘
└─────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────┐
│   Withdrawal Model      │     ┌─────────────────────────┐
├─────────────────────────┤     │ WithdrawalController    │
│ - _id: ObjectId         │     ├─────────────────────────┤
│ - userId: ObjectId      │     │ + requestWithdrawal()   │
│ - amount: Number        │◄────┤ + approveWithdrawal()   │
│ - status: String        │     │ + getUserWithdrawals()  │
│ - reason: String        │     │ + getPendingForCoSigner()│
│ - processedAt: Date     │     │ - validateRequest()     │
│ - processedBy: String   │     │ - authorizeCoSigner()   │
│ - timestamps            │     │ - processApproval()     │
├─────────────────────────┤     └─────────────────────────┘
│ + approve()             │
│ + reject()              │
│ + isPending()           │
└─────────────────────────┘
```

## 3. Use Case Diagram

### System Actors & Use Cases

```
                    AGASEKE Digital Piggy Bank System
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────┐                                   ┌─────────┐          │
│  │  User   │                                   │Co-Signer│          │
│  │(Primary)│                                   │(Secondary)│        │
│  └────┬────┘                                   └────┬────┘          │
│       │                                             │               │
│       ├── Register Account                          │               │
│       ├── Login/Logout                              │               │
│       ├── Create Savings Goal ──────┐               │               │
│       ├── Add Funds to Savings ─────┼─ [Extends]    │               │
│       ├── View Savings Balance ──────┘               │               │
│       ├── View Transaction History                   │               │
│       ├── Request Withdrawal ────────────────────────┼── Review Withdrawal Request
│       ├── View Withdrawal Status                     ├── Approve Withdrawal
│       ├── Change Theme Settings                      ├── Reject Withdrawal  
│       └── Update Profile Information                 └── View Pending Requests
│                                                                     │
│                        [System Boundary]                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      Use Case Relationships                        │
├─────────────────────────────────────────────────────────────────────┤
│ <<include>>: Request Withdrawal includes Validate Lock Date        │
│ <<include>>: Approve Withdrawal includes Deduct from Savings       │
│ <<extend>>:  Add Funds extends View Savings Balance                │
│ <<extend>>:  Create Goal extends View Savings Balance              │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. Sequence Diagrams

### 4.1 User Registration Sequence

```
User    Frontend    API Server    Database    Email Service
 │         │            │           │             │
 ├─ Enter Registration Data ───►     │           │             │
 │         │            │           │             │
 │         ├─ POST /api/auth/register │           │             │
 │         │            ├─ Validate Input         │             │
 │         │            ├─ Check Email Exists ───►│             │
 │         │            │◄─ Email Available ──────│             │
 │         │            ├─ Hash Password          │             │
 │         │            ├─ Save User ─────────────►│             │
 │         │            │◄─ User Created ─────────│             │
 │         │            ├─ Send Welcome Email ────┼─────────────►│
 │         │◄─ Registration Success ─────────────  │             │
 ◄─ Show Success Message ───────│   │             │             │
 │         │            │           │             │
```

### 4.2 Withdrawal Request & Approval Sequence

```
User     Frontend    API Server    Database    CoSigner    Email
 │          │           │            │           │           │
 ├─ Request Withdrawal ──►           │            │           │
 │          ├─ POST /api/withdrawal/request       │           │
 │          │           ├─ Auth Check │           │           │
 │          │           ├─ Get Savings ──────────►│           │
 │          │           │◄─ Savings Data ────────│           │
 │          │           ├─ Validate Lock Date    │           │
 │          │           ├─ Check Funds Available │           │
 │          │           ├─ Create Withdrawal ────►│           │
 │          │           ├─ Send Notification ─────┼───────────►│
 │          │◄─ Request Created ──────────────────│           │
 ◄─ Show Confirmation ──│           │            │           │
 │          │           │            │           │           │
 │          │           │            │           │           │
 │          │           │            │     ┌─────┴─ Check Email
 │          │           │            │     │     │           │
 │          │           │            │     ├─ Review Request │
 │          │           │            │     │     │           │
 │          │           │◄─ PUT /api/withdrawal/:id/approve  │
 │          │           ├─ Verify CoSigner Auth   │          │
 │          │           ├─ Update Status ─────────►│          │
 │          │           ├─ Process Funds Transfer │          │
 │          │           ├─ Update Savings ────────►│          │
 │          │           ├─ Send Confirmation ──────┼──────────►│
 │          │◄─ Real-time Update ─────────────────│          │
 ◄─ Show Approval ──────│           │            │          │
```

### 4.3 Authentication Flow Sequence

```
Mobile App    AsyncStorage    API Server    Database    JWT Service
    │              │              │            │             │
    ├─ App Launch ──►              │            │             │
    │              ├─ Get Token ───►            │             │
    │              │◄─ Token/null ─┤            │             │
    │              │              │            │             │
    ├─ Token exists? ──────────────┤            │             │
    │              │              ├─ GET /api/auth/me        │
    │              │              │            │             │
    │              │              ├─ Verify Token ───────────►│
    │              │              │◄─ Token Valid ───────────┤
    │              │              ├─ Get User ───────────────►│
    │              │              │◄─ User Data ─────────────┤
    │◄─ Authenticated State ───────│            │             │
    │              │              │            │             │
    │   [User logs out]           │            │             │
    │              │              │            │             │
    ├─ Logout Request ─────────────►            │             │
    │              ├─ Clear Token ──►            │             │
    │◄─ Redirect to Login ─────────│            │             │
```

## 5. Activity Diagrams

### 5.1 Savings Goal Creation Flow

```
                    Create Savings Goal Activity
                    ┌─────────────────────────┐
                    │     Start Process       │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  User Enters Goal Data  │
                    │  (Name, Amount, Date)   │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │    Validate Input       │
                    └──────────┬──────────────┘
                               │
                         ┌─────▼─────┐
                         │Valid Data?│
                         └─────┬─────┘
                               │ No
                    ┌──────────▼──────────────┐
              Yes   │   Show Error Message    │
        ┌───────────│   Return to Form        │
        │           └─────────────────────────┘
        │
        ▼
┌──────────────────┐
│Check Existing    │
│Savings Goal      │
└─────────┬────────┘
          │
    ┌─────▼─────┐
    │Goal Exists?│
    └─────┬─────┘
          │ Yes
┌─────────▼─────────┐
│Show Error:        │
│"Goal Already      │  No
│Exists"            │  │
└───────────────────┘  │
                       ▼
              ┌─────────────────┐
              │Validate Date    │
              │is Future        │
              └─────────┬───────┘
                        │
                  ┌─────▼─────┐
                  │Valid Date?│
                  └─────┬─────┘
                        │ Yes
                  ┌─────▼─────┐
                  │Save Goal  │
                  │to Database│
                  └─────┬─────┘
                        │
                  ┌─────▼─────┐
                  │Show Success│
                  │Message     │
                  └─────┬─────┘
                        │
                  ┌─────▼─────┐
                  │Navigate to│
                  │Home Screen│
                  └───────────┘
```

### 5.2 Withdrawal Approval Process

```
                 Withdrawal Approval Process
     ┌─────────────────────────────────────────────────┐
     │              Start: User Requests Withdrawal     │
     └──────────────────────┬──────────────────────────┘
                            │
     ┌──────────────────────▼──────────────────────────┐
     │         Validate Withdrawal Request              │
     │    • Check lock date                            │
     │    • Verify sufficient funds                    │
     │    • Check no pending withdrawal                │
     └──────────────────────┬──────────────────────────┘
                            │
                      ┌─────▼─────┐
                      │Valid      │
                      │Request?   │
                      └─────┬─────┘
                            │ Yes        No
                            │       ┌────▼────┐
                            │       │Reject   │
                            │       │Request  │
                            │       └─────────┘
                            ▼
     ┌──────────────────────────────────────────────────┐
     │            Create Withdrawal Record              │
     │              Status: "pending"                   │
     └──────────────────────┬──────────────────────────┘
                            │
     ┌──────────────────────▼──────────────────────────┐
     │          Notify Co-Signer via Email             │
     └──────────────────────┬──────────────────────────┘
                            │
        ┌────────────────────▼────────────────────┐
        │         Co-Signer Reviews Request        │
        └────────────────────┬────────────────────┘
                            │
                      ┌─────▼─────┐
                      │Approve or │
                      │Reject?    │
                      └─────┬─────┘
                            │
            ┌───────────────▼───────────────┐
            │                               │
            ▼                               ▼
     ┌─────────────┐                ┌─────────────┐
     │   Approve   │                │   Reject    │
     └─────┬───────┘                └─────┬───────┘
           │                              │
           ▼                              ▼
   ┌───────────────┐              ┌───────────────┐
   │Deduct Amount  │              │Update Status  │
   │from Savings   │              │to "rejected"  │
   └───────┬───────┘              └───────┬───────┘
           │                              │
           ▼                              │
   ┌───────────────┐              ┌───────▼───────┐
   │Update Status  │              │Notify User    │
   │to "approved"  │              │of Rejection   │
   └───────┬───────┘              └───────────────┘
           │
           ▼
   ┌───────────────┐
   │Notify User    │
   │of Approval    │
   └───────────────┘
```

## 6. Component Architecture Diagram

### Frontend React Native Component Hierarchy

```
                            App.js
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ThemeProvider                 AuthProvider
                │                           │
        NavigationContainer                 │
                │                           │
            RootNavigator                   │
                │                           │
        ┌───────┴───────┐                   │
        │               │                   │
    AuthFlow        AppFlow                 │
        │               │                   │
   ┌────┴────┐     ┌────┴────┐             │
   │         │     │         │             │
GetStarted MainTabs    Stack Screens       │
LoginScreen   │         │                  │
SignupScreen  │         ├── DepositScreen  │
              │         ├── WithdrawScreen │
        ┌─────┴─────┐   ├── TransferScreen │
        │           │   ├── GoalsScreen    │
   HomeScreen  ActivityScreen             │
   TermsScreen SettingsScreen             │
        │           │                     │
        │           └─ ThemeToggle        │
        │                                 │
   ┌────┴─────┐                          │
   │          │                          │
BalanceCard QuickActions                  │
   │          │                          │
Section   PaymentMethodPicker            │
   │          │                          │
Numberpad  Screen ◄─────────────────────────────┘
```

### Component Props Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Props Flow Diagram                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AuthContext                    ThemeContext                   │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │ • token              │      │ • isDarkMode         │       │
│  │ • user               │      │ • colors             │       │
│  │ • login()            │      │ • toggleTheme()      │       │
│  │ • logout()           │      └──────────┬───────────┘       │
│  │ • isInitializing     │                 │                   │
│  └──────────┬───────────┘                 │                   │
│             │                             │                   │
│             ├─────────────────────────────┼─────────────┐     │
│             │                             │             │     │
│             ▼                             ▼             ▼     │
│    ┌─────────────────┐           ┌─────────────────┐ ┌──────────┐
│    │   HomeScreen    │           │ SettingsScreen  │ │Screen    │
│    ├─────────────────┤           ├─────────────────┤ │Component │
│    │Props:           │           │Props:           │ │          │
│    │• navigation     │           │• navigation     │ │Props:    │
│    └─────────┬───────┘           │• user data      │ │• children│
│              │                   │• theme toggle   │ │• style   │
│              ▼                   └─────────────────┘ └──────────┘
│    ┌─────────────────┐                                          │
│    │  BalanceCard    │           ┌─────────────────┐           │
│    ├─────────────────┤           │  QuickActions   │           │
│    │Props:           │           ├─────────────────┤           │
│    │• balance        │           │Props:           │           │
│    │• goalAmount     │           │• onDeposit()    │           │
│    │• goalName       │           │• onWithdraw()   │           │
│    │• colors         │           │• onTransfer()   │           │
│    └─────────────────┘           │• colors         │           │
│                                  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## 7. API Architecture Diagram

### RESTful API Structure

```
                     AGASEKE API Architecture
┌─────────────────────────────────────────────────────────────────┐
│                      Client Requests                           │
│                    (Mobile App / Web)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express.js Server                          │
├─────────────────────────────────────────────────────────────────┤
│                    Middleware Stack                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │    CORS     │→│Rate Limiting│→│ Body Parser │→│   Auth   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Router Layer                             │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │  /api/auth/*    │ │ /api/saving/*   │ │/api/withdrawal/*│   │
│ │  ├─ POST /register│ │ ├─ POST /create│ │├─ POST /request │   │
│ │  ├─ POST /login │ │ ├─ POST /add    │ │├─ PUT /:id/approve│  │
│ │  └─ GET /me     │ │ ├─ GET /        │ │├─ GET /         │   │
│ └─────────────────┘ │ └─ GET /:id     │ │└─ GET /pending  │   │
│                     └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Controller Layer                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │ AuthController  │ │SavingController │ │WithdrawController│  │
│ │  ├─ register()  │ │ ├─ createSaving()│ │├─ requestWith...│   │
│ │  ├─ login()     │ │ ├─ addFunds()   │ │├─ approveWith...│   │
│ │  └─ getProfile()│ │ ├─ getUserSavings│ │├─ getUserWith...│   │
│ └─────────────────┘ │ └─ getSavingById │ │└─ getPendingFor.│   │
│                     └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Model Layer (ODM)                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │   User Model    │ │  Saving Model   │ │ Withdrawal Model│   │
│ │  ├─ Schema      │ │  ├─ Schema      │ │ ├─ Schema       │   │
│ │  ├─ Validation  │ │  ├─ Validation  │ │ ├─ Validation   │   │
│ │  ├─ Middleware  │ │  ├─ Middleware  │ │ ├─ Middleware   │   │
│ │  └─ Methods     │ │  └─ Methods     │ │ └─ Methods      │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │     users       │ │    savings      │ │   withdrawals   │   │
│ │   collection    │ │   collection    │ │   collection    │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Data Flow Diagrams

### 8.1 User Registration Data Flow

```
                    User Registration Data Flow
    
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Mobile    │    │  Frontend   │    │   Backend   │    │  Database   │
    │    User     │    │Signup Screen│    │ Auth API    │    │  MongoDB    │
    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
          │                  │                  │                  │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 1. User enters registration data (name, email, password, coSigner)    │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 2. Frontend validates input (email format, password strength)         │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 3. POST /api/auth/register with user data                             │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 4. Backend validates data and checks email uniqueness                 │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 5. Password hashed with bcrypt (10 salt rounds)                       │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 6. User document created and saved to MongoDB                         │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 7. Success response sent to frontend                                  │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 8. Frontend shows success message and navigates to login              │
    └───────────────────────────────────────────────────────────────────────┘
```

### 8.2 Savings Addition Data Flow

```
                     Add Funds to Savings Data Flow
    
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Mobile    │    │  Frontend   │    │   Backend   │    │  Database   │
    │    User     │    │Deposit Screen│    │Savings API  │    │  MongoDB    │
    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
          │                  │                  │                  │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 1. User enters amount to add to savings                               │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 2. Frontend validates amount (positive number, reasonable limit)      │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 3. POST /api/saving/add with amount and auth token                    │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 4. Backend authenticates user via JWT middleware                      │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 5. Find user's savings goal in database                               │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 6. Add amount to currentAmount field                                  │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 7. Save updated savings document to MongoDB                           │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 8. Return updated savings data with new balance                       │
    └─────┬─────────────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────────────────────────────────────────────────────────────────┐
    │ 9. Frontend updates UI with new balance and progress                  │
    └───────────────────────────────────────────────────────────────────────┘
```

## 9. State Management Diagram

### React Context State Flow

```
                      React Context State Management
    
                           ┌─────────────────┐
                           │    App.js       │
                           │  Root Component │
                           └─────────┬───────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Context Providers   │
                         │                       │
         ┌───────────────┼─ ThemeProvider       │
         │               │─ AuthProvider        │
         │               └───────────┬───────────┘
         │                           │
         │                           ▼
         │               ┌─────────────────────┐
         │               │  NavigationContainer│
         │               └─────────┬───────────┘
         │                         │
         │                         ▼
         │               ┌─────────────────────┐
         │               │   Screen Components │
         │               └─────────┬───────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌─────────────────────┐
│  ThemeContext   │      │    AuthContext      │
├─────────────────┤      ├─────────────────────┤
│State:           │      │State:               │
│• isDarkMode     │      │• token              │
│• colors         │      │• user               │
│                 │      │• isInitializing     │
│Actions:         │      │                     │
│• toggleTheme()  │      │Actions:             │
│                 │      │• login()            │
│Storage:         │      │• register()         │
│• AsyncStorage   │      │• logout()           │
└─────────────────┘      │• refreshProfile()   │
                         │                     │
                         │Storage:             │
                         │• AsyncStorage       │
                         │  (auth token)       │
                         └─────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │     API Service     │
                         ├─────────────────────┤
                         │• axios instance     │
                         │• request interceptor│
                         │• response interceptor│
                         │• error handling     │
                         │• token management   │
                         └─────────────────────┘
```

## 10. Deployment Architecture Diagram

### Production Deployment Structure

```
                        Production Deployment Architecture
    
    ┌───────────────────────────────────────────────────────────────────────┐
    │                             Users                                     │
    │         ┌─────────────┐              ┌─────────────┐                 │
    │         │iOS App Store│              │Google Play  │                 │
    │         │   Users     │              │   Users     │                 │
    │         └─────┬───────┘              └─────┬───────┘                 │
    └───────────────┼────────────────────────────┼───────────────────────────┘
                    │                            │
                    └──────────────┬─────────────┘
                                   │ HTTPS
                    ┌──────────────▼─────────────┐
                    │      Load Balancer         │
                    │      (AWS ALB/Nginx)       │
                    └──────────────┬─────────────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │       API Gateway          │
                    │   • SSL Termination        │
                    │   • Rate Limiting          │
                    │   • Request Routing        │
                    └──────────────┬─────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                     │                      │
            ▼                     ▼                      ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  Backend Server │  │  Backend Server │  │  Backend Server │
    │   Instance 1    │  │   Instance 2    │  │   Instance 3    │
    │                 │  │                 │  │                 │
    │ • Node.js/Express│ │ • Node.js/Express│ │ • Node.js/Express│
    │ • JWT Auth      │  │ • JWT Auth      │  │ • JWT Auth      │
    │ • Business Logic│  │ • Business Logic│  │ • Business Logic│
    └─────────┬───────┘  └─────────┬───────┘  └─────────┬───────┘
              │                    │                    │
              └──────────────────┬─┘                    │
                                 │                      │
                                 ▼                      │
                    ┌─────────────────────┐             │
                    │   Database Cluster  │             │
                    │   (MongoDB Atlas)   │             │
                    │                     │             │
                    │ ┌─────────────────┐ │             │
                    │ │   Primary       │ │             │
                    │ │   Replica       │ │             │
                    │ └─────────────────┘ │             │
                    │ ┌─────────────────┐ │             │
                    │ │   Secondary     │ │             │
                    │ │   Replica 1     │ │             │
                    │ └─────────────────┘ │             │
                    │ ┌─────────────────┐ │             │
                    │ │   Secondary     │ │             │
                    │ │   Replica 2     │ │             │
                    │ └─────────────────┘ │             │
                    └─────────────────────┘             │
                                                        │
                    ┌───────────────────────────────────┼─┐
                    │         Support Services          │ │
                    │                                   │ │
                    │ ┌─────────────────┐ ┌─────────────▼─┐
                    │ │     Redis       │ │   Log        ││
                    │ │   (Caching)     │ │ Aggregation  ││
                    │ └─────────────────┘ │(ELK Stack)   ││
                    │                     └──────────────┘│
                    │ ┌─────────────────┐ ┌───────────────┐│
                    │ │   Monitoring    │ │   Backup      ││
                    │ │  (New Relic)    │ │   Service     ││
                    │ └─────────────────┘ └───────────────┘│
                    └─────────────────────────────────────┘
```
------
