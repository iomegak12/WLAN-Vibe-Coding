const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Hashing Utility Functions
 * Handles password hashing, comparison, and token hashing
 */

/**
 * Hash Password
 * @param {String} password - Plain text password
 * @returns {Promise<String>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare Password
 * @param {String} plainPassword - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} - True if passwords match, false otherwise
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

/**
 * Hash Token (for secure token storage)
 * @param {String} token - Token to hash
 * @returns {String} - SHA256 hashed token
 */
const hashToken = (token) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken;
  } catch (error) {
    logger.error('Error hashing token:', error);
    throw new Error('Failed to hash token');
  }
};

/**
 * Generate Random Token
 * @param {Number} length - Token length in bytes (default: 32)
 * @returns {String} - Random hex token
 */
const generateRandomToken = (length = 32) => {
  try {
    const token = crypto.randomBytes(length).toString('hex');
    return token;
  } catch (error) {
    logger.error('Error generating random token:', error);
    throw new Error('Failed to generate random token');
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  hashToken,
  generateRandomToken,
};
