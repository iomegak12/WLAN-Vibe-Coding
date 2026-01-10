"""
Category Service - Business Logic
"""

from typing import Optional, Dict, List
from bson import ObjectId
from datetime import datetime
import re
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from app.schemas.common import PaginationParams
from app.utils.logger import logger
from app.utils.exceptions import ValidationError, NotFoundError, DuplicateError


class CategoryService:
    """
    Service for category business logic.
    """
    
    def __init__(self, repository: CategoryRepository):
        """
        Initialize category service.
        
        Args:
            repository: Category repository instance
        """
        self.repository = repository
    
    def _generate_code(self, name: str) -> str:
        """
        Auto-generate category code from name.
        Examples:
        - "Electronics" -> "ELEC"
        - "Networking Equipment" -> "NETWORK"
        - "Audio & Video" -> "AUDIO"
        
        Args:
            name: Category name
        
        Returns:
            str: Generated code
        """
        # Remove special characters and split into words
        clean_name = re.sub(r'[^a-zA-Z\s]', '', name)
        words = clean_name.strip().upper().split()
        
        if not words:
            raise ValidationError("Cannot generate code from empty name")
        
        # Take first word (or first 6 chars if single word)
        if len(words) == 1:
            code = words[0][:6]
        else:
            code = words[0][:10]
        
        return code
    
    async def create_category(
        self,
        category_data: CategoryCreate,
        user_id: Optional[str] = None
    ) -> CategoryResponse:
        """
        Create a new category.
        
        Args:
            category_data: Category creation data
            user_id: ID of user creating the category
        
        Returns:
            CategoryResponse: Created category
        
        Raises:
            ValidationError: If validation fails
            DuplicateError: If category already exists
        """
        # Auto-generate code if not provided
        code = category_data.code or self._generate_code(category_data.name)
        
        # Prepare document
        category_doc = {
            "name": category_data.name,
            "code": code,
            "description": category_data.description,
            "isActive": category_data.isActive,
            "isDeleted": False,
            "createdBy": ObjectId(user_id) if user_id else None,
            "updatedBy": ObjectId(user_id) if user_id else None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Create in database
        created = await self.repository.create(category_doc)
        
        # Convert to response schema
        return self._to_response(created)
    
    async def get_category(self, category_id: str) -> CategoryResponse:
        """
        Get category by ID.
        
        Args:
            category_id: Category ID
        
        Returns:
            CategoryResponse: Category data
        
        Raises:
            NotFoundError: If category not found
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(category_id):
            raise ValidationError(f"Invalid category ID format: {category_id}")
        
        category = await self.repository.find_by_id(category_id)
        
        if not category:
            raise NotFoundError(f"Category with ID {category_id} not found")
        
        return self._to_response(category)
    
    async def list_categories(
        self,
        pagination: PaginationParams,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> CategoryListResponse:
        """
        List categories with pagination and filters.
        
        Args:
            pagination: Pagination parameters
            is_active: Filter by active status
            search: Search term
        
        Returns:
            CategoryListResponse: List of categories with pagination
        """
        categories, total = await self.repository.find_all(
            skip=pagination.skip,
            limit=pagination.limit,
            is_active=is_active,
            search=search
        )
        
        # Convert to response schemas
        items = [self._to_response(cat) for cat in categories]
        
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
        
        return CategoryListResponse(items=items, pagination=pagination_data)
    
    async def update_category(
        self,
        category_id: str,
        update_data: CategoryUpdate,
        user_id: Optional[str] = None
    ) -> CategoryResponse:
        """
        Update category.
        
        Args:
            category_id: Category ID
            update_data: Update data
            user_id: ID of user updating the category
        
        Returns:
            CategoryResponse: Updated category
        
        Raises:
            ValidationError: If validation fails
            NotFoundError: If category not found
            DuplicateError: If updated name already exists
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(category_id):
            raise ValidationError(f"Invalid category ID format: {category_id}")
        
        # Prepare update document (only include provided fields)
        update_doc = update_data.model_dump(exclude_unset=True)
        
        if not update_doc:
            raise ValidationError("No fields to update")
        
        # Add updater info
        if user_id:
            update_doc["updatedBy"] = ObjectId(user_id)
        
        # Update in database
        updated = await self.repository.update(category_id, update_doc)
        
        return self._to_response(updated)
    
    async def delete_category(self, category_id: str) -> bool:
        """
        Delete category (soft delete).
        
        Args:
            category_id: Category ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            ValidationError: If category has active sub-categories
            NotFoundError: If category not found
        """
        # Validate ObjectId format
        if not ObjectId.is_valid(category_id):
            raise ValidationError(f"Invalid category ID format: {category_id}")
        
        # Check for active sub-categories
        subcat_count = await self.repository.count_subcategories(category_id)
        if subcat_count > 0:
            raise ValidationError(
                f"Cannot delete category with {subcat_count} active sub-categories. "
                "Please delete or reassign sub-categories first."
            )
        
        # Soft delete
        return await self.repository.soft_delete(category_id)
    
    def _to_response(self, category: Dict) -> CategoryResponse:
        """
        Convert database document to response schema.
        
        Args:
            category: Category document from database
        
        Returns:
            CategoryResponse: Response schema
        """
        return CategoryResponse(
            id=str(category["_id"]),
            name=category["name"],
            code=category["code"],
            description=category.get("description"),
            isActive=category["isActive"],
            isDeleted=category["isDeleted"],
            createdBy=str(category["createdBy"]) if category.get("createdBy") else None,
            updatedBy=str(category["updatedBy"]) if category.get("updatedBy") else None,
            createdAt=category["createdAt"],
            updatedAt=category["updatedAt"]
        )
