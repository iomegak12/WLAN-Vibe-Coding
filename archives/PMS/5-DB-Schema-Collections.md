# PMS Service - Database Schema & Collections

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Product Management System (PMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document details the MongoDB database schema for the Product Management System (PMS). It includes collection structures, Pydantic models for validation, indexes, and sample data.

### Database Configuration
- **Database Name**: `pms_db`
- **MongoDB Version**: 6.x or higher
- **Connection String**: `mongodb://localhost:27017/pms_db`

---

## 2. Collections Overview

| Collection Name | Purpose | Estimated Size |
|----------------|---------|----------------|
| categories | Store product categories | ~50-100 documents |
| subcategories | Store product sub-categories | ~200-500 documents |
| products | Store product information | ~10,000+ documents |
| product_audit | Audit trail for product changes | Growing |

---

## 3. Categories Collection

### 3.1 Pydantic Model

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=10)
    description: Optional[str] = Field(None, max_length=500)
    isActive: bool = Field(default=True)

    @validator('code')
    def code_must_be_uppercase(cls, v):
        if not v.isupper():
            raise ValueError('Category code must be uppercase')
        if not v.isalnum():
            raise ValueError('Category code must be alphanumeric')
        return v

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Category name cannot be empty')
        return v.strip()

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isActive: Optional[bool] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Category name cannot be empty')
        return v.strip() if v else v

class CategoryInDB(CategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    createdBy: PyObjectId
    updatedBy: Optional[PyObjectId] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    isDeleted: bool = Field(default=False)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CategoryResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str]
    isActive: bool
    createdBy: str
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
```

### 3.2 MongoDB Schema

```javascript
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "code", "isActive", "createdBy", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Category name - required, 2-100 characters"
        },
        code: {
          bsonType: "string",
          minLength: 2,
          maxLength: 10,
          pattern: "^[A-Z0-9]+$",
          description: "Category code - required, uppercase alphanumeric"
        },
        description: {
          bsonType: "string",
          maxLength: 500,
          description: "Category description - optional, max 500 characters"
        },
        isActive: {
          bsonType: "bool",
          description: "Active status - required boolean"
        },
        createdBy: {
          bsonType: "objectId",
          description: "User who created the category - required"
        },
        updatedBy: {
          bsonType: "objectId",
          description: "User who last updated the category - optional"
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp - required"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp - required"
        },
        isDeleted: {
          bsonType: "bool",
          description: "Soft delete flag - default false"
        }
      }
    }
  }
})
```

### 3.3 Indexes

```javascript
// Unique index on category code
db.categories.createIndex(
  { code: 1 },
  { unique: true, name: "idx_category_code_unique" }
)

// Unique index on category name (case-insensitive)
db.categories.createIndex(
  { name: 1 },
  { 
    unique: true, 
    name: "idx_category_name_unique",
    collation: { locale: "en", strength: 2 }
  }
)

// Index for active categories
db.categories.createIndex(
  { isActive: 1, isDeleted: 1 },
  { name: "idx_category_active" }
)

// Index for search
db.categories.createIndex(
  { name: "text", code: "text" },
  { name: "idx_category_search" }
)

// Compound index for sorting
db.categories.createIndex(
  { createdAt: -1 },
  { name: "idx_category_created" }
)
```

### 3.4 Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890123456"),
  "name": "Electronics",
  "code": "ELEC",
  "description": "Electronic devices and accessories",
  "isActive": true,
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z"),
  "isDeleted": false
}
```

---

## 4. SubCategories Collection

### 4.1 Pydantic Model

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from bson import ObjectId

class SubCategoryBase(BaseModel):
    categoryId: PyObjectId
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=10)
    description: Optional[str] = Field(None, max_length=500)
    isActive: bool = Field(default=True)

    @validator('code')
    def code_must_be_uppercase(cls, v):
        if not v.isupper():
            raise ValueError('Sub-category code must be uppercase')
        if not v.isalnum():
            raise ValueError('Sub-category code must be alphanumeric')
        return v

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Sub-category name cannot be empty')
        return v.strip()

class SubCategoryCreate(SubCategoryBase):
    pass

class SubCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isActive: Optional[bool] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Sub-category name cannot be empty')
        return v.strip() if v else v

class SubCategoryInDB(SubCategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    createdBy: PyObjectId
    updatedBy: Optional[PyObjectId] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    isDeleted: bool = Field(default=False)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SubCategoryResponse(BaseModel):
    id: str
    categoryId: str
    categoryName: str
    categoryCode: str
    name: str
    code: str
    description: Optional[str]
    isActive: bool
    createdBy: str
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
```

### 4.2 MongoDB Schema

```javascript
db.createCollection("subcategories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["categoryId", "name", "code", "isActive", "createdBy", "createdAt"],
      properties: {
        categoryId: {
          bsonType: "objectId",
          description: "Parent category ID - required"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Sub-category name - required, 2-100 characters"
        },
        code: {
          bsonType: "string",
          minLength: 2,
          maxLength: 10,
          pattern: "^[A-Z0-9]+$",
          description: "Sub-category code - required, uppercase alphanumeric"
        },
        description: {
          bsonType: "string",
          maxLength: 500,
          description: "Sub-category description - optional"
        },
        isActive: {
          bsonType: "bool",
          description: "Active status - required boolean"
        },
        createdBy: {
          bsonType: "objectId",
          description: "User who created - required"
        },
        updatedBy: {
          bsonType: "objectId",
          description: "User who last updated - optional"
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp - required"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp - required"
        },
        isDeleted: {
          bsonType: "bool",
          description: "Soft delete flag - default false"
        }
      }
    }
  }
})
```

### 4.3 Indexes

```javascript
// Unique index on sub-category code
db.subcategories.createIndex(
  { code: 1 },
  { unique: true, name: "idx_subcategory_code_unique" }
)

// Compound unique index: name must be unique within category
db.subcategories.createIndex(
  { categoryId: 1, name: 1 },
  { 
    unique: true, 
    name: "idx_subcategory_category_name_unique",
    collation: { locale: "en", strength: 2 }
  }
)

// Index for category lookup
db.subcategories.createIndex(
  { categoryId: 1, isActive: 1, isDeleted: 1 },
  { name: "idx_subcategory_category" }
)

// Index for search
db.subcategories.createIndex(
  { name: "text", code: "text" },
  { name: "idx_subcategory_search" }
)

// Index for sorting
db.subcategories.createIndex(
  { createdAt: -1 },
  { name: "idx_subcategory_created" }
)
```

### 4.4 Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890123457"),
  "categoryId": ObjectId("6789abcd1234567890123456"),
  "name": "Smartphones",
  "code": "SMART",
  "description": "Mobile smartphones and accessories",
  "isActive": true,
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z"),
  "isDeleted": false
}
```

---

## 5. Products Collection

### 5.1 Pydantic Model

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from decimal import Decimal
from enum import Enum

class UnitOfMeasure(str, Enum):
    PIECE = "piece"
    KG = "kg"
    LITER = "liter"
    METER = "meter"
    BOX = "box"
    PACK = "pack"

class ProductStatus(str, Enum):
    ACTIVE = "Active"
    DISCONTINUED = "Discontinued"
    OUT_OF_STOCK = "Out of Stock"
    COMING_SOON = "Coming Soon"

class DimensionsModel(BaseModel):
    length: Optional[float] = Field(None, gt=0)
    width: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    unit: str = Field(default="cm")

