"""
Category Repository - Database Operations
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, Dict, List
from datetime import datetime
from app.utils.logger import logger
from app.utils.exceptions import DatabaseError, NotFoundError, DuplicateError


class CategoryRepository:
    """
    Repository for category database operations.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize category repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.categories
    
    async def create(self, category_data: Dict) -> Dict:
        """
        Create a new category.
        
        Args:
            category_data: Category data dictionary
        
        Returns:
            Dict: Created category document
        
        Raises:
            DuplicateError: If category name or code already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check for duplicate name or code
            existing = await self.collection.find_one({
                "$or": [
                    {"name": {"$regex": f"^{category_data['name']}$", "$options": "i"}},
                    {"code": category_data['code']}
                ],
                "isDeleted": False
            })
            
            if existing:
                if existing['name'].lower() == category_data['name'].lower():
                    raise DuplicateError(f"Category with name '{category_data['name']}' already exists")
                else:
                    raise DuplicateError(f"Category with code '{category_data['code']}' already exists")
            
            # Insert document
            result = await self.collection.insert_one(category_data)
            
            # Retrieve and return created document
            created = await self.collection.find_one({"_id": result.inserted_id})
            logger.info(f"Category created: {created['name']} ({created['code']})")
            
            return created
            
        except DuplicateError:
            raise
        except Exception as e:
            logger.error(f"Failed to create category: {str(e)}")
            raise DatabaseError(f"Failed to create category: {str(e)}")
    
    async def find_by_id(self, category_id: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find category by ID.
        
        Args:
            category_id: Category ID
            include_deleted: Include soft-deleted categories
        
        Returns:
            Optional[Dict]: Category document or None
        """
        try:
            query = {"_id": ObjectId(category_id)}
            if not include_deleted:
                query["isDeleted"] = False
            
            category = await self.collection.find_one(query)
            return category
            
        except Exception as e:
            logger.error(f"Failed to find category by ID: {str(e)}")
            raise DatabaseError(f"Failed to find category: {str(e)}")
    
    async def find_by_code(self, code: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find category by code.
        
        Args:
            code: Category code
            include_deleted: Include soft-deleted categories
        
        Returns:
            Optional[Dict]: Category document or None
        """
        try:
            query = {"code": code}
            if not include_deleted:
                query["isDeleted"] = False
            
            category = await self.collection.find_one(query)
            return category
            
        except Exception as e:
            logger.error(f"Failed to find category by code: {str(e)}")
            raise DatabaseError(f"Failed to find category: {str(e)}")
    
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 20,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        include_deleted: bool = False
    ) -> tuple[List[Dict], int]:
        """
        Find all categories with pagination and filters.
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            is_active: Filter by active status
            search: Search term for name or code
            include_deleted: Include soft-deleted categories
        
        Returns:
            tuple: (List of categories, total count)
        """
        try:
            # Build query
            query = {}
            if not include_deleted:
                query["isDeleted"] = False
            if is_active is not None:
                query["isActive"] = is_active
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"code": {"$regex": search, "$options": "i"}}
                ]
            
            # Get total count
            total = await self.collection.count_documents(query)
            
            # Get categories
            cursor = self.collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
            categories = await cursor.to_list(length=limit)
            
            return categories, total
            
        except Exception as e:
            logger.error(f"Failed to find categories: {str(e)}")
            raise DatabaseError(f"Failed to find categories: {str(e)}")
    
    async def update(self, category_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update category by ID.
        
        Args:
            category_id: Category ID
            update_data: Update data dictionary
        
        Returns:
            Optional[Dict]: Updated category document
        
        Raises:
            NotFoundError: If category not found
            DuplicateError: If updated name already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check if category exists
            existing = await self.find_by_id(category_id)
            if not existing:
                raise NotFoundError(f"Category with ID {category_id} not found")
            
            # Check for duplicate name if name is being updated
            if "name" in update_data and update_data["name"] != existing["name"]:
                duplicate = await self.collection.find_one({
                    "name": {"$regex": f"^{update_data['name']}$", "$options": "i"},
                    "_id": {"$ne": ObjectId(category_id)},
                    "isDeleted": False
                })
                if duplicate:
                    raise DuplicateError(f"Category with name '{update_data['name']}' already exists")
            
            # Update timestamp
            update_data["updatedAt"] = datetime.utcnow()
            
            # Update document
            result = await self.collection.update_one(
                {"_id": ObjectId(category_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                logger.warning(f"Category update resulted in no changes: {category_id}")
            
            # Return updated document
            updated = await self.find_by_id(category_id)
            logger.info(f"Category updated: {category_id}")
            
            return updated
            
        except (NotFoundError, DuplicateError):
            raise
        except Exception as e:
            logger.error(f"Failed to update category: {str(e)}")
            raise DatabaseError(f"Failed to update category: {str(e)}")
    
    async def soft_delete(self, category_id: str) -> bool:
        """
        Soft delete category by ID.
        
        Args:
            category_id: Category ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            NotFoundError: If category not found
            DatabaseError: If database operation fails
        """
        try:
            # Check if category exists
            existing = await self.find_by_id(category_id)
            if not existing:
                raise NotFoundError(f"Category with ID {category_id} not found")
            
            # Soft delete
            result = await self.collection.update_one(
                {"_id": ObjectId(category_id)},
                {
                    "$set": {
                        "isDeleted": True,
                        "isActive": False,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Category soft deleted: {category_id}")
            return result.modified_count > 0
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to delete category: {str(e)}")
            raise DatabaseError(f"Failed to delete category: {str(e)}")
    
    async def count_subcategories(self, category_id: str) -> int:
        """
        Count active sub-categories for a category.
        
        Args:
            category_id: Category ID
        
        Returns:
            int: Number of active sub-categories
        """
        try:
            count = await self.db.subcategories.count_documents({
                "categoryId": ObjectId(category_id),
                "isDeleted": False
            })
            return count
            
        except Exception as e:
            logger.error(f"Failed to count sub-categories: {str(e)}")
            raise DatabaseError(f"Failed to count sub-categories: {str(e)}")
