"""
Common Pydantic Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class PyObjectId(str):
    """
    Custom Pydantic type for MongoDB ObjectId.
    """
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        from bson import ObjectId
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class PaginationParams(BaseModel):
    """
    Pagination parameters for list endpoints.
    """
    page: int = Field(default=1, ge=1, description="Page number (1-based)")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for database query."""
        return (self.page - 1) * self.limit


class TimestampMixin(BaseModel):
    """
    Mixin for timestamp fields.
    """
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class UserTrackingMixin(BaseModel):
    """
    Mixin for user tracking fields.
    """
    createdBy: Optional[PyObjectId] = None
    updatedBy: Optional[PyObjectId] = None


class SoftDeleteMixin(BaseModel):
    """
    Mixin for soft delete functionality.
    """
    isDeleted: bool = Field(default=False)


class ActiveStatusMixin(BaseModel):
    """
    Mixin for active status.
    """
    isActive: bool = Field(default=True)
