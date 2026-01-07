# WMS Service - API Endpoint Specifications

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Warehouse Management System (WMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

Provides RESTful API specifications for the WMS microservice. All endpoints are exposed under `/api/v1/` with JWT protection and follow the standard response envelopes.

### Base URLs
```
Development: http://localhost:5004
Production: https://wms.wlancorp.com
```

### API Version Prefix
```
/api/v1/
```

---

## 2. Authentication & Headers

All WMS endpoints (except health) require JWT access tokens issued by AUTH service.

### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authorization
- JWT validated via AUTH service `/auth/validate`
- Role-based access enforced (Super Admin, Warehouse Manager, Warehouse Staff, Procurement Officer)
- Write operations limited to higher roles; read operations allowed for most roles

---

## 3. Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-01-07T11:00:00Z"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Explanation",
    "details": {}
  },
  "timestamp": "2026-01-07T11:00:00Z"
}
```

### Paginated
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Data retrieved",
  "timestamp": "2026-01-07T11:00:00Z"
}
```

---

## 4. Warehouse Endpoints

### 4.1 Create Warehouse

- **POST** `/api/v1/warehouses`
- **Auth**: Super Admin
- **Purpose**: Add new warehouse with capacity and operational details
- **Request Body**:
```json
{
  "name": "Bengaluru Main Warehouse",
  "type": "Main",
  "address": {
    "street": "Plot 45, Electronic City",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560100"
  },
  "totalCapacity": 50000.00,
  "managerId": "6789abcd1234567890123450",
  "operationalHours": {
    "monday": {"open": "08:00", "close": "20:00"},
    "sunday": {"closed": true}
  },
  "contactEmail": "bengaluru.wh@wlancorp.com",
  "contactPhone": "+91-80-44556677",
  "notes": "Climate controlled zone"
}
```
- **Validation**: `name`, `type`, address fields, capacity > 0, manager must exist and have Warehouse Manager role
- **Success (201)** includes auto-generated `warehouseCode` (WH001)

### 4.2 List Warehouses

- **GET** `/api/v1/warehouses`
- **Auth**: All roles
- **Query**: `page`, `limit`, `type`, `status`, `search`, `sortBy`, `sortOrder`
- **Response**: paginated warehouse list with capacity utilization and manager

### 4.3 Get Warehouse by ID

- **GET** `/api/v1/warehouses/:id`
- **Auth**: All roles
- **Response**: full warehouse record (code, address, manager, operational hours, capacity)

### 4.4 Get Warehouse by Code

- **GET** `/api/v1/warehouses/code/:code`
- **Auth**: All roles
- Returns minimal fields to speed up workflows

### 4.5 Update Warehouse

- **PUT** `/api/v1/warehouses/:id`
- **Auth**: Warehouse Manager, Super Admin
- Payload: update name, address, contact, capacity, manager, operational hours
- Immutable fields: `warehouseCode`
- Response: updated warehouse

### 4.6 Update Status

- **PATCH** `/api/v1/warehouses/:id/status`
- **Auth**: Super Admin
- Body: `{ "status": "Inactive", "reason": "Renovation" }`
- Validation: no pending transfers when moving to Inactive
- Response: includes `previousStatus`

### 4.7 Delete Warehouse

- **DELETE** `/api/v1/warehouses/:id`
- **Auth**: Super Admin
- Soft delete (marked `status`: Inactive, `deleted`: true)
- Prevent delete if active locations or transfers

### 4.8 Capacity Snapshot

- **GET** `/api/v1/warehouses/:id/capacity`
- Shows total/used/available/percentage + top zones

---

## 5. Location Endpoints

### 5.1 Create Location

- **POST** `/api/v1/locations`
- **Auth**: Warehouse Manager
- Request: specify `warehouseId`, `locationType`, optional `parentLocationId`, dimensions, notes
- Auto-generated `locationCode` (hierarchical)
- Response returns location plus generated QR code URL

### 5.2 List Locations

- **GET** `/api/v1/locations`
- Supports filters: `warehouseId`, `locationType`, `status`, `isOccupied`, `search`, `page`, `limit`
- Response: paginated tree-aware location list

### 5.3 Get Location Details

- **GET** `/api/v1/locations/:id`
- Returns dimensions, hierarchy path, current product, recent movements

### 5.4 Get Location by Code

- **GET** `/api/v1/locations/code/:code`
- Useful for scanning workflows

### 5.5 Get Child Locations

- **GET** `/api/v1/locations/:id/children`
- Returns immediate children plus occupancy

### 5.6 Available Locations

- **GET** `/api/v1/locations/available`
- Filters: `warehouseId`, `minimumCapacity`, `locationType`
- Returns candidate bins sorted by best fit

### 5.7 Update Location

- **PUT** `/api/v1/locations/:id`
- Allows updating dimensions, notes, status
- Cannot change code/type/parent
- Validates new capacity >= used capacity

### 5.8 Delete Location

- **DELETE** `/api/v1/locations/:id`
- Only allowed if no child locations and `isOccupied` false

---

## 6. Movement Endpoints

### 6.1 Record Movement

- **POST** `/api/v1/movements`
- **Auth**: Warehouse Staff or Manager
- Body example for inbound:
```json
{
  "movementType": "Inbound",
  "warehouseId": "6789abcd1234567890150001",
  "toLocationId": "6789abcd1234567890160005",
  "productId": "6789abcd1234567890123458",
  "quantity": 25,
  "unit": "pcs",
  "referenceType": "PurchaseOrder",
  "referenceId": "PO-2026-001",
  "reason": "Receiving from Tech Solutions"
}
```
- Validates location capacity, product exists in PMS, quantity > 0
- Response contains created movement and updated location summary

### 6.2 List Movements

