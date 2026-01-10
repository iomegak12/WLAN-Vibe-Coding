# PMS Service - Architecture Diagram

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Product Management System (PMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

The PMS (Product Management System) is a Python-based microservice built with FastAPI that manages the complete product catalog including categories, sub-categories, products, and SKUs. It handles electronic and networking products sold by WLAN Corporation, supporting barcode/QR code generation and product lifecycle management.

---

## 2. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>React + Material-UI]
        MOBILE[Mobile Application<br/>React Native]
    end

    subgraph "API Layer"
        AUTH[AUTH Service<br/>Node.js + Express<br/>Port: 5001]
        PMS[PMS Service<br/>Python + FastAPI<br/>Port: 5002]
        SMS[SMS Service<br/>Python + FastAPI<br/>Port: 5003]
        WMS[WMS Service<br/>Python + FastAPI<br/>Port: 5004]
        IMS[IMS Service<br/>Python + FastAPI<br/>Port: 5005]
    end

    subgraph "Data Layer"
        AUTH_DB[(auth_db<br/>MongoDB)]
        PMS_DB[(pms_db<br/>MongoDB)]
        SMS_DB[(sms_db<br/>MongoDB)]
        WMS_DB[(wms_db<br/>MongoDB)]
        IMS_DB[(ims_db<br/>MongoDB)]
    end

    WEB -->|HTTPS/REST| PMS
    MOBILE -->|HTTPS/REST| PMS
    
    PMS --> PMS_DB
    PMS -.->|Token Validation| AUTH
    PMS -.->|Product Data| SMS
    PMS -.->|Product Data| IMS

    style PMS fill:#4CAF50,stroke:#2E7D32,color:#fff
    style PMS_DB fill:#1976D2,stroke:#0D47A1,color:#fff
```

---

## 3. PMS Service Architecture

```mermaid
graph TB
    subgraph "PMS Service - Port 5002"
        subgraph "API Layer"
            ROUTES[FastAPI Routes<br/>Router Configuration]
            MW_AUTH[Authentication<br/>Middleware]
            MW_VALID[Validation<br/>Middleware]
            MW_ERROR[Error Handler<br/>Middleware]
        end

        subgraph "Business Logic Layer"
            CAT_CTRL[Category Controller]
            SUBCAT_CTRL[Sub-Category Controller]
            PROD_CTRL[Product Controller]
            
            CAT_SVC[Category Service]
            SUBCAT_SVC[Sub-Category Service]
            PROD_SVC[Product Service]
            QR_SVC[QR/Barcode Service]
        end

        subgraph "Data Access Layer"
            CAT_MODEL[Category Model]
            SUBCAT_MODEL[Sub-Category Model]
            PROD_MODEL[Product Model]
        end

        subgraph "Utility Layer"
            QR_UTIL[QR Code Generator]
            BARCODE_UTIL[Barcode Generator]
            VALID_UTIL[Validation Utility]
            IMG_UTIL[Image Processing Utility]
        end
    end

    DB[(pms_db<br/>MongoDB)]
    AUTH_SVC[AUTH Service<br/>Token Verification]

    ROUTES --> MW_AUTH
    ROUTES --> MW_VALID
    MW_AUTH --> AUTH_SVC
    MW_AUTH --> CAT_CTRL
    MW_AUTH --> SUBCAT_CTRL
    MW_AUTH --> PROD_CTRL

    CAT_CTRL --> CAT_SVC
    SUBCAT_CTRL --> SUBCAT_SVC
    PROD_CTRL --> PROD_SVC

    PROD_SVC --> QR_SVC
    
    CAT_SVC --> CAT_MODEL
    SUBCAT_SVC --> SUBCAT_MODEL
    PROD_SVC --> PROD_MODEL

    CAT_MODEL --> DB
    SUBCAT_MODEL --> DB
    PROD_MODEL --> DB

    QR_SVC --> QR_UTIL
    QR_SVC --> BARCODE_UTIL
    PROD_SVC --> IMG_UTIL

    MW_ERROR -.->|Error Response| ROUTES

    style PROD_SVC fill:#FF9800,stroke:#E65100,color:#fff
    style QR_SVC fill:#FF9800,stroke:#E65100,color:#fff
    style QR_UTIL fill:#9C27B0,stroke:#6A1B9A,color:#fff
```

---

## 4. Component Responsibilities

### 4.1 API Layer

| Component | Responsibility |
|-----------|---------------|
| **FastAPI Routes** | Define API endpoints and route to controllers |
| **Authentication Middleware** | Verify JWT tokens via AUTH service |
| **Validation Middleware** | Validate request body/params using Pydantic models |
| **Error Handler Middleware** | Centralized error handling and response formatting |

### 4.2 Business Logic Layer

| Component | Responsibility |
|-----------|---------------|
| **Category Controller** | Handle category CRUD requests |
| **Sub-Category Controller** | Handle sub-category CRUD requests |
| **Product Controller** | Handle product CRUD requests |
| **Category Service** | Category business logic and validations |
| **Sub-Category Service** | Sub-category business logic and parent validation |
| **Product Service** | Product management, SKU generation, lifecycle |
| **QR/Barcode Service** | Generate and manage QR codes and barcodes |

### 4.3 Data Access Layer

| Component | Responsibility |
|-----------|---------------|
| **Category Model** | Category schema and database operations |
| **Sub-Category Model** | Sub-category schema and operations |
| **Product Model** | Product schema and operations |

### 4.4 Utility Layer

| Component | Responsibility |
|-----------|---------------|
| **QR Code Generator** | Generate QR codes for products |
| **Barcode Generator** | Generate barcodes for products |
| **Validation Utility** | Reusable validation functions |
| **Image Processing Utility** | Handle product image uploads and optimization |

---

## 5. Product Management Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant PMS as PMS Service
    participant AUTH as AUTH Service
    participant DB as pms_db
    participant QR as QR Service

    Note over Client,QR: Create Product Flow
    Client->>PMS: POST /api/v1/products<br/>Authorization: Bearer {token}
    PMS->>AUTH: POST /api/v1/auth/verify<br/>{token}
    AUTH-->>PMS: {valid: true, userId, role}
    
    PMS->>PMS: Validate product data
    PMS->>DB: Check category & sub-category exist
    DB-->>PMS: Validation success
    
    PMS->>PMS: Generate SKU
    PMS->>QR: Generate QR code & barcode
    QR-->>PMS: QR code image URL
    
    PMS->>DB: Insert product document
    DB-->>PMS: Product created
    PMS-->>Client: 201 Created {product}

    Note over Client,QR: Get Products with Filters
    Client->>PMS: GET /api/v1/products?category=Electronics
    PMS->>AUTH: Verify token
    AUTH-->>PMS: Valid
    PMS->>DB: Query with filters & pagination
    DB-->>PMS: Product list
    PMS-->>Client: 200 OK {products, pagination}
```

---

## 6. Data Hierarchy Architecture

```mermaid
graph TD
    subgraph "Product Hierarchy"
        CAT[Category<br/>e.g., Electronics]
        SUBCAT1[Sub-Category<br/>e.g., Routers]
        SUBCAT2[Sub-Category<br/>e.g., Switches]
        SUBCAT3[Sub-Category<br/>e.g., Access Points]
        
        PROD1[Product<br/>Cisco Router 2900]
        PROD2[Product<br/>TP-Link Archer C6]
        PROD3[Product<br/>Netgear Nighthawk]
        
        SKU1[SKU: ROUT-CISCO-2900]
        SKU2[SKU: ROUT-TPL-ARC6]
        SKU3[SKU: ROUT-NETG-NH]
    end
    
    CAT --> SUBCAT1
    CAT --> SUBCAT2
    CAT --> SUBCAT3
    
    SUBCAT1 --> PROD1
    SUBCAT1 --> PROD2
    SUBCAT1 --> PROD3
    
    PROD1 --> SKU1
    PROD2 --> SKU2
    PROD3 --> SKU3
    
    style CAT fill:#F44336,stroke:#C62828,color:#fff
    style SUBCAT1 fill:#FF9800,stroke:#E65100,color:#fff
    style PROD1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style SKU1 fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_PMS[PMS Service<br/>localhost:5002]
        DEV_DB[(MongoDB<br/>localhost:27017)]
        DEV_PMS --> DEV_DB
    end

    subgraph "On-Premise Deployment"
        ON_PREM_PMS[PMS Service<br/>Docker Container<br/>Port: 5002]
        ON_PREM_DB[(MongoDB<br/>Docker Container<br/>Port: 27017)]
        ON_PREM_PMS --> ON_PREM_DB
    end

    subgraph "AWS Cloud Deployment (Future)"
        subgraph "VPC"
            subgraph "ECS Cluster"
                AWS_PMS[PMS Service<br/>ECS Container]
            end
            subgraph "Database"
                AWS_DB[(MongoDB Atlas<br/>or DocumentDB)]
            end
            subgraph "Storage"
                S3[S3 Bucket<br/>Product Images & QR Codes]
            end
            AWS_LB[Application Load<br/>Balancer]
        end
        
        AWS_LB --> AWS_PMS
        AWS_PMS --> AWS_DB
        AWS_PMS --> S3
    end

    style DEV_PMS fill:#4CAF50,stroke:#2E7D32,color:#fff
    style ON_PREM_PMS fill:#FF9800,stroke:#E65100,color:#fff
    style AWS_PMS fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 8. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Python | 3.10+ | Programming language |
| **Framework** | FastAPI | 0.104+ | Web framework |
| **Server** | Uvicorn | 0.24+ | ASGI server |
| **Database** | MongoDB | 6.x | NoSQL database |
| **ODM** | Motor | 3.3+ | Async MongoDB driver |
| **Validation** | Pydantic | 2.5+ | Data validation |
| **QR Code** | qrcode | 7.4+ | QR code generation |
| **Barcode** | python-barcode | 0.15+ | Barcode generation |
| **Image Processing** | Pillow | 10.1+ | Image manipulation |
| **HTTP Client** | httpx | 0.25+ | Async HTTP requests (AUTH verification) |
| **Environment** | python-dotenv | 1.0+ | Environment variables |
| **CORS** | fastapi.middleware.cors | Built-in | Cross-origin resource sharing |
| **API Documentation** | FastAPI Swagger | Built-in | OpenAPI documentation |

---

## 9. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        L1[Layer 1: Transport Security<br/>HTTPS/TLS]
        L2[Layer 2: Authentication<br/>JWT Token Verification]
        L3[Layer 3: Authorization<br/>Role-Based Access Control]
        L4[Layer 4: Input Validation<br/>Pydantic Models]
        L5[Layer 5: Data Sanitization<br/>MongoDB Query Protection]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5

    subgraph "Security Measures"
        M1[Token Verification via AUTH]
        M2[Permission Checks]
        M3[Input Validation]
        M4[File Upload Restrictions]
        M5[NoSQL Injection Prevention]
        M6[CORS Configuration]
        M7[Rate Limiting]
    end

    style L2 fill:#F44336,stroke:#C62828,color:#fff
    style L3 fill:#F44336,stroke:#C62828,color:#fff
```

---

## 10. SKU Generation Strategy

```mermaid
flowchart LR
    Start([Product Creation]) --> ExtractInfo[Extract Category,<br/>Sub-Category, Brand]
    ExtractInfo --> GenPrefix[Generate Prefix<br/>CATCODE-SUBCATCODE]
    GenPrefix --> AddBrand[Add Brand Code<br/>CATCODE-SUBCATCODE-BRANDCODE]
    AddBrand --> AddSeq[Add Sequence Number<br/>CATCODE-SUBCATCODE-BRANDCODE-001]
    AddSeq --> Validate{SKU<br/>Unique?}
    Validate -->|No| IncrementSeq[Increment Sequence]
    IncrementSeq --> Validate
    Validate -->|Yes| AssignSKU[Assign SKU to Product]
    AssignSKU --> End([SKU Generated])
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

**Example SKU**: `ROUT-CISCO-2900-001`
- **ROUT**: Router sub-category code
- **CISCO**: Brand code
- **2900**: Model code
- **001**: Sequence number

---

## 11. QR Code & Barcode Architecture

```mermaid
graph TB
    subgraph "QR/Barcode Generation"
        PROD[Product Created] --> GenQR[Generate QR Code]
        PROD --> GenBar[Generate Barcode]
        
        GenQR --> QRContent[QR Content:<br/>Product ID, SKU, Name]
        GenBar --> BarContent[Barcode: SKU]
        
        QRContent --> SaveQR[Save QR Image]
        BarContent --> SaveBar[Save Barcode Image]
        
        SaveQR --> Storage[Storage:<br/>Local/S3]
        SaveBar --> Storage
        
        Storage --> UpdateProd[Update Product Record<br/>with URLs]
    end
    
    style PROD fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Storage fill:#2196F3,stroke:#1565C0,color:#fff
```

**QR Code Data Structure**:
```json
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "sku": "ROUT-CISCO-2900-001",
  "name": "Cisco Router 2900 Series",
  "category": "Electronics",
  "subCategory": "Routers"
}
```

---

## 12. Scalability Considerations

### 12.1 Horizontal Scaling
- Stateless service design allows multiple instances
- Load balancer distributes requests across instances
- No in-memory session storage

### 12.2 Database Scaling
- MongoDB replica sets for high availability
- Read replicas for read-heavy operations
- Indexing on frequently queried fields (SKU, category, name)

### 12.3 Caching Strategy
- Redis cache for frequently accessed categories (future enhancement)
- CDN for product images and QR codes
- API response caching for product lists

### 12.4 Performance Optimization
- Async database operations with Motor
- Connection pooling
- Pagination for large datasets
- Lazy loading of product images

---

## 13. Monitoring & Logging

```mermaid
graph LR
    PMS[PMS Service] --> LOGS[Python Logging]
    LOGS --> FILE[Log Files]
    LOGS --> CONSOLE[Console Output]
    
    PMS --> METRICS[Metrics Collection]
    METRICS --> HEALTH[Health Checks]
    
    style PMS fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### Key Metrics to Monitor
