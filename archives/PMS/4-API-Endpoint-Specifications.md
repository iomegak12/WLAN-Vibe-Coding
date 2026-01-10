# PMS Service - API Endpoint Specifications

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Product Management System (PMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document provides comprehensive API endpoint specifications for the Product Management System (PMS) service. All endpoints follow RESTful principles and are versioned under `/api/v1/`.

### Base URL
```
Development: http://localhost:5002
Production: https://pms.wlancorp.com
```

### API Version
```
/api/v1/
```

---

## 2. Authentication

All PMS endpoints require JWT authentication obtained from the AUTH service.

### Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Validation
- PMS validates JWT tokens by calling AUTH service
- Invalid/expired tokens return 401 Unauthorized
- Missing tokens return 401 Unauthorized

---

## 3. Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data object or array
  },
  "message": "Operation successful",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Data retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 4. Category Endpoints

### 4.1 Create Category

**Endpoint**: `POST /api/v1/categories`

**Description**: Create a new product category

**Authorization**: Product Manager, Super Admin

**Request Body**:
```json
{
  "name": "Electronics",
  "code": "ELEC",
  "description": "Electronic devices and accessories",
  "isActive": true
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters, unique
- `code`: Required, 2-10 characters, uppercase, unique, alphanumeric
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean, defaults to true

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics",
    "code": "ELEC",
    "description": "Electronic devices and accessories",
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Category created successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "Category name is required",
      "code": "Category code must be uppercase"
    }
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 409 Conflict - Duplicate
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CATEGORY",
    "message": "Category with this name or code already exists"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.2 Get All Categories

**Endpoint**: `GET /api/v1/categories`

**Description**: Retrieve list of all categories with pagination and filters

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for name or code
- `isActive`: Filter by active status (true/false)
- `sortBy`: Sort field (name, code, createdAt) (default: name)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/categories?page=1&limit=10&isActive=true&search=elec&sortBy=name&sortOrder=asc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123456",
        "name": "Electronics",
        "code": "ELEC",
        "description": "Electronic devices and accessories",
        "isActive": true,
        "createdBy": "6789abcd1234567890123450",
        "createdAt": "2026-01-07T10:30:00Z",
        "updatedAt": "2026-01-07T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Categories retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.3 Get Category by ID

**Endpoint**: `GET /api/v1/categories/:id`

**Description**: Retrieve a specific category by ID

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Category ID (MongoDB ObjectId)

**Example Request**:
```
GET /api/v1/categories/6789abcd1234567890123456
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics",
    "code": "ELEC",
    "description": "Electronic devices and accessories",
    "isActive": true,
    "subCategoriesCount": 5,
    "productsCount": 120,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Category retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category not found"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.4 Update Category

**Endpoint**: `PUT /api/v1/categories/:id`

**Description**: Update an existing category

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Category ID

**Request Body**:
```json
{
  "name": "Electronics & Gadgets",
  "description": "Electronic devices, gadgets and accessories",
  "isActive": true
}
```

