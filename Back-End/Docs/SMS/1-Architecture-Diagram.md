# SMS Service - Architecture Diagram

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Supplier Management System (SMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

The Supplier Management System (SMS) is a microservice responsible for managing suppliers, supplier contacts, supplier-product relationships, and supplier performance tracking. It provides APIs for supplier CRUD operations, contact management, and integration with PMS for product-supplier linking.

### Key Responsibilities
- Supplier registration and management
- Supplier contact information management
- Supplier-product relationship tracking
- Supplier performance metrics
- Payment terms and conditions
- Supplier status management (Active, Inactive, Blacklisted)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>React + Material-UI]
        MOBILE[Mobile Application<br/>React Native]
    end
    
    subgraph "API Gateway Layer"
        GATEWAY[API Gateway<br/>Optional for Production]
    end
    
    subgraph "SMS Service - Python/FastAPI"
        API[API Layer<br/>FastAPI Routes]
        BL[Business Logic Layer<br/>Service Classes]
        VAL[Validation Layer<br/>Pydantic Models]
        DB_ACCESS[Data Access Layer<br/>Motor Async Client]
    end
    
    subgraph "External Services"
        AUTH[AUTH Service<br/>Token Validation<br/>Port 5001]
        PMS[PMS Service<br/>Product Info<br/>Port 5002]
    end
    
    subgraph "Data Layer"
        MONGO[(MongoDB<br/>sms_db)]
    end
    
    subgraph "Storage Layer"
        FILES[File Storage<br/>Supplier Documents]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    GATEWAY --> API
    
    API --> VAL
    VAL --> BL
    BL --> DB_ACCESS
    BL --> AUTH
    BL --> PMS
    
    DB_ACCESS --> MONGO
    BL --> FILES
    
    style API fill:#FF9800,stroke:#E65100,color:#fff
    style BL fill:#FF9800,stroke:#E65100,color:#fff
    style MONGO fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 3. Detailed Component Architecture

### 3.1 FastAPI Application Structure

