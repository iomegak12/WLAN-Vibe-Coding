/**
 * Axios Instance Configuration
 * Centralized HTTP client with interceptors for authentication
 * Phase 1: Enhanced with tokenManager integration
 */

import axios from 'axios';
import * as tokenManager from '../utils/tokenManager';
import { API_CONFIG } from '../config/api.config';

// Create AUTH service instance
export const authApi = axios.create({
  baseURL: API_CONFIG.AUTH.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create PMS service instance
export const pmsApi = axios.create({
  baseURL: API_CONFIG.PMS.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor - Attach access token to requests
 */
const requestInterceptor = async (config) => {
  try {
    const accessToken = await tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Response Error Interceptor - Handle token refresh on 401
 */
const responseErrorInterceptor = (api) => async (error) => {
  const originalRequest = error.config;

  // If error is not 401 or request already retried, reject
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const refreshToken = await tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      // No refresh token, user needs to login
      await tokenManager.clearAll();
      isRefreshing = false;
      return Promise.reject(error);
    }

    // Attempt token refresh
    const response = await axios.post(
      `${API_CONFIG.AUTH.BASE_URL}${API_CONFIG.AUTH.ENDPOINTS.REFRESH}`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens using tokenManager
    if (newRefreshToken) {
      // Token rotation - both tokens updated
      await tokenManager.updateTokens(accessToken, newRefreshToken);
    } else {
      // Only access token updated
      await tokenManager.updateAccessToken(accessToken);
    }

    // Update authorization header
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    // Process queued requests
    processQueue(null, accessToken);
    isRefreshing = false;

    // Retry original request
    return api(originalRequest);
  } catch (refreshError) {
    // Refresh failed, clear tokens and redirect to login
    processQueue(refreshError, null);
    await tokenManager.clearAll();
    isRefreshing = false;
    return Promise.reject(refreshError);
  }
};

// Apply interceptors to AUTH API
authApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
authApi.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor(authApi)
);

// Apply interceptors to PMS API
pmsApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
pmsApi.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor(pmsApi)
);

export default { authApi, pmsApi };
