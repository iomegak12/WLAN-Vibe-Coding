import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import pmsService from '../../../services/pmsService';

const CategoryDeleteDialog = ({ open, onClose, category, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subcategoryCount, setSubcategoryCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && category) {
      fetchDependencies();
    }
  }, [open, category]);

  const fetchDependencies = async () => {
    if (!category) return;
    
    try {
      setIsLoading(true);
      const result = await pmsService.getCategoryDependencies(category.id);
      setSubcategoryCount(result.subcategoryCount || 0);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      setSubcategoryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = subcategoryCount === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            Delete Category
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <DialogContentText>
              Are you sure you want to delete the category <strong>{category?.name}</strong>?
            </DialogContentText>

            {subcategoryCount > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Cannot delete this category
                </Typography>
                <Typography variant="body2">
                  This category has {subcategoryCount} subcategor{subcategoryCount === 1 ? 'y' : 'ies'}.
                  Please delete or reassign the subcategories first.
                </Typography>
              </Alert>
            )}

            {canDelete && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!canDelete || isLoading || isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDeleteDialog;
