import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  AdminPanelSettings as RoleIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { formatPermissionLabel, PERMISSION_GROUPS } from '../../../utils/permissions';

const RoleDetailsDialog = ({ open, onClose, role, onEdit, onDelete }) => {
  if (!role) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupPermissionsByCategory = () => {
    if (role.permissions?.includes('*')) {
      return { wildcard: true };
    }

    const grouped = {};
    Object.entries(PERMISSION_GROUPS).forEach(([groupKey, group]) => {
      const groupPermissions = group.permissions
        .filter((p) => role.permissions?.includes(p.key))
        .map((p) => p.label);
      
      if (groupPermissions.length > 0) {
        grouped[group.label] = groupPermissions;
      }
    });
    return grouped;
  };

  const permissionGroups = groupPermissionsByCategory();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { border: '1px solid', borderColor: 'divider' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Role Details
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <RoleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {role.roleName}
          </Typography>
          <Chip
            label={role.isActive ? 'Active' : 'Inactive'}
            color={role.isActive ? 'success' : 'default'}
            size="small"
            icon={role.isActive ? <CheckCircleIcon /> : <CancelIcon />}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {role.description || 'No description provided'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Permissions
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {role.permissions?.length || 0} permission(s)
                  </Typography>
                </Box>
              </Box>

              {permissionGroups.wildcard ? (
                <Chip
                  label="Full Access (All Permissions)"
                  color="warning"
                  sx={{ mt: 1 }}
                />
              ) : (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(permissionGroups).map(([category, permissions]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>
                        {category}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {permissions.map((permission, index) => (
                          <Chip
                            key={index}
                            label={permission}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {(role.createdAt || role.updatedAt) && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Timeline
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(role.createdAt)}
                  </Typography>
                </Box>
                {role.updatedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Updated: {formatDate(role.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            onClose();
            onDelete(role);
          }}
          disabled={role.roleName === 'Super Admin'}
          sx={{ textTransform: 'none' }}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit(role);
          }}
          sx={{ textTransform: 'none' }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDetailsDialog;
