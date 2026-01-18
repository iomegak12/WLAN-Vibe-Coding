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

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
 * Accepts refresh token from:
 * 1. Request body (refreshToken field)
 * 2. httpOnly cookie (refreshToken cookie)
 * If no token found, returns success (user already logged out)
 */
const logout = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    // If no refresh token, user is already logged out - return success
    if (!refreshToken) {
      logger.info('Logout requested with no refresh token - already logged out');
      
      // Clear cookie if it exists
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      return ResponseUtil.success(res, HTTP_STATUS.OK, null, 'Already logged out');
    }

    // Call auth service
    await authService.logout(refreshToken);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('Logout successful');

    return ResponseUtil.success(res, HTTP_STATUS.OK, null, MESSAGES.SUCCESS.LOGOUT);
  } catch (err) {
    logger.error('Logout controller error:', err);
    
    // Even if logout fails, clear the cookie and return success
    // This prevents issues where an invalid token blocks logout
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    return ResponseUtil.success(res, HTTP_STATUS.OK, null, 'Logged out (session cleared)');
  }
};

/**
 * Refresh Token Controller
 * POST /api/v1/auth/refresh
 * Accepts refresh token from body or httpOnly cookie
 */
const refresh = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return ResponseUtil.error(res, 401, 'Refresh token required', 'UNAUTHORIZED');
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Call auth service
    const tokens = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

    // Update refresh token cookie with new token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
