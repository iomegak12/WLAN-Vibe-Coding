/**
 * Products Screen - Display and manage products
 * Phase 4: Product Management
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import CustomHeader from '../../components/layout/CustomHeader';
import { SPACING } from '../../theme/theme';

export default function ProductsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader title="Products" />
      <View style={styles.content}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Products screen - Coming in Phase 4
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.MD,
  },
});
