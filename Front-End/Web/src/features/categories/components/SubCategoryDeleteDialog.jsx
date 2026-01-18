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

const SubCategoryDeleteDialog = ({ open, onClose, subcategory, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && subcategory) {
      fetchDependencies();
    }
  }, [open, subcategory]);

  const fetchDependencies = async () => {
    if (!subcategory) return;
    
    try {
      setIsLoading(true);
      const result = await pmsService.getSubCategoryDependencies(subcategory.id);
      setProductCount(result.productCount || 0);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      setProductCount(0);
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

  const canDelete = productCount === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            Delete Subcategory
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
              Are you sure you want to delete the subcategory <strong>{subcategory?.name}</strong>?
            </DialogContentText>

            {productCount > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Cannot delete this subcategory
                </Typography>
                <Typography variant="body2">
                  This subcategory has {productCount} product{productCount === 1 ? '' : 's'}.
                  Please delete or reassign the products first.
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

export default SubCategoryDeleteDialog;
