# WLAN Corporation — Web UI Implementation Guide (React + Material UI)

**Audience:** UI/UX designers, front-end engineers, QA, and delivery teams

**Scope:** This is a **guide**, not an implementation. It contains **no HTML/CSS/JS code**. It defines UI patterns, information architecture, UX rules, and integration expectations for the Web Admin/Manager application that consumes AUTH + PMS services.

**Reference UX direction:** Tabler (free tier) style admin experience: clean, dense-but-readable tables, consistent cards, left-side navigation, clear empty states, and predictable CRUD flows.

**Last updated:** 2026-01-14

---

## 1) Product Goal and Personas

### 1.1 Goal
Build an admin/manager-focused web application for WLAN’s warehouse operations to manage:
- Authentication + user access (via AUTH)
- Product catalog (via PMS): categories, sub-categories, products, SKUs, images, QR/barcodes
- Future modules (planned): suppliers, warehouses, inventory (SMS/WMS/IMS)

### 1.2 Primary personas (Web)
- **Super Admin / Admin**: platform configuration, user + role management
- **Product Manager**: manages categories/subcategories/products; bulk imports
- **Warehouse Manager / Inventory Manager**: read-heavy, reporting and lookups
- **Auditor/Viewer**: read-only, compliance views

### 1.3 UX principles (Tabler-like)
- **Speed-first**: tables and search are primary; minimize clicks to common actions.
- **Predictability**: same layout, same action placements across modules.
- **Safe operations**: confirm destructive actions; show dependency warnings.
- **Clarity**: consistent statuses, tags, and timestamps.

---

## 2) Non-Functional UI Requirements

### 2.1 Supported platforms
- **Modern browsers only** (latest Chrome/Edge/Firefox/Safari). No legacy support.

### 2.2 Performance
- Optimize for large tables (10k+ products). Required UI patterns:
  - server-side pagination
  - server-side filtering/search
  - stable sorting
  - debounced search input

### 2.3 Security and session behavior
- Token storage: **localStorage** (as per your decision).
- Required behaviors:
  - **token refresh** strategy (silent refresh)
  - **auto-logout** after inactivity
  - robust handling of 401/403 with immediate UX feedback

### 2.4 Internationalization and accessibility
- Language: English only.
- Accessibility: not a primary focus now; still avoid obvious anti-patterns (e.g., unlabeled icons).

---

## 3) Information Architecture (IA)

### 3.1 App shell (global)
- Left sidebar navigation (collapsible)
- Top bar with:
  - environment/app name
  - global search (optional)
  - notifications (optional placeholder)
  - user menu: profile, settings (optional), logout

### 3.2 Recommended navigation tree (MVP)
- **Dashboard**
- **Products**
  - Categories
  - Sub-categories
  - Products
  - Bulk Import
  - Assets (Images / QR / Barcode)
- **Users & Access**
  - Users
  - Roles
- **Reports**
  - Product Reports
  - Activity/Audit (if enabled)
- **System**
  - API Health
  - Logs (optional)

### 3.3 Route naming conventions (human-readable)
Use a consistent, predictable URL scheme:
- `/login`
- `/dashboard`
- `/products/categories`
- `/products/subcategories`
- `/products/products`
- `/products/import`
- `/access/users`
- `/access/roles`
- `/reports/products`

---

## 4) Design System Guide (Material UI + Tabler feel)

### 4.1 Visual foundation
- **Layout grid:** 12-column, max content width with comfortable gutters.
- **Density:** default to “compact admin” spacing; allow per-table density toggle.

### 4.2 Color and tone (proposed)
A professional system suitable for enterprise admin tools:
- Primary: deep blue (actions, links)
- Secondary: slate/gray (surfaces, borders)
- Status colors:
  - Success: green
  - Warning: amber
  - Error: red
  - Info: blue

### 4.3 Typography
- Clear hierarchy:
  - Page title
  - Section heading
  - Table header
  - Helper text
- Avoid overly large headings; keep admin density.

### 4.4 Components (standardize these)
**Foundational**
- AppShell: sidebar + topbar + content
- PageHeader: title, breadcrumbs, primary action(s)
- Card: KPI cards, summary cards

**Data display**
- DataTable: pagination, sorting, column visibility, row selection
- Tag/Chip: statuses (Active/Inactive/Deleted)
- EmptyState: icon + message + suggested action

**Forms and actions**
- Form layout: 1-column on narrow, 2-column on wide
- Standard inputs: text, textarea, select, multi-select, date, currency
- Action bar: Save / Cancel / Reset; consistent placement

**Feedback**
- Toast/snackbar for success messages
- Inline validation for field errors
- Confirmation dialogs for destructive actions
- Global error boundary page for unexpected errors

### 4.5 Icons
- Use a single icon set consistently (Tabler Icons are a good fit with Tabler UI).

---

## 5) Authentication UX (AUTH service)

### 5.1 Screens
- Login
- (Optional later) Forgot password / Reset password

### 5.2 Login screen UX
- Inputs: email, password
- Behaviors:
  - show password toggle
  - remember me: optional (even if storing tokens in localStorage)
  - clear, non-technical error messages

### 5.3 Session model (recommended)
- Use **access token** for API calls.
- Use **refresh token** to obtain new access token.
- On app start:
  - if tokens exist → attempt “silent verify/refresh” before rendering protected routes
- On inactivity timeout:
  - show “Session expiring” warning dialog (optional)
  - then logout and redirect to login

### 5.4 Logout UX
- Confirm logout? (optional)
- Always clear tokens and cached user state

---

## 6) Authorization & Role-based UI

### 6.1 Permission-driven navigation
- Hide or disable modules based on permissions returned from AUTH.
- Always enforce on backend too; UI gating is for UX only.

### 6.2 Permission behaviors
- If permission missing:
  - hide action buttons (Create/Edit/Delete)
  - show read-only views
- If backend returns 403:
  - show “You don’t have access to this action” and log telemetry (optional)

---

## 7) PMS Module UX Specifications

### 7.1 Categories
**Primary screens**
- Category list
- Category create/edit (modal or dedicated page)

**List page must include**
- Table columns: Name, Code, Description, Status (Active), Updated At
- Filters:
  - Status: Active/Inactive
  - Search: name/code
- Actions:
  - Create Category (primary)
  - Row actions: View, Edit, Deactivate/Activate, Delete (soft)

