# COMPREHENSIVE PROMPT: WLAN Warehouse Management Web Application

## Project Overview
Create a professional, enterprise-grade web application for WLAN Corporation's warehouse management system using Node.js, Express.js, static HTML, and vanilla JavaScript. The application will serve as the front-end interface consuming two microservices (AUTH and PMS) via REST APIs.

---

## Technology Stack Requirements

### Backend
- **Runtime**: Node.js v22.x
- **Framework**: Express.js (latest stable)
- **Template Engine**: None (pure static HTML files)
- **HTTP Client**: Axios for API calls from client-side
- **Static File Serving**: Express static middleware
- **Development Server**: Live reload with nodemon

### Frontend
- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern CSS with CSS Grid and Flexbox
- **JavaScript**: Vanilla ES6+ (no frameworks)
- **UI Components**: Build from scratch with modular JavaScript classes
- **Icons**: Tabler Icons (CDN)
- **Charts**: Chart.js (for dashboard)
- **HTTP Requests**: Axios (CDN)

### Project Structure
```
wlan-warehouse-app/
├── server.js                          # Express server entry point
├── package.json                       # Dependencies
├── .env.development                   # Development config
├── .env.production                    # Production config
├── .gitignore
├── README.md
│
├── public/                            # Static files served by Express
│   ├── index.html                     # Main entry point (redirects to /login or /dashboard)
│   │
│   ├── css/                           # Stylesheets
│   │   ├── global.css                 # Global styles, CSS variables, resets
│   │   ├── components.css             # Reusable component styles
│   │   ├── layout.css                 # App shell, sidebar, topbar
│   │   ├── forms.css                  # Form styles
│   │   ├── tables.css                 # Table styles
│   │   └── pages/                     # Page-specific styles
│   │       ├── login.css
│   │       ├── dashboard.css
│   │       ├── products.css
│   │       └── ...
│   │
│   ├── js/                            # JavaScript modules
│   │   ├── config/
│   │   │   └── config.js              # API URLs, constants
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance with interceptors
│   │   │   ├── authService.js         # AUTH API calls
│   │   │   └── pmsService.js          # PMS API calls
│   │   │
│   │   ├── state/
│   │   │   ├── authState.js           # Authentication state management
│   │   │   └── uiState.js             # UI state (sidebar, theme)
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.js          # Form validation helpers
│   │   │   ├── formatting.js          # Date, currency formatting
│   │   │   ├── storage.js             # localStorage wrapper
│   │   │   └── router.js              # Client-side routing helper
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.js             # Sidebar component class
│   │   │   ├── Topbar.js              # Topbar component class
│   │   │   ├── Table.js               # Reusable table component
│   │   │   ├── Modal.js               # Modal dialog component
│   │   │   ├── Toast.js               # Toast notification
│   │   │   ├── Loader.js              # Loading spinner
│   │   │   └── Form.js                # Form utilities
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── login.js           # Login page logic
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.js       # Dashboard logic
│   │   │   ├── products/
│   │   │   │   ├── productsList.js
│   │   │   │   ├── productCreate.js
│   │   │   │   ├── productEdit.js
│   │   │   │   └── productDetail.js
│   │   │   ├── categories/
│   │   │   │   ├── categoriesList.js
│   │   │   │   └── categoryForm.js
│   │   │   ├── users/
│   │   │   │   ├── usersList.js
│   │   │   │   └── userForm.js
│   │   │   └── roles/
│   │   │       ├── rolesList.js
│   │   │       └── roleForm.js
│   │   │
│   │   └── app.js                     # Main app initialization
│   │
│   ├── pages/                         # HTML pages
│   │   ├── auth/
│   │   │   └── login.html
│   │   ├── dashboard/
│   │   │   └── index.html
│   │   ├── products/
│   │   │   ├── list.html
│   │   │   ├── create.html
│   │   │   ├── edit.html
│   │   │   └── detail.html
│   │   ├── categories/
│   │   │   ├── list.html
│   │   │   └── form.html
│   │   ├── subcategories/
│   │   │   ├── list.html
│   │   │   └── form.html
│   │   ├── users/
│   │   │   ├── list.html
│   │   │   └── form.html
│   │   └── roles/
│   │       ├── list.html
│   │       └── form.html
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   └── logo.svg               # WLAN logo
│   │   └── fonts/                     # Custom fonts (if any)
│   │
│   └── favicon.ico
│
└── scripts/                           # Build/deployment scripts
    └── generate-docs.js
```

