import { authApi } from './api';

// Authentication service functions
// Note: authApi interceptor already unwraps response.data, so we return the response directly
const authService = {
  // Login
  async login(email, password) {
    const response = await authApi.post('/auth/login', { email, password });
    return response; // Already unwrapped by interceptor
  },

  // Logout
  async logout() {
    const response = await authApi.post('/auth/logout');
    return response; // Already unwrapped by interceptor
  },

  // Refresh token (refreshToken sent automatically via httpOnly cookie)
  async refreshToken() {
    const response = await authApi.post('/auth/refresh');
    return response; // Already unwrapped by interceptor
  },

  // Verify token
  async verifyToken() {
    const response = await authApi.get('/auth/verify');
    return response; // Already unwrapped by interceptor
  },

  // Get current user profile
  async getProfile() {
    const response = await authApi.get('/profile');
    return response;
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await authApi.put('/profile', profileData);
    return response;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await authApi.put('/profile/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  // Upload profile image
  async uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await authApi.post('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // User management (Admin)
  async getUsers(params = {}) {
    const response = await authApi.get('/users', { params });
    return response;
  },

  async getUserById(id) {
    const response = await authApi.get(`/users/${id}`);
    return response;
  },

  async createUser(userData) {
    const response = await authApi.post('/users', userData);
    return response;
  },

  async updateUser(id, userData) {
    const response = await authApi.put(`/users/${id}`, userData);
    return response;
  },

  async deleteUser(id) {
    const response = await authApi.delete(`/users/${id}`);
    return response;
  },

  async activateUser(id) {
    const response = await authApi.put(`/users/${id}/activate`);
    return response;
  },

  async deactivateUser(id) {
    const response = await authApi.put(`/users/${id}/deactivate`);
    return response;
  },

  // Role management
  async getRoles(params = {}) {
    const response = await authApi.get('/roles', { params });
    return response;
  },

  async getRoleById(id) {
    const response = await authApi.get(`/roles/${id}`);
    return response;
  },

  async createRole(roleData) {
    const response = await authApi.post('/roles', roleData);
    return response;
  },

  async updateRole(id, roleData) {
    const response = await authApi.put(`/roles/${id}`, roleData);
    return response;
  },

  async deleteRole(id) {
    const response = await authApi.delete(`/roles/${id}`);
    return response;
  },

  async getPermissions() {
    const response = await authApi.get('/permissions');
    return response;
  },
};

export default authService;
