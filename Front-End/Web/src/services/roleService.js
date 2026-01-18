import { authApi } from './api';

const roleService = {
  // Get all roles with optional filters
  getRoles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive);
    }
    const queryString = params.toString();
    const url = queryString ? `/roles?${queryString}` : '/roles';
    return authApi.get(url);
  },

  // Get role by ID
  getRoleById: async (id) => {
    return authApi.get(`/roles/${id}`);
  },

  // Create new role
  createRole: async (roleData) => {
    return authApi.post('/roles', roleData);
  },

  // Update existing role
  updateRole: async (id, roleData) => {
    return authApi.put(`/roles/${id}`, roleData);
  },

  // Delete role
  deleteRole: async (id) => {
    return authApi.delete(`/roles/${id}`);
  },
};

export default roleService;