---

## Design System & Brand Guidelines

### Color Palette (Professional Business Theme)
```css
:root {
  /* Primary Colors - Indigo Blue */
  --primary-50: #eef2ff;
  --primary-100: #e0e7ff;
  --primary-200: #c7d2fe;
  --primary-300: #a5b4fc;
  --primary-400: #818cf8;
  --primary-500: #6366f1;    /* Main primary */
  --primary-600: #4f46e5;
  --primary-700: #4338ca;
  --primary-800: #3730a3;
  --primary-900: #312e81;

  /* Secondary Colors - Slate Gray */
  --secondary-50: #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-200: #e2e8f0;
  --secondary-300: #cbd5e1;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;  /* Main secondary */
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1e293b;
  --secondary-900: #0f172a;

  /* Success - Emerald Green */
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-700: #047857;

  /* Warning - Amber */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #b45309;

  /* Error - Red */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-700: #b91c1c;

  /* Info - Blue */
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-700: #1d4ed8;

  /* Neutrals */
  --white: #ffffff;
  --black: #000000;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* Text */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --text-inverse: #ffffff;

  /* Borders */
  --border-color: #e2e8f0;
  --border-color-dark: #cbd5e1;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Spacing Scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-full: 9999px;

  /* Z-index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### Typography Guidelines
```css
/* Headings */
h1, .h1 { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); }
h2, .h2 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); }
h3, .h3 { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); }
h4, .h4 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); }
h5, .h5 { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); }
h6, .h6 { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); }

/* Body text */
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

/* Code */
code, pre {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}
```

---

## Backend Service Integration

### Environment Configuration
**File: `.env.development`**
```env
# Server Configuration
PORT=3000
NODE_ENV=development
APP_NAME=WLAN Warehouse Management

# Backend API URLs
AUTH_API_URL=http://localhost:5001/api/v1
PMS_API_URL=http://localhost:5002/api/v1

# Session Configuration
SESSION_TIMEOUT=1800000
TOKEN_REFRESH_INTERVAL=300000

# CORS Settings
CORS_ORIGIN=http://localhost:3000
```

### API Service Specifications

#### AUTH Service Endpoints
**Base URL**: `http://localhost:5001/api/v1`

**Authentication:**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/verify` - Verify token validity

**User Profile:**
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `PUT /profile/change-password` - Change password
- `POST /profile/upload-image` - Upload profile image

**User Management (Admin):**
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)
- `PUT /users/:id/activate` - Activate user
- `PUT /users/:id/deactivate` - Deactivate user

**Role Management:**
- `GET /roles` - Get all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `GET /permissions` - Get all available permissions

#### PMS Service Endpoints
**Base URL**: `http://localhost:5002/api/v1`

**Categories:**
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

**Sub-categories:**
- `GET /subcategories` - Get all sub-categories
- `GET /subcategories/:id` - Get sub-category by ID
- `POST /subcategories` - Create sub-category
- `PUT /subcategories/:id` - Update sub-category
- `DELETE /subcategories/:id` - Delete sub-category