**Create/Edit form rules**
- Name: required, 2–100
- Code: optional; if provided must be uppercase-like; if not, auto-generated
- Description: optional, max 500
- isActive: toggle

**Dependency rules (must be surfaced)**
- Deactivate/Delete category should warn if sub-categories/products exist.
- UI should display dependency message returned by backend.

### 7.2 Sub-categories
**List page must include**
- Table columns: Name, Code, Parent Category, Status, Updated At
- Filters:
  - Parent Category dropdown
  - Status filter
  - Search by name/code

**Create/Edit**
- Must select parent category
- Same general validation behaviors as Category

### 7.3 Products
**Primary screens**
- Product list
- Product details (recommended separate page)
- Product create/edit

**Product list UX**
- Table columns (recommended):
  - SKU
  - Name
  - Category / Sub-category
  - Brand / Model
  - Price
  - Status (Active/Discontinued/Out of Stock/Coming Soon)
  - Updated At
- Filters:
  - Category, Sub-category
  - Status
  - Brand
  - Price range
  - Search (SKU/name)
- Bulk actions (optional for later): deactivate multiple, delete multiple

**Product create/edit UX**
- Stepper is recommended (to reduce long forms):
  1) Classification (category, sub-category)
  2) Identity (name, brand, model, SKU behavior)
  3) Commercial (price, warranty, status)
  4) Specs (key-value editor)
  5) Assets (images)
- SKU auto-generation: show read-only SKU after classification+brand.

### 7.4 Image preview requirements
- On product details:
  - gallery view
  - main image preview with zoom
  - file type validation feedback (jpeg/png/webp)
  - upload progress indicator

### 7.5 QR/Barcode UX
- On product details:
  - show QR + Barcode images
  - show “Download” actions
  - show “Regenerate” actions (if supported)
- On list/table:
  - optional inline “scan” icon to open QR/Barcode quick view

### 7.6 Bulk Import Feature

**Status:** Deferred to future phase. Not included in initial implementation.

---

## 8) Barcode/QR Scanning on Web

### 8.1 Entry points
- Global scan button in top bar OR within Products module

### 8.2 Camera scanning UX
- Full-screen modal with:
  - camera preview
  - flashlight toggle (if supported)
  - camera select (if multiple)
  - manual entry fallback
- Result behaviors:
  - If SKU found → navigate to product detail
  - If unknown → show not-found state with create option (if permitted)

---

## 9) Dashboard and Reports

### 9.1 Dashboard (manual refresh)
- KPI cards (examples):
  - Total products
  - Active products
  - Out of stock products (future: IMS)
  - Recently updated products
- Charts (Chart.js recommended):
  - Products by category
  - Products by status

### 9.2 Reports
- PDF generation required.
- Report types (initial):
  - Product catalog snapshot
  - Category-wise product listing

**PDF UX rules**
- Always preview before download (modal viewer)
- Include filters applied + generation timestamp

---

## 10) Error Handling and Messaging

### 10.1 Standard states
- Loading
- Empty
- Error
- Partial error (some widgets failed)

### 10.2 Error copy guidelines
- Avoid raw stack traces.
- Prefer action-oriented messages:
  - “Couldn’t load products. Try again.”
  - “Session expired. Please login again.”

### 10.3 Forms
- Inline field validation first
- Then server-side validation display (mapped to fields when possible)

---

## 11) Front-end Architecture Guidance (no code)

### 11.1 Folder conventions (suggestion)
- `pages/` route-level screens
- `components/` reusable UI blocks
- `features/` domain modules (products, access)
- `services/` API clients
- `state/` Context providers
- `utils/` helpers (formatting, dates)

### 11.2 Context API usage (recommended)
Define separate contexts:
- AuthContext: session, current user, permissions
- UIContext: theme, table density, sidebar state
- ProductContext (optional): cross-page filters / last viewed

Avoid placing large lists in global context if you have heavy tables—prefer per-page data fetching.

---

## 12) API Documentation & Integration Specifications

### 12.1 Standard Response Envelope

All API endpoints from both AUTH and PMS services follow a standard response format:

**Success Response Structure:**
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Operation successful",
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

**Error Response Structure:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional additional context */ }
  },
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

**Paginated Response Structure:**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of resources */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Data retrieved successfully",
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

### 12.2 Common HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but lacks required permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email/code already exists) |
| 500 | Internal Server Error | Server error |

### 12.3 Authentication Header Format

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 13) AUTH Service API Endpoints

**Base URL:** `http://localhost:5001/api/v1` (development)  
**Production URL:** `https://api.wlancorp.com/auth/api/v1`

### 13.1 Authentication Endpoints

#### POST /auth/login

**Purpose:** Authenticate user and receive access/refresh tokens

**Pre-conditions:** None (public endpoint)

**Request Body:**
```json
{
  "email": "ramkumar@wlancorp.com",
  "password": "SecurePass123!"
}
```

**Client-side Validation:**
- `email`: required, valid email format
- `password`: required, minimum 8 characters

**Success Response (200):**
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
        "permissions": ["*"]
      },
      "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
      "isActive": true,
      "lastLogin": "2026-01-14T10:30:00.000Z"
    }
  },
  "message": "Login successful",
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

**Failure Scenarios:**

*400 Bad Request - Validation Error:*
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Valid email is required"
    }
  }
}
```

*401 Unauthorized - Invalid Credentials:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

*403 Forbidden - Inactive Account:*
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Your account has been deactivated"
  }
}
```

---

#### POST /auth/refresh

**Purpose:** Obtain new access token using refresh token

**Pre-conditions:** Valid refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

**Failure Scenarios:**

*401 Unauthorized - Invalid/Expired Token:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

---

#### POST /auth/logout

**Purpose:** Invalidate refresh token and logout user

**Pre-conditions:** Valid refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

#### GET /auth/verify

**Purpose:** Verify access token and get user details

**Pre-conditions:** Valid access token in Authorization header

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "ramkumar@wlancorp.com",
      "firstName": "Ramkumar",
      "lastName": "Singh",
      "role": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "roleName": "Super Admin",
        "permissions": ["*"]
      },
      "isActive": true
    }
  },
  "message": "Token is valid"
}
```

**Failure Scenarios:**

*401 Unauthorized - Invalid Token:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired access token"
  }
}
```

---

### 13.2 User Management Endpoints

#### GET /users