- Request rate and response time
- Product creation/update rate
- Database query performance
- QR code generation time
- Error rates by endpoint
- Cache hit/miss ratio

---

## 14. API Versioning Strategy

All PMS endpoints follow the pattern: `/api/v1/categories/*`, `/api/v1/products/*`

Future versions will use `/api/v2/...` while maintaining backward compatibility.

---

## 15. Environment Configuration

The service uses environment variables for configuration:

```
# Service Configuration
SERVICE_NAME=PMS
PORT=5002
HOST=0.0.0.0
ENVIRONMENT=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pms_db
DB_NAME=pms_db

# AUTH Service
AUTH_SERVICE_URL=http://localhost:5001/api/v1/auth/verify

# Storage Configuration
STORAGE_TYPE=local  # local or s3
STORAGE_PATH=./storage/products
S3_BUCKET=wlan-product-images
S3_REGION=ap-south-1

# QR Code Configuration
QR_CODE_SIZE=300
BARCODE_FORMAT=code128

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# API Configuration
API_PREFIX=/api/v1
DOCS_URL=/docs
```

---

## 16. Inter-Service Communication

```mermaid
graph LR
    PMS[PMS Service] -->|Token Verification| AUTH[AUTH Service]
    SMS[SMS Service] -->|Product Info| PMS
    IMS[IMS Service] -->|Product Info| PMS
    WMS[WMS Service] -->|Product Info| PMS
    
    PMS -->|Product Data| SMS
    PMS -->|Product Data| IMS
    
    style PMS fill:#4CAF50,stroke:#2E7D32,color:#fff
    style AUTH fill:#2196F3,stroke:#1565C0,color:#fff
```