**Products:**
- `GET /products` - Get all products (with filters, pagination)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/:id/sku` - Generate SKU

**Product Assets:**
- `POST /products/:id/images` - Upload product images
- `DELETE /products/:id/images/:imageId` - Delete image
- `PUT /products/:id/images/:imageId/primary` - Set primary image
- `GET /products/:id/qr` - Generate QR code
- `GET /products/:id/barcode` - Generate barcode

### Standard Response Envelope
All APIs return standardized responses:

**Success:**
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Operation successful",
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Data retrieved",
  "timestamp": "2026-01-14T10:30:00.000Z"
}
```

---

## Application Features & Pages

### 1. Authentication System

#### Login Page (`/pages/auth/login.html`)
**Design Requirements:**
- Centered card layout on gradient background
- WLAN logo at top
- Professional, clean design
- Form fields: Email, Password
- "Show/Hide Password" toggle
- "Remember Me" checkbox (optional)
- "Forgot Password?" link (disabled for MVP)
- Submit button with loading state
- Error message display area

**Functionality (`/js/pages/auth/login.js`):**
- Client-side form validation
- API call to `/auth/login`
- Store tokens in localStorage
- Redirect to dashboard on success
- Display error messages from API
- Loading states during submission

**Session Management:**
- Auto token refresh every 5 minutes
- Inactivity timeout (30 minutes)
- Silent token verification on app load
- Auto-logout and redirect to login
- Clear tokens on logout

### 2. App Shell (Protected Pages Layout)

#### Components:
**Sidebar (`/js/components/Sidebar.js`):**
- Collapsible/expandable
- Active link highlighting
- Permission-based menu items
- Sections:
  - Dashboard
  - Products (Categories, Sub-categories, Products)
  - Users & Access (Users, Roles)
  - Reports
  - System

**Topbar (`/js/components/Topbar.js`):**
- App name/logo
- Breadcrumbs
- Global search (optional)
- Notifications icon (placeholder)
- User menu dropdown:
  - Profile
  - Settings (optional)
  - Logout

### 3. Dashboard (`/pages/dashboard/index.html`)

**KPI Cards:**
- Total Products
- Active Products
- Total Categories
- Total Users
- Recent Activity

**Charts:**
- Products by Category (Pie/Doughnut)
- Products by Status (Bar)
- Recent Products (Table)

**Recent Activity Feed:**
- Last 10 activities
- User actions
- Timestamps

### 4. Category Management

#### Categories List (`/pages/categories/list.html`)
**Table Columns:**
- Name
- Code
- Description
- Status (Active/Inactive chip)
- Products Count
- Updated At
- Actions (View, Edit, Delete)

**Features:**
- Search by name/code
- Filter by status
- Pagination
- "Create Category" button
- Inline edit/delete
- Soft delete with confirmation

#### Category Form (`/pages/categories/form.html`)
**Fields:**
- Name (required, 2-100 chars)
- Code (optional, auto-generated if empty)
- Description (optional, max 500)
- Status (Active/Inactive toggle)

**Validation:**
- Client-side validation
- Server-side validation display
- Dependency warnings before delete

### 5. Sub-category Management

#### Sub-categories List (`/pages/subcategories/list.html`)
**Similar to categories with:**
- Parent Category column
- Filter by parent category
- Cascading category selection

### 6. Product Management

#### Products List (`/pages/products/list.html`)
**Advanced Filters (Collapsible Panel):**
- Category dropdown
- Sub-category dropdown (filtered by category)
- Brand input/dropdown
- Status dropdown (Active, Discontinued, Out of Stock, Coming Soon)
- Price range (Min-Max)
- Search input (SKU, name, brand, model)
- Clear/Apply buttons

**Table Columns:**
- SKU (monospace, copyable)
- Name
- Category
- Sub-category
- Brand
- Model
- Price (formatted with currency)
- Status (colored chip)
- Actions (View, Edit, Delete)

**Table Features:**
- Server-side pagination
- Server-side sorting
- Row selection (for bulk actions)
- Density toggle (compact/standard/comfortable)
- Column visibility toggle
- Export to CSV (optional)