**Purpose:** Retrieve paginated list of users with filters

**Pre-conditions:** 
- User must be authenticated
- User must have `users.read` permission

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `roleId` (string, optional) - Filter by role ID
- `isActive` (boolean, optional) - Filter by active status
- `search` (string, optional) - Search in firstName, lastName, email

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "firstName": "Ramkumar",
        "lastName": "Singh",
        "email": "ramkumar@wlancorp.com",
        "phone": "+919876543210",
        "role": {
          "id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "roleName": "Super Admin"
        },
        "isActive": true,
        "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
        "lastLogin": "2026-01-14T10:30:00.000Z",
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-01-14T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Failure Scenarios:**

*403 Forbidden - Missing Permission:*
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to view users"
  }
}
```

---

#### GET /users/:id

**Purpose:** Get single user details by ID

**Pre-conditions:**
- User must be authenticated
- User must have `users.read` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "Ramkumar",
    "lastName": "Singh",
    "email": "ramkumar@wlancorp.com",
    "phone": "+919876543210",
    "roleId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Super Admin",
      "permissions": ["*"]
    },
    "isActive": true,
    "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
    "lastLogin": "2026-01-14T10:30:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z",
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k0",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k0"
  }
}
```

**Failure Scenarios:**

*404 Not Found:*
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

---

#### POST /users

**Purpose:** Create new user

**Pre-conditions:**
- User must be authenticated
- User must have `users.create` permission

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@wlancorp.com",
  "password": "SecurePass123!",
  "phone": "+919876543211",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k3",
  "isActive": true
}
```

**Client-side Validation:**
- `firstName`: required, 2-50 characters
- `lastName`: required, 2-50 characters
- `email`: required, valid email format, unique
- `password`: required, minimum 8 characters, must contain uppercase, lowercase, number, special character
- `phone`: optional, valid international format (+919876543210)
- `roleId`: required, valid ObjectId
- `isActive`: optional boolean, default true

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@wlancorp.com",
    "phone": "+919876543211",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "roleName": "Product Manager"
    },
    "isActive": true,
    "createdAt": "2026-01-14T11:00:00.000Z"
  },
  "message": "User created successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Validation:*
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
  }
}
```

*409 Conflict - Email Exists:*
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already exists"
  }
}
```

---

#### PUT /users/:id

**Purpose:** Update existing user

**Pre-conditions:**
- User must be authenticated
- User must have `users.update` permission

**Request Body (all fields optional except restrictions):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543211",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k3",
  "isActive": true
}
```

**Note:** Email and password cannot be updated via this endpoint

**Client-side Validation:**
- Same as create, but all fields optional

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@wlancorp.com",
    "phone": "+919876543211",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "roleName": "Product Manager"
    },
    "isActive": true,
    "updatedAt": "2026-01-14T11:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

---

#### DELETE /users/:id

**Purpose:** Soft delete user (set isActive to false)

**Pre-conditions:**
- User must be authenticated
- User must have `users.delete` permission
- Cannot delete own account
- Cannot delete Super Admin (recommended)

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Cannot Delete Self:*
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SELF",
    "message": "You cannot delete your own account"
  }
}
```

---

### 13.3 Profile Management Endpoints

#### GET /profile

**Purpose:** Get current logged-in user's profile

**Pre-conditions:** User must be authenticated

**Success Response (200):**
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
      "permissions": ["*"]
    },
    "isActive": true,
    "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
    "lastLogin": "2026-01-14T10:30:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /profile

**Purpose:** Update current user's profile

**Pre-conditions:** User must be authenticated

**Request Body:**
```json
{
  "firstName": "Ramkumar",
  "lastName": "Singh",
  "phone": "+919876543210"
}
```

**Client-side Validation:**
- `firstName`: optional, 2-50 characters if provided
- `lastName`: optional, 2-50 characters if provided
- `phone`: optional, valid international format if provided

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "Ramkumar",
    "lastName": "Singh",
    "email": "ramkumar@wlancorp.com",
    "phone": "+919876543210",
    "updatedAt": "2026-01-14T11:45:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

#### POST /profile/upload-image

**Purpose:** Upload profile image

**Pre-conditions:** User must be authenticated

**Request:** multipart/form-data
- Field name: `profileImage`
- Allowed types: image/jpeg, image/png
- Max size: 2MB

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profileImage": "https://storage.example.com/profiles/65a1b2c3d4e5f6g7h8i9j0k1.jpg"
  },
  "message": "Profile image uploaded successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Invalid File:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only JPEG and PNG images are allowed"
  }
}
```

*400 Bad Request - File Too Large:*
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must not exceed 2MB"
  }
}
```

---

#### PUT /profile/change-password

**Purpose:** Change current user's password

**Pre-conditions:** User must be authenticated

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!@#"
}
```

**Client-side Validation:**
- `currentPassword`: required
- `newPassword`: required, minimum 8 characters, must contain uppercase, lowercase, number, special character

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

**Failure Scenarios:**

*401 Unauthorized - Incorrect Current Password:*
```json
{
  "success": false,
  "error": {
    "code": "INCORRECT_PASSWORD",
    "message": "Current password is incorrect"
  }
}
```

---

### 13.4 Role Management Endpoints

#### GET /roles

**Purpose:** Retrieve all roles

**Pre-conditions:**
- User must be authenticated
- User must have `roles.read` permission

**Query Parameters:**
- `isActive` (boolean, optional) - Filter by active status

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Super Admin",
      "description": "Full system access with all permissions",
      "permissions": ["*"],
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "roleName": "Product Manager",
      "description": "Manage product catalog",
      "permissions": [
        "products.read",
        "products.create",
        "products.update",
        "products.delete",
        "categories.read",
        "categories.create",
        "categories.update",
        "categories.delete"
      ],
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET /roles/:id

**Purpose:** Get single role details by ID

**Pre-conditions:**
- User must be authenticated
- User must have `roles.read` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "roleName": "Product Manager",
    "description": "Manage product catalog",
    "permissions": [
      "products.read",
      "products.create",
      "products.update",
      "products.delete",
      "categories.read",
      "categories.create",
      "categories.update",
      "categories.delete"
    ],
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### POST /roles

**Purpose:** Create new role

**Pre-conditions:**
- User must be authenticated
- User must have `roles.create` permission

