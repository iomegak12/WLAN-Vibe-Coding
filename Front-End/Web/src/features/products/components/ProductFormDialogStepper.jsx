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
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import pmsService from '../../../services/pmsService';
import ImageManager from './assets/ImageManager';

const steps = [
  'Classification',
  'Identity',
  'Commercial',
  'Specifications',
  'Assets'
];

const ProductFormDialogStepper = ({ open, onClose, product, onSuccess }) => {
  const { showError, showSuccess } = useUI();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Classification
    categoryId: '',
    subCategoryId: '',
    
    // Step 2: Identity
    name: '',
    brand: '',
    model: '',
    
    // Step 3: Commercial
    unitPrice: '',
    currency: 'INR',
    warranty: '',
    isActive: true,
    
    // Step 4: Specifications
    specifications: {},
    description: '',
    
    // Step 5: Assets (for future implementation)
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedSKU, setGeneratedSKU] = useState('');

  const isEditMode = !!product;

  useEffect(() => {
    if (open) {
      fetchCategories();
      setActiveStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      setFormData({
        categoryId: product.category_id || '',
        subCategoryId: product.subcategory_id || '',
        name: product.name || '',
        brand: product.brand || '',
        model: product.model || '',
        unitPrice: product.price?.toString() || '',
        currency: product.currency || 'INR',
        warranty: product.warranty || '',
        isActive: product.status === 'Active',
        specifications: product.specifications || {},
        description: product.description || '',
        images: [],
      });
      setGeneratedSKU(product.sku || '');
      
      // Load subcategories for the product's category
      if (product.category_id) {
        fetchSubcategories(product.category_id);
      }
    } else {
      setFormData({
        categoryId: '',
        subCategoryId: '',
        name: '',
        brand: '',
        model: '',
        unitPrice: '',
        currency: 'INR',
        warranty: '',
        isActive: true,
        specifications: {},
        description: '',
        images: [],
      });
      setGeneratedSKU('');
      setSubcategories([]);
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

  // Generate preview SKU when classification and brand are selected
  useEffect(() => {
    if (!isEditMode && formData.categoryId && formData.subCategoryId && formData.brand) {
      const category = categories.find(c => c.id === formData.categoryId);
      const subcategory = subcategories.find(s => s.id === formData.subCategoryId);
      if (category && subcategory) {
        const preview = `${category.code}-${subcategory.code}-${formData.brand.substring(0, 3).toUpperCase()}-XXXX`;
        setGeneratedSKU(preview);
      }
    }
  }, [formData.categoryId, formData.subCategoryId, formData.brand, categories, subcategories, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await pmsService.getCategories({ isActive: true });
      setCategories(response?.items || []);
    } catch (error) {
      showError('Failed to load categories');
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await pmsService.getSubCategories({ category_id: categoryId, isActive: true });
      setSubcategories(response?.items || []);
    } catch (error) {
      showError('Failed to load subcategories');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Classification
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.subCategoryId) newErrors.subCategoryId = 'Subcategory is required';
        break;
      
      case 1: // Identity
        if (!formData.name?.trim()) newErrors.name = 'Product name is required';
        if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
        break;
      
      case 2: // Commercial
        if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
          newErrors.unitPrice = 'Valid price is required';
        }
        break;
      
      case 3: // Specifications
        // Optional - no validation required
        break;
      
      case 4: // Assets
        // Optional - no validation required for now
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        model: formData.model?.trim() || '',
        unitPrice: parseFloat(formData.unitPrice),
        currency: formData.currency,
        warranty: formData.warranty || '',
        isActive: formData.isActive,
        description: formData.description || '',
        specifications: formData.specifications,
      };

      if (isEditMode) {
        await pmsService.updateProduct(product.id, payload);
        showSuccess('Product updated successfully');
      } else {
        await pmsService.createProduct(payload);
        showSuccess('Product created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      showError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Classification
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select the category and subcategory for this product. This determines the product classification.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.categoryId} required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  label="Category"
                  onChange={(e) => handleChange('categoryId', e.target.value)}
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

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.subCategoryId} required disabled={!formData.categoryId}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={formData.subCategoryId}
                  label="Subcategory"
                  onChange={(e) => handleChange('subCategoryId', e.target.value)}
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
          </Grid>
        );

      case 1: // Identity
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Provide the basic identity information for the product.
              </Typography>
            </Grid>

            {!isEditMode && generatedSKU && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<CheckIcon />}>
                  <Typography variant="body2" fontWeight={600}>
                    Preview SKU: {generatedSKU}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Final SKU will be auto-generated upon creation
                  </Typography>
                </Alert>
              </Grid>
            )}

            {isEditMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={generatedSKU}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                placeholder="Enter product name"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                error={!!errors.brand}
                helperText={errors.brand}
                required
                placeholder="e.g., Samsung, Apple"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g., Galaxy S21, optional"
              />
            </Grid>
          </Grid>
        );

      case 2: // Commercial
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Set pricing, warranty, and availability for this product.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleChange('unitPrice', e.target.value)}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Warranty"
                value={formData.warranty}
                onChange={(e) => handleChange('warranty', e.target.value)}
                placeholder="e.g., 1 year manufacturer warranty"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  label="Status"
                  onChange={(e) => handleChange('isActive', e.target.value)}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3: // Specifications
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add detailed description and specifications for the product.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="Enter product description..."
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Advanced specification editor (key-value pairs) will be available in a future update.
              </Alert>
            </Grid>
          </Grid>
        );

      case 4: // Assets
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload and manage product images.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              {isEditMode && product?.id ? (
                <ImageManager
                  productId={product.id}
                  images={product.images || []}
                  primaryImageId={product.images?.find(img => img.isPrimary)?.id}
                  onUpdate={() => {
                    // Optionally refresh product data here
                  }}
                  maxImages={10}
                />
              ) : (
                <Alert severity="info">
                  Save the product first to upload images. Images can be added after creating the product.
                </Alert>
              )}
            </Grid>
          </Grid>
        );

      default:
        return null;
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

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 300 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            endIcon={<CheckIcon />}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialogStepper;