class ProductBase(BaseModel):
    categoryId: PyObjectId
    subCategoryId: PyObjectId
    name: str = Field(..., min_length=2, max_length=200)
    brand: str = Field(..., min_length=2, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    specifications: Optional[Dict[str, Any]] = Field(default_factory=dict)
    unitOfMeasure: UnitOfMeasure
    price: float = Field(..., gt=0)
    weight: Optional[float] = Field(None, ge=0)
    dimensions: Optional[DimensionsModel] = None
    warrantyPeriod: Optional[int] = Field(None, ge=0)
    status: ProductStatus = Field(default=ProductStatus.ACTIVE)

    @validator('name', 'brand')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

    @validator('specifications')
    def validate_specifications(cls, v):
        if v is not None:
            # Ensure all keys are strings
            if not all(isinstance(k, str) for k in v.keys()):
                raise ValueError('Specification keys must be strings')
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    brand: Optional[str] = Field(None, min_length=2, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    specifications: Optional[Dict[str, Any]] = None
    price: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, ge=0)
    dimensions: Optional[DimensionsModel] = None
    warrantyPeriod: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None

class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    sku: str = Field(..., min_length=5, max_length=50)
    imageUrl: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    barcodeUrl: Optional[str] = None
    createdBy: PyObjectId
    updatedBy: Optional[PyObjectId] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    isDeleted: bool = Field(default=False)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ProductResponse(BaseModel):
    id: str
    sku: str
    categoryId: str
    categoryName: str
    categoryCode: str
    subCategoryId: str
    subCategoryName: str
    subCategoryCode: str
    name: str
    brand: str
    model: Optional[str]
    description: Optional[str]
    specifications: Optional[Dict[str, Any]]
    unitOfMeasure: str
    price: float
    weight: Optional[float]
    dimensions: Optional[DimensionsModel]
    warrantyPeriod: Optional[int]
    status: str
    imageUrl: Optional[str]
    qrCodeUrl: Optional[str]
    barcodeUrl: Optional[str]
    createdBy: str
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
```

### 5.2 MongoDB Schema

```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "sku", "categoryId", "subCategoryId", "name", "brand",
        "unitOfMeasure", "price", "status", "createdBy", "createdAt"
      ],
      properties: {
        sku: {
          bsonType: "string",
          minLength: 5,
          maxLength: 50,
          description: "Stock Keeping Unit - required, unique"
        },
        categoryId: {
          bsonType: "objectId",
          description: "Category reference - required"
        },
        subCategoryId: {
          bsonType: "objectId",
          description: "Sub-category reference - required"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 200,
          description: "Product name - required"
        },
        brand: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Brand name - required"
        },
        model: {
          bsonType: "string",
          maxLength: 100,
          description: "Model number - optional"
        },
        description: {
          bsonType: "string",
          maxLength: 1000,
          description: "Product description - optional"
        },
        specifications: {
          bsonType: "object",
          description: "Product specifications as key-value pairs - optional"
        },
        unitOfMeasure: {
          enum: ["piece", "kg", "liter", "meter", "box", "pack"],
          description: "Unit of measure - required"
        },
        price: {
          bsonType: "double",
          minimum: 0,
          description: "Product price - required, must be positive"
        },
        weight: {
          bsonType: "double",
          minimum: 0,
          description: "Product weight - optional"
        },
        dimensions: {
          bsonType: "object",
          properties: {
            length: { bsonType: "double", minimum: 0 },
            width: { bsonType: "double", minimum: 0 },
            height: { bsonType: "double", minimum: 0 },
            unit: { bsonType: "string" }
          },
          description: "Product dimensions - optional"
        },
        warrantyPeriod: {
          bsonType: "int",
          minimum: 0,
          description: "Warranty period in months - optional"
        },
        status: {
          enum: ["Active", "Discontinued", "Out of Stock", "Coming Soon"],
          description: "Product status - required"
        },
        imageUrl: {
          bsonType: "string",
          description: "Product image URL - optional"
        },
        qrCodeUrl: {
          bsonType: "string",
          description: "QR code image URL - optional"
        },
        barcodeUrl: {
          bsonType: "string",
          description: "Barcode image URL - optional"
        },
        createdBy: {
          bsonType: "objectId",
          description: "User who created - required"
        },
        updatedBy: {
          bsonType: "objectId",
          description: "User who last updated - optional"
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp - required"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp - required"
        },
        isDeleted: {
          bsonType: "bool",
          description: "Soft delete flag - default false"
        }
      }
    }
  }
})
```

### 5.3 Indexes

```javascript
// Unique index on SKU
db.products.createIndex(
  { sku: 1 },
  { unique: true, name: "idx_product_sku_unique" }
)

// Compound index for category and sub-category lookup
db.products.createIndex(
  { categoryId: 1, subCategoryId: 1, isDeleted: 1 },
  { name: "idx_product_category_subcategory" }
)

