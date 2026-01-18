import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const UserDetailsDialog = ({ open, onClose, user, onEdit, onDelete }) => {
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <DialogTitle sx={{ pb: 1 }}>
        User Details
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {user.name}
          </Typography>
          <Chip
            label={user.status === 'active' ? 'Active' : 'Inactive'}
            color={user.status === 'active' ? 'success' : 'default'}
            size="small"
            icon={user.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.role?.name || 'No Role'}
                  </Typography>
                  {user.role?.description && (
                    <Typography variant="caption" color="text.secondary">
                      {user.role.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {(user.createdAt || user.updatedAt) && (
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
                    Created: {formatDate(user.createdAt)}
                  </Typography>
                </Box>
                {user.updatedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Updated: {formatDate(user.updatedAt)}
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
            onDelete(user);
          }}
          sx={{ textTransform: 'none' }}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit(user);
          }}
          sx={{ textTransform: 'none' }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;
