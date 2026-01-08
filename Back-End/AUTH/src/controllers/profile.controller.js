const profileService = require('../services/profile.service');
const ResponseUtil = require('../utils/response.util');
const logger = require('../config/logger');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * Profile Controller
 * Handles HTTP requests for profile endpoints
 */

/**
 * Get Profile Controller
 * GET /api/v1/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const profile = await profileService.getProfile(userId);

    return ResponseUtil.success(res, HTTP_STATUS.OK, profile, 'Profile retrieved successfully');
  } catch (err) {
    logger.error('Get profile controller error:', err);
    next(err);
  }
};

/**
 * Update Profile Controller
 * PUT /api/v1/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const profile = await profileService.updateProfile(userId, updateData);

    logger.info(`Profile updated for user: ${req.user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, profile, MESSAGES.SUCCESS.PROFILE_UPDATED);
  } catch (err) {
    logger.error('Update profile controller error:', err);
    next(err);
  }
};

/**
 * Upload Profile Image Controller
 * POST /api/v1/profile/upload-image
 */
const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Check if file was uploaded
    if (!req.file) {
      return ResponseUtil.error(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        'No file uploaded. Please select an image file.'
      );
    }

    const filename = req.file.filename;
    const profile = await profileService.uploadProfileImage(userId, filename);

    logger.info(`Profile image uploaded for user: ${req.user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, profile, MESSAGES.SUCCESS.FILE_UPLOADED);
  } catch (err) {
    logger.error('Upload profile image controller error:', err);
    next(err);
  }
};

/**
 * Delete Profile Image Controller
 * DELETE /api/v1/profile/delete-image
 */
const deleteProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const profile = await profileService.deleteProfileImage(userId);

    logger.info(`Profile image deleted for user: ${req.user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, profile, 'Profile image deleted successfully');
  } catch (err) {
    logger.error('Delete profile image controller error:', err);
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
};