### Communication Patterns
- **Synchronous**: REST API calls for token verification
- **Data Sharing**: Other services query PMS for product information
- **Future Enhancement**: Message queue for async product updates

---

## 17. File Storage Architecture

```mermaid
graph TB
    subgraph "File Upload Flow"
        Upload[Client Uploads Image] --> Validate[Validate File<br/>Type, Size]
        Validate --> Resize[Resize & Optimize]
        Resize --> GenName[Generate Unique Filename]
        GenName --> Store{Storage Type?}
        
        Store -->|Local| LocalStore[Save to Local Filesystem]
        Store -->|S3| S3Store[Upload to S3 Bucket]
        
        LocalStore --> UpdateDB[Update Product<br/>with Image URL]
        S3Store --> UpdateDB
    end
    
    style Upload fill:#4CAF50,stroke:#2E7D32,color:#fff
    style UpdateDB fill:#2196F3,stroke:#1565C0,color:#fff
```

**File Naming Convention**: `{productId}_{timestamp}_{original_name}.{ext}`  
**Supported Formats**: JPG, PNG, WebP  
**Max File Size**: 5MB  
**Image Optimization**: Resize to max 1920x1080, compress quality 85%

---

## 18. Project Structure

```
pms-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── dependencies.py        # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── categories.py
│   │   │   │   ├── subcategories.py
│   │   │   │   └── products.py
│   │   │   └── endpoints.py   # Route aggregator
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   └── product.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── category.py        # Pydantic schemas
│   │   ├── subcategory.py
│   │   └── product.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── category_service.py
│   │   ├── subcategory_service.py
│   │   ├── product_service.py
│   │   └── qr_service.py
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py            # JWT verification
│   │   ├── error_handler.py
│   │   └── logging.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── qr_generator.py
│   │   ├── barcode_generator.py
│   │   ├── image_processor.py
│   │   └── validators.py
│   │
│   └── database/
│       ├── __init__.py
│       ├── connection.py      # MongoDB connection
│       └── seed.py            # Seed data
│
├── storage/                   # Local file storage
│   └── products/
│       ├── images/
│       ├── qrcodes/
│       └── barcodes/
│
├── tests/
│   ├── __init__.py
│   ├── test_categories.py
│   ├── test_products.py
│   └── test_qr_generation.py
│
├── .env
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## Document End
**Next Document**: [2-ER-Diagram.md](./2-ER-Diagram.md)  
**Module Progress**: PMS Documentation (1/6 documents)  
**Overall Progress**: 7/30 documents (23.3%)
