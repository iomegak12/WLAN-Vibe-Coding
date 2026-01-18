const User = require('../models/User.model');
const RefreshToken = require('../models/RefreshToken.model');
const Role = require('../models/Role.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const tokenService = require('./token.service');
const logger = require('../config/logger');
const { ERROR_CODES, MESSAGES } = require('../utils/constants');

/**
 * Authentication Service
 * Handles user authentication, token generation, and session management
 */

/**
 * Login User
 * @param {String} email - User email
 * @param {String} password - User password
 * @param {String} ipAddress - User IP address
 * @param {String} userAgent - User agent string
 * @returns {Promise<Object>} - User data with tokens
 */
const login = async (email, password, ipAddress, userAgent) => {
  try {
    // Find user by email (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('roleId', 'roleName permissions');

    if (!user) {
      const error = new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error(MESSAGES.ERROR.ACCOUNT_INACTIVE);
      error.statusCode = 403;
      error.code = ERROR_CODES.FORBIDDEN;
      throw error;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      roleId: user.roleId._id,
      roleName: user.roleId.roleName,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    // Store refresh token in database
    await tokenService.createRefreshToken(user._id, refreshToken, ipAddress, userAgent);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in successfully: ${user.email}`);

    // Return user data with tokens
    return {
      user: {
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
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout User
 * @param {String} refreshToken - Refresh token to revoke (optional)
 * @param {String} userId - User ID (optional, for revoking all tokens)
 * @returns {Promise<void>}
 */
const logout = async (refreshToken, userId = null) => {
  try {
    if (refreshToken) {
      // Revoke specific refresh token
      await tokenService.revokeRefreshToken(refreshToken);
      logger.info(`User logged out successfully`);
    } else if (userId) {
      // Revoke all user tokens (logout from all devices)
      await tokenService.revokeAllUserTokens(userId);
      logger.info(`All tokens revoked for user: ${userId}`);
    } else {
      // No token or userId provided - this is OK, user is already logged out
      logger.info('Logout called with no token or userId - no action needed');
    }
  } catch (error) {
    logger.error('Logout error:', error);
    // Don't throw error for logout - log it and continue
    // User should always be able to logout even if token is invalid
  }
};

/**
 * Refresh Access Token
 * @param {String} refreshToken - Refresh token
 * @param {String} ipAddress - User IP address
 * @param {String} userAgent - User agent string
 * @returns {Promise<Object>} - New access token and refresh token
 */
const refreshTokens = async (refreshToken, ipAddress, userAgent) => {
  try {
    // Verify refresh token JWT
    const decoded = verifyRefreshToken(refreshToken);

    // Validate refresh token in database
    const tokenDoc = await tokenService.validateRefreshToken(refreshToken);

    // Get user with role
    const user = await User.findById(decoded.userId).populate('roleId', 'roleName permissions');

    if (!user || !user.isActive) {
      const error = new Error(MESSAGES.ERROR.TOKEN_INVALID);
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      roleId: user.roleId._id,
      roleName: user.roleId.roleName,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    // Revoke old refresh token and store new one
    await tokenService.revokeRefreshToken(refreshToken);
    await tokenService.createRefreshToken(user._id, newRefreshToken, ipAddress, userAgent);

    logger.info(`Tokens refreshed successfully for user: ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw error;
  }
};

/**
 * Verify Access Token
 * @param {String} userId - User ID from verified JWT
 * @returns {Promise<Object>} - User data
 */
const verifyToken = async (userId) => {
  try {
    // Get user with role
    const user = await User.findById(userId).populate('roleId', 'roleName permissions');

    if (!user || !user.isActive) {
      const error = new Error(MESSAGES.ERROR.TOKEN_INVALID);
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    return {
      user: {
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
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
      },
    };
  } catch (error) {
    logger.error('Verify token error:', error);
    throw error;
  }
};

module.exports = {
  login,
  logout,
  refreshTokens,
  verifyToken,
};
