# WMS Service - Database Schema & Collections

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Warehouse Management System (WMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document defines the MongoDB database schema for the WMS microservice. The service relies on MongoDB 6.x via the Motor async driver and enforces schema rules through JSON Schema validators.

### Database Name
```
wms_db
```

### Collections Overview
1. **warehouses** - Master data for all physical warehouses.
2. **locations** - Hierarchical storage locations organized by warehouse.
3. **movements** - Immutable records of stock movements (inbound, outbound, internal, adjustments).
4. **transfers** - Inter-warehouse transfer workflows with approval and tracking metadata.
5. **warehouse_audit** - Audit log capturing changes across the WMS domain.

---

## 2. Warehouses Collection

### 2.1 Purpose
Hold facility and capacity metadata plus operational contact information.

### 2.2 Pydantic Models

```python
from pydantic import BaseModel, Field, EmailStr
from typing import Dict, Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class OperationalHour(BaseModel):
    open: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    close: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    closed: Optional[bool] = False

class WarehouseAddress(BaseModel):
    street: Optional[str] = Field(None, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    postalCode: Optional[str] = Field(None, max_length=20)

class WarehouseType(str, Enum):
    MAIN = "Main"
    REGIONAL = "Regional"
    TRANSIT = "Transit"
    RETURNS = "Returns"

class WarehouseStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    UNDER_MAINTENANCE = "UnderMaintenance"

class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    type: WarehouseType
    address: WarehouseAddress
    totalCapacity: Decimal = Field(..., gt=0)
    managerId: Optional[str]
    operationalHours: Optional[Dict[str, OperationalHour]]
    contactEmail: Optional[EmailStr]
    contactPhone: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=1000)

class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    address: Optional[WarehouseAddress]
    totalCapacity: Optional[Decimal] = Field(None, gt=0)
    managerId: Optional[str]
    operationalHours: Optional[Dict[str, OperationalHour]]
    contactEmail: Optional[EmailStr]
    contactPhone: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=1000)
    status: Optional[WarehouseStatus]

class WarehouseResponse(BaseModel):
    id: str = Field(..., alias="_id")
    warehouseCode: str
    name: str
    type: WarehouseType
    address: WarehouseAddress
    totalCapacity: Decimal
    usedCapacity: Decimal
    availableCapacity: Decimal
    status: WarehouseStatus
    managerId: Optional[str]
    operationalHours: Optional[Dict[str, OperationalHour]]
    contactEmail: Optional[EmailStr]
    contactPhone: Optional[str]
    notes: Optional[str]
    createdBy: str
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
```

### 2.3 Mongo Schema & Validation

```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["warehouseCode", "name", "type", "address", "totalCapacity", "usedCapacity", "status", "createdBy", "createdAt"],
    "properties": {
      "warehouseCode": {"bsonType": "string", "pattern": "^WH[0-9]{3,}$"},
      "name": {"bsonType": "string", "minLength": 2, "maxLength": 200},
      "type": {"enum": ["Main", "Regional", "Transit", "Returns"]},
      "status": {"enum": ["Active", "Inactive", "UnderMaintenance"]},
      "address": {
        "bsonType": "object",
        "required": ["city", "state", "country"],
        "properties": {
          "street": {"bsonType": "string", "maxLength": 200},
          "city": {"bsonType": "string", "minLength": 2, "maxLength": 100},
          "state": {"bsonType": "string", "minLength": 2, "maxLength": 100},
          "country": {"bsonType": "string", "minLength": 2, "maxLength": 100},
          "postalCode": {"bsonType": "string", "maxLength": 20}
        }
      },
      "totalCapacity": {"bsonType": ["decimal", "double"], "minimum": 0.01},
      "usedCapacity": {"bsonType": ["decimal", "double"], "minimum": 0},
      "managerId": {"bsonType": "objectId"},
      "contactEmail": {"bsonType": "string", "pattern": "^[^@\s]+@[^@\s]+\\.[^@\s]+$"}
    }
  }
}
```

### 2.4 Sample Document

```json
{
  "_id": ObjectId("6789abcd1234567890150001"),
  "warehouseCode": "WH001",
  "name": "Bengaluru Main Warehouse",
  "type": "Main",
  "address": {
    "street": "Plot No. 45, Electronic City Phase 1",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560100"
  },
  "totalCapacity": NumberDecimal("50000.00"),
  "usedCapacity": NumberDecimal("32450.50"),
  "availableCapacity": NumberDecimal("17549.50"),
  "status": "Active",
  "managerId": ObjectId("6789abcd1234567890123450"),
  "operationalHours": {
    "monday": {"open": "08:00", "close": "20:00"},
    "sunday": {"closed": true}
  },
  "contactEmail": "bengaluru.wh@wlancorp.com",
  "contactPhone": "+91-80-44556677",
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "updatedBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-01T08:00:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z")
}
```

### 2.5 Indexes

```javascript
db.warehouses.createIndex({"warehouseCode": 1}, {unique: true, name: "idx_warehouseCode_unique"})
db.warehouses.createIndex({"name": 1}, {name: "idx_name"})
db.warehouses.createIndex({"status": 1}, {name: "idx_status"})
db.warehouses.createIndex({"address.city": 1}, {name: "idx_city"})
db.warehouses.createIndex({"managerId": 1}, {name: "idx_managerId"})
db.warehouses.createIndex({"createdAt": -1}, {name: "idx_createdAt_desc"})
db.warehouses.createIndex({"name": "text", "warehouseCode": "text", "address.city": "text"}, {name: "idx_text_search"})
db.warehouses.createIndex({"status": 1, "type": 1}, {name: "idx_status_type"})
```

### 2.6 Business Rules
1. Warehouse codes start with `WH` and increment sequentially (WH001, WH002, etc.).
2. Total capacity must be greater than used capacity, otherwise the document is rejected.
3. Deactivation requires zero pending transfers and inactive locations.
4. Status transitions to `Inactive` or `UnderMaintenance` trigger notifications and audit entries.
5. Soft delete is enforced by setting `status` to `Inactive` and `deleted` flag (handled at service layer). 

---

## 3. Locations Collection

### 3.1 Purpose
Capture hierarchical storage positions (Zone → Rack → Shelf → Bin) and maintain occupancy statistics.

### 3.2 Pydantic Models

```python
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from decimal import Decimal
from enum import Enum

class LocationType(str, Enum):
    ZONE = "Zone"
    RACK = "Rack"
    SHELF = "Shelf"
    BIN = "Bin"

class LocationDimensions(BaseModel):
    length: Decimal = Field(..., gt=0)
    width: Decimal = Field(..., gt=0)
    height: Decimal = Field(..., gt=0)

class LocationCreate(BaseModel):
    warehouseId: str
    locationType: LocationType
    parentLocationId: Optional[str]
    dimensions: LocationDimensions
    capacity: Decimal = Field(..., gt=0)
    notes: Optional[str] = Field(None, max_length=500)

class LocationUpdate(BaseModel):
    dimensions: Optional[LocationDimensions]
    capacity: Optional[Decimal] = Field(None, gt=0)
    status: Optional[str]
    notes: Optional[str]

class LocationResponse(BaseModel):
    id: str = Field(..., alias="_id")
    locationCode: str
    warehouseId: str
    locationType: LocationType
    parentLocationId: Optional[str]
    hierarchy: str
    capacity: Decimal
    usedCapacity: Decimal
    isOccupied: bool
    currentProductId: Optional[str]
    currentQuantity: Optional[int]
    status: str
    barcodeUrl: Optional[HttpUrl]
    notes: Optional[str]
    createdBy: str
    updatedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
```

### 3.3 Sample Documents

#### Zone Level
```json
{
  "_id": ObjectId("6789abcd1234567890160001"),
  "warehouseId": ObjectId("6789abcd1234567890150001"),
  "locationCode": "WH001-Z01",
  "locationType": "Zone",
  "parentLocationId": null,
  "hierarchy": "WH001>Z01",
  "capacity": NumberDecimal("20000.00"),
  "usedCapacity": NumberDecimal("12500.00"),
  "isOccupied": true,
  "status": "Active",
  "barcodeUrl": "https://storage.wlancorp.com/qr/WH001-Z01.png",
  "notes": "Electronics zone - temperature controlled",
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-01T08:00:00Z"),
  "updatedAt": ISODate("2026-01-07T10:30:00Z")
}
```

#### Bin Level
```json
{
  "_id": ObjectId("6789abcd1234567890160005"),
  "warehouseId": ObjectId("6789abcd1234567890150001"),
  "locationCode": "WH001-Z01-R01-S01-B01",
  "locationType": "Bin",
  "parentLocationId": ObjectId("6789abcd1234567890160004"),
  "hierarchy": "WH001>Z01>R01>S01>B01",
  "capacity": NumberDecimal("0.40"),
  "usedCapacity": NumberDecimal("0.35"),
  "isOccupied": true,
  "currentProductId": ObjectId("6789abcd1234567890123458"),
  "currentQuantity": 25,
  "status": "Active",
  "barcodeUrl": "https://storage.wlancorp.com/qr/WH001-Z01-R01-S01-B01.png",
  "notes": "Small electronics items",
  "createdBy": ObjectId("6789abcd1234567890123450"),
  "createdAt": ISODate("2026-01-01T09:30:00Z"),
  "updatedAt": ISODate("2026-01-07T11:45:00Z")
}
```

### 3.4 Indexes

```javascript
db.locations.createIndex({"locationCode": 1}, {unique: true, name: "idx_locationCode_unique"})
db.locations.createIndex({"warehouseId": 1}, {name: "idx_warehouseId"})
db.locations.createIndex({"parentLocationId": 1}, {name: "idx_parentLocationId"})
db.locations.createIndex({"status": 1}, {name: "idx_status"})
db.locations.createIndex({"isOccupied": 1}, {name: "idx_isOccupied"})
db.locations.createIndex({"currentProductId": 1}, {name: "idx_currentProductId"})
db.locations.createIndex({"createdAt": -1}, {name: "idx_createdAt_desc"})
db.locations.createIndex({"warehouseId": 1, "locationType": 1}, {name: "idx_warehouse_type"})
db.locations.createIndex({"warehouseId": 1, "status": 1, "isOccupied": 1}, {name: "idx_warehouse_status_occupied"})
db.locations.createIndex({"locationCode": "text", "notes": "text"}, {name: "idx_text_search"})
```

### 3.5 Validation Rules

Locations enforce hierarchical naming plus capacity checks. The JSON Schema validator requires `warehouseId`, `locationCode`, `locationType`, `hierarchy`, `capacity`, and `status`. `capacity` must be greater than zero and `usedCapacity` cannot exceed it.

### 3.6 Business Rules
1. Location codes build from warehouse + hierarchical path (WH001-Z01-R01-S01-B01).
2. Only Bin-level locations may store products (`currentProductId` is mandatory once `isOccupied` is true).
3. Parent capacities adjust automatically whenever child locations change.
4. Damaged locations cannot accept new assignments.
5. Location deletion only allowed when no children and `isOccupied` is false.

---

## 4. Movements Collection

### 4.1 Purpose
Record every inventory move including inbound receipts, outbound shipments, internal transfers, and manual adjustments.

### 4.2 Pydantic Models

```python
from enum import Enum

class MovementType(str, Enum):
    INBOUND = "Inbound"
    OUTBOUND = "Outbound"
    INTERNAL_TRANSFER = "InternalTransfer"
    ADJUSTMENT = "Adjustment"
    RETURN = "Return"

class MovementCreate(BaseModel):
    movementType: MovementType
    warehouseId: str
    fromLocationId: Optional[str]
    toLocationId: Optional[str]
    productId: str
    quantity: Decimal = Field(..., gt=0)
    unit: str
    reason: str = Field(..., max_length=200)
    referenceType: Optional[str]
    referenceId: Optional[str]
    notes: Optional[str]

class MovementResponse(MovementCreate):
    id: str = Field(..., alias="_id")
    performedBy: str
    timestamp: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
```

### 4.3 Sample Documents

- **Inbound Movement:** Same fields used in API spec (see doc 4) and stored with `fromLocationId` null.
- **Internal Transfer:** Both `fromLocationId` and `toLocationId` populated, reference type `Manual`.
- **Outbound Movement:** `toLocationId` null with reference to `SalesOrder`.

### 4.4 Indexes

```javascript
db.movements.createIndex({"movementType": 1}, {name: "idx_movementType"})
db.movements.createIndex({"warehouseId": 1}, {name: "idx_warehouseId"})
db.movements.createIndex({"fromLocationId": 1}, {name: "idx_fromLocationId"})
db.movements.createIndex({"toLocationId": 1}, {name: "idx_toLocationId"})
db.movements.createIndex({"productId": 1}, {name: "idx_productId"})
db.movements.createIndex({"performedBy": 1}, {name: "idx_performedBy"})
db.movements.createIndex({"timestamp": -1}, {name: "idx_timestamp_desc"})
db.movements.createIndex({"referenceType": 1, "referenceId": 1}, {name: "idx_reference"})
db.movements.createIndex({"warehouseId": 1, "timestamp": -1}, {name: "idx_warehouse_timeline"})
```

### 4.5 Business Rules
1. Inbound movements require `toLocationId` and no `fromLocationId`.
2. Outbound movements require `fromLocationId` and no `toLocationId`.
3. Internal transfers must supply both locations.
4. Quantity must be positive and not exceed source location available stock.
5. Movement records are immutable; corrections are handled via new adjustments.
6. All movements emit events to IMS for inventory synchronization.

---

## 5. Transfers Collection

### 5.1 Purpose
Track approval workflows for multi-warehouse stock transfers and capture status history.

### 5.2 Pydantic Models

```python
class TransferStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    IN_TRANSIT = "InTransit"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    REJECTED = "Rejected"

class TransferItem(BaseModel):
    productId: str
    fromLocationId: str
    toLocationId: Optional[str]
    quantity: Decimal = Field(..., gt=0)
    unit: str
    notes: Optional[str]

class TransferCreate(BaseModel):
    fromWarehouseId: str
    toWarehouseId: str
    items: list[TransferItem]
    notes: Optional[str]

class TransferResponse(TransferCreate):
    id: str = Field(..., alias="_id")
    transferCode: str
    status: TransferStatus
    requestedBy: str
    approvedBy: Optional[str]
    requestedAt: datetime
    approvedAt: Optional[datetime]
    shippedAt: Optional[datetime]
    receivedAt: Optional[datetime]
    completedAt: Optional[datetime]
    rejectionReason: Optional[str]
    createdBy: str
    updatedBy: Optional[str]

    class Config:
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
```

### 5.3 Sample Document

Sample document mirrors the example from the ER diagram doc showing `TRF-20260107-001`, items array, and status timeline.

### 5.4 Indexes

```javascript
db.transfers.createIndex({"transferCode": 1}, {unique: true, name: "idx_transferCode_unique"})
db.transfers.createIndex({"fromWarehouseId": 1}, {name: "idx_fromWarehouseId"})
db.transfers.createIndex({"status": 1}, {name: "idx_status"})
db.transfers.createIndex({"requestedAt": -1}, {name: "idx_requestedAt_desc"})
db.transfers.createIndex({"items.productId": 1}, {name: "idx_items_productId"})
```

### 5.5 Validation & Business Rules
1. Transfer codes use the pattern `TRF-YYYYMMDD-XXX` and are unique per day.
2. Source and destination warehouses must differ and stay `Active` throughout the flow.
3. Approval is required before shipment; cancellations are limited to `Pending` or `Approved` statuses.
4. Inventory movements are generated automatically when transfers transition to `InTransit` and `Completed`.
5. Items array must contain at least one entry with valid product and location references.

---

## 6. Warehouse Audit Collection

### 6.1 Purpose
Capture every create/update/delete/status-change event across warehouses, locations, movements, and transfers for compliance.

### 6.2 Pydantic Model

```python
class AuditEntity(str, Enum):
    WAREHOUSE = "WAREHOUSE"
    LOCATION = "LOCATION"
    MOVEMENT = "MOVEMENT"
    TRANSFER = "TRANSFER"

class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    STATUS_CHANGE = "STATUS_CHANGE"
    TRANSFER = "TRANSFER"
    MOVEMENT = "MOVEMENT"

class WarehouseAuditEntry(BaseModel):
    entityType: AuditEntity
    entityId: str
    action: AuditAction
    performedBy: str
    changes: dict
    oldValues: Optional[dict]
    newValues: Optional[dict]
    ipAddress: Optional[str]
    userAgent: Optional[str]
    timestamp: datetime
```

### 6.3 Sample Document

Example entry (see doc 2) shows `totalCapacity` changes with `oldValues` and `newValues` plus IP/user agent metadata.

### 6.4 Indexes

```javascript
db.warehouse_audit.createIndex({"entityType": 1}, {name: "idx_entityType"})
db.warehouse_audit.createIndex({"entityId": 1}, {name: "idx_entityId"})
db.warehouse_audit.createIndex({"timestamp": -1}, {name: "idx_timestamp_desc"})
db.warehouse_audit.createIndex({"entityType": 1, "entityId": 1, "timestamp": -1}, {name: "idx_entity_timeline"})
db.warehouse_audit.createIndex({"timestamp": 1}, {expireAfterSeconds: 220752000, name: "idx_ttl_7years"})
```

---

## 7. Initialization & Seed Strategy

1. Each collection created via migration script that registers JSON Schema validators.
2. Seed script inserts default `warehouses` (e.g., Bengaluru Main, Mumbai Transit) and root `locations` for each facility.
3. `warehouse_audit` collection starts empty; TTL index retains logs for seven years.
4. Background job recalculates `availableCapacity` nightly to ensure derived values stay in sync with locations.

---

## Document End
**Previous Document**: [4-API-Endpoint-Specifications.md](./4-API-Endpoint-Specifications.md)  
**Next Document**: [6-Integration-Flow-Diagrams.md](./6-Integration-Flow-Diagrams.md)  
**Module Progress**: WMS Documentation (5/6 documents)  
**Overall Progress**: 23/30 documents (76.7%)
