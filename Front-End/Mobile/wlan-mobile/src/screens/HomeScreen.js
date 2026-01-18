/**
 * Home Screen - Main warehouse management dashboard
 * Phase 2: Enhanced with application features and quick actions
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, useTheme, Icon } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { useActivityTracking } from '../utils/activityTracker';
import CustomHeader from '../components/layout/CustomHeader';
import { SPACING } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const user = useSelector(selectUser);
  const { recordActivity } = useActivityTracking();

  // Record activity on screen interactions
  React.useEffect(() => {
    recordActivity();
  }, []);

  // Sample stats - TODO: Connect to actual data
  const stats = [
    { label: 'Categories', value: '24', icon: 'folder-outline', color: theme.colors.primary },
    { label: 'Products', value: '486', icon: 'package-variant', color: theme.colors.secondary },
    { label: 'Scans Today', value: '12', icon: 'barcode-scan', color: theme.colors.tertiary },
    { label: 'Tasks', value: '5', icon: 'clipboard-list', color: theme.colors.error },
  ];

  const quickActions = [
    { label: 'Scan Product', icon: 'barcode-scan', route: 'Scanner', color: theme.colors.primary },
    { label: 'Add Product', icon: 'plus-circle', route: 'AddProduct', color: theme.colors.secondary },
    { label: 'Search', icon: 'magnify', route: 'Search', color: theme.colors.tertiary },
    { label: 'Tasks', icon: 'clipboard-check', route: 'Tasks', color: theme.colors.error },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader title="WLAN Warehouse" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onTouchStart={recordActivity}
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeText}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Welcome back,
                </Text>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginTop: SPACING.XS }}>
                  {user?.role?.name}
                </Text>
              </View>
              <Avatar.Icon 
                size={64} 
                icon="account-circle" 
                style={{ backgroundColor: theme.colors.primaryContainer }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon source={stat.icon} size={32} color={stat.color} />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginTop: SPACING.XS }}>
                  {stat.value}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {stat.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: SPACING.MD }}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  style={styles.actionCard}
                  onPress={() => {
                    // TODO: Navigate when screens are ready
                    console.log('Navigate to:', action.route);
                  }}
                >
                  <Card.Content style={styles.actionContent}>
                    <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                      <Icon source={action.icon} size={28} color="#fff" />
                    </View>
                    <Text variant="bodyMedium" style={{ marginTop: SPACING.SM, textAlign: 'center' }}>
                      {action.label}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: SPACING.MD }}>
              Recent Activity
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No recent activity
            </Text>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
          WLAN Warehouse Mobile v1.0{'\n'}
          © 2026 WLAN Corporation
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  welcomeCard: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.MD,
  },
  card: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    elevation: 1,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: SPACING.MD,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: SPACING.MD,
    marginBottom: SPACING.XL,
  },
});
