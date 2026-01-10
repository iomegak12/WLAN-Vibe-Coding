# PMS Service - Product Management System

**Version:** 0.1.0  
**Last Updated:** January 10, 2026  
**Developed By:** WLAN Corporation Development Team

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Team](#development-team)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **Product Management System (PMS)** is a microservice built with Python and FastAPI that manages the complete product catalog for WLAN Corporation's warehouse and inventory management system. It handles categories, sub-categories, products, SKU generation, and QR code/barcode generation.

### Key Capabilities

- 📦 Product catalog management with hierarchical categories
- 🏷️ Automatic SKU generation with customizable patterns
- 📷 Product image management using MongoDB GridFS
- 🔲 QR code and Code128 barcode generation
- 🔐 JWT-based authentication integration
- 🚀 High-performance async operations with Motor
- 📊 Comprehensive API documentation with Swagger
- 🐳 Docker support for easy deployment

---

## ✨ Features

### Category Management
- Create, read, update, and soft delete categories
- Auto-generate category codes from names
- Hierarchical organization support
- Prevent deletion of categories with sub-categories

### Sub-Category Management
- Manage sub-categories under parent categories
- Auto-generate sub-category codes
- Validate parent-child relationships
- Prevent deletion of sub-categories with products

### Product Management
- Complete CRUD operations for products
- Automatic SKU generation: `CAT-SUBCAT-BRAND-SEQUENCE`
- Product specifications as JSON objects
- Physical dimensions and weight tracking
- Product status management (Active, Discontinued, etc.)
- Warranty period tracking
- Soft delete functionality

### Image Management
- Upload product images (max 5MB)
- Supported formats: JPEG, PNG, WEBP
- Store images in MongoDB GridFS
- Download and delete images via API

### QR Code & Barcode Generation
- Auto-generate QR codes on product creation
- QR codes contain: ID, SKU, name, brand, model, price
- Code128 barcode generation from SKU
- High-resolution output (300x300 for QR, 400x200 for barcode)
- Download and regenerate QR codes/barcodes

### Security & Authentication
- JWT token validation via AUTH service
- Permission-based access control
- Input validation with Pydantic
- Rate limiting support (configurable)

### API Features
- RESTful API design
- Pagination and filtering
- Search functionality
- Standardized error responses
- OpenAPI/Swagger documentation
- Health check endpoints

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Python | 3.12+ |
| **Framework** | FastAPI | 0.109.0 |
| **ASGI Server** | Uvicorn | 0.27.0 |
| **Database** | MongoDB | 6.x |
| **ODM** | Motor | 3.3.2 |
| **Validation** | Pydantic | 2.5.3 |
| **HTTP Client** | HTTPX | 0.26.0 |
| **QR Codes** | qrcode | 7.4.2 |
| **Barcodes** | python-barcode | 0.15.1 |
| **Image Processing** | Pillow | 10.2.0 |
| **Rate Limiting** | slowapi | 0.1.9 |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.12+** - [Download](https://www.python.org/downloads/)
- **MongoDB 6.x** - Running in Docker or locally
- **Git** - For version control
- **VS Code** (recommended) - Code editor

### Additional Requirements

- **AUTH Service** - Must be running on port 5001 for JWT validation
- **Docker** (optional) - For containerized deployment
- **Docker Compose** (optional) - For orchestration

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PMS
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv env
.\env\Scripts\activate

# Linux/Mac
python3 -m venv env
source env/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

```bash
# Copy sample environment file
cp .env.sample .env

# Edit .env with your configuration
# Use your favorite text editor
```

### 5. Verify MongoDB Connection

Ensure MongoDB is running and accessible:

```bash
# Test connection (update URI as needed)
mongosh "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin"
```

---

## ⚙️ Configuration

### Environment Variables

Edit `.env` file with your configuration:

```env
# Application
APP_NAME=PMS Service
APP_VERSION=0.1.0
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=5002
DEBUG=True

# Logging
LOG_LEVEL=INFO          # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_TYPE=CONSOLE        # CONSOLE or FILE

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

# Seed Data
LOAD_SEED_DATA=False    # Set to True to load sample data on startup
```

### Logging Configuration

**LOG_TYPE Options:**
- `CONSOLE` - Logs to console/terminal (default)
- `FILE` - Logs to files in `logs/` directory with daily rotation

**LOG_LEVEL Options:**
- `DEBUG` - Detailed information for debugging
- `INFO` - General informational messages (default)
- `WARNING` - Warning messages
- `ERROR` - Error messages
- `CRITICAL` - Critical issues

---

## 🏃 Running the Application

### Local Development

```bash
# Make sure virtual environment is activated
# Windows: .\env\Scripts\activate
# Linux/Mac: source env/bin/activate

# Run with Uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 5002
```

**Application will be available at:**
- API: http://localhost:5002
- Swagger Docs: http://localhost:5002/docs
- ReDoc: http://localhost:5002/redoc

### Docker Deployment

#### Build Docker Image

```bash
docker build -t pms-service:0.1.0 .
```

#### Run with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f pms

# Stop services
docker-compose down
```

#### Run Single Container

```bash
docker run -d \
  --name pms-service \
  -p 5002:5002 \
  --env-file .env.docker \
  pms-service:0.1.0
```

---

## 📚 API Documentation

### Interactive Documentation

Once the application is running, access:

- **Swagger UI**: http://localhost:5002/docs
- **ReDoc**: http://localhost:5002/redoc
- **OpenAPI JSON**: http://localhost:5002/openapi.json

### Quick API Reference

#### Health Checks

```http
GET /health              - Basic health check
GET /health/ready        - Readiness check (DB connection)
GET /health/live         - Liveness check
```

#### Categories

```http
POST   /api/v1/categories          - Create category
GET    /api/v1/categories          - List categories
GET    /api/v1/categories/{id}     - Get category
PUT    /api/v1/categories/{id}     - Update category
DELETE /api/v1/categories/{id}     - Delete category (soft)
```

#### Sub-Categories

```http
POST   /api/v1/subcategories       - Create sub-category
GET    /api/v1/subcategories       - List sub-categories
GET    /api/v1/subcategories/{id}  - Get sub-category
PUT    /api/v1/subcategories/{id}  - Update sub-category
DELETE /api/v1/subcategories/{id}  - Delete sub-category (soft)
```

#### Products

```http
POST   /api/v1/products                    - Create product
GET    /api/v1/products                    - List products
GET    /api/v1/products/{id}               - Get product
GET    /api/v1/products/sku/{sku}          - Get by SKU
PUT    /api/v1/products/{id}               - Update product
DELETE /api/v1/products/{id}               - Delete product (soft)
POST   /api/v1/products/{id}/image         - Upload image
GET    /api/v1/products/{id}/image         - Download image
GET    /api/v1/products/{id}/qrcode        - Download QR code
GET    /api/v1/products/{id}/barcode       - Download barcode
POST   /api/v1/products/{id}/qrcode/regenerate  - Regenerate QR
POST   /api/v1/products/{id}/barcode/regenerate - Regenerate barcode
```

### Authentication

All endpoints (except health checks) require JWT authentication:

```http
Authorization: Bearer <your_access_token>
```

Get access token from AUTH service:
```bash
POST http://localhost:5001/api/v1/auth/login
```

---

## 📁 Project Structure

```
PMS/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py              # Environment configuration
│   │   └── database.py              # MongoDB connection
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py                  # JWT authentication middleware
│   │   └── error_handler.py         # Global error handling
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                  # Base model with common fields
│   │   ├── category.py              # Category model
│   │   ├── subcategory.py           # Sub-category model
│   │   └── product.py               # Product model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py                # Common Pydantic schemas
│   │   ├── category.py              # Category schemas
│   │   ├── subcategory.py           # Sub-category schemas
│   │   └── product.py               # Product schemas
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py                  # Base repository
│   │   ├── category.py              # Category database operations
│   │   ├── subcategory.py           # Sub-category operations
│   │   └── product.py               # Product operations
│   ├── services/
│   │   ├── __init__.py
│   │   ├── category.py              # Category business logic
│   │   ├── subcategory.py           # Sub-category business logic
│   │   ├── product.py               # Product business logic
│   │   ├── qr_service.py            # QR code generation
│   │   └── barcode_service.py       # Barcode generation
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py                # Health check endpoints
│   │   ├── category.py              # Category routes
│   │   ├── subcategory.py           # Sub-category routes
│   │   └── product.py               # Product routes
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py                # Logging utility
│   │   ├── exceptions.py            # Custom exceptions
│   │   ├── responses.py             # Response formatting
│   │   ├── auth_client.py           # AUTH service client
│   │   └── gridfs_handler.py        # GridFS file operations
│   └── scripts/
│       ├── __init__.py
│       ├── bootstrap.py             # Database initialization
│       └── seed_data.py             # Sample data loader
├── docs/                             # Documentation
├── tests/                            # Test files
├── logs/                             # Log files (when LOG_TYPE=FILE)
├── .env                              # Environment variables (not in git)
├── .env.sample                       # Sample environment file
├── .env.docker                       # Docker environment (not in git)
├── .gitignore                        # Git ignore rules
├── requirements.txt                  # Python dependencies
├── Dockerfile                        # Docker image definition
├── docker-compose.yml                # Docker Compose configuration
├── README.md                         # This file
├── CONTRIBUTING.md                   # Contribution guidelines
├── CHANGELOG.md                      # Version history
└── LICENSE                           # MIT License
```

---

## 👥 Development Team

| Name | Role |
|------|------|
| **Ramkumar** | Tech Lead |
| **Wajeeth** | Backend Developer |
| **Nadeem** | Backend Developer |
| **Easwaran** | Backend Developer |
| **Lakshmi** | Backend Developer |

---

## 🤝 Contributing

We welcome contributions from the team! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development process and coding standards.

### Quick Start for Contributors

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "feat: your feature description"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 WLAN Corporation - PMS Development Team
```

---

## 📞 Support

For questions or issues:

- **Technical Lead**: Ramkumar
- **Documentation**: See `/docs` folder
- **API Issues**: Check Swagger docs at `/docs`
- **Bug Reports**: Create an issue in the repository

---

## 🔗 Related Services

- **AUTH Service** (Port 5001) - Authentication & Authorization
- **SMS Service** (Port 5003) - Supplier Management (Planned)
- **WMS Service** (Port 5004) - Warehouse Management (Planned)
- **IMS Service** (Port 5005) - Inventory Management (Planned)

---

## 📊 Version Information

**Current Version**: 0.1.0  
**Release Date**: January 10, 2026  
**Status**: ✅ Production Ready

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Built with ❤️ by WLAN Corporation Development Team**
