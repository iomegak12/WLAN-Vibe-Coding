# AUTH Service - API Endpoint Specifications

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Authentication & User Profile Management (AUTH)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document provides detailed specifications for all REST API endpoints in the AUTH service. All endpoints follow RESTful conventions and return JSON responses.

**Base URL**: `http://localhost:5001/api/v1`  
**Production URL**: `https://api.wlancorp.com/auth/api/v1`

---

## 2. API Standards

### 2.1 Request Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `Content-Type` | Yes (for POST/PUT) | Request content type | `application/json` |
| `Authorization` | Yes (protected routes) | JWT bearer token | `Bearer eyJhbGc...` |
| `Accept` | No | Response content type | `application/json` |

### 2.2 Standard Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* optional additional details */ }
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

### 2.3 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 422 | Unprocessable Entity | Semantic validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### 2.4 Pagination

Paginated endpoints accept these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number (1-indexed) |
| `limit` | Number | 10 | Items per page (max 100) |
| `sortBy` | String | createdAt | Field to sort by |
| `sortOrder` | String | desc | Sort order: `asc` or `desc` |

**Paginated Response**:
```json
{
  "success": true,
  "data": {
    "items": [ /* array of resources */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 3. Authentication Endpoints

### 3.1 POST /api/v1/auth/login

**Description**: Authenticate user and receive access/refresh tokens

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "ramkumar@wlancorp.com",
  "password": "SecurePass123!"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "Ramkumar",
      "lastName": "Singh",
      "email": "ramkumar@wlancorp.com",
      "phone": "+919876543210",
      "role": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "roleName": "Super Admin",
        "permissions": ["users.read", "users.create", "..."]
      },
      "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
      "lastLogin": "2026-01-07T10:30:00.000Z"
    }
  },
  "message": "Login successful",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Valid email is required",
      "password": "Password must be at least 8 characters"
    }
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**401 - Invalid Credentials**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**403 - Account Inactive**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Your account is inactive. Please contact administrator."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**429 - Too Many Requests**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again in 15 minutes."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 3.2 POST /api/v1/auth/logout

**Description**: Logout user and revoke refresh token

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `refreshToken`: Required, valid JWT format

**Success Response (200)**:
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Missing Token**:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REFRESH_TOKEN",
    "message": "Refresh token is required"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**401 - Invalid Token**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 3.3 POST /api/v1/auth/refresh

**Description**: Refresh access token using refresh token

**Authentication**: Not required (uses refresh token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `refreshToken`: Required, valid JWT format

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**401 - Invalid/Expired Token**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired. Please login again."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**403 - Account Inactive**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Your account is inactive. Please contact administrator."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 3.4 POST /api/v1/auth/verify

**Description**: Verify JWT token and return user information (used by other microservices)

**Authentication**: Not required (validates token in body)

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `token`: Required, valid JWT format

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "ramkumar@wlancorp.com",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Super Admin",
      "permissions": ["users.read", "users.create", "..."]
    }
  },
  "message": "Token is valid",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**401 - Invalid Token**:
```json
{
  "success": false,
  "data": {
    "valid": false
  },
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token is invalid or expired"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 3.5 POST /api/v1/auth/forgot-password

**Description**: Request password reset link (future: sends email)

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "ramkumar@wlancorp.com"
}
```

**Validation Rules**:
- `email`: Required, valid email format

**Success Response (200)**:
```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a password reset link has been sent.",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Note**: For security, always return success even if email doesn't exist.

---

### 3.6 POST /api/v1/auth/reset-password

**Description**: Reset password using reset token

**Authentication**: Not required (uses reset token)

**Request Body**:
```json
{
  "resetToken": "abc123xyz789...",
  "newPassword": "NewSecurePass123!"
}
```

**Validation Rules**:
- `resetToken`: Required
- `newPassword`: Required, minimum 8 characters, complexity requirements

