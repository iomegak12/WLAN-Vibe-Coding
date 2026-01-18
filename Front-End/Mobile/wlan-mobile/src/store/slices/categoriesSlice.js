/**
 * Categories Slice - State management for categories and subcategories
 * Phase 3: Categories & Subcategories Management
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as categoryService from '../../api/services/categoryService';

const initialState = {
  categories: [],
  subcategories: [],
  subcategoriesByCategory: {}, // Cache subcategories by category_id
  selectedCategory: null,
  selectedSubcategory: null,
  loading: false,
  error: null,
  lastFetched: null, // Timestamp for cache invalidation
};

/**
 * Fetch all categories
 */
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch categories';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch category by ID
 */
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(categoryId);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch category';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch all subcategories or filter by category
 */
export const fetchSubcategories = createAsyncThunk(
  'categories/fetchSubcategories',
  async (categoryId = null, { rejectWithValue }) => {
    try {
      const response = await categoryService.getSubcategories(categoryId);
      return {
        data: response.data,
        categoryId,
      };
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch subcategories';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch subcategory by ID
 */
export const fetchSubcategoryById = createAsyncThunk(
  'categories/fetchSubcategoryById',
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getSubcategoryById(subcategoryId);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch subcategory';
      return rejectWithValue(message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      // Clear selected subcategory when category changes
      state.selectedSubcategory = null;
    },
    setSelectedSubcategory: (state, action) => {
      state.selectedSubcategory = action.payload;
    },
    clearSelection: (state) => {
      state.selectedCategory = null;
      state.selectedSubcategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Clear cache (call on logout)
    clearCache: (state) => {
      state.categories = [];
      state.subcategories = [];
      state.subcategoriesByCategory = {};
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both data.items and data.categories response structures
        state.categories = action.payload.items || action.payload.categories || action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.category || action.payload.item || action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        const { data, categoryId } = action.payload;
        // Handle both data.items and data.subcategories response structures
        const subcategories = data.items || data.subcategories || data;
        
        state.subcategories = subcategories;
        
        // Cache by category if filtered
        if (categoryId) {
          state.subcategoriesByCategory[categoryId] = subcategories;
        }
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Subcategory by ID
      .addCase(fetchSubcategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubcategory = action.payload.subcategory || action.payload.item || action.payload;
      })
      .addCase(fetchSubcategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  setSelectedSubcategory,
  clearSelection,
  clearError,
  clearCache,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectSubcategories = (state) => state.categories.subcategories;
export const selectSubcategoriesByCategoryCache = (state) => state.categories.subcategoriesByCategory;
export const selectSelectedCategory = (state) => state.categories.selectedCategory;
export const selectSelectedSubcategory = (state) => state.categories.selectedSubcategory;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectCategoriesError = (state) => state.categories.error;
export const selectLastFetched = (state) => state.categories.lastFetched;

// Memoized selector for subcategories by category
export const selectSubcategoriesByCategory = createSelector(
  [selectSubcategoriesByCategoryCache, (state, categoryId) => categoryId],
  (subcategoriesCache, categoryId) => subcategoriesCache[categoryId] || []
);

// Helper to check if cache is valid (5 minutes)
export const selectIsCacheValid = (state) => {
  const lastFetched = state.categories.lastFetched;
  if (!lastFetched) return false;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastFetched < fiveMinutes;
};

export default categoriesSlice.reducer;