#### Product Create (`/pages/products/create.html`)
**Multi-step Form (Stepper):**

**Step 1 - Classification:**
- Category (dropdown)
- Sub-category (dropdown, filtered)

**Step 2 - Identity:**
- Name (required)
- Brand (required)
- Model (optional)
- SKU (auto-generated, read-only, shown after classification)

**Step 3 - Commercial:**
- Price (required, currency input)
- Currency (dropdown, default INR)
- Warranty Period (number + unit)
- Warranty Terms (textarea)
- Status (dropdown)

**Step 4 - Specifications:**
- Dynamic key-value editor
- Add/remove specification pairs
- Key validation (no duplicates)

**Step 5 - Review:**
- Display all entered data
- Edit buttons to go back to specific steps
- Submit button

**Navigation:**
- Next/Previous buttons
- Step indicators
- Form validation before step transition

#### Product Edit (`/pages/products/edit.html`)
- Similar form structure to create
- Pre-populated with existing data
- Update button instead of create

#### Product Detail (`/pages/products/detail.html`)
- Read-only view of all product data
- Image gallery
- QR code and barcode display
- Specifications table
- Edit/Delete buttons (permission-based)

### 7. User Management

#### Users List (`/pages/users/list.html`)
**Table Columns:**
- Full Name
- Email
- Phone
- Role
- Status
- Last Login
- Actions

**Filters:**
- Search by name/email
- Filter by role
- Filter by status

#### User Form (`/pages/users/form.html`)
**Fields:**
- First Name (required)
- Last Name (required)
- Email (required, unique)
- Phone (required, format validation)
- Role (dropdown)
- Password (required for create, optional for edit)
- Profile Image Upload
- Active Status (toggle)

### 8. Role Management

#### Roles List (`/pages/roles/list.html`)
**Table Columns:**
- Role Name
- Description
- Permissions Count
- Users Count
- Actions

#### Role Form (`/pages/roles/form.html`)
**Fields:**
- Role Name (required, unique)
- Description
- Permissions (multi-select checklist, grouped by module)

---

## Component Library (Vanilla JavaScript)

### Reusable UI Components

#### 1. Table Component (`/js/components/Table.js`)
```javascript
class DataTable {
  constructor(options) {
    // options: columns, data, pagination, sorting, filters
  }
  
  render() { /* Generate table HTML */ }
  sort(column, direction) { /* Sort logic */ }
  filter(filters) { /* Filter logic */ }
  paginate(page) { /* Pagination logic */ }
  selectRow(rowId) { /* Row selection */ }
}
```

**Features:**
- Configurable columns
- Server-side pagination
- Client/server sorting
- Row selection
- Custom cell renderers
- Loading skeleton
- Empty state
- Responsive (horizontal scroll)

#### 2. Modal Component (`/js/components/Modal.js`)
```javascript
class Modal {
  constructor(options) {
    // options: title, content, actions, size
  }
  
  show() { /* Display modal */ }
  hide() { /* Hide modal */ }
  setContent(html) { /* Update content */ }
}
```

**Types:**
- Confirm dialog
- Form modal
- Detail viewer
- Alert

#### 3. Toast Component (`/js/components/Toast.js`)
```javascript
class Toast {
  static success(message) { /* Success toast */ }
  static error(message) { /* Error toast */ }
  static info(message) { /* Info toast */ }
  static warning(message) { /* Warning toast */ }
}
```

**Features:**
- Auto-dismiss (configurable)
- Position (top-right default)
- Stack multiple toasts
- Icon + message
- Close button

#### 4. Form Validation (`/js/utils/validation.js`)
```javascript
class Validator {
  static required(value) { /* Check required */ }
  static email(value) { /* Email validation */ }
  static minLength(value, min) { /* Min length */ }
  static maxLength(value, max) { /* Max length */ }
  static pattern(value, regex) { /* Regex validation */ }
  static phone(value) { /* Phone validation */ }
}
```

