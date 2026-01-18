# Phase 0: Foundation & Project Setup

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 0 - Foundation & Project Setup  
**Date:** January 14, 2026  
**Developer:** Ramkumar  

---

## Phase Objectives

Set up the foundational architecture for the React web application including:
- ✅ Initialize Vite + React project
- ✅ Install and configure Material-UI (MUI)
- ✅ Set up project folder structure
- ✅ Configure Axios with HTTP interceptors
- ✅ Create Context API structure for Auth and UI state
- ✅ Set up React Router for navigation
- ✅ Configure environment variables
- ✅ Create base utility functions

---

## Prerequisites

### Required Software
- Node.js v22.x (already installed ✓)
- VS Code (already installed ✓)
- Git (optional but recommended)

### Backend Services
- AUTH Service running on `http://localhost:5001`
- PMS Service running on `http://localhost:5002`

**Verify backend is running:**
```bash
# Test AUTH service
curl http://localhost:5001/api/v1/auth/verify

# Test PMS service  
curl http://localhost:5002/api/v1/categories
```

---

## Step-by-Step Implementation

### Step 1: Create Vite + React Project

**1.1 Navigate to your workspace folder:**
```bash
cd d:\000-Interim(NL)\Vibe-Coding\Front-End\Web
```

**1.2 Create Vite React project:**
```bash
npm create vite@latest wlan-warehouse-app -- --template react
```

**1.3 Navigate to project folder:**
```bash
cd wlan-warehouse-app
```

**1.4 Install dependencies:**
```bash
npm install
```

**1.5 Verify the setup works:**
```bash
npm run dev
```
Access `http://localhost:5173` in browser - you should see the default Vite + React welcome page.

**1.6 Stop the dev server (Ctrl+C)**

---

### Step 2: Install Required Dependencies

**2.1 Install Material-UI and related packages:**
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

**2.2 Install React Router:**
```bash
npm install react-router-dom
```

**2.3 Install Axios for HTTP requests:**
```bash
npm install axios
```

**2.4 Install React Hook Form:**
```bash
npm install react-hook-form
```

**2.5 Install date utilities:**
```bash
npm install date-fns
```

**2.6 Install Chart.js (for dashboard):**
```bash
npm install chart.js react-chartjs-2
```

**2.7 Install development dependencies:**
```bash
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
```

**2.8 Verify all dependencies installed:**
```bash
npm list --depth=0
```

---

### Step 3: Create Project Folder Structure

**3.1 Delete default Vite files:**
```bash
# In wlan-warehouse-app/src folder, delete:
# - App.css
# - index.css (we'll recreate this)
# - assets folder
```

**3.2 Create the following folder structure:**

```
wlan-warehouse-app/
├── public/
├── src/
│   ├── assets/              # Images, logos, static files
│   │   └── images/
│   │       └── placeholder-logo.png
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (buttons, inputs, etc.)
│   │   ├── layout/          # Layout components (AppShell, Sidebar, etc.)
│   │   └── feedback/        # Loading, error, empty states
│   ├── features/            # Feature-specific modules
│   │   ├── auth/            # Authentication feature
│   │   ├── users/           # User management feature
│   │   ├── roles/           # Role management feature
│   │   ├── products/        # Product management feature
│   │   ├── categories/      # Category management feature
│   │   └── dashboard/       # Dashboard feature
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── UIContext.jsx
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance configuration
│   │   ├── authService.js   # AUTH API endpoints
│   │   └── pmsService.js    # PMS API endpoints
│   ├── utils/               # Utility functions
│   │   ├── validation.js    # Form validation helpers
│   │   ├── formatting.js    # Date, currency formatting
│   │   └── constants.js     # App constants
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js
│   ├── routes/              # Route definitions
│   │   └── AppRoutes.jsx
│   ├── theme/               # MUI theme configuration
│   │   └── theme.js
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Entry point
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── .gitignore
├── package.json
└── vite.config.js
```

**3.3 Create folders (run these commands in the project root):**

**Windows (PowerShell/CMD):**
```bash
cd src
mkdir assets\images components\common components\layout components\feedback features\auth features\users features\roles features\products features\categories features\dashboard contexts services utils hooks routes theme
```

---

### Step 4: Configure Environment Variables

**4.1 Create `.env.development` in project root:**
```env
# API Base URLs
VITE_AUTH_API_URL=http://localhost:5001/api/v1
VITE_PMS_API_URL=http://localhost:5002/api/v1

# App Configuration
VITE_APP_NAME=WLAN Warehouse Management
VITE_APP_ENV=development

# Session Configuration
VITE_SESSION_TIMEOUT=1800000
VITE_TOKEN_REFRESH_INTERVAL=300000
```

