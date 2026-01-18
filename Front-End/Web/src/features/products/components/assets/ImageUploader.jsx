import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ImageUploader = ({ productId, onUploadSuccess, onUploadError, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) {
      return 'No file selected';
    }

    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid file format. Please upload JPG, PNG, or WebP images.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 2MB limit. Please choose a smaller file.';
    }

    return null;
  };

  const handleFile = async (file) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress (real progress tracking requires xhr or axios with onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Import pmsService dynamically to avoid circular dependencies
      const pmsService = (await import('../../../../services/pmsService')).default;
      const response = await pmsService.uploadProductImage(productId, file, false);

      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      setUploading(false);

      // Reset after success
      setTimeout(() => {
        setProgress(0);
        setSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      setUploading(false);
      setProgress(0);
      const errorMessage = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(',')}
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      <Paper
        variant="outlined"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: disabled || uploading ? 'grey.300' : 'primary.main',
            bgcolor: disabled || uploading ? 'background.paper' : 'action.hover',
          },
        }}
        onClick={!disabled && !uploading ? handleButtonClick : undefined}
      >
        {uploading ? (
          <Box sx={{ py: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Uploading... {progress}%
            </Typography>
          </Box>
        ) : success ? (
          <Box sx={{ py: 2 }}>
            <SuccessIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="success.main">
              Upload successful!
            </Typography>
          </Box>
        ) : (
          <>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Drag & drop image here or click to browse
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Accepted: JPG, PNG, WebP (max 2MB)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              Select File
            </Button>
          </>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUploader;
