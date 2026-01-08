const User = require('../models/User.model');
const { deleteFile } = require('../middlewares/upload.middleware');
const emailConfig = require('../config/email');
const { ERROR_CODES, MESSAGES, EMAIL_SUBJECTS } = require('../utils/constants');
const logger = require('../config/logger');
const path = require('path');

/**
 * Profile Service
 * Business logic for user profile operations
 */

/**
 * Get User Profile
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - User profile data
 */
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: {
        id: user.roleId._id,
        name: user.roleId.roleName,
        permissions: user.roleId.permissions,
      },
      isActive: user.isActive,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update User Profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Update data (firstName, lastName, phone)
 * @returns {Promise<Object>} - Updated user profile
 */
const updateProfile = async (userId, updateData) => {
  try {
    const { firstName, lastName, phone } = updateData;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    user.updatedBy = userId; // Self-update

    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`Profile updated for user: ${updatedUser.email}`);

    // Send email notification
    try {
      await emailConfig.sendMail({
        to: updatedUser.email,
        subject: EMAIL_SUBJECTS.PROFILE_UPDATED,
        html: `
        <h2>Profile Updated</h2>
        <p>Hi ${updatedUser.firstName},</p>
        <p>Your profile has been updated successfully.</p>
        <p><strong>Updated Information:</strong></p>
        <ul>
          <li>Name: ${updatedUser.firstName} ${updatedUser.lastName}</li>
          <li>Phone: ${updatedUser.phone || 'Not provided'}</li>
        </ul>
        <p>If you didn't make this change, please contact support immediately.</p>
        <br>
        <p>Best regards,<br>WLAN Corporation Team</p>
        `
      });
    } catch (emailError) {
      logger.error('Failed to send profile update email:', emailError);
      // Don't throw error, profile update succeeded
    }

    return {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: {
        id: updatedUser.roleId._id,
        name: updatedUser.roleId.roleName,
        permissions: updatedUser.roleId.permissions,
      },
      isActive: updatedUser.isActive,
      profileImage: updatedUser.profileImage,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Upload Profile Image
 * @param {String} userId - User ID
 * @param {String} filename - Uploaded file name
 * @returns {Promise<Object>} - Updated user profile
 */
const uploadProfileImage = async (userId, filename) => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      // Delete uploaded file if user not found
      deleteFile(filename);
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldFilename = path.basename(user.profileImage);
      deleteFile(oldFilename);
    }

    // Update profile image path
    user.profileImage = filename;
    user.updatedBy = userId;
    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`Profile image uploaded for user: ${updatedUser.email}`);

    return {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: {
        id: updatedUser.roleId._id,
        name: updatedUser.roleId.roleName,
        permissions: updatedUser.roleId.permissions,
      },
      isActive: updatedUser.isActive,
      profileImage: updatedUser.profileImage,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Upload profile image error:', error);
    throw error;
  }
};

/**
 * Delete Profile Image
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Updated user profile
 */
const deleteProfileImage = async (userId) => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      const filename = path.basename(user.profileImage);
      deleteFile(filename);
    }

    // Remove profile image reference
    user.profileImage = null;
    user.updatedBy = userId;
    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`Profile image deleted for user: ${updatedUser.email}`);

    return {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: {
        id: updatedUser.roleId._id,
        name: updatedUser.roleId.roleName,
        permissions: updatedUser.roleId.permissions,
      },
      isActive: updatedUser.isActive,
      profileImage: updatedUser.profileImage,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Delete profile image error:', error);
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
};
