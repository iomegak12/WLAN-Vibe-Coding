import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import pmsService from '../../../../services/pmsService';
import { useUI } from '../../../../contexts/UIContext';

const AssetRegenerateDialog = ({ open, onClose, assetType, productName, sku, productId, onSuccess }) => {
  const { showSuccess, showError } = useUI();
  const [regenerating, setRegenerating] = useState(false);

  // Don't render if assetType is not provided
  if (!assetType) return null;

  const handleRegenerate = async () => {
    setRegenerating(true);

    try {
      if (assetType === 'QR Code') {
        await pmsService.regenerateQRCode(productId);
        showSuccess('QR code regenerated successfully');
      } else {
        await pmsService.regenerateBarcode(productId);
        showSuccess('Barcode regenerated successfully');
      }

      setRegenerating(false);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to regenerate ${assetType.toLowerCase()}`;
      showError(errorMessage);
      setRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={!regenerating ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        Regenerate {assetType}?
      </DialogTitle>

      <DialogContent>
        <Typography paragraph>
          Are you sure you want to regenerate the {assetType.toLowerCase()} for this product?
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Product:</strong> {productName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>SKU:</strong> {sku}
          </Typography>
        </Box>

        <Alert severity="warning" icon={<WarningIcon />}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Important:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>The current {assetType.toLowerCase()} will become invalid</li>
              <li>Any printed materials will need updating</li>
              <li>This action cannot be undone</li>
            </ul>
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={regenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleRegenerate}
          variant="contained"
          color="error"
          disabled={regenerating}
          startIcon={regenerating ? <CircularProgress size={16} /> : null}
        >
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetRegenerateDialog;