**4.2 Create `.env.production` in project root:**
```env
# API Base URLs (update these when deploying)
VITE_AUTH_API_URL=https://api.wlancorp.com/auth/api/v1
VITE_PMS_API_URL=https://pms.wlancorp.com/api/v1

# App Configuration
VITE_APP_NAME=WLAN Warehouse Management
VITE_APP_ENV=production

# Session Configuration
VITE_SESSION_TIMEOUT=1800000
VITE_TOKEN_REFRESH_INTERVAL=300000
```

**4.3 Update `.gitignore` to protect sensitive files:**
```gitignore
# Dependencies
node_modules

# Build outputs
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.development.local
.env.production.local

# Editor directories
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log
npm-debug.log*
```

---

### Step 5: Configure Material-UI Theme

**5.1 Create `src/theme/theme.js`:**

```javascript
import { createTheme } from '@mui/material/styles';

// Tabler-inspired color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#206bc4', // Deep blue (Tabler primary)
      light: '#4299e1',
      dark: '#1a5490',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c757d', // Slate gray
      light: '#adb5bd',
      dark: '#495057',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2fb344', // Green
      light: '#51c767',
      dark: '#228b36',
    },
    warning: {
      main: '#f59f00', // Amber
      light: '#ffc107',
      dark: '#cc7f00',
    },
    error: {
      main: '#d63939', // Red
      light: '#e15757',
      dark: '#ab2d2d',
    },
    info: {
      main: '#4299e1', // Blue
      light: '#63b3ed',
      dark: '#3182ce',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    button: {
      textTransform: 'none', // Disable uppercase transformation
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '6px 16px',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
  },
});

export default theme;
```

---

### Step 6: Configure Axios with Interceptors

**6.1 Create `src/services/api.js`:**

```javascript
import axios from 'axios';

// Create AUTH API instance
export const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create PMS API instance
export const pmsAPI = axios.create({
  baseURL: import.meta.env.VITE_PMS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
const requestInterceptor = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor - Handle token refresh and errors
const responseInterceptor = (response) => {
  return response;
};

const errorInterceptor = async (error) => {
  const originalRequest = error.config;

  // Handle 401 Unauthorized - Token expired
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Attempt to refresh token
      const response = await authAPI.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Update tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }

  // Handle 403 Forbidden - Insufficient permissions
  if (error.response?.status === 403) {
    console.error('Access denied: Insufficient permissions');
    // You can show a toast notification here in Phase 2
  }

  return Promise.reject(error);
};

// Apply interceptors to both API instances
authAPI.interceptors.request.use(requestInterceptor);
authAPI.interceptors.response.use(responseInterceptor, errorInterceptor);

pmsAPI.interceptors.request.use(requestInterceptor);
pmsAPI.interceptors.response.use(responseInterceptor, errorInterceptor);

export default { authAPI, pmsAPI };
```

---

### Step 7: Create Utility Files

**7.1 Create `src/utils/constants.js`:**

```javascript
// API Response Status
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// User Statuses
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

// Product Statuses
export const PRODUCT_STATUS = {
  ACTIVE: 'Active',
  DISCONTINUED: 'Discontinued',
  OUT_OF_STOCK: 'Out of Stock',
  COMING_SOON: 'Coming Soon',
};

// Permission List (from UI guide)
export const PERMISSIONS = {
  // Wildcard
  ALL: '*',
  
  // User Management
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Role Management
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  
  // Product Management
  PRODUCTS_READ: 'products.read',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  
  // Category Management
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  
  // Reporting
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Session configuration
export const SESSION = {
  TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 1800000, // 30 minutes
  REFRESH_INTERVAL: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 300000, // 5 minutes
};

// File upload constraints
export const FILE_UPLOAD = {
  PROFILE_IMAGE: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png'],
  },
  PRODUCT_IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

// Debounce delay for search
export const SEARCH_DEBOUNCE_DELAY = 500; // milliseconds
```

**7.2 Create `src/utils/formatting.js`:**

```javascript
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format pattern (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '-';
  return format(new Date(date), formatString);
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format currency (INR)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
```

**7.3 Create `src/utils/validation.js`:**

```javascript
/**
 * Validation utility functions for forms
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Phone validation (international format)
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
};

// Password validation (min 8 chars, uppercase, lowercase, number, special char)
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    errors: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    },
  };
};

// Name validation (2-50 chars, no leading/trailing spaces)
export const validateName = (name) => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50 && trimmed === name;
};

// Code validation (uppercase alphanumeric, 2-10 chars)
export const validateCode = (code) => {
  const codeRegex = /^[A-Z0-9]{2,10}$/;
  return codeRegex.test(code);
};

// Required field validation
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Number validation (positive)
export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// File size validation
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// File type validation
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Length validation
export const validateLength = (value, min, max) => {
  const length = value ? value.length : 0;
  return length >= min && length <= max;
};
```

