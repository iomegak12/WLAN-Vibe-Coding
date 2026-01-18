/**
 * Token Manager Utility
 * Secure token storage and retrieval using expo-secure-store
 * Phase 1: Authentication & Session Management
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
};

/**
 * Store tokens securely
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {boolean} rememberMe - Whether to persist session
 */
export const storeTokens = async (accessToken, refreshToken, rememberMe = false) => {
  try {
    // Validate tokens are strings
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Invalid access token: must be a non-empty string');
    }
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new Error('Invalid refresh token: must be a non-empty string');
    }

    // Store tokens in secure storage
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    
    // Store remember me preference
    await AsyncStorage.setItem(KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
    
    return true;
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw error;
  }
};

/**
 * Get access token
 * @returns {Promise<string|null>} Access token or null
 */
export const getAccessToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get refresh token
 * @returns {Promise<string|null>} Refresh token or null
 */
export const getRefreshToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Update access token (after refresh)
 * @param {string} accessToken - New access token
 */
export const updateAccessToken = async (accessToken) => {
  try {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    return true;
  } catch (error) {
    console.error('Error updating access token:', error);
    throw error;
  }
};

/**
 * Update both tokens (after refresh that rotates refresh token)
 * @param {string} accessToken - New access token
 * @param {string} refreshToken - New refresh token
 */
export const updateTokens = async (accessToken, refreshToken) => {
  try {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    return true;
  } catch (error) {
    console.error('Error updating tokens:', error);
    throw error;
  }
};

/**
 * Store user data
 * @param {Object} userData - User information
 */
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

/**
 * Get user data
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Get remember me preference
 * @returns {Promise<boolean>} Remember me status
 */
export const getRememberMe = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.REMEMBER_ME);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};

/**
 * Clear all tokens and user data
 */
export const clearAll = async () => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(KEYS.USER_DATA);
    await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
};

/**
 * Check if tokens exist
 * @returns {Promise<boolean>} True if tokens exist
 */
export const hasTokens = async () => {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    return !!(accessToken && refreshToken);
  } catch (error) {
    console.error('Error checking tokens:', error);
    return false;
  }
};

export default {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  updateTokens,
  storeUserData,
  getUserData,
  getRememberMe,
  clearAll,
  hasTokens,
};
