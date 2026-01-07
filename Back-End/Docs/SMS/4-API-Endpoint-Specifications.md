# SMS Service - API Endpoint Specifications

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Supplier Management System (SMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document provides comprehensive API endpoint specifications for the Supplier Management System (SMS) service. All endpoints follow RESTful principles and are versioned under `/api/v1/`.

### Base URL
```
Development: http://localhost:5003
Production: https://sms.wlancorp.com
```

### API Version
```
/api/v1/
```

---

## 2. Authentication

All SMS endpoints require JWT authentication obtained from the AUTH service.

### Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Validation
- SMS validates JWT tokens by calling AUTH service
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

## 4. Supplier Endpoints

### 4.1 Create Supplier

**Endpoint**: `POST /api/v1/suppliers`

**Description**: Create a new supplier

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Request Body**:
```json
{
  "name": "Tech Solutions Pvt Ltd",
  "email": "contact@techsolutions.com",
  "phone": "+91-80-12345678",
  "address": {
    "street": "123 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560001"
  },
  "taxId": "29AABCT1234E1Z5",
  "paymentTerms": "Net 30",
  "creditLimit": 500000.00,
  "website": "https://www.techsolutions.com",
  "notes": "Preferred supplier for electronics"
}
```

**Validation Rules**:
- `name`: Required, 2-200 characters
- `email`: Required, valid email format, unique
- `phone`: Required, valid phone format
- `address.city`: Required
- `address.state`: Required
- `address.country`: Required
- `taxId`: Required, unique, GST format for India
- `paymentTerms`: Optional, enum: Net 15, Net 30, Net 45, Net 60, COD, Advance
- `creditLimit`: Optional, decimal, min 0
- `website`: Optional, valid URL format
- `notes`: Optional, max 1000 characters

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "name": "Tech Solutions Pvt Ltd",
    "email": "contact@techsolutions.com",
    "phone": "+91-80-12345678",
    "address": {
      "street": "123 MG Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "India",
      "postalCode": "560001"
    },
    "taxId": "29AABCT1234E1Z5",
    "paymentTerms": "Net 30",
    "status": "Active",
    "creditLimit": 500000.00,
    "website": "https://www.techsolutions.com",
    "notes": "Preferred supplier for electronics",
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Supplier created successfully with code: SUP001",
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
      "name": "Supplier name is required",
      "email": "Invalid email format"
    }
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 409 Conflict - Duplicate
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SUPPLIER",
    "message": "Supplier with this email or tax ID already exists"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.2 Get All Suppliers

**Endpoint**: `GET /api/v1/suppliers`

**Description**: Retrieve list of all suppliers with pagination and filters

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for name, code, email
- `status`: Filter by status (Active/Inactive/Blacklisted)
- `paymentTerms`: Filter by payment terms
- `sortBy`: Sort field (name, supplierCode, createdAt) (default: name)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/suppliers?page=1&limit=10&status=Active&search=tech&sortBy=name&sortOrder=asc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890120001",
        "supplierCode": "SUP001",
        "name": "Tech Solutions Pvt Ltd",
        "email": "contact@techsolutions.com",
        "phone": "+91-80-12345678",
        "address": {
          "city": "Bengaluru",
          "state": "Karnataka",
          "country": "India"
        },
        "taxId": "29AABCT1234E1Z5",
        "status": "Active",
        "paymentTerms": "Net 30",
        "creditLimit": 500000.00,
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
  "message": "Suppliers retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.3 Get Supplier by ID

**Endpoint**: `GET /api/v1/suppliers/:id`

**Description**: Retrieve a specific supplier by ID

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Supplier ID (MongoDB ObjectId)

