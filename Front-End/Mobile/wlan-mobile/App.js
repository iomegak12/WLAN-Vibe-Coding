/**
 * WLAN Warehouse Mobile App
 * Main Application Entry Point
 * 
 * Phase 0: Foundation Setup Complete
 * - Redux Store with Persistence
 * - React Navigation Setup
 * - Material Design Theme (React Native Paper)
 * - Onboarding Flow
 * - Basic Auth Flow Structure
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Redux Store
import { store, persistor } from './src/store';

// Theme
import theme from './src/theme/theme';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider theme={theme}>
            <StatusBar style="auto" />
            <AppNavigator />
            <Toast />
          </PaperProvider>
        </PersistGate>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
