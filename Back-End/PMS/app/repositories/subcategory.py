"""
Sub-Category Repository - Database Operations
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, Dict, List
from datetime import datetime
from app.utils.logger import logger
from app.utils.exceptions import DatabaseError, NotFoundError, DuplicateError


class SubCategoryRepository:
    """
    Repository for sub-category database operations.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize sub-category repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.subcategories
    
    async def create(self, subcategory_data: Dict) -> Dict:
        """
        Create a new sub-category.
        
        Args:
            subcategory_data: Sub-category data dictionary
        
        Returns:
            Dict: Created sub-category document
        
        Raises:
            DuplicateError: If sub-category name or code already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check for duplicate code (globally unique)
            existing_code = await self.collection.find_one({
                "code": subcategory_data['code'],
                "isDeleted": False
            })
            
            if existing_code:
                raise DuplicateError(f"Sub-category with code '{subcategory_data['code']}' already exists")
            
            # Check for duplicate name within same category
            existing_name = await self.collection.find_one({
                "categoryId": subcategory_data['categoryId'],
                "name": {"$regex": f"^{subcategory_data['name']}$", "$options": "i"},
                "isDeleted": False
            })
            
            if existing_name:
                raise DuplicateError(
                    f"Sub-category with name '{subcategory_data['name']}' already exists in this category"
                )
            
            # Insert document
            result = await self.collection.insert_one(subcategory_data)
            
            # Retrieve and return created document
            created = await self.collection.find_one({"_id": result.inserted_id})
            logger.info(f"Sub-category created: {created['name']} ({created['code']})")
            
            return created
            
        except DuplicateError:
            raise
        except Exception as e:
            logger.error(f"Failed to create sub-category: {str(e)}")
            raise DatabaseError(f"Failed to create sub-category: {str(e)}")
    
    async def find_by_id(self, subcategory_id: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find sub-category by ID.
        
        Args:
            subcategory_id: Sub-category ID
            include_deleted: Include soft-deleted sub-categories
        
        Returns:
            Optional[Dict]: Sub-category document or None
        """
        try:
            query = {"_id": ObjectId(subcategory_id)}
            if not include_deleted:
                query["isDeleted"] = False
            
            subcategory = await self.collection.find_one(query)
            return subcategory
            
        except Exception as e:
            logger.error(f"Failed to find sub-category by ID: {str(e)}")
            raise DatabaseError(f"Failed to find sub-category: {str(e)}")
    
    async def find_by_code(self, code: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find sub-category by code.
        
        Args:
            code: Sub-category code
            include_deleted: Include soft-deleted sub-categories
        
        Returns:
            Optional[Dict]: Sub-category document or None
        """
        try:
            query = {"code": code}
            if not include_deleted:
                query["isDeleted"] = False
            
            subcategory = await self.collection.find_one(query)
            return subcategory
            
        except Exception as e:
            logger.error(f"Failed to find sub-category by code: {str(e)}")
            raise DatabaseError(f"Failed to find sub-category: {str(e)}")
    
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 20,
        category_id: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        include_deleted: bool = False
    ) -> tuple[List[Dict], int]:
        """
        Find all sub-categories with pagination and filters.
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            category_id: Filter by parent category ID
            is_active: Filter by active status
            search: Search term for name or code
            include_deleted: Include soft-deleted sub-categories
        
        Returns:
            tuple: (List of sub-categories, total count)
        """
        try:
            # Build query
            query = {}
            if not include_deleted:
                query["isDeleted"] = False
            if category_id:
                query["categoryId"] = ObjectId(category_id)
            if is_active is not None:
                query["isActive"] = is_active
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"code": {"$regex": search, "$options": "i"}}
                ]
            
            # Get total count
            total = await self.collection.count_documents(query)
            
            # Get sub-categories with category info
            pipeline = [
                {"$match": query},
                {
                    "$lookup": {
                        "from": "categories",
                        "localField": "categoryId",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
                {"$sort": {"createdAt": -1}},
                {"$skip": skip},
                {"$limit": limit}
            ]
            
            subcategories = await self.collection.aggregate(pipeline).to_list(length=limit)
            
            return subcategories, total
            
        except Exception as e:
            logger.error(f"Failed to find sub-categories: {str(e)}")
            raise DatabaseError(f"Failed to find sub-categories: {str(e)}")
    
    async def update(self, subcategory_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update sub-category by ID.
        
        Args:
            subcategory_id: Sub-category ID
            update_data: Update data dictionary
        
        Returns:
            Optional[Dict]: Updated sub-category document
        
        Raises:
            NotFoundError: If sub-category not found
            DuplicateError: If updated name already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check if sub-category exists
            existing = await self.find_by_id(subcategory_id)
            if not existing:
                raise NotFoundError(f"Sub-category with ID {subcategory_id} not found")
            
            # Check for duplicate name if name is being updated
            if "name" in update_data and update_data["name"] != existing["name"]:
                duplicate = await self.collection.find_one({
                    "categoryId": existing["categoryId"],
                    "name": {"$regex": f"^{update_data['name']}$", "$options": "i"},
                    "_id": {"$ne": ObjectId(subcategory_id)},
                    "isDeleted": False
                })
                if duplicate:
                    raise DuplicateError(
                        f"Sub-category with name '{update_data['name']}' already exists in this category"
                    )
            
            # Update timestamp
            update_data["updatedAt"] = datetime.utcnow()
            
            # Update document
            result = await self.collection.update_one(
                {"_id": ObjectId(subcategory_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                logger.warning(f"Sub-category update resulted in no changes: {subcategory_id}")
            
            # Return updated document
            updated = await self.find_by_id(subcategory_id)
            logger.info(f"Sub-category updated: {subcategory_id}")
            
            return updated
            
        except (NotFoundError, DuplicateError):
            raise
        except Exception as e:
            logger.error(f"Failed to update sub-category: {str(e)}")
            raise DatabaseError(f"Failed to update sub-category: {str(e)}")
    
    async def soft_delete(self, subcategory_id: str) -> bool:
        """
        Soft delete sub-category by ID.
        
        Args:
            subcategory_id: Sub-category ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            NotFoundError: If sub-category not found
            DatabaseError: If database operation fails
        """
        try:
            # Check if sub-category exists
            existing = await self.find_by_id(subcategory_id)
            if not existing:
                raise NotFoundError(f"Sub-category with ID {subcategory_id} not found")
            
            # Soft delete
            result = await self.collection.update_one(
                {"_id": ObjectId(subcategory_id)},
                {
                    "$set": {
                        "isDeleted": True,
                        "isActive": False,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Sub-category soft deleted: {subcategory_id}")
            return result.modified_count > 0
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to delete sub-category: {str(e)}")
            raise DatabaseError(f"Failed to delete sub-category: {str(e)}")
    
    async def count_products(self, subcategory_id: str) -> int:
        """
        Count active products for a sub-category.
        
        Args:
            subcategory_id: Sub-category ID
        
        Returns:
            int: Number of active products
        """
        try:
            count = await self.db.products.count_documents({
                "subCategoryId": ObjectId(subcategory_id),
                "isDeleted": False
            })
            return count
            
        except Exception as e:
            logger.error(f"Failed to count products: {str(e)}")
            raise DatabaseError(f"Failed to count products: {str(e)}")
