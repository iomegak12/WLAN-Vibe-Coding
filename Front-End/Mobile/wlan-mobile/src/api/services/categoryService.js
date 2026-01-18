/**
 * Category Service - API calls for categories and subcategories
 * Phase 3: Categories & Subcategories Management
 */

import { pmsApi } from '../axiosInstance';
import { API_CONFIG } from '../../config/api.config';

/**
 * Get all categories
 * @returns {Promise} Category list
 */
export const getCategories = async () => {
  try {
    const response = await pmsApi.get(API_CONFIG.PMS.ENDPOINTS.CATEGORIES);
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise} Category details
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await pmsApi.get(`${API_CONFIG.PMS.ENDPOINTS.CATEGORIES}/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Get category error:', error);
    throw error;
  }
};

/**
 * Get all subcategories or filter by category
 * @param {string} categoryId - Optional category ID to filter
 * @returns {Promise} Subcategory list
 */
export const getSubcategories = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `${API_CONFIG.PMS.ENDPOINTS.SUBCATEGORIES}?category_id=${categoryId}`
      : API_CONFIG.PMS.ENDPOINTS.SUBCATEGORIES;
    
    const response = await pmsApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Get subcategories error:', error);
    throw error;
  }
};

/**
 * Get subcategory by ID
 * @param {string} subcategoryId - Subcategory ID
 * @returns {Promise} Subcategory details
 */
export const getSubcategoryById = async (subcategoryId) => {
  try {
    const response = await pmsApi.get(`${API_CONFIG.PMS.ENDPOINTS.SUBCATEGORIES}/${subcategoryId}`);
    return response.data;
  } catch (error) {
    console.error('Get subcategory error:', error);
    throw error;
  }
};
