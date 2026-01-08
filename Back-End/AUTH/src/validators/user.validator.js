const Joi = require('joi');
const { REGEX, PASSWORD_CONFIG, PAGINATION } = require('../utils/constants');

/**
 * User Validation Schemas
 * Joi schemas for validating user management requests
 */

/**
 * Create User Validation Schema
 */
const createUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(PASSWORD_CONFIG.MIN_LENGTH)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
      'string.pattern.base': 'Password must contain at least one uppercase, lowercase, number and special character',
      'any.required': 'Password is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(REGEX.PHONE)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number in international format (e.g., +1234567890)',
    }),
  roleId: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required',
    }),
});

/**
 * Update User Validation Schema
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  phone: Joi.string()
    .trim()
    .pattern(REGEX.PHONE)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number in international format',
    }),
  roleId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Role ID cannot be empty',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Change Password Validation Schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(PASSWORD_CONFIG.MIN_LENGTH)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': `New password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
      'string.pattern.base': 'New password must contain at least one uppercase, lowercase, number and special character',
      'any.required': 'New password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required',
    }),
});

/**
 * Query Parameters Validation Schema (for list users)
 */
const listUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': `Limit cannot exceed ${PAGINATION.MAX_LIMIT}`,
    }),
  search: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Search must be a string',
    }),
  roleId: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Role ID must be a string',
    }),
  isActive: Joi.string()
    .valid('true', 'false')
    .optional()
    .allow('')
    .messages({
      'any.only': 'isActive must be either "true" or "false"',
    }),
  sortBy: Joi.string()
    .valid('firstName', 'lastName', 'email', 'createdAt', 'updatedAt', 'lastLogin')
    .default('createdAt')
    .messages({
      'any.only': 'Invalid sort field',
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
});

/**
 * User ID Parameter Validation Schema
 */
const userIdParamSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required',
    }),
});

/**
 * Validate Request Body
 * @param {Object} schema - Joi schema
 * @returns {Function} - Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validate Query Parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} - Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Validate Route Parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} - Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  userIdParamSchema,
  validate,
  validateQuery,
  validateParams,
};
