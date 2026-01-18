/**
 * Categories Screen - Display product categories
 * Phase 3: Category Management
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, useTheme, Searchbar, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
  selectIsCacheValid,
} from '../../store/slices/categoriesSlice';
import CustomHeader from '../../components/layout/CustomHeader';
import { SPACING } from '../../theme/theme';

export default function CategoriesScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  const isCacheValid = useSelector(selectIsCacheValid);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Ensure categories is always an array
  const categoriesList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    // Fetch categories if cache is invalid or empty
    if (!isCacheValid || categoriesList.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, isCacheValid, categoriesList.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCategories());
    setRefreshing(false);
  };

  const filteredCategories = categoriesList.filter((category) =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryCard = ({ item }) => (
    <Card
      style={styles.categoryCard}
      onPress={() => {
        navigation.navigate('CategoryDetail', { categoryId: item.id });
      }}
    >
      <Card.Content>
        <View style={styles.categoryHeader}>
          <Text variant="titleMedium" style={{ flex: 1 }}>
            {item.name}
          </Text>
          {item.isActive !== undefined && (
            <Chip
              mode="flat"
              style={{
                backgroundColor: item.isActive
                  ? theme.colors.tertiaryContainer
                  : theme.colors.errorContainer,
              }}
              textStyle={{
                color: item.isActive
                  ? theme.colors.onTertiaryContainer
                  : theme.colors.onErrorContainer,
              }}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Chip>
          )}
        </View>
        {item.description && (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: SPACING.XS }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        {searchQuery ? 'No categories found' : 'No categories available'}
      </Text>
    </View>
  );

  if (loading && !refreshing && categoriesList.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CustomHeader title="Categories" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: SPACING.MD, color: theme.colors.onSurfaceVariant }}>
            Loading categories...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader title="Categories" />
      
      <View style={styles.content}>
        <Searchbar
          placeholder="Search categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id?.toString() || item.name}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: SPACING.MD,
    elevation: 2,
  },
  listContent: {
    padding: SPACING.MD,
    paddingTop: 0,
  },
  categoryCard: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XXL * 2,
  },
});