// Index for brand filtering
db.products.createIndex(
  { brand: 1, status: 1, isDeleted: 1 },
  { name: "idx_product_brand_status" }
)

// Index for status filtering
db.products.createIndex(
  { status: 1, isDeleted: 1 },
  { name: "idx_product_status" }
)

// Index for price range queries
db.products.createIndex(
  { price: 1, isDeleted: 1 },
  { name: "idx_product_price" }
)

// Text index for search
db.products.createIndex(
  { name: "text", brand: "text", model: "text", description: "text" },
  { 
    name: "idx_product_search",
    weights: {
      name: 10,
      brand: 5,
      model: 3,
      description: 1
    }
  }
)

// Index for sorting by creation date
db.products.createIndex(
  { createdAt: -1 },
  { name: "idx_product_created" }
)

// Compound index for active products by category
db.products.createIndex(
  { categoryId: 1, status: 1, isActive: 1 },
  { name: "idx_product_category_active" }
)
```

### 5.4 Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890123458"),
  "sku": "ELEC-SMART-APL-001",
  "categoryId": ObjectId("6789abcd1234567890123456"),
  "subCategoryId": ObjectId("6789abcd1234567890123457"),
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "model": "A2848",
  "description": "Latest iPhone with A17 Pro chip and titanium design",
  "specifications": {
    "Display": "6.1-inch OLED",
    "Processor": "A17 Pro",
    "RAM": "8GB",
    "Storage": "256GB",
    "Camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
    "Battery": "3274mAh",
    "OS": "iOS 17",
    "5G": "Yes",
    "Color": "Natural Titanium"
  },
  "unitOfMeasure": "piece",
  "price": 129900.00,
  "weight": 187.0,
  "dimensions": {
    "length": 14.67,
    "width": 7.15,
    "height": 0.83,
    "unit": "cm"
  },
  "warrantyPeriod": 12,
  "status": "Active",
  "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
  "qrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png",
  "barcodeUrl": "https://storage.wlancorp.com/barcodes/6789abcd1234567890123458.png",
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z"),
  "isDeleted": false
}
```

---

## 6. Product Audit Collection

### 6.1 Pydantic Model

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum

class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    STATUS_CHANGE = "status_change"
    REGENERATE_QR = "regenerate_qr"
    REGENERATE_BARCODE = "regenerate_barcode"

class ProductAuditLog(BaseModel):
    productId: PyObjectId
    action: AuditAction
    performedBy: PyObjectId
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    changes: Optional[Dict[str, Any]] = None
    oldValues: Optional[Dict[str, Any]] = None
    newValues: Optional[Dict[str, Any]] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None

class ProductAuditInDB(ProductAuditLog):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
```

### 6.2 MongoDB Schema

```javascript
db.createCollection("product_audit", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["productId", "action", "performedBy", "timestamp"],
      properties: {
        productId: {
          bsonType: "objectId",
          description: "Product reference - required"
        },
        action: {
          enum: ["create", "update", "delete", "status_change", "regenerate_qr", "regenerate_barcode"],
          description: "Action performed - required"
        },
        performedBy: {
          bsonType: "objectId",
          description: "User who performed action - required"
        },
        timestamp: {
          bsonType: "date",
          description: "Action timestamp - required"
        },
        changes: {
          bsonType: "object",
          description: "Summary of changes - optional"
        },
        oldValues: {
          bsonType: "object",
          description: "Previous values - optional"
        },
        newValues: {
          bsonType: "object",
          description: "New values - optional"
        },
        ipAddress: {
          bsonType: "string",
          description: "IP address - optional"
        },
        userAgent: {
          bsonType: "string",
          description: "User agent - optional"
        }
      }
    }
  }
})
```

### 6.3 Indexes

```javascript
// Index for product lookup
db.product_audit.createIndex(
  { productId: 1, timestamp: -1 },
  { name: "idx_audit_product_timestamp" }
)

// Index for user activity
db.product_audit.createIndex(
  { performedBy: 1, timestamp: -1 },
  { name: "idx_audit_user_timestamp" }
)

// Index for action filtering
db.product_audit.createIndex(
  { action: 1, timestamp: -1 },
  { name: "idx_audit_action_timestamp" }
)

