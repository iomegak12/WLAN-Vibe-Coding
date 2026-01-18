/**
 * SubCategory Picker - Searchable dropdown for subcategory selection
 * Phase 3: Categories & Subcategories Management
 * Dependent on category selection
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
  fetchSubcategories,
  selectSubcategories,
  selectSubcategoriesByCategory,
  selectCategoriesLoading,
} from '../../store/slices/categoriesSlice';
import { SPACING } from '../../theme/theme';

export default function SubCategoryPicker({ 
  value, 
  onValueChange, 
  categoryId, // Required: parent category ID
  error, 
  disabled = false,
  label = 'Subcategory',
  placeholder = 'Select a subcategory',
}) {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const subcategories = useSelector((state) => 
    categoryId ? selectSubcategoriesByCategory(state, categoryId) : selectSubcategories(state)
  );
  const loading = useSelector(selectCategoriesLoading);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const subcategoriesList = Array.isArray(subcategories) ? subcategories : [];

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchSubcategories(categoryId));
    }
  }, [dispatch, categoryId]);

  const filteredSubcategories = subcategoriesList.filter((subcategory) =>
    subcategory.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSubcategory = subcategoriesList.find(sub => sub.id === value);

  const handleSelect = (subcategory) => {
    onValueChange(subcategory.id);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onValueChange(null);
  };

  const isDisabled = disabled || !categoryId;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => !isDisabled && setModalVisible(true)}
        disabled={isDisabled}
      >
        <TextInput
          label={label}
          value={selectedSubcategory?.name || ''}
          placeholder={!categoryId ? 'Select a category first' : placeholder}
          editable={false}
          mode="outlined"
          right={
            value ? (
              <TextInput.Icon
                icon="close"
                onPress={handleClear}
                disabled={isDisabled}
              />
            ) : (
              <TextInput.Icon icon="chevron-down" disabled={isDisabled} />
            )
          }
          error={!!error}
          disabled={isDisabled}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </TouchableOpacity>
      
      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: SPACING.XS }}>
          {error}
        </Text>
      )}

      {!categoryId && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: SPACING.XS }}>
          Please select a category first
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
              <Text variant="titleLarge">Select Subcategory</Text>
              <IconButton
                icon="close"
                onPress={() => setModalVisible(false)}
              />
            </View>
            
            <Searchbar
              placeholder="Search subcategories..."
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
                data={filteredSubcategories}
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
                      No subcategories found
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