**Note**: `code` cannot be updated once created

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics & Gadgets",
    "code": "ELEC",
    "description": "Electronic devices, gadgets and accessories",
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "updatedBy": "6789abcd1234567890123451",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Category updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Code update attempt
{
  "success": false,
  "error": {
    "code": "IMMUTABLE_FIELD",
    "message": "Category code cannot be modified"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.5 Delete Category

**Endpoint**: `DELETE /api/v1/categories/:id`

**Description**: Delete a category (soft delete)

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Category ID

**Example Request**:
```
DELETE /api/v1/categories/6789abcd1234567890123456
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "deleted": true
  },
  "message": "Category deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 409 Conflict - Has dependencies
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_DEPENDENCIES",
    "message": "Cannot delete category with existing sub-categories or products",
    "details": {
      "subCategoriesCount": 5,
      "productsCount": 120
    }
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 5. Sub-Category Endpoints

### 5.1 Create Sub-Category

**Endpoint**: `POST /api/v1/subcategories`

**Description**: Create a new sub-category under a category

**Authorization**: Product Manager, Super Admin

**Request Body**:
```json
{
  "categoryId": "6789abcd1234567890123456",
  "name": "Smartphones",
  "code": "SMART",
  "description": "Mobile smartphones and accessories",
  "isActive": true
}
```

**Validation Rules**:
- `categoryId`: Required, must be valid active category
- `name`: Required, 2-100 characters, unique within category
- `code`: Required, 2-10 characters, uppercase, globally unique, alphanumeric
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean, defaults to true

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "name": "Smartphones",
    "code": "SMART",
    "description": "Mobile smartphones and accessories",
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Sub-category created successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid category
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY",
    "message": "Category does not exist or is inactive"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 409 Conflict - Duplicate
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SUBCATEGORY",
    "message": "Sub-category with this code already exists"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.2 Get All Sub-Categories

**Endpoint**: `GET /api/v1/subcategories`

**Description**: Retrieve list of all sub-categories with pagination and filters

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `categoryId`: Filter by category ID
- `search`: Search term for name or code
- `isActive`: Filter by active status (true/false)
- `sortBy`: Sort field (name, code, createdAt) (default: name)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/subcategories?categoryId=6789abcd1234567890123456&isActive=true&page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123457",
        "categoryId": "6789abcd1234567890123456",
        "categoryName": "Electronics",
        "categoryCode": "ELEC",
        "name": "Smartphones",
        "code": "SMART",
        "description": "Mobile smartphones and accessories",
        "isActive": true,
        "productsCount": 45,
        "createdAt": "2026-01-07T10:30:00Z",
        "updatedAt": "2026-01-07T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Sub-categories retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.3 Get Sub-Category by ID

**Endpoint**: `GET /api/v1/subcategories/:id`

**Description**: Retrieve a specific sub-category by ID

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Sub-category ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "categoryCode": "ELEC",
    "name": "Smartphones",
    "code": "SMART",
    "description": "Mobile smartphones and accessories",
    "isActive": true,
    "productsCount": 45,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Sub-category retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.4 Update Sub-Category

**Endpoint**: `PUT /api/v1/subcategories/:id`

**Description**: Update an existing sub-category

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Sub-category ID

**Request Body**:
```json
{
  "name": "Smartphones & Tablets",
  "description": "Mobile smartphones, tablets and accessories",
  "isActive": true
}
```

**Note**: `code` and `categoryId` cannot be updated (categoryId can only be changed if no products exist)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "name": "Smartphones & Tablets",
    "code": "SMART",
    "description": "Mobile smartphones, tablets and accessories",
    "isActive": true,
    "updatedBy": "6789abcd1234567890123451",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Sub-category updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

---

### 5.5 Delete Sub-Category

**Endpoint**: `DELETE /api/v1/subcategories/:id`

**Description**: Delete a sub-category (soft delete)

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Sub-category ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "deleted": true
  },
  "message": "Sub-category deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 409 Conflict - Has products
{
  "success": false,
  "error": {
    "code": "SUBCATEGORY_HAS_PRODUCTS",
    "message": "Cannot delete sub-category with existing products",
    "details": {
      "productsCount": 45
    }
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 6. Product Endpoints

### 6.1 Create Product

**Endpoint**: `POST /api/v1/products`

**Description**: Create a new product with auto-generated SKU, QR code, and barcode

**Authorization**: Product Manager, Super Admin

**Request Body** (multipart/form-data):
```json
{
  "categoryId": "6789abcd1234567890123456",
  "subCategoryId": "6789abcd1234567890123457",
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "model": "A2848",
  "description": "Latest iPhone with A17 Pro chip",
  "specifications": {
    "Display": "6.1-inch OLED",
    "Processor": "A17 Pro",
    "RAM": "8GB",
    "Storage": "256GB",
    "Camera": "48MP Main, 12MP Ultra Wide",
    "Battery": "3274mAh",
    "OS": "iOS 17"
  },
  "unitOfMeasure": "piece",
  "price": 129900.00,
  "weight": 187.0,
  "dimensions": {
    "length": 14.67,
    "width": 7.15,
    "height": 0.83,
    "unit": "cm"
  },
  "warrantyPeriod": 12,
  "status": "Active",
  "image": "<file upload>"
}
```

**Validation Rules**:
- `categoryId`: Required, must be valid active category
- `subCategoryId`: Required, must be valid active sub-category, must belong to category
- `name`: Required, 2-200 characters
- `brand`: Required, 2-100 characters
- `model`: Optional, max 100 characters
- `description`: Optional, max 1000 characters
- `specifications`: Optional, object with key-value pairs
- `unitOfMeasure`: Required, enum: piece, kg, liter, meter, box, pack
- `price`: Required, decimal, min 0
- `weight`: Optional, decimal, min 0
- `dimensions`: Optional, object with length, width, height, unit
- `warrantyPeriod`: Optional, integer (months)
- `status`: Optional, enum: Active, Discontinued, Out of Stock, Coming Soon (default: Active)
- `image`: Optional, JPEG/PNG, max 5MB

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "subCategoryId": "6789abcd1234567890123457",
    "subCategoryName": "Smartphones",
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "model": "A2848",
    "description": "Latest iPhone with A17 Pro chip",
    "specifications": {
      "Display": "6.1-inch OLED",
      "Processor": "A17 Pro",
      "RAM": "8GB",
      "Storage": "256GB",
      "Camera": "48MP Main, 12MP Ultra Wide",
      "Battery": "3274mAh",
      "OS": "iOS 17"
    },
    "unitOfMeasure": "piece",
    "price": 129900.00,
    "weight": 187.0,
    "dimensions": {
      "length": 14.67,
      "width": 7.15,
      "height": 0.83,
      "unit": "cm"
    },
    "warrantyPeriod": 12,
    "status": "Active",
    "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
    "qrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png",
    "barcodeUrl": "https://storage.wlancorp.com/barcodes/6789abcd1234567890123458.png",
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Product created successfully with SKU: ELEC-SMART-APL-001",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid category/subcategory
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY_SUBCATEGORY",
    "message": "Sub-category does not belong to the selected category"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 400 Bad Request - Image too large
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Image size exceeds 5MB limit"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 400 Bad Request - Invalid image format
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "Only JPEG and PNG images are allowed"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.2 Get All Products

**Endpoint**: `GET /api/v1/products`

**Description**: Retrieve list of all products with pagination and filters

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `categoryId`: Filter by category ID
- `subCategoryId`: Filter by sub-category ID
- `brand`: Filter by brand
- `status`: Filter by status
- `search`: Search term for name, SKU, brand, model
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (name, sku, price, createdAt) (default: name)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/products?categoryId=6789abcd1234567890123456&brand=Apple&status=Active&page=1&limit=10&sortBy=price&sortOrder=desc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123458",
        "sku": "ELEC-SMART-APL-001",
        "categoryName": "Electronics",
        "subCategoryName": "Smartphones",
        "name": "iPhone 15 Pro",
        "brand": "Apple",
        "model": "A2848",
        "price": 129900.00,
        "status": "Active",
        "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
        "qrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png",
        "createdAt": "2026-01-07T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Products retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.3 Get Product by ID

**Endpoint**: `GET /api/v1/products/:id`

**Description**: Retrieve complete product details by ID

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Product ID

**Example Request**:
```
GET /api/v1/products/6789abcd1234567890123458
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "categoryCode": "ELEC",
    "subCategoryId": "6789abcd1234567890123457",
    "subCategoryName": "Smartphones",
    "subCategoryCode": "SMART",
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "model": "A2848",
    "description": "Latest iPhone with A17 Pro chip",
    "specifications": {
      "Display": "6.1-inch OLED",
      "Processor": "A17 Pro",
      "RAM": "8GB",
      "Storage": "256GB",
      "Camera": "48MP Main, 12MP Ultra Wide",
      "Battery": "3274mAh",
      "OS": "iOS 17"
    },
    "unitOfMeasure": "piece",
    "price": 129900.00,
    "weight": 187.0,
    "dimensions": {
      "length": 14.67,
      "width": 7.15,
      "height": 0.83,
      "unit": "cm"
    },
    "warrantyPeriod": 12,
    "status": "Active",
    "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
    "qrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png",
    "barcodeUrl": "https://storage.wlancorp.com/barcodes/6789abcd1234567890123458.png",
    "createdBy": "6789abcd1234567890123450",
    "updatedBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Product retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.4 Get Product by SKU

**Endpoint**: `GET /api/v1/products/sku/:sku`

**Description**: Retrieve product details by SKU (commonly used for barcode scanning)

**Authorization**: All authenticated users

**Path Parameters**:
- `sku`: Product SKU

**Example Request**:
```
GET /api/v1/products/sku/ELEC-SMART-APL-001
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "price": 129900.00,
    "status": "Active",
    "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
    "qrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png"
  },
  "message": "Product retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.5 Update Product

**Endpoint**: `PUT /api/v1/products/:id`

**Description**: Update an existing product

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Product ID

**Request Body** (multipart/form-data):
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 149900.00,
  "status": "Active",
  "description": "Updated description",
  "image": "<optional file upload>"
}
```

**Note**: `sku`, `categoryId`, `subCategoryId` cannot be updated

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "name": "iPhone 15 Pro Max",
    "price": 149900.00,
    "status": "Active",
    "updatedBy": "6789abcd1234567890123451",
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Product updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

---

### 6.6 Delete Product

**Endpoint**: `DELETE /api/v1/products/:id`

**Description**: Delete a product (soft delete)

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Product ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "deleted": true
  },
  "message": "Product deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 409 Conflict - Has inventory
{
  "success": false,
  "error": {
    "code": "PRODUCT_HAS_INVENTORY",
    "message": "Cannot delete product with existing inventory records"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.7 Search Products

**Endpoint**: `GET /api/v1/products/search`

**Description**: Advanced product search with full-text search

**Authorization**: All authenticated users

**Query Parameters**:
- `q`: Search query (searches name, SKU, brand, model, description)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example Request**:
```
GET /api/v1/products/search?q=iPhone&page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123458",
        "sku": "ELEC-SMART-APL-001",
        "name": "iPhone 15 Pro",
        "brand": "Apple",
        "price": 129900.00,
        "status": "Active",
        "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
        "relevanceScore": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "Search completed successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 7. QR Code & Barcode Endpoints

### 7.1 Download QR Code

**Endpoint**: `GET /api/v1/products/:id/qrcode/download`

**Description**: Download product QR code in specified format

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Product ID

**Query Parameters**:
- `format`: Image format (png, svg, pdf) (default: png)
- `size`: Image size (small=300, medium=500, large=800) (default: medium)

**Example Request**:
```
GET /api/v1/products/6789abcd1234567890123458/qrcode/download?format=png&size=large
```

**Success Response** (200 OK):
- Content-Type: image/png (or image/svg+xml, application/pdf)
- Content-Disposition: attachment; filename="ELEC-SMART-APL-001-QR.png"
- Binary file data

---

### 7.2 Download Barcode

**Endpoint**: `GET /api/v1/products/:id/barcode/download`

**Description**: Download product barcode in specified format

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Product ID

**Query Parameters**:
- `format`: Image format (png, svg, pdf) (default: png)
- `size`: Image size (small=300, medium=500, large=800) (default: medium)

**Example Request**:
```
GET /api/v1/products/6789abcd1234567890123458/barcode/download?format=png&size=medium
```

**Success Response** (200 OK):
- Content-Type: image/png
- Content-Disposition: attachment; filename="ELEC-SMART-APL-001-Barcode.png"
- Binary file data

---

### 7.3 Bulk Download QR Codes

**Endpoint**: `POST /api/v1/products/qrcodes/bulk-download`

**Description**: Download multiple QR codes as ZIP file

**Authorization**: Product Manager, Super Admin

**Request Body**:
```json
{
  "productIds": [
    "6789abcd1234567890123458",
    "6789abcd1234567890123459",
    "6789abcd1234567890123460"
  ],
  "format": "png",
  "size": "medium"
}
```

**Success Response** (200 OK):
- Content-Type: application/zip
- Content-Disposition: attachment; filename="QRCodes-2026-01-07.zip"
- Binary ZIP file containing all QR codes

---

### 7.4 Regenerate QR Code

**Endpoint**: `POST /api/v1/products/:id/qrcode/regenerate`

**Description**: Regenerate QR code for a product

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Product ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "oldQrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458-old.png",
    "newQrCodeUrl": "https://storage.wlancorp.com/qrcodes/6789abcd1234567890123458.png",
    "regeneratedAt": "2026-01-07T12:00:00Z"
  },
  "message": "QR code regenerated successfully",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

---

### 7.5 Regenerate Barcode

**Endpoint**: `POST /api/v1/products/:id/barcode/regenerate`

**Description**: Regenerate barcode for a product

**Authorization**: Product Manager, Super Admin

**Path Parameters**:
- `id`: Product ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "oldBarcodeUrl": "https://storage.wlancorp.com/barcodes/6789abcd1234567890123458-old.png",
    "newBarcodeUrl": "https://storage.wlancorp.com/barcodes/6789abcd1234567890123458.png",
    "regeneratedAt": "2026-01-07T12:00:00Z"
  },
  "message": "Barcode regenerated successfully",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

---

### 7.6 Scan QR Code

**Endpoint**: `POST /api/v1/products/qrcode/scan`

**Description**: Decode QR code and retrieve product information (used by mobile app)

**Authorization**: All authenticated users

**Request Body**:
```json
{
  "qrData": "eyJpZCI6IjY3ODlhYmNkMTIzNDU2Nzg5MDEyMzQ1OCIsInNrdSI6IkVMRUMtU01BUlQtQVBMLTAwMSJ9"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "price": 129900.00,
    "status": "Active",
    "imageUrl": "https://storage.wlancorp.com/products/6789abcd1234567890123458.jpg",
    "currentStock": 25,
    "warehouseLocations": [
      {
        "warehouseId": "67890",
        "warehouseName": "Main Warehouse - Bengaluru",
        "quantity": 15,
        "location": "A-12-05"
      }
    ]
  },
  "message": "QR code scanned successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid QR
{
  "success": false,
  "error": {
    "code": "INVALID_QR_CODE",
    "message": "QR code is invalid or corrupted"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 8. Utility Endpoints

### 8.1 Health Check

**Endpoint**: `GET /api/v1/health`

**Description**: Check PMS service health status

**Authorization**: None (public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service": "PMS",
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-01-07T10:30:00Z",
    "database": {
      "status": "connected",
      "responseTime": "12ms"
    },
    "storage": {
      "status": "available",
      "freeSpace": "500GB"
    }
  },
  "message": "Service is healthy",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 8.2 Get Statistics

**Endpoint**: `GET /api/v1/statistics`

**Description**: Get PMS statistics and metrics

**Authorization**: Product Manager, Super Admin

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "categories": {
      "total": 15,
      "active": 12,
      "inactive": 3
    },
    "subCategories": {
      "total": 48,
      "active": 42,
      "inactive": 6
    },
    "products": {
      "total": 1250,
      "active": 980,
      "discontinued": 200,
      "outOfStock": 50,
      "comingSoon": 20
    },
    "brands": {
      "total": 85,
      "topBrands": ["Apple", "Samsung", "Sony"]
    }
  },
  "message": "Statistics retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 9. Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_CATEGORY | 400 | Category does not exist or is inactive |
| INVALID_SUBCATEGORY | 400 | Sub-category does not exist or is inactive |
| INVALID_CATEGORY_SUBCATEGORY | 400 | Sub-category doesn't belong to category |
| FILE_TOO_LARGE | 400 | Uploaded file exceeds size limit |
| INVALID_FILE_FORMAT | 400 | Invalid file format |
| IMMUTABLE_FIELD | 400 | Attempt to modify read-only field |
| INVALID_QR_CODE | 400 | QR code is invalid or corrupted |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| CATEGORY_NOT_FOUND | 404 | Category not found |
| SUBCATEGORY_NOT_FOUND | 404 | Sub-category not found |
| PRODUCT_NOT_FOUND | 404 | Product not found |
| DUPLICATE_CATEGORY | 409 | Category already exists |
| DUPLICATE_SUBCATEGORY | 409 | Sub-category already exists |
| DUPLICATE_SKU | 409 | SKU already exists |
| CATEGORY_HAS_DEPENDENCIES | 409 | Cannot delete category with dependencies |
| SUBCATEGORY_HAS_PRODUCTS | 409 | Cannot delete sub-category with products |
| PRODUCT_HAS_INVENTORY | 409 | Cannot delete product with inventory |
| INTERNAL_SERVER_ERROR | 500 | Internal server error |
| DATABASE_ERROR | 500 | Database operation failed |
| STORAGE_ERROR | 500 | File storage operation failed |

---

## 10. Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Search endpoints**: 30 requests per minute per user
- **Bulk download**: 5 requests per minute per user
- **File upload**: 10 requests per minute per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704623460
```

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 11. Pagination Details

All list endpoints support pagination with consistent parameters:

**Query Parameters**:
- `page`: Page number (starts from 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format**:
```json
{
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## 12. Filtering and Sorting

All list endpoints support filtering and sorting:

**Common Filters**:
- `isActive`: Boolean filter for active/inactive records
- `search`: Text search across relevant fields
- `categoryId`: Filter by category
- `subCategoryId`: Filter by sub-category

**Sorting**:
- `sortBy`: Field name
- `sortOrder`: `asc` or `desc`

**Example**:
```
GET /api/v1/products?categoryId=123&isActive=true&sortBy=price&sortOrder=desc&page=1&limit=20
```

---

## Document End
**Previous Document**: [3-User-Stories-Use-Cases.md](./3-User-Stories-Use-Cases.md)  
**Next Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: PMS Documentation (4/6 documents)  
**Overall Progress**: 10/30 documents (33.3%)