**Success Response (200)**:
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful. Please login with your new password.",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Weak Password**:
```json
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password must contain at least one uppercase, lowercase, number and special character"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**401 - Invalid Token**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_RESET_TOKEN",
    "message": "Reset token is invalid or expired"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 4. User Management Endpoints

### 4.1 POST /api/v1/users

**Description**: Create new user account (Super Admin only)

**Authentication**: Required (Super Admin)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@wlancorp.com",
  "phone": "+919876543210",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

**Validation Rules**:
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, unique, valid email format
- `phone`: Optional, international format
- `roleId`: Required, must exist in roles collection

**Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@wlancorp.com",
      "phone": "+919876543210",
      "role": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "roleName": "Warehouse Manager"
      },
      "isActive": true,
      "createdAt": "2026-01-07T10:30:00.000Z"
    },
    "temporaryPassword": "TempPass2026!"
  },
  "message": "User created successfully. Temporary password has been generated.",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Valid email is required",
      "firstName": "First name must be between 2 and 50 characters"
    }
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to create users"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**409 - Duplicate Email**:
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "A user with this email already exists"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 4.2 GET /api/v1/users

**Description**: Get paginated list of users (Super Admin only)

**Authentication**: Required (Super Admin)

**Query Parameters**:
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 100)
- `sortBy`: String (default: createdAt)
- `sortOrder`: String (default: desc, values: asc|desc)
- `role`: String (filter by role name)
- `isActive`: Boolean (filter by active status)
- `search`: String (search in firstName, lastName, email)

**Example Request**:
```
GET /api/v1/users?page=1&limit=10&role=Warehouse Manager&search=john
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "65a1b2c3d4e5f6g7h8i9j0k5",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@wlancorp.com",
        "phone": "+919876543210",
        "role": {
          "id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "roleName": "Warehouse Manager"
        },
        "isActive": true,
        "lastLogin": "2026-01-07T09:00:00.000Z",
        "createdAt": "2026-01-05T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Users retrieved successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 4.3 GET /api/v1/users/:id

