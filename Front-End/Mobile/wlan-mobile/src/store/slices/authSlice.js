/**
 * Auth Slice - Authentication state management
 * Phase 1: Complete implementation with async thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../api/services/authService';
import * as tokenManager from '../../utils/tokenManager';
import Toast from 'react-native-toast-message';

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  isInitializing: true, // For splash screen
};

/**
 * Login async thunk
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      // Backend returns: { success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }
      const user = response.data?.user;
      const accessToken = response.data?.tokens?.accessToken;
      const refreshToken = response.data?.tokens?.refreshToken;
      
      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in response:', response);
        return rejectWithValue('Invalid server response: missing authentication tokens');
      }
      
      // Store tokens securely
      await tokenManager.storeTokens(
        accessToken,
        refreshToken,
        rememberMe
      );
      
      // Store user data
      if (user) {
        await tokenManager.storeUserData(user);
      }
      
      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout async thunk
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Call logout endpoint if we have a refresh token
      if (auth.refreshToken) {
        await authService.logout(auth.refreshToken);
      }
      
      // Clear all stored data
      await tokenManager.clearAll();
      
      return true;
    } catch (error) {
      // Even if server logout fails, clear local data
      await tokenManager.clearAll();
      return true;
    }
  }
);

/**
 * Verify token and restore session
 */
export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have tokens
      const hasTokens = await tokenManager.hasTokens();
      
      if (!hasTokens) {
        return rejectWithValue('No tokens found');
      }
      
      // Verify token with server
      const response = await authService.verifyToken();
      
      // Get stored tokens and user data
      const accessToken = await tokenManager.getAccessToken();
      const refreshToken = await tokenManager.getRefreshToken();
      const userData = await tokenManager.getUserData();
      
      return {
        user: response.data?.user || userData,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Token invalid, clear storage
      await tokenManager.clearAll();
      return rejectWithValue('Session expired');
    }
  }
);

/**
 * Refresh access token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const storedRefreshToken = await tokenManager.getRefreshToken();
      
      const refreshTokenToUse = auth.refreshToken || storedRefreshToken;
      
      if (!refreshTokenToUse) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await authService.refreshAccessToken(refreshTokenToUse);
      
      // Backend returns: { success: true, data: { accessToken, refreshToken } }
      const newAccessToken = response.data?.accessToken;
      const newRefreshToken = response.data?.refreshToken;
      
      if (!newAccessToken) {
        return rejectWithValue('Invalid refresh response');
      }
      
      // Update tokens in storage
      if (newRefreshToken) {
        // Token rotation - new refresh token provided
        await tokenManager.updateTokens(newAccessToken, newRefreshToken);
      } else {
        // Only access token updated
        await tokenManager.updateAccessToken(newAccessToken);
      }
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // Refresh failed, user needs to login again
      await tokenManager.clearAll();
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: `Hello, ${action.payload.user.firstName || 'User'}`,
          position: 'top',
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: action.payload,
          position: 'top',
        });
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return { ...initialState, isInitializing: false, error: null };
      })
      
      // Verify Session
      .addCase(verifySession.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(verifySession.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.error = null; // Don't show error for failed session verification
      })
      
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, logout user
        return { ...initialState, isInitializing: false };
      });
  },
});

export const { setCredentials, setUser, clearError, setInitializing } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitializing = (state) => state.auth.isInitializing;

export default authSlice.reducer;