**Request Body:**
```json
{
  "roleName": "Warehouse Supervisor",
  "description": "Supervise warehouse operations",
  "permissions": [
    "products.read",
    "inventory.read",
    "inventory.update"
  ],
  "isActive": true
}
```

**Client-side Validation:**
- `roleName`: required, 2-50 characters, unique
- `description`: optional, max 500 characters
- `permissions`: required array, must contain valid permission strings
- `isActive`: optional boolean, default true

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "roleName": "Warehouse Supervisor",
    "description": "Supervise warehouse operations",
    "permissions": [
      "products.read",
      "inventory.read",
      "inventory.update"
    ],
    "isActive": true,
    "createdAt": "2026-01-14T12:00:00.000Z"
  },
  "message": "Role created successfully"
}
```

**Failure Scenarios:**

*409 Conflict - Role Name Exists:*
```json
{
  "success": false,
  "error": {
    "code": "ROLE_EXISTS",
    "message": "Role with this name already exists"
  }
}
```

---

#### PUT /roles/:id

**Purpose:** Update existing role

**Pre-conditions:**
- User must be authenticated
- User must have `roles.update` permission
- Cannot update system-default roles (optional restriction)

**Request Body (all fields optional):**
```json
{
  "roleName": "Warehouse Supervisor",
  "description": "Updated description",
  "permissions": [
    "products.read",
    "inventory.read",
    "inventory.update",
    "inventory.create"
  ],
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "roleName": "Warehouse Supervisor",
    "description": "Updated description",
    "permissions": [
      "products.read",
      "inventory.read",
      "inventory.update",
      "inventory.create"
    ],
    "isActive": true,
    "updatedAt": "2026-01-14T12:30:00.000Z"
  },
  "message": "Role updated successfully"
}
```

---

#### DELETE /roles/:id

**Purpose:** Delete role (soft delete or hard delete based on implementation)

**Pre-conditions:**
- User must be authenticated
- User must have `roles.delete` permission
- Cannot delete if users are assigned to this role

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Role deleted successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Role In Use:*
```json
{
  "success": false,
  "error": {
    "code": "ROLE_IN_USE",
    "message": "Cannot delete role. 5 users are assigned to this role.",
    "details": {
      "userCount": 5
    }
  }
}
```

---

### 13.5 Complete Permission List

Below is the complete list of permissions available in the AUTH service. Front-end teams can use these for conditional UI rendering.

**Wildcard Permission:**
- `*` - Super Admin permission (grants all access)

**User Management Permissions:**
- `users.read` - View user list and details
- `users.create` - Create new users
- `users.update` - Update existing users
- `users.delete` - Delete/deactivate users

**Role Management Permissions:**
- `roles.read` - View role list and details
- `roles.create` - Create new roles
- `roles.update` - Update existing roles
- `roles.delete` - Delete roles

**Product Management Permissions (PMS):**
- `products.read` - View product list and details
- `products.create` - Create new products
- `products.update` - Update existing products
- `products.delete` - Delete/deactivate products

**Category Management Permissions (PMS):**
- `categories.read` - View category list and details
- `categories.create` - Create new categories
- `categories.update` - Update existing categories
- `categories.delete` - Delete/deactivate categories

**Supplier Management Permissions (SMS - Future):**
- `suppliers.read` - View supplier list and details
- `suppliers.create` - Create new suppliers
- `suppliers.update` - Update existing suppliers
- `suppliers.delete` - Delete/deactivate suppliers

**Warehouse Management Permissions (WMS - Future):**
- `warehouses.read` - View warehouse list and details
- `warehouses.create` - Create new warehouses
- `warehouses.update` - Update existing warehouses
- `warehouses.delete` - Delete/deactivate warehouses

**Inventory Management Permissions (IMS - Future):**
- `inventory.read` - View inventory levels and transactions
- `inventory.create` - Create inventory transactions
- `inventory.update` - Update inventory levels
- `inventory.delete` - Delete inventory records

**Reporting Permissions:**
- `reports.read` - View and generate reports
- `reports.export` - Export reports to PDF/Excel

---

## 14) PMS Service API Endpoints

**Base URL:** `http://localhost:5002/api/v1` (development)  
**Production URL:** `https://pms.wlancorp.com/api/v1`

### 14.1 Category Endpoints

#### POST /categories

**Purpose:** Create new category

**Pre-conditions:**
- User must be authenticated
- User must have `categories.create` permission

**Request Body:**
```json
{
  "name": "Electronics",
  "code": "ELEC",
  "description": "Electronic devices and accessories",
  "isActive": true
}
```

**Client-side Validation:**
- `name`: required, 2-100 characters
- `code`: optional (auto-generated if not provided), 2-10 characters, uppercase alphanumeric
- `description`: optional, max 500 characters
- `isActive`: optional boolean, default true

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics",
    "code": "ELEC",
    "description": "Electronic devices and accessories",
    "isActive": true,
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T10:00:00Z",
    "updatedAt": "2026-01-14T10:00:00Z"
  },
  "message": "Category 'Electronics' created successfully"
}
```

**Failure Scenarios:**

*409 Conflict - Duplicate Name:*
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CATEGORY_NAME",
    "message": "Category with name 'Electronics' already exists"
  }
}
```

*409 Conflict - Duplicate Code:*
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CATEGORY_CODE",
    "message": "Category with code 'ELEC' already exists"
  }
}
```

---

#### GET /categories

**Purpose:** List all categories with pagination and filters

**Pre-conditions:**
- User must be authenticated (optional authentication for read operations)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `is_active` (boolean, optional) - Filter by active status
- `search` (string, optional) - Search in name or code

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123456",
        "name": "Electronics",
        "code": "ELEC",
        "description": "Electronic devices and accessories",
        "isActive": true,
        "isDeleted": false,
        "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
        "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
        "createdAt": "2026-01-14T10:00:00Z",
        "updatedAt": "2026-01-14T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Categories retrieved successfully"
}
```

---

#### GET /categories/:id

**Purpose:** Get single category by ID

**Pre-conditions:** User must be authenticated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics",
    "code": "ELEC",
    "description": "Electronic devices and accessories",
    "isActive": true,
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T10:00:00Z",
    "updatedAt": "2026-01-14T10:00:00Z"
  }
}
```

**Failure Scenarios:**

*404 Not Found:*
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category with ID 6789abcd1234567890123456 not found"
  }
}
```

---

#### PUT /categories/:id