**Example Request**:
```
GET /api/v1/suppliers/6789abcd1234567890120001
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "name": "Tech Solutions Pvt Ltd",
    "email": "contact@techsolutions.com",
    "phone": "+91-80-12345678",
    "address": {
      "street": "123 MG Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "India",
      "postalCode": "560001"
    },
    "taxId": "29AABCT1234E1Z5",
    "paymentTerms": "Net 30",
    "status": "Active",
    "creditLimit": 500000.00,
    "website": "https://www.techsolutions.com",
    "notes": "Preferred supplier for electronics",
    "contactsCount": 3,
    "productsCount": 15,
    "createdBy": "6789abcd1234567890123450",
    "updatedBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Supplier retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "SUPPLIER_NOT_FOUND",
    "message": "Supplier not found"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.4 Get Supplier by Code

**Endpoint**: `GET /api/v1/suppliers/code/:supplierCode`

**Description**: Retrieve supplier by supplier code

**Authorization**: All authenticated users

**Path Parameters**:
- `supplierCode`: Supplier code (e.g., SUP001)

**Example Request**:
```
GET /api/v1/suppliers/code/SUP001
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "name": "Tech Solutions Pvt Ltd",
    "email": "contact@techsolutions.com",
    "status": "Active"
  },
  "message": "Supplier retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.5 Update Supplier

**Endpoint**: `PUT /api/v1/suppliers/:id`

**Description**: Update an existing supplier

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Path Parameters**:
- `id`: Supplier ID

**Request Body**:
```json
{
  "name": "Tech Solutions Private Limited",
  "phone": "+91-80-87654321",
  "address": {
    "street": "456 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "postalCode": "560001"
  },
  "paymentTerms": "Net 45",
  "creditLimit": 750000.00,
  "website": "https://www.techsolutions.com",
  "notes": "Increased credit limit"
}
```

