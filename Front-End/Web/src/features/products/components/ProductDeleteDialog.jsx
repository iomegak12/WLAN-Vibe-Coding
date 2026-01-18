import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';

const ProductDeleteDialog = ({ open, onClose, product, onConfirm }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="error" />
        Delete Product
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          This action cannot be undone. The product will be permanently deleted from the system.
        </Alert>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Are you sure you want to delete this product?
        </Typography>

        {/* Product Details */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ProductIcon color="action" />
            <Typography variant="subtitle2" fontWeight={600}>
              Product Information
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                SKU:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.sku || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Name:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.name || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Category:
              </Typography>
              <Chip
                label={product.category_name || 'N/A'}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Subcategory:
              </Typography>
              <Chip
                label={product.subcategory_name || 'N/A'}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Brand:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.brand || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDeleteDialog;
