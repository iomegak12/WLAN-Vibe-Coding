import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setTokens, clearAuthTokens } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [timeoutSecondsLeft, setTimeoutSecondsLeft] = useState(120);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          // Verify token is still valid
          await authService.verifyToken();
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or server unreachable, clear auth state silently
          clearAuthTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Auto token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Refresh token is sent automatically via httpOnly cookie
        const response = await authService.refreshToken();
        console.log('🔄 Token refresh response:', response);
        // Backend structure: { success, data: { tokens: { accessToken } } }
        const accessToken = response.data?.tokens?.accessToken || response.data?.accessToken || response.accessToken;
        if (accessToken) {
          setTokens(accessToken);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Don't auto-logout on refresh error - let 401 interceptor handle it
      }
    }, parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 300000); // Default 5 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Session timeout (inactivity)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    let warningTimeoutId;
    const sessionTimeout = parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 1800000; // Default 30 minutes
    const warningTime = 120000; // Show warning 2 minutes before timeout

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      setShowTimeoutDialog(false);

      // Show warning dialog 2 minutes before timeout
      warningTimeoutId = setTimeout(() => {
        setShowTimeoutDialog(true);
        setTimeoutSecondsLeft(120);
      }, sessionTimeout - warningTime);

      // Auto logout after full timeout
      timeoutId = setTimeout(() => {
        logout();
      }, sessionTimeout);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Initialize timer

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // Backend structure: { success, data: { tokens: { accessToken, refreshToken }, user }, message }
      const accessToken = response.data?.tokens?.accessToken;
      const userData = response.data?.user;
      // refreshToken is automatically set in httpOnly cookie by backend

      setTokens(accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setShowTimeoutDialog(false); // Reset timeout dialog on login

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error; // Let the component handle the error
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Only attempt logout if we have a valid session (avoid backend errors)
      if (isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      // Silently handle logout errors - just clear local state
      console.warn('Logout API call failed:', error.message);
    } finally {
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      setShowTimeoutDialog(false);
    }
  }, [isAuthenticated]);

  // Extend session when user clicks "Stay Logged In"
  const extendSession = useCallback(() => {
    setShowTimeoutDialog(false);
    // Trigger a user activity event to reset the timer
    window.dispatchEvent(new Event('mousedown'));
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    // Permissions can be at user.permissions or user.role.permissions
    const permissions = user.permissions || user.role?.permissions || [];
    return permissions.includes(permission) || permissions.includes('*');
  }, [user]);

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    // Permissions can be at user.permissions or user.role.permissions
    const userPermissions = user.permissions || user.role?.permissions || [];
    return permissions.some(perm => 
      userPermissions.includes(perm) || userPermissions.includes('*')
    );
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasPermission,
    hasAnyPermission,
    showTimeoutDialog,
    timeoutSecondsLeft,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
