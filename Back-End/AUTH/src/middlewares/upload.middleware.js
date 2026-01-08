const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FILE_UPLOAD } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Upload Middleware
 * Handles file uploads using multer
 */

// Ensure upload directory exists
const uploadDir = FILE_UPLOAD.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Upload directory created: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user ? req.user.userId : 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = FILE_UPLOAD.ALLOWED_TYPES;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.includes(ext) && (mimetype === 'image/jpeg' || mimetype === 'image/png')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE, // 2MB
  },
});

/**
 * Single file upload middleware
 * @param {String} fieldName - Form field name (default: 'profileImage')
 */
const uploadSingle = (fieldName = 'profileImage') => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);

    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size must not exceed 2MB',
            error: {
              code: 'FILE_TOO_LARGE',
              message: 'File size must not exceed 2MB',
            },
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message,
          },
        });
      } else if (err) {
        // Other errors (e.g., file type validation)
        return res.status(400).json({
          success: false,
          message: err.message,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.message,
          },
        });
      }

      // No file uploaded (optional upload)
      if (!req.file) {
        logger.info('No file uploaded in request');
      } else {
        logger.info(`File uploaded successfully: ${req.file.filename}`);
      }

      next();
    });
  };
};

/**
 * Delete uploaded file
 * @param {String} filename - File name to delete
 */
const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  deleteFile,
};
