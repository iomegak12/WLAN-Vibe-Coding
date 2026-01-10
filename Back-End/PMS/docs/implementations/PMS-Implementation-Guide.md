# PMS Service - Phase-wise Implementation Guide

## Document Information
- **Project**: WLAN Corporation - Product Management System (PMS)
- **Version**: 0.1.0
- **Date**: January 10, 2026
- **Prepared For**: WLAN Corporation, Bengaluru
- **Development Team**: Ramkumar, Wajeeth, Nadeem, Easwaran, Lakshmi

---

## 1. Overview

This document provides a comprehensive phase-wise implementation guide for developing the PMS (Product Management System) microservice. The implementation is structured into 6 phases spread over 3-4 weeks.

### Project Goals
- Build a production-ready Product Management System microservice
- Implement RESTful APIs with FastAPI (Python 3.12)
- Integrate with AUTH service for JWT authentication
- Support QR code and barcode generation
- Deploy using Docker containers
- Maintain comprehensive documentation

---

## 2. Technology Stack

### Core Technologies
- **Runtime**: Python 3.12
- **Framework**: FastAPI 0.109+
- **ASGI Server**: Uvicorn 0.27+
- **Database**: MongoDB 6.x
- **ODM**: Motor 3.3+ (async MongoDB driver)
- **Validation**: Pydantic 2.5+

### Additional Libraries
- **QR Code**: `qrcode` 7.4+, `Pillow` 10.2+
- **Barcode**: `python-barcode` 0.15+
- **Image Processing**: `Pillow` 10.2+
- **HTTP Client**: `httpx` 0.26+ (for AUTH service communication)
- **Environment**: `python-dotenv` 1.0+
- **Logging**: `logging` (Python standard library)
- **Rate Limiting**: `slowapi` 0.1.9+

### Development Tools
- **Docker**: Docker Engine 24+
- **Docker Compose**: v2+
- **Code Editor**: VS Code
- **API Testing**: Thunder Client / Postman
- **Version Control**: Git

---

## 3. Implementation Phases Overview

| Phase | Name | Duration | Dependencies | Status |
|-------|------|----------|--------------|--------|
| **1** | Foundation & Infrastructure | 1 week | None | 🔄 Pending |
| **2** | Category & Sub-Category Management | 3-4 days | Phase 1 | ⏳ Pending |
| **3** | Product Management - Core | 5-6 days | Phase 2 | ⏳ Pending |
| **4** | QR Code & Barcode Generation | 2-3 days | Phase 3 | ⏳ Pending |
| **5** | Advanced Features & Polish | 3-4 days | Phase 4 | ⏳ Pending |
| **6** | Documentation & Finalization | 2 days | Phase 5 | ⏳ Pending |

**Total Estimated Duration**: 3-4 weeks

---

## 4. Phase 1: Foundation & Infrastructure (1 week)

### 4.1 Objectives
- Set up project structure
- Configure development environment
- Implement core utilities (logging, error handling, JWT middleware)
- Set up MongoDB connection with GridFS
- Configure Docker environment
- Implement health check endpoints

### 4.2 Tasks Breakdown

#### Day 1-2: Project Setup & Structure
- [ ] Create project directory structure
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Create `requirements.txt` with all dependencies
- [ ] Create environment files (`.env.sample`, `.env`, `.env.docker`)
- [ ] Create `LICENSE` (MIT License)
- [ ] Create basic `README.md`
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `CHANGELOG.md` (version 0.1.0)

**Directory Structure**:
```
PMS/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── database.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── error_handler.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   └── product.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   └── product.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   └── product.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   ├── product.py
│   │   ├── qr_service.py
│   │   └── barcode_service.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   └── product.py
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       ├── exceptions.py
│       ├── responses.py
│       ├── auth_client.py
│       └── gridfs_handler.py
├── docs/
├── tests/
│   ├── __init__.py
│   └── test_health.py
├── logs/
├── .env.sample
├── .env
├── .env.docker
├── .gitignore
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

#### Day 3: Core Configuration & Utilities
- [ ] Implement `config/settings.py` (environment variables, settings management)
- [ ] Implement `config/database.py` (MongoDB connection, GridFS setup)
- [ ] Implement `utils/logger.py` (configurable logging - CONSOLE/FILE with daily rotation)
- [ ] Implement `utils/exceptions.py` (custom exception classes)
- [ ] Implement `utils/responses.py` (standardized response format)
- [ ] Test MongoDB connection
- [ ] Test GridFS functionality

**Environment Variables** (`.env.sample`):
```env
# Application
APP_NAME=PMS Service
APP_VERSION=0.1.0
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=5002
DEBUG=True

