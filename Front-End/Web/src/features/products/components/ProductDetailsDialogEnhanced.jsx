import React, { useState, useEffect } from 'react';
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
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  QrCode2 as QrCodeIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUI } from '../../../contexts/UIContext';
import { useAuth } from '../../../contexts/AuthContext';
import pmsService from '../../../services/pmsService';
import AssetRegenerateDialog from './assets/AssetRegenerateDialog';

const ProductDetailsDialog = ({ open, onClose, product }) => {
  const { showError } = useUI();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [qrCode, setQrCode] = useState(null);
  const [barcode, setBarcode] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [loadingBarcode, setLoadingBarcode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [assetTypeToRegenerate, setAssetTypeToRegenerate] = useState(null);

  const canUpdate = hasPermission('products.update');

  useEffect(() => {
    if (open && product) {
      setActiveTab(0);
      setQrCode(null);
      setBarcode(null);
    }
  }, [open, product]);

  const fetchQRCode = async () => {
    if (!product?.id || qrCode) return;
    
    console.log('Fetching QR code for product:', product.id);
    setLoadingQR(true);
    try {
      const blob = await pmsService.getProductQRCode(product.id);
      console.log('QR Code blob received:', blob, 'Type:', blob?.type, 'Size:', blob?.size);
      
      // Check if we actually got a blob
      if (blob instanceof Blob && blob.size > 0) {
        const imageUrl = URL.createObjectURL(blob);
        console.log('QR Code URL created:', imageUrl);
        setQrCode(imageUrl);
      } else {
        console.log('Invalid QR Code blob');
        setQrCode(null);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setQrCode(null);
    } finally {
      setLoadingQR(false);
    }
  };

  const fetchBarcode = async () => {
    if (!product?.id || barcode) return;
    
    console.log('Fetching barcode for product:', product.id);
    setLoadingBarcode(true);
    try {
      const blob = await pmsService.getProductBarcode(product.id);
      console.log('Barcode blob received:', blob, 'Type:', blob?.type, 'Size:', blob?.size);
      
      // Check if we actually got a blob
      if (blob instanceof Blob && blob.size > 0) {
        const imageUrl = URL.createObjectURL(blob);
        console.log('Barcode URL created:', imageUrl);
        setBarcode(imageUrl);
      } else {
        console.log('Invalid Barcode blob');
        setBarcode(null);
      }
    } catch (error) {
      console.error('Error fetching barcode:', error);
      setBarcode(null);
    } finally {
      setLoadingBarcode(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1 && product && !qrCode && !loadingQR) {
      fetchQRCode();
    }
    if (activeTab === 1 && product && !barcode && !loadingBarcode) {
      fetchBarcode();
    }
  }, [activeTab, product]);

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `${product.sku}-qrcode.png`;
      link.click();
    }
  };

  const handleDownloadBarcode = () => {
    if (barcode) {
      const link = document.createElement('a');
      link.href = barcode;
      link.download = `${product.sku}-barcode.png`;
      link.click();
    }
  };

  const handleRegenerateClick = (assetType) => {
    setAssetTypeToRegenerate(assetType);
    setRegenerateDialogOpen(true);
  };

  const handleRegenerateSuccess = () => {
    // Refresh QR/Barcode after regeneration
    if (assetTypeToRegenerate === 'QR Code') {
      setQrCode(null);
      fetchQRCode();
    } else {
      setBarcode(null);
      fetchBarcode();
    }
  };

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={product.status}
            color={getStatusColor(product.status)}
            size="small"
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<InfoIcon />} label="Details" iconPosition="start" />
          <Tab icon={<QrCodeIcon />} label="QR & Barcode" iconPosition="start" />
          <Tab icon={<ImageIcon />} label="Images" iconPosition="start" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3, minHeight: 400 }}>
        {/* Tab 0: Details */}
        {activeTab === 0 && (
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

            {/* Price & Currency */}
            <Grid item xs={12} sm={8}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Unit Price
              </Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {formatPrice(product.price, product.currency)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Currency
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {product.currency || 'INR'}
              </Typography>
            </Grid>

            {/* Warranty */}
            {product.warranty && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Warranty
                </Typography>
                <Typography variant="body1">
                  {product.warranty}
                </Typography>
              </Grid>
            )}

            {/* Description */}
            {product.description && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {product.description}
                  </Typography>
                </Paper>
              </Grid>
            )}

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
        )}

        {/* Tab 1: QR & Barcode */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Scan these codes for quick product lookup and inventory management.
              </Alert>
            </Grid>

            {/* QR Code */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  QR Code
                </Typography>
                {console.log('QR Code state:', {qrCode, loadingQR})}
                {loadingQR ? (
                  <Box sx={{ py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : qrCode ? (
                  <>
                    <Box
                      component="img"
                      src={qrCode}
                      alt="QR Code"
                      sx={{
                        width: '100%',
                        maxWidth: 250,
                        height: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        bgcolor: 'white',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadQR}
                        variant="outlined"
                        size="small"
                      >
                        Download
                      </Button>
                      {canUpdate && (
                        <Button
                          startIcon={<RefreshIcon />}
                          onClick={() => handleRegenerateClick('QR Code')}
                          variant="outlined"
                          size="small"
                          color="warning"
                        >
                          Regenerate
                        </Button>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ py: 5 }}>
                    <QrCodeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      QR code generation pending
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Barcode */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Barcode
                </Typography>
                {console.log('Barcode state:', {barcode, loadingBarcode})}
                {loadingBarcode ? (
                  <Box sx={{ py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : barcode ? (
                  <>
                    <Box
                      component="img"
                      src={barcode}
                      alt="Barcode"
                      sx={{
                        width: '100%',
                        maxWidth: 250,
                        height: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        bgcolor: 'white',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadBarcode}
                        variant="outlined"
                        size="small"
                      >
                        Download
                      </Button>
                      {canUpdate && (
                        <Button
                          startIcon={<RefreshIcon />}
                          onClick={() => handleRegenerateClick('Barcode')}
                          variant="outlined"
                          size="small"
                          color="warning"
                        >
                          Regenerate
                        </Button>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ py: 5 }}>
                    <QrCodeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Barcode generation pending
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Images */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            {product.images && product.images.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Click any image to view it in full size. Images are automatically sourced from Unsplash when the product is created.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    {product.images.map((imageUrl, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            position: 'relative',
                            paddingTop: '75%', // 4:3 aspect ratio
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: 3,
                            },
                          }}
                          onClick={() => setSelectedImage(imageUrl)}
                        >
                          <Box
                            component="img"
                            src={imageUrl}
                            alt={`${product.name} - Image ${index + 1}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          {index === 0 && (
                            <Chip
                              label="Primary"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Images Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This product doesn't have any images yet. Images are automatically added when creating new products.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

      {/* Image Lightbox */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{product?.name}</Typography>
          <IconButton onClick={() => setSelectedImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt={product?.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                bgcolor: 'black',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedImage;
              link.download = `${product?.sku}-image.jpg`;
              link.target = '_blank';
              link.click();
            }}
          >
            Download
          </Button>
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Asset Regenerate Dialog */}
      <AssetRegenerateDialog
        open={regenerateDialogOpen}
        onClose={() => setRegenerateDialogOpen(false)}
        assetType={assetTypeToRegenerate}
        productName={product?.name}
        sku={product?.sku}
        productId={product?.id}
        onSuccess={handleRegenerateSuccess}
      />
    </Dialog>
  );
};

export default ProductDetailsDialog;
