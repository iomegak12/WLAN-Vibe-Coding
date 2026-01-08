const User = require('../models/User.model');
const Role = require('../models/Role.model');
const { ERROR_CODES, MESSAGES, PAGINATION } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * User Service
 * Business logic for user management operations
 */

/**
 * Create User
 * @param {Object} userData - User data
 * @param {String} createdBy - ID of user creating this user
 * @returns {Promise<Object>} - Created user
 */
const createUser = async (userData, createdBy) => {
  try {
    const { firstName, lastName, email, password, phone, roleId } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error(MESSAGES.ERROR.EMAIL_EXISTS);
      error.statusCode = 400;
      error.code = ERROR_CODES.VALIDATION_ERROR;
      throw error;
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      roleId,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
    });

    await user.save();

    // Fetch user with role populated
    const createdUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`User created successfully: ${createdUser.email}`);

    return {
      id: createdUser._id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      phone: createdUser.phone,
      role: {
        id: createdUser.roleId._id,
        name: createdUser.roleId.roleName,
        permissions: createdUser.roleId.permissions,
      },
      isActive: createdUser.isActive,
      profileImage: createdUser.profileImage,
      lastLogin: createdUser.lastLogin,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  } catch (error) {
    logger.error('Create user error:', error);
    throw error;
  }
};

/**
 * Get User by ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate('roleId', 'roleName permissions')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
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
      createdBy: user.createdBy ? {
        id: user.createdBy._id,
        name: `${user.createdBy.firstName} ${user.createdBy.lastName}`,
        email: user.createdBy.email,
      } : null,
      updatedBy: user.updatedBy ? {
        id: user.updatedBy._id,
        name: `${user.updatedBy.firstName} ${user.updatedBy.lastName}`,
        email: user.updatedBy.email,
      } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    logger.error('Get user error:', error);
    throw error;
  }
};

/**
 * List Users
 * @param {Object} filters - Query filters (search, roleId, isActive)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @param {String} sortBy - Sort field
 * @param {String} sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} - Paginated user list
 */
const listUsers = async (filters = {}, page = 1, limit = PAGINATION.DEFAULT_LIMIT, sortBy = 'createdAt', sortOrder = 'desc') => {
  try {
    // Build query
    const query = {};

    // Search filter (email, firstName, lastName)
    if (filters.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Role filter
    if (filters.roleId) {
      query.roleId = filters.roleId;
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    // Count total documents
    const totalUsers = await User.countDocuments(query);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalUsers / limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch users
    const users = await User.find(query)
      .populate('roleId', 'roleName permissions')
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Transform users
    const transformedUsers = users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: {
        id: user.roleId._id,
        name: user.roleId.roleName,
      },
      isActive: user.isActive,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    logger.info(`Listed ${users.length} users (page ${page}/${totalPages})`);

    return {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('List users error:', error);
    throw error;
  }
};

/**
 * Update User
 * @param {String} userId - User ID
 * @param {Object} updateData - Update data
 * @param {String} updatedBy - ID of user performing update
 * @returns {Promise<Object>} - Updated user
 */
const updateUser = async (userId, updateData, updatedBy) => {
  try {
    const { firstName, lastName, phone, roleId } = updateData;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Verify role if provided
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
        error.statusCode = 404;
        error.code = ERROR_CODES.NOT_FOUND;
        throw error;
      }
      user.roleId = roleId;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    user.updatedBy = updatedBy;

    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`User updated successfully: ${updatedUser.email}`);

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
    logger.error('Update user error:', error);
    throw error;
  }
};

/**
 * Delete User
 * @param {String} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    await User.findByIdAndDelete(userId);
    logger.info(`User deleted successfully: ${user.email}`);
  } catch (error) {
    logger.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Change User Password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      const error = new Error(MESSAGES.ERROR.INCORRECT_PASSWORD);
      error.statusCode = 400;
      error.code = ERROR_CODES.VALIDATION_ERROR;
      throw error;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed successfully for user: ${user.email}`);
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};

/**
 * Toggle User Status (Activate/Deactivate)
 * @param {String} userId - User ID
 * @param {String} updatedBy - ID of user performing action
 * @returns {Promise<Object>} - Updated user
 */
const toggleUserStatus = async (userId, updatedBy) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error(MESSAGES.ERROR.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Toggle status
    user.isActive = !user.isActive;
    user.updatedBy = updatedBy;
    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findById(user._id)
      .populate('roleId', 'roleName permissions')
      .select('-password');

    logger.info(`User status toggled to ${updatedUser.isActive} for user: ${updatedUser.email}`);

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
    logger.error('Toggle user status error:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
  changePassword,
  toggleUserStatus,
};
