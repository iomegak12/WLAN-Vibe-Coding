"""
Sub-Category API Routes
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from app.config.database import Database
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app.services.subcategory import SubCategoryService
from app.schemas.subcategory import SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse, SubCategoryListResponse
from app.schemas.common import PaginationParams
from app.middleware.auth import get_current_user, get_optional_user
from app.utils.responses import success_response, created_response
from app.utils.logger import logger


router = APIRouter(prefix="/subcategories", tags=["Sub-Categories"])


def get_subcategory_service() -> SubCategoryService:
    """
    Dependency to get sub-category service instance.
    
    Returns:
        SubCategoryService: Sub-category service instance
    """
    db = Database.get_database()
    category_repository = CategoryRepository(db)
    subcategory_repository = SubCategoryRepository(db)
    return SubCategoryService(subcategory_repository, category_repository)


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new sub-category",
    description="Create a new sub-category under a parent category. Code is auto-generated if not provided."
)
async def create_subcategory(
    subcategory_data: SubCategoryCreate,
    current_user: dict = Depends(get_current_user),
    service: SubCategoryService = Depends(get_subcategory_service)
):
    """
    Create a new sub-category.
    
    - **categoryId**: Parent category ID (required)
    - **name**: Sub-category name (required, 2-100 characters)
    - **description**: Sub-category description (optional, max 500 characters)
    - **code**: Sub-category code (optional, auto-generated if not provided)
    - **isActive**: Active status (default: true)
    
    Returns created sub-category with auto-generated code and parent category info.
    """
    logger.info(f"Creating sub-category: {subcategory_data.name} by user {current_user.get('userId')}")
    
    subcategory = await service.create_subcategory(
        subcategory_data=subcategory_data,
        user_id=current_user.get("userId")
    )
    
    return created_response(
        data=subcategory.model_dump(),
        message=f"Sub-category '{subcategory.name}' created successfully"
    )


@router.get(
    "",
    response_model=dict,
    summary="List all sub-categories",
    description="Get paginated list of sub-categories with optional filters."
)
async def list_subcategories(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    category_id: Optional[str] = Query(None, description="Filter by parent category ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name or code"),
    current_user: dict = Depends(get_optional_user),
    service: SubCategoryService = Depends(get_subcategory_service)
):
    """
    List all sub-categories with pagination and filters.
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    - **category_id**: Filter by parent category ID (optional)
    - **is_active**: Filter by active status (optional)
    - **search**: Search term for name or code (optional)
    
    Returns paginated list of sub-categories with parent category info and metadata.
    """
    logger.info(
        f"Listing sub-categories: page={page}, limit={limit}, "
        f"category_id={category_id}, is_active={is_active}, search={search}"
    )
    
    pagination = PaginationParams(page=page, limit=limit)
    result = await service.list_subcategories(
        pagination=pagination,
        category_id=category_id,
        is_active=is_active,
        search=search
    )
    
    return success_response(
        data=result.model_dump(),
        message=f"Retrieved {len(result.items)} sub-categories"
    )


@router.get(
    "/{subcategory_id}",
    response_model=dict,
    summary="Get sub-category by ID",
    description="Retrieve a specific sub-category by its ID with parent category info."
)
async def get_subcategory(
    subcategory_id: str,
    current_user: dict = Depends(get_optional_user),
    service: SubCategoryService = Depends(get_subcategory_service)
):
    """
    Get sub-category by ID.
    
    - **subcategory_id**: Sub-category ID (required)
    
    Returns sub-category details with parent category info.
    """
    logger.info(f"Getting sub-category: {subcategory_id}")
    
    subcategory = await service.get_subcategory(subcategory_id)
    
    return success_response(
        data=subcategory.model_dump(),
        message="Sub-category retrieved successfully"
    )


@router.put(
    "/{subcategory_id}",
    response_model=dict,
    summary="Update sub-category",
    description="Update an existing sub-category. Only provided fields will be updated."
)
async def update_subcategory(
    subcategory_id: str,
    update_data: SubCategoryUpdate,
    current_user: dict = Depends(get_current_user),
    service: SubCategoryService = Depends(get_subcategory_service)
):
    """
    Update sub-category.
    
    - **subcategory_id**: Sub-category ID (required)
    - **name**: New sub-category name (optional)
    - **description**: New description (optional)
    - **isActive**: New active status (optional)
    
    Note: Parent category cannot be changed after creation.
    Returns updated sub-category.
    """
    logger.info(f"Updating sub-category: {subcategory_id} by user {current_user.get('userId')}")
    
    subcategory = await service.update_subcategory(
        subcategory_id=subcategory_id,
        update_data=update_data,
        user_id=current_user.get("userId")
    )
    
    return success_response(
        data=subcategory.model_dump(),
        message=f"Sub-category '{subcategory.name}' updated successfully"
    )


@router.delete(
    "/{subcategory_id}",
    response_model=dict,
    summary="Delete sub-category",
    description="Soft delete a sub-category. Cannot delete if sub-category has active products."
)
async def delete_subcategory(
    subcategory_id: str,
    current_user: dict = Depends(get_current_user),
    service: SubCategoryService = Depends(get_subcategory_service)
):
    """
    Delete sub-category (soft delete).
    
    - **subcategory_id**: Sub-category ID (required)
    
    Sub-category cannot be deleted if it has active products.
    Returns success message.
    """
    logger.info(f"Deleting sub-category: {subcategory_id} by user {current_user.get('userId')}")
    
    await service.delete_subcategory(subcategory_id)
    
    return success_response(
        data={"id": subcategory_id, "deleted": True},
        message="Sub-category deleted successfully"
    )
