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
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.MISSING_TOKEN,
        message: 'No authentication token provided',
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        code: ERROR_CODES.MISSING_TOKEN,
        message: 'No authentication token provided',
      });
    }

    // Verify token (synchronous operation)
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
    logger.error('Authentication error:', error.message);

    // Determine appropriate error response
    let errorMessage = MESSAGES.ERROR.TOKEN_INVALID;
    let errorCode = ERROR_CODES.INVALID_TOKEN;
    
    if (error.message === 'Access token expired') {
      errorMessage = 'Access token has expired';
      errorCode = ERROR_CODES.EXPIRED_TOKEN;
    } else if (error.message === 'Invalid access token') {
      errorMessage = MESSAGES.ERROR.TOKEN_INVALID;
      errorCode = ERROR_CODES.INVALID_TOKEN;
    }

    return res.status(401).json({
      success: false,
      code: errorCode,
      message: errorMessage,
    });
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authenticate but doesn't fail if no token is provided
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 */
const optionalAuthenticate = (req, res, next) => {
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
