/**
 * Subcategory Detail Screen - Display subcategory details
 * Phase 3: Category Management
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  useTheme, 
  Card, 
  ActivityIndicator, 
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubcategoryById,
  selectSelectedSubcategory,
  selectCategoriesLoading,
} from '../../store/slices/categoriesSlice';
import { SPACING } from '../../theme/theme';
import { format } from 'date-fns';

export default function SubcategoryDetailScreen({ route, navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { subcategoryId } = route.params;
  
  const subcategory = useSelector(selectSelectedSubcategory);
  const loading = useSelector(selectCategoriesLoading);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch subcategory details
    dispatch(fetchSubcategoryById(subcategoryId));
  }, [dispatch, subcategoryId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSubcategoryById(subcategoryId));
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'N/A';
    }
  };

  if (loading && !subcategory) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor={theme.colors.onPrimaryContainer}
          />
          <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
            Subcategory Details
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: SPACING.MD, color: theme.colors.onSurfaceVariant }}>
            Loading subcategory details...
          </Text>
        </View>
      </View>
    );
  }

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
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Subcategory Details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Subcategory Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="headlineMedium" style={{ flex: 1, fontWeight: 'bold' }}>
                {subcategory?.name}
              </Text>
              {subcategory?.isActive !== undefined && (
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: subcategory.isActive
                      ? theme.colors.tertiaryContainer
                      : theme.colors.errorContainer,
                  }}
                  textStyle={{
                    color: subcategory.isActive
                      ? theme.colors.onTertiaryContainer
                      : theme.colors.onErrorContainer,
                  }}
                >
                  {subcategory.isActive ? 'Active' : 'Inactive'}
                </Chip>
              )}
            </View>

            {subcategory?.code && (
              <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: SPACING.SM }}>
                Code: {subcategory.code}
              </Text>
            )}

            {subcategory?.category && (
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: SPACING.XS }}>
                Category: {subcategory.category.name}
              </Text>
            )}

            {subcategory?.description && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={{ marginBottom: SPACING.XS }}>
                  Description
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {subcategory.description}
                </Text>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Created At
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatDate(subcategory?.createdAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Updated At
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatDate(subcategory?.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: SPACING.MD }}>
              Additional Information
            </Text>

            {subcategory?.createdBy && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Created By
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {subcategory.createdBy}
                </Text>
              </View>
            )}

            {subcategory?.updatedBy && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Updated By
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {subcategory.updatedBy}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Deleted
              </Text>
              <Chip
                mode="flat"
                compact
                style={{
                  backgroundColor: subcategory?.isDeleted
                    ? theme.colors.errorContainer
                    : theme.colors.tertiaryContainer,
                }}
                textStyle={{
                  color: subcategory?.isDeleted
                    ? theme.colors.onErrorContainer
                    : theme.colors.onTertiaryContainer,
                }}
              >
                {subcategory?.isDeleted ? 'Yes' : 'No'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  card: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  divider: {
    marginVertical: SPACING.MD,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
});
