const userService = require('../services/user.service');
const ResponseUtil = require('../utils/response.util');
const logger = require('../config/logger');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 */

/**
 * Create User Controller
 * POST /api/v1/users
 */
const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const createdBy = req.user.userId; // From auth middleware

    const user = await userService.createUser(userData, createdBy);

    logger.info(`User created by ${req.user.email}: ${user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.CREATED, user, MESSAGES.SUCCESS.USER_CREATED);
  } catch (err) {
    logger.error('Create user controller error:', err);
    next(err);
  }
};

/**
 * Get User by ID Controller
 * GET /api/v1/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    return ResponseUtil.success(res, HTTP_STATUS.OK, user, 'User retrieved successfully');
  } catch (err) {
    logger.error('Get user controller error:', err);
    next(err);
  }
};

/**
 * List Users Controller
 * GET /api/v1/users
 */
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, roleId, isActive, sortBy, sortOrder } = req.query;

    const filters = { search, roleId, isActive };
    const result = await userService.listUsers(filters, page, limit, sortBy, sortOrder);

    return ResponseUtil.success(res, HTTP_STATUS.OK, result, 'Users retrieved successfully');
  } catch (err) {
    logger.error('List users controller error:', err);
    next(err);
  }
};

/**
 * Update User Controller
 * PUT /api/v1/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.userId;

    const user = await userService.updateUser(id, updateData, updatedBy);

    logger.info(`User updated by ${req.user.email}: ${user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, user, MESSAGES.SUCCESS.USER_UPDATED);
  } catch (err) {
    logger.error('Update user controller error:', err);
    next(err);
  }
};

/**
 * Delete User Controller
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    logger.info(`User deleted by ${req.user.email}: ${id}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, null, MESSAGES.SUCCESS.USER_DELETED);
  } catch (err) {
    logger.error('Delete user controller error:', err);
    next(err);
  }
};

/**
 * Change Password Controller
 * PATCH /api/v1/users/:id/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password unless they're admin
    if (id !== req.user.userId) {
      return ResponseUtil.error(
        res,
        HTTP_STATUS.FORBIDDEN,
        'FORBIDDEN',
        'You can only change your own password'
      );
    }

    await userService.changePassword(id, currentPassword, newPassword);

    logger.info(`Password changed for user: ${req.user.email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, null, MESSAGES.SUCCESS.PASSWORD_CHANGED);
  } catch (err) {
    logger.error('Change password controller error:', err);
    next(err);
  }
};

/**
 * Toggle User Status Controller
 * PATCH /api/v1/users/:id/toggle-status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.userId;

    // Users cannot toggle their own status
    if (id === req.user.userId) {
      return ResponseUtil.error(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        'You cannot toggle your own account status'
      );
    }

    const user = await userService.toggleUserStatus(id, updatedBy);

    logger.info(`User status toggled by ${req.user.email}: ${user.email} -> ${user.isActive}`);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      user,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    logger.error('Toggle user status controller error:', err);
    next(err);
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
