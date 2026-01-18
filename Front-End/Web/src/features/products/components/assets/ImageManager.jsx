import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ImageUploader from './ImageUploader';
import useImageDelete from '../../hooks/useImageDelete';
import useImageReorder from '../../hooks/useImageReorder';
import useSetPrimaryImage from '../../hooks/useSetPrimaryImage';
import { useUI } from '../../../../contexts/UIContext';

const ImageManager = ({ productId, images = [], primaryImageId, onUpdate, maxImages = 10 }) => {
  const { showSuccess, showError } = useUI();
  const [localImages, setLocalImages] = useState(images);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  const { deleteImage, deleting } = useImageDelete();
  const { reorderImages, reordering } = useImageReorder();
  const { setPrimaryImage, setting } = useSetPrimaryImage();

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleUploadSuccess = (uploadedImage) => {
    showSuccess('Image uploaded successfully');
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleUploadError = (error) => {
    showError(error);
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;

    const result = await deleteImage(productId, imageToDelete.id);
    
    if (result.success) {
      showSuccess('Image deleted successfully');
      setDeleteDialogOpen(false);
      setImageToDelete(null);
      if (onUpdate) {
        onUpdate();
      }
    } else {
      showError(result.error);
    }
  };

  const handleSetPrimary = async (imageId) => {
    const result = await setPrimaryImage(productId, imageId);
    
    if (result.success) {
      showSuccess('Primary image updated');
      if (onUpdate) {
        onUpdate();
      }
    } else {
      showError(result.error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(localImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state optimistically
    setLocalImages(items);

    // Save to backend
    const imageIds = items.map(img => img.id);
    const saveResult = await reorderImages(productId, imageIds);
    
    if (saveResult.success) {
      if (onUpdate) {
        onUpdate();
      }
    } else {
      // Revert on error
      setLocalImages(images);
      showError(saveResult.error);
    }
  };

  const canUpload = localImages.length < maxImages;
  const isPrimary = (imageId) => imageId === primaryImageId;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Product Images ({localImages.length}/{maxImages})
      </Typography>

      {/* Upload Section */}
      <Box sx={{ mb: 3 }}>
        {canUpload ? (
          <ImageUploader
            productId={productId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        ) : (
          <Alert severity="info">
            Maximum {maxImages} images allowed. Delete an image to upload a new one.
          </Alert>
        )}
      </Box>

      {/* Images List */}
      {localImages.length > 0 ? (
        <>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Drag images to reorder them
          </Typography>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images">
              {(provided) => (
                <Grid
                  container
                  spacing={2}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {localImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card
                            sx={{
                              position: 'relative',
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                              transition: 'all 0.2s',
                            }}
                          >
                            {/* Drag Handle */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                zIndex: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                p: 0.5,
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                              }}
                            >
                              <DragIcon />
                            </Box>

                            {/* Primary Badge */}
                            {isPrimary(image.id) && (
                              <Chip
                                label="PRIMARY"
                                size="small"
                                color="primary"
                                icon={<StarIcon />}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                }}
                              />
                            )}

                            <CardMedia
                              component="img"
                              height="200"
                              image={image.url}
                              alt={image.filename || 'Product image'}
                              sx={{ objectFit: 'cover' }}
                            />

                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="caption" display="block" noWrap>
                                {image.filename || 'image.jpg'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {image.fileSize ? `${(image.fileSize / 1024).toFixed(1)} KB` : ''}
                                {image.dimensions ? ` | ${image.dimensions.width}x${image.dimensions.height}` : ''}
                              </Typography>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                              {!isPrimary(image.id) && (
                                <Button
                                  size="small"
                                  startIcon={<StarBorderIcon />}
                                  onClick={() => handleSetPrimary(image.id)}
                                  disabled={setting || reordering}
                                >
                                  Set Primary
                                </Button>
                              )}
                              <Box sx={{ flex: 1 }} />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(image)}
                                disabled={deleting || reordering}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardActions>
                          </Card>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>

          {reordering && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Saving order...
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">
          No images uploaded yet. Upload your first product image above.
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Image?</DialogTitle>
        <DialogContent>
          {imageToDelete && isPrimary(imageToDelete.id) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This is the primary image. Please set another image as primary before deleting this one.
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
          {imageToDelete && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img
                src={imageToDelete.url}
                alt="Image to delete"
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting || (imageToDelete && isPrimary(imageToDelete.id))}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageManager;
