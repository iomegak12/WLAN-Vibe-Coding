# IMS Service - API Endpoint Specifications

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Inventory Management System (IMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

IMS exposes RESTful endpoints for stock visibility, reservation lifecycle, audit trails, event ingestion, and reconciliation. Every API is scoped under `/api/v1/` and accepts JWTs provided by the AUTH service.

### Base URLs
```
Development: http://localhost:5005
Production: https://ims.wlancorp.com
```

### API Prefix
```
/api/v1/
```

---

## 2. Authentication & Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | `Bearer <jwt_token>` issued by AUTH service |
| Content-Type | Yes (for POST/PUT/PATCH) | `application/json` |
| Accept | Optional | `application/json` |

- JWT validation occurs via AUTH `/auth/verify`; IMS caches claims for up to 60 seconds to reduce latency.
- RBAC checks reference permissions such as `inventory.read`, `inventory.update`, `reservations.manage`, and `audit.read`.

---

## 3. Standard Response Format

### Success
```json
{
	"success": true,
	"data": { ... },
	"message": "Operation completed",
	"timestamp": "2026-01-07T12:00:00Z"
}
```

### Error
```json
{
	"success": false,
	"error": {
		"code": "ERROR_CODE",
		"message": "Human readable description",
		"details": {}
	},
	"timestamp": "2026-01-07T12:00:00Z"
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
			"limit": 25,
			"total": 120,
			"pages": 5,
			"hasNext": true,
			"hasPrev": false
		}
	},
	"timestamp": "2026-01-07T12:00:00Z"
}
```

---

## 4. Rate Limiting & Pagination

- Default rate limit: 120 requests/minute per token; 429 response `RATE_LIMIT_EXCEEDED` when exceeded.
- Paginated lists accept `page`, `limit` (max 100), `sortBy`, and `sortOrder` query params.
- Cursor-based pagination used for `stock_audit` and `inventory_events` to support long-running exports.

---

## 5. Stock Visibility Endpoints

### 5.1 GET /api/v1/inventory/stock
- **Auth**: inventory.read
- **Query**: `warehouseId`, `productId`, `sku`, `status`, `page`, `limit`
- Returns rows containing available/reserved/committed quantities.
- **Response** sample:
```json
{
	"success": true,
	"data": {
		"items": [
			{
				"productId": "6789abcd1234pms00020001",
				"warehouseId": "6789abcd1234wms00030001",
				"availableQty": 1200,
				"reservedQty": 150,
				"committedQty": 200,
				"unit": "pcs",
				"lastUpdated": "2026-01-07T12:15:00Z"
			}
		],
		"pagination": { ... }
	}
}
```

### 5.2 GET /api/v1/inventory/stock/{id}
- Returns a single stock level record.

### 5.3 GET /api/v1/inventory/stock/warehouse/{warehouseId}
- Provides summary across the warehouse (total available, reserved, committed).

### 5.4 GET /api/v1/inventory/products/{productId}/stock
- Shows per-warehouse breakdown for a given SKU.

---

## 6. Reservation Management Endpoints

### 6.1 POST /api/v1/inventory/reservations
- **Auth**: reservations.manage
- Body example:
```json
{
	"stockLevelId": "6789abcd1234ims00010001",
	"quantity": 50,
	"referenceType": "Transfer",
	"referenceId": "TRF-20260107-001",
	"expiresAt": "2026-01-07T12:45:00Z"
}
```
- Ensures requested quantity ≤ available quantity and emits `reservation.created` event.

### 6.2 PATCH /api/v1/inventory/reservations/{id}/confirm
- Changes status to `Confirmed`, updates stock_levels, logs audit entry.

### 6.3 PATCH /api/v1/inventory/reservations/{id}/cancel
- Releases reserved quantity back to available and records cancellation reason.

### 6.4 GET /api/v1/inventory/reservations
- Filter by `warehouseId`, `status`, `referenceType`, `fromDate`, `toDate`, `page`, `limit`.

### 6.5 GET /api/v1/inventory/reservations/{id}
- Returns reservation details, linked stock level snapshot, and TTL info.

---

## 7. Audit & Event Endpoints

### 7.1 GET /api/v1/inventory/audit
- **Auth**: audit.read
- Filters: `productId`, `warehouseId`, `performedBy`, `eventType`, `traceId`, date range. Cursor pagination supported.

### 7.2 POST /api/v1/inventory/events/ack
- **Auth**: inventory.update
- Body: `eventId`, `status`, `processedAt`, optional `notes`. Used by reconciliation workers to acknowledge SNS/SQS events.

### 7.3 POST /api/v1/inventory/events/retry
- Triggers manual retry for failed entries in `inventory_events` queue when automatic retries exceed limit.

### 7.4 GET /api/v1/inventory/events/{eventId}
- Returns payload, status history, reason for failure, and linked stock_level.

---

## 8. Reconciliation & Integration Endpoints

### 8.1 POST /api/v1/inventory/adjustments
- Accepts physical count adjustments with fields: `productId`, `warehouseId`, `delta`, `reason`, `traceId`. Approvals required if `|delta| > 5%` of total.

### 8.2 POST /api/v1/inventory/reconcile
- Kicks off reconciliation workflow between IMS ledger and WMS snapshot; supports `dryRun=true`.

### 8.3 GET /api/v1/inventory/alerts
- Returns capacity or availability alerts (severity, product, warehouse, threshold).

### 8.4 POST /api/v1/inventory/sync/products
- Pulls product metadata from PMS/SMS to refresh cached statuses/dimensions. Accepts optional list of productIds.

---

## 9. Utility & Reporting Endpoints

### 9.1 GET /api/v1/health
- Public endpoint showing MongoDB, Redis, SNS/SQS status.

### 9.2 GET /api/v1/statistics
- Returns counts (stock rows, reservations, audit entries) and queue lag metrics; requires `inventory.read`.

### 9.3 GET /api/v1/reports/inventory-snapshot
- Generates synchronous snapshot or async export. Query params: `warehouseId`, `format` (csv/parquet), `fromDate`, `toDate`. Responds with `downloadUrl`.

### 9.4 POST /api/v1/notifications/webhook
- Receives webhook callbacks from BI/reporting when exports complete; HMAC signed via `x-wlan-signature`.

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation issues |
| UNAUTHORIZED | 401 | Missing/invalid JWT |
| FORBIDDEN | 403 | Insufficient role/permission |
| RESOURCE_NOT_FOUND | 404 | Stock/reservation/audit record missing |
| STOCK_CONFLICT | 409 | Requested quantity exceeds availability |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Unexpected failure |

---

## Document End
**Previous Document**: [Back-End/Docs/IMS/3-User-Stories-Use-Cases.md](Back-End/Docs/IMS/3-User-Stories-Use-Cases.md)  
**Next Document**: [Back-End/Docs/IMS/5-DB-Schema-Collections.md](Back-End/Docs/IMS/5-DB-Schema-Collections.md)  
**Module Progress**: IMS Documentation (4/6 documents)  
**Overall Progress**: 28/30 documents (93.3%)