# Logging
LOG_LEVEL=INFO
LOG_TYPE=CONSOLE

# MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/pms_db?authSource=admin
MONGODB_DATABASE=pms_db
MONGODB_GRIDFS_BUCKET=pms_files

# AUTH Service
AUTH_SERVICE_URL=http://localhost:5001
AUTH_VERIFY_ENDPOINT=/api/v1/auth/verify

# Rate Limiting
RATE_LIMIT_ENABLED=False
RATE_LIMIT_PER_MINUTE=100

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# API Documentation
API_DOCS_URL=/docs
API_REDOC_URL=/redoc
```

#### Day 4: JWT Middleware & Error Handling
- [ ] Implement `utils/auth_client.py` (AUTH service integration)
- [ ] Implement `middleware/auth.py` (JWT token verification)
- [ ] Implement `middleware/error_handler.py` (global error handling)
- [ ] Implement `models/base.py` (base model with common fields)
- [ ] Implement `schemas/common.py` (common Pydantic schemas)
- [ ] Test JWT token validation with AUTH service
- [ ] Test error response format

**JWT Middleware Features**:
- Extract Bearer token from Authorization header
- Call AUTH service `GET /api/v1/auth/verify`
- Handle token expiration, invalid token, user not found
- Attach user info to request context (`request.state.user`)
- Implement permission checking decorator

**Error Response Structure**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "timestamp": "2026-01-10T10:30:00.123Z"
}
```

#### Day 5: Health Check & Docker Setup
- [ ] Implement `routes/health.py` (health check endpoints)
- [ ] Implement basic `app/main.py` (FastAPI application setup)
- [ ] Create `Dockerfile` (multi-stage build with Python 3.12 Alpine)
- [ ] Create `docker-compose.yml`
- [ ] Test health check endpoints locally
- [ ] Test Docker build
- [ ] Test Docker Compose startup

**Health Check Endpoints**:
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (MongoDB connection)
- `GET /health/live` - Liveness check

**Docker Configuration**:
- Multi-stage Dockerfile (build + production)
- Python 3.12 Alpine base image
- Non-root user
- Environment-based configuration
- Use `host.docker.internal` for AUTH service

### 4.3 Acceptance Criteria
- ✅ Project structure created and organized
- ✅ All configuration files present (`.env`, `.gitignore`, etc.)
- ✅ MongoDB connection successful
- ✅ GridFS bucket created and accessible
- ✅ Logging system works (CONSOLE and FILE modes)
- ✅ JWT middleware validates tokens with AUTH service
- ✅ Error handling returns standardized responses
- ✅ Health check endpoints return correct status
- ✅ Docker container builds and runs successfully
- ✅ Swagger documentation accessible at `/docs`

### 4.4 Testing Checklist
- [ ] MongoDB connection test
- [ ] GridFS file upload/download test
- [ ] JWT token validation test (valid token)
- [ ] JWT token validation test (invalid token)
- [ ] JWT token validation test (expired token)
- [ ] Health check endpoint test
- [ ] Error response format test
- [ ] Docker build test
- [ ] Docker Compose test

---

## 5. Phase 2: Category & Sub-Category Management (3-4 days)

### 5.1 Objectives
- Implement Category CRUD operations
- Implement Sub-Category CRUD operations
- Auto-generate category/sub-category codes
- Implement validations and business logic
- Soft delete functionality

### 5.2 Tasks Breakdown

#### Day 1: Category Model & Repository
- [ ] Implement `models/category.py` (MongoDB document model)
- [ ] Implement `schemas/category.py` (Pydantic request/response schemas)
- [ ] Implement `repositories/category.py` (database operations)
- [ ] Create MongoDB indexes for categories
- [ ] Test category repository methods

**Category Code Auto-Generation Logic**:
- Extract first 4 letters from category name (uppercase)
- Example: "Electronics" → "ELEC", "Networking" → "NETW"
- If duplicate, append numbers: "ELEC1", "ELEC2"