**Purpose:** Update existing category

**Pre-conditions:**
- User must be authenticated
- User must have `categories.update` permission

**Request Body (all fields optional except code):**
```json
{
  "name": "Electronics & Gadgets",
  "description": "Updated description",
  "isActive": true
}
```

**Note:** Category code cannot be updated after creation

**Client-side Validation:**
- `name`: optional, 2-100 characters if provided
- `description`: optional, max 500 characters if provided
- `isActive`: optional boolean

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics & Gadgets",
    "code": "ELEC",
    "description": "Updated description",
    "isActive": true,
    "isDeleted": false,
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedAt": "2026-01-14T11:00:00Z"
  },
  "message": "Category updated successfully"
}
```

---

#### DELETE /categories/:id

**Purpose:** Soft delete category (set isDeleted to true)

**Pre-conditions:**
- User must be authenticated
- User must have `categories.delete` permission
- Category must not have active sub-categories
- Category must not have active products

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Category deleted successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Has Dependencies:*
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_SUBCATEGORIES",
    "message": "Cannot delete category. It has 5 active sub-categories.",
    "details": {
      "subCategoryCount": 5
    }
  }
}
```

---

### 14.2 Sub-Category Endpoints

#### POST /subcategories

**Purpose:** Create new sub-category

**Pre-conditions:**
- User must be authenticated
- User must have `categories.create` permission

**Request Body:**
```json
{
  "name": "Routers",
  "code": "ROUTER",
  "categoryId": "6789abcd1234567890123456",
  "description": "Network routers and access points",
  "isActive": true
}
```

**Client-side Validation:**
- `name`: required, 2-100 characters
- `code`: optional (auto-generated if not provided), 2-10 characters, uppercase alphanumeric
- `categoryId`: required, valid ObjectId
- `description`: optional, max 500 characters
- `isActive`: optional boolean, default true

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "name": "Routers",
    "code": "ROUTER",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "description": "Network routers and access points",
    "isActive": true,
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "Sub-category 'Routers' created successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Invalid Parent:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY",
    "message": "Parent category not found or inactive"
  }
}
```

---

#### GET /subcategories

**Purpose:** List all sub-categories with pagination and filters

**Pre-conditions:** User must be authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category_id` (string, optional) - Filter by parent category
- `is_active` (boolean, optional)
- `search` (string, optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123457",
        "name": "Routers",
        "code": "ROUTER",
        "categoryId": "6789abcd1234567890123456",
        "categoryName": "Electronics",
        "description": "Network routers",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2026-01-14T10:30:00Z",
        "updatedAt": "2026-01-14T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### GET /subcategories/:id

**Purpose:** Get single sub-category by ID

**Pre-conditions:** User must be authenticated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "name": "Routers",
    "code": "ROUTER",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "description": "Network routers and access points",
    "isActive": true,
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
}
```

---

#### PUT /subcategories/:id

**Purpose:** Update existing sub-category

**Pre-conditions:**
- User must be authenticated
- User must have `categories.update` permission

**Request Body (all fields optional):**
```json
{
  "name": "Wireless Routers",
  "description": "Updated description",
  "categoryId": "6789abcd1234567890123456",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "name": "Wireless Routers",
    "code": "ROUTER",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "description": "Updated description",
    "isActive": true,
    "updatedAt": "2026-01-14T11:30:00Z"
  },
  "message": "Sub-category updated successfully"
}
```

---

#### DELETE /subcategories/:id

**Purpose:** Soft delete sub-category

**Pre-conditions:**
- User must be authenticated
- User must have `categories.delete` permission
- Sub-category must not have active products

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Sub-category deleted successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Has Products:*
```json
{
  "success": false,
  "error": {
    "code": "SUBCATEGORY_HAS_PRODUCTS",
    "message": "Cannot delete sub-category. It has 25 active products.",
    "details": {
      "productCount": 25
    }
  }
}
```

---

### 14.3 Product Endpoints

#### POST /products

**Purpose:** Create new product with auto-generated SKU

**Pre-conditions:**
- User must be authenticated
- User must have `products.create` permission

**Request Body:**
```json
{
  "name": "Cisco Catalyst 2960-X Series Switch",
  "categoryId": "6789abcd1234567890123456",
  "subCategoryId": "6789abcd1234567890123457",
  "brand": "Cisco",
  "model": "WS-C2960X-24TS-L",
  "description": "24-port Gigabit Ethernet switch",
  "specifications": {
    "ports": "24",
    "type": "Gigabit Ethernet",
    "poe": "No",
    "stackable": "Yes"
  },
  "price": 45000.00,
  "currency": "INR",
  "unitOfMeasure": "piece",
  "dimensions": {
    "length": 44.5,
    "width": 24.4,
    "height": 4.4,
    "unit": "cm"
  },
  "weight": 3.6,
  "weightUnit": "kg",
  "warrantyPeriod": 12,
  "warrantyUnit": "months",
  "status": "Active"
}
```

**Client-side Validation:**
- `name`: required, 2-200 characters
- `categoryId`: required, valid ObjectId
- `subCategoryId`: required, valid ObjectId
- `brand`: required, 2-100 characters
- `model`: required, 2-100 characters
- `description`: optional, max 1000 characters
- `specifications`: optional JSON object
- `price`: required, positive decimal
- `currency`: optional, default "INR"
- `unitOfMeasure`: optional, default "piece"
- `dimensions`: optional object with length, width, height, unit
- `weight`: optional, positive decimal
- `weightUnit`: optional, default "kg"
- `warrantyPeriod`: optional, positive integer
- `warrantyUnit`: optional, enum: "days", "months", "years"
- `status`: optional, enum: "Active", "Discontinued", "Out of Stock", "Coming Soon"

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "subCategoryId": "6789abcd1234567890123457",
    "subCategoryName": "Routers",
    "brand": "Cisco",
    "model": "WS-C2960X-24TS-L",
    "description": "24-port Gigabit Ethernet switch",
    "specifications": {
      "ports": "24",
      "type": "Gigabit Ethernet",
      "poe": "No",
      "stackable": "Yes"
    },
    "price": 45000.00,
    "currency": "INR",
    "unitOfMeasure": "piece",
    "dimensions": {
      "length": 44.5,
      "width": 24.4,
      "height": 4.4,
      "unit": "cm"
    },
    "weight": 3.6,
    "weightUnit": "kg",
    "warrantyPeriod": 12,
    "warrantyUnit": "months",
    "status": "Active",
    "qrCodeId": "6789abcd1234567890123459",
    "barcodeId": "6789abcd123456789012345a",
    "images": [],
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T12:00:00Z"
  },
  "message": "Product created successfully with SKU ELEC-ROUTER-CISCO-0001"
}
```

