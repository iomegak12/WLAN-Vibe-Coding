const authService = require('../services/auth.service');
const ResponseUtil = require('../utils/response.util');
const logger = require('../config/logger');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Login Controller
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Call auth service
    const result = await authService.login(email, password, ipAddress, userAgent);

    logger.info(`Login successful for user: ${email}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, result, MESSAGES.SUCCESS.LOGIN);
  } catch (err) {
    logger.error('Login controller error:', err);
    next(err);
  }
};

/**
 * Logout Controller
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Call auth service
    await authService.logout(refreshToken);

    logger.info('Logout successful');

    return ResponseUtil.success(res, HTTP_STATUS.OK, null, MESSAGES.SUCCESS.LOGOUT);
  } catch (err) {
    logger.error('Logout controller error:', err);
    next(err);
  }
};

/**
 * Refresh Token Controller
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Call auth service
    const tokens = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

    logger.info('Token refresh successful');

    return ResponseUtil.success(res, HTTP_STATUS.OK, tokens, MESSAGES.SUCCESS.TOKEN_REFRESHED);
  } catch (err) {
    logger.error('Refresh token controller error:', err);
    next(err);
  }
};

/**
 * Verify Token Controller
 * GET /api/v1/auth/verify
 * Requires authentication middleware
 */
const verify = async (req, res, next) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Call auth service
    const result = await authService.verifyToken(userId);

    logger.info(`Token verification successful for user: ${userId}`);

    return ResponseUtil.success(res, HTTP_STATUS.OK, result, 'Token is valid');
  } catch (err) {
    logger.error('Verify token controller error:', err);
    next(err);
  }
};

module.exports = {
  login,
  logout,
  refresh,
  verify,
};
