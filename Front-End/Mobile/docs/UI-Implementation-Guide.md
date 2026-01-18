# WLAN Corporation — Mobile UI Implementation Guide (React Native, Android)

**Audience:** Mobile UI/UX designers, React Native engineers, QA

**Scope:** This is a **guide**, not an implementation. It contains **no code**. It defines navigation, UX flows, and operational behaviors for an **Android-only** mobile app used by warehouse staff. Mobile must still support **CRUD operations to PMS** where relevant.

**Last updated:** 2026-01-14

---

## 1) Product Goal and Mobile Persona

### 1.1 Goal
Build an Android mobile app optimized for warehouse staff workflows:
- Fast product lookup via scan/search
- Create/update product details when needed (CRUD to PMS)
- View product assets (images, QR/barcode)
- Support operational speed under real-world conditions (movement, gloves, glare)

### 1.2 Primary persona (Mobile)
- **Warehouse Staff**
  - needs quick scan → details
  - minimal typing
  - rapid confirmation feedback

### 1.3 UX principles (warehouse-first)
- **One-handed usage** where possible
- **Large tap targets** and high-contrast surfaces
- **Scan-first navigation**: scanning is a first-class action
- **Short forms**: use pickers, defaults, and auto-generated values

---

## 2) Non-Functional Requirements

### 2.1 Platform support
- Android only
- Supported range: latest Android version and **two versions below** (your “3 versions from latest” requirement)

### 2.2 Offline
- No offline support required.

### 2.3 Security and session behavior
- Token storage: local storage (platform-appropriate secure storage is still recommended by best practice; decide later).
- Required behaviors:
  - token refresh
  - auto-logout on inactivity

---

## 3) Navigation Model

### 3.1 Recommended navigation pattern
- Bottom navigation for 3–5 primary destinations.
- A persistent “Scan” action is recommended (center button or primary tab).

### 3.2 Recommended tabs (MVP)
- **Scan**
- **Search**
- **Products**
- **Tasks** (placeholder for future WMS/IMS workflows)
- **Profile**

### 3.3 Screen stack
- Auth stack
  - Login
- App stack
  - Scan
  - Search
  - Product list
  - Product details
  - Product create/edit
  - Profile

---

## 4) Authentication UX

### 4.1 Login
- Inputs: email, password
- Behaviors:
  - show/hide password
  - strong error feedback (incorrect creds, session expired)

### 4.2 Auto-logout
- On inactivity: show a lightweight warning, then redirect to login.

---

## 5) Core Mobile Workflows

### 5.1 Scan → Product details (primary)
**Flow**
1. User opens Scan tab (camera opens quickly)
2. User scans QR or barcode
3. App resolves the scan to a product (SKU or product identifier)
4. Navigate to Product details

**UI requirements**
- Camera view with:
  - framing guide
  - torch toggle (if available)
  - vibration/sound confirmation on successful scan
  - manual entry fallback
- Not found state:
  - show “Product not found”
  - provide actions: rescan, manual search, create product (if permitted)

### 5.2 Search → Product details
- Search bar with instant suggestions
- Filters kept simple for mobile:
  - category
  - status
  - brand

### 5.3 Product details (mobile-optimized)
**Sections**
- Header: SKU, status chip
- Identity: name, brand, model
- Classification: category/subcategory
- Pricing: price
- Assets:
  - images carousel
  - QR and barcode preview
- Actions:
  - Edit
  - Download QR/Barcode (if needed in warehouse)

### 5.4 Product create/edit (CRUD to PMS)
Because typing is expensive on mobile, the UX must:
- Use pickers and defaults
- Keep forms short
- Allow incremental save (if product creation is multi-step)

**Recommended form structure**
- Step 1: Classification (category/subcategory)
- Step 2: Identity (name/brand/model)
- Step 3: Commercial (price/status)
- Step 4: Assets (optional)

**Validation rules**
- Mirror PMS validations; show field-level errors.

---

## 6) Image and Asset Handling

### 6.1 Image preview
- Full-screen preview with pinch-to-zoom
- Clear upload progress feedback

### 6.2 QR/Barcode
- On product details:
  - show QR and barcode
  - allow enlarge
  - optional download/share if business wants it

---

## 7) Mobile Scanning Guidance

### 7.1 Preferred scan behavior
- Support scanning in low-light
- Provide quick retry
- Avoid multi-second delays after a scan

