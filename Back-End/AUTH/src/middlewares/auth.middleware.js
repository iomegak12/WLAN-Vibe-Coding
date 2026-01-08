const { verifyAccessToken } = require('../utils/jwt.util');
const { ERROR_CODES, MESSAGES } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */

/**
 * Authenticate Middleware
 * Extracts and verifies JWT from Authorization header
 * Attaches decoded user data to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.TOKEN_MISSING,
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.TOKEN_MISSING,
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
    };

    logger.info(`User authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.TOKEN_EXPIRED,
      });
    } else if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_TOKEN,
      });
    } else {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_TOKEN,
      });
    }
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authenticate but doesn't fail if no token is provided
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user data
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
    };

    logger.info(`User optionally authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    // Token verification failed, but this is optional, so continue without user data
    logger.warn('Optional authentication failed:', error.message);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