#### 5. Loading Spinner (`/js/components/Loader.js`)
```javascript
class Loader {
  static show() { /* Show full-page loader */ }
  static hide() { /* Hide loader */ }
  static showInElement(element) { /* Inline loader */ }
}
```

---

## State Management Pattern

### AuthState (`/js/state/authState.js`)
```javascript
class AuthState {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.loading = true;
    this.listeners = [];
  }
  
  setUser(user) { /* Update user */ }
  clearUser() { /* Clear on logout */ }
  subscribe(callback) { /* Listen to changes */ }
  notify() { /* Notify listeners */ }
}

const authState = new AuthState();
export default authState;
```

### UIState (`/js/state/uiState.js`)
```javascript
class UIState {
  constructor() {
    this.sidebarOpen = true;
    this.theme = 'light';
    this.tableDensity = 'standard';
  }
  
  toggleSidebar() { /* Toggle sidebar */ }
  setTheme(theme) { /* Set theme */ }
  setTableDensity(density) { /* Set table density */ }
}

const uiState = new UIState();
export default uiState;
```

---

## Routing Strategy

### Client-side Navigation (`/js/utils/router.js`)
```javascript
class Router {
  static navigate(path) {
    // Update URL without page reload
    // Load appropriate page content
    // Update active nav item
  }
  
  static protect(requiredPermission) {
    // Check if user is authenticated
    // Check if user has required permission
    // Redirect to login or 403 if not
  }
}
```

**Protected Routes:**
- All routes except `/login` require authentication
- Permission-based access control
- Redirect to login if not authenticated
- Show 403 page if missing permission

---

## Error Handling

### Global Error Handler
```javascript
window.addEventListener('error', (event) => {
  // Log error
  // Show user-friendly message
  // Send to error tracking service (optional)
});
```

### API Error Handling
```javascript
// In api.js interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      // Token expired, try refresh
      // If refresh fails, logout
    }
    if (error.response.status === 403) {
      // Show "Access Denied" message
    }
    if (error.response.status === 500) {
      // Show "Server Error" message
    }
    return Promise.reject(error);
  }
);
```

### User-Friendly Error Messages
- Avoid technical jargon
- Suggest actions ("Please try again", "Contact support")
- Map error codes to friendly messages

---

## Security Best Practices

### Authentication
- Store tokens in localStorage
- Auto-refresh tokens before expiration
- Clear tokens on logout
- Validate token on app load
- Inactivity timeout

### API Security
- Always send Authorization header
- Handle 401 gracefully
- Implement CSRF protection (if needed)
- Validate all inputs client-side

### XSS Prevention
- Sanitize all user inputs
- Use textContent instead of innerHTML
- Escape HTML in dynamic content

---

## Performance Optimization

### Best Practices
- Lazy load images
- Debounce search inputs (300ms)
- Virtual scrolling for large tables
- Code splitting (separate JS files per page)
- Minify CSS/JS in production
- Enable gzip compression
- Cache static assets
- Use CDN for external libraries

### Loading States
- Show skeleton loaders for tables
- Show spinners for forms
- Disable buttons during submission
- Show progress indicators

---

## Accessibility

### Requirements
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Color contrast ratios (WCAG AA)
- Screen reader friendly

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Login/logout flow
- [ ] Token refresh
- [ ] Session timeout
- [ ] Form validation
- [ ] API error handling
- [ ] Permission-based UI
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Deployment

### Production Build
```bash
# Install dependencies
npm install

# Set environment
export NODE_ENV=production

# Start server
npm start
```

### Environment Variables
- Update API URLs in `.env.production`
- Configure CORS settings
- Set session timeouts

---

## Documentation Requirements

### README.md Should Include:
1. Project overview
2. Technology stack
3. Prerequisites
4. Installation steps
5. Configuration guide
6. Development workflow
7. Production deployment
8. API integration guide
9. Troubleshooting
10. License

