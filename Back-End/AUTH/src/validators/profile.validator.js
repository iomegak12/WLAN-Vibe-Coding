const Joi = require('joi');
const { REGEX } = require('../utils/constants');

/**
 * Profile Validation Schemas
 * Joi schemas for validating profile requests
 */

/**
 * Update Profile Validation Schema
 */
const updateProfileSchema = Joi.object({
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
      'string.pattern.base': 'Please provide a valid phone number in international format (e.g., +1234567890)',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
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

module.exports = {
  updateProfileSchema,
  validate,
};
