"""
File Management Routes - Image Upload, Download, and Management
"""

from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Optional
from bson import ObjectId
from io import BytesIO
from datetime import datetime
from app.config.database import Database
from app.repositories.product import ProductRepository
from app.middleware.auth import get_current_user, get_optional_user
from app.utils.responses import success_response, created_response
from app.utils.logger import logger
from app.utils.exceptions import NotFoundError, ValidationError, FileUploadError
from app.utils.file_utils import validate_and_read_file, generate_safe_filename, get_content_type


router = APIRouter(prefix="/files", tags=["Files"])


@router.post(
    "/products/{product_id}/images",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Upload product images",
    description="Upload one or more images for a product. Images are stored in GridFS."
)
async def upload_product_images(
    product_id: str,
    files: List[UploadFile] = File(..., description="Image files to upload (max 5)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload product images.
    
    - **product_id**: Product ID (required)
    - **files**: List of image files (max 5 per request)
    
    Supported formats: JPEG, PNG, WebP, GIF
    Max file size: 5 MB per file
    
    Returns list of uploaded image IDs.
    """
    try:
        # Validate product exists
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        db = Database.get_database()
        product_repo = ProductRepository(db)
        product = await product_repo.find_by_id(product_id)
        
        if not product:
            raise NotFoundError(f"Product with ID {product_id} not found")
        
        # Validate number of files
        if len(files) > 5:
            raise ValidationError("Maximum 5 images can be uploaded at once")
        
        if len(files) == 0:
            raise ValidationError("At least one image file is required")
        
        # Upload files to GridFS
        gridfs_bucket = Database.get_gridfs_bucket()
        uploaded_ids = []
        
        for file in files:
            try:
                # Validate and read file
                content, content_type = await validate_and_read_file(file)
                
                # Generate safe filename
                filename = generate_safe_filename(file.filename, prefix=product['sku'])
                
                # Upload to GridFS
                file_id = await gridfs_bucket.upload_from_stream(
                    filename,
                    BytesIO(content),
                    metadata={
                        "type": "product_image",
                        "productId": product_id,
                        "sku": product['sku'],
                        "contentType": content_type,
                        "originalFilename": file.filename,
                        "uploadedBy": current_user.get("userId"),
                        "uploadedAt": datetime.utcnow()
                    }
                )
                
                uploaded_ids.append(str(file_id))
                logger.info(f"Image uploaded for product {product_id}: {filename}")
                
            except FileUploadError as e:
                logger.error(f"Failed to upload {file.filename}: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Failed to upload {file.filename}: {str(e)}")
                raise FileUploadError(f"Failed to upload {file.filename}: {str(e)}")
        
        # Update product's images array
        current_images = product.get("images", [])
        updated_images = current_images + uploaded_ids
        
        await product_repo.update(
            product_id,
            {
                "images": updated_images,
                "updatedBy": ObjectId(current_user.get("userId"))
            }
        )
        
        return created_response(
            data={
                "productId": product_id,
                "uploadedImages": uploaded_ids,
                "totalImages": len(updated_images)
            },
            message=f"Successfully uploaded {len(uploaded_ids)} image(s)"
        )
        
    except (ValidationError, NotFoundError, FileUploadError):
        raise
    except Exception as e:
        logger.error(f"Image upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}"
        )


@router.get(
    "/products/{product_id}/images",
    response_model=dict,
    summary="List product images",
    description="Get list of all images for a product."
)
async def list_product_images(
    product_id: str,
    current_user: dict = Depends(get_optional_user)
):
    """
    List all images for a product.
    
    - **product_id**: Product ID (required)
    
    Returns list of image metadata.
    """
    try:
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        db = Database.get_database()
        product_repo = ProductRepository(db)
        product = await product_repo.find_by_id(product_id)
        
        if not product:
            raise NotFoundError(f"Product with ID {product_id} not found")
        
        # Get image metadata from GridFS
        gridfs_bucket = Database.get_gridfs_bucket()
        image_ids = product.get("images", [])
        
        images = []
        for img_id in image_ids:
            try:
                # Use GridFS bucket's find method correctly
                cursor = gridfs_bucket.find({"_id": ObjectId(img_id)})
                async for doc in cursor:
                    images.append({
                        "id": str(doc._id),
                        "filename": doc.filename,
                        "contentType": doc.metadata.get("contentType") if doc.metadata else None,
                        "size": doc.length,
                        "uploadedAt": doc.metadata.get("uploadedAt") if doc.metadata else None,
                        "url": f"/api/v1/files/{doc._id}"
                    })
                    break  # Only get first match
            except Exception as e:
                logger.warning(f"Failed to get metadata for image {img_id}: {str(e)}")
        
        return success_response(
            data={
                "productId": product_id,
                "sku": product["sku"],
                "images": images,
                "totalImages": len(images)
            },
            message=f"Retrieved {len(images)} image(s)"
        )
        
    except (ValidationError, NotFoundError):
        raise
    except Exception as e:
        logger.error(f"List images error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {str(e)}"
        )


@router.delete(
    "/products/{product_id}/images/{image_id}",
    response_model=dict,
    summary="Delete product image",
    description="Delete a specific image from a product."
)
async def delete_product_image(
    product_id: str,
    image_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a product image.
    
    - **product_id**: Product ID (required)
    - **image_id**: Image file ID (required)
    
    Removes image from GridFS and product's image list.
    """
    try:
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        if not ObjectId.is_valid(image_id):
            raise ValidationError(f"Invalid image ID format: {image_id}")
        
        db = Database.get_database()
        product_repo = ProductRepository(db)
        product = await product_repo.find_by_id(product_id)
        
        if not product:
            raise NotFoundError(f"Product with ID {product_id} not found")
        
        # Check if image belongs to product
        current_images = product.get("images", [])
        if image_id not in current_images:
            raise NotFoundError(f"Image {image_id} not found for product {product_id}")
        
        # Delete from GridFS
        gridfs_bucket = Database.get_gridfs_bucket()
        await gridfs_bucket.delete(ObjectId(image_id))
        
        # Update product's images array
        updated_images = [img for img in current_images if img != image_id]
        await product_repo.update(
            product_id,
            {
                "images": updated_images,
                "updatedBy": ObjectId(current_user.get("userId"))
            }
        )
        
        logger.info(f"Image {image_id} deleted from product {product_id}")
        
        return success_response(
            data={
                "productId": product_id,
                "deletedImageId": image_id,
                "remainingImages": len(updated_images)
            },
            message="Image deleted successfully"
        )
        
    except (ValidationError, NotFoundError):
        raise
    except Exception as e:
        logger.error(f"Delete image error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )


@router.get(
    "/{file_id}",
    summary="Download file",
    description="Download a file (image, QR code, barcode) from GridFS by ID."
)
async def download_file(
    file_id: str,
    download: bool = Query(False, description="Force download instead of inline display"),
    current_user: dict = Depends(get_optional_user)
):
    """
    Download file from GridFS.
    
    - **file_id**: GridFS file ID (required)
    - **download**: Force download (default: False for inline display)
    
    Returns file content with appropriate headers.
    """
    try:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file ID format: {file_id}"
            )
        
        gridfs_bucket = Database.get_gridfs_bucket()
        
        # Download file content
        try:
            file_data = await gridfs_bucket.open_download_stream(ObjectId(file_id))
            content = await file_data.read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with ID {file_id} not found"
            )
        
        # Get file info
        cursor = gridfs_bucket.find({"_id": ObjectId(file_id)})
        doc = None
        async for file_doc in cursor:
            doc = file_doc
            break
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File metadata not found"
            )
        
        # Get content type
        content_type = doc.metadata.get("contentType", "application/octet-stream") if doc.metadata else "application/octet-stream"
        
        # Prepare headers
        headers = {
            "Content-Length": str(len(content))
        }
        
        if download:
            headers["Content-Disposition"] = f'attachment; filename="{doc.filename}"'
        else:
            headers["Content-Disposition"] = f'inline; filename="{doc.filename}"'
        
        logger.info(f"File downloaded: {file_id} ({doc.filename})")
        
        return StreamingResponse(
            BytesIO(content),
            media_type=content_type,
            headers=headers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File download error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}"
        )


