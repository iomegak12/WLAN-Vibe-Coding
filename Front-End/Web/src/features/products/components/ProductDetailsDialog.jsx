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
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  QrCode as QrCodeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const ProductDetailsDialog = ({ open, onClose, product }) => {
  if (!product) return null;

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

  const formatPrice = (price, currency = 'INR') => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="primary" />
          <Typography variant="h6">Product Details</Typography>
        </Box>
        <Chip
          label={product.status}
          color={getStatusColor(product.status)}
          size="small"
        />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* SKU */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              SKU
            </Typography>
            <Typography
              variant="h6"
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
              {product.sku}
            </Typography>
          </Grid>

          {/* Product Name */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Product Name
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {product.name}
            </Typography>
          </Grid>

          {/* Category & Subcategory */}
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Category
            </Typography>
            <Chip
              icon={<CategoryIcon />}
              label={product.category_name}
              variant="outlined"
              color="primary"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Subcategory
            </Typography>
            <Chip
              label={product.subcategory_name}
              variant="outlined"
            />
          </Grid>

          {/* Brand & Model */}
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Brand
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {product.brand}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Model
            </Typography>
            <Typography variant="body1">
              {product.model || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Price */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Price
            </Typography>
            <Typography variant="h4" color="primary" fontWeight={700}>
              {formatPrice(product.price, product.currency)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Timestamps */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Created At
                </Typography>
                <Typography variant="body2">
                  {formatDate(product.created_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDate(product.updated_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>
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

export default ProductDetailsDialog;
