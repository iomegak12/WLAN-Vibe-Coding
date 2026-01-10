"""
Database Bootstrap Script
Creates collections and indexes on application startup
"""

from app.config.database import Database
from app.utils.logger import logger
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT


async def bootstrap_database() -> None:
    """
    Bootstrap the database by creating collections and indexes.
    This function is idempotent - safe to run multiple times.
    """
    logger.info("Starting database bootstrap...")
    
    try:
        db = Database.get_database()
        
        # Get existing collections
        existing_collections = await db.list_collection_names()
        
        # Bootstrap Categories Collection
        await _bootstrap_categories(db, existing_collections)
        
        # Bootstrap SubCategories Collection
        await _bootstrap_subcategories(db, existing_collections)
        
        # Bootstrap Products Collection
        await _bootstrap_products(db, existing_collections)
        
        logger.info("Database bootstrap completed successfully")
        
    except Exception as e:
        logger.error(f"Database bootstrap failed: {str(e)}")
        raise


async def _bootstrap_categories(db, existing_collections: list) -> None:
    """
    Bootstrap categories collection.
    
    Args:
        db: Database instance
        existing_collections: List of existing collection names
    """
    collection_name = "categories"
    
    if collection_name not in existing_collections:
        # Create collection
        await db.create_collection(collection_name)
        logger.info(f"Created collection: {collection_name}")
    else:
        logger.info(f"Collection already exists: {collection_name}")
    
    # Create indexes
    collection = db[collection_name]
    
    indexes = [
        IndexModel([("code", ASCENDING)], unique=True, name="idx_category_code_unique"),
        IndexModel(
            [("name", ASCENDING)],
            unique=True,
            name="idx_category_name_unique",
            collation={"locale": "en", "strength": 2}
        ),
        IndexModel([("isActive", ASCENDING), ("isDeleted", ASCENDING)], name="idx_category_active"),
        IndexModel([("name", TEXT), ("code", TEXT)], name="idx_category_search"),
        IndexModel([("createdAt", DESCENDING)], name="idx_category_created"),
    ]
    
    # Drop existing indexes (except _id) and create new ones
    existing_indexes = await collection.list_indexes().to_list(length=None)
    for index in existing_indexes:
        if index["name"] != "_id_":
            await collection.drop_index(index["name"])
    
    await collection.create_indexes(indexes)
    logger.info(f"Created {len(indexes)} indexes for {collection_name}")


async def _bootstrap_subcategories(db, existing_collections: list) -> None:
    """
    Bootstrap subcategories collection.
    
    Args:
        db: Database instance
        existing_collections: List of existing collection names
    """
    collection_name = "subcategories"
    
    if collection_name not in existing_collections:
        await db.create_collection(collection_name)
        logger.info(f"Created collection: {collection_name}")
    else:
        logger.info(f"Collection already exists: {collection_name}")
    
    collection = db[collection_name]
    
    indexes = [
        IndexModel([("code", ASCENDING)], unique=True, name="idx_subcategory_code_unique"),
        IndexModel(
            [("categoryId", ASCENDING), ("name", ASCENDING)],
            unique=True,
            name="idx_subcategory_category_name_unique",
            collation={"locale": "en", "strength": 2}
        ),
        IndexModel([("categoryId", ASCENDING)], name="idx_subcategory_category"),
        IndexModel([("isActive", ASCENDING), ("isDeleted", ASCENDING)], name="idx_subcategory_active"),
        IndexModel([("name", TEXT), ("code", TEXT)], name="idx_subcategory_search"),
        IndexModel([("createdAt", DESCENDING)], name="idx_subcategory_created"),
    ]
    
    existing_indexes = await collection.list_indexes().to_list(length=None)
    for index in existing_indexes:
        if index["name"] != "_id_":
            await collection.drop_index(index["name"])
    
    await collection.create_indexes(indexes)
    logger.info(f"Created {len(indexes)} indexes for {collection_name}")


async def _bootstrap_products(db, existing_collections: list) -> None:
    """
    Bootstrap products collection.
    
    Args:
        db: Database instance
        existing_collections: List of existing collection names
    """
    collection_name = "products"
    
    if collection_name not in existing_collections:
        await db.create_collection(collection_name)
        logger.info(f"Created collection: {collection_name}")
    else:
        logger.info(f"Collection already exists: {collection_name}")
    
    collection = db[collection_name]
    
    indexes = [
        IndexModel([("sku", ASCENDING)], unique=True, name="idx_product_sku_unique"),
        IndexModel([("categoryId", ASCENDING)], name="idx_product_category"),
        IndexModel([("subCategoryId", ASCENDING)], name="idx_product_subcategory"),
        IndexModel([("brand", ASCENDING)], name="idx_product_brand"),
        IndexModel([("status", ASCENDING)], name="idx_product_status"),
        IndexModel([("isActive", ASCENDING), ("isDeleted", ASCENDING)], name="idx_product_active"),
        IndexModel(
            [("categoryId", ASCENDING), ("subCategoryId", ASCENDING)],
            name="idx_product_category_subcategory"
        ),
        IndexModel(
            [("isActive", ASCENDING), ("status", ASCENDING)],
            name="idx_product_active_status"
        ),
        IndexModel(
            [("name", TEXT), ("brand", TEXT), ("model", TEXT), ("description", TEXT)],
            name="idx_product_search"
        ),
        IndexModel([("createdAt", DESCENDING)], name="idx_product_created"),
        IndexModel([("price", ASCENDING)], name="idx_product_price"),
    ]
    
    existing_indexes = await collection.list_indexes().to_list(length=None)
    for index in existing_indexes:
        if index["name"] != "_id_":
            await collection.drop_index(index["name"])
    
    await collection.create_indexes(indexes)
    logger.info(f"Created {len(indexes)} indexes for {collection_name}")
