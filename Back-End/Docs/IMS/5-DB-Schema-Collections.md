# IMS Service - Database Schema & Collections

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Inventory Management System (IMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

Defines the MongoDB collections underpinning IMS: `stock_levels`, `reservations`, `stock_audit`, and `inventory_events`. Each collection uses schema validation, indexes, and business rules tuned for eventual consistency and idempotent event processing.

### Database Name
```
ims_db
```

---

## 2. stock_levels Collection

### Purpose
Stores the canonical available, reserved, and committed quantities for each product and warehouse.

### Pydantic Models
```python
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class StockLevelBase(BaseModel):
    productId: str
    warehouseId: str
    availableQty: Decimal = Field(..., ge=0)
    reservedQty: Decimal = Field(..., ge=0)
    committedQty: Decimal = Field(..., ge=0)
    unit: str

class StockLevelDB(StockLevelBase):
    id: Optional[str]
    lastUpdatedBy: Optional[str]
    lastUpdated: datetime
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
        json_encoders = {Decimal: lambda v: float(v), datetime: lambda v: v.isoformat()}
```

### Schema Validator
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["productId", "warehouseId", "availableQty", "unit"],
    "properties": {
      "productId": {"bsonType": "objectId"},
      "warehouseId": {"bsonType": "objectId"},
      "availableQty": {"bsonType": "decimal", "minimum": 0},
      "reservedQty": {"bsonType": "decimal", "minimum": 0},
      "committedQty": {"bsonType": "decimal", "minimum": 0},
      "unit": {"bsonType": "string"}
    }
  }
}
```

### Indexes
```javascript
db.stock_levels.createIndex({ productId: 1, warehouseId: 1 }, { unique: true, name: "idx_stock_unique" })
db.stock_levels.createIndex({ warehouseId: 1 }, { name: "idx_stock_warehouse" })
db.stock_levels.createIndex({ productId: 1 }, { name: "idx_stock_product" })
db.stock_levels.createIndex({ updatedAt: -1 }, { name: "idx_stock_updated" })
```

### Sample Document
```json
{
  "_id": ObjectId("6789abcd1234ims00010001"),
  "productId": ObjectId("6789abcd1234pms00020001"),
  "warehouseId": ObjectId("6789abcd1234wms00030001"),
  "availableQty": NumberDecimal("1200.00"),
  "reservedQty": NumberDecimal("150.00"),
  "committedQty": NumberDecimal("200.00"),
  "unit": "pcs",
  "lastUpdatedBy": ObjectId("6789abcd1234auth00040001"),
  "lastUpdated": ISODate("2026-01-07T12:15:00Z"),
  "createdAt": ISODate("2026-01-01T08:00:00Z"),
  "updatedAt": ISODate("2026-01-07T12:15:00Z")
}
```

### Business Rules
1. `availableQty` + `reservedQty` + `committedQty` must reflect physical counts; reconciliations adjust deltas via `stock_audit`.
2. Stock rows created automatically when new warehouse/product pair appears.
3. Decimal precision stored as `NumberDecimal` to avoid rounding issues.

---

## 3. reservations Collection

### Purpose
Temporal holds for transfers/orders that must be confirmed or released.

### Pydantic Models
```python
from pydantic import BaseModel, Field
from datetime import datetime

class ReservationCreate(BaseModel):
    stockLevelId: str
    quantity: Decimal = Field(..., gt=0)
    referenceType: str
    referenceId: str
    expiresAt: datetime

class ReservationDB(ReservationCreate):
    id: Optional[str]
    reservationCode: str
    status: str
    createdBy: str
    createdAt: datetime
    updatedAt: datetime
```
```

