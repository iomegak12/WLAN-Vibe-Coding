"""
Product API Routes
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from app.config.database import Database
from app.repositories.product import ProductRepository
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app.services.product import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.schemas.common import PaginationParams
from app.middleware.auth import get_current_user, get_optional_user
from app.utils.responses import success_response, created_response
from app.utils.logger import logger


router = APIRouter(prefix="/products", tags=["Products"])


def get_product_service() -> ProductService:
    """
    Dependency to get product service instance.
    
    Returns:
        ProductService: Product service instance
    """
    db = Database.get_database()
    product_repository = ProductRepository(db)
    category_repository = CategoryRepository(db)
    subcategory_repository = SubCategoryRepository(db)
    return ProductService(product_repository, category_repository, subcategory_repository)


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product with auto-generated SKU, QR code, and barcode."
)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    """
    Create a new product.
    
    - **name**: Product name (required)
    - **categoryId**: Category ID (required)
    - **subCategoryId**: Sub-category ID (required)
    - **brand**: Brand name (required)
    - **description**: Product description (optional)
    - **specifications**: Technical specifications as JSON object (optional)
    - **unitPrice**: Unit price (required, must be > 0)
    - **currency**: Currency code (default: INR)
    - **minStockLevel**: Minimum stock level (default: 10)
    - **maxStockLevel**: Maximum stock level (default: 1000)
    - **reorderPoint**: Reorder point threshold (default: 20)
    - **unit**: Unit of measurement (default: PCS)
    - **weight**: Weight in kg (optional)
    - **dimensions**: Dimensions in cm as JSON (optional)
    - **manufacturer**: Manufacturer name (optional)
    - **warrantyPeriod**: Warranty in months (optional)
    - **tags**: Product tags for search (optional)
    - **sku**: Custom SKU (optional, auto-generated if not provided)
    
    Auto-generates:
    - SKU: CAT-SUBCAT-BRAND-SEQUENCE (e.g., ELEC-ROUTER-CISCO-0001)
    - QR Code: Uploaded to GridFS
    - Barcode: Uploaded to GridFS
    
    Returns created product with all generated fields.
    """
    logger.info(f"Creating product: {product_data.name} by user {current_user.get('userId')}")
    
    product = await service.create_product(
        product_data=product_data,
        user_id=current_user.get("userId")
    )
    
    return created_response(
        data=product.model_dump(mode='json'),
        message=f"Product '{product.name}' created successfully with SKU: {product.sku}"
    )


@router.get(
    "",
    response_model=dict,
    summary="List all products",
    description="Get paginated list of products with advanced filters and sorting."
)
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    subcategory_id: Optional[str] = Query(None, description="Filter by sub-category ID"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name, SKU, brand, tags"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    stock_status: Optional[str] = Query(None, description="Stock status: 'in-stock', 'low-stock', 'out-of-stock'"),
    created_from: Optional[str] = Query(None, description="Created date from (ISO 8601)"),
    created_to: Optional[str] = Query(None, description="Created date to (ISO 8601)"),
    updated_from: Optional[str] = Query(None, description="Updated date from (ISO 8601)"),
    updated_to: Optional[str] = Query(None, description="Updated date to (ISO 8601)"),
    sort_by: Optional[str] = Query(None, description="Sort field: 'name', 'price', 'createdAt', 'updatedAt'"),
    sort_order: Optional[str] = Query("asc", description="Sort order: 'asc' or 'desc'"),
    current_user: dict = Depends(get_optional_user),
    service: ProductService = Depends(get_product_service)
):
    """
    List all products with pagination, advanced filters, and sorting.
    
    **Pagination:**
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    
    **Filters:**
    - **category_id**: Filter by category ID
    - **subcategory_id**: Filter by sub-category ID
    - **brand**: Filter by exact brand name
    - **is_active**: Filter by active status (true/false)
    - **search**: Full-text search in name, SKU, brand, or tags
    - **tags**: Comma-separated tags (e.g., "wireless,router")
    - **min_price**: Minimum price (inclusive)
    - **max_price**: Maximum price (inclusive)
    - **stock_status**: Filter by stock status:
        - `in-stock`: currentStock >= reorderPoint
        - `low-stock`: 0 < currentStock < reorderPoint
        - `out-of-stock`: currentStock = 0
    - **created_from**: Filter by creation date from (ISO 8601)
    - **created_to**: Filter by creation date to (ISO 8601)
    - **updated_from**: Filter by update date from (ISO 8601)
    - **updated_to**: Filter by update date to (ISO 8601)
    
    **Sorting:**
    - **sort_by**: Field to sort by ('name', 'price', 'createdAt', 'updatedAt')
    - **sort_order**: Sort order ('asc' or 'desc', default: 'asc')
    
    Returns paginated list with category and sub-category info.
    """
    logger.info(
        f"Listing products: page={page}, limit={limit}, filters=[category={category_id}, "
        f"subcategory={subcategory_id}, brand={brand}, price={min_price}-{max_price}, "
        f"stock={stock_status}, search={search}], sort={sort_by}:{sort_order}"
    )
    
    # Parse tags if provided
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else None
    
    # Validate stock status
    if stock_status and stock_status not in ['in-stock', 'low-stock', 'out-of-stock']:
        from app.utils.exceptions import ValidationError
        raise ValidationError(
            "Invalid stock_status. Must be one of: 'in-stock', 'low-stock', 'out-of-stock'"
        )
    
    # Validate sort_by
    if sort_by and sort_by not in ['name', 'price', 'createdAt', 'updatedAt']:
        from app.utils.exceptions import ValidationError
        raise ValidationError(
            "Invalid sort_by. Must be one of: 'name', 'price', 'createdAt', 'updatedAt'"
        )
    
    # Validate sort_order
    if sort_order not in ['asc', 'desc']:
        from app.utils.exceptions import ValidationError
        raise ValidationError("Invalid sort_order. Must be 'asc' or 'desc'")
    
    pagination = PaginationParams(page=page, limit=limit)
    result = await service.list_products(
        pagination=pagination,
        category_id=category_id,
        subcategory_id=subcategory_id,
        brand=brand,
        is_active=is_active,
        search=search,
        tags=tag_list,
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
    
    return success_response(
        data=result.model_dump(mode='json'),
        message=f"Retrieved {len(result.items)} products"
    )


@router.get(
    "/sku/{sku}",
    response_model=dict,
    summary="Get product by SKU",
    description="Retrieve a specific product by its SKU."
)
async def get_product_by_sku(
    sku: str,
    current_user: dict = Depends(get_optional_user),
    service: ProductService = Depends(get_product_service)
):
    """
    Get product by SKU.
    
    - **sku**: Product SKU (required)
    
    Returns product details with category and sub-category info.
    """
    logger.info(f"Getting product by SKU: {sku}")
    
    product = await service.get_product_by_sku(sku)
    
    return success_response(
        data=product.model_dump(mode='json'),
        message="Product retrieved successfully"
    )


@router.get(
    "/{product_id}",
    response_model=dict,
    summary="Get product by ID",
    description="Retrieve a specific product by its ID."
)
async def get_product(
    product_id: str,
    current_user: dict = Depends(get_optional_user),
    service: ProductService = Depends(get_product_service)
):
    """
    Get product by ID.
    
    - **product_id**: Product ID (required)
    
    Returns product details with category and sub-category info.
    """
    logger.info(f"Getting product: {product_id}")
    
    product = await service.get_product(product_id)
    
    return success_response(
        data=product.model_dump(mode='json'),
        message="Product retrieved successfully"
    )


@router.put(
    "/{product_id}",
    response_model=dict,
    summary="Update product",
    description="Update an existing product. Only provided fields will be updated."
)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    """
    Update product.
    
    - **product_id**: Product ID (required)
    - All other fields are optional - only provided fields will be updated
    
    Note: SKU, category, and sub-category cannot be changed after creation.
    Returns updated product.
    """
    logger.info(f"Updating product: {product_id} by user {current_user.get('userId')}")
    
    product = await service.update_product(
        product_id=product_id,
        update_data=update_data,
        user_id=current_user.get("userId")
    )
    
    return success_response(
        data=product.model_dump(mode='json'),
        message=f"Product '{product.name}' updated successfully"
    )


@router.delete(
    "/{product_id}",
    response_model=dict,
    summary="Delete product",
    description="Soft delete a product."
)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    """
    Delete product (soft delete).
    
    - **product_id**: Product ID (required)
    
    Returns success message.
    """
    logger.info(f"Deleting product: {product_id} by user {current_user.get('userId')}")
    
    await service.delete_product(product_id)
    
    return success_response(
        data={"id": product_id, "deleted": True},
        message="Product deleted successfully"
    )