```mermaid
graph TD
    subgraph "FastAPI Application"
        MAIN[main.py<br/>Application Entry Point]
        
        subgraph "API Routes"
            SUPPLIER_ROUTES[suppliers.py<br/>Supplier CRUD APIs]
            CONTACT_ROUTES[contacts.py<br/>Contact Management APIs]
            PRODUCT_SUPPLIER_ROUTES[product_suppliers.py<br/>Product-Supplier Link APIs]
            UTIL_ROUTES[utils.py<br/>Health, Stats APIs]
        end
        
        subgraph "Services"
            SUPPLIER_SVC[supplier_service.py<br/>Supplier Business Logic]
            CONTACT_SVC[contact_service.py<br/>Contact Business Logic]
            PRODUCT_SUPPLIER_SVC[product_supplier_service.py<br/>Product-Supplier Logic]
            AUTH_SVC[auth_service.py<br/>JWT Validation]
        end
        
        subgraph "Models"
            PYDANTIC[Pydantic Models<br/>Request/Response Schemas]
            DB_MODELS[Database Models<br/>MongoDB Documents]
        end
        
        subgraph "Database"
            DB_CLIENT[database.py<br/>MongoDB Connection]
        end
        
        subgraph "Middleware"
            AUTH_MW[Authentication Middleware]
            CORS_MW[CORS Middleware]
            ERROR_MW[Error Handling Middleware]
            LOGGING_MW[Logging Middleware]
        end
        
        subgraph "Utilities"
            HELPERS[helpers.py<br/>Utility Functions]
            VALIDATORS[validators.py<br/>Custom Validators]
            CONSTANTS[constants.py<br/>Enums & Constants]
        end
    end
    
    MAIN --> AUTH_MW
    MAIN --> CORS_MW
    MAIN --> ERROR_MW
    MAIN --> LOGGING_MW
    
    MAIN --> SUPPLIER_ROUTES
    MAIN --> CONTACT_ROUTES
    MAIN --> PRODUCT_SUPPLIER_ROUTES
    MAIN --> UTIL_ROUTES
    
    SUPPLIER_ROUTES --> SUPPLIER_SVC
    CONTACT_ROUTES --> CONTACT_SVC
    PRODUCT_SUPPLIER_ROUTES --> PRODUCT_SUPPLIER_SVC
    
    SUPPLIER_SVC --> PYDANTIC
    SUPPLIER_SVC --> DB_CLIENT
    SUPPLIER_SVC --> AUTH_SVC
    SUPPLIER_SVC --> HELPERS
    
    CONTACT_SVC --> PYDANTIC
    CONTACT_SVC --> DB_CLIENT
    
    PRODUCT_SUPPLIER_SVC --> PYDANTIC
    PRODUCT_SUPPLIER_SVC --> DB_CLIENT
    
    style MAIN fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 4. Technology Stack

### 4.1 Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Python | 3.10+ | Programming language |
| Framework | FastAPI | 0.104+ | Web framework |
| Server | Uvicorn | 0.24+ | ASGI server |
| Database | MongoDB | 6.x | Document database |
| DB Driver | Motor | 3.3+ | Async MongoDB driver |
| Validation | Pydantic | 2.5+ | Data validation |
| Authentication | JWT | - | Token validation via AUTH service |

### 4.2 Additional Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| python-multipart | 0.0.6+ | File upload handling |
| python-dotenv | 1.0+ | Environment configuration |
| httpx | 0.25+ | Async HTTP client for service calls |
| aiofiles | 23.2+ | Async file operations |
| openpyxl | 3.1+ | Excel export for supplier lists |
| python-jose | 3.3+ | JWT token handling |

---

## 5. Project Structure

```
sms-service/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   ├── config.py                    # Configuration settings
│   ├── database.py                  # MongoDB connection setup
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── suppliers.py         # Supplier CRUD endpoints
│   │   │   ├── contacts.py          # Contact management endpoints
│   │   │   ├── product_suppliers.py # Product-Supplier link endpoints
│   │   │   └── utils.py             # Health check, statistics
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── supplier.py              # Supplier Pydantic models
│   │   ├── contact.py               # Contact Pydantic models
│   │   ├── product_supplier.py      # Product-Supplier Pydantic models
│   │   └── common.py                # Common models (pagination, response)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supplier_service.py      # Supplier business logic
│   │   ├── contact_service.py       # Contact business logic
│   │   ├── product_supplier_service.py # Product-Supplier logic
│   │   └── auth_service.py          # JWT validation logic
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helpers.py               # Utility functions
│   │   ├── validators.py            # Custom validators
│   │   ├── constants.py             # Enums and constants
│   │   └── exceptions.py            # Custom exceptions
│   │
│   └── middleware/
│       ├── __init__.py
│       ├── authentication.py        # Auth middleware
│       ├── error_handler.py         # Error handling middleware
│       └── logging.py               # Logging middleware
│
├── tests/
│   ├── __init__.py
│   ├── test_suppliers.py
│   ├── test_contacts.py
│   └── test_product_suppliers.py
│
├── alembic/                         # Database migrations (if needed)
├── storage/                         # Local file storage
│   └── supplier_documents/
│
├── .env                             # Environment variables
├── .env.example                     # Example environment file
├── requirements.txt                 # Python dependencies
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # Docker Compose setup
└── README.md                        # Service documentation
```

---

## 6. Data Flow Architecture

### 6.1 Request-Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant FastAPI
    participant Middleware
    participant Router
    participant Service
    participant Validator
    participant Database
    participant AUTH
    
    Client->>FastAPI: HTTP Request
    FastAPI->>Middleware: Process Request
    
    Middleware->>Middleware: CORS Check
    Middleware->>Middleware: Extract JWT Token
    
    Middleware->>AUTH: Validate Token
    AUTH-->>Middleware: User Info {userId, role}
    
    Middleware->>Router: Forward Request + User Context
    
    Router->>Validator: Validate Request Data
    Validator->>Validator: Pydantic Validation
    
    alt Validation Failed
        Validator-->>Router: Validation Error
        Router-->>Client: 400 Bad Request
    end
    
    Validator-->>Router: Valid Data
    Router->>Service: Call Business Logic
    
    Service->>Service: Process Business Rules
    Service->>Database: Query/Update Data
    Database-->>Service: Result
    
    Service->>Service: Format Response
    Service-->>Router: Response Data
    
    Router->>Middleware: Log Response
    Middleware-->>Client: HTTP Response
```

---

## 7. Database Architecture

### 7.1 Collections Overview

