# AUTH Service - Architecture Diagram

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Authentication & User Profile Management (AUTH)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

The AUTH service is a Node.js-based microservice responsible for user authentication, authorization, and profile management. It implements JWT-based authentication with access and refresh token mechanisms, providing secure access control for all other microservices in the system.

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

    WEB -->|HTTPS/REST| AUTH
    WEB -->|HTTPS/REST| PMS
    WEB -->|HTTPS/REST| SMS
    WEB -->|HTTPS/REST| WMS
    WEB -->|HTTPS/REST| IMS
    
    MOBILE -->|HTTPS/REST| AUTH
    MOBILE -->|HTTPS/REST| PMS
    MOBILE -->|HTTPS/REST| SMS
    MOBILE -->|HTTPS/REST| WMS
    MOBILE -->|HTTPS/REST| IMS

    AUTH --> AUTH_DB
    PMS --> PMS_DB
    SMS --> SMS_DB
    WMS --> WMS_DB
    IMS --> IMS_DB

    PMS -.->|Token Validation| AUTH
    SMS -.->|Token Validation| AUTH
    WMS -.->|Token Validation| AUTH
    IMS -.->|Token Validation| AUTH

    style AUTH fill:#4CAF50,stroke:#2E7D32,color:#fff
    style AUTH_DB fill:#1976D2,stroke:#0D47A1,color:#fff
```

---

## 3. AUTH Service Architecture

```mermaid
graph TB
    subgraph "AUTH Service - Port 5001"
        subgraph "API Layer"
            ROUTES[Routes Layer<br/>Express Router]
            MW_AUTH[Authentication<br/>Middleware]
            MW_VALID[Validation<br/>Middleware]
            MW_ERROR[Error Handler<br/>Middleware]
        end

        subgraph "Business Logic Layer"
            AUTH_CTRL[Auth Controller]
            USER_CTRL[User Controller]
            PROFILE_CTRL[Profile Controller]
            
            AUTH_SVC[Auth Service]
            USER_SVC[User Service]
            TOKEN_SVC[Token Service]
            ROLE_SVC[Role Service]
        end

        subgraph "Data Access Layer"
            USER_MODEL[User Model]
            TOKEN_MODEL[Refresh Token Model]
            ROLE_MODEL[Role Model]
        end

        subgraph "Utility Layer"
            JWT_UTIL[JWT Utility]
            HASH_UTIL[Password Hash Utility]
            VALID_UTIL[Validation Utility]
        end
    end

    DB[(auth_db<br/>MongoDB)]

    ROUTES --> MW_AUTH
    ROUTES --> MW_VALID
    MW_AUTH --> AUTH_CTRL
    MW_AUTH --> USER_CTRL
    MW_AUTH --> PROFILE_CTRL

    AUTH_CTRL --> AUTH_SVC
    USER_CTRL --> USER_SVC
    PROFILE_CTRL --> USER_SVC

    AUTH_SVC --> TOKEN_SVC
    AUTH_SVC --> USER_SVC
    USER_SVC --> ROLE_SVC

    AUTH_SVC --> USER_MODEL
    AUTH_SVC --> TOKEN_MODEL
    USER_SVC --> USER_MODEL
    ROLE_SVC --> ROLE_MODEL
    TOKEN_SVC --> TOKEN_MODEL

    USER_MODEL --> DB
    TOKEN_MODEL --> DB
    ROLE_MODEL --> DB

    AUTH_SVC --> JWT_UTIL
    AUTH_SVC --> HASH_UTIL
    USER_SVC --> HASH_UTIL
    AUTH_CTRL --> VALID_UTIL

    MW_ERROR -.->|Error Response| ROUTES

    style AUTH_SVC fill:#FF9800,stroke:#E65100,color:#fff
    style TOKEN_SVC fill:#FF9800,stroke:#E65100,color:#fff
    style JWT_UTIL fill:#9C27B0,stroke:#6A1B9A,color:#fff
