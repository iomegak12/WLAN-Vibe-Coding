/**
 * Subcategories Screen - Display product subcategories
 * Phase 3: Category Management
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, 
  useTheme, 
  Searchbar, 
  Card, 
  ActivityIndicator, 
  Chip,
  Menu,
  Button,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubcategories,
  fetchCategories,
  selectSubcategories,
  selectCategories,
  selectCategoriesLoading,
} from '../../store/slices/categoriesSlice';
import CustomHeader from '../../components/layout/CustomHeader';
import { SPACING } from '../../theme/theme';

export default function SubcategoriesScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const subcategories = useSelector(selectSubcategories);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  // Ensure arrays are always arrays
  const subcategoriesList = Array.isArray(subcategories) ? subcategories : [];
  const categoriesList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    // Fetch categories if not loaded
    if (categoriesList.length === 0) {
      dispatch(fetchCategories());
    }
    // Fetch all subcategories initially
    dispatch(fetchSubcategories());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSubcategories(selectedCategoryFilter?.id || null));
    setRefreshing(false);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategoryFilter(category);
    setCategoryMenuVisible(false);
    if (category) {
      dispatch(fetchSubcategories(category.id));
    } else {
      dispatch(fetchSubcategories());
    }
  };

  const filteredSubcategories = subcategoriesList.filter((subcategory) =>
    subcategory.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSubcategoryCard = ({ item }) => (
    <Card
      style={styles.subcategoryCard}
      onPress={() => {
        navigation.navigate('SubcategoryDetail', { subcategoryId: item.id });
      }}
    >
      <Card.Content>
        <View style={styles.subcategoryHeader}>
          <Text variant="titleMedium" style={{ flex: 1 }}>
            {item.name}
          </Text>
          {item.is_active !== undefined && (
            <Chip
              mode="flat"
              style={{
                backgroundColor: item.is_active
                  ? theme.colors.tertiaryContainer
                  : theme.colors.errorContainer,
              }}
              textStyle={{
                color: item.is_active
                  ? theme.colors.onTertiaryContainer
                  : theme.colors.onErrorContainer,
              }}
            >
              {item.is_active ? 'Active' : 'Inactive'}
            </Chip>
          )}
        </View>
        
        {item.category?.name && (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.primary, marginTop: SPACING.XS }}
          >
            Category: {item.category.name}
          </Text>
        )}
        
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
        {searchQuery 
          ? 'No subcategories found' 
          : selectedCategoryFilter
          ? `No subcategories in ${selectedCategoryFilter.name}`
          : 'No subcategories available'}
      </Text>
    </View>
  );

  if (loading && !refreshing && subcategoriesList.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CustomHeader title="Subcategories" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: SPACING.MD, color: theme.colors.onSurfaceVariant }}>
            Loading subcategories...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader title="Subcategories" />
      
      <View style={styles.content}>
        <View style={styles.filtersRow}>
          <Searchbar
            placeholder="Search subcategories..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.filterButton}
                icon="filter"
              >
                {selectedCategoryFilter ? selectedCategoryFilter.name : 'All Categories'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleCategoryFilter(null)}
              title="All Categories"
            />
            {categoriesList.map((category) => (
              <Menu.Item
                key={category.id}
                onPress={() => handleCategoryFilter(category)}
                title={category.name}
              />
            ))}
          </Menu>
        </View>

        <FlatList
          data={filteredSubcategories}
          renderItem={renderSubcategoryCard}
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
  filtersRow: {
    padding: SPACING.MD,
    gap: SPACING.SM,
  },
  searchbar: {
    elevation: 2,
  },
  filterButton: {
    marginTop: SPACING.SM,
  },
  listContent: {
    padding: SPACING.MD,
    paddingTop: 0,
  },
  subcategoryCard: {
    marginBottom: SPACING.MD,
    elevation: 2,
  },
  subcategoryHeader: {
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
