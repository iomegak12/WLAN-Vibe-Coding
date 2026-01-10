"""
Product Repository - Database Operations
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, Dict, List
from datetime import datetime
from app.utils.logger import logger
from app.utils.exceptions import DatabaseError, NotFoundError, DuplicateError


class ProductRepository:
    """
    Repository for product database operations.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize product repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.products
    
    async def create(self, product_data: Dict) -> Dict:
        """
        Create a new product.
        
        Args:
            product_data: Product data dictionary
        
        Returns:
            Dict: Created product document
        
        Raises:
            DuplicateError: If product SKU already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check for duplicate SKU
            existing = await self.collection.find_one({
                "sku": product_data['sku'],
                "isDeleted": False
            })
            
            if existing:
                raise DuplicateError(f"Product with SKU '{product_data['sku']}' already exists")
            
            # Insert document
            result = await self.collection.insert_one(product_data)
            
            # Retrieve and return created document
            created = await self.collection.find_one({"_id": result.inserted_id})
            logger.info(f"Product created: {created['name']} ({created['sku']})")
            
            return created
            
        except DuplicateError:
            raise
        except Exception as e:
            logger.error(f"Failed to create product: {str(e)}")
            raise DatabaseError(f"Failed to create product: {str(e)}")
    
    async def find_by_id(self, product_id: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find product by ID.
        
        Args:
            product_id: Product ID
            include_deleted: Include soft-deleted products
        
        Returns:
            Optional[Dict]: Product document or None
        """
        try:
            query = {"_id": ObjectId(product_id)}
            if not include_deleted:
                query["isDeleted"] = False
            
            product = await self.collection.find_one(query)
            return product
            
        except Exception as e:
            logger.error(f"Failed to find product by ID: {str(e)}")
            raise DatabaseError(f"Failed to find product: {str(e)}")
    
    async def find_by_sku(self, sku: str, include_deleted: bool = False) -> Optional[Dict]:
        """
        Find product by SKU.
        
        Args:
            sku: Product SKU
            include_deleted: Include soft-deleted products
        
        Returns:
            Optional[Dict]: Product document or None
        """
        try:
            query = {"sku": sku}
            if not include_deleted:
                query["isDeleted"] = False
            
            product = await self.collection.find_one(query)
            return product
            
        except Exception as e:
            logger.error(f"Failed to find product by SKU: {str(e)}")
            raise DatabaseError(f"Failed to find product: {str(e)}")
    
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 20,
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
        sort_order: Optional[str] = "asc",
        include_deleted: bool = False
    ) -> tuple[List[Dict], int]:
        """
        Find all products with pagination, advanced filters, and sorting.
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            category_id: Filter by category ID
            subcategory_id: Filter by sub-category ID
            brand: Filter by brand
            is_active: Filter by active status
            search: Search term for name, SKU, brand
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
            include_deleted: Include soft-deleted products
        
        Returns:
            tuple: (List of products with category/subcategory info, total count)
        """
        try:
            from datetime import datetime as dt
            
            # Build query
            query = {}
            if not include_deleted:
                query["isDeleted"] = False
            if category_id:
                query["categoryId"] = ObjectId(category_id)
            if subcategory_id:
                query["subCategoryId"] = ObjectId(subcategory_id)
            if brand:
                query["brand"] = {"$regex": brand, "$options": "i"}
            if is_active is not None:
                query["isActive"] = is_active
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"sku": {"$regex": search, "$options": "i"}},
                    {"brand": {"$regex": search, "$options": "i"}},
                    {"tags": {"$regex": search, "$options": "i"}}
                ]
            if tags:
                query["tags"] = {"$in": tags}
            
            # Price range filter
            if min_price is not None or max_price is not None:
                query["unitPrice"] = {}
                if min_price is not None:
                    query["unitPrice"]["$gte"] = min_price
                if max_price is not None:
                    query["unitPrice"]["$lte"] = max_price
            
            # Stock status filter (using aggregation pipeline expressions)
            stock_match = None
            if stock_status == 'out-of-stock':
                query["currentStock"] = 0
            elif stock_status == 'low-stock':
                # Will handle in aggregation pipeline
                stock_match = "low"
            elif stock_status == 'in-stock':
                # Will handle in aggregation pipeline
                stock_match = "in"
            
            # Date range filters
            if created_from or created_to:
                query["createdAt"] = {}
                if created_from:
                    try:
                        query["createdAt"]["$gte"] = dt.fromisoformat(created_from.replace('Z', '+00:00'))
                    except:
                        pass  # Invalid date format, ignore
                if created_to:
                    try:
                        query["createdAt"]["$lte"] = dt.fromisoformat(created_to.replace('Z', '+00:00'))
                    except:
                        pass
            
            if updated_from or updated_to:
                query["updatedAt"] = {}
                if updated_from:
                    try:
                        query["updatedAt"]["$gte"] = dt.fromisoformat(updated_from.replace('Z', '+00:00'))
                    except:
                        pass
                if updated_to:
                    try:
                        query["updatedAt"]["$lte"] = dt.fromisoformat(updated_to.replace('Z', '+00:00'))
                    except:
                        pass
            
            # Build aggregation pipeline
            pipeline = [
                {"$match": query}
            ]
            
            # Add stock status filter using $expr if needed
            if stock_match == "low":
                pipeline.append({
                    "$match": {
                        "$expr": {
                            "$and": [
                                {"$gt": ["$currentStock", 0]},
                                {"$lt": ["$currentStock", "$reorderPoint"]}
                            ]
                        }
                    }
                })
            elif stock_match == "in":
                pipeline.append({
                    "$match": {
                        "$expr": {
                            "$gte": ["$currentStock", "$reorderPoint"]
                        }
                    }
                })
            
            # Get total count before pagination
            count_pipeline = pipeline.copy()
            count_pipeline.append({"$count": "total"})
            count_result = await self.collection.aggregate(count_pipeline).to_list(length=1)
            total = count_result[0]["total"] if count_result else 0
            
            # Add lookups for category and subcategory
            pipeline.extend([
                {
                    "$lookup": {
                        "from": "categories",
                        "localField": "categoryId",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
                {
                    "$lookup": {
                        "from": "subcategories",
                        "localField": "subCategoryId",
                        "foreignField": "_id",
                        "as": "subcategory"
                    }
                },
                {"$unwind": {"path": "$subcategory", "preserveNullAndEmptyArrays": True}}
            ])
            
            # Add sorting
            sort_field_map = {
                "name": "name",
                "price": "unitPrice",
                "createdAt": "createdAt",
                "updatedAt": "updatedAt"
            }
            sort_field = sort_field_map.get(sort_by, "createdAt")
            sort_direction = 1 if sort_order == "asc" else -1
            pipeline.append({"$sort": {sort_field: sort_direction}})
            
            # Add pagination
            pipeline.extend([
                {"$skip": skip},
                {"$limit": limit}
            ])
            
            products = await self.collection.aggregate(pipeline).to_list(length=limit)
            
            return products, total
            
        except Exception as e:
            logger.error(f"Failed to find products: {str(e)}")
            raise DatabaseError(f"Failed to find products: {str(e)}")
    
    async def update(self, product_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update product by ID.
        
        Args:
            product_id: Product ID
            update_data: Update data dictionary
        
        Returns:
            Optional[Dict]: Updated product document
        
        Raises:
            NotFoundError: If product not found
            DatabaseError: If database operation fails
        """
        try:
            # Check if product exists
            existing = await self.find_by_id(product_id)
            if not existing:
                raise NotFoundError(f"Product with ID {product_id} not found")
            
            # Update timestamp
            update_data["updatedAt"] = datetime.utcnow()
            
            # Update document
            result = await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                logger.warning(f"Product update resulted in no changes: {product_id}")
            
            # Return updated document
            updated = await self.find_by_id(product_id)
            logger.info(f"Product updated: {product_id}")
            
            return updated
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to update product: {str(e)}")
            raise DatabaseError(f"Failed to update product: {str(e)}")
    
    async def soft_delete(self, product_id: str) -> bool:
        """
        Soft delete product by ID.
        
        Args:
            product_id: Product ID
        
        Returns:
            bool: True if deleted successfully
        
        Raises:
            NotFoundError: If product not found
            DatabaseError: If database operation fails
        """
        try:
            # Check if product exists
            existing = await self.find_by_id(product_id)
            if not existing:
                raise NotFoundError(f"Product with ID {product_id} not found")
            
            # Soft delete
            result = await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {
                    "$set": {
                        "isDeleted": True,
                        "isActive": False,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Product soft deleted: {product_id}")
            return result.modified_count > 0
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to delete product: {str(e)}")
            raise DatabaseError(f"Failed to delete product: {str(e)}")
    
    async def get_next_sequence_number(self, category_code: str, subcategory_code: str, brand: str) -> int:
        """
        Get next sequence number for SKU generation.
        
        Args:
            category_code: Category code
            subcategory_code: Sub-category code
            brand: Brand name
        
        Returns:
            int: Next sequence number
        """
        try:
            # Find highest sequence number for this combination
            prefix = f"{category_code}-{subcategory_code}-{brand.upper()[:10]}-"
            
            pipeline = [
                {
                    "$match": {
                        "sku": {"$regex": f"^{prefix}"},
                        "isDeleted": False
                    }
                },
                {
                    "$project": {
                        "sequence": {
                            "$toInt": {
                                "$arrayElemAt": [
                                    {"$split": ["$sku", "-"]},
                                    3
                                ]
                            }
                        }
                    }
                },
                {"$sort": {"sequence": -1}},
                {"$limit": 1}
            ]
            
            result = await self.collection.aggregate(pipeline).to_list(length=1)
            
            if result:
                return result[0]["sequence"] + 1
            else:
                return 1
                
        except Exception as e:
            logger.error(f"Failed to get sequence number: {str(e)}")
            return 1  # Default to 1 if error
