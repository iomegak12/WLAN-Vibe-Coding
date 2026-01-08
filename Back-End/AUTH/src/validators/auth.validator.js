const Joi = require('joi');
const { REGEX, PASSWORD_CONFIG } = require('../utils/constants');

/**
 * Authentication Validation Schemas
 * Joi schemas for validating authentication requests
 */

/**
 * Login Validation Schema
 */
const loginSchema = Joi.object({
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
    .required()
    .messages({
      'string.min': `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`,
      'any.required': 'Password is required',
    }),
});

/**
 * Refresh Token Validation Schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
      'string.empty': 'Refresh token cannot be empty',
    }),
});

/**
 * Logout Validation Schema
 */
const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Refresh token cannot be empty',
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
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
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

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

module.exports = {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  validate,
};