**Description**: Get user by ID (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: User ObjectId

**Example Request**:
```
GET /api/v1/users/65a1b2c3d4e5f6g7h8i9j0k5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@wlancorp.com",
    "phone": "+919876543210",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Warehouse Manager",
      "permissions": ["inventory.read", "inventory.update"]
    },
    "isActive": true,
    "profileImage": null,
    "lastLogin": "2026-01-07T09:00:00.000Z",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  },
  "message": "User retrieved successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**404 - Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 4.4 PUT /api/v1/users/:id

**Description**: Update user details (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: User ObjectId

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+919876543999",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

**Validation Rules**:
- `firstName`: Optional, 2-50 characters
- `lastName`: Optional, 2-50 characters
- `phone`: Optional, international format
- `roleId`: Optional, must exist in roles collection
- `email`: Cannot be updated

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "firstName": "John",
    "lastName": "Doe Updated",
    "email": "john.doe@wlancorp.com",
    "phone": "+919876543999",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "roleName": "Inventory Manager"
    },
    "isActive": true,
    "updatedAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "User updated successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 4.5 PATCH /api/v1/users/:id/status

**Description**: Activate or deactivate user (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: User ObjectId

**Request Body**:
```json
{
  "isActive": false
}
```

**Validation Rules**:
- `isActive`: Required, boolean

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "isActive": false,
    "updatedAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "User status updated successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Note**: When deactivating user, all refresh tokens are revoked.

---

### 4.6 DELETE /api/v1/users/:id

**Description**: Permanently delete user (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: User ObjectId

**Success Response (200)**:
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Cannot Delete**:
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_USER",
    "message": "Cannot delete user. User has associated records in other modules."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 5. Profile Management Endpoints

### 5.1 GET /api/v1/profile

**Description**: Get current user's profile

**Authentication**: Required (any authenticated user)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "Ramkumar",
    "lastName": "Singh",
    "email": "ramkumar@wlancorp.com",
    "phone": "+919876543210",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Super Admin",
      "permissions": ["users.read", "users.create", "..."]
    },
    "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
    "lastLogin": "2026-01-07T10:30:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 5.2 PUT /api/v1/profile

**Description**: Update current user's profile

**Authentication**: Required (any authenticated user)

**Request Body**:
```json
{
  "firstName": "Ramkumar",
  "lastName": "Singh Updated",
  "phone": "+919876543210"
}
```

**Validation Rules**:
- `firstName`: Optional, 2-50 characters
- `lastName`: Optional, 2-50 characters
- `phone`: Optional, international format
- Cannot update: email, role, isActive

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "Ramkumar",
    "lastName": "Singh Updated",
    "email": "ramkumar@wlancorp.com",
    "phone": "+919876543210",
    "updatedAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "Profile updated successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 5.3 POST /api/v1/profile/change-password

**Description**: Change current user's password

**Authentication**: Required (any authenticated user)

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Validation Rules**:
- `currentPassword`: Required
- `newPassword`: Required, minimum 8 characters, complexity requirements
- `confirmPassword`: Required, must match newPassword

**Success Response (200)**:
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully. Please login again.",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Current Password Incorrect**:
```json
{
  "success": false,
  "error": {
    "code": "INCORRECT_PASSWORD",
    "message": "Current password is incorrect"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**400 - Passwords Don't Match**:
```json
{
  "success": false,
  "error": {
    "code": "PASSWORDS_MISMATCH",
    "message": "New password and confirmation do not match"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 5.4 POST /api/v1/profile/upload-picture

**Description**: Upload profile picture

**Authentication**: Required (any authenticated user)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Request Body (Form Data)**:
- `profileImage`: File (JPG, PNG, max 2MB)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "profileImage": "https://storage.example.com/profiles/65a1b2c3d4e5f6g7h8i9j0k1.jpg"
  },
  "message": "Profile picture uploaded successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - File Too Large**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must not exceed 2MB"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**400 - Invalid File Type**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only JPG and PNG images are allowed"
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 6. Role Management Endpoints

### 6.1 POST /api/v1/roles

**Description**: Create new role (Super Admin only)

**Authentication**: Required (Super Admin)

**Request Body**:
```json
{
  "roleName": "Regional Manager",
  "description": "Manages multiple warehouses in a region",
  "permissions": [
    "warehouses.read",
    "inventory.read",
    "inventory.update",
    "reports.read"
  ]
}
```

**Validation Rules**:
- `roleName`: Required, unique, 3-50 characters
- `description`: Optional, max 500 characters
- `permissions`: Required, array of valid permission strings

**Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "roleName": "Regional Manager",
    "description": "Manages multiple warehouses in a region",
    "permissions": [
      "warehouses.read",
      "inventory.read",
      "inventory.update",
      "reports.read"
    ],
    "isActive": true,
    "createdAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "Role created successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 6.2 GET /api/v1/roles

**Description**: Get all roles

**Authentication**: Required (Super Admin)

**Query Parameters**:
- `isActive`: Boolean (filter by active status)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "roleName": "Super Admin",
        "description": "Full system access",
        "permissions": ["*"],
        "isActive": true,
        "createdAt": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": "65a1b2c3d4e5f6g7h8i9j0k3",
        "roleName": "Warehouse Manager",
        "description": "Manage warehouse operations",
        "permissions": ["warehouses.read", "inventory.read"],
        "isActive": true,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Roles retrieved successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 6.3 GET /api/v1/roles/:id

**Description**: Get role by ID

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: Role ObjectId

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "roleName": "Super Admin",
    "description": "Full system access with all permissions",
    "permissions": [
      "users.read", "users.create", "users.update", "users.delete",
      "roles.read", "roles.create", "roles.update", "roles.delete",
      "products.read", "products.create", "products.update", "products.delete"
    ],
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "message": "Role retrieved successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 6.4 PUT /api/v1/roles/:id

**Description**: Update role (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: Role ObjectId

**Request Body**:
```json
{
  "description": "Updated description",
  "permissions": [
    "warehouses.read",
    "inventory.read",
    "inventory.update",
    "inventory.create"
  ]
}
```

**Validation Rules**:
- `roleName`: Cannot be updated
- `description`: Optional, max 500 characters
- `permissions`: Optional, array of valid permission strings

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "roleName": "Regional Manager",
    "description": "Updated description",
    "permissions": [
      "warehouses.read",
      "inventory.read",
      "inventory.update",
      "inventory.create"
    ],
    "isActive": true,
    "updatedAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "Role updated successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

### 6.5 PATCH /api/v1/roles/:id/status

**Description**: Activate or deactivate role (Super Admin only)

**Authentication**: Required (Super Admin)

**Path Parameters**:
- `id`: Role ObjectId

**Request Body**:
```json
{
  "isActive": false
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "isActive": false,
    "updatedAt": "2026-01-07T10:30:00.000Z"
  },
  "message": "Role status updated successfully",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Responses**:

**400 - Cannot Deactivate**:
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DEACTIVATE_ROLE",
    "message": "Cannot deactivate role. Users are currently assigned to this role."
  },
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 7. Health Check & Monitoring

### 7.1 GET /api/v1/health

**Description**: Service health check

**Authentication**: Not required

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "service": "AUTH",
    "status": "healthy",
    "uptime": 3600,
    "timestamp": "2026-01-07T10:30:00.000Z",
    "database": {
      "status": "connected",
      "responseTime": 5
    }
  },
  "message": "Service is healthy",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

---

## 8. API Endpoint Summary Table

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/api/v1/auth/login` | No | - | User login |
| POST | `/api/v1/auth/logout` | Yes | Any | User logout |
| POST | `/api/v1/auth/refresh` | No | - | Refresh access token |
| POST | `/api/v1/auth/verify` | No | - | Verify token (for services) |
| POST | `/api/v1/auth/forgot-password` | No | - | Request password reset |
| POST | `/api/v1/auth/reset-password` | No | - | Reset password |
| POST | `/api/v1/users` | Yes | Super Admin | Create user |
| GET | `/api/v1/users` | Yes | Super Admin | Get all users |
| GET | `/api/v1/users/:id` | Yes | Super Admin | Get user by ID |
| PUT | `/api/v1/users/:id` | Yes | Super Admin | Update user |
| PATCH | `/api/v1/users/:id/status` | Yes | Super Admin | Activate/deactivate user |
| DELETE | `/api/v1/users/:id` | Yes | Super Admin | Delete user |
| GET | `/api/v1/profile` | Yes | Any | Get own profile |
| PUT | `/api/v1/profile` | Yes | Any | Update own profile |
| POST | `/api/v1/profile/change-password` | Yes | Any | Change own password |
| POST | `/api/v1/profile/upload-picture` | Yes | Any | Upload profile picture |
| POST | `/api/v1/roles` | Yes | Super Admin | Create role |
| GET | `/api/v1/roles` | Yes | Super Admin | Get all roles |
| GET | `/api/v1/roles/:id` | Yes | Super Admin | Get role by ID |
| PUT | `/api/v1/roles/:id` | Yes | Super Admin | Update role |
| PATCH | `/api/v1/roles/:id/status` | Yes | Super Admin | Activate/deactivate role |
| GET | `/api/v1/health` | No | - | Health check |

---

## 9. Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCOUNT_INACTIVE` | 403 | User account is deactivated |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `MISSING_REFRESH_TOKEN` | 400 | Refresh token not provided |
| `INVALID_TOKEN` | 401 | Token is invalid or expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid/expired |
| `WEAK_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_RESET_TOKEN` | 401 | Reset token invalid/expired |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `CANNOT_DELETE_USER` | 400 | User has dependent records |
| `INCORRECT_PASSWORD` | 400 | Current password is wrong |
| `PASSWORDS_MISMATCH` | 400 | Passwords don't match |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `INVALID_FILE_TYPE` | 400 | Unsupported file format |
| `CANNOT_DEACTIVATE_ROLE` | 400 | Role has assigned users |

---

## Document End
**Previous Document**: [3-User-Stories-Use-Cases.md](./3-User-Stories-Use-Cases.md)  
**Next Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: AUTH Documentation (4/6 documents)  
**Overall Progress**: 4/30 documents (13.3%)