**Note:** QR code and barcode are automatically generated on product creation

**Failure Scenarios:**

*400 Bad Request - Invalid Category/SubCategory:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY",
    "message": "Category or sub-category not found or inactive"
  }
}
```

---

#### GET /products

**Purpose:** List all products with pagination and filters

**Pre-conditions:** User must be authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category_id` (string, optional)
- `subcategory_id` (string, optional)
- `brand` (string, optional)
- `status` (string, optional) - Active/Discontinued/Out of Stock/Coming Soon
- `price_min` (number, optional)
- `price_max` (number, optional)
- `search` (string, optional) - Search in SKU, name, brand, model

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123458",
        "sku": "ELEC-ROUTER-CISCO-0001",
        "name": "Cisco Catalyst 2960-X Series Switch",
        "categoryName": "Electronics",
        "subCategoryName": "Routers",
        "brand": "Cisco",
        "model": "WS-C2960X-24TS-L",
        "price": 45000.00,
        "currency": "INR",
        "status": "Active",
        "createdAt": "2026-01-14T12:00:00Z",
        "updatedAt": "2026-01-14T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "pages": 250,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### GET /products/:id

**Purpose:** Get complete product details by ID

**Pre-conditions:** User must be authenticated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "subCategoryId": "6789abcd1234567890123457",
    "subCategoryName": "Routers",
    "brand": "Cisco",
    "model": "WS-C2960X-24TS-L",
    "description": "24-port Gigabit Ethernet switch",
    "specifications": {
      "ports": "24",
      "type": "Gigabit Ethernet",
      "poe": "No",
      "stackable": "Yes"
    },
    "price": 45000.00,
    "currency": "INR",
    "unitOfMeasure": "piece",
    "dimensions": {
      "length": 44.5,
      "width": 24.4,
      "height": 4.4,
      "unit": "cm"
    },
    "weight": 3.6,
    "weightUnit": "kg",
    "warrantyPeriod": 12,
    "warrantyUnit": "months",
    "status": "Active",
    "qrCodeId": "6789abcd1234567890123459",
    "barcodeId": "6789abcd123456789012345a",
    "images": [
      {
        "imageId": "6789abcd123456789012345b",
        "filename": "cisco-switch-front.jpg",
        "url": "/api/v1/files/images/6789abcd123456789012345b"
      }
    ],
    "isDeleted": false,
    "createdBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2026-01-14T12:00:00Z",
    "updatedAt": "2026-01-14T12:00:00Z"
  }
}
```

---

#### PUT /products/:id

**Purpose:** Update existing product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Request Body (all fields optional except SKU):**
```json
{
  "name": "Cisco Catalyst 2960-X Series Switch (Updated)",
  "description": "Updated description",
  "price": 48000.00,
  "status": "Active"
}
```

**Note:** SKU cannot be updated after creation

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch (Updated)",
    "price": 48000.00,
    "status": "Active",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedAt": "2026-01-14T13:00:00Z"
  },
  "message": "Product updated successfully"
}
```

---

#### DELETE /products/:id

**Purpose:** Soft delete product

**Pre-conditions:**
- User must be authenticated
- User must have `products.delete` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully"
}
```

---

### 14.4 Product Image Endpoints

#### POST /products/:productId/images

**Purpose:** Upload product image to GridFS

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Request:** multipart/form-data
- Field name: `image`
- Allowed types: image/jpeg, image/png, image/webp
- Max size: 5MB

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "imageId": "6789abcd123456789012345b",
    "filename": "cisco-switch-front.jpg",
    "url": "/api/v1/files/images/6789abcd123456789012345b",
    "uploadedAt": "2026-01-14T13:30:00Z"
  },
  "message": "Image uploaded successfully"
}
```

**Failure Scenarios:**

*400 Bad Request - Invalid File Type:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only JPEG, PNG, and WEBP images are allowed"
  }
}
```

*400 Bad Request - File Too Large:*
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must not exceed 5MB"
  }
}
```

---

#### GET /files/images/:imageId

**Purpose:** Retrieve product image from GridFS

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/jpeg | image/png | image/webp
- Binary image data

---

#### DELETE /products/:productId/images/:imageId

**Purpose:** Delete product image from GridFS

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Image deleted successfully"
}
```

---

### 14.5 QR Code & Barcode Endpoints

#### GET /files/qrcodes/:qrCodeId

**Purpose:** Download QR code image from GridFS

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/png
- Binary QR code image (300x300 pixels)

**Display Specifications:**
- Format: PNG
- Size: 300x300 pixels
- Error correction level: High (H)
- Encoded data: Product ID, SKU, Name, Brand, Model, Price

---

#### GET /files/barcodes/:barcodeId

**Purpose:** Download barcode image from GridFS

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/png
- Binary barcode image (400x200 pixels)

**Display Specifications:**
- Format: PNG
- Size: 400x200 pixels
- Barcode type: Code128
- Encoded data: Product SKU (cleaned for Code128 compatibility)

---

#### POST /products/:productId/regenerate-qr

**Purpose:** Regenerate QR code for product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCodeId": "6789abcd1234567890123459",
    "url": "/api/v1/files/qrcodes/6789abcd1234567890123459",
    "regeneratedAt": "2026-01-14T14:00:00Z"
  },
  "message": "QR code regenerated successfully"
}
```

---

#### POST /products/:productId/regenerate-barcode

