const Role = require('../models/Role.model');
const User = require('../models/User.model');
const { ERROR_CODES, MESSAGES, PAGINATION } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Role Service
 * Business logic for role management operations
 */

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @param {String} createdBy - User ID creating the role
 * @returns {Object} Created role
 */
const createRole = async (roleData, createdBy) => {
  const { roleName, permissions } = roleData;

  // Check if role already exists
  const existingRole = await Role.findOne({ 
    roleName: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  if (existingRole) {
    const error = new Error(MESSAGES.ERROR.ROLE_ALREADY_EXISTS);
    error.code = ERROR_CODES.DUPLICATE_ENTRY;
    throw error;
  }

  // Create new role
  const role = new Role({
    roleName,
    permissions,
    createdBy,
    updatedBy: createdBy,
  });

  await role.save();

  logger.info(`Role created: ${role.roleName} by user ${createdBy}`);
  return role;
};

/**
 * Get role by ID
 * @param {String} roleId - Role ID
 * @returns {Object} Role details
 */
const getRoleById = async (roleId) => {
  const role = await Role.findById(roleId)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!role) {
    const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
    error.code = ERROR_CODES.NOT_FOUND;
    throw error;
  }

  return role;
};

/**
 * List all roles with pagination and filters
 * @param {Object} filters - Filter criteria
 * @returns {Object} Paginated roles list
 */
const listRoles = async (filters = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = '',
    isActive,
    sortBy = 'roleName',
    sortOrder = 'asc',
  } = filters;

  const query = {};

  // Search by role name
  if (search) {
    query.roleName = { $regex: search, $options: 'i' };
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Execute query
  const [roles, total] = await Promise.all([
    Role.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email'),
    Role.countDocuments(query),
  ]);

  logger.info(`Listed ${roles.length} roles (Total: ${total})`);

  return {
    roles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update role
 * @param {String} roleId - Role ID
 * @param {Object} updateData - Data to update
 * @param {String} updatedBy - User ID updating the role
 * @returns {Object} Updated role
 */
const updateRole = async (roleId, updateData, updatedBy) => {
  const { roleName, permissions } = updateData;

  const role = await Role.findById(roleId);

  if (!role) {
    const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
    error.code = ERROR_CODES.NOT_FOUND;
    throw error;
  }

  // Check if new role name conflicts with existing role
  if (roleName && roleName !== role.roleName) {
    const existingRole = await Role.findOne({
      _id: { $ne: roleId },
      roleName: { $regex: new RegExp(`^${roleName}$`, 'i') },
    });

    if (existingRole) {
      const error = new Error(MESSAGES.ERROR.ROLE_ALREADY_EXISTS);
      error.code = ERROR_CODES.DUPLICATE_ENTRY;
      throw error;
    }

    role.roleName = roleName;
  }

  if (permissions !== undefined) {
    role.permissions = permissions;
  }

  role.updatedBy = updatedBy;
  await role.save();

  // Fetch updated role with populated fields
  const updatedRole = await Role.findById(role._id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  logger.info(`Role updated: ${updatedRole.roleName} by user ${updatedBy}`);
  return updatedRole;
};

/**
 * Delete role
 * @param {String} roleId - Role ID
 * @returns {Object} Deletion result
 */
const deleteRole = async (roleId) => {
  const role = await Role.findById(roleId);

  if (!role) {
    const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
    error.code = ERROR_CODES.NOT_FOUND;
    throw error;
  }

  // Check if any users have this role
  const usersWithRole = await User.countDocuments({ roleId });

  if (usersWithRole > 0) {
    const error = new Error(MESSAGES.ERROR.ROLE_IN_USE);
    error.code = ERROR_CODES.CONFLICT;
    throw error;
  }

  await Role.findByIdAndDelete(roleId);

  logger.info(`Role deleted: ${role.roleName}`);
  return { roleName: role.roleName };
};

/**
 * Toggle role active status
 * @param {String} roleId - Role ID
 * @param {String} updatedBy - User ID toggling the status
 * @returns {Object} Updated role
 */
const toggleRoleStatus = async (roleId, updatedBy) => {
  const role = await Role.findById(roleId);

  if (!role) {
    const error = new Error(MESSAGES.ERROR.ROLE_NOT_FOUND);
    error.code = ERROR_CODES.NOT_FOUND;
    throw error;
  }

  role.isActive = !role.isActive;
  role.updatedBy = updatedBy;
  await role.save();

  // Fetch updated role with populated fields
  const updatedRole = await Role.findById(role._id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  logger.info(
    `Role ${updatedRole.isActive ? 'activated' : 'deactivated'}: ${updatedRole.roleName}`
  );
  return updatedRole;
};

module.exports = {
  createRole,
  getRoleById,
  listRoles,
  updateRole,
  deleteRole,
  toggleRoleStatus,
};
