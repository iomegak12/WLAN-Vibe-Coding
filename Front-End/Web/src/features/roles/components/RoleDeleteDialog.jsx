import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import authService from '../../../services/authService';

const RoleDeleteDialog = ({ open, onClose, role, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && role) {
      fetchUserCount();
    }
  }, [open, role]);

  const fetchUserCount = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getUsers();
      const users = response.data?.users || response.users || response.data || [];
      const count = users.filter((user) => user.role?.id === role.id).length;
      setUserCount(count);
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!role) return null;

  const canDelete = userCount === 0;
  const isSystemRole = role.roleName === 'Super Admin';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { border: '1px solid', borderColor: 'divider' },
      }}
    >
      <DialogTitle>Delete Role?</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Are you sure you want to delete this role?
            </Typography>

            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2">
                <strong>Role:</strong> {role.roleName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Users assigned:</strong> {userCount}
              </Typography>
            </Box>

            {isSystemRole && (
              <Alert severity="error" icon={<WarningIcon />}>
                This is a system role and cannot be deleted.
              </Alert>
            )}

            {!isSystemRole && !canDelete && (
              <Alert severity="warning" icon={<WarningIcon />}>
                You cannot delete a role with assigned users. Please reassign
                users to another role first.
              </Alert>
            )}

            {!isSystemRole && canDelete && (
              <Alert severity="info">
                This action cannot be undone.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isDeleting} sx={{ textTransform: 'none' }}>
          {canDelete ? 'Cancel' : 'Close'}
        </Button>
        {canDelete && !isSystemRole && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RoleDeleteDialog;