### Schema Validator
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["stockLevelId", "quantity", "status", "createdBy", "expiresAt"],
    "properties": {
      "stockLevelId": {"bsonType": "objectId"},
      "quantity": {"bsonType": "decimal", "minimum": 0.01},
      "status": {"enum": ["Pending", "Confirmed", "Cancelled", "Expired"]}
    }
  }
}
```

### Indexes
```javascript
db.reservations.createIndex({ reservationCode: 1 }, { unique: true, name: "idx_reservation_code" })
db.reservations.createIndex({ stockLevelId: 1 }, { name: "idx_reservation_stock" })
db.reservations.createIndex({ status: 1, expiresAt: 1 }, { name: "idx_reservation_status" })
db.reservations.createIndex({ createdAt: -1 }, { name: "idx_reservation_created" })
```

### Sample Document
```json
{
  "_id": ObjectId("6789abcd1234ims00020001"),
  "stockLevelId": ObjectId("6789abcd1234ims00010001"),
  "reservationCode": "RES-20260107-001",
  "quantity": NumberDecimal("50.00"),
  "status": "Pending",
  "referenceType": "Transfer",
  "referenceId": "TRF-20260107-001",
  "createdBy": ObjectId("6789abcd1234auth00040002"),
  "expiresAt": ISODate("2026-01-07T12:45:00Z"),
  "createdAt": ISODate("2026-01-07T12:15:00Z"),
  "updatedAt": ISODate("2026-01-07T12:15:00Z")
}
```

### Business Rules
1. Quantity cannot exceed `availableQty` from the linked stock row.
2. TTL job marks `Pending` reservations as `Expired` after 15 minutes.
3. Only one `Confirmed` reservation logic ensures `committedQty` is updated atomically.

---

## 4. stock_audit Collection

### Purpose
Immutable ledger capturing every delta applied to stock levels.

### Schema Validator
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["stockLevelId", "delta", "eventType", "performedBy"],
    "properties": {
      "delta": {"bsonType": "decimal"},
      "eventType": {"bsonType": "string"},
      "traceId": {"bsonType": "string"}
    }
  }
}
```

### Indexes
```javascript
db.stock_audit.createIndex({ stockLevelId: 1 }, { name: "idx_audit_stock" })
db.stock_audit.createIndex({ performedBy: 1 }, { name: "idx_audit_user" })
db.stock_audit.createIndex({ timestamp: -1 }, { name: "idx_audit_recent" })
```

### Sample Document
```json
{
  "_id": ObjectId("6789abcd1234ims00030001"),
  "stockLevelId": ObjectId("6789abcd1234ims00010001"),
  "delta": NumberDecimal("25.00"),
  "reason": "MovementInbound",
  "eventType": "movement.created",
  "performedBy": ObjectId("6789abcd1234auth00040003"),
  "traceId": "trace-abc-123",
  "timestamp": ISODate("2026-01-07T12:16:00Z")
}
```

### Business Rules
1. Every movement/reservation update writes one audit row with delta and reason.
2. Trace ID links back to WMS event for observability.

---

## 5. inventory_events Collection

### Purpose
Inbox for deduplicated movement/transfer events before applying to stock levels.

### Schema Validator
```json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["eventId", "eventType", "status", "receivedAt"],
    "properties": {
      "status": {"enum": ["Pending", "Processed", "Failed"]}
    }
  }
}
```

### Indexes
```javascript
db.inventory_events.createIndex({ eventId: 1 }, { unique: true, name: "idx_event_id" })
db.inventory_events.createIndex({ status: 1 }, { name: "idx_event_status" })
db.inventory_events.createIndex({ receivedAt: 1 }, { name: "idx_event_received" })
```

### Sample Document
```json
{
  "_id": ObjectId("6789abcd1234ims00040001"),
  "eventId": "evt-789",
  "eventType": "movement.created",
  "sourceId": ObjectId("6789abcd1234wms00050001"),
  "stockLevelId": ObjectId("6789abcd1234ims00010001"),
  "payload": "{...}",
  "status": "Processed",
  "receivedAt": ISODate("2026-01-07T12:10:00Z"),
  "processedAt": ISODate("2026-01-07T12:12:00Z")
}
```

### Business Rules
1. Deduplication on `eventId` prevents double processing.
2. Failed events retried up to 3 times; after that, information moved to DLQ.
3. `processedAt` used for alerting when queue latency exceeds 5 minutes.

---

## 6. Cross-Collection Constraints
1. `reservations.stockLevelId` must reference existing stock row; app ensures referential integrity.
2. `stock_audit` entries only created via service layer to guarantee delta accuracy.
3. Event processor updates `inventory_events` status atomically with stock update.

---

## Document End
**Previous Document**: [Back-End/Docs/IMS/4-API-Endpoint-Specifications.md](Back-End/Docs/IMS/4-API-Endpoint-Specifications.md)  
**Next Document**: [Back-End/Docs/IMS/6-Integration-Flow-Diagrams.md](Back-End/Docs/IMS/6-Integration-Flow-Diagrams.md)  
**Module Progress**: IMS Documentation (5/6 documents)  
**Overall Progress**: 29/30 documents (96.7%)
