/**
 * App Constants
 * Global constants used throughout the application
 */

// Screen names for navigation
export const SCREENS = {
  // Onboarding
  ONBOARDING: 'Onboarding',
  
  // Auth
  LOGIN: 'Login',
  
  // Main App
  HOME: 'Home',
  SCAN: 'Scan',
  SEARCH: 'Search',
  PRODUCTS: 'Products',
  PRODUCT_DETAILS: 'ProductDetails',
  PRODUCT_CREATE: 'ProductCreate',
  PRODUCT_EDIT: 'ProductEdit',
  TASKS: 'Tasks',
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  CHANGE_PASSWORD: 'ChangePassword',
};

// Product status options
export const PRODUCT_STATUS = {
  ACTIVE: 'Active',
  DISCONTINUED: 'Discontinued',
  OUT_OF_STOCK: 'Out of Stock',
  COMING_SOON: 'Coming Soon',
};

// Currency options
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

// Unit of measurement options
export const UNITS = ['PCS', 'KG', 'L', 'M', 'BOX', 'CARTON'];

// Image constraints
export const IMAGE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_COUNT: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MOBILE_LIMIT: 10,
};

// Scan types
export const SCAN_TYPES = {
  QR_CODE: 'qr',
  BARCODE: 'barcode',
};

// Debounce delays (milliseconds)
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  PERMISSION_DENIED: "You don't have permission for this action.",
  RESOURCE_NOT_FOUND: 'Resource not found.',
  INVALID_INPUT: 'Please check your input and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  IMAGE_UPLOADED: 'Image uploaded successfully',
};

// Regex patterns
export const REGEX = {
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^\+?[1-9]\d{9,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export default {
  SCREENS,
  PRODUCT_STATUS,
  CURRENCIES,
  UNITS,
  IMAGE_CONSTRAINTS,
  PAGINATION,
  SCAN_TYPES,
  DEBOUNCE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
};