**Purpose:** Regenerate barcode for product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "barcodeId": "6789abcd123456789012345a",
    "url": "/api/v1/files/barcodes/6789abcd123456789012345a",
    "regeneratedAt": "2026-01-14T14:00:00Z"
  },
  "message": "Barcode regenerated successfully"
}
```

---

### 14.6 Search & Filter Specifications

#### Global Search Behavior

**Endpoint:** Various list endpoints accept `search` query parameter

**Search Scope by Endpoint:**

**Categories (`GET /categories`):**
- Searches in: `name`, `code`
- Case-insensitive
- Partial match supported

**Sub-categories (`GET /subcategories`):**
- Searches in: `name`, `code`
- Case-insensitive
- Partial match supported

**Products (`GET /products`):**
- Searches in: `sku`, `name`, `brand`, `model`
- Case-insensitive
- Partial match supported
- OR logic (matches any field)

#### Advanced Filter Combinations

All list endpoints support combining multiple filters:

**Example: Products with multiple filters**
```
GET /api/v1/products?category_id=6789abcd1234567890123456&brand=Cisco&status=Active&price_min=10000&price_max=50000&search=switch&page=1&limit=20
```

**Filter Logic:**
- All filters use AND logic (must match all criteria)
- Search uses OR logic within its own scope
- Filters are cumulative

---

## 15) Dashboard Widget Specifications

### 15.1 Widget: Total Products KPI

**Purpose:** Display total count of active products

**Data Source:** `GET /api/v1/products?is_active=true` (pagination not needed, use `totalItems` from response)

**Display:**
- Large number (total count)
- Label: "Total Products"
- Optional trend indicator (if comparing periods)

---

### 15.2 Widget: Products by Category Chart

**Purpose:** Pie or donut chart showing product distribution by category

**Data Source:** Aggregated from `GET /api/v1/products` grouped by category

**Chart Type:** Pie/Donut (Chart.js)

**Data Structure Expected:**
```json
{
  "labels": ["Electronics", "Networking", "Storage"],
  "datasets": [{
    "data": [150, 200, 75],
    "backgroundColor": ["#3B82F6", "#10B981", "#F59E0B"]
  }]
}
```

---

### 15.3 Widget: Products by Status Chart

**Purpose:** Bar chart showing product counts by status

**Data Source:** Aggregated from `GET /api/v1/products` grouped by status

**Chart Type:** Bar (Chart.js)

**Data Structure Expected:**
```json
{
  "labels": ["Active", "Discontinued", "Out of Stock", "Coming Soon"],
  "datasets": [{
    "label": "Products",
    "data": [350, 25, 15, 10],
    "backgroundColor": ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"]
  }]
}
```

---

### 15.4 Widget: Recently Updated Products Table

**Purpose:** Show last 5-10 recently updated products

**Data Source:** `GET /api/v1/products?limit=10&sort_by=updatedAt&sort_order=desc`

**Table Columns:**
- SKU
- Name
- Category
- Status
- Updated At

---

### 15.5 Manual Refresh Behavior

**Implementation:**
- Refresh button in dashboard header
- On click: re-fetch all widget data
- Show loading indicator per widget
- Handle partial failures gracefully (show error state for failed widgets only)

---

## 17) Client-Side Validation Rules

### 17.1 AUTH Service Validations

**Login Form:**
- `email`: required, valid email format (`/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`)
- `password`: required, minimum 8 characters

**User Create/Update Form:**
- `firstName`: required, 2-50 characters, no leading/trailing spaces
- `lastName`: required, 2-50 characters, no leading/trailing spaces
- `email`: required, valid email format, unique (check on blur)
- `password`: required on create, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)
- `phone`: optional, international format (`/^\+?[1-9]\d{9,14}$/`)
- `roleId`: required, must be valid role from dropdown
- `isActive`: optional boolean

**Profile Update Form:**
- `firstName`: optional, 2-50 characters if provided
- `lastName`: optional, 2-50 characters if provided
- `phone`: optional, international format if provided

**Change Password Form:**
- `currentPassword`: required
- `newPassword`: required, same complexity rules as password, cannot match currentPassword
- `confirmPassword`: required, must match newPassword

**Role Create/Update Form:**
- `roleName`: required, 2-50 characters, unique (check on blur)
- `description`: optional, max 500 characters
- `permissions`: required, at least one permission must be selected
- `isActive`: optional boolean

**Profile Image Upload:**
- File type: image/jpeg or image/png only
- Max size: 2MB
- Display preview before upload

---

### 17.2 PMS Service Validations

**Category Create/Update Form:**
- `name`: required, 2-100 characters, no leading/trailing spaces
- `code`: optional on create (auto-generated), if provided: 2-10 characters, uppercase alphanumeric only (`/^[A-Z0-9]+$/`)
- `description`: optional, max 500 characters
- `isActive`: optional boolean

**Sub-Category Create/Update Form:**
- `name`: required, 2-100 characters
- `code`: optional on create (auto-generated), if provided: 2-10 characters, uppercase alphanumeric
- `categoryId`: required, must be valid category from dropdown
- `description`: optional, max 500 characters
- `isActive`: optional boolean

**Product Create/Update Form:**
- `name`: required, 2-200 characters
- `categoryId`: required, must be valid category
- `subCategoryId`: required, must be valid sub-category belonging to selected category
- `brand`: required, 2-100 characters
- `model`: required, 2-100 characters
- `description`: optional, max 1000 characters
- `specifications`: optional JSON object (validate JSON structure)
- `price`: required, positive decimal, max 2 decimal places
- `currency`: optional, default "INR"
- `unitOfMeasure`: optional, default "piece"
- `dimensions.length`: optional, positive decimal if provided
- `dimensions.width`: optional, positive decimal if provided
- `dimensions.height`: optional, positive decimal if provided
- `dimensions.unit`: optional, default "cm"
- `weight`: optional, positive decimal if provided
- `weightUnit`: optional, default "kg"
- `warrantyPeriod`: optional, positive integer if provided
- `warrantyUnit`: optional, enum: "days", "months", "years"
- `status`: optional, enum: "Active", "Discontinued", "Out of Stock", "Coming Soon"

**Product Image Upload:**
- File type: image/jpeg, image/png, or image/webp only
- Max size: 5MB
- Display preview before upload

---

### 17.3 Common Validation Patterns

**Search Fields:**
- Min 2 characters before triggering search
- Debounce 300-500ms

**Pagination Controls:**
- Page number: positive integer
- Limit: positive integer, max 100

**Date Fields (if applicable):**
- Valid date format
- Future dates validation where relevant

**Numeric Fields:**
- No negative numbers unless specified
- Decimal precision as specified

**Required Field Indicator:**
- Show asterisk (*) for required fields
- Use consistent styling

**Validation Timing:**
- On blur for individual fields
- On submit for complete form
- Real-time for password strength
- Debounced for search/unique checks

---

## 18) QA Checklist (UI-focused)

**Authentication & Authorization:**
- [ ] Login with invalid credentials shows correct error message
- [ ] Login with inactive account shows appropriate message
- [ ] Token refresh works seamlessly without user interruption
- [ ] Auto-logout triggers after configured inactivity (TBD duration)
- [ ] User without required permission cannot see restricted actions
- [ ] 401 errors redirect to login page
- [ ] 403 errors show "insufficient permissions" message

**User Management:**
- [ ] User list loads with pagination
- [ ] User search filters results correctly
- [ ] User create form validates all required fields
- [ ] Email uniqueness is checked
- [ ] User update saves changes correctly
- [ ] User delete shows confirmation dialog
- [ ] Cannot delete own account
- [ ] Profile image upload validates file type and size

**Role Management:**
- [ ] Role list displays all roles
- [ ] Role create form requires at least one permission
- [ ] Role name uniqueness is checked
- [ ] Cannot delete role if users are assigned
- [ ] Permission checklist displays all 20+ permissions

**Product Catalog:**
- [ ] Category list loads with pagination and filters
- [ ] Category code auto-generates if not provided
- [ ] Cannot delete category with active sub-categories
- [ ] Sub-category creation requires parent category
- [ ] Product SKU auto-generates correctly (CAT-SUBCAT-BRAND-SEQUENCE)
- [ ] Product image upload validates type and size
- [ ] QR code and barcode display correctly
- [ ] QR/Barcode download works
- [ ] QR/Barcode regenerate creates new images

**Data Tables:**
- [ ] Pagination works correctly (next/prev/page jump)
- [ ] Sorting works for sortable columns
- [ ] Search filters results as expected
- [ ] Multiple filters combine with AND logic
- [ ] Empty state displays when no results
- [ ] Loading state shows during data fetch
- [ ] Error state shows when request fails

**Forms:**
- [ ] Required field validation works
- [ ] Field-level validation shows on blur
- [ ] Form-level validation shows on submit
- [ ] Server-side errors map to correct fields
- [ ] Success messages appear after save
- [ ] Cancel button discards changes
- [ ] Form reset works correctly

**Dashboard:**
- [ ] Manual refresh button re-fetches all widgets
- [ ] KPI cards display correct values
- [ ] Charts render with correct data
- [ ] Individual widget errors don't break entire dashboard

**PDF Reports:**
- [ ] PDF generation works
- [ ] PDF preview displays before download
- [ ] Filters are reflected in generated PDF
- [ ] Timestamp shows on PDF

**QR/Barcode Scanning (Web):**
- [ ] Camera permission prompt works
- [ ] Camera preview displays
- [ ] Scan success navigates to product
- [ ] Scan failure shows not-found state
- [ ] Manual entry fallback works

**Performance:**
- [ ] Large tables (1000+ rows) load efficiently with server-side pagination
- [ ] Search input is debounced
- [ ] Images lazy-load where appropriate

---

## 19) Open Questions for Stakeholders

These questions will help the UI team avoid rework:

1. **Auto-logout duration:** What is the inactivity timeout (15/30/60 minutes)?
2. **Dark mode:** Should the web app support dark mode theme?
3. **Currency:** Is product pricing INR only, or multi-currency support needed?
4. **Audit trail visibility:** Should createdBy/updatedBy be visible on all detail pages?
5. **Concurrent sessions:** Should users be allowed multiple simultaneous sessions?
6. **Password reset:** When should forgot-password/reset-password flow be implemented?
7. **Email notifications:** Should the system send email notifications for user creation, password reset, etc.?
8. **Activity logs:** Should user activities be logged and displayed in UI?
9. **Product variants:** Will products have variants (size, color) or are they separate products?
10. **Inventory integration:** When will IMS integration be ready for dashboard widgets?

---

## 20) Deliverables the UI Team Should Produce

### 20.1 Design Deliverables
- Figma (or equivalent) page designs matching the IA
- Component library with all variants (buttons, inputs, tables, dialogs, cards)
- Design system documentation (colors, typography, spacing)
- Icon set selection and usage guide
- Responsive breakpoint specifications

### 20.2 Development Deliverables
- Component implementation (reusable UI components)
- Page implementations for all routes
- API integration layer (services/clients)
- Context providers (Auth, UI state)
- Form validation utilities
- Error handling utilities
- PDF generation integration
- QR/Barcode scanning integration

### 20.3 Documentation Deliverables
- Component storybook or documentation
- API contract mapping sheet (screen → endpoints)
- Environment configuration guide
- Deployment guide
- User guide (optional)

### 20.4 Testing Deliverables
- Unit tests for utilities and helpers
- Integration tests for API services
- E2E tests for critical user flows (login, CRUD operations)
- Accessibility audit report (if applicable)

---

## 21) Technology Stack Recommendation

Based on your requirements, here's the recommended stack:

**Core Framework:**
- React 18+
- React Router v6 for routing

**UI Component Library:**
- Material-UI (MUI) v5+
- Tabler Icons for consistent iconography

**State Management:**
- React Context API for global state
- useState/useReducer for local state

**Data Fetching:**
- Axios or Fetch API
- React Query (optional, recommended for caching)

**Form Handling:**
- React Hook Form (recommended for performance)
- Or controlled components with custom validation

**Charts:**
- Chart.js with react-chartjs-2

**PDF Generation:**
- jsPDF or react-pdf

**QR/Barcode Scanning:**
- html5-qrcode or react-qr-reader

**Image Handling:**
- React Dropzone for uploads
- React Image Gallery for product galleries

**Date/Time:**
- date-fns or Day.js (lighter than Moment.js)

**HTTP Client:**
- Axios (with interceptors for token handling)

**Build Tool:**
- Vite (recommended for speed) or Create React App

**Code Quality:**
- ESLint + Prettier
- TypeScript (optional but recommended)

---

## 22) Next Steps

1. **Review this guide** with your front-end team
2. **Clarify open questions** (section 19)
3. **Set up development environment**
4. **Create design mockups** in Figma
5. **Implement component library** (design system)
6. **Build authentication flow** (login, token management)
7. **Implement AUTH module** (users, roles, profile)
8. **Implement PMS module** (categories, products)
9. **Integrate dashboard and reports**
10. **Testing and QA**
11. **Deployment**

---

**Last Updated:** 2026-01-14  
**Version:** 2.0  
**Prepared By:** WLAN Corporation Development Team  
**For:** Front-End Development Team

