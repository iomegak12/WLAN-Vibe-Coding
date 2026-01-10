"""
Product Pydantic Schemas
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class ProductBase(BaseModel):
    """
    Base product schema with common fields.
    """
    name: str = Field(..., min_length=2, max_length=200, description="Product name")
    categoryId: str = Field(..., description="Category ID")
    subCategoryId: str = Field(..., description="Sub-category ID")
    brand: str = Field(..., min_length=2, max_length=100, description="Brand name")
    description: Optional[str] = Field(None, max_length=2000, description="Product description")
    specifications: Optional[dict] = Field(default_factory=dict, description="Technical specifications")
    unitPrice: Decimal = Field(..., gt=0, description="Unit price")
    currency: str = Field(default="INR", max_length=3, description="Currency code")
    currentStock: int = Field(default=0, ge=0, description="Current stock quantity")
    minStockLevel: int = Field(default=10, ge=0, description="Minimum stock level for alerts")
    maxStockLevel: int = Field(default=1000, ge=0, description="Maximum stock level")
    reorderPoint: int = Field(default=20, ge=0, description="Reorder point threshold")
    unit: str = Field(default="PCS", max_length=20, description="Unit of measurement (PCS, KG, L, etc.)")
    weight: Optional[Decimal] = Field(None, gt=0, description="Weight in kg")
    dimensions: Optional[dict] = Field(None, description="Dimensions (length, width, height in cm)")
    manufacturer: Optional[str] = Field(None, max_length=100, description="Manufacturer name")
    warrantyPeriod: Optional[int] = Field(None, ge=0, description="Warranty period in months")
    tags: List[str] = Field(default_factory=list, description="Product tags for search")
    isActive: bool = Field(default=True, description="Active status")
    
    @field_validator('name', 'brand')
    @classmethod
    def validate_not_empty(cls, v: str, info) -> str:
        """Validate field is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError(f'{info.field_name} cannot be empty')
        return v.strip()
    
    @field_validator('categoryId', 'subCategoryId')
    @classmethod
    def validate_object_id(cls, v: str, info) -> str:
        """Validate ObjectId format."""
        from bson import ObjectId
        if not ObjectId.is_valid(v):
            raise ValueError(f'Invalid {info.field_name} format')
        return v
    
    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Validate currency code."""
        v = v.strip().upper()
        if len(v) != 3:
            raise ValueError('Currency must be 3-letter code (e.g., INR, USD)')
        return v
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate and clean tags."""
        return [tag.strip().lower() for tag in v if tag.strip()]


class ProductCreate(ProductBase):
    """
    Schema for creating a new product.
    """
    sku: Optional[str] = Field(None, max_length=50, description="SKU (auto-generated if not provided)")
    
    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        """Validate SKU format."""
        if v is not None:
            v = v.strip().upper()
            if not v.replace('-', '').replace('_', '').isalnum():
                raise ValueError('SKU must be alphanumeric with hyphens/underscores')
            return v
        return None


class ProductUpdate(BaseModel):
    """
    Schema for updating a product.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    brand: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    specifications: Optional[dict] = None
    unitPrice: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    currentStock: Optional[int] = Field(None, ge=0)
    minStockLevel: Optional[int] = Field(None, ge=0)
    maxStockLevel: Optional[int] = Field(None, ge=0)
    reorderPoint: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=20)
    weight: Optional[Decimal] = Field(None, gt=0)
    dimensions: Optional[dict] = None
    manufacturer: Optional[str] = Field(None, max_length=100)
    warrantyPeriod: Optional[int] = Field(None, ge=0)
    tags: Optional[List[str]] = None
    isActive: Optional[bool] = None
    
    @field_validator('name', 'brand')
    @classmethod
    def validate_not_empty(cls, v: Optional[str], info) -> Optional[str]:
        """Validate field is not empty or whitespace."""
        if v is not None:
            if not v.strip():
                raise ValueError(f'{info.field_name} cannot be empty')
            return v.strip()
        return None
    
    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        """Validate currency code."""
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3:
                raise ValueError('Currency must be 3-letter code')
            return v
        return None
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate and clean tags."""
        if v is not None:
            return [tag.strip().lower() for tag in v if tag.strip()]
        return None


class ProductResponse(BaseModel):
    """
    Schema for product response.
    """
    id: str
    sku: str
    name: str
    categoryId: str
    categoryName: str
    categoryCode: str
    subCategoryId: str
    subCategoryName: str
    subCategoryCode: str
    brand: str
    description: Optional[str]
    specifications: dict
    unitPrice: Decimal
    currency: str
    minStockLevel: int
    maxStockLevel: int
    reorderPoint: int
    unit: str
    weight: Optional[Decimal]
    dimensions: Optional[dict]
    manufacturer: Optional[str]
    warrantyPeriod: Optional[int]
    tags: List[str]
    qrCode: Optional[str]
    barcode: Optional[str]
    images: List[str]
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
                "id": "6789abcd1234567890123458",
                "sku": "ELEC-ROUTER-CISCO-0001",
                "name": "Cisco Wireless Router AC1900",
                "categoryId": "6789abcd1234567890123456",
                "categoryName": "Electronics",
                "categoryCode": "ELEC",
                "subCategoryId": "6789abcd1234567890123457",
                "subCategoryName": "Routers",
                "subCategoryCode": "ROUTER",
                "brand": "Cisco",
                "description": "High-performance wireless router",
                "specifications": {"frequency": "2.4GHz/5GHz", "ports": 4},
                "unitPrice": 12500.00,
                "currency": "INR",
                "minStockLevel": 10,
                "maxStockLevel": 500,
                "reorderPoint": 20,
                "unit": "PCS",
                "weight": 0.5,
                "dimensions": {"length": 20, "width": 15, "height": 5},
                "manufacturer": "Cisco Systems",
                "warrantyPeriod": 24,
                "tags": ["wireless", "router", "networking"],
                "qrCode": "/qr/ELEC-ROUTER-CISCO-0001.png",
                "barcode": "/barcode/ELEC-ROUTER-CISCO-0001.png",
                "images": ["/images/product1.jpg"],
                "isActive": True,
                "isDeleted": False,
                "createdBy": "6789abcd1234567890123450",
                "updatedBy": "6789abcd1234567890123450",
                "createdAt": "2026-01-10T10:30:00Z",
                "updatedAt": "2026-01-10T10:30:00Z"
            }
        }
    }


class ProductListResponse(BaseModel):
    """
    Schema for paginated product list response.
    """
    items: list[ProductResponse]
    pagination: dict
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [],
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
