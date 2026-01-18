/**
 * Authentication Service
 * API calls for login, logout, token refresh, and session verification
 * Phase 1: Authentication & Session Management
 */

import { authApi } from '../axiosInstance';
import { API_CONFIG } from '../../config/api.config';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
export const login = async (email, password) => {
  try {
    const response = await authApi.post(API_CONFIG.AUTH.ENDPOINTS.LOGIN, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user - invalidate tokens on server
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<Object>} Logout response
 */
export const logout = async (refreshToken) => {
  try {
    const response = await authApi.post(API_CONFIG.AUTH.ENDPOINTS.LOGOUT, {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    // Even if server logout fails, we should clear local tokens
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<Object>} { accessToken, refreshToken }
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await authApi.post(API_CONFIG.AUTH.ENDPOINTS.REFRESH, {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify token validity
 * @returns {Promise<Object>} { valid: boolean, user: Object }
 */
export const verifyToken = async () => {
  try {
    const response = await authApi.get(API_CONFIG.AUTH.ENDPOINTS.VERIFY);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  try {
    const response = await authApi.get(API_CONFIG.AUTH.ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  login,
  logout,
  refreshAccessToken,
  verifyToken,
  getProfile,
};