```

---

## 4. Component Responsibilities

### 4.1 API Layer

| Component | Responsibility |
|-----------|---------------|
| **Routes Layer** | Define API endpoints and map to controllers |
| **Authentication Middleware** | Verify JWT tokens, extract user info, protect routes |
| **Validation Middleware** | Validate request body/params using schemas |
| **Error Handler Middleware** | Centralized error handling and response formatting |

### 4.2 Business Logic Layer

| Component | Responsibility |
|-----------|---------------|
| **Auth Controller** | Handle authentication requests (login, logout, refresh, verify) |
| **User Controller** | Handle user CRUD operations |
| **Profile Controller** | Handle user profile operations |
| **Auth Service** | Core authentication logic, token generation, password verification |
| **User Service** | User management business logic |
| **Token Service** | Refresh token management (create, validate, revoke) |
| **Role Service** | Role and permission management |

### 4.3 Data Access Layer

| Component | Responsibility |
|-----------|---------------|
| **User Model** | User schema and database operations |
| **Refresh Token Model** | Refresh token schema and operations |
| **Role Model** | Role schema and operations |

### 4.4 Utility Layer

| Component | Responsibility |
|-----------|---------------|
| **JWT Utility** | Generate, verify, decode JWT tokens |
| **Password Hash Utility** | Hash passwords using bcrypt, compare hashes |
| **Validation Utility** | Reusable validation functions |

---

## 5. Authentication Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant AUTH as AUTH Service
    participant DB as auth_db
    participant Other as Other Services<br/>(PMS/SMS/WMS/IMS)

    Note over Client,Other: User Login Flow
    Client->>AUTH: POST /api/v1/auth/login<br/>{email, password}
    AUTH->>DB: Find user by email
    DB-->>AUTH: User data
    AUTH->>AUTH: Verify password
    AUTH->>AUTH: Generate Access Token (15 min)
    AUTH->>AUTH: Generate Refresh Token
    AUTH->>DB: Store Refresh Token
    DB-->>AUTH: Success
    AUTH-->>Client: {accessToken, refreshToken, user}

    Note over Client,Other: Accessing Protected Resources
    Client->>Other: GET /api/v1/products<br/>Authorization: Bearer {accessToken}
    Other->>AUTH: POST /api/v1/auth/verify<br/>{token}
    AUTH->>AUTH: Verify JWT signature
    AUTH-->>Other: {valid: true, userId, role}
    Other->>Other: Process request
    Other-->>Client: Response data

    Note over Client,Other: Token Refresh Flow
    Client->>AUTH: POST /api/v1/auth/refresh<br/>{refreshToken}
    AUTH->>DB: Validate refresh token
    DB-->>AUTH: Token valid
    AUTH->>AUTH: Generate new Access Token
    AUTH->>AUTH: Generate new Refresh Token
    AUTH->>DB: Update refresh token
    DB-->>AUTH: Success
    AUTH-->>Client: {accessToken, refreshToken}

    Note over Client,Other: Logout Flow
    Client->>AUTH: POST /api/v1/auth/logout<br/>{refreshToken}
    AUTH->>DB: Delete refresh token
    DB-->>AUTH: Deleted
    AUTH-->>Client: {success: true}
```

---

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_AUTH[AUTH Service<br/>localhost:5001]
        DEV_DB[(MongoDB<br/>localhost:27017)]
        DEV_AUTH --> DEV_DB
    end

    subgraph "On-Premise Deployment"
        ON_PREM_AUTH[AUTH Service<br/>Docker Container<br/>Port: 5001]
        ON_PREM_DB[(MongoDB<br/>Docker Container<br/>Port: 27017)]
        ON_PREM_AUTH --> ON_PREM_DB
    end

    subgraph "AWS Cloud Deployment (Future)"
        subgraph "VPC"
            subgraph "ECS Cluster"
                AWS_AUTH[AUTH Service<br/>ECS Container]
            end
            subgraph "Database"
                AWS_DB[(MongoDB Atlas<br/>or DocumentDB)]
            end
            AWS_LB[Application Load<br/>Balancer]
        end
        
        AWS_LB --> AWS_AUTH
        AWS_AUTH --> AWS_DB
    end

    style DEV_AUTH fill:#4CAF50,stroke:#2E7D32,color:#fff
    style ON_PREM_AUTH fill:#FF9800,stroke:#E65100,color:#fff
    style AWS_AUTH fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 7. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ LTS | JavaScript runtime |
