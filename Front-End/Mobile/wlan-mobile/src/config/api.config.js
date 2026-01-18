/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

export const API_CONFIG = {
  AUTH: {
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL_AUTH || 'http://10.0.2.2:5001/api/v1',
    ENDPOINTS: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      PROFILE: '/profile',
      UPLOAD_IMAGE: '/profile/upload-image',
      DELETE_IMAGE: '/profile/delete-image',
      CHANGE_PASSWORD: '/users/:id/change-password',
    },
  },
  PMS: {
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL_PMS || 'http://10.0.2.2:5002/api/v1',
    ENDPOINTS: {
      CATEGORIES: '/categories',
      SUBCATEGORIES: '/subcategories',
      PRODUCTS: '/products',
      PRODUCT_BY_ID: '/products/:id',
      PRODUCT_BY_SKU: '/products/sku/:sku',
      PRODUCT_QR: '/products/:id/qr',
      PRODUCT_BARCODE: '/products/:id/barcode',
      UPLOAD_IMAGES: '/files/products/:id/images',
      DELETE_IMAGE: '/files/products/:productId/images/:imageId',
      FILE: '/files/:id',
    },
  },
  TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const APP_CONFIG = {
  NAME: process.env.APP_NAME || 'WLAN Warehouse',
  VERSION: process.env.APP_VERSION || '1.0.0',
  ENV,
  IS_DEV: ENV === 'development',
  IS_PROD: ENV === 'production',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@wlan/access_token',
  REFRESH_TOKEN: '@wlan/refresh_token',
  USER_DATA: '@wlan/user_data',
  ONBOARDING_COMPLETED: '@wlan/onboarding_completed',
  THEME_MODE: '@wlan/theme_mode',
};

export const TIMEOUTS = {
  INACTIVITY: parseInt(process.env.INACTIVITY_TIMEOUT) || 1800000, // 30 minutes
  ACCESS_TOKEN_EXPIRY: parseInt(process.env.ACCESS_TOKEN_EXPIRY) || 900000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: parseInt(process.env.REFRESH_TOKEN_EXPIRY) || 604800000, // 7 days
};
