/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Codes
const ERROR_CODES = {
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Authentication Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  MISSING_TOKEN: 'MISSING_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',
  
  // Authorization Errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  
  // User Management Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INCORRECT_PASSWORD: 'INCORRECT_PASSWORD',
  PASSWORDS_MISMATCH: 'PASSWORDS_MISMATCH',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  CANNOT_DELETE_USER: 'CANNOT_DELETE_USER',
  
  // Role Management Errors
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_EXISTS: 'ROLE_EXISTS',
  CANNOT_DELETE_ROLE: 'CANNOT_DELETE_ROLE',
  INVALID_ROLE: 'INVALID_ROLE',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Password Reset
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
  
  // Generic Errors
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

// User Roles
const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  INVENTORY_MANAGER: 'Inventory Manager',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  WAREHOUSE_STAFF: 'Warehouse Staff',
  PRODUCT_MANAGER: 'Product Manager',
  AUDITOR_VIEWER: 'Auditor/Viewer',
};

// Permissions
const PERMISSIONS = {
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
  
  // Supplier Management
  SUPPLIERS_READ: 'suppliers.read',
  SUPPLIERS_CREATE: 'suppliers.create',
  SUPPLIERS_UPDATE: 'suppliers.update',
  SUPPLIERS_DELETE: 'suppliers.delete',
  
  // Warehouse Management
  WAREHOUSES_READ: 'warehouses.read',
  WAREHOUSES_CREATE: 'warehouses.create',
  WAREHOUSES_UPDATE: 'warehouses.update',
  WAREHOUSES_DELETE: 'warehouses.delete',
  
  // Inventory Management
  INVENTORY_READ: 'inventory.read',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Reporting
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',
  
  // Wildcard (Super Admin)
  ALL: '*',
};

// Token Types
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET: 'reset',
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  MAX_LIMIT: parseInt(process.env.MAX_PAGE_SIZE) || 100,
};

// File Upload Configuration
const FILE_UPLOAD = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 2097152, // 2MB
  ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || '.jpg,.jpeg,.png').split(','),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/profiles',
};

// Password Configuration
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
  SALT_ROUNDS: 10,
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  AUTH_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  AUTH_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
  MESSAGE: 'Too many requests from this IP, please try again later.',
};

// Email Templates
const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to WLAN Corporation',
  PASSWORD_RESET: 'Password Reset Request',
  PASSWORD_CHANGED: 'Your Password Has Been Changed',
  ACCOUNT_DEACTIVATED: 'Your Account Has Been Deactivated',
  ROLE_CHANGED: 'Your Role Has Been Updated',
  PROFILE_UPDATED: 'Your Profile Has Been Updated',
};

// Regular Expressions
const REGEX = {
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^\+?[1-9]\d{9,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
};

// MongoDB Collection Names
const COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  REFRESH_TOKENS: 'refresh_tokens',
};

// Application Messages
const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully. Please login again.',
    PASSWORD_RESET_EMAIL_SENT: 'If the email exists, a password reset link has been sent.',
    PASSWORD_RESET_SUCCESS: 'Password reset successful. Please login with your new password.',
    ROLE_CREATED: 'Role created successfully',
    ROLE_UPDATED: 'Role updated successfully',
    ROLE_DELETED: 'Role deleted successfully',
    FILE_UPLOADED: 'File uploaded successfully',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_INACTIVE: 'Your account is inactive. Please contact administrator.',
    TOKEN_INVALID: 'Token is invalid or expired',
    INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'A user with this email already exists',
    ROLE_NOT_FOUND: 'Role not found',
    ROLE_ALREADY_EXISTS: 'A role with this name already exists',
    ROLE_IN_USE: 'Cannot delete role that is assigned to users',
    WEAK_PASSWORD: 'Password must contain at least one uppercase, lowercase, number and special character',
    PASSWORDS_MISMATCH: 'Passwords do not match',
    INCORRECT_PASSWORD: 'Current password is incorrect',
    FILE_TOO_LARGE: 'File size must not exceed 2MB',
    INVALID_FILE_TYPE: 'Only JPG and PNG images are allowed',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  },
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  ROLES,
  PERMISSIONS,
  TOKEN_TYPES,
  PAGINATION,
  FILE_UPLOAD,
  PASSWORD_CONFIG,
  RATE_LIMIT_CONFIG,
  EMAIL_SUBJECTS,
  REGEX,
  COLLECTIONS,
  MESSAGES,
};