| **Framework** | Express.js | 4.x | Web framework |
| **Database** | MongoDB | 6.x | NoSQL database |
| **ODM** | Mongoose | 8.x | MongoDB object modeling |
| **Authentication** | jsonwebtoken | 9.x | JWT generation/verification |
| **Password Hashing** | bcryptjs | 2.x | Password encryption |
| **Validation** | Joi | 17.x | Request validation |
| **Environment** | dotenv | 16.x | Environment variables |
| **CORS** | cors | 2.x | Cross-origin resource sharing |
| **Logging** | winston | 3.x | Application logging |
| **API Documentation** | swagger-ui-express | 5.x | OpenAPI documentation |

---

## 8. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        L1[Layer 1: Transport Security<br/>HTTPS/TLS]
        L2[Layer 2: Authentication<br/>JWT Tokens]
        L3[Layer 3: Authorization<br/>Role-Based Access Control]
        L4[Layer 4: Data Security<br/>Password Hashing, Encryption]
        L5[Layer 5: Input Validation<br/>Request Sanitization]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5

    subgraph "Security Measures"
        M1[JWT Secret Management]
        M2[Refresh Token Rotation]
        M3[Password Complexity Rules]
        M4[Rate Limiting]
        M5[SQL Injection Prevention]
        M6[XSS Protection]
        M7[CORS Configuration]
        M8[Helmet Security Headers]
    end

    style L2 fill:#F44336,stroke:#C62828,color:#fff
    style L3 fill:#F44336,stroke:#C62828,color:#fff
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling
- Stateless service design allows multiple instances
- JWT tokens eliminate server-side session storage
- Load balancer distributes requests across instances

### 9.2 Database Scaling
- MongoDB replica sets for high availability
- Read replicas for read-heavy operations
- Indexing on frequently queried fields (email, userId)

### 9.3 Caching Strategy
- Redis cache for frequently accessed user profiles (future enhancement)
- Token blacklist for logout functionality (if needed)

---

## 10. Monitoring & Logging

```mermaid
graph LR
    AUTH[AUTH Service] --> LOGS[Winston Logger]
    LOGS --> FILE[Log Files]
    LOGS --> CONSOLE[Console Output]
    
    AUTH --> METRICS[Metrics Collection]
    METRICS --> HEALTH[Health Checks]
    
    style AUTH fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### Key Metrics to Monitor
- Request rate and response time
- Authentication success/failure rate
- Token generation/validation rate
- Database query performance
- Error rates by endpoint

---

## 11. API Versioning Strategy

All AUTH endpoints follow the pattern: `/api/v1/auth/*` and `/api/v1/users/*`

Future versions will use `/api/v2/...` while maintaining backward compatibility.

---

## 12. Environment Configuration

The service uses environment variables for configuration:

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_ACCESS_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<secure-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

---

## 13. Inter-Service Communication

```mermaid
graph LR
    PMS[PMS Service] -->|Token Verification| AUTH[AUTH Service]
    SMS[SMS Service] -->|Token Verification| AUTH
    WMS[WMS Service] -->|Token Verification| AUTH
    IMS[IMS Service] -->|Token Verification| AUTH
    
    AUTH -->|User Info| PMS
    AUTH -->|User Info| SMS
    AUTH -->|User Info| WMS
    AUTH -->|User Info| IMS
    
    style AUTH fill:#4CAF50,stroke:#2E7D32,color:#fff
```

**Token Verification Endpoint**: `POST /api/v1/auth/verify`

Other services call this endpoint to validate JWT tokens before processing requests.

---

## Document End
**Next Document**: [2-ER-Diagram.md](./2-ER-Diagram.md)  
**Module Progress**: AUTH Documentation (1/6 documents)  
**Overall Progress**: 1/30 documents (3.3%)