### 7.2 Handling ambiguous scan results
If the scan payload can represent multiple identifiers:
- show a resolver dialog:
  - “Looks like a SKU” → open product
  - “Looks like a product ID” → open product
  - “Unknown format” → manual search

---

## 8) Error Handling and Feedback

### 8.1 Standard states
- Loading: skeleton UI (recommended)
- Empty: show guidance + action
- Error: short message + retry

### 8.2 Network errors
- If AUTH service is unreachable:
  - show “Service unavailable”
  - allow retry
- If token invalid:
  - redirect to login

---

## 9) Permissions (Role-based UI)

- Warehouse staff may have limited permissions.
- UI should:
  - hide restricted actions
  - handle 403 with a clear message

---

## 10) QA Checklist (mobile)

- Camera permission handling works
- Scan success gives immediate feedback
- Not-found scan path offers rescan/search
- Product edit saves and reflects server state
- Token refresh is seamless
- Auto-logout triggers after inactivity window

---

## 11) API Documentation & Integration Specifications

### 11.1 Standard Response Envelope

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

### 11.2 Common HTTP Status Codes

| Status | Meaning | Mobile Handling |
|--------|---------|-----------------|
| 200 | OK | Display success feedback |
| 201 | Created | Show success message, navigate |
| 400 | Bad Request | Show field-level errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "insufficient permissions" |
| 404 | Not Found | Show not-found state |
| 409 | Conflict | Show conflict message |
| 500 | Internal Server Error | Show retry option |

### 11.3 Authentication Header Format

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 12) AUTH Service API Endpoints (Mobile Relevant)

**Base URL:** `http://localhost:5001/api/v1` (development)  
**Production URL:** `https://api.wlancorp.com/auth/api/v1`

### 12.1 POST /auth/login

**Purpose:** Authenticate user and receive access/refresh tokens

**Pre-conditions:** None (public endpoint)

**Request Body:**
```json
{
  "email": "warehouse.staff@wlancorp.com",
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
      "firstName": "John",
      "lastName": "Doe",
      "email": "warehouse.staff@wlancorp.com",
      "role": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k5",
        "roleName": "Warehouse Staff",
        "permissions": ["products.read", "products.update"]
      },
      "profileImage": "https://storage.example.com/profiles/john.jpg",
      "isActive": true
    }
  },
  "message": "Login successful"
}
```

**Failure Scenarios:**

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

### 12.2 POST /auth/refresh

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

**Failure Scenario:**

*401 Unauthorized:*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

**Mobile Implementation Note:** Implement silent refresh before access token expires

---

### 12.3 POST /auth/logout

**Purpose:** Invalidate refresh token and logout

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

**Mobile Implementation Note:** Clear all stored tokens and user data, navigate to login

---

### 12.4 GET /auth/verify

**Purpose:** Verify access token and get user details

**Pre-conditions:** Valid access token in Authorization header

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "warehouse.staff@wlancorp.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k5",
        "roleName": "Warehouse Staff",
        "permissions": ["products.read", "products.update"]
      },
      "isActive": true
    }
  },
  "message": "Token is valid"
}
```

**Mobile Implementation Note:** Use on app startup to validate session

---

### 12.5 GET /profile

**Purpose:** Get current user's profile

**Pre-conditions:** User must be authenticated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "warehouse.staff@wlancorp.com",
    "phone": "+919876543210",
    "role": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "roleName": "Warehouse Staff",
      "permissions": ["products.read", "products.update"]
    },
    "profileImage": "https://storage.example.com/profiles/john.jpg",
    "isActive": true,
    "lastLogin": "2026-01-14T10:30:00.000Z"
  }
}
```

---

### 12.6 PUT /profile

**Purpose:** Update current user's profile

**Pre-conditions:** User must be authenticated

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
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
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210",
    "updatedAt": "2026-01-14T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### 12.7 PUT /profile/change-password

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

**Failure Scenario:**

*401 Unauthorized:*
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

## 13) PMS Service API Endpoints (Mobile Relevant)

**Base URL:** `http://localhost:5002/api/v1` (development)  
**Production URL:** `https://pms.wlancorp.com/api/v1`

### 13.1 GET /categories

**Purpose:** List categories for picker/dropdown

**Pre-conditions:** User must be authenticated

