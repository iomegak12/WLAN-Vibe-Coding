import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import authService from '../../../services/authService';
import { useUI } from '../../../contexts/UIContext';

const UserFormDialog = ({ open, onClose, user, onSuccess }) => {
  const { showError, showSuccess } = useUI();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const isEditMode = !!user;

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleId: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      if (user) {
        // Split name into firstName and lastName
        const nameParts = (user.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        reset({
          firstName,
          lastName,
          email: user.email || '',
          password: '',
          roleId: user.role?.id || '',
          status: user.status || 'active',
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          roleId: '',
          status: 'active',
        });
      }
    }
  }, [open, user, reset]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await authService.getRoles();
      const rolesData = response.data?.roles || response.roles || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      showError('Failed to load roles');
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Update user
        const updateData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roleId: data.roleId,
          status: data.status,
        };
        // Only include password if provided
        if (data.password) {
          updateData.password = data.password;
        }
        await authService.updateUser(user.id, updateData);
        showSuccess('User updated successfully');
      } else {
        // Create new user
        const createData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          roleId: data.roleId,
          status: data.status,
        };
        await authService.createUser(createData);
        showSuccess('User created successfully');
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('User save error:', error.response?.data || error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      const message = error.response?.data?.message || 
        (isEditMode ? 'Failed to update user' : 'Failed to create user');
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? 'Edit User' : 'Add New User'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={
                isEditMode
                  ? {
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                        message: 'Password must contain uppercase, lowercase, number and special character',
                      },
                    }
                  : {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                        message: 'Password must contain uppercase, lowercase, number and special character',
                      },
                    }
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                  type="password"
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Controller
              name="roleId"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roleId} disabled={isSubmitting || loadingRoles}>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    {loadingRoles ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.roleName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.roleId && (
                    <FormHelperText>{errors.roleId.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status} disabled={isSubmitting}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update User' : 'Create User'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
