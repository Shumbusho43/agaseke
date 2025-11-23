# AGASEKE API Documentation

## Overview

This document provides comprehensive documentation for the AGASEKE digital piggy bank API. The API is built with Node.js and Express.js, using JWT for authentication and MongoDB for data persistence.

**GITHUB URL**: `https://github.com/Shumbusho43/agaseke`  
**Base URL**: `http://localhost:5000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`


## Authentication

### JWT Token Usage
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Token expires after 7 days and must be refreshed by logging in again.

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "Gisele Test",
  "email": "gisele@gmail.com",
  "password": "securepassword123",
  "coSignerEmail": "cosigner@example.com"
}
```

**Response (201 - Success):**
```json
{
  "message": "User registered successfully"
}
```

**Response (400 - User Exists):**
```json
{
  "error": "User already exists"
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, unique, valid email format
- `password`: Required, minimum 6 characters (recommended)
- `coSignerEmail`: Required, valid email format

---

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "gisele@gmail.com",
  "password": "securepassword123"
}
```

**Response (200 - Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (404 - User Not Found):**
```json
{
  "error": "User not found"
}
```

**Response (400 - Invalid Credentials):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### GET /auth/me
Get current user profile information. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef0",
  "name": "Gisele Mwizera",
  "email": "gisele@gmail.com",
  "coSignerEmail": "cosigner@example.com",
  "createdAt": "2023-07-15T10:30:00.000Z",
  "updatedAt": "2023-07-15T10:30:00.000Z"
}
```

### Savings Endpoints

#### POST /saving/create
Create a new savings goal. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "goalName": "Emergency Fund",
  "targetAmount": 5000.00,
  "lockUntil": "2024-12-31T23:59:59.000Z"
}
```

**Response (201 - Success):**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef1",
  "userId": "64a1b2c3d4e5f6789abcdef0",
  "goalName": "Emergency Fund",
  "targetAmount": 5000,
  "currentAmount": 0,
  "lockUntil": "2024-12-31T23:59:59.000Z",
  "createdAt": "2023-07-15T10:30:00.000Z",
  "updatedAt": "2023-07-15T10:30:00.000Z"
}
```

**Response (400 - Goal Exists):**
```json
{
  "error": "Saving goal already exists"
}
```

**Validation Rules:**
- User can only have one saving goal
- `goalName`: Required, string
- `targetAmount`: Required, positive number
- `lockUntil`: Required, future date

---

#### POST /saving/add
Add funds to existing savings goal. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 250.50
}
```

**Response (200 - Success):**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef1",
  "userId": "64a1b2c3d4e5f6789abcdef0",
  "goalName": "Emergency Fund",
  "targetAmount": 5000,
  "currentAmount": 250.50,
  "lockUntil": "2024-12-31T23:59:59.000Z",
  "createdAt": "2023-07-15T10:30:00.000Z",
  "updatedAt": "2023-07-15T11:15:00.000Z"
}
```

**Validation Rules:**
- `amount`: Required, positive number
- User must have an existing savings goal

---

#### GET /saving
Get all user savings goals. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef1",
    "userId": "64a1b2c3d4e5f6789abcdef0",
    "goalName": "Emergency Fund",
    "targetAmount": 5000,
    "currentAmount": 1250.75,
    "lockUntil": "2024-12-31T23:59:59.000Z",
    "createdAt": "2023-07-15T10:30:00.000Z",
    "updatedAt": "2023-07-20T14:22:00.000Z"
  }
]
```

---

#### GET /saving/:id
Get specific savings goal by ID. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id`: Savings goal ObjectId

**Response (200 - Success):**
```json
{
  "_id": "64a1b2c3d4e5f6789abcdef1",
  "userId": "64a1b2c3d4e5f6789abcdef0",
  "goalName": "Emergency Fund",
  "targetAmount": 5000,
  "currentAmount": 1250.75,
  "lockUntil": "2024-12-31T23:59:59.000Z",
  "createdAt": "2023-07-15T10:30:00.000Z",
  "updatedAt": "2023-07-20T14:22:00.000Z"
}
```

**Response (404 - Not Found):**
```json
{
  "error": "Saving not found"
}
```

### Withdrawal Endpoints