**Query Parameters:**
- `is_active` (boolean, default: true) - Filter active only
- `limit` (number, optional) - For mobile, suggest limit=100 to load all

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
        "isActive": true
      },
      {
        "id": "6789abcd1234567890123457",
        "name": "Networking",
        "code": "NETWORK",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 25,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Mobile Implementation Note:** Cache categories locally for offline picker display

---

### 13.2 GET /subcategories

**Purpose:** List sub-categories for picker (filtered by category)

**Pre-conditions:** User must be authenticated

**Query Parameters:**
- `category_id` (string, required for filtering) - Parent category
- `is_active` (boolean, default: true)
- `limit` (number, optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123458",
        "name": "Routers",
        "code": "ROUTER",
        "categoryId": "6789abcd1234567890123456",
        "categoryName": "Electronics",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 15,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Mobile Implementation Note:** Load sub-categories when category is selected in form

---

### 13.3 GET /products (Search & List)

**Purpose:** Search products or list with filters

**Pre-conditions:** User must be authenticated

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, mobile suggest: 10-20)
- `search` (string, optional) - Search in SKU, name, brand, model
- `category_id` (string, optional)
- `subcategory_id` (string, optional)
- `brand` (string, optional)
- `status` (string, optional) - Active/Discontinued/Out of Stock/Coming Soon

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123459",
        "sku": "ELEC-ROUTER-CISCO-0001",
        "name": "Cisco Catalyst 2960-X Series Switch",
        "categoryName": "Electronics",
        "subCategoryName": "Routers",
        "brand": "Cisco",
        "model": "WS-C2960X-24TS-L",
        "price": 45000.00,
        "currency": "INR",
        "status": "Active",
        "createdAt": "2026-01-14T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Mobile Implementation Note:** Implement infinite scroll for product list

---

### 13.4 GET /products/:id

**Purpose:** Get complete product details

**Pre-conditions:** User must be authenticated

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123459",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "subCategoryId": "6789abcd1234567890123458",
    "subCategoryName": "Routers",
    "brand": "Cisco",
    "model": "WS-C2960X-24TS-L",
    "description": "24-port Gigabit Ethernet switch",
    "specifications": {
      "ports": "24",
      "type": "Gigabit Ethernet"
    },
    "price": 45000.00,
    "currency": "INR",
    "status": "Active",
    "qrCodeId": "6789abcd123456789012345a",
    "barcodeId": "6789abcd123456789012345b",
    "images": [
      {
        "imageId": "6789abcd123456789012345c",
        "filename": "cisco-switch.jpg",
        "url": "/api/v1/files/images/6789abcd123456789012345c"
      }
    ],
    "createdAt": "2026-01-14T12:00:00Z",
    "updatedAt": "2026-01-14T12:00:00Z"
  }
}
```

**Failure Scenario:**

*404 Not Found:*
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

**Mobile Implementation Note:** Show loading skeleton while fetching, cache for offline viewing

---

### 13.5 POST /products

**Purpose:** Create new product (warehouse staff with permission)

**Pre-conditions:**
- User must be authenticated
- User must have `products.create` permission

**Request Body:**
```json
{
  "name": "TP-Link Archer AX50 WiFi 6 Router",
  "categoryId": "6789abcd1234567890123456",
  "subCategoryId": "6789abcd1234567890123458",
  "brand": "TP-Link",
  "model": "Archer AX50",
  "description": "Dual-band WiFi 6 router",
  "price": 8500.00,
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
- `price`: required, positive decimal
- `status`: optional, enum: "Active", "Discontinued", "Out of Stock", "Coming Soon"

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd123456789012345d",
    "sku": "ELEC-ROUTER-TPLINK-0001",
    "name": "TP-Link Archer AX50 WiFi 6 Router",
    "categoryId": "6789abcd1234567890123456",
    "subCategoryId": "6789abcd1234567890123458",
    "brand": "TP-Link",
    "model": "Archer AX50",
    "price": 8500.00,
    "status": "Active",
    "qrCodeId": "6789abcd123456789012345e",
    "barcodeId": "6789abcd123456789012345f",
    "createdAt": "2026-01-14T13:00:00Z"
  },
  "message": "Product created successfully with SKU ELEC-ROUTER-TPLINK-0001"
}
```

**Mobile Implementation Note:** Show success message, navigate to product details

---

### 13.6 PUT /products/:id

**Purpose:** Update existing product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Request Body (all fields optional):**
```json
{
  "name": "TP-Link Archer AX50 WiFi 6 Router (Updated)",
  "description": "Updated description",
  "price": 8900.00,
  "status": "Active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd123456789012345d",
    "sku": "ELEC-ROUTER-TPLINK-0001",
    "name": "TP-Link Archer AX50 WiFi 6 Router (Updated)",
    "price": 8900.00,
    "status": "Active",
    "updatedAt": "2026-01-14T13:30:00Z"
  },
  "message": "Product updated successfully"
}
```

**Mobile Implementation Note:** Show success toast, refresh product details

---

### 13.7 GET /files/images/:imageId

**Purpose:** Retrieve product image

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/jpeg | image/png | image/webp
- Binary image data

**Mobile Implementation Note:** Use Image component with source URL, implement caching

---

### 13.8 GET /files/qrcodes/:qrCodeId

**Purpose:** Download QR code image

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/png
- Binary QR code image (300x300 pixels)

**Display Specifications:**
- Format: PNG
- Size: 300x300 pixels
- Can be displayed inline or downloaded/shared

**Mobile Implementation Note:** Display in modal or share via native share sheet

---

### 13.9 GET /files/barcodes/:barcodeId

**Purpose:** Download barcode image

**Pre-conditions:** User must be authenticated

**Success Response (200):**
- Content-Type: image/png
- Binary barcode image (400x200 pixels)

**Display Specifications:**
- Format: PNG
- Size: 400x200 pixels
- Type: Code128

**Mobile Implementation Note:** Display in modal or share via native share sheet

---

### 13.10 POST /products/:productId/regenerate-qr

**Purpose:** Regenerate QR code for product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCodeId": "6789abcd1234567890123460",
    "url": "/api/v1/files/qrcodes/6789abcd1234567890123460",
    "regeneratedAt": "2026-01-14T14:00:00Z"
  },
  "message": "QR code regenerated successfully"
}
```

