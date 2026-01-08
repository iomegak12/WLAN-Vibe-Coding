const { HTTP_STATUS } = require('./constants');

/**
 * Response Utility
 * Standardized response format for all API endpoints
 */

class ResponseUtil {
  /**
   * Success Response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {Object} data - Response data
   * @param {String} message - Success message
   */
  static success(res, statusCode = HTTP_STATUS.OK, data = null, message = 'Success') {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error Response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} code - Error code
   * @param {String} message - Error message
   * @param {Object} details - Additional error details
   */
  static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = 'SERVER_ERROR', message = 'An error occurred', details = null) {
    const response = {
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated Response
   * @param {Object} res - Express response object
   * @param {Array} items - Array of items
   * @param {Number} page - Current page number
   * @param {Number} limit - Items per page
   * @param {Number} totalItems - Total number of items
   * @param {String} message - Success message
   */
  static paginated(res, items, page, limit, totalItems, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(totalItems / limit);
    
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * No Content Response
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Validation Error Response
   * @param {Object} res - Express response object
   * @param {Object} errors - Validation errors object
   */
  static validationError(res, errors) {
    return this.error(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      'Validation failed',
      errors
    );
  }

  /**
   * Unauthorized Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      'UNAUTHORIZED',
      message
    );
  }

  /**
   * Forbidden Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(
      res,
      HTTP_STATUS.FORBIDDEN,
      'FORBIDDEN',
      message
    );
  }

  /**
   * Not Found Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(
      res,
      HTTP_STATUS.NOT_FOUND,
      'NOT_FOUND',
      message
    );
  }

  /**
   * Conflict Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(
      res,
      HTTP_STATUS.CONFLICT,
      'CONFLICT',
      message
    );
  }

  /**
   * Server Error Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static serverError(res, message = 'Internal server error') {
    return this.error(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'SERVER_ERROR',
      message
    );
  }

  /**
   * Rate Limit Response
   * @param {Object} res - Express response object
   */
  static rateLimitExceeded(res) {
    return this.error(
      res,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests from this IP, please try again later.'
    );
  }
}

module.exports = ResponseUtil;
