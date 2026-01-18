import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Paper,
  Checkbox,
  FormGroup,
  Divider,
  Alert,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import roleService from '../../../services/roleService';
import { PERMISSION_GROUPS } from '../../../utils/permissions';

const RoleFormDialog = ({ open, onClose, role, onSuccess }) => {
  const { showError, showSuccess } = useUI();
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    isActive: true,
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!role;

  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || '',
        description: role.description || '',
        isActive: role.isActive ?? true,
        permissions: role.permissions || [],
      });
    } else {
      setFormData({
        roleName: '',
        description: '',
        isActive: true,
        permissions: [],
      });
    }
    setErrors({});
  }, [role, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handlePermissionChange = (permissionKey) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permissionKey)
        ? prev.permissions.filter((p) => p !== permissionKey)
        : [...prev.permissions, permissionKey];
      return { ...prev, permissions };
    });
  };

  const handleGroupToggle = (groupPermissions) => {
    const permissionKeys = groupPermissions.map((p) => p.key);
    const allSelected = permissionKeys.every((key) =>
      formData.permissions.includes(key)
    );
    setFormData((prev) => {
      let permissions = [...prev.permissions];
      if (allSelected) {
        permissions = permissions.filter((p) => !permissionKeys.includes(p));
      } else {
        permissionKeys.forEach((key) => {
          if (!permissions.includes(key)) {
            permissions.push(key);
          }
        });
      }
      return { ...prev, permissions };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await roleService.updateRole(role.id, formData);
        showSuccess('Role updated successfully');
      } else {
        await roleService.createRole(formData);
        showSuccess('Role created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} role`;
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            {isEditMode ? 'Edit Role' : 'Create New Role'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Role Name"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  error={!!errors.roleName}
                  helperText={errors.roleName}
                  required
                  fullWidth
                  size="small"
                />

                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleStatusChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>

            {/* Permissions */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Permissions
              </Typography>
              {errors.permissions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.permissions}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the permissions this role should have
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                  const groupPermissions = group.permissions;
                  const permissionKeys = groupPermissions.map((p) => p.key);
                  const allSelected = permissionKeys.every((key) =>
                    formData.permissions.includes(key)
                  );
                  const someSelected =
                    permissionKeys.some((key) => formData.permissions.includes(key)) &&
                    !allSelected;

                  return (
                    <Paper key={groupKey} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={() => handleGroupToggle(groupPermissions)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600}>
                              {group.label}
                            </Typography>
                          }
                        />
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <FormGroup>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              sm: 'repeat(2, 1fr)',
                            },
                            gap: 0.5,
                          }}
                        >
                          {groupPermissions.map((permission) => (
                            <FormControlLabel
                              key={permission.key}
                              control={
                                <Checkbox
                                  checked={formData.permissions.includes(permission.key)}
                                  onChange={() => handlePermissionChange(permission.key)}
                                  size="small"
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {permission.label}
                                </Typography>
                              }
                            />
                          ))}
                        </Box>
                      </FormGroup>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleFormDialog;