- **GET** `/api/v1/movements`
- Filters: `warehouseId`, `locationId`, `productId`, `movementType`, `fromDate`, `toDate`, `performedBy`
- Pagination plus color-coded movement type

### 6.3 Get Movement by ID

- **GET** `/api/v1/movements/:id`
- Returns full movement record

### 6.4 Movement History by Warehouse

- **GET** `/api/v1/movements/warehouse/:warehouseId`
- Sorted by timestamp desc

### 6.5 Movement History by Product

- **GET** `/api/v1/movements/product/:productId`
- Includes location path history

### 6.6 Movement History by Location

- **GET** `/api/v1/movements/location/:locationId`
- Useful for audits

---

## 7. Transfer Endpoints

### 7.1 Create Transfer

- **POST** `/api/v1/transfers`
- **Auth**: Procurement Officer
- Payload includes source/destination warehouse, items array (`productId`, `fromLocationId`, `quantity`, `unit`)
- Validates stock availability and different warehouse IDs
- Returns transfer with generated `transferCode`

### 7.2 List Transfers

- **GET** `/api/v1/transfers`
- Filters: `status`, `fromWarehouseId`, `toWarehouseId`, `requestedBy`, `dateRange`

### 7.3 Get Transfer by ID

- **GET** `/api/v1/transfers/:id`
- Includes status timeline and movement IDs

### 7.4 Get Transfer by Code

- **GET** `/api/v1/transfers/code/:code`
- Useful for handheld scanners

### 7.5 Approve Transfer

- **PATCH** `/api/v1/transfers/:id/approve`
- **Auth**: Source Warehouse Manager
- Body: optional `notes`
- Validates availability at approval time
- Creates audit log and notifies requester

### 7.6 Ship Transfer

- **PATCH** `/api/v1/transfers/:id/ship`
- Marks transfer `In Transit`, creates outbound movements
- Accepts carrier/tracking info

### 7.7 Receive Transfer

- **PATCH** `/api/v1/transfers/:id/receive`
- **Auth**: Destination Warehouse Staff
- Body includes actual quantities and destination locations
- Creates inbound movements, updates status to `Completed`

### 7.8 Cancel Transfer

- **PATCH** `/api/v1/transfers/:id/cancel`
- Allowed when `Pending` or `Approved`
- Requires reason; releases reserved stock

### 7.9 Transfers by Warehouse

- **GET** `/api/v1/transfers/warehouse/:warehouseId`
- Returns both sent and received transfers

---

## 8. Reporting & Utility Endpoints

### 8.1 Warehouse Summary Report

- **GET** `/api/v1/reports/warehouse-summary`
- Query: `warehouseId`, `fromDate`, `toDate`, `format` (json/csv/excel)
- Response: capacity overview, movement stats, transfer summary

### 8.2 Location Utilization Report

- **GET** `/api/v1/reports/location-utilization`
- Returns utilization heat map data and top underutilized areas

### 8.3 Movement Analysis Report

- **GET** `/api/v1/reports/movement-analysis`
- Payload patient: `movementType`, `timeBucket`, `warehouseId`

### 8.4 Transfer Summary Report

- **GET** `/api/v1/reports/transfer-summary`
- Shows transfer counts per status and lead times

### 8.5 Report Export

- **GET** `/api/v1/reports/export`
- Parameters: `reportType`, `format`, optional filters
- Response: `Content-Disposition` with file download

### 8.6 Export Location Barcodes

- **GET** `/api/v1/locations/export`
- Generates Excel/PDF with location codes and QR/Barcode URLs

### 8.7 Health Check

- **GET** `/api/v1/health` (public)
- Returns service/database status

### 8.8 Statistics

- **GET** `/api/v1/statistics`
- Restricted to admin roles
- Returns counts for warehouses, locations, movements, transfers, capacity alerts

---

## 9. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| WAREHOUSE_NOT_FOUND | 404 | Warehouse does not exist |
| LOCATION_NOT_FOUND | 404 | Location does not exist |
| MOVEMENT_NOT_FOUND | 404 | Movement record missing |
| TRANSFER_NOT_FOUND | 404 | Transfer record missing |
| DUPLICATE_WAREHOUSE | 409 | Warehouse code conflict |
| LOCATION_OCCUPIED | 409 | Location already storing product |
| INSUFFICIENT_CAPACITY | 409 | Not enough capacity for product |
| STOCK_UNAVAILABLE | 409 | Requested quantity not available |
| INVALID_STATUS_TRANSITION | 409 | Invalid transfer/movement status change |
| UNAUTHORIZED | 401 | Missing/invalid JWT |
| FORBIDDEN | 403 | Insufficient permissions |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Unexpected failure |
| DATABASE_ERROR | 500 | MongoDB operation failed |
| EXTERNAL_SERVICE_ERROR | 502 | PMS/IMS call failed |

---

## 10. Rate Limiting

| Endpoint Type | Limit | Burst | Scope |
|---------------|-------|-------|-------|
| Standard (CRUD) | 150/min | 300 | per user |
| Movement & Transfer | 60/min | 120 | per user |
| Reporting & Export | 10/min | 20 | per user |
| Health/Stats | 600/min | 1000 | per service token |

Headers included:
```
X-RateLimit-Limit: 150
X-RateLimit-Remaining: 120
X-RateLimit-Reset: 1704628800
```

Exceeded response (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, retry after 60 seconds",
    "retryAfter": 60
  },
  "timestamp": "2026-01-07T11:00:00Z"
}
```

---

## Document End

**Previous Document**: [3-User-Stories-Use-Cases.md](./3-User-Stories-Use-Cases.md)  
**Next Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: WMS Documentation (4/6 documents)  
**Overall Progress**: 22/30 documents (73.3%)
