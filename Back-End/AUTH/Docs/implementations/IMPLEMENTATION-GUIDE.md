# AUTH Service - Phased Implementation Guide

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Authentication & User Profile Management (AUTH)
- **Version**: 0.1.0
- **Date**: January 8, 2026
- **Prepared By**: Development Team
- **Implementation Team**: Wajeeth, Nadeem, Easwaran, Lakshmi, Ramkumar

---

## Table of Contents
1. [Overview](#overview)
2. [Pre-Implementation Checklist](#pre-implementation-checklist)
3. [Project Configuration](#project-configuration)
4. [Phase 1: Project Foundation](#phase-1-project-foundation)
5. [Phase 2: Core Authentication](#phase-2-core-authentication)
6. [Phase 3: User Management](#phase-3-user-management)
7. [Phase 4: Profile & Email Integration](#phase-4-profile--email-integration)
8. [Phase 5: Role Management & RBAC](#phase-5-role-management--rbac)
9. [Phase 6: Containerization & Documentation](#phase-6-containerization--documentation)
10. [Post-Implementation Tasks](#post-implementation-tasks)
11. [Testing Strategy](#testing-strategy)

---

## Overview

This guide provides a step-by-step implementation plan for the AUTH service based on the comprehensive documentation in the `Docs/` folder. Each phase builds upon the previous one, ensuring a systematic and testable development approach.

**Documentation References:**
- Architecture: `Docs/1-Architecture-Diagram.md`
- Database Design: `Docs/2-ER-Diagram.md` & `Docs/5-DB-Schema-Collections.md`
- Requirements: `Docs/3-User-Stories-Use-Cases.md`
- API Specifications: `Docs/4-API-Endpoint-Specifications.md`
- Flow Diagrams: `Docs/6-Authentication-Flow-Diagrams.md`

---

## Pre-Implementation Checklist

### Required Software
- [ ] Node.js v22.x installed
- [ ] MongoDB 6.x installed and running
- [ ] Docker Desktop installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Postman/Insomnia for API testing

### Access & Credentials
- [x] Gmail App Password obtained: `qzfz zegx uieb oayk`
- [x] Email ID: `jd.ramkumar@gmail.com`
- [ ] MongoDB connection string ready
- [ ] GitHub repository access (if applicable)

---

## Project Configuration

### Technology Stack (As per Docs/1-Architecture-Diagram.md)
- **Runtime**: Node.js 22.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x
- **ODM**: Mongoose 8.x
- **Authentication**: jsonwebtoken 9.x
- **Password Hashing**: bcryptjs 2.x
- **Validation**: Joi 17.x
- **Email**: nodemailer 6.x
- **Documentation**: swagger-ui-express 5.x
- **Logging**: winston 3.x
- **Rate Limiting**: express-rate-limit 7.x

### Project Structure
```
AUTH/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── email.js
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── profile.controller.js
│   │   └── role.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── permission.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Role.model.js
│   │   └── RefreshToken.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── profile.routes.js
│   │   ├── role.routes.js
│   │   └── health.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── token.service.js
│   │   ├── role.service.js
│   │   └── email.service.js
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── hash.util.js
│   │   ├── validation.util.js
│   │   ├── response.util.js
│   │   └── constants.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   └── profile.validator.js
│   ├── app.js
│   └── server.js
├── scripts/
│   └── seed.js
├── uploads/
│   └── profiles/
├── Docs/
│   └── (existing documentation files)
├── .env.example
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
└── IMPLEMENTATION-GUIDE.md (this file)
```

### Environment Variables (.env)
```env
# Application
NODE_ENV=development
PORT=5001
APP_NAME=AUTH Service

# Database
MONGODB_URI=mongodb://localhost:27017/auth_db

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGINS=*

# Email Configuration
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=jd.ramkumar@gmail.com
EMAIL_FROM_NAME=WLAN Corporation
EMAIL_APP_PASSWORD=qzfz zegx uieb oayk

# Logging Configuration
LOG_ENABLED=true
LOG_TYPE=CONSOLE
LOG_LEVEL=VERBOSE

# Rate Limiting
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_DIR=uploads/profiles
MAX_FILE_SIZE=2097152
ALLOWED_FILE_TYPES=image/jpeg,image/png

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

---

## Phase 1: Project Foundation

**Duration**: 1-2 days  
**Dependencies**: None  
**Documentation Reference**: `Docs/1-Architecture-Diagram.md` (Section 7)

### 1.1 Initialize Project
**Tasks:**
- [ ] Create project directory structure
- [ ] Initialize npm project: `npm init -y`
- [ ] Install core dependencies
- [ ] Install dev dependencies
- [ ] Create `.gitignore` file
- [ ] Create `.env.example` file
- [ ] Create `README.md` with basic project info
- [ ] Create `LICENSE` (MIT)
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `CHANGELOG.md` (v0.1.0)

**Dependencies to Install:**
```bash
# Core Dependencies
npm install express mongoose dotenv cors helmet
npm install bcryptjs jsonwebtoken joi
npm install nodemailer
npm install winston express-rate-limit
npm install swagger-ui-express swagger-jsdoc
npm install multer

# Dev Dependencies
npm install --save-dev nodemon
```

**Deliverables:**
- Working package.json with all dependencies
- Project folder structure created
- Git repository initialized
- Environment configuration files ready

### 1.2 Configuration Setup
**Tasks:**
- [ ] Create `src/config/database.js` - MongoDB connection
- [ ] Create `src/config/logger.js` - Winston logger setup (console/file based on env)
- [ ] Create `src/config/email.js` - Nodemailer Gmail configuration
- [ ] Create `src/config/jwt.js` - JWT configuration
- [ ] Create `src/utils/constants.js` - Application constants
- [ ] Create `src/utils/response.util.js` - Standardized API responses

**Documentation Reference**: 
- Database: `Docs/5-DB-Schema-Collections.md` (Section 1)
- Response Format: `Docs/4-API-Endpoint-Specifications.md` (Section 2.2)

**Deliverables:**
- Database connection established and tested
- Logger working based on .env configuration
- Email service configured with Gmail
- JWT utilities ready
- Standard response format implemented

### 1.3 Basic Server Setup
**Tasks:**
- [ ] Create `src/app.js` - Express app configuration
- [ ] Create `src/server.js` - Server initialization
- [ ] Configure CORS middleware
- [ ] Configure Helmet security headers
- [ ] Configure body-parser for JSON
- [ ] Create error handler middleware
- [ ] Test server startup

**Deliverables:**
- Express server running on port 5001
- Basic middleware configured
- Health check endpoint accessible

**Test Command:**
```bash
npm run dev
# Server should start successfully
```

---

## Phase 2: Core Authentication

**Duration**: 3-4 days  
**Dependencies**: Phase 1 completed  
**Documentation References**: 
- `Docs/2-ER-Diagram.md` (Sections 3.1, 3.2, 3.3)
- `Docs/5-DB-Schema-Collections.md` (Sections 2, 3, 4)
- `Docs/6-Authentication-Flow-Diagrams.md` (Sections 2, 3, 4)

### 2.1 Database Models
**Tasks:**
- [ ] Create `src/models/Role.model.js` - Role schema with validation
- [ ] Create `src/models/User.model.js` - User schema with password hashing
- [ ] Create `src/models/RefreshToken.model.js` - Refresh token schema
- [ ] Add mongoose indexes as per schema specs
- [ ] Add TTL index for refresh tokens
- [ ] Test model creation and validation

**Documentation Reference**: `Docs/5-DB-Schema-Collections.md` (Sections 2, 3, 4)

**Deliverables:**
- All three models created with proper validation
- Indexes configured correctly
- Password hashing pre-save hook working
- Models tested with sample data

### 2.2 Database Seeding
**Tasks:**
- [ ] Create `scripts/seed.js`
- [ ] Define 7 default roles with permissions (as per `Docs/2-ER-Diagram.md` Section 8)
- [ ] Create default admin user (email: `admin@wlancorp.com`, password: `Admin@123`)
- [ ] Add npm script: `"seed": "node scripts/seed.js"`
- [ ] Test seeding script

**Documentation Reference**: 
- Roles: `Docs/2-ER-Diagram.md` (Section 8)
- Seed Data: `Docs/5-DB-Schema-Collections.md` (Section 5)

**Deliverables:**
- Seed script creates all 7 roles
- Default admin user created
- Script is idempotent (can run multiple times safely)

### 2.3 JWT Utilities
**Tasks:**
- [ ] Create `src/utils/jwt.util.js`
  - [ ] `generateAccessToken(userId, role, permissions)`
  - [ ] `generateRefreshToken(userId)`
  - [ ] `verifyAccessToken(token)`
  - [ ] `verifyRefreshToken(token)`
  - [ ] `decodeToken(token)`
- [ ] Create `src/utils/hash.util.js`
  - [ ] `hashPassword(password)`
  - [ ] `comparePassword(password, hash)`
  - [ ] `hashToken(token)` for refresh tokens

**Documentation Reference**: `Docs/1-Architecture-Diagram.md` (Section 4.4)

**Deliverables:**
- JWT generation and verification working
- Token expiry times configured from .env
- Password hashing/comparison tested

### 2.4 Authentication Service
**Tasks:**
- [ ] Create `src/services/auth.service.js`
  - [ ] `login(email, password)` - Authenticate user
  - [ ] `logout(refreshToken)` - Revoke token
  - [ ] `refreshTokens(refreshToken)` - Generate new tokens
  - [ ] `verifyToken(token)` - Validate JWT
- [ ] Create `src/services/token.service.js`
  - [ ] `createRefreshToken(userId, token, ipAddress, userAgent)`
  - [ ] `validateRefreshToken(token)`
  - [ ] `revokeRefreshToken(token)`
  - [ ] `revokeAllUserTokens(userId)`

**Documentation Reference**: `Docs/6-Authentication-Flow-Diagrams.md` (Sections 2, 3, 4)

**Deliverables:**
- Login logic implemented with password verification
- Refresh token rotation working
- Token revocation on logout
- All tokens for user can be revoked

### 2.5 Validation Schemas
**Tasks:**
- [ ] Create `src/validators/auth.validator.js`
  - [ ] Login schema (email, password)
  - [ ] Refresh token schema
  - [ ] Logout schema
- [ ] Create `src/middlewares/validation.middleware.js`
  - [ ] `validateBody(schema)` middleware
  - [ ] Error formatting for Joi validation

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Sections 3.1, 3.2, 3.3)

**Deliverables:**
- Request validation working
- Proper error messages returned

### 2.6 Authentication Middleware
**Tasks:**
- [ ] Create `src/middlewares/auth.middleware.js`
  - [ ] `authenticate()` - Verify JWT from header
  - [ ] Extract user info from token
  - [ ] Attach user to request object

**Documentation Reference**: `Docs/1-Architecture-Diagram.md` (Section 4.1)

**Deliverables:**
- Protected routes can verify JWT
- User info available in req.user

### 2.7 Rate Limiting Middleware
**Tasks:**
- [ ] Create `src/middlewares/rateLimiter.middleware.js`
  - [ ] IP-based rate limiting
  - [ ] Configurable via .env (enabled/disabled)
  - [ ] Default: 100 requests/minute when enabled
  - [ ] Custom limits for specific endpoints (e.g., login: 5/min)

**Deliverables:**
- Rate limiting working when enabled
- Can be disabled via .env
- Different limits for different endpoints

### 2.8 Authentication Controllers & Routes
**Tasks:**
- [ ] Create `src/controllers/auth.controller.js`
  - [ ] `login()` - POST /api/v1/auth/login
  - [ ] `logout()` - POST /api/v1/auth/logout
  - [ ] `refresh()` - POST /api/v1/auth/refresh
  - [ ] `verify()` - POST /api/v1/auth/verify
- [ ] Create `src/routes/auth.routes.js`
  - [ ] Define all auth routes
  - [ ] Apply validation middleware
  - [ ] Apply rate limiting to login

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Section 3)

**Deliverables:**
- All authentication endpoints working
- Login returns access & refresh tokens
- Logout revokes tokens
- Refresh generates new token pair
- Verify endpoint validates tokens

### 2.9 Health Check Endpoints
**Tasks:**
- [ ] Create `src/routes/health.routes.js`
  - [ ] `GET /health` - Simple health check (status: OK)
  - [ ] `GET /health-in-detail` - Detailed health check
    - API status
    - Database connectivity
    - Uptime
    - Memory usage
    - Timestamp

**Deliverables:**
- `/health` returns simple OK response
- `/health-in-detail` returns comprehensive health metrics

### 2.10 Phase 2 Testing
**Manual Testing Checklist:**
- [ ] Seed database with roles and admin user
- [ ] Login with admin credentials
- [ ] Verify tokens are returned
- [ ] Access protected endpoint with token
- [ ] Refresh token before expiry
- [ ] Logout and verify token is revoked
- [ ] Test rate limiting (if enabled)
- [ ] Test invalid credentials
- [ ] Test inactive account
- [ ] Health endpoints return expected data

---

## Phase 3: User Management

**Duration**: 2-3 days  
**Dependencies**: Phase 2 completed  
**Documentation References**: 
- `Docs/3-User-Stories-Use-Cases.md` (Epic 2)
- `Docs/4-API-Endpoint-Specifications.md` (Section 4)

### 3.1 User Service
**Tasks:**
- [ ] Create `src/services/user.service.js`
  - [ ] `createUser(userData, createdBy)` - Create new user
  - [ ] `getAllUsers(filters, pagination)` - Get paginated user list
  - [ ] `getUserById(userId)` - Get single user
  - [ ] `updateUser(userId, updateData, updatedBy)` - Update user
  - [ ] `updateUserStatus(userId, isActive)` - Activate/deactivate
  - [ ] `deleteUser(userId)` - Delete user
  - [ ] `generateTemporaryPassword()` - Random password generator

**Documentation Reference**: `Docs/3-User-Stories-Use-Cases.md` (Section 4)

**Deliverables:**
- User CRUD operations implemented
- Pagination working
- Search and filters implemented
- Temporary password generation

### 3.2 Permission Middleware
**Tasks:**
- [ ] Create `src/middlewares/permission.middleware.js`
  - [ ] `checkPermission(requiredPermission)` - Verify user has permission
  - [ ] Support wildcard permissions for Super Admin
  - [ ] Check role permissions array

**Documentation Reference**: `Docs/6-Authentication-Flow-Diagrams.md` (Section 9)

**Deliverables:**
- Permission checking working
- Super Admin has all permissions
- Other roles restricted properly

### 3.3 User Validators
**Tasks:**
- [ ] Create `src/validators/user.validator.js`
  - [ ] Create user schema
  - [ ] Update user schema
  - [ ] Update status schema
  - [ ] Query parameter validation

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Section 4)

**Deliverables:**
- All user endpoints validated
- Proper error messages

### 3.4 User Controller & Routes
**Tasks:**
- [ ] Create `src/controllers/user.controller.js`
  - [ ] `createUser()` - POST /api/v1/users
  - [ ] `getAllUsers()` - GET /api/v1/users
  - [ ] `getUserById()` - GET /api/v1/users/:id
  - [ ] `updateUser()` - PUT /api/v1/users/:id
  - [ ] `updateUserStatus()` - PATCH /api/v1/users/:id/status
  - [ ] `deleteUser()` - DELETE /api/v1/users/:id
- [ ] Create `src/routes/user.routes.js`
  - [ ] Define all user routes
  - [ ] Apply authentication middleware
  - [ ] Apply permission middleware (users.* permissions)
  - [ ] Apply validation

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Section 4)

**Deliverables:**
- All user management endpoints working
- Only Super Admin can access
- Temporary password returned on user creation

### 3.5 Phase 3 Testing
**Manual Testing Checklist:**
- [ ] Login as admin
- [ ] Create new user with Warehouse Manager role
- [ ] Verify temporary password returned
- [ ] Get list of all users with pagination
- [ ] Search users by name/email
- [ ] Filter users by role
- [ ] Get single user by ID
- [ ] Update user details
- [ ] Deactivate user
- [ ] Try to login with deactivated user (should fail)
- [ ] Reactivate user
- [ ] Delete user
- [ ] Verify non-admin cannot access user endpoints

---

## Phase 4: Profile & Email Integration

**Duration**: 2-3 days  
**Dependencies**: Phase 3 completed  
**Documentation References**: 
- `Docs/3-User-Stories-Use-Cases.md` (Epic 3)
- `Docs/4-API-Endpoint-Specifications.md` (Section 5)

### 4.1 Email Service
**Tasks:**
- [ ] Create `src/services/email.service.js`
  - [ ] Configure Nodemailer with Gmail
  - [ ] `sendWelcomeEmail(email, name, temporaryPassword)`
  - [ ] `sendPasswordResetEmail(email, name, resetToken)`
  - [ ] `sendPasswordChangedEmail(email, name)`
  - [ ] Email templates (HTML)
  - [ ] Handle email errors gracefully

**Email Configuration:**
- Host: smtp.gmail.com
- Port: 587
- Secure: false (STARTTLS)
- From: jd.ramkumar@gmail.com
- App Password: qzfz zegx uieb oayk

**Deliverables:**
- Email service configured with Gmail
- Welcome email sent on user creation
- Email sending can be disabled via .env
- Error handling for email failures

### 4.2 Password Reset Flow
**Tasks:**
- [ ] Add password reset fields to User model (resetToken, resetTokenExpiry)
- [ ] Update `src/services/auth.service.js`
  - [ ] `requestPasswordReset(email)` - Generate reset token
  - [ ] `resetPassword(resetToken, newPassword)` - Reset with token
- [ ] Create validators for password reset
- [ ] Add password reset endpoints to auth controller/routes
  - [ ] POST /api/v1/auth/forgot-password
  - [ ] POST /api/v1/auth/reset-password

**Documentation Reference**: `Docs/6-Authentication-Flow-Diagrams.md` (Section 6)

**Deliverables:**
- Password reset email sent
- Reset token expires in 1 hour
- Password successfully reset
- All sessions terminated after reset

### 4.3 Profile Service
**Tasks:**
- [ ] Create profile endpoints in existing user service
  - [ ] `getMyProfile(userId)` - Get current user profile
  - [ ] `updateMyProfile(userId, updateData)` - Update own profile
  - [ ] `changePassword(userId, currentPassword, newPassword)` - Change password
  - [ ] `uploadProfilePicture(userId, file)` - Upload picture

**Documentation Reference**: `Docs/3-User-Stories-Use-Cases.md` (Section 5)

**Deliverables:**
- Users can view their own profile
- Users can update name, phone
- Password change requires current password
- Email cannot be changed

### 4.4 File Upload Handling
**Tasks:**
- [ ] Configure Multer for file uploads
- [ ] Create `uploads/profiles/` directory
- [ ] Implement file validation (type, size)
- [ ] Generate unique filenames
- [ ] Store file path in user profile
- [ ] Handle file deletion on profile picture update

**Configuration:**
- Upload directory: `uploads/profiles/`
- Max size: 2MB
- Allowed types: image/jpeg, image/png

**Deliverables:**
- Profile pictures uploaded successfully
- Files stored in local directory
- Old pictures replaced on update
- File size and type validated

### 4.5 Profile Validators & Routes
**Tasks:**
- [ ] Create `src/validators/profile.validator.js`
  - [ ] Update profile schema
  - [ ] Change password schema
- [ ] Create `src/controllers/profile.controller.js`
  - [ ] `getProfile()` - GET /api/v1/profile
  - [ ] `updateProfile()` - PUT /api/v1/profile
  - [ ] `changePassword()` - POST /api/v1/profile/change-password
  - [ ] `uploadProfilePicture()` - POST /api/v1/profile/upload-picture
- [ ] Create `src/routes/profile.routes.js`

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Section 5)

**Deliverables:**
- All profile endpoints working
- Any authenticated user can access
- Profile picture upload working

### 4.6 Integrate Email into User Creation
**Tasks:**
- [ ] Update user creation to send welcome email
- [ ] Include temporary password in email
- [ ] Handle email failures gracefully (user still created)

**Deliverables:**
- Welcome email sent when user is created
- Email includes login instructions
- User creation succeeds even if email fails

### 4.7 Phase 4 Testing
**Manual Testing Checklist:**
- [ ] Request password reset for admin
- [ ] Verify email received with reset link
- [ ] Reset password using link
- [ ] Login with new password
- [ ] View own profile
- [ ] Update profile (name, phone)
- [ ] Upload profile picture (JPG)
- [ ] Upload profile picture (PNG)
- [ ] Try uploading large file (should fail)
- [ ] Try uploading PDF (should fail)
- [ ] Change password
- [ ] Verify all sessions logged out after password change
- [ ] Create new user and verify welcome email
- [ ] Test with EMAIL_ENABLED=false

---

## Phase 5: Role Management & RBAC

**Duration**: 2 days  
**Dependencies**: Phase 4 completed  
**Documentation References**: 
- `Docs/3-User-Stories-Use-Cases.md` (Epic 4)
- `Docs/4-API-Endpoint-Specifications.md` (Section 6)

### 5.1 Role Service
**Tasks:**
- [ ] Create `src/services/role.service.js`
  - [ ] `createRole(roleData, createdBy)` - Create new role
  - [ ] `getAllRoles(filters)` - Get all roles
  - [ ] `getRoleById(roleId)` - Get single role
  - [ ] `updateRole(roleId, updateData, updatedBy)` - Update role
  - [ ] `updateRoleStatus(roleId, isActive)` - Activate/deactivate
  - [ ] `deleteRole(roleId)` - Delete role (if no users assigned)

**Documentation Reference**: `Docs/3-User-Stories-Use-Cases.md` (Section 6)

**Deliverables:**
- Role CRUD operations implemented
- Cannot delete role with assigned users
- Permission management working

### 5.2 Role Validators
**Tasks:**
- [ ] Create `src/validators/role.validator.js`
  - [ ] Create role schema
  - [ ] Update role schema
  - [ ] Permission validation

**Deliverables:**
- Role name validated against enum
- Permissions validated against allowed list

### 5.3 Role Controller & Routes
**Tasks:**
- [ ] Create `src/controllers/role.controller.js`
  - [ ] `createRole()` - POST /api/v1/roles
  - [ ] `getAllRoles()` - GET /api/v1/roles
  - [ ] `getRoleById()` - GET /api/v1/roles/:id
  - [ ] `updateRole()` - PUT /api/v1/roles/:id
  - [ ] `updateRoleStatus()` - PATCH /api/v1/roles/:id/status
  - [ ] `deleteRole()` - DELETE /api/v1/roles/:id
- [ ] Create `src/routes/role.routes.js`
  - [ ] Apply authentication
  - [ ] Apply permission middleware (roles.* permissions)

**Documentation Reference**: `Docs/4-API-Endpoint-Specifications.md` (Section 6)

**Deliverables:**
- All role management endpoints working
- Only Super Admin can manage roles
- Proper validation in place

### 5.4 Permission Constants
**Tasks:**
- [ ] Update `src/utils/constants.js`
  - [ ] Define all permission constants
  - [ ] Group by module (users, roles, products, etc.)
  - [ ] Export as object

**Documentation Reference**: `Docs/5-DB-Schema-Collections.md` (Section 3.4)

**Deliverables:**
- All permissions defined as constants
- Used in role creation and validation

### 5.5 RBAC Testing Utilities
**Tasks:**
- [ ] Create helper functions to test permissions
- [ ] Create test users with different roles
- [ ] Document permission matrix

**Deliverables:**
- Permission testing utilities ready
- Sample users for each role created

### 5.6 Phase 5 Testing
**Manual Testing Checklist:**
- [ ] Login as Super Admin
- [ ] Get list of all roles
- [ ] Get single role by ID
- [ ] Create custom role with specific permissions
- [ ] Update role permissions
- [ ] Try to delete role with assigned users (should fail)
- [ ] Deactivate role
- [ ] Reactivate role
- [ ] Create user with custom role
- [ ] Login as that user
- [ ] Verify user has only permitted actions
- [ ] Test wildcard permission for Super Admin
- [ ] Test permission middleware on various endpoints

---

## Phase 6: Containerization & Documentation

**Duration**: 2-3 days  
**Dependencies**: Phase 5 completed

### 6.1 API Documentation (Swagger/OpenAPI)
**Tasks:**
- [ ] Create `src/config/swagger.js` - Swagger configuration
- [ ] Add JSDoc comments to all route handlers
- [ ] Define reusable schemas in Swagger
- [ ] Add authentication scheme to Swagger
- [ ] Group endpoints by tags
- [ ] Add examples for requests/responses
- [ ] Test all endpoints in Swagger UI

**Deliverables:**
- Swagger UI accessible at `/api-docs`
- All endpoints documented
- Interactive API testing available
- Authentication working in Swagger

### 6.2 Docker Configuration
**Tasks:**
- [ ] Create `.dockerignore`
  - Exclude node_modules, .env, .git, etc.
- [ ] Create `Dockerfile`
  - Use Node.js 22 Alpine base image
  - Multi-stage build (builder + production)
  - Copy only necessary files to production
  - Set proper user permissions
  - Expose port 5001
- [ ] Test Docker build
- [ ] Test Docker container run

**Dockerfile Structure:**
```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 5001
CMD ["node", "src/server.js"]
```

**Deliverables:**
- Optimized Docker image created
- Image size minimized
- Security best practices followed

### 6.3 Docker Compose
**Tasks:**
- [ ] Create `docker-compose.yml`
  - AUTH service configuration
  - MongoDB service
  - Network configuration
  - Volume mounts for MongoDB data
  - Environment variable mapping
- [ ] Create `.env.docker` for Docker environment
- [ ] Test docker-compose up
- [ ] Verify services can communicate

**Docker Compose Structure:**
```yaml
services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    networks:
      - auth-network
    
  auth-service:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/auth_db
    depends_on:
      - mongodb
    networks:
      - auth-network

volumes:
  mongo-data:

networks:
  auth-network:
```

**Deliverables:**
- docker-compose.yml working
- Services start successfully
- Database persists across restarts
- Network isolation configured

### 6.4 Documentation Files
**Tasks:**
- [ ] Complete `README.md`
  - Project overview
  - Features list
  - Prerequisites
  - Installation instructions (local & Docker)
  - Environment variables documentation
  - API endpoints overview
  - Running tests
  - License information
- [ ] Review and update `CONTRIBUTING.md`
  - Development team listed
  - Contribution guidelines
  - Code style guide
  - Pull request process
- [ ] Update `CHANGELOG.md`
  - Document v0.1.0 features
  - Follow Keep a Changelog format

**Deliverables:**
- Comprehensive README
- Clear contribution guidelines
- Changelog up to date

### 6.5 Final Code Review & Cleanup
**Tasks:**
- [ ] Remove commented code
- [ ] Ensure consistent code formatting
- [ ] Add missing JSDoc comments
- [ ] Review error messages
- [ ] Check for hardcoded values
- [ ] Verify all console.logs replaced with logger
- [ ] Review security best practices
- [ ] Update package.json scripts

**Deliverables:**
- Clean, production-ready code
- Consistent formatting
- No hardcoded secrets

### 6.6 Phase 6 Testing
**Testing Checklist:**
- [ ] Build Docker image successfully
- [ ] Run container and verify server starts
- [ ] Test all endpoints in Docker container
- [ ] docker-compose up and test full stack
- [ ] Verify MongoDB data persists
- [ ] Test health endpoints
- [ ] Test Swagger documentation
- [ ] Verify all environment variables work
- [ ] Test with different LOG_TYPE settings
- [ ] Test with RATE_LIMIT_ENABLED true/false
- [ ] Test with EMAIL_ENABLED true/false

---

## Post-Implementation Tasks

### Code Quality
- [ ] Run linter (ESLint) if configured
- [ ] Fix all linting warnings
- [ ] Format code consistently

### Security Review
- [ ] Ensure no secrets in code
- [ ] Verify .env is in .gitignore
- [ ] Check JWT secrets are strong
- [ ] Review CORS configuration for production
- [ ] Verify helmet security headers
- [ ] Check rate limiting is working

### Performance Review
- [ ] Review database indexes
- [ ] Check query performance
- [ ] Verify pagination is working
- [ ] Test with large datasets

### Deployment Preparation
- [ ] Document production deployment steps
- [ ] Create production environment variables template
- [ ] Document backup and restore procedures
- [ ] Create monitoring guidelines

---

## Testing Strategy

### Unit Testing (Post-Implementation)
**To be implemented after Phase 6:**
- [ ] Test utilities (JWT, hashing, validation)
- [ ] Test services (auth, user, token, role)
- [ ] Test middleware (auth, permission, rate limit)
- [ ] Test models (validation, hooks)

**Tools:**
- Jest or Mocha
- Chai for assertions
- Sinon for mocking

### Integration Testing (Post-Implementation)
**To be implemented after Phase 6:**
- [ ] Test authentication flows
- [ ] Test user management flows
- [ ] Test profile management flows
- [ ] Test role management flows
- [ ] Test email integration
- [ ] Test file upload

**Tools:**
- Supertest for HTTP assertions
- MongoDB Memory Server for test database

### Manual Testing (Throughout Implementation)
**Each phase includes manual testing checklist above**

### Performance Testing (Future)
- Load testing with Apache JMeter or Artillery
- Stress testing for rate limiting
- Database query optimization

---

## Implementation Timeline

| Phase | Duration | Team Assignment | Status |
|-------|----------|-----------------|--------|
| Phase 1: Foundation | 1-2 days | Ramkumar, Wajeeth | Not Started |
| Phase 2: Core Auth | 3-4 days | Nadeem, Easwaran | Not Started |
| Phase 3: User Management | 2-3 days | Lakshmi, Ramkumar | Not Started |
| Phase 4: Profile & Email | 2-3 days | Wajeeth, Nadeem | Not Started |
| Phase 5: Role & RBAC | 2 days | Easwaran, Lakshmi | Not Started |
| Phase 6: Docker & Docs | 2-3 days | All Team | Not Started |
| **Total Estimated** | **12-17 days** | **All Team** | **Not Started** |

---

## Success Criteria

### Phase Completion Criteria
Each phase is considered complete when:
- [ ] All tasks are implemented
- [ ] Manual testing checklist passed
- [ ] Code reviewed by at least one team member
- [ ] Documentation updated
- [ ] No critical bugs

### Project Completion Criteria
The project is ready for production when:
- [ ] All 6 phases completed
- [ ] All endpoints working as per API specs
- [ ] Docker deployment tested
- [ ] Swagger documentation complete
- [ ] All NFRs implemented (rate limiting, logging, etc.)
- [ ] Security review passed
- [ ] Performance acceptable
- [ ] README and documentation complete

---

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT token security | High | Use strong secrets, short expiry for access tokens |
| Email delivery failures | Medium | Graceful error handling, email service optional |
| MongoDB connection issues | High | Connection retry logic, proper error handling |
| File upload vulnerabilities | High | Strict file type/size validation, virus scanning (future) |
| Rate limit bypass | Medium | IP-based limiting, consider Redis for distributed systems |

### Process Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Medium | Stick to documented requirements, track changes |
| Timeline delays | Medium | Daily standups, clear task assignment |
| Team coordination | Low | Use Git properly, code reviews |

---

## Notes

### Important Reminders
1. **Never commit .env file** - Always use .env.example
2. **Test each phase** before moving to next
3. **Follow documentation** in Docs/ folder
4. **Use logger** instead of console.log
5. **Validate all inputs** - Never trust client data
6. **Hash sensitive data** - Passwords, tokens
7. **Use transactions** where needed (delete operations)
8. **Document as you go** - JSDoc comments

### Team Communication
- Daily standup to track progress
- Use GitHub issues for bug tracking
- Code review required before merging
- Update CHANGELOG.md with each significant change

### Version Control
- Use feature branches: `feature/phase-X-description`
- Merge to `develop` after each phase
- Tag releases: `v0.1.0`, `v0.2.0`, etc.
- Main branch for production-ready code

---

## Appendix

### Useful Commands

**Development:**
```bash
npm run dev          # Start development server
npm run seed         # Seed database
npm start            # Start production server
```

**Docker:**
```bash
docker build -t auth-service .
docker run -p 5001:5001 --env-file .env auth-service
docker-compose up -d
docker-compose down
docker-compose logs -f auth-service
```

**Database:**
```bash
mongosh mongodb://localhost:27017/auth_db
db.users.find()
db.roles.find()
db.refresh_tokens.find()
```

### Reference Links
- Express.js Docs: https://expressjs.com/
- Mongoose Docs: https://mongoosejs.com/
- JWT.io: https://jwt.io/
- Nodemailer: https://nodemailer.com/
- Swagger: https://swagger.io/

---

**Document Version**: 1.0  
**Last Updated**: January 8, 2026  
**Next Review**: After Phase 1 Completion

---

## Implementation Sign-Off

| Phase | Completed By | Date | Reviewed By | Notes |
|-------|--------------|------|-------------|-------|
| Phase 1 | | | | |
| Phase 2 | | | | |
| Phase 3 | | | | |
| Phase 4 | | | | |
| Phase 5 | | | | |
| Phase 6 | | | | |

---

**END OF IMPLEMENTATION GUIDE**
