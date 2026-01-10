"""
Category Pydantic Schemas
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.common import PyObjectId


class CategoryBase(BaseModel):
    """
    Base category schema with common fields.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Category name")
    description: Optional[str] = Field(None, max_length=500, description="Category description")
    isActive: bool = Field(default=True, description="Active status")
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        """Validate category name is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError('Category name cannot be empty')
        return v.strip()


class CategoryCreate(CategoryBase):
    """
    Schema for creating a new category.
    """
    code: Optional[str] = Field(None, min_length=2, max_length=10, description="Category code (auto-generated if not provided)")
    
    @field_validator('code')
    @classmethod
    def code_must_be_uppercase(cls, v: Optional[str]) -> Optional[str]:
        """Validate category code is uppercase and alphanumeric."""
        if v is not None:
            v = v.strip().upper()
            if not v.replace('_', '').isalnum():
                raise ValueError('Category code must be alphanumeric')
            return v
        return None


class CategoryUpdate(BaseModel):
    """
    Schema for updating a category.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isActive: Optional[bool] = None
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate category name is not empty or whitespace."""
        if v is not None:
            if not v.strip():
                raise ValueError('Category name cannot be empty')
            return v.strip()
        return None


class CategoryResponse(BaseModel):
    """
    Schema for category response.
    """
    id: str = Field(..., description="Category ID")
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
                "id": "6789abcd1234567890123456",
                "name": "Electronics",
                "code": "ELEC",
                "description": "Electronic devices and accessories",
                "isActive": True,
                "isDeleted": False,
                "createdBy": "6789abcd1234567890123450",
                "updatedBy": "6789abcd1234567890123450",
                "createdAt": "2026-01-10T10:30:00Z",
                "updatedAt": "2026-01-10T10:30:00Z"
            }
        }
    }


class CategoryListResponse(BaseModel):
    """
    Schema for paginated category list response.
    """
    items: list[CategoryResponse]
    pagination: dict
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {
                        "id": "6789abcd1234567890123456",
                        "name": "Electronics",
                        "code": "ELEC",
                        "description": "Electronic devices",
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
