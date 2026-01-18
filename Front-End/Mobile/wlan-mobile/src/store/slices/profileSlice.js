/**
 * Profile Slice - Profile management state
 * Phase 2: Profile Management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../../api/services/profileService';
import { setUser } from './authSlice';
import Toast from 'react-native-toast-message';

const initialState = {
  loading: false,
  uploadingImage: false,
  updatingProfile: false,
  changingPassword: false,
  error: null,
  uploadProgress: 0,
};

/**
 * Fetch user profile
 */
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      
      // Update user in auth state
      if (response.data?.user) {
        dispatch(setUser(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk(
  'profile/update',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      
      // Update user in auth state
      if (response.data?.user) {
        dispatch(setUser(response.data.user));
      }
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
        position: 'top',
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to update profile';
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: message,
        position: 'top',
      });
      
      return rejectWithValue(message);
    }
  }
);

/**
 * Upload profile image
 */
export const uploadImage = createAsyncThunk(
  'profile/uploadImage',
  async (imageFile, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.uploadProfileImage(imageFile);
      
      // Fetch updated profile to get new image URL
      dispatch(fetchProfile());
      
      Toast.show({
        type: 'success',
        text1: 'Image Uploaded',
        text2: 'Your profile image has been updated',
        position: 'top',
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to upload image';
      
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: message,
        position: 'top',
      });
      
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete profile image
 */
export const deleteImage = createAsyncThunk(
  'profile/deleteImage',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.deleteProfileImage();
      
      // Fetch updated profile
      dispatch(fetchProfile());
      
      Toast.show({
        type: 'success',
        text1: 'Image Deleted',
        text2: 'Your profile image has been removed',
        position: 'top',
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to delete image';
      
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: message,
        position: 'top',
      });
      
      return rejectWithValue(message);
    }
  }
);

/**
 * Change password
 */
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const response = await profileService.changePassword(userId, passwordData);
      
      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully',
        position: 'top',
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to change password';
      
      Toast.show({
        type: 'error',
        text1: 'Change Failed',
        text2: message,
        position: 'top',
      });
      
      return rejectWithValue(message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.error = action.payload;
      })
      
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadImage.fulfilled, (state) => {
        state.uploadingImage = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      
      // Delete Image
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changingPassword = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changingPassword = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUploadProgress } = profileSlice.actions;

// Selectors
export const selectProfileLoading = (state) => state.profile.loading;
export const selectUploadingImage = (state) => state.profile.uploadingImage;
export const selectUpdatingProfile = (state) => state.profile.updatingProfile;
export const selectChangingPassword = (state) => state.profile.changingPassword;
export const selectProfileError = (state) => state.profile.error;
export const selectUploadProgress = (state) => state.profile.uploadProgress;

export default profileSlice.reducer;
