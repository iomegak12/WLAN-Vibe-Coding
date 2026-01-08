const { PERMISSIONS, ERROR_CODES } = require('../utils/constants');
const ResponseUtil = require('../utils/response.util');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Authorization Middleware
 * Checks if authenticated user has required permissions
 */

/**
 * Authorize Middleware
 * @param {Array<String>} requiredPermissions - Array of required permissions
 * @returns {Function} - Express middleware
 */
const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authenticate middleware)
      if (!req.user) {
        logger.warn('Authorization failed: User not authenticated');
        return ResponseUtil.error(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required'
        );
      }

      // Get user's role with permissions
      const User = require('../models/User.model');
      const user = await User.findById(req.user.userId)
        .populate('roleId', 'roleName permissions')
        .select('isActive');

      if (!user || !user.isActive) {
        logger.warn(`Authorization failed: User ${req.user.userId} not found or inactive`);
        return ResponseUtil.error(
          res,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
          'Access denied'
        );
      }

      const userPermissions = user.roleId.permissions || [];

      // Check for wildcard permission (Super Admin)
      if (userPermissions.includes(PERMISSIONS.ALL)) {
        logger.info(`User ${user.roleId.roleName} has wildcard permission`);
        return next();
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn(
          `Authorization failed: User ${req.user.email} missing permissions`,
          {
            required: requiredPermissions,
            userPermissions,
          }
        );
        return ResponseUtil.error(
          res,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
          "You don't have permission to perform this action"
        );
      }

      // User has required permissions
      logger.info(`User ${req.user.email} authorized for action`);
      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      return ResponseUtil.error(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.SERVER_ERROR,
        'Authorization check failed'
      );
    }
  };
};

/**
 * Check if user has any of the required permissions
 * @param {Array<String>} permissions - Array of permissions (user needs at least one)
 * @returns {Function} - Express middleware
 */
const authorizeAny = (permissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ResponseUtil.error(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required'
        );
      }

      const User = require('../models/User.model');
      const user = await User.findById(req.user.userId)
        .populate('roleId', 'roleName permissions')
        .select('isActive');

      if (!user || !user.isActive) {
        return ResponseUtil.error(
          res,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
          'Access denied'
        );
      }

      const userPermissions = user.roleId.permissions || [];

      // Check for wildcard permission
      if (userPermissions.includes(PERMISSIONS.ALL)) {
        return next();
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = permissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        logger.warn(`Authorization failed: User ${req.user.email} missing any required permissions`);
        return ResponseUtil.error(
          res,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
          "You don't have permission to perform this action"
        );
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      return ResponseUtil.error(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.SERVER_ERROR,
        'Authorization check failed'
      );
    }
  };
};

module.exports = {
  authorize,
  authorizeAny,
};
