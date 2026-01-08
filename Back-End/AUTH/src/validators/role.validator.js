const Joi = require('joi');
const { HTTP_STATUS } = require('../utils/constants');
const ResponseUtil = require('../utils/response.util');

/**
 * Role Validators
 * Joi schemas for role request validation
 */

// Create role schema
const createRoleSchema = Joi.object({
  roleName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'Role name is required',
      'string.min': 'Role name must be at least 2 characters',
      'string.max': 'Role name must not exceed 50 characters',
      'any.required': 'Role name is required',
    }),
  permissions: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one permission is required',
      'any.required': 'Permissions are required',
    }),
});

// Update role schema
const updateRoleSchema = Joi.object({
  roleName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'Role name must be at least 2 characters',
      'string.max': 'Role name must not exceed 50 characters',
    }),
  permissions: Joi.array()
    .items(Joi.string())
    .min(1)
    .messages({
      'array.min': 'At least one permission is required',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// List roles query schema
const listRolesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').trim(),
  isActive: Joi.string().valid('true', 'false'),
  sortBy: Joi.string().valid('roleName', 'createdAt', 'updatedAt').default('roleName'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// Role ID param schema
const roleIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid role ID format',
      'any.required': 'Role ID is required',
    }),
});

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {String} source - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return ResponseUtil.validationError(res, errors);
    }

    req[source] = value;
    next();
  };
};

// Middleware exports
const validateCreateRole = validate(createRoleSchema, 'body');
const validateUpdateRole = validate(updateRoleSchema, 'body');
const validateListRolesQuery = validate(listRolesQuerySchema, 'query');
const validateRoleIdParam = validate(roleIdParamSchema, 'params');

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  listRolesQuerySchema,
  roleIdParamSchema,
  validateCreateRole,
  validateUpdateRole,
  validateListRolesQuery,
  validateRoleIdParam,
};
