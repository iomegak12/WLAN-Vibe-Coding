import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import pmsService from '../../../services/pmsService';

const SubCategoryFormDialog = ({ open, onClose, subcategory, categories, onSuccess }) => {
  const { showError, showSuccess } = useUI();
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!subcategory;

  useEffect(() => {
    if (subcategory) {
      setFormData({
        category_id: subcategory.category_id || '',
        name: subcategory.name || '',
        description: subcategory.description || '',
        is_active: subcategory.is_active ?? true,
      });
    } else {
      setFormData({
        category_id: '',
        name: '',
        description: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [subcategory, open]);

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

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      is_active: e.target.checked,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category_id) {
      newErrors.category_id = 'Parent category is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Subcategory name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Convert snake_case to camelCase for API
      const apiData = {
        categoryId: formData.category_id,
        name: formData.name,
        description: formData.description,
        isActive: formData.is_active,
      };
      
      if (isEditMode) {
        await pmsService.updateSubCategory(subcategory.id, apiData);
        showSuccess('Subcategory updated successfully');
      } else {
        await pmsService.createSubCategory(apiData);
        showSuccess('Subcategory created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} subcategory`;
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            {isEditMode ? 'Edit Subcategory' : 'Create New Subcategory'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {isEditMode && subcategory?.code && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Subcategory Code
                </Typography>
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                  {subcategory.code}
                </Typography>
              </Box>
            )}

            {!isEditMode && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Subcategory code will be auto-generated based on the name
              </Alert>
            )}

            <FormControl fullWidth error={!!errors.category_id} required>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                label="Parent Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <FormHelperText>{errors.category_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Subcategory Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
              autoFocus={!isEditMode}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleStatusChange}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubCategoryFormDialog;