#### Day 2: Category Service & Routes
- [ ] Implement `services/category.py` (business logic)
- [ ] Implement `routes/category.py` (API endpoints)
- [ ] Test category endpoints (create, read, update, delete)
- [ ] Test duplicate category name/code validation
- [ ] Test soft delete functionality

**Category Endpoints**:
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories (with pagination, filters)
- `GET /api/v1/categories/{id}` - Get category by ID
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Soft delete category

#### Day 3: Sub-Category Model & Repository
- [ ] Implement `models/subcategory.py`
- [ ] Implement `schemas/subcategory.py`
- [ ] Implement `repositories/subcategory.py`
- [ ] Create MongoDB indexes for sub-categories
- [ ] Test sub-category repository methods

**Sub-Category Code Auto-Generation Logic**:
- Extract first 6 letters from sub-category name (uppercase)
- Example: "Routers" → "ROUTER", "Switches" → "SWITCH"
- If duplicate, append numbers: "ROUTER1", "ROUTER2"

#### Day 4: Sub-Category Service & Routes
- [ ] Implement `services/subcategory.py`
- [ ] Implement `routes/subcategory.py`
- [ ] Validate parent category exists and is active
- [ ] Test sub-category endpoints
- [ ] Test cascade validation (cannot delete category with sub-categories)

**Sub-Category Endpoints**:
- `POST /api/v1/subcategories` - Create sub-category
- `GET /api/v1/subcategories` - List sub-categories (with category filter)
- `GET /api/v1/subcategories/{id}` - Get sub-category by ID
- `PUT /api/v1/subcategories/{id}` - Update sub-category
- `DELETE /api/v1/subcategories/{id}` - Soft delete sub-category

### 5.3 Acceptance Criteria
- ✅ Category CRUD operations work correctly
- ✅ Sub-Category CRUD operations work correctly
- ✅ Category codes auto-generated from name
- ✅ Sub-Category codes auto-generated from name
- ✅ Duplicate name/code validation works
- ✅ Soft delete implemented (isDeleted flag)
- ✅ Cannot delete category with active sub-categories
- ✅ Pagination and filtering work
- ✅ JWT authentication required for all endpoints
- ✅ Swagger documentation updated

### 5.4 Testing Checklist
- [ ] Create category (valid data)
- [ ] Create category (duplicate name - should fail)
- [ ] Create category (invalid data - should fail)
- [ ] List categories (pagination works)
- [ ] Update category
- [ ] Soft delete category
- [ ] Try to delete category with sub-categories (should fail)
- [ ] Create sub-category (valid parent)
- [ ] Create sub-category (invalid parent - should fail)
- [ ] List sub-categories by category
- [ ] Update sub-category
- [ ] Soft delete sub-category

---

## 6. Phase 3: Product Management - Core (5-6 days)

### 6.1 Objectives
- Implement Product CRUD operations
- Auto-generate SKU with pattern: `CAT-SUBCAT-BRAND-SEQUENCE`
- Implement GridFS image upload
- Implement product validations
- Soft delete functionality

### 6.2 Tasks Breakdown

#### Day 1-2: Product Model & Schema
- [ ] Implement `models/product.py` (comprehensive product model)
- [ ] Implement `schemas/product.py` (request/response schemas)
- [ ] Implement specifications as JSON object
- [ ] Implement dimensions as nested object
- [ ] Create MongoDB indexes for products
- [ ] Test product model validation

**Product Fields**:
- Basic: name, SKU, brand, model, description
- Classification: categoryId, subCategoryId
- Pricing: price, unitOfMeasure
- Physical: weight, dimensions (length, width, height, unit)
- Technical: specifications (JSON), warrantyPeriod
- Media: productImage, qrCode, barcode
- Status: status (Active, Discontinued, Out of Stock, Coming Soon)
- Metadata: isActive, isDeleted, createdBy, updatedBy, timestamps

#### Day 2-3: SKU Generation Logic
- [ ] Implement SKU generator in `services/product.py`
- [ ] Extract category code (first 4 chars of category name)
- [ ] Extract sub-category code (first 6 chars)
- [ ] Extract brand code (first 6 chars, remove special chars)
- [ ] Generate sequence number (starting from 0001)
- [ ] Test SKU uniqueness validation

