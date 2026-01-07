# IMS Service - Architecture Diagram

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Inventory Management System (IMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

The Inventory Management System (IMS) is the central ledger for stock levels, reservations, adjustments, and audit trails spanning all warehouses and channels. It absorbs movement events from WMS, exposes consolidated inventory views to PMS/SMS, and feeds downstream reporting/BI consumers.

### Purpose
- Maintain authoritative stock counts across warehouses and products
- Provide real-time availability, reservations, and allocation APIs
- Reconcile inbound/outbound events from WMS and external fulfillment partners
- Emit inventory events for analytics, reporting, and capacity alerts
- Audit every stock change for traceability and regulatory compliance

### Technology Stack
- **Runtime**: Python 3.10+ (shared with other services for uniformity)
- **Framework**: FastAPI 0.104+ delivering async REST endpoints
- **ASGI Server**: Uvicorn 0.24+ with Gunicorn for production workers
- **Database**: MongoDB 6.x (ims_db) accessed via Motor 3.3+ for async queries
- **Cache**: Redis 7+ for hot product availability and rate limiting
- **Event Bus**: AWS SNS/SQS + DynamoDB stream adapters capture change events
- **Messaging**: Celery 5+ (with Redis broker) for background reconciliation jobs
- **Infra**: Docker Compose locally, AWS ECS + DocumentDB/MongoDB Atlas in production
- **Port**: 5005

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>React + Material UI]
        MOBILE[Mobile App<br/>React Native]
        BI[BI/Analytics<br/>Tableau, Metabase]
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>Nginx/Tyk]
    end

    subgraph "IMS Service - Port 5005"
        API[FastAPI Router]

        subgraph "HTTP Routes"
            STOCK_ROUTES[Stock Routes<br/>/inventory]
            RESERVE_ROUTES[Reservation Routes<br/>/inventory/reservations]
            AUDIT_ROUTES[Audit Routes<br/>/inventory/audit]
        end

        subgraph "Domain Services"
            STAY_SERVICE[Stock Service]
            RESERVE_SERVICE[Reservation Service]
            RECON_SERVICE[Reconciliation Service]
        end

        subgraph "Data Layer"
            STOCK_REPO[stock_levels Repository]
            RESERVATION_REPO[reservations Repository]
            AUDIT_REPO[audit Repository]
        end

        subgraph "Background Workers"
            CHANGE_STREAM[Change Stream Listener]
            RECON_WORKER[Reconciliation Worker]
        end
    end

    subgraph "External Systems"
        WMS[WMS Service<br/>FastAPI<br/>Port 5004]
        PMS[PMS Service<br/>FastAPI<br/>Port 5002]
        SMS[SMS Service<br/>FastAPI<br/>Port 5003]
        AUTH[AUTH Service<br/>Node + Express<br/>Port 5001]
        REPORTS[Reporting Service<br/>GraphQL + Prefect]
    end

    subgraph "Infra"
        MONGO[(MongoDB<br/>ims_db)]
        REDIS[(Redis Cache)]
        SNS[(AWS SNS Topics)]
        SQS[(AWS SQS Queues)]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    BI --> GATEWAY

    GATEWAY --> API

    API --> STOCK_ROUTES
    API --> RESERVE_ROUTES
    API --> AUDIT_ROUTES

    STOCK_ROUTES --> STAY_SERVICE
    RESERVE_ROUTES --> RESERVE_SERVICE
    AUDIT_ROUTES --> AUDIT_REPO

    STAY_SERVICE --> STOCK_REPO
    RESERVE_SERVICE --> RESERVATION_REPO
    RECON_SERVICE --> RECON_WORKER

    CHANGE_STREAM --> SNS
    SNS --> SQS
    SQS --> RECON_WORKER
    RECON_WORKER --> STOCK_REPO

    STOCK_REPO --> MONGO
    RESERVATION_REPO --> MONGO
    AUDIT_REPO --> MONGO

    API -.JWT Validation.-> AUTH
    API -.Product Details.-> PMS
    API -.Supplier Status.-> SMS
    API -.Stock Alerts.-> WMS

    WMS -.Stock Movement Events.-> SNS
    SNS -.Inventory Events.-> REPORTS

    API --> REDIS
    STAY_SERVICE --> REDIS
