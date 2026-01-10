"""
Database Configuration and Connection Management
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorGridFSBucket
from typing import Optional
from app.config.settings import settings
from app.utils.logger import logger


class Database:
    """
    MongoDB Database Connection Manager
    """
    
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None
    gridfs_bucket: Optional[AsyncIOMotorGridFSBucket] = None
    
    @classmethod
    async def connect_db(cls) -> None:
        """
        Establish connection to MongoDB database.
        """
        try:
            logger.info("Connecting to MongoDB...")
            cls.client = AsyncIOMotorClient(settings.mongodb_uri)
            cls.database = cls.client[settings.mongodb_database]
            cls.gridfs_bucket = AsyncIOMotorGridFSBucket(
                cls.database,
                bucket_name=settings.mongodb_gridfs_bucket
            )
            
            # Test connection
            await cls.client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB database: {settings.mongodb_database}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    @classmethod
    async def close_db(cls) -> None:
        """
        Close MongoDB database connection.
        """
        if cls.client:
            logger.info("Closing MongoDB connection...")
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        """
        Get database instance.
        
        Returns:
            AsyncIOMotorDatabase: MongoDB database instance
        """
        if cls.database is None:
            raise RuntimeError("Database not initialized. Call connect_db() first.")
        return cls.database
    
    @classmethod
    def get_gridfs_bucket(cls) -> AsyncIOMotorGridFSBucket:
        """
        Get GridFS bucket instance.
        
        Returns:
            AsyncIOMotorGridFSBucket: GridFS bucket instance
        """
        if cls.gridfs_bucket is None:
            raise RuntimeError("GridFS bucket not initialized. Call connect_db() first.")
        return cls.gridfs_bucket
    
    @classmethod
    async def check_connection(cls) -> bool:
        """
        Check if database connection is alive.
        
        Returns:
            bool: True if connected, False otherwise
        """
        try:
            if cls.client:
                await cls.client.admin.command('ping')
                return True
            return False
        except Exception as e:
            logger.error(f"Database connection check failed: {str(e)}")
            return False


# Dependency for FastAPI routes
async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency to get database instance in routes.
    
    Returns:
        AsyncIOMotorDatabase: MongoDB database instance
    """
    return Database.get_database()


async def get_gridfs() -> AsyncIOMotorGridFSBucket:
    """
    Dependency to get GridFS bucket instance in routes.
    
    Returns:
        AsyncIOMotorGridFSBucket: GridFS bucket instance
    """
    return Database.get_gridfs_bucket()
