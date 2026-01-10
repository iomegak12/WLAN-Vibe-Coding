"""
File Upload and Validation Utilities
"""

from fastapi import UploadFile
from typing import List, Tuple
import mimetypes
from app.utils.logger import logger
from app.utils.exceptions import FileUploadError
from app.config.settings import settings


# Allowed image formats
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"]
}

ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]


def validate_image_file(file: UploadFile) -> None:
    """
    Validate uploaded image file.
    
    Args:
        file: Uploaded file
    
    Raises:
        FileUploadError: If file validation fails
    """
    # Check if file is provided
    if not file or not file.filename:
        raise FileUploadError("No file provided")
    
    # Check file extension
    file_ext = get_file_extension(file.filename).lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise FileUploadError(
            f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    content_type = file.content_type
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise FileUploadError(
            f"Invalid content type: {content_type}. Must be an image."
        )
    
    logger.debug(f"File validated: {file.filename} ({content_type})")


def validate_file_size(file_size: int) -> None:
    """
    Validate file size.
    
    Args:
        file_size: File size in bytes
    
    Raises:
        FileUploadError: If file size exceeds limit
    """
    max_size = settings.max_upload_size_bytes
    
    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        actual_mb = file_size / (1024 * 1024)
        raise FileUploadError(
            f"File size ({actual_mb:.2f} MB) exceeds maximum allowed size ({max_mb:.2f} MB)"
        )
    
    logger.debug(f"File size validated: {file_size} bytes")


def get_file_extension(filename: str) -> str:
    """
    Get file extension from filename.
    
    Args:
        filename: File name
    
    Returns:
        str: File extension (including dot)
    """
    if '.' not in filename:
        return ''
    return '.' + filename.rsplit('.', 1)[1].lower()


def get_content_type(filename: str) -> str:
    """
    Get content type from filename.
    
    Args:
        filename: File name
    
    Returns:
        str: Content type (MIME type)
    """
    content_type, _ = mimetypes.guess_type(filename)
    return content_type or "application/octet-stream"


async def validate_and_read_file(file: UploadFile, max_size: int = None) -> Tuple[bytes, str]:
    """
    Validate and read uploaded file.
    
    Args:
        file: Uploaded file
        max_size: Maximum file size (optional, uses settings default)
    
    Returns:
        Tuple[bytes, str]: (File content, content type)
    
    Raises:
        FileUploadError: If validation fails
    """
    try:
        # Validate file type
        validate_image_file(file)
        
        # Read file content
        content = await file.read()
        
        # Validate file size
        if max_size is None:
            max_size = settings.max_upload_size_bytes
        validate_file_size(len(content))
        
        # Reset file pointer
        await file.seek(0)
        
        return content, file.content_type
        
    except FileUploadError:
        raise
    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        raise FileUploadError(f"File validation failed: {str(e)}")


def generate_safe_filename(original_filename: str, prefix: str = "") -> str:
    """
    Generate safe filename by removing special characters.
    
    Args:
        original_filename: Original file name
        prefix: Prefix to add (optional)
    
    Returns:
        str: Safe filename
    """
    # Get extension
    ext = get_file_extension(original_filename)
    
    # Get base name without extension
    base_name = original_filename.rsplit('.', 1)[0] if '.' in original_filename else original_filename
    
    # Remove special characters
    safe_name = ''.join(c if c.isalnum() or c in ['_', '-'] else '_' for c in base_name)
    
    # Add prefix if provided
    if prefix:
        safe_name = f"{prefix}_{safe_name}"
    
    # Add extension
    return f"{safe_name}{ext}"