#### POST /withdrawal/request
Request a withdrawal from savings. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 500.00
}
```

**Response (201 - Success):**
```json
{
  "message": "Withdrawal request sent to co-signer"
}
```

**Response (403 - Locked Period):**
```json
{
  "error": "Withdrawal locked until March 1, 2026"
}
```

**Response (400 - Insufficient Funds):**
```json
{
  "error": "Insufficient funds in saving goal. You can withdraw up to 1250.75"
}
```

**Business Rules:**
- Cannot withdraw if current date is before `lockUntil` date
- Cannot withdraw more than `currentAmount`
- Creates pending withdrawal requiring co-signer approval

---

#### PUT /withdrawal/:id/approve
Approve or reject a withdrawal request. **[Protected Route - Co-signer Only]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id`: Withdrawal request ObjectId

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:**
- `"approved"`: Approve and process the withdrawal
- `"rejected"`: Reject the withdrawal request

**Response (200 - Approved):**
```json
{
  "message": "Withdrawal approved and processed"
}
```

**Response (200 - Rejected):**
```json
{
  "message": "Withdrawal rejected"
}
```

**Response (403 - Not Authorized):**
```json
{
  "error": "Not authorized"
}
```

**Response (400 - Already Processed):**
```json
{
  "error": "Withdrawal already processed"
}
```

**Authorization Rules:**
- Only the designated co-signer can approve/reject withdrawals
- Co-signer email must match the user's `coSignerEmail` field

---

#### GET /withdrawal
Get user's withdrawal history. **[Protected Route]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef2",
    "userId": "64a1b2c3d4e5f6789abcdef0",
    "amount": 500,
    "status": "pending",
    "createdAt": "2023-07-20T15:30:00.000Z",
    "updatedAt": "2023-07-20T15:30:00.000Z"
  },
  {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "userId": "64a1b2c3d4e5f6789abcdef0",
    "amount": 200,
    "status": "approved",
    "createdAt": "2023-07-18T12:00:00.000Z",
    "updatedAt": "2023-07-18T14:30:00.000Z"
  }
]
```

---

#### GET /withdrawal/pending-cosigner
Get pending withdrawals for co-signer approval. **[Protected Route - Co-signer]**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789abcdef2",
    "userId": "64a1b2c3d4e5f6789abcdef0",
    "amount": 500,
    "status": "pending",
    "createdAt": "2023-07-20T15:30:00.000Z",
    "updatedAt": "2023-07-20T15:30:00.000Z"
  }
]
```

**Business Logic:**
- Returns withdrawal requests from all users who have designated the current user as co-signer
- Only shows pending requests that require approval

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  coSignerEmail: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Saving Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  goalName: String (required),
  targetAmount: Number (required),
  currentAmount: Number (default: 0),
  lockUntil: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  amount: Number (required),
  status: String (enum: ["pending", "approved", "rejected"]),
  createdAt: Date,
  updatedAt: Date
}
```

## HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Descriptive error message"
}
```

## Authentication Flow Example

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "coSignerEmail": "cosigner@example.com"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Use Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use:
- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute per user

## Security Considerations

### Implemented Security Measures
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Stateless authentication with 7-day expiration
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Basic request validation

### Recommended Enhancements
- **Rate Limiting**: Prevent API abuse
- **Input Sanitization**: Prevent injection attacks
- **HTTPS Enforcement**: Secure data transmission
- **Request Logging**: Monitor API usage

## API Testing

### Swagger Documentation
Interactive API documentation is available at:
`http://localhost:5000/api/documentation`

### Postman Collection
A Postman collection can be created with the following base configuration:
- **Base URL**: `{{base_url}}/api`
- **Environment Variables**:
  - `base_url`: `http://localhost:5000`
  - `jwt_token`: `<your_jwt_token>`

### Example Test Scenarios

#### Complete User Journey
1. Register new user
2. Login and receive token
3. Create savings goal
4. Add funds multiple times
5. Request withdrawal
6. Co-signer approval process

#### Error Handling Tests
1. Invalid credentials
2. Duplicate registration
3. Unauthorized access
4. Invalid withdrawal amounts
5. Locked period withdrawals

## Environment Variables

Required environment variables for the API:

```env
MONGO_URI=mongodb://localhost:27017/agaseke
JWT_SECRET=your-super-secret-key-here
PORT=5000
```

## API Versioning

Currently using v1 (implicit). Future versions should follow semantic versioning:
- `/api/v1/...` - Current version
- `/api/v2/...` - Future major changes

## Changelog

### v1.0.0 (Current)
- User registration and authentication
- JWT-based session management
- Savings goal creation and management
- Fund addition functionality
- Withdrawal request and approval system
- Co-signer authorization workflow


-----