---

### Step 8: Create Context Providers

**8.1 Create `src/contexts/AuthContext.jsx`:**

```javascript
import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Verify token with backend
          const response = await authAPI.get('/auth/verify');
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and state
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const permissions = user.role.permissions || [];
    
    // Check for wildcard permission (Super Admin)
    if (permissions.includes('*')) return true;
    
    // Check for specific permission
    return permissions.includes(permission);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**8.2 Create `src/contexts/UIContext.jsx`:**

```javascript
import { createContext, useState } from 'react';

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableDensity, setTableDensity] = useState('standard'); // 'compact' | 'standard' | 'comfortable'

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    tableDensity,
    setTableDensity,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
```

**8.3 Create `src/hooks/useAuth.js`:**

```javascript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access Auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
```

---

### Step 9: Create Basic Routing Structure

**9.1 Create `src/routes/AppRoutes.jsx`:**

```javascript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Placeholder components (will be created in later phases)
const LoginPage = () => <div>Login Page - To be implemented in Phase 1</div>;
const DashboardPage = () => <div>Dashboard - To be implemented in Phase 2</div>;

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route wrapper (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
```

---

### Step 10: Update Main App Files

**10.1 Update `src/App.jsx`:**

```javascript
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import AppRoutes from './routes/AppRoutes';
import theme from './theme/theme';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <UIProvider>
            <AppRoutes />
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
```

**10.2 Update `src/main.jsx`:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**10.3 Update `public/index.html` (if exists) or create it:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WLAN Warehouse Management</title>
    <!-- Google Fonts - Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### Step 11: Create Placeholder Logo

**11.1 Create a simple placeholder logo:**

For now, you can use a free placeholder logo or create a simple SVG text logo. Place it in `src/assets/images/placeholder-logo.png`.

**Alternatively, create `src/assets/images/logo.jsx` with SVG:**

```javascript
const Logo = ({ width = 120, height = 40 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 40" fill="none">
      <text
        x="10"
        y="28"
        fontFamily="Inter, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#206bc4"
      >
        WLAN
      </text>
    </svg>
  );
};

export default Logo;
```

---

### Step 12: Test the Foundation Setup

**12.1 Start the development server:**
```bash
npm run dev
```

**12.2 Open browser and navigate to:**
```
http://localhost:5173
```

**12.3 Expected behavior:**
- You should see "Login Page - To be implemented in Phase 1" (since you're not authenticated)
- No console errors
- MUI theme is applied
- Routing works

**12.4 Test route protection:**
- Try navigating to `http://localhost:5173/dashboard`
- You should be redirected to `/login`

---

## Success Criteria Checklist

Mark each item as complete:

- [ ] Vite + React project created and running
- [ ] All dependencies installed without errors
- [ ] Folder structure created as specified
- [ ] Environment variables configured (.env.development)
- [ ] Material-UI theme configured and applied
- [ ] Axios instances created with interceptors
- [ ] Auth Context and UI Context created
- [ ] Basic routing working (login, dashboard, 404)
- [ ] Route protection working (redirect to login when not authenticated)
- [ ] No console errors when running `npm run dev`
- [ ] Browser displays placeholder pages correctly

---

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**
- Solution: Clear npm cache with `npm cache clean --force` and retry

**Issue: Vite dev server won't start**
- Solution: Check if port 5173 is already in use, or specify different port in `vite.config.js`

**Issue: Environment variables not loading**
- Solution: Restart dev server after creating `.env` files

**Issue: Module not found errors**
- Solution: Verify all imports use correct paths and file extensions

**Issue: CORS errors when calling backend**
- Solution: Will be handled in Phase 1 when we integrate actual API calls

---

## Next Steps

Once Phase 0 is complete and all success criteria are met:

✅ **Phase 1: Authentication Core** 
- Login page with form validation
- Full auth flow implementation
- Token refresh mechanism
- Auto-logout on inactivity

---

## Files Created in This Phase

```
wlan-warehouse-app/
├── .env.development
├── .env.production
├── .gitignore (updated)
├── src/
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── UIContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   └── api.js
│   ├── theme/
│   │   └── theme.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatting.js
│   │   └── validation.js
│   ├── App.jsx
│   └── main.jsx
└── public/
    └── index.html
```

---

**End of Phase 0**

**Estimated Time:** 2-3 hours  
**Status:** Ready for implementation  
**Next Phase:** Phase 1 - Authentication Core