``` 

### 2.2 Event Stream Architecture

```mermaid
sequenceDiagram
    participant WMS as WMS Service
    participant Change as IMS Change Stream
    participant SNS as SNS Topic
    participant SQS as SQS Queue
    participant IMS as IMS Reconciliation Worker

    WMS->>SNS: Publish movement.created / transfer.completed
    SNS->>SQS: Fan-out to multiple queues
    Change->>SQS: Change stream adapter pushes metadata
    SQS->>IMS: Worker polls (visibility timeout 60s)
    IMS->>IMS: Deduplicate using event_id + timestamp
    IMS->>IMStock: Apply stock delta + reservations
    IMS->>Audit: Persist audit record
    IMS-->>WMS: Acknowledge (via HTTP callback)
    IMS-->>REPORTS: Emit inventory.updated event
``` 

---

## 3. Application Structure

```
IMS/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI entry point
│   ├── config.py                    # Environment and secrets
│   │
│   ├── routes/                      # REST routers
│   │   ├── __init__.py
│   │   ├── stock_routes.py          # Stock availability APIs
│   │   ├── reservation_routes.py    # Reservation lifecycle
│   │   ├── audit_routes.py          # Audit trail queries
│   │   └── health_routes.py         # Health, metrics
│   │
│   ├── services/                    # Business logic
│   │   ├── stock_service.py         # Stock reconciliation logic
│   │   ├── reservation_service.py   # Reservation orchestration
│   │   ├── event_service.py         # Event ingestion / deduplication
│   │   └── audit_service.py         # Audit persistence
│   │
│   ├── repositories/                # MongoDB access
│   │   ├── __init__.py
│   │   ├── stock_repository.py
│   │   ├── reservation_repository.py
│   │   └── audit_repository.py
│   │
│   ├── workers/                     # Background processing
│   │   ├── __init__.py
│   │   ├── change_stream_listener.py# MongoDB change stream -> SNS
│   │   ├── reconciliation_worker.py  # Polls SQS + applies updates
│   │   └── exporter.py              # Periodic exports to S3/BI
│   │
│   ├── models/                      # Pydantic + helper models
│   │   ├── __init__.py
│   │   ├── stock_models.py
│   │   ├── reservation_models.py
│   │   └── audit_models.py
│   │
│   ├── utils/                       # Shared utilities
│   │   ├── __init__.py
│   │   ├── dedupe.py                # Idempotency helpers
│   │   ├── cache.py                 # Redis helpers
│   │   ├── event_serializer.py      # Normalizes SNS payloads
│   │   └── validation.py            # Request validators
│   │
│   └── database/
│       ├── __init__.py
│       ├── connection.py            # Motor client
│       ├── indexes.py               # Index definitions and TTL rules
│       └── migrations.py            # Schema guard scripts
│
├── workers/                         # Celery periodic/long-running tasks
├── tests/                           # Test suite (unit, integration)
├── scripts/                         # Dev helpers (seed data, reload)
├── .env.example
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## 4. Data Model Overview

### 4.1 ER Diagram

```mermaid
erDiagram
    STOCK_LEVELS ||--o{ RESERVATIONS : "reports"
    STOCK_LEVELS ||--o{ STOCK_AUDIT : "logs"
    STOCK_LEVELS ||--o{ INVENTORY_EVENTS : "emits"

    STOCK_LEVELS {
        ObjectId _id PK
        ObjectId productId FK
        ObjectId warehouseId FK
        decimal availableQty
        decimal reservedQty
        decimal committedQty
        string unit
        timestamp lastUpdated
    }

    RESERVATIONS {
        ObjectId _id PK
        ObjectId stockLevelId FK
        string reservationCode UK
        decimal quantity
        string status
        string referenceType
        string referenceId
        ObjectId createdBy
        timestamp expiresAt
        timestamp createdAt
    }

    STOCK_AUDIT {
        ObjectId _id PK
        ObjectId stockLevelId FK
        decimal delta
        string reason
        string eventType
        ObjectId performedBy
        timestamp timestamp
        string traceId
    }

    INVENTORY_EVENTS {
        ObjectId _id PK
        string eventId UK
        string eventType
        ObjectId sourceId
        string payload
        string status
        timestamp receivedAt
        timestamp processedAt
    }
``` 

