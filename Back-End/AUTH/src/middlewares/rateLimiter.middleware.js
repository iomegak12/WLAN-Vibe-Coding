const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_CONFIG } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting number of requests per IP
 */

/**
 * General Rate Limiter
 * Applied to all API routes (except health checks)
 */
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => {
    // Skip rate limiting if disabled in config
    return process.env.RATE_LIMIT_ENABLED !== 'true';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Strict Rate Limiter (for authentication endpoints)
 * More restrictive to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if disabled in config
    return process.env.RATE_LIMIT_ENABLED !== 'true';
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again later.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Create Custom Rate Limiter
 * @param {Number} windowMs - Time window in milliseconds
 * @param {Number} max - Maximum requests per window
 * @param {String} message - Error message
 * @returns {Function} - Rate limiter middleware
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return process.env.RATE_LIMIT_ENABLED !== 'true';
    },
    handler: (req, res) => {
      logger.warn(`Custom rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message,
        retryAfter: req.rateLimit.resetTime,
      });
    },
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  createRateLimiter,
};