@router.get(
    "/{file_id}/metadata",
    response_model=dict,
    summary="Get file metadata",
    description="Get metadata for a file without downloading it."
)
async def get_file_metadata(
    file_id: str,
    current_user: dict = Depends(get_optional_user)
):
    """
    Get file metadata.
    
    - **file_id**: GridFS file ID (required)
    
    Returns file metadata without content.
    """
    try:
        if not ObjectId.is_valid(file_id):
            raise ValidationError(f"Invalid file ID format: {file_id}")
        
        gridfs_bucket = Database.get_gridfs_bucket()
        
        # Find file
        cursor = gridfs_bucket.find({"_id": ObjectId(file_id)})
        doc = None
        async for file_doc in cursor:
            doc = file_doc
            break
        
        if not doc:
            raise NotFoundError(f"File with ID {file_id} not found")
        
        metadata = {
            "id": str(doc._id),
            "filename": doc.filename,
            "length": doc.length,
            "uploadDate": doc.upload_date,
            "metadata": doc.metadata or {},
            "contentType": doc.metadata.get("contentType") if doc.metadata else None
        }
        
        return success_response(
            data=metadata,
            message="File metadata retrieved successfully"
        )
        
    except (ValidationError, NotFoundError):
        raise
    except Exception as e:
        logger.error(f"Get metadata error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get file metadata: {str(e)}"
        )