---

### 13.11 POST /products/:productId/regenerate-barcode

**Purpose:** Regenerate barcode for product

**Pre-conditions:**
- User must be authenticated
- User must have `products.update` permission

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "barcodeId": "6789abcd1234567890123461",
    "url": "/api/v1/files/barcodes/6789abcd1234567890123461",
    "regeneratedAt": "2026-01-14T14:00:00Z"
  },
  "message": "Barcode regenerated successfully"
}
```

---

## 14) Mobile Scanning Implementation

### 14.1 Scanning Flow

**Step 1: Open Scanner**
- Pre-load camera on Scan tab mount
- Request camera permission if not granted
- Show permission rationale if denied

**Step 2: Scan Code**
- Support both QR codes and barcodes (Code128)
- Provide visual/audio/haptic feedback on successful scan
- Extract SKU or product ID from scan result

**Step 3: Resolve Product**
- Call `GET /products?search={scannedValue}` to find product
- If single match → navigate to product details
- If multiple matches → show picker
- If no match → show not-found state

### 14.2 Scan Result Handling

**QR Code Data Structure (decoded):**
```json
{
  "productId": "6789abcd1234567890123459",
  "sku": "ELEC-ROUTER-CISCO-0001",
  "name": "Cisco Catalyst 2960-X Series Switch",
  "brand": "Cisco",
  "model": "WS-C2960X-24TS-L",
  "price": 45000.00
}
```

**Barcode Data:** Contains only SKU string

**Resolution Logic:**
1. If scanned value is JSON → parse and use `productId` or `sku`
2. If scanned value is plain text → assume SKU, search by SKU
3. Call API: `GET /products?search={sku}&limit=1`
4. Navigate to product details if found

### 14.3 Camera Permissions

**Android Permission Required:**
- `android.permission.CAMERA`

**Permission Flow:**
1. Check permission status
2. If not granted → request permission
3. If denied → show rationale and retry
4. If permanently denied → show settings link

### 14.4 Low-Light Support

**Features:**
- Torch/flashlight toggle button
- Auto-focus support
- High contrast scan frame guide

---

## 15) Client-Side Validation Rules (Mobile)

### 15.1 Login Form
- `email`: required, valid email format (`/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`)
- `password`: required, minimum 8 characters

### 15.2 Profile Update Form
- `firstName`: optional, 2-50 characters if provided, no leading/trailing spaces
- `lastName`: optional, 2-50 characters if provided, no leading/trailing spaces
- `phone`: optional, international format (`/^\+?[1-9]\d{9,14}$/`) if provided

### 15.3 Change Password Form
- `currentPassword`: required
- `newPassword`: required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Cannot match `currentPassword`

### 15.4 Product Create Form
- `name`: required, 2-200 characters
- `categoryId`: required, must select from picker
- `subCategoryId`: required, must select from picker (filtered by category)
- `brand`: required, 2-100 characters
- `model`: required, 2-100 characters
- `description`: optional, max 1000 characters
- `price`: required, positive decimal, max 2 decimal places
- `status`: optional, select from: Active, Discontinued, Out of Stock, Coming Soon

### 15.5 Product Update Form
- All fields optional except constraints
- Same validation rules as create when fields are provided

### 15.6 Search Field
- Minimum 2 characters before triggering search
- Debounce 300-500ms to avoid excessive API calls

### 15.7 Mobile-Specific Validations
- **Network availability**: Check before API calls, show offline message
- **File size**: Validate image size before upload (max 5MB)
- **Image format**: Accept only JPEG, PNG, WEBP

---

## 16) Mobile-Specific UX Patterns

### 16.1 Pull-to-Refresh
- Implement on: Product list, Search results
- Refresh behavior: Re-fetch current page with applied filters

### 16.2 Infinite Scroll
- Implement on: Product list
- Trigger: When user scrolls to 80% of list
- Load: Next page via pagination

### 16.3 Optimistic Updates
- Show immediate UI feedback before API response
- Revert on failure with error message

### 16.4 Loading States
- Skeleton screens for lists
- Spinners for individual actions
- Progress bars for file uploads

### 16.5 Empty States
- Icon + message + action button
- Examples:
  - "No products found" → "Create Product" button
  - "No search results" → "Clear filters" button

### 16.6 Error States
- Inline errors for forms
- Toast messages for actions
- Full-screen error for critical failures with retry

### 16.7 Success Feedback
- Toast messages (auto-dismiss in 3 seconds)
- Haptic feedback for important actions
- Visual confirmation (checkmark animation)

---

## 17) Permissions & Role-Based UI

### 17.1 Warehouse Staff Typical Permissions
- `products.read` - View products
- `products.update` - Edit products
- `products.create` - Create products (optional, TBD)

### 17.2 Permission-Driven UI
**If user has `products.read` only:**
- Hide "Edit" button on product details
- Hide "Create Product" button
- Show read-only views

**If user has `products.update`:**
- Show "Edit" button
- Allow form submission
- Handle 403 errors gracefully

**If user has `products.create`:**
- Show "Create Product" option in not-found scan state
- Show "Add Product" button

### 17.3 Error Handling for Permissions

*403 Forbidden Response:*
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to perform this action"
  }
}
```

