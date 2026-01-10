"""
Sub-Category Service - Business Logic
"""

from typing import Optional, Dict, List
from bson import ObjectId
from datetime import datetime
import re
from app.repositories.category import CategoryRepository
from app.repositories.subcategory import SubCategoryRepository
from app.schemas.subcategory import SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse, SubCategoryListResponse
from app.schemas.common import PaginationParams
from app.utils.logger import logger
from app.utils.exceptions import ValidationError, NotFoundError, DuplicateError


class SubCategoryService:
    """
    Service for sub-category business logic.
    """
    
    def __init__(
        self,
        repository: SubCategoryRepository,
        category_repository: CategoryRepository
    ):
        """
        Initialize sub-category service.
        
        Args:
            repository: Sub-category repository instance
            category_repository: Category repository instance
        """
        self.repository = repository
        self.category_repository = category_repository
    
    def _generate_code(self, name: str) -> str:
        """
        Auto-generate sub-category code from name.
        Examples:
        - "Routers" -> "ROUTER"
        - "WiFi Access Points" -> "WIFI"
        - "Network Cables" -> "NETCABLE"
        
        Args:
            name: Sub-category name
        
        Returns:
            str: Generated code
        """
        # Remove special characters and split into words
        clean_name = re.sub(r'[^a-zA-Z\s]', '', name)
        words = clean_name.strip().upper().split()
        
        if not words:
            raise ValidationError("Cannot generate code from empty name")
        
        # Take first word (or first 8 chars if single word)
        if len(words) == 1:
            code = words[0][:8]
        else:
            # Combine first two words (truncated)
            code = (words[0][:6] + words[1][:4])[:10]
        
        return code
    
    async def create_subcategory(
        self,
        subcategory_data: SubCategoryCreate,
        user_id: Optional[str] = None
    ) -> SubCategoryResponse:
        """
        Create a new sub-category.
        
        Args:
            subcategory_data: Sub-category creation data
            user_id: ID of user creating the sub-category
        
        Returns:
            SubCategoryResponse: Created sub-category
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If parent category not found
            DuplicateError: If sub-category already exists
        """
        # Validate parent category exists
        category = await self.category_repository.find_by_id(subcategory_data.categoryId)
        if not category:
            raise NotFoundError(f"Category with ID {subcategory_data.categoryId} not found")
        
        # Check if parent category is active
        if not category["isActive"]:
            raise ValidationError("Cannot create sub-category under inactive category")
        
        # Auto-generate code if not provided
        code = subcategory_data.code or self._generate_code(subcategory_data.name)
        
        # Prepare document
        subcategory_doc = {
            "categoryId": ObjectId(subcategory_data.categoryId),
            "name": subcategory_data.name,
            "code": code,
            "description": subcategory_data.description,
            "isActive": subcategory_data.isActive,
            "isDeleted": False,
            "createdBy": ObjectId(user_id) if user_id else None,
            "updatedBy": ObjectId(user_id) if user_id else None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Create in database
        created = await self.repository.create(subcategory_doc)
        
        # Convert to response schema
        return await self._to_response(created, category)
    
    async def get_subcategory(self, subcategory_id: str) -> SubCategoryResponse:
        """
        Get sub-category by ID.
        
        Args:
            subcategory_id: Sub-category ID
        
        Returns:
            SubCategoryResponse: Sub-category data
        
        Raises:
            NotFoundError: If sub-category not found
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(subcategory_id):
            raise ValidationError(f"Invalid sub-category ID format: {subcategory_id}")
        
        subcategory = await self.repository.find_by_id(subcategory_id)
        
        if not subcategory:
            raise NotFoundError(f"Sub-category with ID {subcategory_id} not found")
        
        # Get parent category
        category = await self.category_repository.find_by_id(
            str(subcategory["categoryId"]),
            include_deleted=True
        )
        
        return await self._to_response(subcategory, category)
    
    async def list_subcategories(
        self,
        pagination: PaginationParams,
        category_id: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> SubCategoryListResponse:
        """
        List sub-categories with pagination and filters.
        
        Args:
            pagination: Pagination parameters
            category_id: Filter by parent category ID
            is_active: Filter by active status
            search: Search term
        
        Returns:
            SubCategoryListResponse: List of sub-categories with pagination
        """
        # Validate category_id if provided
        if category_id and not ObjectId.is_valid(category_id):
            raise ValidationError(f"Invalid category ID format: {category_id}")
        
        subcategories, total = await self.repository.find_all(
            skip=pagination.skip,
            limit=pagination.limit,
            category_id=category_id,
            is_active=is_active,
            search=search
        )
        
        # Convert to response schemas
        items = [await self._to_response_from_aggregated(subcat) for subcat in subcategories]
        
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
        
        return SubCategoryListResponse(items=items, pagination=pagination_data)
    
    async def update_subcategory(
        self,
        subcategory_id: str,
        update_data: SubCategoryUpdate,
        user_id: Optional[str] = None
    ) -> SubCategoryResponse:
        """
        Update sub-category.
        
        Args:
            subcategory_id: Sub-category ID
            update_data: Update data
            user_id: ID of user updating the sub-category
        
        Returns:
            SubCategoryResponse: Updated sub-category
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If sub-category not found
            DuplicateError: If updated name already exists
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(subcategory_id):
            raise ValidationError(f"Invalid sub-category ID format: {subcategory_id}")
        
        # Prepare update document (only include provided fields)
        update_doc = update_data.model_dump(exclude_unset=True)
        
        if not update_doc:
            raise ValidationError("No fields to update")
        
        # Add updater info
        if user_id:
            update_doc["updatedBy"] = ObjectId(user_id)
        
        # Update in database
        updated = await self.repository.update(subcategory_id, update_doc)
        
        # Get parent category
        category = await self.category_repository.find_by_id(
            str(updated["categoryId"]),
            include_deleted=True
        )
        
        return await self._to_response(updated, category)
    
    async def delete_subcategory(self, subcategory_id: str) -> bool:
        """
        Delete sub-category (soft delete).
        
        Args:
            subcategory_id: Sub-category ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            ValidationError: If sub-category has active products
            NotFoundError: If sub-category not found
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(subcategory_id):
            raise ValidationError(f"Invalid sub-category ID format: {subcategory_id}")
        
        # Check for active products
        product_count = await self.repository.count_products(subcategory_id)
        if product_count > 0:
            raise ValidationError(
                f"Cannot delete sub-category with {product_count} active products. "
                "Please delete or reassign products first."
            )
        
        # Soft delete
        return await self.repository.soft_delete(subcategory_id)
    
    async def _to_response(self, subcategory: Dict, category: Optional[Dict]) -> SubCategoryResponse:
        """
        Convert database document to response schema.
        
        Args:
            subcategory: Sub-category document from database
            category: Parent category document
        
        Returns:
            SubCategoryResponse: Response schema
        """
        return SubCategoryResponse(
            id=str(subcategory["_id"]),
            categoryId=str(subcategory["categoryId"]),
            categoryName=category["name"] if category else "Unknown",
            categoryCode=category["code"] if category else "UNKNOWN",
            name=subcategory["name"],
            code=subcategory["code"],
            description=subcategory.get("description"),
            isActive=subcategory["isActive"],
            isDeleted=subcategory["isDeleted"],
            createdBy=str(subcategory["createdBy"]) if subcategory.get("createdBy") else None,
            updatedBy=str(subcategory["updatedBy"]) if subcategory.get("updatedBy") else None,
            createdAt=subcategory["createdAt"],
            updatedAt=subcategory["updatedAt"]
        )
    
    async def _to_response_from_aggregated(self, aggregated: Dict) -> SubCategoryResponse:
        """
        Convert aggregated document to response schema.
        
        Args:
            aggregated: Aggregated document with category info
        
        Returns:
            SubCategoryResponse: Response schema
        """
        category = aggregated.get("category", {})
        
        return SubCategoryResponse(
            id=str(aggregated["_id"]),
            categoryId=str(aggregated["categoryId"]),
            categoryName=category.get("name", "Unknown"),
            categoryCode=category.get("code", "UNKNOWN"),
            name=aggregated["name"],
            code=aggregated["code"],
            description=aggregated.get("description"),
            isActive=aggregated["isActive"],
            isDeleted=aggregated["isDeleted"],
            createdBy=str(aggregated["createdBy"]) if aggregated.get("createdBy") else None,
            updatedBy=str(aggregated["updatedBy"]) if aggregated.get("updatedBy") else None,
            createdAt=aggregated["createdAt"],
            updatedAt=aggregated["updatedAt"]
        )