### Code Documentation:
- JSDoc comments for all functions
- Inline comments for complex logic
- README in each major directory

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
- [x] Express server setup
- [x] Project structure
- [x] CSS design system
- [x] API service layer
- [x] Auth state management
- [x] Login page
- [x] Token management

### Phase 2: Core Features (Week 2)
- [x] App shell (sidebar, topbar)
- [x] Dashboard
- [x] Protected routing
- [x] Permission-based UI
- [x] User profile

### Phase 3: Category Management (Week 3)
- [x] Categories CRUD
- [x] Sub-categories CRUD
- [x] Data tables
- [x] Forms with validation
- [x] Modals and toasts

### Phase 4: Product Management (Week 4-5)
- [x] Products list with filters
- [x] Product create (multi-step)
- [x] Product edit
- [x] Product detail
- [x] SKU generation
- [x] Specifications editor

### Phase 5: User & Role Management (Week 6)
- [x] Users CRUD
- [x] Roles CRUD
- [x] Permission management
- [x] Profile image upload

### Phase 6: Polish & Advanced (Week 7)
- [x] Dashboard charts
- [x] Reports
- [x] Product assets (images, QR, barcode)
- [x] Bulk operations
- [x] Export functionality
- [x] Performance optimization

---

## Success Criteria

### Functionality
- ✅ Complete authentication flow
- ✅ All CRUD operations working
- ✅ Permission-based access control
- ✅ Responsive on all devices
- ✅ Error handling implemented
- ✅ Loading states everywhere

### Code Quality
- ✅ Clean, modular code
- ✅ Consistent naming conventions
- ✅ Proper error handling
- ✅ Well-documented
- ✅ Reusable components
- ✅ No console errors

### User Experience
- ✅ Intuitive navigation
- ✅ Fast page loads
- ✅ Clear feedback messages
- ✅ Professional design
- ✅ Accessible interface
- ✅ Smooth interactions

---

## Additional Requirements

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Icon Library
Use Tabler Icons via CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

### External Dependencies (CDN)
```html
<!-- Axios -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Date formatting (date-fns) -->
<script src="https://cdn.jsdelivr.net/npm/date-fns@3.0.0/index.min.js"></script>
```

---

## Notes for Implementation

1. **Start with server.js**: Set up Express server to serve static files
2. **Build incrementally**: Start with login, then add protected pages
3. **Test early**: Test each feature as you build it
4. **Reuse components**: Create reusable components early
5. **Follow conventions**: Stick to the file structure and naming patterns
6. **Document as you go**: Add comments and documentation
7. **Handle errors**: Implement error handling from the start
8. **Think mobile-first**: Design for mobile, enhance for desktop
9. **Keep it simple**: Don't over-engineer, vanilla JS is powerful enough
10. **Security first**: Always validate inputs and handle auth properly

---

## Expected Deliverables

1. **Complete Node.js/Express application** with all files as per structure
2. **README.md** with setup and deployment instructions
3. **Working authentication** with login/logout/token refresh
4. **All CRUD pages** for categories, sub-categories, products, users, roles
5. **Dashboard** with KPI cards and charts
6. **Responsive design** working on mobile, tablet, desktop
7. **Error handling** and user feedback throughout
8. **Clean, documented code** following best practices

---

## Final Notes

This is a comprehensive, production-ready specification for building a professional warehouse management web application. The emphasis is on:
- **Clean architecture** with separation of concerns
- **Reusable components** for maintainability
- **Professional UI/UX** with indigo blue color scheme
- **Robust error handling** and user feedback
- **Security best practices** for authentication and authorization
- **Performance optimization** for large datasets
- **Accessibility** and responsive design

Follow this specification carefully to build a high-quality, enterprise-grade application that integrates seamlessly with the AUTH and PMS microservices.
