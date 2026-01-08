const roleService = require('../services/role.service');
const ResponseUtil = require('../utils/response.util');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Role Controller
 * HTTP request handlers for role management
 */

/**
 * Create a new role
 * POST /api/v1/roles
 */
const createRole = async (req, res, next) => {
  try {
    const roleData = req.body;
    const createdBy = req.user.userId;

    const role = await roleService.createRole(roleData, createdBy);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.CREATED,
      role,
      MESSAGES.SUCCESS.ROLE_CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 * GET /api/v1/roles/:id
 */
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await roleService.getRoleById(id);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      role,
      'Role retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List all roles
 * GET /api/v1/roles
 */
const listRoles = async (req, res, next) => {
  try {
    const filters = req.query;

    const result = await roleService.listRoles(filters);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      result,
      'Roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 * PUT /api/v1/roles/:id
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.userId;

    const role = await roleService.updateRole(id, updateData, updatedBy);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      role,
      MESSAGES.SUCCESS.ROLE_UPDATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 * DELETE /api/v1/roles/:id
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await roleService.deleteRole(id);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      result,
      MESSAGES.SUCCESS.ROLE_DELETED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle role active status
 * PATCH /api/v1/roles/:id/toggle-status
 */
const toggleRoleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.userId;

    const role = await roleService.toggleRoleStatus(id, updatedBy);

    return ResponseUtil.success(
      res,
      HTTP_STATUS.OK,
      role,
      `Role ${role.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getRoleById,
  listRoles,
  updateRole,
  deleteRole,
  toggleRoleStatus,
};
