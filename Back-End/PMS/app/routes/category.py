"""
Category API Routes
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from app.config.database import Database
from app.repositories.category import CategoryRepository
from app.services.category import CategoryService
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from app.schemas.common import PaginationParams
from app.middleware.auth import get_current_user, get_optional_user
from app.utils.responses import success_response, created_response
from app.utils.logger import logger


router = APIRouter(prefix="/categories", tags=["Categories"])


def get_category_service() -> CategoryService:
    """
    Dependency to get category service instance.
    
    Returns:
        CategoryService: Category service instance
    """
    db = Database.get_database()
    repository = CategoryRepository(db)
    return CategoryService(repository)


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
    description="Create a new category. Category code is auto-generated from name if not provided."
)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Create a new category.
    
    - **name**: Category name (required, 2-100 characters)
    - **description**: Category description (optional, max 500 characters)
    - **code**: Category code (optional, auto-generated if not provided)
    - **isActive**: Active status (default: true)
    
    Returns created category with auto-generated code.
    """
    logger.info(f"Creating category: {category_data.name} by user {current_user.get('userId')}")
    
    category = await service.create_category(
        category_data=category_data,
        user_id=current_user.get("userId")
    )
    
    return created_response(
        data=category.model_dump(),
        message=f"Category '{category.name}' created successfully"
    )


@router.get(
    "",
    response_model=dict,
    summary="List all categories",
    description="Get paginated list of categories with optional filters."
)
async def list_categories(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name or code"),
    current_user: dict = Depends(get_optional_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    List all categories with pagination and filters.
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    - **is_active**: Filter by active status (optional)
    - **search**: Search term for name or code (optional)
    
    Returns paginated list of categories with metadata.
    """
    logger.info(f"Listing categories: page={page}, limit={limit}, is_active={is_active}, search={search}")
    
    pagination = PaginationParams(page=page, limit=limit)
    result = await service.list_categories(
        pagination=pagination,
        is_active=is_active,
        search=search
    )
    
    return success_response(
        data=result.model_dump(),
        message=f"Retrieved {len(result.items)} categories"
    )


@router.get(
    "/{category_id}",
    response_model=dict,
    summary="Get category by ID",
    description="Retrieve a specific category by its ID."
)
async def get_category(
    category_id: str,
    current_user: dict = Depends(get_optional_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Get category by ID.
    
    - **category_id**: Category ID (required)
    
    Returns category details.
    """
    logger.info(f"Getting category: {category_id}")
    
    category = await service.get_category(category_id)
    
    return success_response(
        data=category.model_dump(),
        message="Category retrieved successfully"
    )


@router.put(
    "/{category_id}",
    response_model=dict,
    summary="Update category",
    description="Update an existing category. Only provided fields will be updated."
)
async def update_category(
    category_id: str,
    update_data: CategoryUpdate,
    current_user: dict = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Update category.
    
    - **category_id**: Category ID (required)
    - **name**: New category name (optional)
    - **description**: New description (optional)
    - **isActive**: New active status (optional)
    
    Returns updated category.
    """
    logger.info(f"Updating category: {category_id} by user {current_user.get('userId')}")
    
    category = await service.update_category(
        category_id=category_id,
        update_data=update_data,
        user_id=current_user.get("userId")
    )
    
    return success_response(
        data=category.model_dump(),
        message=f"Category '{category.name}' updated successfully"
    )


@router.delete(
    "/{category_id}",
    response_model=dict,
    summary="Delete category",
    description="Soft delete a category. Cannot delete if category has active sub-categories."
)
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Delete category (soft delete).
    
    - **category_id**: Category ID (required)
    
    Category cannot be deleted if it has active sub-categories.
    Returns success message.
    """
    logger.info(f"Deleting category: {category_id} by user {current_user.get('userId')}")
    
    await service.delete_category(category_id)
    
    return success_response(
        data={"id": category_id, "deleted": True},
        message="Category deleted successfully"
    )
