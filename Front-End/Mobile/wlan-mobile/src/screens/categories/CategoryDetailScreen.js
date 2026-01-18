/**
 * Category Detail Screen - Display category details and related subcategories
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
  List,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategoryById,
  fetchSubcategories,
  selectSelectedCategory,
  selectSubcategoriesByCategory,
  selectCategoriesLoading,
} from '../../store/slices/categoriesSlice';
import { SPACING } from '../../theme/theme';
import { format } from 'date-fns';

export default function CategoryDetailScreen({ route, navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { categoryId } = route.params;
  
  const category = useSelector(selectSelectedCategory);
  const subcategories = useSelector((state) => selectSubcategoriesByCategory(state, categoryId));
  const loading = useSelector(selectCategoriesLoading);
  
  const [refreshing, setRefreshing] = useState(false);

  const subcategoriesList = Array.isArray(subcategories) ? subcategories : [];

  useEffect(() => {
    // Fetch category details and its subcategories
    dispatch(fetchCategoryById(categoryId));
    dispatch(fetchSubcategories(categoryId));
  }, [dispatch, categoryId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCategoryById(categoryId)),
      dispatch(fetchSubcategories(categoryId)),
    ]);
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

  if (loading && !category) {
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
            Category Details
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: SPACING.MD, color: theme.colors.onSurfaceVariant }}>
            Loading category details...
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
          Category Details
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
        {/* Category Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="headlineMedium" style={{ flex: 1, fontWeight: 'bold' }}>
                {category?.name}
              </Text>
              {category?.isActive !== undefined && (
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: category.isActive
                      ? theme.colors.tertiaryContainer
                      : theme.colors.errorContainer,
                  }}
                  textStyle={{
                    color: category.isActive
                      ? theme.colors.onTertiaryContainer
                      : theme.colors.onErrorContainer,
                  }}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </Chip>
              )}
            </View>

            {category?.code && (
              <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: SPACING.SM }}>
                Code: {category.code}
              </Text>
            )}

            {category?.description && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={{ marginBottom: SPACING.XS }}>
                  Description
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {category.description}
                </Text>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Created At
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatDate(category?.createdAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Updated At
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatDate(category?.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Subcategories Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                Subcategories
              </Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: theme.colors.primaryContainer }}
              >
                {subcategoriesList.length}
              </Chip>
            </View>

            {loading && subcategoriesList.length === 0 ? (
              <View style={styles.loadingSubcategories}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ marginLeft: SPACING.MD, color: theme.colors.onSurfaceVariant }}>
                  Loading subcategories...
                </Text>
              </View>
            ) : subcategoriesList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  No subcategories found in this category
                </Text>
              </View>
            ) : (
              <View style={styles.subcategoriesList}>
                {subcategoriesList.map((subcategory, index) => (
                  <View key={subcategory.id}>
                    {index > 0 && <Divider />}
                    <List.Item
                      title={subcategory.name}
                      description={subcategory.description}
                      left={(props) => <List.Icon {...props} icon="folder-outline" />}
                      right={() => 
                        subcategory.isActive !== undefined && (
                          <Chip
                            mode="flat"
                            compact
                            style={{
                              backgroundColor: subcategory.isActive
                                ? theme.colors.tertiaryContainer
                                : theme.colors.errorContainer,
                            }}
                            textStyle={{
                              color: subcategory.isActive
                                ? theme.colors.onTertiaryContainer
                                : theme.colors.onErrorContainer,
                              fontSize: 11,
                            }}
                          >
                            {subcategory.isActive ? 'Active' : 'Inactive'}
                          </Chip>
                        )
                      }
                      onPress={() => {
                        navigation.navigate('SubcategoryDetail', { subcategoryId: subcategory.id });
                      }}
                    />
                  </View>
                ))}
              </View>
            )}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  loadingSubcategories: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
  },
  emptyState: {
    paddingVertical: SPACING.XL,
    alignItems: 'center',
  },
  subcategoriesList: {
    marginTop: SPACING.SM,
  },
});