**Note**: `supplierCode`, `email`, and `taxId` cannot be updated

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "name": "Tech Solutions Private Limited",
    "email": "contact@techsolutions.com",
    "phone": "+91-80-87654321",
    "address": {
      "street": "456 MG Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "India",
      "postalCode": "560001"
    },
    "taxId": "29AABCT1234E1Z5",
    "paymentTerms": "Net 45",
    "status": "Active",
    "creditLimit": 750000.00,
    "updatedBy": "6789abcd1234567890123451",
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Supplier updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Immutable field update attempt
{
  "success": false,
  "error": {
    "code": "IMMUTABLE_FIELD",
    "message": "Supplier code, email, and tax ID cannot be modified"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.6 Update Supplier Status

**Endpoint**: `PATCH /api/v1/suppliers/:id/status`

**Description**: Change supplier status

**Authorization**: Procurement Officer, Super Admin

**Path Parameters**:
- `id`: Supplier ID

**Request Body**:
```json
{
  "status": "Blacklisted",
  "reason": "Quality issues and delayed deliveries"
}
```

**Validation Rules**:
- `status`: Required, enum: Active, Inactive, Blacklisted
- `reason`: Optional, max 500 characters

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "name": "Tech Solutions Pvt Ltd",
    "status": "Blacklisted",
    "previousStatus": "Active",
    "statusChangedAt": "2026-01-07T12:00:00Z",
    "statusChangedBy": "6789abcd1234567890123451",
    "reason": "Quality issues and delayed deliveries"
  },
  "message": "Supplier status updated successfully",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

---

### 4.7 Delete Supplier

**Endpoint**: `DELETE /api/v1/suppliers/:id`

**Description**: Delete a supplier (soft delete)

**Authorization**: Super Admin

**Path Parameters**:
- `id`: Supplier ID

**Example Request**:
```
DELETE /api/v1/suppliers/6789abcd1234567890120001
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120001",
    "deleted": true
  },
  "message": "Supplier deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 409 Conflict - Has dependencies
{
  "success": false,
  "error": {
    "code": "SUPPLIER_HAS_DEPENDENCIES",
    "message": "Cannot delete supplier with existing contacts or product links",
    "details": {
      "contactsCount": 3,
      "productsCount": 15
    }
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 4.8 Search Suppliers

**Endpoint**: `GET /api/v1/suppliers/search`

**Description**: Advanced supplier search with full-text search

**Authorization**: All authenticated users

**Query Parameters**:
- `q`: Search query (searches name, code, email, phone)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example Request**:
```
GET /api/v1/suppliers/search?q=tech&page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890120001",
        "supplierCode": "SUP001",
        "name": "Tech Solutions Pvt Ltd",
        "email": "contact@techsolutions.com",
        "status": "Active",
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

## 5. Contact Endpoints

### 5.1 Create Contact

**Endpoint**: `POST /api/v1/contacts`

**Description**: Add a new contact for a supplier

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Request Body**:
```json
{
  "supplierId": "6789abcd1234567890120001",
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@techsolutions.com",
  "phone": "+91-98765-43210",
  "designation": "Sales Manager",
  "department": "Sales",
  "isPrimary": true
}
```

**Validation Rules**:
- `supplierId`: Required, must be valid active supplier
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Required, valid phone format
- `designation`: Optional, max 100 characters
- `department`: Optional, max 100 characters
- `isPrimary`: Optional, boolean (default: false)

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120002",
    "supplierId": "6789abcd1234567890120001",
    "supplierName": "Tech Solutions Pvt Ltd",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@techsolutions.com",
    "phone": "+91-98765-43210",
    "designation": "Sales Manager",
    "department": "Sales",
    "isPrimary": true,
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Contact created successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid supplier
{
  "success": false,
  "error": {
    "code": "INVALID_SUPPLIER",
    "message": "Supplier does not exist or is not active"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 409 Conflict - Primary already exists
{
  "success": false,
  "error": {
    "code": "PRIMARY_CONTACT_EXISTS",
    "message": "A primary contact already exists for this supplier. Update existing contact or set isPrimary to false."
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.2 Get All Contacts

**Endpoint**: `GET /api/v1/contacts`

**Description**: Retrieve list of all contacts with filters

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `supplierId`: Filter by supplier ID
- `isPrimary`: Filter by primary status (true/false)
- `isActive`: Filter by active status (true/false)
- `search`: Search term for name or email
- `sortBy`: Sort field (name, createdAt) (default: name)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/contacts?supplierId=6789abcd1234567890120001&isActive=true&page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890120002",
        "supplierId": "6789abcd1234567890120001",
        "supplierName": "Tech Solutions Pvt Ltd",
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@techsolutions.com",
        "phone": "+91-98765-43210",
        "designation": "Sales Manager",
        "department": "Sales",
        "isPrimary": true,
        "isActive": true,
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
  "message": "Contacts retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.3 Get Contact by ID

**Endpoint**: `GET /api/v1/contacts/:id`

**Description**: Retrieve a specific contact by ID

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Contact ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120002",
    "supplierId": "6789abcd1234567890120001",
    "supplierName": "Tech Solutions Pvt Ltd",
    "supplierCode": "SUP001",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@techsolutions.com",
    "phone": "+91-98765-43210",
    "designation": "Sales Manager",
    "department": "Sales",
    "isPrimary": true,
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Contact retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 5.4 Update Contact

**Endpoint**: `PUT /api/v1/contacts/:id`

**Description**: Update an existing contact

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Path Parameters**:
- `id`: Contact ID

**Request Body**:
```json
{
  "name": "Rajesh Kumar Singh",
  "phone": "+91-98765-99999",
  "designation": "Senior Sales Manager",
  "isPrimary": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120002",
    "supplierId": "6789abcd1234567890120001",
    "name": "Rajesh Kumar Singh",
    "email": "rajesh.kumar@techsolutions.com",
    "phone": "+91-98765-99999",
    "designation": "Senior Sales Manager",
    "department": "Sales",
    "isPrimary": true,
    "isActive": true,
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Contact updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

---

### 5.5 Delete Contact

**Endpoint**: `DELETE /api/v1/contacts/:id`

**Description**: Delete a contact

**Authorization**: Procurement Officer, Super Admin

**Path Parameters**:
- `id`: Contact ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120002",
    "deleted": true
  },
  "message": "Contact deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 409 Conflict - Only active contact
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_ONLY_CONTACT",
    "message": "Cannot delete the only active contact for this supplier"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 6. Product-Supplier Endpoints

### 6.1 Create Product-Supplier Link

**Endpoint**: `POST /api/v1/product-suppliers`

**Description**: Link a product to a supplier with pricing information

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Request Body**:
```json
{
  "supplierId": "6789abcd1234567890120001",
  "productId": "6789abcd1234567890123458",
  "supplierPrice": 115000.00,
  "currency": "INR",
  "leadTimeDays": 7,
  "minOrderQuantity": 10,
  "isPreferred": true
}
```

**Validation Rules**:
- `supplierId`: Required, must be valid active supplier
- `productId`: Required, must be valid active product (from PMS)
- `supplierPrice`: Required, decimal, min 0.01
- `currency`: Optional, default "INR", valid currency code
- `leadTimeDays`: Required, integer, min 1, max 365
- `minOrderQuantity`: Required, integer, min 1
- `isPreferred`: Optional, boolean (default: false)

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120003",
    "supplierId": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "supplierName": "Tech Solutions Pvt Ltd",
    "productId": "6789abcd1234567890123458",
    "productSKU": "ELEC-SMART-APL-001",
    "productName": "iPhone 15 Pro",
    "supplierPrice": 115000.00,
    "currency": "INR",
    "leadTimeDays": 7,
    "minOrderQuantity": 10,
    "isPreferred": true,
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Product-supplier link created successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Error Responses**:
```json
// 400 Bad Request - Product not found in PMS
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found in PMS service"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}

// 409 Conflict - Link already exists
{
  "success": false,
  "error": {
    "code": "LINK_ALREADY_EXISTS",
    "message": "This supplier is already linked to this product"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.2 Get All Product-Supplier Links

**Endpoint**: `GET /api/v1/product-suppliers`

**Description**: Retrieve list of all product-supplier links

**Authorization**: All authenticated users

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `supplierId`: Filter by supplier ID
- `productId`: Filter by product ID
- `isPreferred`: Filter by preferred status (true/false)
- `isActive`: Filter by active status (true/false)
- `sortBy`: Sort field (supplierPrice, leadTimeDays, createdAt) (default: createdAt)
- `sortOrder`: Sort order (asc/desc) (default: desc)

**Example Request**:
```
GET /api/v1/product-suppliers?supplierId=6789abcd1234567890120001&isActive=true&page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890120003",
        "supplierId": "6789abcd1234567890120001",
        "supplierCode": "SUP001",
        "supplierName": "Tech Solutions Pvt Ltd",
        "productId": "6789abcd1234567890123458",
        "productSKU": "ELEC-SMART-APL-001",
        "productName": "iPhone 15 Pro",
        "supplierPrice": 115000.00,
        "currency": "INR",
        "leadTimeDays": 7,
        "minOrderQuantity": 10,
        "isPreferred": true,
        "isActive": true,
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
  "message": "Product-supplier links retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.3 Get Product-Supplier Link by ID

**Endpoint**: `GET /api/v1/product-suppliers/:id`

**Description**: Retrieve a specific product-supplier link

**Authorization**: All authenticated users

**Path Parameters**:
- `id`: Product-Supplier Link ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120003",
    "supplierId": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "supplierName": "Tech Solutions Pvt Ltd",
    "supplierEmail": "contact@techsolutions.com",
    "productId": "6789abcd1234567890123458",
    "productSKU": "ELEC-SMART-APL-001",
    "productName": "iPhone 15 Pro",
    "productCategory": "Electronics",
    "supplierPrice": 115000.00,
    "currency": "INR",
    "leadTimeDays": 7,
    "minOrderQuantity": 10,
    "isPreferred": true,
    "isActive": true,
    "createdBy": "6789abcd1234567890123450",
    "createdAt": "2026-01-07T10:30:00Z",
    "updatedAt": "2026-01-07T10:30:00Z"
  },
  "message": "Product-supplier link retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.4 Get Suppliers by Product

**Endpoint**: `GET /api/v1/products/:productId/suppliers`

**Description**: Get all suppliers providing a specific product

**Authorization**: All authenticated users

**Path Parameters**:
- `productId`: Product ID from PMS

**Query Parameters**:
- `isActive`: Filter by active status (default: true)
- `sortBy`: Sort field (supplierPrice, leadTimeDays) (default: supplierPrice)
- `sortOrder`: Sort order (asc/desc) (default: asc)

**Example Request**:
```
GET /api/v1/products/6789abcd1234567890123458/suppliers?sortBy=supplierPrice&sortOrder=asc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "6789abcd1234567890123458",
    "productSKU": "ELEC-SMART-APL-001",
    "productName": "iPhone 15 Pro",
    "suppliers": [
      {
        "id": "6789abcd1234567890120003",
        "supplierId": "6789abcd1234567890120001",
        "supplierCode": "SUP001",
        "supplierName": "Tech Solutions Pvt Ltd",
        "supplierPrice": 115000.00,
        "currency": "INR",
        "leadTimeDays": 7,
        "minOrderQuantity": 10,
        "isPreferred": true,
        "isActive": true
      }
    ]
  },
  "message": "Suppliers retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 6.5 Get Products by Supplier

**Endpoint**: `GET /api/v1/suppliers/:supplierId/products`

**Description**: Get all products supplied by a specific supplier

**Authorization**: All authenticated users

**Path Parameters**:
- `supplierId`: Supplier ID

**Query Parameters**:
- `isActive`: Filter by active status (default: true)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example Request**:
```
GET /api/v1/suppliers/6789abcd1234567890120001/products?page=1&limit=10
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "supplierId": "6789abcd1234567890120001",
    "supplierCode": "SUP001",
    "supplierName": "Tech Solutions Pvt Ltd",
    "products": [
      {
        "id": "6789abcd1234567890120003",
        "productId": "6789abcd1234567890123458",
        "productSKU": "ELEC-SMART-APL-001",
        "productName": "iPhone 15 Pro",
        "productCategory": "Electronics",
        "supplierPrice": 115000.00,
        "currency": "INR",
        "leadTimeDays": 7,
        "minOrderQuantity": 10,
        "isPreferred": true
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

### 6.6 Update Product-Supplier Link

**Endpoint**: `PUT /api/v1/product-suppliers/:id`

**Description**: Update product-supplier link (typically pricing)

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Path Parameters**:
- `id`: Product-Supplier Link ID

**Request Body**:
```json
{
  "supplierPrice": 112000.00,
  "leadTimeDays": 5,
  "minOrderQuantity": 15,
  "isPreferred": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120003",
    "supplierId": "6789abcd1234567890120001",
    "productId": "6789abcd1234567890123458",
    "supplierPrice": 112000.00,
    "oldPrice": 115000.00,
    "leadTimeDays": 5,
    "minOrderQuantity": 15,
    "isPreferred": true,
    "updatedBy": "6789abcd1234567890123451",
    "updatedAt": "2026-01-07T11:45:00Z"
  },
  "message": "Product-supplier link updated successfully",
  "timestamp": "2026-01-07T11:45:00Z"
}
```

---

### 6.7 Set Preferred Supplier

**Endpoint**: `PATCH /api/v1/product-suppliers/:id/preferred`

**Description**: Mark a supplier as preferred for a product

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Path Parameters**:
- `id`: Product-Supplier Link ID

**Request Body**:
```json
{
  "isPreferred": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120003",
    "productId": "6789abcd1234567890123458",
    "supplierId": "6789abcd1234567890120001",
    "isPreferred": true,
    "previousPreferredSupplierId": "6789abcd1234567890120005",
    "updatedAt": "2026-01-07T12:00:00Z"
  },
  "message": "Preferred supplier updated successfully",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

---

### 6.8 Delete Product-Supplier Link

**Endpoint**: `DELETE /api/v1/product-suppliers/:id`

**Description**: Remove product-supplier link

**Authorization**: Procurement Officer, Super Admin

**Path Parameters**:
- `id`: Product-Supplier Link ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890120003",
    "deleted": true
  },
  "message": "Product-supplier link deleted successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

## 7. Utility Endpoints

### 7.1 Health Check

**Endpoint**: `GET /api/v1/health`

**Description**: Check SMS service health status

**Authorization**: None (public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service": "SMS",
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-01-07T10:30:00Z",
    "database": {
      "status": "connected",
      "responseTime": "10ms"
    },
    "externalServices": {
      "authService": {
        "status": "available",
        "responseTime": "25ms"
      },
      "pmsService": {
        "status": "available",
        "responseTime": "30ms"
      }
    }
  },
  "message": "Service is healthy",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 7.2 Get Statistics

**Endpoint**: `GET /api/v1/statistics`

**Description**: Get SMS statistics and metrics

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "suppliers": {
      "total": 150,
      "active": 120,
      "inactive": 25,
      "blacklisted": 5
    },
    "contacts": {
      "total": 350,
      "active": 300,
      "primary": 120
    },
    "productSuppliers": {
      "total": 1250,
      "active": 1100,
      "preferred": 980
    },
    "topSuppliers": [
      {
        "supplierId": "6789abcd1234567890120001",
        "supplierName": "Tech Solutions Pvt Ltd",
        "productsCount": 85
      }
    ]
  },
  "message": "Statistics retrieved successfully",
  "timestamp": "2026-01-07T10:30:00Z"
}
```

---

### 7.3 Export Suppliers

**Endpoint**: `GET /api/v1/suppliers/export`

**Description**: Export suppliers list to Excel/CSV

**Authorization**: Procurement Officer, Product Manager, Super Admin

**Query Parameters**:
- `format`: Export format (excel, csv) (default: excel)
- `status`: Filter by status
- `includeContacts`: Include contacts (true/false) (default: false)

**Example Request**:
```
GET /api/v1/suppliers/export?format=excel&status=Active&includeContacts=true
```

**Success Response** (200 OK):
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="suppliers-2026-01-07.xlsx"
- Binary file data

---

## 8. Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_SUPPLIER | 400 | Supplier does not exist or is inactive |
| PRODUCT_NOT_FOUND | 400 | Product not found in PMS service |
| IMMUTABLE_FIELD | 400 | Attempt to modify read-only field |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| SUPPLIER_NOT_FOUND | 404 | Supplier not found |
| CONTACT_NOT_FOUND | 404 | Contact not found |
| LINK_NOT_FOUND | 404 | Product-supplier link not found |
| DUPLICATE_SUPPLIER | 409 | Supplier already exists |
| PRIMARY_CONTACT_EXISTS | 409 | Primary contact already exists |
| LINK_ALREADY_EXISTS | 409 | Product-supplier link already exists |
| SUPPLIER_HAS_DEPENDENCIES | 409 | Cannot delete supplier with dependencies |
| CANNOT_DELETE_ONLY_CONTACT | 409 | Cannot delete only active contact |
| INTERNAL_SERVER_ERROR | 500 | Internal server error |
| DATABASE_ERROR | 500 | Database operation failed |
| EXTERNAL_SERVICE_ERROR | 500 | External service call failed |

---

## 9. Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Search endpoints**: 30 requests per minute per user
- **Export endpoints**: 5 requests per minute per user

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

## Document End

**Previous Document**: [3-User-Stories-Use-Cases.md](./3-User-Stories-Use-Cases.md)  
**Next Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: SMS Documentation (4/6 documents)  
**Overall Progress**: 16/30 documents (53.3%)
