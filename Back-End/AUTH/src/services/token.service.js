const RefreshToken = require('../models/RefreshToken.model');
const { verifyRefreshToken } = require('../utils/jwt.util');
const logger = require('../config/logger');
const { ERROR_CODES, MESSAGES } = require('../utils/constants');

/**
 * Token Service
 * Handles refresh token storage, validation, and revocation
 */

/**
 * Create Refresh Token
 * @param {String} userId - User ID
 * @param {String} token - Refresh token
 * @param {String} ipAddress - User IP address
 * @param {String} userAgent - User agent string
 * @returns {Promise<Object>} - Created token document
 */
const createRefreshToken = async (userId, token, ipAddress, userAgent) => {
  try {
    // Decode token to get expiry
    const decoded = verifyRefreshToken(token);
    const expiresAt = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds

    // Create refresh token document
    const refreshToken = new RefreshToken({
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    await refreshToken.save();
    logger.info(`Refresh token created for user: ${userId}`);
    return refreshToken;
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw error;
  }
};

/**
 * Validate Refresh Token
 * @param {String} token - Refresh token to validate
 * @returns {Promise<Object>} - Token document if valid
 * @throws {Error} - If token is invalid, expired, or revoked
 */
const validateRefreshToken = async (token) => {
  try {
    // Find token in database
    const tokenDoc = await RefreshToken.findOne({ token });

    if (!tokenDoc) {
      const error = new Error(MESSAGES.ERROR.TOKEN_INVALID);
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    // Check if token is revoked
    if (tokenDoc.isRevoked) {
      const error = new Error('Token has been revoked');
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    // Check if token is expired
    if (new Date() > tokenDoc.expiresAt) {
      const error = new Error('Token has expired');
      error.statusCode = 401;
      error.code = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    return tokenDoc;
  } catch (error) {
    logger.error('Error validating refresh token:', error);
    throw error;
  }
};

/**
 * Revoke Refresh Token
 * @param {String} token - Refresh token to revoke
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (token) => {
  try {
    const result = await RefreshToken.updateOne({ token }, { isRevoked: true });

    if (result.modifiedCount === 0) {
      logger.warn(`Refresh token not found or already revoked: ${token.substring(0, 20)}...`);
    } else {
      logger.info('Refresh token revoked successfully');
    }
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    throw error;
  }
};

/**
 * Revoke All User Tokens
 * @param {String} userId - User ID
 * @returns {Promise<void>}
 */
const revokeAllUserTokens = async (userId) => {
  try {
    const result = await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    logger.info(`Revoked ${result.modifiedCount} tokens for user: ${userId}`);
  } catch (error) {
    logger.error('Error revoking all user tokens:', error);
    throw error;
  }
};

/**
 * Clean Expired Tokens (for manual cleanup, though TTL index handles this automatically)
 * @returns {Promise<void>}
 */
const cleanExpiredTokens = async () => {
  try {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    logger.info(`Deleted ${result.deletedCount} expired tokens`);
  } catch (error) {
    logger.error('Error cleaning expired tokens:', error);
    throw error;
  }
};

module.exports = {
  createRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanExpiredTokens,
};