// TTL index - auto-delete audit logs older than 2 years
db.product_audit.createIndex(
  { timestamp: 1 },
  { 
    name: "idx_audit_ttl",
    expireAfterSeconds: 63072000  // 2 years in seconds
  }
)
```

### 6.4 Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890123459"),
  "productId": ObjectId("6789abcd1234567890123458"),
  "action": "update",
  "performedBy": ObjectId("6789abcd1234567890123451"),
  "timestamp": ISODate("2026-01-07T11:45:00Z"),
  "changes": {
    "fieldsModified": ["price", "description"]
  },
  "oldValues": {
    "price": 129900.00,
    "description": "Latest iPhone with A17 Pro chip"
  },
  "newValues": {
    "price": 124900.00,
    "description": "Latest iPhone with A17 Pro chip and titanium design"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

---

## 7. Database Seed Data

### 7.1 Seed Categories

```python
# seed_data.py
from datetime import datetime
from bson import ObjectId

# Default admin user ID (from AUTH service)
ADMIN_USER_ID = ObjectId("6789abcd1234567890123450")

seed_categories = [
    {
        "_id": ObjectId(),
        "name": "Electronics",
        "code": "ELEC",
        "description": "Electronic devices and accessories",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "name": "Furniture",
        "code": "FURN",
        "description": "Office and home furniture",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "name": "Stationery",
        "code": "STAT",
        "description": "Office supplies and stationery",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "name": "Hardware",
        "code": "HARD",
        "description": "Tools and hardware equipment",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "name": "Textiles",
        "code": "TEXT",
        "description": "Fabrics and textile products",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    }
]

# Insert seed data
async def seed_categories_data(db):
    """Seed initial categories into database"""
    try:
        result = await db.categories.insert_many(seed_categories)
        print(f"Inserted {len(result.inserted_ids)} categories")
        return result.inserted_ids
    except Exception as e:
        print(f"Error seeding categories: {e}")
        return []
