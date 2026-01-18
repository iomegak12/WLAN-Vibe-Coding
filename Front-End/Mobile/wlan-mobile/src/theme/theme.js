/**
 * Theme Configuration - React Native Paper Material Design 3
 * Optimized for warehouse operations with high contrast
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Brand colors for WLAN Corporation
const brandColors = {
  primary: '#1976D2', // Blue - professional, trust
  secondary: '#FF9800', // Orange - action, energy
  tertiary: '#4CAF50', // Green - success
  error: '#F44336', // Red
  warning: '#FFC107', // Amber
  info: '#2196F3', // Light Blue
  success: '#4CAF50', // Green
};

// Warehouse-optimized colors (high contrast for outdoor visibility)
const warehouseColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E0E0E0',
  onSurface: '#212121',
  onSurfaceVariant: '#424242',
  outline: '#757575',
  outlineVariant: '#BDBDBD',
};

// Status chip colors
const statusColors = {
  active: '#4CAF50',
  inactive: '#9E9E9E',
  discontinued: '#F44336',
  outOfStock: '#FF9800',
  comingSoon: '#2196F3',
  lowStock: '#FFC107',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: '#BBDEFB',
    secondary: brandColors.secondary,
    secondaryContainer: '#FFE0B2',
    tertiary: brandColors.tertiary,
    tertiaryContainer: '#C8E6C9',
    error: brandColors.error,
    errorContainer: '#FFCDD2',
    background: warehouseColors.background,
    surface: warehouseColors.surface,
    surfaceVariant: warehouseColors.surfaceVariant,
    onSurface: warehouseColors.onSurface,
    onSurfaceVariant: warehouseColors.onSurfaceVariant,
    outline: warehouseColors.outline,
    outlineVariant: warehouseColors.outlineVariant,
    // Custom colors
    success: statusColors.active,
    warning: statusColors.lowStock,
    info: statusColors.comingSoon,
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#1565C0',
    secondary: '#FFB74D',
    secondaryContainer: '#E65100',
    tertiary: '#81C784',
    tertiaryContainer: '#2E7D32',
    error: '#EF5350',
    errorContainer: '#C62828',
    // Custom colors
    success: statusColors.active,
    warning: statusColors.lowStock,
    info: statusColors.comingSoon,
  },
  roundness: 8,
};

// Status-specific colors
export const STATUS_COLORS = statusColors;

// Elevation levels for Material Design
export const ELEVATION = {
  LEVEL_0: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
};

// Spacing system (8dp grid)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 40,
};

// Typography scale
export const TYPOGRAPHY = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '500' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
};

// Touch target sizes (minimum 44x44dp for warehouse use)
export const TOUCH_TARGETS = {
  MIN_SIZE: 44,
  BUTTON_HEIGHT: 48,
  ICON_BUTTON: 48,
  FAB: 56,
  FAB_SMALL: 40,
};

export default lightTheme;
