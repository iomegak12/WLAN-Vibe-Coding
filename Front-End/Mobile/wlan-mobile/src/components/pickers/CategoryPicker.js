/**
 * Category Picker - Searchable dropdown for category selection
 * Phase 3: Categories & Subcategories Management
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';
import { 
  TextInput, 
  List, 
  Searchbar, 
  useTheme, 
  Divider,
  ActivityIndicator,
  Text,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading,
} from '../../store/slices/categoriesSlice';
import { SPACING } from '../../theme/theme';

export default function CategoryPicker({ 
  value, 
  onValueChange, 
  error, 
  disabled = false,
  label = 'Category',
  placeholder = 'Select a category',
}) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categoriesList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    if (categoriesList.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesList.length]);

  const filteredCategories = categoriesList.filter((category) =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = categoriesList.find(cat => cat.id === value);

  const handleSelect = (category) => {
    onValueChange(category.id);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onValueChange(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <TextInput
          label={label}
          value={selectedCategory?.name || ''}
          placeholder={placeholder}
          editable={false}
          mode="outlined"
          right={
            value ? (
              <TextInput.Icon
                icon="close"
                onPress={handleClear}
                disabled={disabled}
              />
            ) : (
              <TextInput.Icon icon="chevron-down" disabled={disabled} />
            )
          }
          error={!!error}
          disabled={disabled}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </TouchableOpacity>
      
      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: SPACING.XS }}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge">Select Category</Text>
              <IconButton
                icon="close"
                onPress={() => setModalVisible(false)}
              />
            </View>
            
            <Searchbar
              placeholder="Search categories..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.name}
                    description={item.description}
                    onPress={() => handleSelect(item)}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={value === item.id ? 'radiobox-marked' : 'radiobox-blank'}
                        color={value === item.id ? theme.colors.primary : theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      No categories found
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.MD,
    paddingBottom: SPACING.SM,
  },
  searchbar: {
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  loadingContainer: {
    padding: SPACING.XXL,
    alignItems: 'center',
  },
  emptyState: {
    padding: SPACING.XXL,
    alignItems: 'center',
  },
});
