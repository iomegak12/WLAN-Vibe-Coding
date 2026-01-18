/**
 * Notifications Screen - Display user notifications
 * Phase 2: Enhanced navigation structure
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Badge, useTheme, IconButton } from 'react-native-paper';
import { SPACING } from '../../theme/theme';

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme();

  // TODO: Connect to actual notifications store
  const notifications = [
    {
      id: 1,
      title: 'Product Added',
      message: 'New product "Wireless Router X500" has been added',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Category Updated',
      message: 'Category "Networking Equipment" has been updated',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'System Update',
      message: 'A new version of the app is available',
      time: '1 day ago',
      read: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.onPrimaryContainer}
        />
        <Text 
          variant="headlineSmall" 
          style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}
        >
          Notifications
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              style={[
                styles.notificationCard,
                { backgroundColor: notification.read ? theme.colors.surface : theme.colors.secondaryContainer }
              ]}
            >
              <Card.Content>
                <View style={styles.notificationHeader}>
                  <Text variant="titleMedium" style={{ flex: 1 }}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <Badge size={8} style={{ backgroundColor: theme.colors.primary }} />
                  )}
                </View>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: SPACING.XS }}
                >
                  {notification.message}
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: SPACING.SM }}
                >
                  {notification.time}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.MD,
    elevation: 2,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XXL * 2,
  },
  notificationCard: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