**SKU Generation Algorithm**:
```python
def generate_sku(category_name, subcategory_name, brand_name):
    cat_code = category_name[:4].upper()
    subcat_code = subcategory_name[:6].upper()
    brand_code = brand_name.replace('-', '').replace(' ', '')[:6].upper()
    
    # Find next sequence number for this brand in sub-category
    sequence = get_next_sequence(subcat_code, brand_code)
    
    sku = f"{cat_code}-{subcat_code}-{brand_code}-{sequence:04d}"
    return sku
```

**Example SKUs**:
- `ELEC-ROUTER-CISCO-0001`
- `ELEC-ROUTER-TPLINK-0001`
- `ELEC-ROUTER-CISCO-0002`
- `NETW-SWITCH-CISCO-0001`

#### Day 3-4: GridFS Image Upload
- [ ] Implement `utils/gridfs_handler.py` (GridFS operations)
- [ ] Implement image upload validation (size, format)
- [ ] Implement image storage in GridFS
- [ ] Implement image retrieval endpoint
- [ ] Implement image deletion
- [ ] Test image upload/download

**Image Upload Features**:
- Max size: 5MB
- Allowed formats: JPEG, PNG, WEBP
- Store in GridFS bucket: `pms_files`
- Metadata: {type: 'product_image', product_id, sku, uploaded_at}
- Return GridFS file ID as image reference

#### Day 4-5: Product Repository & Service
- [ ] Implement `repositories/product.py`
- [ ] Implement `services/product.py` (business logic)
- [ ] Validate category and sub-category exist
- [ ] Validate category-subcategory relationship
- [ ] Implement search and filtering logic
- [ ] Test product creation with all validations

#### Day 5-6: Product Routes & Testing
- [ ] Implement `routes/product.py`
- [ ] Implement all CRUD endpoints
- [ ] Implement image upload endpoint
- [ ] Implement image download endpoint
- [ ] Test all product endpoints
- [ ] Test complex filtering

