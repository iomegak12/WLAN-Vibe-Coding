/**
 * Activity Tracker Utility
 * Monitors user activity and triggers auto-logout on inactivity
 * Phase 1: Authentication & Session Management
 */

import { AppState } from 'react-native';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

class ActivityTracker {
  constructor() {
    this.lastActivityTime = Date.now();
    this.inactivityTimer = null;
    this.onInactivityCallback = null;
    this.appStateSubscription = null;
    this.isEnabled = false;
  }

  /**
   * Start tracking user activity
   * @param {Function} onInactivity - Callback to execute on inactivity timeout
   */
  start(onInactivity) {
    if (this.isEnabled) {
      return;
    }

    this.onInactivityCallback = onInactivity;
    this.isEnabled = true;
    this.resetTimer();

    // Listen to app state changes (foreground/background)
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Stop tracking
   */
  stop() {
    this.isEnabled = false;
    this.clearTimer();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /**
   * Record user activity (called on interactions)
   */
  recordActivity() {
    if (!this.isEnabled) {
      return;
    }

    this.lastActivityTime = Date.now();
    this.resetTimer();
  }

  /**
   * Reset the inactivity timer
   */
  resetTimer() {
    this.clearTimer();
    
    this.inactivityTimer = setTimeout(() => {
      if (this.isEnabled && this.onInactivityCallback) {
        this.onInactivityCallback();
      }
    }, INACTIVITY_TIMEOUT);
  }

  /**
   * Clear the inactivity timer
   */
  clearTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // App came to foreground, check if timeout exceeded
      const inactiveDuration = Date.now() - this.lastActivityTime;
      
      if (inactiveDuration >= INACTIVITY_TIMEOUT) {
        // User was inactive for too long
        if (this.isEnabled && this.onInactivityCallback) {
          this.onInactivityCallback();
        }
      } else {
        // Resume timer for remaining time
        this.resetTimer();
      }
    } else if (nextAppState === 'background') {
      // App went to background, clear timer
      this.clearTimer();
    }
  };

  /**
   * Get time until auto-logout (in milliseconds)
   */
  getTimeUntilLogout() {
    const elapsed = Date.now() - this.lastActivityTime;
    const remaining = INACTIVITY_TIMEOUT - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if user is currently inactive
   */
  isInactive() {
    return this.getTimeUntilLogout() === 0;
  }
}

// Singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;

/**
 * Hook for using activity tracker in components
 */
export const useActivityTracking = () => {
  return {
    recordActivity: () => activityTracker.recordActivity(),
    getTimeUntilLogout: () => activityTracker.getTimeUntilLogout(),
    isInactive: () => activityTracker.isInactive(),
  };
};