```mermaid
erDiagram
    SUPPLIERS ||--o{ CONTACTS : has
    SUPPLIERS ||--o{ PRODUCT_SUPPLIERS : provides
    PRODUCT_SUPPLIERS }o--|| PRODUCTS : references
    SUPPLIERS ||--o{ SUPPLIER_AUDIT : logs
    
    SUPPLIERS {
        ObjectId _id PK
        string supplierCode UK
        string name
        string email
        string phone
        object address
        string taxId
        string paymentTerms
        string status
        decimal creditLimit
        ObjectId createdBy
        datetime createdAt
        boolean isDeleted
    }
    
    CONTACTS {
        ObjectId _id PK
        ObjectId supplierId FK
        string name
        string email
        string phone
        string designation
        boolean isPrimary
        boolean isActive
        datetime createdAt
    }
    
    PRODUCT_SUPPLIERS {
        ObjectId _id PK
        ObjectId supplierId FK
        ObjectId productId FK
        decimal supplierPrice
        int leadTimeDays
        int minOrderQuantity
        boolean isPreferred
        datetime createdAt
    }
    
    SUPPLIER_AUDIT {
        ObjectId _id PK
        ObjectId supplierId FK
        string action
        ObjectId performedBy
        datetime timestamp
        object changes
    }
```

---

## 8. Authentication & Authorization Flow

### 8.1 JWT Token Validation

```mermaid
flowchart TD
    Request[Incoming Request] --> Extract[Extract JWT Token<br/>from Authorization Header]
    
    Extract --> TokenExists{Token<br/>Present?}
    
    TokenExists -->|No| Reject401[Return 401<br/>Unauthorized]
    
    TokenExists -->|Yes| CallAuth[Call AUTH Service<br/>POST /auth/verify-token]
    
    CallAuth --> AuthResponse{Token<br/>Valid?}
    
    AuthResponse -->|No| Reject401
    
    AuthResponse -->|Yes| ExtractUser[Extract User Info<br/>userId, role, permissions]
    
    ExtractUser --> AttachContext[Attach User Context<br/>to Request]
    
    AttachContext --> CheckRole{Role Has<br/>Permission?}
    
    CheckRole -->|No| Reject403[Return 403<br/>Forbidden]
    
    CheckRole -->|Yes| ProcessRequest[Process Request]
    
    ProcessRequest --> Success[Return Response]
    
    Reject401 --> End([End])
    Reject403 --> End
    Success --> End
    
    style Request fill:#2196F3,stroke:#1565C0,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Reject401 fill:#F44336,stroke:#C62828,color:#fff
    style Reject403 fill:#F44336,stroke:#C62828,color:#fff
```

### 8.2 Role-Based Access Control

| Role | Suppliers | Contacts | Product-Supplier Links | Statistics |
|------|-----------|----------|------------------------|------------|
| Super Admin | Full Access | Full Access | Full Access | Full Access |
| Product Manager | Read, Create, Update | Read, Create, Update | Full Access | Read |
| Procurement Officer | Full Access | Full Access | Full Access | Read |
| Warehouse Manager | Read | Read | Read | Read |
| Inventory Manager | Read | Read | Read | Read |
| Warehouse Staff | Read | Read | Read | No Access |
| Auditor/Viewer | Read | Read | Read | Read |

---

## 9. Integration Points

### 9.1 SMS Integration with Other Services

```mermaid
graph TB
    subgraph "SMS Service"
        SMS_API[SMS API Layer]
        SMS_BL[SMS Business Logic]
    end
    
    subgraph "AUTH Service"
        AUTH_API[Token Validation API]
        AUTH_USER[User Information API]
    end
    
    subgraph "PMS Service"
        PMS_PRODUCT[Product Details API]
        PMS_VALIDATION[Product Validation API]
    end
    
    subgraph "IMS Service"
        IMS_PURCHASE[Purchase Order API]
        IMS_RECEIPT[Goods Receipt API]
    end
    
    SMS_BL -->|Validate JWT| AUTH_API
    SMS_BL -->|Get User Details| AUTH_USER
    
    SMS_BL -->|Get Product Info| PMS_PRODUCT
    SMS_BL -->|Validate Product ID| PMS_VALIDATION
    
    IMS_PURCHASE -->|Get Supplier Info| SMS_API
    IMS_RECEIPT -->|Get Supplier Details| SMS_API
    
    style SMS_API fill:#FF9800,stroke:#E65100,color:#fff
    style SMS_BL fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 10. Deployment Architecture

### 10.1 Development Environment

```mermaid
graph TB
    subgraph "Developer Machine"
        CODE[Source Code]
        VENV[Python Virtual Env]
        LOCAL_MONGO[(MongoDB Local)]
    end
    
    CODE --> VENV
    VENV -->|uvicorn| SMS_DEV[SMS Service<br/>localhost:5003]
    SMS_DEV --> LOCAL_MONGO
    
    SMS_DEV -->|HTTP| AUTH_DEV[AUTH Service<br/>localhost:5001]
    SMS_DEV -->|HTTP| PMS_DEV[PMS Service<br/>localhost:5002]
    
    style SMS_DEV fill:#FF9800,stroke:#E65100,color:#fff