**Product Endpoints**:
- `POST /api/v1/products` - Create product (with image upload)
- `GET /api/v1/products` - List products (pagination, filters, search)
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/sku/{sku}` - Get product by SKU
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Soft delete product
- `POST /api/v1/products/{id}/image` - Upload product image
- `GET /api/v1/products/{id}/image` - Download product image
- `DELETE /api/v1/products/{id}/image` - Delete product image

### 6.3 Acceptance Criteria
- ✅ Product CRUD operations work
- ✅ SKU auto-generated with correct pattern
- ✅ SKU is unique across all products
- ✅ Image upload to GridFS works (max 5MB, JPEG/PNG/WEBP)
- ✅ Image download from GridFS works
- ✅ Category and sub-category validation works
- ✅ Product search and filtering works
- ✅ Soft delete implemented
- ✅ Specifications stored as JSON object
- ✅ Dimensions stored as nested object

### 6.4 Testing Checklist
- [ ] Create product with valid category/sub-category
- [ ] Create product with invalid category (should fail)
- [ ] Create product with mismatched category-subcategory (should fail)
- [ ] Verify SKU auto-generation
- [ ] Create multiple products, verify SKU sequence
- [ ] Upload product image (valid)
- [ ] Upload product image (> 5MB - should fail)
- [ ] Upload product image (invalid format - should fail)
- [ ] Download product image
- [ ] Update product
- [ ] Search products by name
- [ ] Filter products by category
- [ ] Filter products by brand
- [ ] Soft delete product

---

## 7. Phase 4: QR Code & Barcode Generation (2-3 days)

### 7.1 Objectives
- Implement QR code generation
- Implement barcode (Code128) generation
- Store QR codes and barcodes in GridFS
- Implement download endpoints
- Integrate with product creation workflow

### 7.2 Tasks Breakdown

#### Day 1: QR Code Service
- [ ] Implement `services/qr_service.py`
- [ ] Install dependencies: `qrcode`, `Pillow`
- [ ] Implement QR code generation logic
- [ ] Store QR code in GridFS
- [ ] Test QR code generation

**QR Code Data Structure**:
```json
{
  "productId": "6789abcd1234567890123456",
  "sku": "ELEC-ROUTER-CISCO-0001",
  "name": "Cisco Router 2900 Series",
  "brand": "Cisco",
  "model": "2900",
  "price": 45000.00
}
```

**QR Code Specifications**:
- Format: PNG
- Size: 300x300 pixels (HD quality)
- Error correction: High (30%)
- Border: 4 boxes
- Filename: `qr_{sku}.png`
- GridFS metadata: {type: 'qr_code', product_id, sku}

#### Day 2: Barcode Service
- [ ] Implement `services/barcode_service.py`
- [ ] Install dependency: `python-barcode`
- [ ] Implement Code128 barcode generation
- [ ] Store barcode in GridFS
- [ ] Test barcode generation

**Barcode Specifications**:
- Format: Code128
- Input: SKU (e.g., "ELEC-ROUTER-CISCO-0001")
- Output: PNG image
- Size: 400x200 pixels
- Filename: `barcode_{sku}.png`
- GridFS metadata: {type: 'barcode', product_id, sku}

#### Day 2-3: Integration & Endpoints
- [ ] Integrate QR/Barcode generation in product creation
- [ ] Auto-generate QR and barcode on product creation
- [ ] Implement download endpoints
- [ ] Implement regeneration endpoints
- [ ] Test end-to-end flow

**Additional Endpoints**:
- `GET /api/v1/products/{id}/qrcode` - Download QR code
- `GET /api/v1/products/{id}/barcode` - Download barcode
- `POST /api/v1/products/{id}/qrcode/regenerate` - Regenerate QR code
- `POST /api/v1/products/{id}/barcode/regenerate` - Regenerate barcode

### 7.3 Acceptance Criteria
- ✅ QR code generated automatically on product creation
- ✅ Barcode generated automatically on product creation
- ✅ QR code contains product details (JSON format)
- ✅ Barcode encodes SKU (Code128 format)
- ✅ Both stored in GridFS with metadata
- ✅ Download endpoints work (return PNG images)
- ✅ Regeneration endpoints work
- ✅ Filenames follow pattern: `qr_{sku}.png`, `barcode_{sku}.png`
- ✅ HD resolution (300x300 for QR, 400x200 for barcode)

### 7.4 Testing Checklist
- [ ] Create product - verify QR/barcode auto-generated
- [ ] Download QR code - verify PNG format
- [ ] Download barcode - verify Code128 format
- [ ] Scan QR code - verify data correctness
- [ ] Scan barcode - verify SKU correctness
- [ ] Regenerate QR code - verify old one replaced
- [ ] Regenerate barcode - verify old one replaced
- [ ] Update product price - regenerate QR to reflect new price

---

## 8. Phase 5: Advanced Features & Polish (3-4 days)

### 8.1 Objectives
- Implement rate limiting (configurable)
- Enhance search and filtering
- Implement comprehensive pagination
- Complete Swagger/OpenAPI documentation
- Add permission-based access control
- Performance optimization

### 8.2 Tasks Breakdown

#### Day 1: Rate Limiting
- [ ] Implement rate limiting middleware using `slowapi`
- [ ] Make it configurable via `.env` (enabled/disabled)
- [ ] Set limit: 100 requests/minute per IP
- [ ] Test rate limiting
- [ ] Add rate limit headers to responses

**Rate Limit Configuration**:
```env
RATE_LIMIT_ENABLED=False
RATE_LIMIT_PER_MINUTE=100
```

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1736512800
```

#### Day 2: Advanced Search & Filtering
- [ ] Implement text search across product name, brand, model
- [ ] Implement multi-field filtering (category, subcategory, brand, status)
- [ ] Implement sorting (price, name, createdAt)
- [ ] Implement pagination improvements
- [ ] Test complex query combinations

**Query Parameters**:
- `?page=1&limit=20` - Pagination
- `?search=cisco router` - Text search
- `?categoryId=xxx` - Filter by category
- `?subCategoryId=xxx` - Filter by sub-category
- `?brand=Cisco` - Filter by brand
- `?status=Active` - Filter by status
- `?minPrice=1000&maxPrice=50000` - Price range
- `?sortBy=price&sortOrder=asc` - Sorting

#### Day 3: Swagger Documentation & Permissions
- [ ] Complete OpenAPI schema for all endpoints
- [ ] Add detailed descriptions and examples
- [ ] Add request/response examples
- [ ] Implement permission checking (PRODUCTS_CREATE, PRODUCTS_UPDATE, etc.)
- [ ] Document permission requirements
- [ ] Test Swagger UI

