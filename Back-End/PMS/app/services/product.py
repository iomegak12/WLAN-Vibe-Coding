"""
Product Service - Business Logic
"""

from typing import Optional, Dict, List
from bson import ObjectId
from datetime import datetime
from decimal import Decimal
from app.repositories.product import ProductRepository
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.schemas.common import PaginationParams
from app.utils.logger import logger
from app.utils.exceptions import ValidationError, NotFoundError, DuplicateError
from app.utils.barcode_utils import generate_qr_code, generate_barcode, cleanup_sku_for_barcode
from app.utils.unsplash_utils import UnsplashService
from app.config.database import Database


class ProductService:
    """
    Service for product business logic.
    """
    
    def __init__(
        self,
        repository: ProductRepository,
        category_repository: CategoryRepository,
        subcategory_repository: SubCategoryRepository
    ):
        """
        Initialize product service.
        
        Args:
            repository: Product repository instance
            category_repository: Category repository instance
            subcategory_repository: Sub-category repository instance
        """
        self.repository = repository
        self.category_repository = category_repository
        self.subcategory_repository = subcategory_repository
        self.unsplash_service = UnsplashService()
    
    async def _generate_sku(
        self,
        category_code: str,
        subcategory_code: str,
        brand: str
    ) -> str:
        """
        Generate SKU in format: CAT-SUBCAT-BRAND-SEQUENCE.
        Example: ELEC-ROUTER-CISCO-0001
        
        Args:
            category_code: Category code
            subcategory_code: Sub-category code
            brand: Brand name
        
        Returns:
            str: Generated SKU
        """
        # Clean brand name (take first 10 chars, uppercase, alphanumeric only)
        brand_clean = ''.join(c for c in brand if c.isalnum())[:10].upper()
        
        # Get next sequence number
        sequence = await self.repository.get_next_sequence_number(
            category_code,
            subcategory_code,
            brand_clean
        )
        
        # Format: CAT-SUBCAT-BRAND-SEQUENCE (4 digits)
        sku = f"{category_code}-{subcategory_code}-{brand_clean}-{sequence:04d}"
        
        return sku
    
    async def _generate_codes(self, sku: str) -> tuple[Optional[str], Optional[str]]:
        """
        Generate QR code and barcode, upload to GridFS.
        
        Args:
            sku: Product SKU
        
        Returns:
            tuple: (QR code GridFS ID, Barcode GridFS ID)
        """
        try:
            gridfs_bucket = Database.get_gridfs_bucket()
            
            # Generate and upload QR code
            qr_buffer, qr_filename = generate_qr_code(sku)
            qr_id = await gridfs_bucket.upload_from_stream(
                qr_filename,
                qr_buffer,
                metadata={"type": "qr_code", "sku": sku}
            )
            
            # Generate and upload barcode
            barcode_sku = cleanup_sku_for_barcode(sku)
            barcode_buffer, barcode_filename = generate_barcode(barcode_sku)
            barcode_id = await gridfs_bucket.upload_from_stream(
                barcode_filename,
                barcode_buffer,
                metadata={"type": "barcode", "sku": sku}
            )
            
            logger.info(f"Generated QR and barcode for SKU: {sku}")
            return str(qr_id), str(barcode_id)
            
        except Exception as e:
            logger.error(f"Failed to generate codes: {str(e)}")
            # Don't fail product creation if code generation fails
            return None, None
    
    async def _fetch_unsplash_images(
        self,
        product_name: str,
        brand: str,
        category_name: str,
        count: int = 6
    ) -> List[str]:
        """
        Fetch product images from Unsplash and store URLs.
        
        Args:
            product_name: Product name
            brand: Brand name
            category_name: Category name
            count: Number of images to fetch
        
        Returns:
            List of image URLs
        """
        try:
            images = await self.unsplash_service.get_product_images(
                product_name=product_name,
                brand=brand,
                category=category_name,
                count=count
            )
            
            # Extract image URLs
            image_urls = [img.get("url") for img in images if img.get("url")]
            
            logger.info(f"Fetched {len(image_urls)} Unsplash images for product: {product_name}")
            return image_urls
            
        except Exception as e:
            logger.error(f"Failed to fetch Unsplash images: {str(e)}")
            return []
    
    async def create_product(
        self,
        product_data: ProductCreate,
        user_id: Optional[str] = None
    ) -> ProductResponse:
        """
        Create a new product.
        
        Args:
            product_data: Product creation data
            user_id: ID of user creating the product
        
        Returns:
            ProductResponse: Created product
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If category/subcategory not found
            DuplicateError: If product already exists
        """
        # Validate category exists
        category = await self.category_repository.find_by_id(product_data.categoryId)
        if not category:
            raise NotFoundError(f"Category with ID {product_data.categoryId} not found")
        
        # Validate sub-category exists and belongs to category
        subcategory = await self.subcategory_repository.find_by_id(product_data.subCategoryId)
        if not subcategory:
            raise NotFoundError(f"Sub-category with ID {product_data.subCategoryId} not found")
        
        if str(subcategory["categoryId"]) != product_data.categoryId:
            raise ValidationError(
                f"Sub-category {product_data.subCategoryId} does not belong to "
                f"category {product_data.categoryId}"
            )
        
        # Generate SKU if not provided
        sku = product_data.sku or await self._generate_sku(
            category["code"],
            subcategory["code"],
            product_data.brand
        )
        
        # Generate QR and barcode
        qr_code, barcode = await self._generate_codes(sku)
        
        # Fetch Unsplash images
        unsplash_images = await self._fetch_unsplash_images(
            product_name=product_data.name,
            brand=product_data.brand,
            category_name=category.get("name", ""),
            count=6
        )
        
        # Prepare document
        product_doc = {
            "sku": sku,
            "name": product_data.name,
            "categoryId": ObjectId(product_data.categoryId),
            "subCategoryId": ObjectId(product_data.subCategoryId),
            "brand": product_data.brand,
            "description": product_data.description,
            "specifications": product_data.specifications,
            "unitPrice": float(product_data.unitPrice),
            "currency": product_data.currency,
            "minStockLevel": product_data.minStockLevel,
            "maxStockLevel": product_data.maxStockLevel,
            "reorderPoint": product_data.reorderPoint,
            "unit": product_data.unit,
            "weight": float(product_data.weight) if product_data.weight else None,
            "dimensions": product_data.dimensions,
            "manufacturer": product_data.manufacturer,
            "warrantyPeriod": product_data.warrantyPeriod,
            "tags": product_data.tags,
            "qrCode": qr_code,
            "barcode": barcode,
            "images": unsplash_images,  # Unsplash images
            "isActive": product_data.isActive,
            "isDeleted": False,
            "createdBy": ObjectId(user_id) if user_id else None,
            "updatedBy": ObjectId(user_id) if user_id else None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Create in database
        created = await self.repository.create(product_doc)
        
        # Convert to response schema
        return await self._to_response(created, category, subcategory)
    
    async def get_product(self, product_id: str) -> ProductResponse:
        """
        Get product by ID.
        
        Args:
            product_id: Product ID
        
        Returns:
            ProductResponse: Product data
        
        Raises:
            NotFoundError: If product not found
        """
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        product = await self.repository.find_by_id(product_id)
        
        if not product:
            raise NotFoundError(f"Product with ID {product_id} not found")
        
        # Get category and subcategory
        category = await self.category_repository.find_by_id(
            str(product["categoryId"]),
            include_deleted=True
        )
        subcategory = await self.subcategory_repository.find_by_id(
            str(product["subCategoryId"]),
            include_deleted=True
        )
        
        return await self._to_response(product, category, subcategory)
    
    async def get_product_by_sku(self, sku: str) -> ProductResponse:
        """
        Get product by SKU.
        
        Args:
            sku: Product SKU
        
        Returns:
            ProductResponse: Product data
        
        Raises:
            NotFoundError: If product not found
        """
        product = await self.repository.find_by_sku(sku)
        
        if not product:
            raise NotFoundError(f"Product with SKU {sku} not found")
        
        # Get category and subcategory
        category = await self.category_repository.find_by_id(
            str(product["categoryId"]),
            include_deleted=True
        )
        subcategory = await self.subcategory_repository.find_by_id(
            str(product["subCategoryId"]),
            include_deleted=True
        )
        
        return await self._to_response(product, category, subcategory)
    
    async def list_products(
        self,
        pagination: PaginationParams,
        category_id: Optional[str] = None,
        subcategory_id: Optional[str] = None,
        brand: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        stock_status: Optional[str] = None,
        created_from: Optional[str] = None,
        created_to: Optional[str] = None,
        updated_from: Optional[str] = None,
        updated_to: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "asc"
    ) -> ProductListResponse:
        """
        List products with pagination, advanced filters, and sorting.
        
        Args:
            pagination: Pagination parameters
            category_id: Filter by category ID
            subcategory_id: Filter by sub-category ID
            brand: Filter by brand
            is_active: Filter by active status
            search: Search term
            tags: Filter by tags
            min_price: Minimum price filter
            max_price: Maximum price filter
            stock_status: Stock status filter ('in-stock', 'low-stock', 'out-of-stock')
            created_from: Created date from (ISO 8601)
            created_to: Created date to (ISO 8601)
            updated_from: Updated date from (ISO 8601)
            updated_to: Updated date to (ISO 8601)
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
        
        Returns:
            ProductListResponse: List of products with pagination
        """
        # Validate ObjectIds if provided
        if category_id and not ObjectId.is_valid(category_id):
            raise ValidationError(f"Invalid category ID format: {category_id}")
        if subcategory_id and not ObjectId.is_valid(subcategory_id):
            raise ValidationError(f"Invalid sub-category ID format: {subcategory_id}")
        
        products, total = await self.repository.find_all(
            skip=pagination.skip,
            limit=pagination.limit,
            category_id=category_id,
            subcategory_id=subcategory_id,
            brand=brand,
            is_active=is_active,
            search=search,
            tags=tags,
            min_price=min_price,
            max_price=max_price,
            stock_status=stock_status,
            created_from=created_from,
            created_to=created_to,
            updated_from=updated_from,
            updated_to=updated_to,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Convert to response schemas
        items = [await self._to_response_from_aggregated(prod) for prod in products]
        
        # Calculate pagination metadata
        total_pages = (total + pagination.limit - 1) // pagination.limit
        
        pagination_data = {
            "page": pagination.page,
            "limit": pagination.limit,
            "total": total,
            "pages": total_pages,
            "hasNext": pagination.page < total_pages,
            "hasPrev": pagination.page > 1
        }
        
        return ProductListResponse(items=items, pagination=pagination_data)
    
    async def update_product(
        self,
        product_id: str,
        update_data: ProductUpdate,
        user_id: Optional[str] = None
    ) -> ProductResponse:
        """
        Update product.
        
        Args:
            product_id: Product ID
            update_data: Update data
            user_id: ID of user updating the product
        
        Returns:
            ProductResponse: Updated product
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If product not found
        """
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        # Prepare update document (only include provided fields)
        update_doc = {}
        for field, value in update_data.model_dump(exclude_unset=True).items():
            if value is not None:
                if isinstance(value, Decimal):
                    update_doc[field] = float(value)
                else:
                    update_doc[field] = value
        
        if not update_doc:
            raise ValidationError("No fields to update")
        
        # Add updater info
        if user_id:
            update_doc["updatedBy"] = ObjectId(user_id)
        
        # Update in database
        updated = await self.repository.update(product_id, update_doc)
        
        # Get category and subcategory
        category = await self.category_repository.find_by_id(
            str(updated["categoryId"]),
            include_deleted=True
        )
        subcategory = await self.subcategory_repository.find_by_id(
            str(updated["subCategoryId"]),
            include_deleted=True
        )
        
        return await self._to_response(updated, category, subcategory)
    
    async def delete_product(self, product_id: str) -> bool:
        """
        Delete product (soft delete).
        
        Args:
            product_id: Product ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If product not found
        """
        if not ObjectId.is_valid(product_id):
            raise ValidationError(f"Invalid product ID format: {product_id}")
        
        return await self.repository.soft_delete(product_id)
    
    async def _to_response(
        self,
        product: Dict,
        category: Optional[Dict],
        subcategory: Optional[Dict]
    ) -> ProductResponse:
        """
        Convert database document to response schema.
        
        Args:
            product: Product document from database
            category: Category document
            subcategory: Sub-category document
        
        Returns:
            ProductResponse: Response schema
        """
        return ProductResponse(
            id=str(product["_id"]),
            sku=product["sku"],
            name=product["name"],
            categoryId=str(product["categoryId"]),
            categoryName=category["name"] if category else "Unknown",
            categoryCode=category["code"] if category else "UNKNOWN",
            subCategoryId=str(product["subCategoryId"]),
            subCategoryName=subcategory["name"] if subcategory else "Unknown",
            subCategoryCode=subcategory["code"] if subcategory else "UNKNOWN",
            brand=product["brand"],
            description=product.get("description"),
            specifications=product.get("specifications", {}),
            unitPrice=Decimal(str(product["unitPrice"])),
            currency=product["currency"],
            minStockLevel=product["minStockLevel"],
            maxStockLevel=product["maxStockLevel"],
            reorderPoint=product["reorderPoint"],
            unit=product["unit"],
            weight=Decimal(str(product["weight"])) if product.get("weight") else None,
            dimensions=product.get("dimensions"),
            manufacturer=product.get("manufacturer"),
            warrantyPeriod=product.get("warrantyPeriod"),
            tags=product.get("tags", []),
            qrCode=product.get("qrCode"),
            barcode=product.get("barcode"),
            images=product.get("images", []),
            isActive=product["isActive"],
            isDeleted=product["isDeleted"],
            createdBy=str(product["createdBy"]) if product.get("createdBy") else None,
            updatedBy=str(product["updatedBy"]) if product.get("updatedBy") else None,
            createdAt=product["createdAt"],
            updatedAt=product["updatedAt"]
        )
    
    async def _to_response_from_aggregated(self, aggregated: Dict) -> ProductResponse:
        """
        Convert aggregated document to response schema.
        
        Args:
            aggregated: Aggregated document with category/subcategory info
        
        Returns:
            ProductResponse: Response schema
        """
        category = aggregated.get("category", {})
        subcategory = aggregated.get("subcategory", {})
        
        return ProductResponse(
            id=str(aggregated["_id"]),
            sku=aggregated["sku"],
            name=aggregated["name"],
            categoryId=str(aggregated["categoryId"]),
            categoryName=category.get("name", "Unknown"),
            categoryCode=category.get("code", "UNKNOWN"),
            subCategoryId=str(aggregated["subCategoryId"]),
            subCategoryName=subcategory.get("name", "Unknown"),
            subCategoryCode=subcategory.get("code", "UNKNOWN"),
            brand=aggregated["brand"],
            description=aggregated.get("description"),
            specifications=aggregated.get("specifications", {}),
            unitPrice=Decimal(str(aggregated["unitPrice"])),
            currency=aggregated["currency"],
            minStockLevel=aggregated["minStockLevel"],
            maxStockLevel=aggregated["maxStockLevel"],
            reorderPoint=aggregated["reorderPoint"],
            unit=aggregated["unit"],
            weight=Decimal(str(aggregated["weight"])) if aggregated.get("weight") else None,
            dimensions=aggregated.get("dimensions"),
            manufacturer=aggregated.get("manufacturer"),
            warrantyPeriod=aggregated.get("warrantyPeriod"),
            tags=aggregated.get("tags", []),
            qrCode=aggregated.get("qrCode"),
            barcode=aggregated.get("barcode"),
            images=aggregated.get("images", []),
            isActive=aggregated["isActive"],
            isDeleted=aggregated["isDeleted"],
            createdBy=str(aggregated["createdBy"]) if aggregated.get("createdBy") else None,
            updatedBy=str(aggregated["updatedBy"]) if aggregated.get("updatedBy") else None,
            createdAt=aggregated["createdAt"],
            updatedAt=aggregated["updatedAt"]
        )
