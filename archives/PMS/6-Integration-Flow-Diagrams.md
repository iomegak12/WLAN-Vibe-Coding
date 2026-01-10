# PMS Service - Integration & Flow Diagrams

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Product Management System (PMS)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document illustrates the integration flows and process diagrams for the Product Management System (PMS). It shows how PMS integrates with other microservices and the detailed flow of key operations.

---

## 2. Service Integration Architecture

### 2.1 PMS Integration Map

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web Application<br/>React]
        MOBILE[Mobile App<br/>React Native]
    end
    
    subgraph "Microservices Layer"
        AUTH[AUTH Service<br/>Node.js/Express<br/>Port 5001]
        PMS[PMS Service<br/>Python/FastAPI<br/>Port 5002]
        SMS[SMS Service<br/>Python/FastAPI<br/>Port 5003]
        WMS[WMS Service<br/>Python/FastAPI<br/>Port 5004]
        IMS[IMS Service<br/>Python/FastAPI<br/>Port 5005]
    end
    
    subgraph "Data Layer"
        AUTH_DB[(auth_db<br/>MongoDB)]
        PMS_DB[(pms_db<br/>MongoDB)]
        SMS_DB[(sms_db<br/>MongoDB)]
        WMS_DB[(wms_db<br/>MongoDB)]
        IMS_DB[(ims_db<br/>MongoDB)]
    end
    
    subgraph "Storage Layer"
        FILE_STORAGE[File Storage<br/>Images, QR, Barcode]
    end
    
    WEB -->|HTTP/REST| PMS
    MOBILE -->|HTTP/REST| PMS
    
    PMS -->|Validate JWT| AUTH
    PMS -->|Get User Info| AUTH
    
    PMS -->|Product-Supplier Link| SMS
    SMS -->|Get Product Info| PMS
    
    PMS -->|Product Details| WMS
    WMS -->|Get Product Info| PMS
    
    PMS -->|Product Details| IMS
    IMS -->|Get Product Info| PMS
    IMS -->|Stock Level Updates| PMS
    
    PMS --> PMS_DB
    AUTH --> AUTH_DB
    SMS --> SMS_DB
    WMS --> WMS_DB
    IMS --> IMS_DB
    
    PMS -->|Store/Retrieve Files| FILE_STORAGE
    
    style PMS fill:#4CAF50,stroke:#2E7D32,color:#fff
    style AUTH fill:#2196F3,stroke:#1565C0,color:#fff
    style SMS fill:#FF9800,stroke:#E65100,color:#fff
    style WMS fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style IMS fill:#F44336,stroke:#C62828,color:#fff
```

---

## 3. Authentication Flow

### 3.1 JWT Token Validation

```mermaid
sequenceDiagram
    participant Client
    participant PMS
    participant AUTH
    participant pms_db

    Client->>PMS: POST /api/v1/products<br/>(Authorization: Bearer token)
    
    Note over PMS: Extract JWT from header
    
    PMS->>PMS: Check token format
    
    alt Token missing or invalid format
        PMS-->>Client: 401 Unauthorized
    end
    
    PMS->>AUTH: POST /api/v1/auth/verify-token<br/>{token}
    
    AUTH->>AUTH: Validate JWT signature
    AUTH->>AUTH: Check expiration
    AUTH->>AUTH: Check token in blacklist
    
    alt Token invalid/expired
        AUTH-->>PMS: 401 Invalid Token
        PMS-->>Client: 401 Unauthorized
    end
    
    AUTH-->>PMS: 200 OK {userId, role, permissions}
    
    Note over PMS: Cache user info for request
    
    PMS->>PMS: Check role permissions
    
    alt Insufficient permissions
        PMS-->>Client: 403 Forbidden
    end
    
    PMS->>pms_db: Execute operation
    pms_db-->>PMS: Result
    
    PMS-->>Client: 200/201 Success Response