**Permissions**:
- `PRODUCTS_CREATE` - Create products
- `PRODUCTS_READ` - View products
- `PRODUCTS_UPDATE` - Update products
- `PRODUCTS_DELETE` - Delete products
- `CATEGORIES_MANAGE` - Manage categories
- `SUBCATEGORIES_MANAGE` - Manage sub-categories

#### Day 4: Performance & Validation
- [ ] Add database indexes for frequently queried fields
- [ ] Optimize GridFS queries
- [ ] Add input validation for all endpoints
- [ ] Add comprehensive error messages
- [ ] Performance testing
- [ ] Load testing (optional)

### 8.3 Acceptance Criteria
- ✅ Rate limiting works when enabled
- ✅ Can be disabled via environment variable
- ✅ Advanced search returns relevant results
- ✅ Multi-field filtering works correctly
- ✅ Pagination handles edge cases
- ✅ Swagger documentation complete and accurate
- ✅ Permission-based access control works
- ✅ Performance optimized with indexes
- ✅ All inputs validated properly

### 8.4 Testing Checklist
- [ ] Enable rate limiting - exceed limit - verify 429 error
- [ ] Disable rate limiting - verify no limit
- [ ] Search for "cisco" - verify results
- [ ] Filter by category + brand - verify results
- [ ] Sort by price ascending - verify order
- [ ] Test pagination edge cases (page 0, page > total)
- [ ] Test permission checking (user without PRODUCTS_CREATE)
- [ ] Verify Swagger UI loads
- [ ] Verify all endpoints documented in Swagger

---

## 9. Phase 6: Documentation & Finalization (2 days)

### 9.1 Objectives
- Complete README.md
- Finalize CONTRIBUTING.md
- Update CHANGELOG.md
- Create deployment guide
- Final testing
- Create backup and rollback procedures

### 9.2 Tasks Breakdown

#### Day 1: Documentation
- [ ] Write comprehensive README.md
  - Project overview
  - Features list
  - Prerequisites
  - Installation instructions
  - Environment variables
  - Running locally
  - Running with Docker
  - API documentation link
  - Team information
- [ ] Finalize CONTRIBUTING.md
  - Code style guide
  - Git workflow
  - Pull request process
  - Testing requirements
- [ ] Update CHANGELOG.md for version 0.1.0
  - Initial release notes
  - Features implemented
  - Known limitations

#### Day 2: Final Testing & Deployment
- [ ] End-to-end testing
- [ ] Test Docker deployment
- [ ] Test AUTH service integration
- [ ] Create deployment checklist
- [ ] Create monitoring guide
- [ ] Final code review
- [ ] Tag release v0.1.0

### 9.3 Deliverables
- ✅ Complete README.md with setup instructions
- ✅ CONTRIBUTING.md for team collaboration
- ✅ CHANGELOG.md with version 0.1.0 details
- ✅ All code properly commented
- ✅ Swagger documentation complete
- ✅ Docker setup tested and working
- ✅ Git repository organized with proper commits
- ✅ Version 0.1.0 tagged and released

### 9.4 Final Testing Checklist
- [ ] Health check endpoints work
- [ ] JWT authentication works
- [ ] Category CRUD works
- [ ] Sub-category CRUD works
- [ ] Product CRUD works
- [ ] SKU generation works
- [ ] Image upload/download works
- [ ] QR code generation/download works
- [ ] Barcode generation/download works
- [ ] Rate limiting works (when enabled)
- [ ] Search and filtering work
- [ ] Pagination works
- [ ] Soft delete works
- [ ] Error responses standardized
- [ ] Logging works (CONSOLE and FILE modes)
- [ ] Docker container runs
- [ ] Docker Compose starts all services
- [ ] AUTH service integration works

---

## 10. Development Guidelines

### 10.1 Code Style
- Follow PEP 8 guidelines
- Use type hints for all functions
- Write docstrings for all classes and functions
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names

### 10.2 Git Workflow
- Create feature branches: `feature/category-management`
- Commit messages format: `feat: add category creation endpoint`
- Commit types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Create pull requests for review
- Squash commits before merging

### 10.3 Error Handling
- Use custom exceptions defined in `utils/exceptions.py`
- Always return standardized error responses
- Log all errors with appropriate level
- Include error details for debugging (in development)
- Hide sensitive info in production

### 10.4 Security Best Practices
- Never commit `.env` file
- Validate all user inputs
- Use parameterized queries (Motor handles this)
- Sanitize file uploads
- Implement rate limiting in production
- Use HTTPS in production
- Keep dependencies updated

