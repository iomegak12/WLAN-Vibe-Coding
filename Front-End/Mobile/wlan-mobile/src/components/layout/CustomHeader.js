/**
 * Custom Header - Top navigation bar with notifications, profile, and settings
 * Phase 2: Enhanced navigation structure
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Badge, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SPACING } from '../../theme/theme';

export default function CustomHeader({ title, showIcons = true }) {
  const theme = useTheme();
  const navigation = useNavigation();
  
  // TODO: Connect to actual notification store
  const unreadCount = 3;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <Text 
        variant="headlineSmall" 
        style={[styles.title, { color: theme.colors.onPrimaryContainer }]}
      >
        {title}
      </Text>
      
      {showIcons && (
        <View style={styles.iconsContainer}>
          {/* Notifications */}
          <View style={styles.iconButtonWrapper}>
            <IconButton
              icon="bell-outline"
              size={24}
              iconColor={theme.colors.onPrimaryContainer}
              onPress={() => navigation.navigate('Notifications')}
            />
            {unreadCount > 0 && (
              <Badge 
                style={[styles.badge, { backgroundColor: theme.colors.error }]}
                size={18}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </View>

          {/* Profile */}
          <IconButton
            icon="account-circle-outline"
            size={24}
            iconColor={theme.colors.onPrimaryContainer}
            onPress={() => navigation.navigate('Profile')}
          />

          {/* Settings */}
          <IconButton
            icon="cog-outline"
            size={24}
            iconColor={theme.colors.onPrimaryContainer}
            onPress={() => navigation.navigate('SettingsTab')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
    minWidth: 18,
    height: 18,
  },
});
