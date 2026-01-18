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
} from '@mui/material';
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  CalendarToday as CalendarIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const SubCategoryDetailsDialog = ({ open, onClose, subcategory }) => {
  if (!subcategory) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">Subcategory Details</Typography>
        </Box>
        <Chip
          label={subcategory.is_active ? 'Active' : 'Inactive'}
          color={subcategory.is_active ? 'success' : 'default'}
          size="small"
        />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Code */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CodeIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Subcategory Code
                </Typography>
                <Typography
                  variant="body1"
                  fontFamily="monospace"
                  fontWeight={600}
                  sx={{
                    bgcolor: 'grey.100',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'inline-block',
                  }}
                >
                  {subcategory.code}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Name */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CategoryIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Subcategory Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {subcategory.name}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Parent Category */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <FolderIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Parent Category
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={subcategory.category_name || 'Unknown'}
                    size="small"
                    variant="outlined"
                  />
                  {subcategory.category_code && (
                    <Typography
                      variant="caption"
                      fontFamily="monospace"
                      color="text.secondary"
                    >
                      ({subcategory.category_code})
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <DescriptionIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subcategory.description || 'No description provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Created Date */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Created At
                </Typography>
                <Typography variant="body2">
                  {formatDate(subcategory.created_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Updated Date */}
          {subcategory.updated_at && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(subcategory.updated_at)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryDetailsDialog;