---

## 11. Testing Strategy

### 11.1 Manual Testing
- Test each endpoint after implementation
- Use Thunder Client / Postman for API testing
- Test error scenarios
- Test edge cases
- Document test cases

### 11.2 Integration Testing
- Test AUTH service integration
- Test MongoDB connection
- Test GridFS operations
- Test end-to-end workflows

### 11.3 Load Testing (Optional)
- Use tools like `locust` or `k6`
- Test concurrent requests
- Identify bottlenecks
- Optimize performance

---

## 12. Deployment Checklist

### 12.1 Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] MongoDB accessible
- [ ] AUTH service accessible
- [ ] Docker images built
- [ ] Documentation complete

### 12.2 Deployment Steps
- [ ] Build Docker image
- [ ] Tag image with version
- [ ] Run docker-compose
- [ ] Verify health checks
- [ ] Test critical endpoints
- [ ] Monitor logs
- [ ] Set up log rotation

### 12.3 Post-Deployment
- [ ] Monitor error logs
- [ ] Check API performance
- [ ] Verify AUTH integration
- [ ] Test from frontend (when available)
- [ ] Document any issues
- [ ] Create backup plan

---

## 13. Known Limitations & Future Enhancements

### 13.1 Current Limitations (v0.1.0)
- No caching layer (Redis)
- No unit tests
- No bulk import functionality
- No product audit trail
- No analytics/reporting
- No real-time notifications
- No data export functionality

### 13.2 Future Enhancements (Post v0.1.0)
- **Phase 7**: Caching with Redis
- **Phase 8**: Unit and integration tests
- **Phase 9**: Bulk product import (CSV/Excel)
- **Phase 10**: Product audit trail
- **Phase 11**: Analytics dashboard
- **Phase 12**: Real-time inventory updates
- **Phase 13**: Data export (PDF, Excel)
- **Phase 14**: Advanced reporting

---

## 14. Team & Responsibilities

| Team Member | Role | Primary Responsibilities |
|-------------|------|-------------------------|
| Ramkumar | Tech Lead | Architecture, Code Review, Deployment |
| Wajeeth | Backend Developer | Product Management, QR/Barcode |
| Nadeem | Backend Developer | Category/Sub-category, GridFS |
| Easwaran | Backend Developer | Authentication, Middleware, Utils |
| Lakshmi | Backend Developer | Documentation, Testing, Docker |

---

## 15. Support & Communication

### 15.1 Daily Standup (Recommended)
- What did you complete yesterday?
- What will you work on today?
- Any blockers or challenges?

### 15.2 Code Reviews
- All PRs require at least 1 approval
- Use meaningful PR descriptions
- Link to related issues
- Test before requesting review

### 15.3 Issue Tracking
- Create GitHub issues for bugs
- Use labels: `bug`, `enhancement`, `documentation`
- Assign to team members
- Track progress

---

## 16. Success Metrics

### 16.1 Phase Completion Metrics
- All planned features implemented
- All acceptance criteria met
- All tests passing
- Documentation complete
- Code reviewed and approved

### 16.2 Quality Metrics
- API response time < 200ms (average)
- Error rate < 1%
- Code coverage > 80% (when tests added)
- Zero critical security vulnerabilities
- All endpoints documented

---

## 17. Timeline Summary

```
Week 1: Phase 1 (Foundation)
├── Day 1-2: Project Setup
├── Day 3: Configuration & Utilities
├── Day 4: JWT & Error Handling
└── Day 5: Health Check & Docker

Week 2: Phase 2-3 (Categories & Products Core)
├── Day 1-2: Category Management
├── Day 3-4: Sub-Category Management
└── Day 5: Product Model & SKU

Week 3: Phase 4-5 (Products Complete & Advanced)
├── Day 1-2: Product CRUD & Images
├── Day 3: QR & Barcode Generation
├── Day 4: Rate Limiting
└── Day 5: Search & Filtering

Week 4: Phase 6 (Finalization)
├── Day 1: Documentation
├── Day 2: Testing
└── Day 3: Deployment & Release
```

---

## Document End

**Version**: 1.0.0  
**Created**: January 10, 2026  
**Last Updated**: January 10, 2026  
**Next Review**: After Phase 1 completion  
**Status**: 🔄 Ready for Implementation
