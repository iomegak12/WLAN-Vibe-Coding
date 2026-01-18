import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Paper,
  Checkbox,
  FormGroup,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../../contexts/UIContext';
import roleService from '../../../services/roleService';
import { PERMISSION_GROUPS } from '../../../utils/permissions';

const RoleCreatePage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useUI();
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    isActive: true,
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
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
        // Remove all group permissions
        permissions = permissions.filter((p) => !permissionKeys.includes(p));
      } else {
        // Add all group permissions
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
      await roleService.createRole(formData);
      showSuccess('Role created successfully');
      navigate('/roles');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create role';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Create New Role
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Role Name"
                name="roleName"
                value={formData.roleName}
                onChange={handleInputChange}
                error={!!errors.roleName}
                helperText={errors.roleName}
                required
                fullWidth
              />

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
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
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Permissions
            </Typography>
            {errors.permissions && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.permissions}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the permissions this role should have
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={() => handleGroupToggle(groupPermissions)}
                          />
                        }
                        label={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {group.label}
                          </Typography>
                        }
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <FormGroup>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                          },
                          gap: 1,
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
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Role'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RoleCreatePage;
