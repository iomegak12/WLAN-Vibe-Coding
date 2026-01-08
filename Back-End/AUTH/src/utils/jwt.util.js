const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../config/logger');

/**
 * JWT Utility Functions
 * Handles JWT token generation, verification, and decoding
 */

/**
 * Generate Access Token
 * @param {Object} payload - Token payload (userId, email, roleId)
 * @returns {String} - JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, jwtConfig.accessToken.secret, {
      expiresIn: jwtConfig.accessToken.expiresIn,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
    });
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Token payload (userId, email)
 * @returns {String} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(payload, jwtConfig.refreshToken.secret, {
      expiresIn: jwtConfig.refreshToken.expiresIn,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
    });
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify Access Token
 * @param {String} token - JWT access token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret, {
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired');
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token');
      throw new Error('Invalid access token');
    } else {
      logger.error('Error verifying access token:', error);
      throw new Error('Failed to verify access token');
    }
  }
};

/**
 * Verify Refresh Token
 * @param {String} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshToken.secret, {
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience,
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expired');
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid refresh token');
      throw new Error('Invalid refresh token');
    } else {
      logger.error('Error verifying refresh token:', error);
      throw new Error('Failed to verify refresh token');
    }
  }
};

/**
 * Decode Token (without verification)
 * @param {String} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