### 4.2 Collections Summary

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **stock_levels** | Current stock per warehouse/product | productId, warehouseId, availableQty, reservedQty, committedQty |
| **reservations** | Hold/reserve stock for orders/transfers | reservationCode, referenceType, quantity, status, expiresAt |
| **stock_audit** | Immutable audit trail for every stock change | stockLevelId, delta, reason, eventType, traceId |
| **inventory_events** | Inbox for deduplicated events | eventId, eventType, payload, status, processedAt |

---

## 5. API Endpoint Categories

| Category | Sample Endpoints | Description |
|----------|------------------|-------------|
| **Stock Visibility** | `GET /api/v1/inventory/stock`, `GET /api/v1/inventory/stock/{warehouseId}` | Provide real-time stock and availability per warehouse or SKU, include pagination and filters |
| **Reservations** | `POST /api/v1/inventory/reservations`, `PATCH /api/v1/inventory/reservations/{id}/cancel`, `GET /api/v1/inventory/reservations/{id}` | Reserve stock for transfers, sales, or repair jobs with automatic expiry, cancellation, and reconciliation hooks |
| **Adjustments & Transfers** | `POST /api/v1/inventory/adjsut`, `POST /api/v1/inventory/allocations` | Manual adjustments, transfer acceptance reconciling with WMS movements |
| **Audit & History** | `GET /api/v1/inventory/audit`, `GET /api/v1/inventory/history/{productId}` | Trace stock deltas with traceId, user context, eventType filters |
| **Events & Health** | `POST /api/v1/inventory/events/ack`, `GET /api/v1/health` | Accept external event acknowledgements and expose service health/metrics |

---

## 6. Integration Points

- **WMS** pushes movement/transfer events via MongoDB change streams → SNS → SQS. IMS workers acknowledge updates and notify WMS when reconciled.
- **PMS** provides product metadata (dimensions, SKU, status) during reservation validation and stock allocation.
- **SMS** shares supplier/lead time data for stock aging calculations that feed IMS alerts.
- **AUTH** supplies JWT verification (via `/auth/verify`) plus role claims used for admin actions.
- **Reporting Service** consumes `inventory.updated` events for capacity forecasting, BI dashboards, and SLA monitoring.
- **External BI** (Tableau/Metabase) queries IMS snapshots exported nightly to S3.

---

## 7. Observability & Reliability

| Concern | Tooling | Notes |
|---------|--------|-------|
| Logs | Datadog + Winston | JSON logs include `traceId`, `eventId`, and `userId` fields to correlate with WMS orders |
| Metrics | Prometheus + Grafana | Exporters track queue depth (SQS), reconciliation latency, reservation expiry rates |
| Tracing | AWS X-Ray | Instrument HTTP, MongoDB, and SNS/SQS interactions with shared trace IDs |
| Alerts | PagerDuty | Alerts fire for stale queues (>5m), reconciliation errors, or Redis cache misses |
| Health | `/api/v1/health` | Checks MongoDB, Redis, and SNS/SQS connectivity; synthetic canaries run via CloudWatch Synthetics |

---

## Document End
**Previous Document**: [Back-End/Docs/WMS/6-Integration-Flow-Diagrams.md](Back-End/Docs/WMS/6-Integration-Flow-Diagrams.md)  
**Next Document**: [Back-End/Docs/IMS/2-ER-Diagram.md](Back-End/Docs/IMS/2-ER-Diagram.md)  
**Module Progress**: IMS Documentation (1/6 documents)  
**Overall Progress**: 25/30 documents (83.3%)
