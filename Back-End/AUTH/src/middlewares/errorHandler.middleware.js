const logger = require('../config/logger');
const ResponseUtil = require('../utils/response.util');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    
    return ResponseUtil.validationError(res, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `A record with this ${field} already exists`;
    
    return ResponseUtil.error(
      res,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT,
      message
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return ResponseUtil.error(
      res,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      'Invalid ID format'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.error(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN,
      'Invalid token'
    );
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.error(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.EXPIRED_TOKEN,
      'Token has expired'
    );
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseUtil.error(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.FILE_TOO_LARGE,
        'File size exceeds the maximum limit'
      );
    }
    
    return ResponseUtil.error(
      res,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.FILE_UPLOAD_ERROR,
      err.message
    );
  }

  // Custom application errors (with statusCode and code properties)
  if (err.statusCode && err.code) {
    return ResponseUtil.error(
      res,
      err.statusCode,
      err.code,
      err.message,
      err.details || null
    );
  }

  // Default server error
  return ResponseUtil.serverError(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  );
};

/**
 * 404 Not Found Handler
 * Handles requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
  ResponseUtil.error(
    res,
    HTTP_STATUS.NOT_FOUND,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl}`
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