```

---

## 4. Product Management Flows

### 4.1 Create Product Flow

```mermaid
flowchart TD
    Start([Client Request:<br/>Create Product]) --> ValidateAuth[Validate JWT Token<br/>via AUTH Service]
    
    ValidateAuth -->|Invalid| AuthError[Return 401 Unauthorized]
    AuthError --> End1([End])
    
    ValidateAuth -->|Valid| CheckPerms[Check User Role<br/>Product Manager/Super Admin?]
    
    CheckPerms -->|No| PermError[Return 403 Forbidden]
    PermError --> End1
    
    CheckPerms -->|Yes| ValidateData[Validate Request Data<br/>Pydantic Models]
    
    ValidateData -->|Invalid| ValidationError[Return 400<br/>Validation Error]
    ValidationError --> End1
    
    ValidateData -->|Valid| CheckCategory{Category &<br/>SubCategory<br/>Valid?}
    
    CheckCategory -->|No| CategoryError[Return 400<br/>Invalid Category]
    CategoryError --> End1
    
    CheckCategory -->|Yes| CheckImage{Image<br/>Uploaded?}
    
    CheckImage -->|Yes| ValidateImage[Validate Image<br/>Type: JPEG/PNG<br/>Size: < 5MB]
    
    ValidateImage -->|Invalid| ImageError[Return 400<br/>Invalid Image]
    ImageError --> End1
    
    ValidateImage -->|Valid| UploadImage[Upload Image<br/>to Storage]
    UploadImage --> GenSKU
    
    CheckImage -->|No| GenSKU[Generate SKU<br/>CATCODE-SUBCATCODE-BRANDCODE-###]
    
    GenSKU --> CheckDuplicate{SKU<br/>Exists?}
    
    CheckDuplicate -->|Yes| IncrementSKU[Increment Sequence<br/>Number]
    IncrementSKU --> GenSKU
    
    CheckDuplicate -->|No| GenQR[Generate QR Code<br/>Encode: ID, SKU, Name]
    
    GenQR --> SaveQR[Save QR Code Image<br/>to Storage]
    SaveQR --> GenBarcode[Generate Barcode<br/>Code128 from SKU]
    GenBarcode --> SaveBarcode[Save Barcode Image<br/>to Storage]
    
    SaveBarcode --> CreateDoc[Create Product Document<br/>with URLs]
    CreateDoc --> SaveDB[Save to MongoDB]
    
    SaveDB --> CreateAudit[Create Audit Log<br/>Action: CREATE]
    CreateAudit --> NotifyServices[Notify Other Services<br/>SMS, WMS, IMS]
    
    NotifyServices --> Success[Return 201 Created<br/>Product with SKU/QR/Barcode]
    Success --> End2([End])
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style AuthError fill:#F44336,stroke:#C62828,color:#fff
    style PermError fill:#F44336,stroke:#C62828,color:#fff
    style ValidationError fill:#F44336,stroke:#C62828,color:#fff
    style CategoryError fill:#F44336,stroke:#C62828,color:#fff
    style ImageError fill:#F44336,stroke:#C62828,color:#fff
```

### 4.2 Update Product Flow

```mermaid
flowchart TD
    Start([Client Request:<br/>Update Product]) --> ValidateAuth[Validate JWT Token]
    
    ValidateAuth -->|Invalid| AuthError[Return 401]
    ValidateAuth -->|Valid| CheckPerms[Check Permissions]
    
    CheckPerms -->|No| PermError[Return 403]
    CheckPerms -->|Yes| ValidateData[Validate Request Data]
    
    ValidateData -->|Invalid| ValidationError[Return 400]
    ValidateData -->|Valid| GetProduct[Get Current Product<br/>from Database]
    
    GetProduct -->|Not Found| NotFoundError[Return 404]
    GetProduct -->|Found| SaveOldValues[Save Old Values<br/>for Audit]
    
    SaveOldValues --> CheckImage{New Image<br/>Uploaded?}
    
    CheckImage -->|Yes| ValidateImage[Validate Image]
    ValidateImage -->|Invalid| ImageError[Return 400]
    ValidateImage -->|Valid| DeleteOld[Delete Old Image<br/>from Storage]
    DeleteOld --> UploadNew[Upload New Image]
    UploadNew --> MergeChanges
    
    CheckImage -->|No| MergeChanges[Merge Changes<br/>with Existing Data]
    
    MergeChanges --> UpdateDB[Update Document<br/>in MongoDB]
    UpdateDB --> CreateAudit[Create Audit Log<br/>Action: UPDATE<br/>Old/New Values]
    
    CreateAudit --> NotifyServices[Notify Services<br/>if Key Fields Changed]
    NotifyServices --> Success[Return 200 OK<br/>Updated Product]
    
    Success --> End([End])
    AuthError --> End
    PermError --> End
    ValidationError --> End
    NotFoundError --> End
    ImageError --> End
    
    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 4.3 Delete Product Flow

```mermaid
flowchart TD
    Start([Client Request:<br/>Delete Product]) --> ValidateAuth[Validate JWT Token]
    
    ValidateAuth -->|Invalid| AuthError[Return 401]
    ValidateAuth -->|Valid| CheckPerms[Check Permissions<br/>Product Manager/Super Admin]
    
    CheckPerms -->|No| PermError[Return 403]
    CheckPerms -->|Yes| GetProduct[Get Product from DB]
    
    GetProduct -->|Not Found| NotFoundError[Return 404]
    GetProduct -->|Found| CheckInventory{Check Inventory<br/>via IMS Service}
    
    CheckInventory -->|Exists| InventoryError[Return 409<br/>Has Inventory Records]
    CheckInventory -->|None| CheckSuppliers{Check Suppliers<br/>via SMS Service}
    
    CheckSuppliers -->|Exists| SupplierError[Return 409<br/>Has Supplier Links]
    CheckSuppliers -->|None| SoftDelete[Set isDeleted = true<br/>Keep Data]
    
    SoftDelete --> UpdateDB[Update in MongoDB]
    UpdateDB --> CreateAudit[Create Audit Log<br/>Action: DELETE]
    
    CreateAudit --> ArchiveFiles{Archive Files?}
    ArchiveFiles -->|Yes| MoveFiles[Move Images/QR/Barcode<br/>to Archive Storage]
    ArchiveFiles -->|No| NotifyServices
    
    MoveFiles --> NotifyServices[Notify Other Services<br/>Product Deleted]
    NotifyServices --> Success[Return 200 OK<br/>Deleted: true]
    
    Success --> End([End])
    AuthError --> End
    PermError --> End
    NotFoundError --> End
    InventoryError --> End
    SupplierError --> End
    
    style Start fill:#F44336,stroke:#C62828,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 5. QR Code & Barcode Flows

### 5.1 QR Code Generation Flow

```mermaid
flowchart TD
    Start([QR Code Generation<br/>Triggered]) --> PrepareData[Prepare QR Data<br/>JSON Object]
    
    PrepareData --> EncodeData{Data<br/>Structure}
    
    EncodeData --> CreateJSON["JSON Structure:<br/>{
        id: productId,
        sku: sku,
        name: name,
        categoryId: categoryId,
        price: price,
        timestamp: now
    }"]
    
    CreateJSON --> Base64Encode[Base64 Encode<br/>JSON String]
    Base64Encode --> GenQR[Generate QR Code<br/>Using qrcode Library]
    
    GenQR --> SetParams["Set Parameters:<br/>- Version: Auto<br/>- Error Correction: H<br/>- Box Size: 10<br/>- Border: 4"]
    
    SetParams --> CreateImage[Create QR Image<br/>PIL Image Object]
    CreateImage --> SaveBuffer[Save to BytesIO<br/>Buffer]
    
    SaveBuffer --> UploadStorage[Upload to Storage<br/>Path: /qrcodes/{productId}.png]
    UploadStorage --> GetURL[Get Public URL]
    
    GetURL --> UpdateProduct[Update Product Document<br/>qrCodeUrl Field]
    UpdateProduct --> ReturnURL[Return QR Code URL]
    
    ReturnURL --> End([QR Code Ready])
    
    style Start fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 5.2 Barcode Generation Flow

```mermaid
flowchart TD
    Start([Barcode Generation<br/>Triggered]) --> GetSKU[Get Product SKU]
    
    GetSKU --> ValidateSKU{SKU<br/>Valid?}
    ValidateSKU -->|No| Error[Return Error]
    
    ValidateSKU -->|Yes| SelectFormat[Select Barcode Format<br/>Code128]
    
    SelectFormat --> GenBarcode[Generate Barcode<br/>Using python-barcode]
    
    GenBarcode --> SetOptions["Set Options:<br/>- Format: Code128<br/>- Add Checksum: True<br/>- Show Text: True<br/>- Font Size: 10"]
    
    SetOptions --> CreateImage[Create Barcode Image<br/>SVG/PNG]
    CreateImage --> AddText[Add SKU Text Below<br/>Barcode]
    
    AddText --> SaveBuffer[Save to BytesIO<br/>Buffer]
    SaveBuffer --> UploadStorage[Upload to Storage<br/>Path: /barcodes/{productId}.png]
    
    UploadStorage --> GetURL[Get Public URL]
    GetURL --> UpdateProduct[Update Product Document<br/>barcodeUrl Field]
    
    UpdateProduct --> ReturnURL[Return Barcode URL]
    ReturnURL --> End([Barcode Ready])
    
    Error --> End
    
    style Start fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 5.3 QR Code Scan Flow (Mobile)

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant Camera
    participant PMS
    participant IMS
    participant WMS
    
    Mobile->>Camera: Open QR Scanner
    Camera->>Mobile: Scan QR Code
    
    Mobile->>Mobile: Decode QR Data<br/>(Base64 → JSON)
    
    Mobile->>PMS: POST /api/v1/products/qrcode/scan<br/>{qrData}
    
    PMS->>PMS: Validate QR Data
    
    alt Invalid QR Data
        PMS-->>Mobile: 400 Invalid QR Code
    end
    
    PMS->>PMS: Extract Product ID
    PMS->>PMS: Fetch Product Details
    
    PMS->>IMS: GET /api/v1/inventory/product/{productId}/stock
    IMS-->>PMS: Current Stock Levels
    
    PMS->>WMS: GET /api/v1/warehouses/product/{productId}/locations
    WMS-->>PMS: Warehouse Locations
    
    PMS->>Mobile: 200 OK<br/>{product, stock, locations}
    
    Mobile->>Mobile: Display Product Info<br/>with Stock & Location
```

---

## 6. Inter-Service Communication

### 6.1 PMS ↔ SMS Integration

```mermaid
sequenceDiagram
    participant SMS as SMS Service<br/>(Supplier Management)
    participant PMS as PMS Service<br/>(Product Management)
    participant pms_db
    
    Note over SMS,PMS: Scenario: Link Product to Supplier
    
    SMS->>PMS: GET /api/v1/products/{productId}
    
    PMS->>pms_db: Find Product by ID
    pms_db-->>PMS: Product Data
    
    alt Product Not Found
        PMS-->>SMS: 404 Product Not Found
    end
    
    PMS-->>SMS: 200 OK {product details}
    
    SMS->>SMS: Create Supplier-Product Link
    
    Note over SMS,PMS: Scenario: Get Products by Category
    
    SMS->>PMS: GET /api/v1/products?categoryId={id}
    PMS->>pms_db: Query Products
    pms_db-->>PMS: Product List
    PMS-->>SMS: 200 OK {products[]}
    
    Note over SMS,PMS: Scenario: Check Product Before Delete
    
    PMS->>SMS: GET /api/v1/suppliers/product/{productId}/check
    SMS-->>PMS: {hasSuppliers: true/false, count: n}
    
    alt Has Suppliers
        PMS->>PMS: Return 409 Cannot Delete
    end
```

### 6.2 PMS ↔ WMS Integration

```mermaid
sequenceDiagram
    participant WMS as WMS Service<br/>(Warehouse Management)
    participant PMS as PMS Service<br/>(Product Management)
    participant pms_db
    
    Note over WMS,PMS: Scenario: Add Product to Warehouse
    
    WMS->>PMS: GET /api/v1/products/{productId}
    PMS->>PMS_DB: Find Product
    PMS_DB-->>PMS: Product Data
    PMS-->>WMS: 200 OK {product}
    
    WMS->>WMS: Validate Product Active
    WMS->>WMS: Assign Warehouse Location
    
    Note over WMS,PMS: Scenario: Get Product Locations
    
    WMS->>PMS: GET /api/v1/products/{productId}
    PMS-->>WMS: Product Details
    
    WMS->>WMS: Query Internal DB<br/>for Locations
    
    Note over WMS,PMS: Scenario: Product Updated Notification
    
    PMS->>PMS: Product Updated
    PMS->>WMS: POST /api/v1/webhooks/product-updated<br/>{productId, changes}
    
    WMS->>WMS: Update Cached Product Info
    WMS-->>PMS: 200 OK Acknowledged
```

### 6.3 PMS ↔ IMS Integration

```mermaid
sequenceDiagram
    participant IMS as IMS Service<br/>(Inventory Management)
    participant PMS as PMS Service<br/>(Product Management)
    participant pms_db
    
    Note over IMS,PMS: Scenario: Create Inventory Record
    
    IMS->>PMS: GET /api/v1/products/{productId}
    PMS->>PMS_DB: Find Product
    PMS_DB-->>PMS: Product Data
    
    alt Product Inactive
        PMS-->>IMS: 400 Product Not Active
    end
    
    PMS-->>IMS: 200 OK {product}
    IMS->>IMS: Create Inventory Record
    
    Note over IMS,PMS: Scenario: Stock Level Update
    
    IMS->>IMS: Stock Level Changed
    IMS->>PMS: POST /api/v1/webhooks/stock-updated<br/>{productId, newLevel}
    
    PMS->>PMS: Log Stock Change Event
    PMS-->>IMS: 200 OK
    
    Note over IMS,PMS: Scenario: Check Before Delete
    
    PMS->>IMS: GET /api/v1/inventory/product/{productId}/check
    IMS-->>PMS: {hasInventory: true/false, totalQty: n}
    
    alt Has Inventory
        PMS->>PMS: Return 409 Cannot Delete
    end
```

---

## 7. Error Handling Flows

### 7.1 Global Error Handling

```mermaid
flowchart TD
    Start([Exception Raised]) --> CheckType{Exception<br/>Type?}
    
    CheckType -->|ValidationError| HandleValidation[Parse Validation Errors<br/>Extract Field Details]
    HandleValidation --> Return400[Return 400<br/>Bad Request]
    
    CheckType -->|HTTPException| HandleHTTP[Extract Status Code<br/>and Message]
    HandleHTTP --> ReturnHTTP[Return HTTP Status<br/>with Error Details]
    
    CheckType -->|PyMongoError| HandleDB[Log Database Error<br/>Sanitize Message]
    HandleDB --> Return500DB[Return 500<br/>Database Error]
    
    CheckType -->|FileNotFoundError| HandleFile[Log File Error]
    HandleFile --> Return500File[Return 500<br/>Storage Error]
    
    CheckType -->|Unauthorized| HandleAuth[Validate Token Failed]
    HandleAuth --> Return401[Return 401<br/>Unauthorized]
    
    CheckType -->|PermissionDenied| HandlePerm[Check User Role]
    HandlePerm --> Return403[Return 403<br/>Forbidden]
    
    CheckType -->|Other| HandleGeneric[Log Exception<br/>Stack Trace]
    HandleGeneric --> Return500[Return 500<br/>Internal Server Error]
    
    Return400 --> LogError[Log to Error Log]
    ReturnHTTP --> LogError
    Return500DB --> LogError
    Return500File --> LogError
    Return401 --> LogError
    Return403 --> LogError
    Return500 --> LogError
    
    LogError --> SendAlert{Critical<br/>Error?}
    
    SendAlert -->|Yes| AlertAdmin[Send Alert to Admin<br/>Email/Slack]
    SendAlert -->|No| End
    
    AlertAdmin --> End([Error Response Sent])
    
    style Start fill:#F44336,stroke:#C62828,color:#fff
    style End fill:#9E9E9E,stroke:#616161,color:#fff
```

### 7.2 Retry Mechanism for External Calls

```mermaid
flowchart TD
    Start([Call External Service]) --> Attempt[Attempt API Call]
    
    Attempt --> Success{Request<br/>Successful?}
    
    Success -->|Yes| Return[Return Response]
    Return --> End([Done])
    
    Success -->|No| CheckRetry{Retry<br/>Count < Max?}
    
    CheckRetry -->|No| LogFailure[Log Permanent Failure]
    LogFailure --> RaiseError[Raise Exception]
    RaiseError --> End
    
    CheckRetry -->|Yes| IncrementRetry[Increment Retry Count]
    IncrementRetry --> Wait[Wait with<br/>Exponential Backoff]
    
    Wait --> Attempt
    
    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
    style RaiseError fill:#F44336,stroke:#C62828,color:#fff
```

---

## 8. Data Flow Diagrams

### 8.1 Product Search Data Flow

```mermaid
flowchart LR
    User[User Input<br/>Search Query] --> Web[Web/Mobile App]
    
    Web --> Validate[Validate Input<br/>Sanitize Query]
    
    Validate --> Cache{Check<br/>Cache?}
    
    Cache -->|Hit| ReturnCached[Return Cached<br/>Results]
    ReturnCached --> Display[Display to User]
    
    Cache -->|Miss| BuildQuery[Build MongoDB<br/>Text Search Query]
    
    BuildQuery --> Execute[Execute Query<br/>with Pagination]
    
    Execute --> Aggregate[Aggregate Category<br/>SubCategory Names]
    
    Aggregate --> StoreCache[Store in Cache<br/>TTL: 5 minutes]
    
    StoreCache --> Format[Format Response<br/>Standard API Format]
    
    Format --> Display
    
    style User fill:#2196F3,stroke:#1565C0,color:#fff
    style Display fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 8.2 Bulk QR Code Download Flow

```mermaid
flowchart TD
    Start([Client Request:<br/>Bulk Download QR]) --> ValidateAuth[Validate JWT]
    
    ValidateAuth --> CheckPerms[Check Permissions]
    CheckPerms --> ValidateInput[Validate Product IDs<br/>Max: 100 per request]
    
    ValidateInput --> FetchProducts[Fetch Products<br/>from Database]
    
    FetchProducts --> CheckExists{All Products<br/>Exist?}
    
    CheckExists -->|No| Return404[Return 404<br/>Some Products Not Found]
    CheckExists -->|Yes| CreateTemp[Create Temp Directory]
    
    CreateTemp --> LoopProducts[Loop Through Products]
    
    LoopProducts --> GenQR[Generate QR Code<br/>for Each Product]
    GenQR --> SaveFile[Save to Temp Dir<br/>Filename: SKU-QR.png]
    
    SaveFile --> NextProduct{More<br/>Products?}
    NextProduct -->|Yes| LoopProducts
    
    NextProduct -->|No| CreateZip[Create ZIP Archive<br/>QRCodes-{date}.zip]
    
    CreateZip --> StreamZip[Stream ZIP to Client<br/>Content-Type: application/zip]
    
    StreamZip --> Cleanup[Delete Temp Directory]
    Cleanup --> End([Download Complete])
    
    Return404 --> End
    
    style Start fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 9. File Upload & Storage Flow

### 9.1 Product Image Upload

```mermaid
sequenceDiagram
    participant Client
    participant PMS
    participant Validator
    participant Storage
    participant DB
    
    Client->>PMS: POST /api/v1/products<br/>(multipart/form-data)
    
    PMS->>Validator: Validate Image File
    
    Validator->>Validator: Check File Type<br/>(JPEG/PNG only)
    
    alt Invalid Type
        Validator-->>PMS: Invalid File Type
        PMS-->>Client: 400 Invalid Format
    end
    
    Validator->>Validator: Check File Size<br/>(< 5MB)
    
    alt Too Large
        Validator-->>PMS: File Too Large
        PMS-->>Client: 400 File Too Large
    end
    
    Validator-->>PMS: File Valid
    
    PMS->>PMS: Generate Unique Filename<br/>{productId}.{ext}
    
    PMS->>Storage: Upload File<br/>Path: /products/{filename}
    
    Storage->>Storage: Save to Disk/Cloud
    Storage-->>PMS: File URL
    
    PMS->>DB: Save Product with imageUrl
    DB-->>PMS: Document Created
    
    PMS-->>Client: 201 Created<br/>{product with imageUrl}
```

### 9.2 File Storage Structure

```
file_storage/
├── products/
│   ├── {productId1}.jpg
│   ├── {productId2}.png
│   └── ...
├── qrcodes/
│   ├── {productId1}.png
│   ├── {productId2}.png
│   └── ...
├── barcodes/
│   ├── {productId1}.png
│   ├── {productId2}.png
│   └── ...
└── archive/
    ├── products/
    ├── qrcodes/
    └── barcodes/
```

---

## 10. Webhook & Event Notifications

### 10.1 Product Update Event Flow

```mermaid
flowchart TD
    Start([Product Updated<br/>in PMS]) --> DetermineChange{What<br/>Changed?}
    
    DetermineChange -->|Price| PriceEvent[Create Price Update Event]
    DetermineChange -->|Status| StatusEvent[Create Status Update Event]
    DetermineChange -->|Basic Info| InfoEvent[Create Info Update Event]
    DetermineChange -->|Category| CategoryEvent[Create Category Update Event]
    
    PriceEvent --> BuildPayload1[Build Event Payload<br/>productId, oldPrice, newPrice]
    StatusEvent --> BuildPayload2[Build Event Payload<br/>productId, oldStatus, newStatus]
    InfoEvent --> BuildPayload3[Build Event Payload<br/>productId, changes{}]
    CategoryEvent --> BuildPayload4[Build Event Payload<br/>productId, oldCategory, newCategory]
    
    BuildPayload1 --> PublishEvent
    BuildPayload2 --> PublishEvent
    BuildPayload3 --> PublishEvent
    BuildPayload4 --> PublishEvent
    
    PublishEvent[Publish to Event Queue] --> NotifySMS[Notify SMS Service<br/>POST /webhooks/product-updated]
    
    NotifySMS --> NotifyWMS[Notify WMS Service<br/>POST /webhooks/product-updated]
    
    NotifyWMS --> NotifyIMS[Notify IMS Service<br/>POST /webhooks/product-updated]
    
    NotifyIMS --> LogEvent[Log Event<br/>in product_audit]
    
    LogEvent --> End([Event Published])
    
    style Start fill:#FF9800,stroke:#E65100,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 10.2 Webhook Payload Structure

```json
{
  "eventType": "product.updated",
  "eventId": "evt_6789abcd1234567890123460",
  "timestamp": "2026-01-07T12:00:00Z",
  "source": "PMS",
  "data": {
    "productId": "6789abcd1234567890123458",
    "sku": "ELEC-SMART-APL-001",
    "changes": {
      "price": {
        "old": 129900.00,
        "new": 124900.00
      },
      "status": {
        "old": "Active",
        "new": "Discontinued"
      }
    },
    "updatedBy": "6789abcd1234567890123451",
    "updatedAt": "2026-01-07T12:00:00Z"
  }
}
```

---

## 11. Performance Optimization Flows

### 11.1 Database Query Optimization

```mermaid
flowchart TD
    Start([Query Request]) --> CheckCache{Result in<br/>Cache?}
    
    CheckCache -->|Yes| ReturnCache[Return Cached Data]
    ReturnCache --> End([Response Sent])
    
    CheckCache -->|No| AnalyzeQuery[Analyze Query Pattern]
    
    AnalyzeQuery --> OptimizeQuery[Apply Optimizations:<br/>- Use Indexes<br/>- Project Only Needed Fields<br/>- Limit Result Set]
    
    OptimizeQuery --> ExecuteQuery[Execute Optimized Query]
    
    ExecuteQuery --> MeasureTime{Execution<br/>Time > 500ms?}
    
    MeasureTime -->|Yes| LogSlow[Log Slow Query<br/>for Analysis]
    LogSlow --> StoreCache
    
    MeasureTime -->|No| StoreCache[Store in Cache<br/>with TTL]
    
    StoreCache --> ReturnData[Return Data]
    ReturnData --> End
    
    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 11.2 Image Processing Pipeline

```mermaid
flowchart LR
    Upload[Image Upload] --> Validate[Validate Format<br/>& Size]
    
    Validate --> Resize{Image > 2MB?}
    
    Resize -->|Yes| Compress[Compress Image<br/>Reduce Quality to 85%]
    Resize -->|No| GenThumbnail
    
    Compress --> GenThumbnail[Generate Thumbnail<br/>200x200]
    
    GenThumbnail --> SaveOriginal[Save Original<br/>to Storage]
    
    SaveOriginal --> SaveThumb[Save Thumbnail<br/>to Storage]
    
    SaveThumb --> UpdateDB[Update URLs<br/>in Database]
    
    UpdateDB --> End([Complete])
    
    style Upload fill:#2196F3,stroke:#1565C0,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 12. Monitoring & Logging

### 12.1 Request Logging Flow

```mermaid
flowchart TD
    Request([API Request Received]) --> LogRequest[Log Request:<br/>- Timestamp<br/>- Endpoint<br/>- Method<br/>- User ID<br/>- IP Address]
    
    LogRequest --> ProcessRequest[Process Request]
    
    ProcessRequest --> Success{Request<br/>Successful?}
    
    Success -->|Yes| LogSuccess[Log Success:<br/>- Response Time<br/>- Status Code<br/>- Response Size]
    
    Success -->|No| LogError[Log Error:<br/>- Error Type<br/>- Error Message<br/>- Stack Trace]
    
    LogSuccess --> Metrics[Update Metrics:<br/>- Request Count<br/>- Success Rate<br/>- Avg Response Time]
    
    LogError --> Metrics
    
    Metrics --> CheckThreshold{Error Rate<br/>> 5%?}
    
    CheckThreshold -->|Yes| Alert[Send Alert<br/>to Admin]
    CheckThreshold -->|No| End
    
    Alert --> End([Request Complete])
    
    style Request fill:#2196F3,stroke:#1565C0,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 12.2 Health Check Flow

```mermaid
sequenceDiagram
    participant Monitor as Monitoring System
    participant PMS
    participant pms_db
    participant Storage
    participant AUTH
    
    loop Every 30 seconds
        Monitor->>PMS: GET /api/v1/health
        
        PMS->>PMS: Check Service Status
        
        PMS->>pms_db: Ping Database
        pms_db-->>PMS: Pong (response time)
        
        alt DB Response > 100ms
            PMS->>PMS: Status: Degraded
        end
        
        PMS->>Storage: Check Storage Access
        Storage-->>PMS: Storage Available
        
        alt Storage Unreachable
            PMS->>PMS: Status: Degraded
        end
        
        PMS->>AUTH: GET /api/v1/health
        AUTH-->>PMS: Auth Service Status
        
        PMS->>Monitor: Health Status<br/>{status, db, storage, auth, uptime}
        
        alt Status != Healthy
            Monitor->>Monitor: Trigger Alert
            Monitor->>Monitor: Log Incident
        end
    end
```

---

## 13. Security Flows

### 13.1 Input Validation & Sanitization

```mermaid
flowchart TD
    Input([User Input Received]) --> CheckType[Check Data Type<br/>String/Number/Object]
    
    CheckType --> ValidateType{Type<br/>Matches<br/>Expected?}
    
    ValidateType -->|No| RejectType[Reject: Invalid Type]
    ValidateType -->|Yes| CheckLength[Check String Length<br/>Min/Max Constraints]
    
    CheckLength --> ValidateLength{Length<br/>Valid?}
    ValidateLength -->|No| RejectLength[Reject: Invalid Length]
    ValidateLength -->|Yes| SanitizeInput[Sanitize Input:<br/>- Remove HTML Tags<br/>- Escape Special Chars<br/>- Trim Whitespace]
    
    SanitizeInput --> ValidateFormat{Format<br/>Valid?}
    ValidateFormat -->|No| RejectFormat[Reject: Invalid Format]
    ValidateFormat -->|Yes| CheckInjection[Check for Injection:<br/>- SQL Injection<br/>- NoSQL Injection<br/>- XSS Patterns]
    
    CheckInjection --> InjectionFound{Injection<br/>Detected?}
    InjectionFound -->|Yes| RejectInjection[Reject: Security Threat<br/>Log Incident]
    InjectionFound -->|No| Accept[Accept Input]
    
    RejectType --> End([Validation Failed])
    RejectLength --> End
    RejectFormat --> End
    RejectInjection --> End
    Accept --> End2([Input Valid])
    
    style Input fill:#2196F3,stroke:#1565C0,color:#fff
    style Accept fill:#4CAF50,stroke:#2E7D32,color:#fff
    style RejectInjection fill:#F44336,stroke:#C62828,color:#fff
```

### 13.2 Rate Limiting Flow

```mermaid
flowchart TD
    Request([API Request]) --> GetKey[Get Rate Limit Key<br/>User ID or IP]
    
    GetKey --> CheckCache[Check Redis Cache<br/>for Request Count]
    
    CheckCache --> Exists{Key<br/>Exists?}
    
    Exists -->|No| CreateKey[Create Key<br/>Count = 1<br/>TTL = 60s]
    CreateKey --> AllowRequest
    
    Exists -->|Yes| GetCount[Get Current Count]
    GetCount --> CheckLimit{Count <<br/>Limit?}
    
    CheckLimit -->|No| RejectRequest[Reject: 429 Too Many Requests<br/>Set Retry-After Header]
    CheckLimit -->|Yes| IncrementCount[Increment Count]
    
    IncrementCount --> AllowRequest[Allow Request<br/>Set Rate Limit Headers]
    
    AllowRequest --> ProcessRequest[Process Request]
    ProcessRequest --> End1([Success])
    
    RejectRequest --> LogAttempt[Log Rate Limit Violation]
    LogAttempt --> End2([Request Blocked])
    
    style Request fill:#2196F3,stroke:#1565C0,color:#fff
    style ProcessRequest fill:#4CAF50,stroke:#2E7D32,color:#fff
    style RejectRequest fill:#F44336,stroke:#C62828,color:#fff
```

---

## 14. Deployment Flow

### 14.1 CI/CD Pipeline

```mermaid
flowchart TD
    Start([Code Pushed to Git]) --> Trigger[Trigger CI/CD Pipeline]
    
    Trigger --> Checkout[Checkout Code]
    Checkout --> InstallDeps[Install Dependencies<br/>pip install -r requirements.txt]
    
    InstallDeps --> Lint[Run Linter<br/>flake8, black]
    Lint --> LintPass{Lint<br/>Passed?}
    
    LintPass -->|No| FailLint[Pipeline Failed:<br/>Lint Errors]
    LintPass -->|Yes| RunTests[Run Unit Tests<br/>pytest]
    
    RunTests --> TestPass{Tests<br/>Passed?}
    TestPass -->|No| FailTests[Pipeline Failed:<br/>Test Failures]
    TestPass -->|Yes| BuildImage[Build Docker Image<br/>pms-service:latest]
    
    BuildImage --> TagImage[Tag Image<br/>pms-service:{version}]
    TagImage --> PushRegistry[Push to Container Registry]
    
    PushRegistry --> DeployEnv{Deploy to<br/>Environment?}
    
    DeployEnv -->|Dev| DeployDev[Deploy to Dev<br/>Update Container]
    DeployEnv -->|Staging| DeployStaging[Deploy to Staging<br/>Update Container]
    DeployEnv -->|Production| DeployProd[Deploy to Production<br/>Update Container]
    
    DeployDev --> HealthCheck
    DeployStaging --> HealthCheck
    DeployProd --> HealthCheck
    
    HealthCheck[Run Health Checks] --> HealthPass{Health<br/>OK?}
    
    HealthPass -->|No| Rollback[Rollback Deployment<br/>Restore Previous Version]
    HealthPass -->|Yes| Success[Deployment Successful<br/>Send Notification]
    
    Rollback --> End1([Deployment Failed])
    FailLint --> End1
    FailTests --> End1
    Success --> End2([Deployment Complete])
    
    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Rollback fill:#F44336,stroke:#C62828,color:#fff
```

---

## 15. Summary

This document covers:

1. **Service Integration**: How PMS integrates with AUTH, SMS, WMS, and IMS services
2. **Authentication**: JWT token validation flow across all endpoints
3. **Product Management**: Complete flows for create, update, delete operations
4. **QR/Barcode**: Generation, storage, and scanning flows
5. **Inter-Service Communication**: API calls and webhooks between services
6. **Error Handling**: Global error handling and retry mechanisms
7. **Data Flow**: Search, bulk operations, and file uploads
8. **Events & Webhooks**: Real-time notifications to other services
9. **Performance**: Query optimization and caching strategies
10. **Monitoring**: Request logging and health checks
11. **Security**: Input validation, sanitization, and rate limiting
12. **Deployment**: CI/CD pipeline for automated deployment

All flows are designed to be resilient, scalable, and maintainable for the POC and production deployment.

---

## Document End
**Previous Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: PMS Documentation (6/6 documents)  
**Overall Progress**: 12/30 documents (40.0%)  
**Module Complete**: PMS Documentation (6/6 documents)  
**Next Module**: SMS (Supplier Management System)