**Mobile Display:** Show toast or alert with message, don't allow retry

---

## 18) QA Checklist (Mobile)

**Authentication & Session:**
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Token refresh works silently in background
- [ ] Auto-logout triggers after inactivity (TBD duration)
- [ ] Logout clears all tokens and redirects to login
- [ ] App remembers session after restart (until token expires)

**Scanning:**
- [ ] Camera permission requested on first scan
- [ ] Camera preview loads quickly
- [ ] QR code scan succeeds and navigates to product
- [ ] Barcode scan succeeds and navigates to product
- [ ] Torch toggle works in low-light
- [ ] Haptic/sound feedback on successful scan
- [ ] Not-found scan shows appropriate message
- [ ] Manual entry fallback works
- [ ] Scanner works with gloves (large tap targets)

**Product Search & List:**
- [ ] Search returns correct results
- [ ] Search debounce prevents excessive API calls
- [ ] Filters (category, brand, status) work correctly
- [ ] Infinite scroll loads next page
- [ ] Pull-to-refresh reloads current view
- [ ] Empty state displays when no results
- [ ] Loading skeleton shows during fetch

**Product Details:**
- [ ] Product details load correctly
- [ ] Images display in carousel
- [ ] QR code displays and can be enlarged
- [ ] Barcode displays and can be enlarged
- [ ] Edit button visible only if user has permission
- [ ] Specifications display correctly

**Product Create/Edit:**
- [ ] Category picker loads all categories
- [ ] Sub-category picker filters by selected category
- [ ] Form validation works for all fields
- [ ] Save button disabled during submission
- [ ] Success message displays after save
- [ ] Navigate to product details after create
- [ ] Form errors display inline
- [ ] Server errors display appropriately

