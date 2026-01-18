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
} from '@mui/icons-material';

const CategoryDetailsDialog = ({ open, onClose, category }) => {
  if (!category) return null;

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
          <Typography variant="h6">Category Details</Typography>
        </Box>
        <Chip
          label={category.is_active ? 'Active' : 'Inactive'}
          color={category.is_active ? 'success' : 'default'}
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
                  Category Code
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
                  {category.code}
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
                  Category Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {category.name}
                </Typography>
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
                  {category.description || 'No description provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Subcategories Count */}
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Subcategories
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {category.subcategory_count || 0}
            </Typography>
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
                  {formatDate(category.created_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Updated Date */}
          {category.updated_at && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(category.updated_at)}
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

export default CategoryDetailsDialog;