```

### 10.2 Docker Container Environment

```mermaid
graph TB
    subgraph "Docker Network"
        subgraph "SMS Container"
            SMS_APP[FastAPI Application<br/>uvicorn<br/>Port 5003]
        end
        
        subgraph "MongoDB Container"
            MONGO[(MongoDB<br/>Port 27017)]
        end
        
        subgraph "AUTH Container"
            AUTH[AUTH Service<br/>Port 5001]
        end
        
        subgraph "PMS Container"
            PMS[PMS Service<br/>Port 5002]
        end
        
        SMS_APP --> MONGO
        SMS_APP --> AUTH
        SMS_APP --> PMS
    end
    
    CLIENT[Client Applications] -->|Port 5003| SMS_APP
    
    style SMS_APP fill:#FF9800,stroke:#E65100,color:#fff
```

### 10.3 Production Environment (AWS)

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Load Balancer"
            ALB[Application Load Balancer]
        end
        
        subgraph "ECS Cluster"
            subgraph "SMS Tasks"
                SMS1[SMS Container 1]
                SMS2[SMS Container 2]
                SMS3[SMS Container 3]
            end
        end
        
        subgraph "Database"
            MONGO[(MongoDB Atlas<br/>or DocumentDB)]
        end
        
        subgraph "Storage"
            S3[S3 Bucket<br/>Supplier Documents]
        end
        
        subgraph "Other Services"
            AUTH[AUTH Service]
            PMS[PMS Service]
        end
    end
    
    INTERNET[Internet] --> ALB
    ALB --> SMS1
    ALB --> SMS2
    ALB --> SMS3
    
    SMS1 --> MONGO
    SMS2 --> MONGO
    SMS3 --> MONGO
    
    SMS1 --> S3
    SMS2 --> S3
    SMS3 --> S3
    
    SMS1 --> AUTH
    SMS1 --> PMS
    
    style SMS1 fill:#FF9800,stroke:#E65100,color:#fff
    style SMS2 fill:#FF9800,stroke:#E65100,color:#fff
    style SMS3 fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 11. Configuration Management

### 11.1 Environment Variables

```python
# .env file structure
# Application Settings
APP_NAME=SMS-Service
APP_VERSION=1.0.0
ENVIRONMENT=development  # development, staging, production
DEBUG=True
PORT=5003

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=sms_db
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=50

# AUTH Service Configuration
AUTH_SERVICE_URL=http://localhost:5001
AUTH_VERIFY_TOKEN_ENDPOINT=/api/v1/auth/verify-token

# PMS Service Configuration
PMS_SERVICE_URL=http://localhost:5002
PMS_PRODUCT_ENDPOINT=/api/v1/products

# File Storage Configuration
STORAGE_TYPE=local  # local, s3
STORAGE_LOCAL_PATH=./storage/supplier_documents
AWS_S3_BUCKET=wlan-sms-documents
AWS_S3_REGION=ap-south-1

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60  # seconds

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=./logs/sms.log
LOG_FORMAT=json

# Performance Settings
REQUEST_TIMEOUT=30  # seconds
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
```

---

## 12. API Versioning Strategy

### 12.1 URL Versioning

All SMS APIs follow versioned URL structure:

```
Base URL: http://localhost:5003
API Prefix: /api/v1/

Examples:
- GET /api/v1/suppliers
- POST /api/v1/suppliers
- GET /api/v1/suppliers/{id}
- GET /api/v1/contacts
- POST /api/v1/product-suppliers
```

### 12.2 Version Migration Path

```mermaid
graph LR
    V1[Version 1.0<br/>Initial Release] --> V1_1[Version 1.1<br/>Add Performance Metrics]
    V1_1 --> V2[Version 2.0<br/>Breaking Changes<br/>New Endpoints]
    
    V1 -.->|Deprecated| V1_EOL[V1 End of Life<br/>6 months after V2]
    
    style V1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style V2 fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 13. Error Handling Architecture

### 13.1 Error Flow

