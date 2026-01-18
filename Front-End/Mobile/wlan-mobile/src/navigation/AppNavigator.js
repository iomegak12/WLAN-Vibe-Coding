/**
 * App Navigator - Main navigation configuration
 * Phase 2: Enhanced with bottom tabs and modal screens
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectOnboardingCompleted 
} from '../store/slices/appSlice';
import { 
  selectIsAuthenticated, 
  selectIsInitializing,
  verifySession,
  logoutUser 
} from '../store/slices/authSlice';
import activityTracker from '../utils/activityTracker';

// Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import CategoryDetailScreen from '../screens/categories/CategoryDetailScreen';
import SubcategoryDetailScreen from '../screens/categories/SubcategoryDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const onboardingCompleted = useSelector(selectOnboardingCompleted);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);

  // Verify session on app load
  useEffect(() => {
    if (onboardingCompleted) {
      dispatch(verifySession());
    }
  }, [dispatch, onboardingCompleted]);

  // Setup activity tracker for auto-logout
  useEffect(() => {
    if (isAuthenticated) {
      // Start tracking user activity
      activityTracker.start(() => {
        // Auto-logout callback
        dispatch(logoutUser());
      });

      return () => {
        // Stop tracking when logged out
        activityTracker.stop();
      };
    }
  }, [isAuthenticated, dispatch]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!onboardingCompleted ? (
          // Onboarding Stack
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App Stack with tabs and modal screens
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Edit Profile' }}
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen}
              options={{ headerShown: true, title: 'Change Password' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CategoryDetail" 
              component={CategoryDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SubcategoryDetail" 
              component={SubcategoryDetailScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

