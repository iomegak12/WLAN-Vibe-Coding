/**
 * Profile Service
 * API calls for user profile management
 * Phase 2: Profile Management
 */

import { authApi } from '../axiosInstance';
import { API_CONFIG } from '../../config/api.config';

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  try {
    const response = await authApi.get(API_CONFIG.AUTH.ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - { firstName, lastName, phone }
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await authApi.put(API_CONFIG.AUTH.ENDPOINTS.PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload profile image
 * @param {Object} imageFile - Image file from picker
 * @returns {Promise<Object>} Upload response with image URL
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'profile.jpg',
    });

    const response = await authApi.post(
      API_CONFIG.AUTH.ENDPOINTS.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete profile image
 * @returns {Promise<Object>} Delete response
 */
export const deleteProfileImage = async () => {
  try {
    const response = await authApi.delete(API_CONFIG.AUTH.ENDPOINTS.DELETE_IMAGE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<Object>} Change password response
 */
export const changePassword = async (userId, passwordData) => {
  try {
    const endpoint = API_CONFIG.AUTH.ENDPOINTS.CHANGE_PASSWORD.replace(':id', userId);
    const response = await authApi.patch(endpoint, passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
};