```mermaid
flowchart TD
    Exception[Exception Raised] --> ErrorType{Exception<br/>Type?}
    
    ErrorType -->|Pydantic<br/>ValidationError| HandleValidation[Extract Field Errors]
    ErrorType -->|HTTP<br/>Exception| HandleHTTP[Extract Status & Message]
    ErrorType -->|MongoDB<br/>Error| HandleDB[Database Error Handler]
    ErrorType -->|External<br/>Service Error| HandleExternal[Service Communication Error]
    ErrorType -->|Other| HandleGeneric[Generic Error Handler]
    
    HandleValidation --> FormatError[Format Error Response]
    HandleHTTP --> FormatError
    HandleDB --> FormatError
    HandleExternal --> FormatError
    HandleGeneric --> FormatError
    
    FormatError --> LogError[Log Error Details]
    LogError --> ReturnResponse[Return Error Response<br/>to Client]
    
    ReturnResponse --> CheckSeverity{Critical<br/>Error?}
    CheckSeverity -->|Yes| AlertAdmin[Send Alert<br/>to Admin]
    CheckSeverity -->|No| End([End])
    AlertAdmin --> End
    
    style Exception fill:#F44336,stroke:#C62828,color:#fff
```

---

## 14. Performance Considerations

### 14.1 Optimization Strategies

| Strategy | Implementation | Benefit |
|----------|----------------|---------|
| Database Indexing | Indexes on supplierId, supplierCode, productId | Faster queries |
| Response Caching | Redis cache for frequently accessed suppliers | Reduced DB load |
| Pagination | Default limit of 10, max 100 | Controlled response size |
| Async Operations | Motor async driver for MongoDB | Non-blocking I/O |
| Connection Pooling | Min 10, Max 50 connections | Efficient resource usage |
| Query Projection | Fetch only required fields | Reduced data transfer |
| Batch Operations | Bulk insert/update for multiple records | Fewer DB roundtrips |

### 14.2 Monitoring Metrics

```mermaid
graph TB
    subgraph "Application Metrics"
        REQ_COUNT[Request Count]
        RESP_TIME[Response Time]
        ERROR_RATE[Error Rate]
    end
    
    subgraph "Database Metrics"
        QUERY_TIME[Query Execution Time]
        CONN_POOL[Connection Pool Usage]
        SLOW_QUERIES[Slow Query Count]
    end
    
    subgraph "External Service Metrics"
        AUTH_RESP[AUTH Service Response Time]
        PMS_RESP[PMS Service Response Time]
        SERVICE_ERRORS[External Service Errors]
    end
    
    subgraph "System Metrics"
        CPU[CPU Usage]
        MEMORY[Memory Usage]
        DISK[Disk I/O]
    end
    
    DASHBOARD[Monitoring Dashboard] --> REQ_COUNT
    DASHBOARD --> RESP_TIME
    DASHBOARD --> QUERY_TIME
    DASHBOARD --> AUTH_RESP
    DASHBOARD --> CPU
    
    style DASHBOARD fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 15. Security Architecture

### 15.1 Security Layers

```mermaid
graph TB
    Client[Client Request] --> HTTPS[HTTPS/TLS Encryption]
    HTTPS --> CORS[CORS Validation]
    CORS --> RateLimit[Rate Limiting]
    RateLimit --> Auth[JWT Authentication]
    Auth --> AuthZ[Role-Based Authorization]
    AuthZ --> InputVal[Input Validation & Sanitization]
    InputVal --> Business[Business Logic]
    Business --> DataAccess[Secure Data Access]
    DataAccess --> Response[Encrypted Response]
    
    style HTTPS fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Auth fill:#2196F3,stroke:#1565C0,color:#fff
    style InputVal fill:#FF9800,stroke:#E65100,color:#fff
```

### 15.2 Security Best Practices

| Area | Practice | Implementation |
|------|----------|----------------|
| Authentication | JWT token validation | Via AUTH service for every request |
| Authorization | Role-based access control | Middleware checks user permissions |
| Input Validation | Pydantic models | Strict type checking and validation |
| SQL Injection | MongoDB driver escaping | Motor driver handles escaping |
| XSS Prevention | Output sanitization | HTML escape in responses |
| Rate Limiting | Per-user/IP limits | 100 requests per minute |
| Sensitive Data | Encryption at rest | MongoDB encryption (production) |
| Audit Logging | Track all changes | supplier_audit collection |

---

## Document End

**Next Document**: [2-ER-Diagram.md](./2-ER-Diagram.md)  
**Module Progress**: SMS Documentation (1/6 documents)  
**Overall Progress**: 13/30 documents (43.3%)
