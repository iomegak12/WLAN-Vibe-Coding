/**
 * App Slice - Application state management
 * Handles onboarding, theme, and global app settings
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  onboardingCompleted: false,
  themeMode: 'light',
  isLoading: false,
  networkStatus: 'online',
  lastActivity: Date.now(),
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnboardingCompleted: (state, action) => {
      state.onboardingCompleted = action.payload;
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    resetApp: (state) => {
      return initialState;
    },
  },
});

export const {
  setOnboardingCompleted,
  setThemeMode,
  setLoading,
  setNetworkStatus,
  updateLastActivity,
  resetApp,
} = appSlice.actions;

// Selectors
export const selectOnboardingCompleted = (state) => state.app.onboardingCompleted;
export const selectThemeMode = (state) => state.app.themeMode;
export const selectNetworkStatus = (state) => state.app.networkStatus;
export const selectLastActivity = (state) => state.app.lastActivity;

export default appSlice.reducer;