```

### 7.2 Seed Sub-Categories

```python
# Assumes categories have been seeded and IDs are known
seed_subcategories = [
    # Electronics sub-categories
    {
        "_id": ObjectId(),
        "categoryId": ObjectId("ELECTRONICS_CATEGORY_ID"),  # Replace with actual ID
        "name": "Smartphones",
        "code": "SMART",
        "description": "Mobile smartphones and accessories",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "categoryId": ObjectId("ELECTRONICS_CATEGORY_ID"),
        "name": "Laptops",
        "code": "LAPTOP",
        "description": "Laptop computers and accessories",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "categoryId": ObjectId("ELECTRONICS_CATEGORY_ID"),
        "name": "Tablets",
        "code": "TABLET",
        "description": "Tablet devices and accessories",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    # Furniture sub-categories
    {
        "_id": ObjectId(),
        "categoryId": ObjectId("FURNITURE_CATEGORY_ID"),
        "name": "Office Chairs",
        "code": "CHAIR",
        "description": "Office and ergonomic chairs",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    },
    {
        "_id": ObjectId(),
        "categoryId": ObjectId("FURNITURE_CATEGORY_ID"),
        "name": "Desks",
        "code": "DESK",
        "description": "Office desks and workstations",
        "isActive": True,
        "createdBy": ADMIN_USER_ID,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isDeleted": False
    }
]

async def seed_subcategories_data(db, category_mapping):
    """Seed initial sub-categories into database"""
    try:
        # Update categoryId references
        for subcat in seed_subcategories:
            # Replace placeholder with actual category ID
            # This requires maintaining a mapping from seed operation
            pass
        
        result = await db.subcategories.insert_many(seed_subcategories)
        print(f"Inserted {len(result.inserted_ids)} sub-categories")
        return result.inserted_ids
    except Exception as e:
        print(f"Error seeding sub-categories: {e}")
        return []
```

---

## 8. Database Initialization Script

### 8.1 Complete Initialization

```python
# db_init.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId

# Database configuration
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "pms_db"

async def initialize_database():
    """Initialize PMS database with collections, indexes, and seed data"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"Initializing database: {DATABASE_NAME}")
    
    # Create collections with validation
    await create_collections(db)
    
    # Create indexes
    await create_indexes(db)
    
    # Seed initial data
    await seed_data(db)
    
    print("Database initialization complete!")
    
    client.close()

async def create_collections(db):
    """Create collections with validation schemas"""
    print("Creating collections...")
    
    # Categories collection
    try:
        await db.create_collection("categories")
        await db.command({
            "collMod": "categories",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["name", "code", "isActive", "createdBy", "createdAt"],
                    "properties": {
                        "name": {
                            "bsonType": "string",
                            "minLength": 2,
                            "maxLength": 100
                        },
                        "code": {
                            "bsonType": "string",
                            "minLength": 2,
                            "maxLength": 10,
                            "pattern": "^[A-Z0-9]+$"
                        }
                    }
                }
            }
        })
        print("✓ Categories collection created")
    except Exception as e:
        print(f"Categories collection: {e}")
    
    # SubCategories collection
    try:
        await db.create_collection("subcategories")
        print("✓ SubCategories collection created")
    except Exception as e:
        print(f"SubCategories collection: {e}")
    
    # Products collection
    try:
        await db.create_collection("products")
        print("✓ Products collection created")
    except Exception as e:
        print(f"Products collection: {e}")
    
    # Product Audit collection
    try:
        await db.create_collection("product_audit")
        print("✓ Product Audit collection created")
    except Exception as e:
        print(f"Product Audit collection: {e}")

async def create_indexes(db):
    """Create all required indexes"""
    print("\nCreating indexes...")
    
    # Categories indexes
    await db.categories.create_index("code", unique=True, name="idx_category_code_unique")
    await db.categories.create_index("name", unique=True, name="idx_category_name_unique")
    await db.categories.create_index([("isActive", 1), ("isDeleted", 1)], name="idx_category_active")
    print("✓ Categories indexes created")
    
    # SubCategories indexes
    await db.subcategories.create_index("code", unique=True, name="idx_subcategory_code_unique")
    await db.subcategories.create_index([("categoryId", 1), ("name", 1)], unique=True, name="idx_subcategory_category_name")
    await db.subcategories.create_index([("categoryId", 1), ("isActive", 1)], name="idx_subcategory_category")
    print("✓ SubCategories indexes created")
    
    # Products indexes
    await db.products.create_index("sku", unique=True, name="idx_product_sku_unique")
    await db.products.create_index([("categoryId", 1), ("subCategoryId", 1)], name="idx_product_category")
    await db.products.create_index([("brand", 1), ("status", 1)], name="idx_product_brand_status")
    await db.products.create_index([("name", "text"), ("brand", "text"), ("model", "text")], name="idx_product_search")
    print("✓ Products indexes created")
    
    # Product Audit indexes
    await db.product_audit.create_index([("productId", 1), ("timestamp", -1)], name="idx_audit_product")
    await db.product_audit.create_index([("performedBy", 1), ("timestamp", -1)], name="idx_audit_user")
    await db.product_audit.create_index("timestamp", expireAfterSeconds=63072000, name="idx_audit_ttl")
    print("✓ Product Audit indexes created")

async def seed_data(db):
    """Seed initial data"""
    print("\nSeeding initial data...")
    
    ADMIN_USER_ID = ObjectId("6789abcd1234567890123450")
    
    # Check if data already exists
    cat_count = await db.categories.count_documents({})
    if cat_count > 0:
        print("⚠ Data already exists, skipping seed")
        return
    
    # Seed categories
    categories = [
        {"name": "Electronics", "code": "ELEC", "description": "Electronic devices"},
        {"name": "Furniture", "code": "FURN", "description": "Office furniture"},
        {"name": "Stationery", "code": "STAT", "description": "Office supplies"}
    ]
    
    category_docs = []
    for cat in categories:
        category_docs.append({
            "_id": ObjectId(),
            "name": cat["name"],
            "code": cat["code"],
            "description": cat["description"],
            "isActive": True,
            "createdBy": ADMIN_USER_ID,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "isDeleted": False
        })
    
    result = await db.categories.insert_many(category_docs)
    print(f"✓ Inserted {len(result.inserted_ids)} categories")

if __name__ == "__main__":
    asyncio.run(initialize_database())
```

---

## 9. Database Backup & Restore

### 9.1 Backup Script

```bash
#!/bin/bash
# backup_pms_db.sh

# Configuration
BACKUP_DIR="/backups/pms"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="pms_backup_${TIMESTAMP}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup database
mongodump --db=pms_db --out=${BACKUP_DIR}/${BACKUP_NAME}

# Compress backup
tar -czf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz -C ${BACKUP_DIR} ${BACKUP_NAME}

# Remove uncompressed backup
rm -rf ${BACKUP_DIR}/${BACKUP_NAME}

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "pms_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_NAME}.tar.gz"
```

### 9.2 Restore Script

```bash
#!/bin/bash
# restore_pms_db.sh

# Configuration
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore_pms_db.sh <backup_file.tar.gz>"
    exit 1
fi

# Extract backup
TEMP_DIR="/tmp/pms_restore_$$"
mkdir -p ${TEMP_DIR}
tar -xzf ${BACKUP_FILE} -C ${TEMP_DIR}

# Restore database
mongorestore --db=pms_db --drop ${TEMP_DIR}/pms_backup_*/pms_db

# Cleanup
rm -rf ${TEMP_DIR}

echo "Restore completed from: ${BACKUP_FILE}"
```

---

## 10. Database Maintenance

### 10.1 Cleanup Deleted Records

```python
# cleanup_deleted.py
async def cleanup_soft_deleted_records(db, days_old=30):
    """Permanently delete soft-deleted records older than specified days"""
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    
    # Delete old categories
    result = await db.categories.delete_many({
        "isDeleted": True,
        "updatedAt": {"$lt": cutoff_date}
    })
    print(f"Deleted {result.deleted_count} old categories")
    
    # Delete old sub-categories
    result = await db.subcategories.delete_many({
        "isDeleted": True,
        "updatedAt": {"$lt": cutoff_date}
    })
    print(f"Deleted {result.deleted_count} old sub-categories")
    
    # Delete old products
    result = await db.products.delete_many({
        "isDeleted": True,
        "updatedAt": {"$lt": cutoff_date}
    })
    print(f"Deleted {result.deleted_count} old products")
```

### 10.2 Index Maintenance

```python
# index_maintenance.py
async def rebuild_indexes(db):
    """Rebuild all indexes for optimization"""
    
    collections = ["categories", "subcategories", "products", "product_audit"]
    
    for collection_name in collections:
        print(f"Rebuilding indexes for {collection_name}...")
        await db[collection_name].reindex()
        print(f"✓ {collection_name} indexes rebuilt")
```

---

## 11. Performance Optimization

### 11.1 Query Optimization Tips

```python
# Use projection to fetch only required fields
products = await db.products.find(
    {"categoryId": category_id},
    {"name": 1, "sku": 1, "price": 1, "imageUrl": 1}
).to_list(length=100)

# Use aggregation for complex queries
pipeline = [
    {"$match": {"status": "Active"}},
    {"$lookup": {
        "from": "categories",
        "localField": "categoryId",
        "foreignField": "_id",
        "as": "category"
    }},
    {"$unwind": "$category"},
    {"$project": {
        "name": 1,
        "sku": 1,
        "price": 1,
        "categoryName": "$category.name"
    }}
]
results = await db.products.aggregate(pipeline).to_list(length=None)

# Use indexes for sorting
products = await db.products.find().sort("createdAt", -1).limit(10).to_list(length=10)
```

### 11.2 Connection Pool Settings

```python
# Database connection with optimized settings
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(
    "mongodb://localhost:27017",
    maxPoolSize=50,
    minPoolSize=10,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000
)
```

---

## Document End
**Previous Document**: [4-API-Endpoint-Specifications.md](./4-API-Endpoint-Specifications.md)  
**Next Document**: [6-Integration-Flow-Diagrams.md](./6-Integration-Flow-Diagrams.md)  
**Module Progress**: PMS Documentation (5/6 documents)  
**Overall Progress**: 11/30 documents (36.7%)
