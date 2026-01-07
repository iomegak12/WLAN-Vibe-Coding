# SMS Service - Database Schema & Collections

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Supplier Management System (SMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document defines the MongoDB database schema for the Supplier Management System (SMS) service. The database uses MongoDB 6.x with the Motor async driver for Python/FastAPI integration.

### Database Name
```
sms_db
```

### Collections
1. **suppliers** - Supplier master data
2. **contacts** - Supplier contact persons
3. **product_suppliers** - Product-supplier relationships with pricing
4. **supplier_audit** - Audit trail for all supplier changes

---

## 2. Suppliers Collection

### Collection Name
```
suppliers
```

### Purpose
Store supplier master data including company information, tax details, and payment terms.

### Pydantic Models

#### SupplierAddress (Embedded Document)
```python
from pydantic import BaseModel, Field
from typing import Optional

class SupplierAddress(BaseModel):
    """Embedded address model"""
    street: Optional[str] = Field(None, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    postalCode: Optional[str] = Field(None, max_length=20)
    
    class Config:
        json_schema_extra = {
            "example": {
                "street": "123 MG Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India",
                "postalCode": "560001"
            }
        }
```

#### SupplierCreate (Request Model)
```python
from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional
from decimal import Decimal
from enum import Enum

class PaymentTermsEnum(str, Enum):
    NET_15 = "Net 15"
    NET_30 = "Net 30"
    NET_45 = "Net 45"
    NET_60 = "Net 60"
    COD = "COD"
    ADVANCE = "Advance"

class SupplierStatusEnum(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    BLACKLISTED = "Blacklisted"

class SupplierCreate(BaseModel):
    """Model for creating a supplier"""
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr = Field(...)
    phone: str = Field(..., min_length=10, max_length=20)
    address: SupplierAddress = Field(...)
    taxId: str = Field(..., min_length=5, max_length=50)
    paymentTerms: Optional[PaymentTermsEnum] = Field(PaymentTermsEnum.NET_30)
    creditLimit: Optional[Decimal] = Field(0.0, ge=0.0, decimal_places=2)
    website: Optional[HttpUrl] = None
    notes: Optional[str] = Field(None, max_length=1000)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Tech Solutions Pvt Ltd",
                "email": "contact@techsolutions.com",
                "phone": "+91-80-12345678",
                "address": {
                    "street": "123 MG Road",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "country": "India",
                    "postalCode": "560001"
                },
                "taxId": "29AABCT1234E1Z5",
                "paymentTerms": "Net 30",
                "creditLimit": 500000.00,
                "website": "https://www.techsolutions.com",
                "notes": "Preferred supplier for electronics"
            }
        }
```

#### SupplierUpdate (Request Model)
```python
from typing import Optional

class SupplierUpdate(BaseModel):
    """Model for updating a supplier (all fields optional)"""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[SupplierAddress] = None
    paymentTerms: Optional[PaymentTermsEnum] = None
    creditLimit: Optional[Decimal] = Field(None, ge=0.0, decimal_places=2)
    website: Optional[HttpUrl] = None
    notes: Optional[str] = Field(None, max_length=1000)
    
    # Note: email, taxId, and supplierCode are immutable
```

#### SupplierResponse (Response Model)
```python
from datetime import datetime
from bson import ObjectId

class SupplierResponse(BaseModel):
    """Model for supplier response"""
    id: str = Field(..., alias="_id")
    supplierCode: str = Field(...)
    name: str = Field(...)
    email: EmailStr = Field(...)
    phone: str = Field(...)
    address: SupplierAddress = Field(...)
    taxId: str = Field(...)
    paymentTerms: PaymentTermsEnum = Field(...)
    status: SupplierStatusEnum = Field(...)
    creditLimit: Decimal = Field(...)
    website: Optional[HttpUrl] = None
    notes: Optional[str] = None
    createdBy: str = Field(...)
    updatedBy: Optional[str] = None
    createdAt: datetime = Field(...)
    updatedAt: datetime = Field(...)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
```

### MongoDB Schema

```javascript
{
  _id: ObjectId,
  supplierCode: String,        // Auto-generated: SUP001, SUP002, etc.
  name: String,                 // Company name
  email: String,                // Company email (unique)
  phone: String,                // Company phone
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  taxId: String,                // Tax ID/GST number (unique)
  paymentTerms: String,         // Enum: Net 15, Net 30, Net 45, Net 60, COD, Advance
  status: String,               // Enum: Active, Inactive, Blacklisted
  creditLimit: Decimal128,      // Credit limit in INR
  website: String,              // Company website URL
  notes: String,                // Internal notes
  createdBy: ObjectId,          // User ID from AUTH service
  updatedBy: ObjectId,          // User ID from AUTH service
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Indexes

```python
# Unique indexes
suppliers.create_index([("email", 1)], unique=True, name="idx_email_unique")
suppliers.create_index([("taxId", 1)], unique=True, name="idx_taxId_unique")
suppliers.create_index([("supplierCode", 1)], unique=True, name="idx_supplierCode_unique")

# Regular indexes
suppliers.create_index([("name", 1)], name="idx_name")
suppliers.create_index([("status", 1)], name="idx_status")
suppliers.create_index([("createdAt", -1)], name="idx_createdAt_desc")

# Text index for search
suppliers.create_index([
    ("name", "text"),
    ("email", "text"),
    ("phone", "text")
], name="idx_text_search")

# Compound indexes
suppliers.create_index([("status", 1), ("name", 1)], name="idx_status_name")
suppliers.create_index([("paymentTerms", 1), ("status", 1)], name="idx_payment_status")
```

### Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890120001"),
  "supplierCode": "SUP001",
  "name": "Tech Solutions Pvt Ltd",
  "email": "contact@techsolutions.com",
  "phone": "+91-80-12345678",
  "address": {
    "street": "123 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560001"
  },
  "taxId": "29AABCT1234E1Z5",
  "paymentTerms": "Net 30",
  "status": "Active",
  "creditLimit": NumberDecimal("500000.00"),
  "website": "https://www.techsolutions.com",
  "notes": "Preferred supplier for electronics",
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z")
}
```

### Validation Rules

```python
# MongoDB JSON Schema Validation
supplier_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["supplierCode", "name", "email", "phone", "address", "taxId", "status", "createdBy", "createdAt"],
        "properties": {
            "supplierCode": {
                "bsonType": "string",
                "pattern": "^SUP[0-9]{3,}$",
                "description": "Auto-generated supplier code"
            },
            "name": {
                "bsonType": "string",
                "minLength": 2,
                "maxLength": 200,
                "description": "Supplier company name"
            },
            "email": {
                "bsonType": "string",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                "description": "Valid email address"
            },
            "phone": {
                "bsonType": "string",
                "minLength": 10,
                "maxLength": 20,
                "description": "Contact phone number"
            },
            "address": {
                "bsonType": "object",
                "required": ["city", "state", "country"],
                "properties": {
                    "street": {"bsonType": "string"},
                    "city": {"bsonType": "string"},
                    "state": {"bsonType": "string"},
                    "country": {"bsonType": "string"},
                    "postalCode": {"bsonType": "string"}
                }
            },
            "taxId": {
                "bsonType": "string",
                "minLength": 5,
                "maxLength": 50,
                "description": "Tax ID or GST number"
            },
            "paymentTerms": {
                "enum": ["Net 15", "Net 30", "Net 45", "Net 60", "COD", "Advance"],
                "description": "Payment terms"
            },
            "status": {
                "enum": ["Active", "Inactive", "Blacklisted"],
                "description": "Supplier status"
            },
            "creditLimit": {
                "bsonType": ["decimal", "double"],
                "minimum": 0,
                "description": "Credit limit amount"
            }
        }
    }
}
```

---

## 3. Contacts Collection

### Collection Name
```
contacts
```

### Purpose
Store contact persons for each supplier with their details.

### Pydantic Models

#### ContactCreate (Request Model)
```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ContactCreate(BaseModel):
    """Model for creating a contact"""
    supplierId: str = Field(..., min_length=24, max_length=24)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(...)
    phone: str = Field(..., min_length=10, max_length=20)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    isPrimary: Optional[bool] = Field(False)
    
    class Config:
        json_schema_extra = {
            "example": {
                "supplierId": "6789abcd1234567890120001",
                "name": "Rajesh Kumar",
                "email": "rajesh.kumar@techsolutions.com",
                "phone": "+91-98765-43210",
                "designation": "Sales Manager",
                "department": "Sales",
                "isPrimary": True
            }
        }
```

#### ContactUpdate (Request Model)
```python
class ContactUpdate(BaseModel):
    """Model for updating a contact"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    isPrimary: Optional[bool] = None
    isActive: Optional[bool] = None
```

#### ContactResponse (Response Model)
```python
class ContactResponse(BaseModel):
    """Model for contact response"""
    id: str = Field(..., alias="_id")
    supplierId: str = Field(...)
    name: str = Field(...)
    email: EmailStr = Field(...)
    phone: str = Field(...)
    designation: Optional[str] = None
    department: Optional[str] = None
    isPrimary: bool = Field(...)
    isActive: bool = Field(...)
    createdBy: str = Field(...)
    updatedBy: Optional[str] = None
    createdAt: datetime = Field(...)
    updatedAt: datetime = Field(...)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
```

### MongoDB Schema

```javascript
{
  _id: ObjectId,
  supplierId: ObjectId,         // Reference to suppliers collection
  name: String,                  // Contact person name
  email: String,                 // Contact email
  phone: String,                 // Contact phone
  designation: String,           // Job title
  department: String,            // Department
  isPrimary: Boolean,            // Primary contact flag
  isActive: Boolean,             // Active status
  createdBy: ObjectId,           // User ID from AUTH service
  updatedBy: ObjectId,           // User ID from AUTH service
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Indexes

```python
# Regular indexes
contacts.create_index([("supplierId", 1)], name="idx_supplierId")
contacts.create_index([("email", 1)], name="idx_email")
contacts.create_index([("isPrimary", 1)], name="idx_isPrimary")
contacts.create_index([("isActive", 1)], name="idx_isActive")
contacts.create_index([("createdAt", -1)], name="idx_createdAt_desc")

# Compound indexes
contacts.create_index([("supplierId", 1), ("isPrimary", 1)], name="idx_supplier_primary")
contacts.create_index([("supplierId", 1), ("isActive", 1)], name="idx_supplier_active")

# Text index for search
contacts.create_index([("name", "text"), ("email", "text")], name="idx_text_search")
```

### Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890120002"),
  "supplierId": ObjectId("6789abcd1234567890120001"),
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@techsolutions.com",
  "phone": "+91-98765-43210",
  "designation": "Sales Manager",
  "department": "Sales",
  "isPrimary": true,
  "isActive": true,
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z")
}
```

### Validation Rules

```python
# MongoDB JSON Schema Validation
contact_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["supplierId", "name", "email", "phone", "isPrimary", "isActive", "createdBy", "createdAt"],
        "properties": {
            "supplierId": {
                "bsonType": "objectId",
                "description": "Reference to supplier"
            },
            "name": {
                "bsonType": "string",
                "minLength": 2,
                "maxLength": 100,
                "description": "Contact person name"
            },
            "email": {
                "bsonType": "string",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                "description": "Valid email address"
            },
            "phone": {
                "bsonType": "string",
                "minLength": 10,
                "maxLength": 20,
                "description": "Contact phone number"
            },
            "isPrimary": {
                "bsonType": "bool",
                "description": "Primary contact flag"
            },
            "isActive": {
                "bsonType": "bool",
                "description": "Active status"
            }
        }
    }
}
```

---

## 4. Product-Suppliers Collection

### Collection Name
```
product_suppliers
```

### Purpose
Store relationships between products (from PMS) and suppliers with pricing information.

### Pydantic Models

#### ProductSupplierCreate (Request Model)
```python
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ProductSupplierCreate(BaseModel):
    """Model for creating a product-supplier link"""
    supplierId: str = Field(..., min_length=24, max_length=24)
    productId: str = Field(..., min_length=24, max_length=24)
    supplierPrice: Decimal = Field(..., gt=0, decimal_places=2)
    currency: Optional[str] = Field("INR", min_length=3, max_length=3)
    leadTimeDays: int = Field(..., ge=1, le=365)
    minOrderQuantity: int = Field(..., ge=1)
    isPreferred: Optional[bool] = Field(False)
    
    class Config:
        json_schema_extra = {
            "example": {
                "supplierId": "6789abcd1234567890120001",
                "productId": "6789abcd1234567890123458",
                "supplierPrice": 115000.00,
                "currency": "INR",
                "leadTimeDays": 7,
                "minOrderQuantity": 10,
                "isPreferred": True
            }
        }
```

#### ProductSupplierUpdate (Request Model)
```python
class ProductSupplierUpdate(BaseModel):
    """Model for updating a product-supplier link"""
    supplierPrice: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    leadTimeDays: Optional[int] = Field(None, ge=1, le=365)
    minOrderQuantity: Optional[int] = Field(None, ge=1)
    isPreferred: Optional[bool] = None
    isActive: Optional[bool] = None
```

#### ProductSupplierResponse (Response Model)
```python
class ProductSupplierResponse(BaseModel):
    """Model for product-supplier response"""
    id: str = Field(..., alias="_id")
    supplierId: str = Field(...)
    productId: str = Field(...)
    supplierPrice: Decimal = Field(...)
    currency: str = Field(...)
    leadTimeDays: int = Field(...)
    minOrderQuantity: int = Field(...)
    isPreferred: bool = Field(...)
    isActive: bool = Field(...)
    createdBy: str = Field(...)
    updatedBy: Optional[str] = None
    createdAt: datetime = Field(...)
    updatedAt: datetime = Field(...)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
```

### MongoDB Schema

```javascript
{
  _id: ObjectId,
  supplierId: ObjectId,         // Reference to suppliers collection
  productId: ObjectId,          // Reference to products in PMS service
  supplierPrice: Decimal128,    // Price from this supplier
  currency: String,             // Currency code (default: INR)
  leadTimeDays: Number,         // Lead time in days
  minOrderQuantity: Number,     // Minimum order quantity
  isPreferred: Boolean,         // Preferred supplier for this product
  isActive: Boolean,            // Active link status
  createdBy: ObjectId,          // User ID from AUTH service
  updatedBy: ObjectId,          // User ID from AUTH service
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Indexes

```python
# Unique compound index (one supplier per product)
product_suppliers.create_index(
    [("supplierId", 1), ("productId", 1)],
    unique=True,
    name="idx_supplier_product_unique"
)

# Regular indexes
product_suppliers.create_index([("supplierId", 1)], name="idx_supplierId")
product_suppliers.create_index([("productId", 1)], name="idx_productId")
product_suppliers.create_index([("isPreferred", 1)], name="idx_isPreferred")
product_suppliers.create_index([("isActive", 1)], name="idx_isActive")
product_suppliers.create_index([("createdAt", -1)], name="idx_createdAt_desc")

# Compound indexes
product_suppliers.create_index(
    [("productId", 1), ("isPreferred", 1)],
    name="idx_product_preferred"
)
product_suppliers.create_index(
    [("productId", 1), ("isActive", 1), ("supplierPrice", 1)],
    name="idx_product_active_price"
)
product_suppliers.create_index(
    [("supplierId", 1), ("isActive", 1)],
    name="idx_supplier_active"
)
```

### Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890120003"),
  "supplierId": ObjectId("6789abcd1234567890120001"),
  "productId": ObjectId("6789abcd1234567890123458"),
  "supplierPrice": NumberDecimal("115000.00"),
  "currency": "INR",
  "leadTimeDays": 7,
  "minOrderQuantity": 10,
  "isPreferred": true,
  "isActive": true,
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-07T10:30:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z")
}
```

### Validation Rules

```python
# MongoDB JSON Schema Validation
product_supplier_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["supplierId", "productId", "supplierPrice", "currency", "leadTimeDays", "minOrderQuantity", "isPreferred", "isActive", "createdBy", "createdAt"],
        "properties": {
            "supplierId": {
                "bsonType": "objectId",
                "description": "Reference to supplier"
            },
            "productId": {
                "bsonType": "objectId",
                "description": "Reference to product in PMS"
            },
            "supplierPrice": {
                "bsonType": ["decimal", "double"],
                "minimum": 0.01,
                "description": "Supplier price"
            },
            "currency": {
                "bsonType": "string",
                "minLength": 3,
                "maxLength": 3,
                "description": "Currency code"
            },
            "leadTimeDays": {
                "bsonType": "int",
                "minimum": 1,
                "maximum": 365,
                "description": "Lead time in days"
            },
            "minOrderQuantity": {
                "bsonType": "int",
                "minimum": 1,
                "description": "Minimum order quantity"
            },
            "isPreferred": {
                "bsonType": "bool",
                "description": "Preferred supplier flag"
            },
            "isActive": {
                "bsonType": "bool",
                "description": "Active status"
            }
        }
    }
}
```

---

## 5. Supplier-Audit Collection

### Collection Name
```
supplier_audit
```

### Purpose
Maintain complete audit trail of all supplier-related changes for compliance and tracking.

### Pydantic Models

#### SupplierAuditLog (Model)
```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class AuditActionEnum(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    STATUS_CHANGE = "STATUS_CHANGE"

class AuditEntityEnum(str, Enum):
    SUPPLIER = "SUPPLIER"
    CONTACT = "CONTACT"
    PRODUCT_SUPPLIER = "PRODUCT_SUPPLIER"

class SupplierAuditLog(BaseModel):
    """Model for audit log"""
    entityType: AuditEntityEnum = Field(...)
    entityId: str = Field(...)
    action: AuditActionEnum = Field(...)
    performedBy: str = Field(...)
    changes: Dict[str, Any] = Field(...)
    oldValues: Optional[Dict[str, Any]] = None
    newValues: Optional[Dict[str, Any]] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "entityType": "SUPPLIER",
                "entityId": "6789abcd1234567890120001",
                "action": "UPDATE",
                "performedBy": "6789abcd1234567890123450",
                "changes": {
                    "creditLimit": "Increased from 500000 to 750000"
                },
                "oldValues": {
                    "creditLimit": 500000.00
                },
                "newValues": {
                    "creditLimit": 750000.00
                },
                "ipAddress": "192.168.1.100",
                "userAgent": "Mozilla/5.0...",
                "timestamp": "2026-01-07T10:30:00Z"
            }
        }
```

### MongoDB Schema

```javascript
{
  _id: ObjectId,
  entityType: String,           // Enum: SUPPLIER, CONTACT, PRODUCT_SUPPLIER
  entityId: ObjectId,           // ID of the entity being tracked
  action: String,               // Enum: CREATE, UPDATE, DELETE, STATUS_CHANGE
  performedBy: ObjectId,        // User ID from AUTH service
  changes: Object,              // Description of changes
  oldValues: Object,            // Previous values
  newValues: Object,            // New values
  ipAddress: String,            // IP address of user
  userAgent: String,            // User agent string
  timestamp: ISODate
}
```

### Indexes

```python
# Regular indexes
supplier_audit.create_index([("entityType", 1)], name="idx_entityType")
supplier_audit.create_index([("entityId", 1)], name="idx_entityId")
supplier_audit.create_index([("action", 1)], name="idx_action")
supplier_audit.create_index([("performedBy", 1)], name="idx_performedBy")
supplier_audit.create_index([("timestamp", -1)], name="idx_timestamp_desc")

# Compound indexes
supplier_audit.create_index(
    [("entityType", 1), ("entityId", 1), ("timestamp", -1)],
    name="idx_entity_timeline"
)
supplier_audit.create_index(
    [("performedBy", 1), ("timestamp", -1)],
    name="idx_user_timeline"
)

# TTL index (optional - keep logs for 2 years)
supplier_audit.create_index(
    [("timestamp", 1)],
    expireAfterSeconds=63072000,  # 2 years in seconds
    name="idx_ttl_2years"
)
```

### Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890120010"),
  "entityType": "SUPPLIER",
  "entityId": ObjectId("6789abcd1234567890120001"),
  "action": "UPDATE",
  "performedBy": ObjectId("6789abcd1234567890123450"),
  "changes": {
    "creditLimit": "Increased from 500000 to 750000",
    "paymentTerms": "Changed from Net 30 to Net 45"
  },
  "oldValues": {
    "creditLimit": NumberDecimal("500000.00"),
    "paymentTerms": "Net 30"
  },
  "newValues": {
    "creditLimit": NumberDecimal("750000.00"),
    "paymentTerms": "Net 45"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "timestamp": ISODate("2026-01-07T10:30:00Z")
}
```

---

## 6. Database Initialization Script

### init_sms_db.py

```python
"""
SMS Database Initialization Script
Creates collections, indexes, and seed data
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId, Decimal128
import asyncio

async def init_sms_database():
    """Initialize SMS database with collections and indexes"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.sms_db
    
    print("Initializing SMS Database...")
    
    # 1. Create Suppliers Collection
    print("Creating suppliers collection...")
    try:
        await db.create_collection("suppliers")
        suppliers = db.suppliers
        
        # Create indexes
        await suppliers.create_index([("email", 1)], unique=True, name="idx_email_unique")
        await suppliers.create_index([("taxId", 1)], unique=True, name="idx_taxId_unique")
        await suppliers.create_index([("supplierCode", 1)], unique=True, name="idx_supplierCode_unique")
        await suppliers.create_index([("name", 1)], name="idx_name")
        await suppliers.create_index([("status", 1)], name="idx_status")
        await suppliers.create_index([("createdAt", -1)], name="idx_createdAt_desc")
        await suppliers.create_index([
            ("name", "text"),
            ("email", "text"),
            ("phone", "text")
        ], name="idx_text_search")
        await suppliers.create_index([("status", 1), ("name", 1)], name="idx_status_name")
        
        print("✓ Suppliers collection created with indexes")
    except Exception as e:
        print(f"Suppliers collection already exists: {e}")
    
    # 2. Create Contacts Collection
    print("Creating contacts collection...")
    try:
        await db.create_collection("contacts")
        contacts = db.contacts
        
        # Create indexes
        await contacts.create_index([("supplierId", 1)], name="idx_supplierId")
        await contacts.create_index([("email", 1)], name="idx_email")
        await contacts.create_index([("isPrimary", 1)], name="idx_isPrimary")
        await contacts.create_index([("isActive", 1)], name="idx_isActive")
        await contacts.create_index([("createdAt", -1)], name="idx_createdAt_desc")
        await contacts.create_index([("supplierId", 1), ("isPrimary", 1)], name="idx_supplier_primary")
        await contacts.create_index([("supplierId", 1), ("isActive", 1)], name="idx_supplier_active")
        await contacts.create_index([("name", "text"), ("email", "text")], name="idx_text_search")
        
        print("✓ Contacts collection created with indexes")
    except Exception as e:
        print(f"Contacts collection already exists: {e}")
    
    # 3. Create Product-Suppliers Collection
    print("Creating product_suppliers collection...")
    try:
        await db.create_collection("product_suppliers")
        product_suppliers = db.product_suppliers
        
        # Create indexes
        await product_suppliers.create_index(
            [("supplierId", 1), ("productId", 1)],
            unique=True,
            name="idx_supplier_product_unique"
        )
        await product_suppliers.create_index([("supplierId", 1)], name="idx_supplierId")
        await product_suppliers.create_index([("productId", 1)], name="idx_productId")
        await product_suppliers.create_index([("isPreferred", 1)], name="idx_isPreferred")
        await product_suppliers.create_index([("isActive", 1)], name="idx_isActive")
        await product_suppliers.create_index([("createdAt", -1)], name="idx_createdAt_desc")
        await product_suppliers.create_index(
            [("productId", 1), ("isPreferred", 1)],
            name="idx_product_preferred"
        )
        await product_suppliers.create_index(
            [("productId", 1), ("isActive", 1), ("supplierPrice", 1)],
            name="idx_product_active_price"
        )
        
        print("✓ Product-Suppliers collection created with indexes")
    except Exception as e:
        print(f"Product-Suppliers collection already exists: {e}")
    
    # 4. Create Supplier-Audit Collection
    print("Creating supplier_audit collection...")
    try:
        await db.create_collection("supplier_audit")
        supplier_audit = db.supplier_audit
        
        # Create indexes
        await supplier_audit.create_index([("entityType", 1)], name="idx_entityType")
        await supplier_audit.create_index([("entityId", 1)], name="idx_entityId")
        await supplier_audit.create_index([("action", 1)], name="idx_action")
        await supplier_audit.create_index([("performedBy", 1)], name="idx_performedBy")
        await supplier_audit.create_index([("timestamp", -1)], name="idx_timestamp_desc")
        await supplier_audit.create_index(
            [("entityType", 1), ("entityId", 1), ("timestamp", -1)],
            name="idx_entity_timeline"
        )
        await supplier_audit.create_index(
            [("performedBy", 1), ("timestamp", -1)],
            name="idx_user_timeline"
        )
        
        print("✓ Supplier-Audit collection created with indexes")
    except Exception as e:
        print(f"Supplier-Audit collection already exists: {e}")
    
    print("\nSMS Database initialization completed successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_sms_database())
```

---

## 7. Seed Data Script

### seed_sms_data.py

```python
"""
SMS Seed Data Script
Populates initial test data
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId, Decimal128
import asyncio

async def seed_sms_data():
    """Seed initial data for SMS service"""
    
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.sms_db
    
    print("Seeding SMS Database...")
    
    # Sample admin user ID (from AUTH service)
    admin_user_id = ObjectId("6789abcd1234567890123450")
    
    # 1. Seed Suppliers
    print("Seeding suppliers...")
    suppliers_data = [
        {
            "_id": ObjectId("6789abcd1234567890120001"),
            "supplierCode": "SUP001",
            "name": "Tech Solutions Pvt Ltd",
            "email": "contact@techsolutions.com",
            "phone": "+91-80-12345678",
            "address": {
                "street": "123 MG Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India",
                "postalCode": "560001"
            },
            "taxId": "29AABCT1234E1Z5",
            "paymentTerms": "Net 30",
            "status": "Active",
            "creditLimit": Decimal128("500000.00"),
            "website": "https://www.techsolutions.com",
            "notes": "Preferred supplier for electronics",
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId("6789abcd1234567890120002"),
            "supplierCode": "SUP002",
            "name": "Global Electronics Inc",
            "email": "sales@globalelectronics.com",
            "phone": "+91-22-87654321",
            "address": {
                "street": "456 Andheri West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "postalCode": "400058"
            },
            "taxId": "27AABCG5678F1Z1",
            "paymentTerms": "Net 45",
            "status": "Active",
            "creditLimit": Decimal128("1000000.00"),
            "website": "https://www.globalelectronics.com",
            "notes": "Large volume supplier",
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId("6789abcd1234567890120003"),
            "supplierCode": "SUP003",
            "name": "Fashion Wholesale Ltd",
            "email": "info@fashionwholesale.com",
            "phone": "+91-11-55667788",
            "address": {
                "street": "789 Connaught Place",
                "city": "New Delhi",
                "state": "Delhi",
                "country": "India",
                "postalCode": "110001"
            },
            "taxId": "07AABCF9012G1Z3",
            "paymentTerms": "Net 60",
            "status": "Active",
            "creditLimit": Decimal128("750000.00"),
            "website": "https://www.fashionwholesale.com",
            "notes": "Apparel and fashion items",
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    try:
        await db.suppliers.insert_many(suppliers_data)
        print(f"✓ Inserted {len(suppliers_data)} suppliers")
    except Exception as e:
        print(f"Suppliers already exist: {e}")
    
    # 2. Seed Contacts
    print("Seeding contacts...")
    contacts_data = [
        {
            "_id": ObjectId("6789abcd1234567890130001"),
            "supplierId": ObjectId("6789abcd1234567890120001"),
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@techsolutions.com",
            "phone": "+91-98765-43210",
            "designation": "Sales Manager",
            "department": "Sales",
            "isPrimary": True,
            "isActive": True,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId("6789abcd1234567890130002"),
            "supplierId": ObjectId("6789abcd1234567890120001"),
            "name": "Priya Sharma",
            "email": "priya.sharma@techsolutions.com",
            "phone": "+91-98765-11111",
            "designation": "Account Manager",
            "department": "Accounts",
            "isPrimary": False,
            "isActive": True,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId("6789abcd1234567890130003"),
            "supplierId": ObjectId("6789abcd1234567890120002"),
            "name": "Amit Patel",
            "email": "amit.patel@globalelectronics.com",
            "phone": "+91-98765-22222",
            "designation": "Regional Manager",
            "department": "Sales",
            "isPrimary": True,
            "isActive": True,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    try:
        await db.contacts.insert_many(contacts_data)
        print(f"✓ Inserted {len(contacts_data)} contacts")
    except Exception as e:
        print(f"Contacts already exist: {e}")
    
    # 3. Seed Product-Supplier Links
    # Note: Product IDs should match those from PMS service
    print("Seeding product-supplier links...")
    product_suppliers_data = [
        {
            "_id": ObjectId("6789abcd1234567890140001"),
            "supplierId": ObjectId("6789abcd1234567890120001"),
            "productId": ObjectId("6789abcd1234567890123458"),  # iPhone 15 Pro from PMS
            "supplierPrice": Decimal128("115000.00"),
            "currency": "INR",
            "leadTimeDays": 7,
            "minOrderQuantity": 10,
            "isPreferred": True,
            "isActive": True,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId("6789abcd1234567890140002"),
            "supplierId": ObjectId("6789abcd1234567890120002"),
            "productId": ObjectId("6789abcd1234567890123458"),  # Same product, different supplier
            "supplierPrice": Decimal128("118000.00"),
            "currency": "INR",
            "leadTimeDays": 10,
            "minOrderQuantity": 5,
            "isPreferred": False,
            "isActive": True,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    try:
        await db.product_suppliers.insert_many(product_suppliers_data)
        print(f"✓ Inserted {len(product_suppliers_data)} product-supplier links")
    except Exception as e:
        print(f"Product-supplier links already exist: {e}")
    
    print("\nSMS Database seeding completed successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_sms_data())
```

---

## 8. Repository Layer Example

### supplier_repository.py

```python
"""
Supplier Repository
Database operations for suppliers
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime

class SupplierRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.suppliers
    
    async def create(self, supplier_data: dict) -> dict:
        """Create a new supplier"""
        # Generate supplier code
        last_supplier = await self.collection.find_one(
            sort=[("supplierCode", -1)]
        )
        
        if last_supplier:
            last_code = int(last_supplier["supplierCode"].replace("SUP", ""))
            new_code = f"SUP{str(last_code + 1).zfill(3)}"
        else:
            new_code = "SUP001"
        
        supplier_data["supplierCode"] = new_code
        supplier_data["status"] = "Active"
        supplier_data["createdAt"] = datetime.utcnow()
        supplier_data["updatedAt"] = datetime.utcnow()
        
        result = await self.collection.insert_one(supplier_data)
        supplier_data["_id"] = result.inserted_id
        
        return supplier_data
    
    async def find_by_id(self, supplier_id: str) -> Optional[dict]:
        """Find supplier by ID"""
        return await self.collection.find_one({"_id": ObjectId(supplier_id)})
    
    async def find_by_code(self, supplier_code: str) -> Optional[dict]:
        """Find supplier by code"""
        return await self.collection.find_one({"supplierCode": supplier_code})
    
    async def find_by_email(self, email: str) -> Optional[dict]:
        """Find supplier by email"""
        return await self.collection.find_one({"email": email})
    
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 10,
        filters: dict = None,
        sort_by: str = "name",
        sort_order: int = 1
    ) -> tuple[List[dict], int]:
        """Find all suppliers with pagination"""
        query = filters or {}
        
        cursor = self.collection.find(query)
        total = await self.collection.count_documents(query)
        
        cursor = cursor.sort(sort_by, sort_order).skip(skip).limit(limit)
        suppliers = await cursor.to_list(length=limit)
        
        return suppliers, total
    
    async def update(self, supplier_id: str, update_data: dict) -> Optional[dict]:
        """Update supplier"""
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(supplier_id)},
            {"$set": update_data},
            return_document=True
        )
        
        return result
    
    async def delete(self, supplier_id: str) -> bool:
        """Delete supplier (soft delete)"""
        result = await self.collection.update_one(
            {"_id": ObjectId(supplier_id)},
            {
                "$set": {
                    "status": "Inactive",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0
    
    async def search(self, search_term: str, skip: int = 0, limit: int = 10) -> tuple[List[dict], int]:
        """Full-text search for suppliers"""
        query = {"$text": {"$search": search_term}}
        
        cursor = self.collection.find(
            query,
            {"score": {"$meta": "textScore"}}
        )
        
        total = await self.collection.count_documents(query)
        
        cursor = cursor.sort([("score", {"$meta": "textScore"})]).skip(skip).limit(limit)
        suppliers = await cursor.to_list(length=limit)
        
        return suppliers, total
```

---

## Document End

**Previous Document**: [4-API-Endpoint-Specifications.md](./4-API-Endpoint-Specifications.md)  
**Next Document**: [6-Integration-Flow-Diagrams.md](./6-Integration-Flow-Diagrams.md)  
**Module Progress**: SMS Documentation (5/6 documents)  
**Overall Progress**: 17/30 documents (56.7%)
