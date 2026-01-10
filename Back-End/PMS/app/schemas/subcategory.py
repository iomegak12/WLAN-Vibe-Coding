"""
Sub-Category Pydantic Schemas
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.common import PyObjectId


class SubCategoryBase(BaseModel):
    """
    Base sub-category schema with common fields.
    """
    categoryId: str = Field(..., description="Parent category ID")
    name: str = Field(..., min_length=2, max_length=100, description="Sub-category name")
    description: Optional[str] = Field(None, max_length=500, description="Sub-category description")
    isActive: bool = Field(default=True, description="Active status")
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        """Validate sub-category name is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError('Sub-category name cannot be empty')
        return v.strip()
    
    @field_validator('categoryId')
    @classmethod
    def validate_category_id(cls, v: str) -> str:
        """Validate category ID format."""
        from bson import ObjectId
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid category ID format')
        return v


class SubCategoryCreate(SubCategoryBase):
    """
    Schema for creating a new sub-category.
    """
    code: Optional[str] = Field(None, min_length=2, max_length=10, description="Sub-category code (auto-generated if not provided)")
    
    @field_validator('code')
    @classmethod
    def code_must_be_uppercase(cls, v: Optional[str]) -> Optional[str]:
        """Validate sub-category code is uppercase and alphanumeric."""
        if v is not None:
            v = v.strip().upper()
            if not v.replace('_', '').isalnum():
                raise ValueError('Sub-category code must be alphanumeric')
            return v
        return None


class SubCategoryUpdate(BaseModel):
    """
    Schema for updating a sub-category.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isActive: Optional[bool] = None
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate sub-category name is not empty or whitespace."""
        if v is not None:
            if not v.strip():
                raise ValueError('Sub-category name cannot be empty')
            return v.strip()
        return None


class SubCategoryResponse(BaseModel):
    """
    Schema for sub-category response.
    """
    id: str = Field(..., description="Sub-category ID")
    categoryId: str
    categoryName: str
    categoryCode: str
    name: str
    code: str
    description: Optional[str]
    isActive: bool
    isDeleted: bool
    createdBy: Optional[str]
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "6789abcd1234567890123457",
                "categoryId": "6789abcd1234567890123456",
                "categoryName": "Electronics",
                "categoryCode": "ELEC",
                "name": "Routers",
                "code": "ROUTER",
                "description": "Wireless and wired routers",
                "isActive": True,
                "isDeleted": False,
                "createdBy": "6789abcd1234567890123450",
                "updatedBy": "6789abcd1234567890123450",
                "createdAt": "2026-01-10T10:30:00Z",
                "updatedAt": "2026-01-10T10:30:00Z"
            }
        }
    }


class SubCategoryListResponse(BaseModel):
    """
    Schema for paginated sub-category list response.
    """
    items: list[SubCategoryResponse]
    pagination: dict
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {
                        "id": "6789abcd1234567890123457",
                        "categoryId": "6789abcd1234567890123456",
                        "categoryName": "Electronics",
                        "categoryCode": "ELEC",
                        "name": "Routers",
                        "code": "ROUTER",
                        "description": "Wireless routers",
                        "isActive": True,
                        "isDeleted": False,
                        "createdBy": "6789abcd1234567890123450",
                        "updatedBy": "6789abcd1234567890123450",
                        "createdAt": "2026-01-10T10:30:00Z",
                        "updatedAt": "2026-01-10T10:30:00Z"
                    }
                ],
                "pagination": {
                    "page": 1,
                    "limit": 20,
                    "total": 50,
                    "pages": 3,
                    "hasNext": True,
                    "hasPrev": False
                }
            }
        }
    }
