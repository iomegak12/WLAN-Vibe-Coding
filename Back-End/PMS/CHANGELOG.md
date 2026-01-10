# Changelog

All notable changes to the PMS (Product Management System) service will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Caching layer with Redis
- Unit and integration tests
- Bulk product import (CSV/Excel)
- Product audit trail
- Analytics and reporting
- Real-time notifications
- Advanced search with Elasticsearch

---

## [0.1.0] - 2026-01-10

### Initial Release

This is the first release of the PMS Service, implementing core product management functionality.

### Added

#### Foundation & Infrastructure
- FastAPI application setup with Python 3.12
- MongoDB integration with Motor (async driver)
- MongoDB GridFS for file storage (images, QR codes, barcodes)
- JWT authentication integration with AUTH service
- Configurable logging system (CONSOLE and FILE modes with daily rotation)
- Standardized error handling and response format
- Health check endpoints (`/health`, `/health/ready`, `/health/live`)
- Docker support with multi-stage Dockerfile (Python 3.12 Alpine)
- Docker Compose configuration
- Environment-based configuration (.env support)
- Rate limiting support (configurable, disabled by default)
- CORS configuration
- OpenAPI/Swagger documentation at `/docs`
- ReDoc documentation at `/redoc`

#### Category Management
- Create, Read, Update, Delete (CRUD) operations for categories
- Auto-generation of category codes from category names
- Category code uniqueness validation
- Soft delete functionality (isDeleted flag)
- Prevent deletion of categories with active sub-categories
- Pagination and filtering support
- Active/inactive status management

#### Sub-Category Management
- CRUD operations for sub-categories
- Parent category relationship management
- Auto-generation of sub-category codes
- Sub-category code uniqueness validation
- Soft delete functionality
- Prevent deletion of sub-categories with active products
- Filter sub-categories by parent category
- Pagination and filtering support

#### Product Management
- CRUD operations for products
- Automatic SKU generation with pattern: `CAT-SUBCAT-BRAND-SEQUENCE`
- SKU uniqueness validation
- Product image upload to GridFS (max 5MB, JPEG/PNG/WEBP)
- Image download and retrieval from GridFS
- Product specifications as JSON object
- Product dimensions as nested object
- Weight and unit of measure support
- Product status management (Active, Discontinued, Out of Stock, Coming Soon)
- Warranty period tracking
- Brand and model information
- Soft delete functionality
- Search and filtering capabilities
- Pagination support

#### QR Code & Barcode Generation
- Automatic QR code generation on product creation
- QR code data includes: product ID, SKU, name, brand, model, price
- QR codes stored in GridFS with metadata
- High-quality QR codes (300x300 pixels)
- Code128 barcode generation
- Barcodes encode product SKU
- Barcodes stored in GridFS (400x200 pixels)
- Download endpoints for QR codes and barcodes
- Regeneration endpoints for QR codes and barcodes
- Standardized naming: `qr_{sku}.png`, `barcode_{sku}.png`

#### API Endpoints

**Health Checks:**
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (DB connection)
- `GET /health/live` - Liveness check

**Categories:**
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories (paginated, filterable)
- `GET /api/v1/categories/{id}` - Get category by ID
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Soft delete category

**Sub-Categories:**
- `POST /api/v1/subcategories` - Create sub-category
- `GET /api/v1/subcategories` - List sub-categories (paginated, filterable)
- `GET /api/v1/subcategories/{id}` - Get sub-category by ID
- `PUT /api/v1/subcategories/{id}` - Update sub-category
- `DELETE /api/v1/subcategories/{id}` - Soft delete sub-category

**Products:**
- `POST /api/v1/products` - Create product with image upload
- `GET /api/v1/products` - List products (paginated, searchable, filterable)
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/sku/{sku}` - Get product by SKU
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Soft delete product
- `POST /api/v1/products/{id}/image` - Upload product image
- `GET /api/v1/products/{id}/image` - Download product image
- `DELETE /api/v1/products/{id}/image` - Delete product image
- `GET /api/v1/products/{id}/qrcode` - Download QR code
- `GET /api/v1/products/{id}/barcode` - Download barcode
- `POST /api/v1/products/{id}/qrcode/regenerate` - Regenerate QR code
- `POST /api/v1/products/{id}/barcode/regenerate` - Regenerate barcode

#### Database
- MongoDB collections: `categories`, `subcategories`, `products`
- Automatic collection creation on startup
- Comprehensive indexes for performance:
  - Unique indexes on codes and names
  - Compound indexes for filtering
  - Text indexes for search
- GridFS bucket: `pms_files` for file storage
- Bootstrap script for database initialization

#### Seed Data
- Configurable seed data loading via `LOAD_SEED_DATA` environment variable
- Sample categories, sub-categories, and products
- Seed data script checks for existing data before insertion
- Idempotent seed data execution

#### Security
- JWT token validation for all protected endpoints
- Permission-based access control
- Input validation using Pydantic models
- File upload validation (size, format)
- SQL injection prevention (MongoDB parameterized queries)
- Rate limiting support (configurable)

#### Documentation
- Comprehensive README.md with setup instructions
- CONTRIBUTING.md with development guidelines
- API documentation via Swagger UI
- Code comments and docstrings
- MIT License
- Environment variable documentation

#### Development Tools
- .gitignore for Python and Docker
- .env.sample with all configuration options
- requirements.txt with pinned dependencies
- Docker multi-stage build for optimization
- docker-compose.yml for local development

### Technical Details

**Technology Stack:**
- Python 3.12
- FastAPI 0.109.0
- Motor 3.3.2 (Async MongoDB)
- Pydantic 2.5.3
- Uvicorn 0.27.0
- Pillow 10.2.0
- qrcode 7.4.2
- python-barcode 0.15.1
- httpx 0.26.0
- slowapi 0.1.9

**Database:**
- MongoDB 6.x
- GridFS for file storage
- Optimized indexes

**Deployment:**
- Docker support
- Docker Compose
- Environment-based configuration
- Health checks for monitoring

### Development Team
- Ramkumar (Tech Lead)
- Wajeeth (Backend Developer)
- Nadeem (Backend Developer)
- Easwaran (Backend Developer)
- Lakshmi (Backend Developer)

### Known Limitations
- No caching layer (Redis) - planned for future release
- No unit tests - planned for future release
- No bulk import functionality - planned for future release
- No product audit trail - planned for future release
- No analytics/reporting - planned for future release
- No real-time notifications - planned for future release

### Breaking Changes
- None (initial release)

### Security
- All endpoints require JWT authentication (except health checks)
- File upload size limited to 5MB
- Only JPEG, PNG, WEBP image formats allowed
- Input validation on all endpoints

---

## Version History

- **0.1.0** (2026-01-10) - Initial release with core functionality

---

**Note:** For detailed API documentation, visit `/docs` when the service is running.

**Repository:** WLAN Corporation - Product Management System  
**Maintainers:** PMS Development Team  
**License:** MIT
