import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import pmsService from '../../../services/pmsService';

const ProductFormDialog = ({ open, onClose, product, onSuccess }) => {
  const { showError, showSuccess } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subCategoryId: '',
    brand: '',
    description: '',
    unitPrice: '',
    currency: 'INR',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!product;

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.category_id || '',
        subCategoryId: product.subcategory_id || '',
        brand: product.brand || '',
        description: product.description || '',
        unitPrice: product.price?.toString() || '',
        currency: product.currency || 'INR',
      });
    } else {
      setFormData({
        name: '',
        categoryId: '',
        subCategoryId: '',
        brand: '',
        description: '',
        unitPrice: '',
        currency: 'INR',
      });
    }
    setErrors({});
  }, [product, open]);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subCategoryId: '' }));
    }
  }, [formData.categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await pmsService.getCategories({ isActive: true });
      const categoriesData = response.data?.items || response.items || [];
      const mappedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await pmsService.getSubCategories({ category_id: categoryId, isActive: true });
      const subcategoriesData = response.data?.items || response.items || [];
      const mappedSubcategories = subcategoriesData.map(sub => ({
        id: sub.id,
        name: sub.name,
      }));
      setSubcategories(mappedSubcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.subCategoryId) {
      newErrors.subCategoryId = 'Subcategory is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Convert to API format (camelCase)
      const apiData = {
        name: formData.name,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        brand: formData.brand,
        description: formData.description,
        unitPrice: parseFloat(formData.unitPrice),
        currency: formData.currency,
      };
      
      if (isEditMode) {
        await pmsService.updateProduct(product.id, apiData);
        showSuccess('Product updated successfully');
      } else {
        await pmsService.createProduct(apiData);
        showSuccess('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box component="span">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {!isEditMode && (
            <Alert severity="info" sx={{ mb: 3 }}>
              SKU will be auto-generated based on category, subcategory, and brand
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.categoryId} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  label="Category"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.categoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Subcategory */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.subCategoryId} required disabled={!formData.categoryId}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  label="Subcategory"
                  onChange={handleInputChange}
                >
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.subCategoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.subCategoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Product Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            {/* Brand */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                error={!!errors.brand}
                helperText={errors.brand}
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={handleInputChange}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;