**Profile:**
- [ ] Profile loads current user data
- [ ] Profile update saves successfully
- [ ] Password change validates current password
- [ ] Password complexity requirements enforced
- [ ] Success message shows after save

**Network & Error Handling:**
- [ ] Offline state detected and displayed
- [ ] Network errors show retry option
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission message
- [ ] 404 errors show not-found state
- [ ] 500 errors show retry option

**Performance:**
- [ ] App launch time < 2 seconds
- [ ] Camera opens in < 1 second
- [ ] Search results appear in < 500ms (with debounce)
- [ ] Product details load in < 1 second
- [ ] Image loading doesn't block UI
- [ ] No memory leaks during navigation

**Usability:**
- [ ] All tap targets minimum 44x44 dp
- [ ] Forms usable with one hand
- [ ] Keyboard dismisses appropriately
- [ ] Back button works correctly throughout app
- [ ] Navigation gestures work (swipe back)
- [ ] Status chips use high-contrast colors
- [ ] Text readable in bright sunlight (warehouse)

---

## 19) Open Questions for Stakeholders

1. **Auto-logout duration:** What is the mobile inactivity timeout (15/30/60 minutes)?
2. **Scan permissions:** Should scanning accept QR only, barcode only, or both?
3. **Product creation:** Can warehouse staff create products via mobile, or only edit?
4. **Tablet support:** Is Android tablet layout needed, or phone-only?
5. **Offline mode:** Future requirement for offline product viewing?
6. **Notifications:** Push notifications needed for inventory alerts?
7. **Multi-language:** Future requirement for Hindi or other regional languages?
8. **Biometric auth:** Should mobile support fingerprint/face unlock?

---

## 20) Technology Stack Recommendation (Mobile)

**Core Framework:**
- React Native 0.73+ (latest stable)
- TypeScript (recommended for type safety)

**Navigation:**
- React Navigation v6 (tab + stack navigators)

**State Management:**
- React Context API
- AsyncStorage for token persistence

**Camera/Scanning:**
- react-native-camera or react-native-vision-camera
- react-native-qrcode-scanner

**HTTP Client:**
- Axios (with interceptors for token handling)

**Form Handling:**
- React Hook Form (performance optimized)
- Custom validation functions

**UI Components:**
- React Native Paper (Material Design for Android)
- Or custom components following Material Design

**Image Handling:**
- react-native-fast-image (caching + performance)
- react-native-image-picker (upload)

**Storage:**
- @react-native-async-storage/async-storage

**Permissions:**
- react-native-permissions

**Haptics:**
- react-native-haptic-feedback

**Toast/Snackbar:**
- React Native Paper Snackbar

**Performance:**
- Hermes JavaScript engine (enabled by default)
- Flipper for debugging

**Testing:**
- Jest for unit tests
- Detox for E2E tests

---

## 21) Deliverables the Mobile Team Should Produce

### 21.1 Design Deliverables
- Screen designs for all flows (Figma/Sketch)
- Component library (buttons, inputs, cards, chips)
- Navigation flows (screen map)
- Icon set selection
- Color palette (Material Design compliant)

### 21.2 Development Deliverables
- React Native app implementation
- Navigation setup (tab + stack)
- API integration layer
- Authentication flow with token management
- Scanner implementation
- Product CRUD screens
- Profile screens
- Validation utilities
- Error handling utilities

### 21.3 Documentation Deliverables
- Component documentation
- API integration guide
- Build and deployment guide
- Testing guide
- User manual (optional)

### 21.4 Testing Deliverables
- Unit tests for utilities
- Integration tests for API services
- E2E tests for critical flows (login, scan, CRUD)
- Device compatibility testing report

---

## 22) Next Steps

1. **Review guide** with mobile development team
2. **Clarify open questions** (section 19)
3. **Set up React Native project**
4. **Configure Android environment**
5. **Implement authentication flow**
6. **Implement scanner with camera permissions**
7. **Build product list and details screens**
8. **Implement product CRUD forms**
9. **Build profile screens**
10. **Testing on physical Android devices**
11. **Performance optimization**
12. **Deployment to Play Store (internal testing)**

---

**Last Updated:** 2026-01-14  
**Version:** 2.0  
**Prepared By:** WLAN Corporation Development Team  
**For:** Mobile Development Team

