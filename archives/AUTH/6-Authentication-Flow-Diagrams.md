# AUTH Service - Authentication Flow Diagrams

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Authentication & User Profile Management (AUTH)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document provides detailed flow diagrams for all authentication and authorization processes in the AUTH service. These diagrams illustrate the complete request-response lifecycle, decision points, and error handling paths.

---

## 2. User Login Flow

### 2.1 Complete Login Process

```mermaid
flowchart TD
    Start([User Opens Login Page]) --> EnterCreds[Enter Email & Password]
    EnterCreds --> ClickLogin[Click Login Button]
    ClickLogin --> ValidateInput{Client-Side<br/>Validation}
    
    ValidateInput -->|Invalid| ShowClientError[Show Validation Error]
    ShowClientError --> EnterCreds
    
    ValidateInput -->|Valid| SendRequest[POST /api/v1/auth/login]
    SendRequest --> CheckRateLimit{Rate Limit<br/>Check}
    
    CheckRateLimit -->|Exceeded| Return429[429 Too Many Requests]
    Return429 --> ShowRateLimitMsg[Show Rate Limit Message]
    ShowRateLimitMsg --> End1([End])
    
    CheckRateLimit -->|OK| ValidateBody{Validate<br/>Request Body}
    ValidateBody -->|Invalid| Return400[400 Validation Error]
    Return400 --> ShowValidationError[Show Validation Errors]
    ShowValidationError --> EnterCreds
    
    ValidateBody -->|Valid| FindUser[Query User by Email]
    FindUser --> UserExists{User<br/>Found?}
    
    UserExists -->|No| Return401A[401 Invalid Credentials]
    Return401A --> ShowAuthError[Show: Invalid Email or Password]
    ShowAuthError --> EnterCreds
    
    UserExists -->|Yes| VerifyPassword{Verify<br/>Password Hash}
    
    VerifyPassword -->|Invalid| Return401B[401 Invalid Credentials]
    Return401B --> ShowAuthError
    
    VerifyPassword -->|Valid| CheckActive{Account<br/>Active?}
    
    CheckActive -->|No| Return403[403 Account Inactive]
    Return403 --> ShowInactiveMsg[Show: Contact Administrator]
    ShowInactiveMsg --> End2([End])
    
    CheckActive -->|Yes| LoadRole[Load User Role & Permissions]
    LoadRole --> GenAccessToken[Generate Access Token<br/>Expiry: 15 min]
    GenAccessToken --> GenRefreshToken[Generate Refresh Token<br/>Expiry: 7 days]
    GenRefreshToken --> HashRefreshToken[Hash Refresh Token]
    HashRefreshToken --> SaveRefreshToken[Save to refresh_tokens Collection]
    SaveRefreshToken --> UpdateLastLogin[Update lastLogin Timestamp]
    UpdateLastLogin --> Return200[200 Success Response]
    Return200 --> StoreTokens[Store Tokens in Client<br/>localStorage/secure cookie]
    StoreTokens --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End3([Login Complete])

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End3 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Return401A fill:#F44336,stroke:#C62828,color:#fff
    style Return401B fill:#F44336,stroke:#C62828,color:#fff
    style Return403 fill:#FF9800,stroke:#E65100,color:#fff
    style Return429 fill:#FF9800,stroke:#E65100,color:#fff
```

### 2.2 Login Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Client as Web/Mobile Client
    participant AuthAPI as AUTH API
    participant Middleware as Rate Limit Middleware
    participant AuthService as Auth Service
    participant UserModel as User Model
    participant TokenService as Token Service
    participant DB as MongoDB

    User->>Client: Enter credentials
    User->>Client: Click Login
    Client->>Client: Validate input
    
    Client->>AuthAPI: POST /api/v1/auth/login<br/>{email, password}
    AuthAPI->>Middleware: Check rate limit
    Middleware->>Middleware: Check request count
    alt Rate limit exceeded
        Middleware-->>Client: 429 Too Many Requests
        Client-->>User: Show rate limit message
    else Rate limit OK
        Middleware->>AuthAPI: Continue
        AuthAPI->>AuthService: authenticateUser(email, password)
        AuthService->>UserModel: findByEmail(email)
        UserModel->>DB: Query users collection
        DB-->>UserModel: User document
        
        alt User not found
            UserModel-->>AuthService: null
            AuthService-->>AuthAPI: Invalid credentials error
            AuthAPI-->>Client: 401 Unauthorized
            Client-->>User: Show error message
        else User found
            UserModel-->>AuthService: User data
            AuthService->>AuthService: comparePassword(password, hash)
            
            alt Password invalid
                AuthService-->>AuthAPI: Invalid credentials error
                AuthAPI-->>Client: 401 Unauthorized
                Client-->>User: Show error message
            else Password valid
                AuthService->>AuthService: Check isActive
                
                alt Account inactive
                    AuthService-->>AuthAPI: Account inactive error
                    AuthAPI-->>Client: 403 Forbidden
                    Client-->>User: Contact administrator
                else Account active
                    AuthService->>TokenService: generateTokens(user)
                    TokenService->>TokenService: Create access token (15m)
                    TokenService->>TokenService: Create refresh token (7d)
                    TokenService->>TokenService: Hash refresh token
                    TokenService->>DB: Save refresh token
                    DB-->>TokenService: Saved
                    TokenService-->>AuthService: {accessToken, refreshToken}
                    AuthService->>DB: Update lastLogin
                    DB-->>AuthService: Updated
                    AuthService-->>AuthAPI: Success with tokens & user
                    AuthAPI-->>Client: 200 OK {tokens, user}
                    Client->>Client: Store tokens
                    Client->>Client: Redirect to dashboard
                    Client-->>User: Show dashboard
                end
            end
        end
    end
```

---

## 3. Token Refresh Flow

### 3.1 Token Refresh Process

```mermaid
flowchart TD
    Start([Access Token Expiring]) --> ClientDetect[Client Detects Token Expiry]
    ClientDetect --> HasRefreshToken{Has Refresh<br/>Token?}
    
    HasRefreshToken -->|No| RedirectLogin[Redirect to Login]
    RedirectLogin --> End1([End - Login Required])
    
    HasRefreshToken -->|Yes| SendRefresh["POST /api/v1/auth/refresh<br/>{refreshToken}"]
    SendRefresh --> ValidateFormat{Validate JWT<br/>Format}
    
    ValidateFormat -->|Invalid| Return400[400 Bad Request]
    Return400 --> RedirectLogin
    
    ValidateFormat -->|Valid| FindToken[Query refresh_tokens by Token]
    FindToken --> TokenExists{Token<br/>Found?}
    
    TokenExists -->|No| Return401A[401 Invalid Token]
    Return401A --> RedirectLogin
    
    TokenExists -->|Yes| CheckExpiry{Token<br/>Expired?}
    
    CheckExpiry -->|Yes| Return401B[401 Expired Token]
    Return401B --> RedirectLogin
    
    CheckExpiry -->|No| CheckRevoked{Token<br/>Revoked?}
    
    CheckRevoked -->|Yes| Return401C[401 Token Revoked]
    Return401C --> RedirectLogin
    
    CheckRevoked -->|No| LoadUser[Load User by userId]
    LoadUser --> UserActive{User<br/>Active?}
    
    UserActive -->|No| Return403[403 Account Inactive]
    Return403 --> RedirectLogin
    
    UserActive -->|Yes| GenNewAccess[Generate New Access Token]
    GenNewAccess --> GenNewRefresh[Generate New Refresh Token]
    GenNewRefresh --> HashNewRefresh[Hash New Refresh Token]
    HashNewRefresh --> RevokeOld[Revoke Old Refresh Token]
    RevokeOld --> SaveNew[Save New Refresh Token]
    SaveNew --> Return200[200 Success Response]
    Return200 --> UpdateClient[Update Tokens in Client]
    UpdateClient --> RetryRequest[Retry Original Request]
    RetryRequest --> End2([Continue Session])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End1 fill:#F44336,stroke:#C62828,color:#fff
    style Return401A fill:#F44336,stroke:#C62828,color:#fff
    style Return401B fill:#F44336,stroke:#C62828,color:#fff
    style Return401C fill:#F44336,stroke:#C62828,color:#fff
```

### 3.2 Token Refresh Sequence

```mermaid
sequenceDiagram
    participant Client
    participant AuthAPI as AUTH API
    participant TokenService as Token Service
    participant DB as MongoDB
    participant UserModel as User Model

    Client->>Client: Detect access token expiry
    Client->>AuthAPI: POST /api/v1/auth/refresh<br/>{refreshToken}
    
    AuthAPI->>TokenService: validateRefreshToken(token)
    TokenService->>DB: Find token in refresh_tokens
    DB-->>TokenService: Token document
    
    alt Token not found
        TokenService-->>AuthAPI: Invalid token error
        AuthAPI-->>Client: 401 Unauthorized
        Client->>Client: Clear tokens
        Client->>Client: Redirect to login
    else Token found
        TokenService->>TokenService: Verify JWT signature
        TokenService->>TokenService: Check expiry
        TokenService->>TokenService: Check isRevoked
        
        alt Token invalid/expired/revoked
            TokenService-->>AuthAPI: Token error
            AuthAPI-->>Client: 401 Unauthorized
            Client->>Client: Redirect to login
        else Token valid
            TokenService->>UserModel: findById(userId)
            UserModel->>DB: Query users
            DB-->>UserModel: User document
            UserModel-->>TokenService: User data
            
            alt User inactive
                TokenService-->>AuthAPI: Account inactive
                AuthAPI-->>Client: 403 Forbidden
                Client->>Client: Redirect to login
            else User active
                TokenService->>TokenService: Generate new access token
                TokenService->>TokenService: Generate new refresh token
                TokenService->>TokenService: Hash new refresh token
                TokenService->>DB: Update old token (isRevoked=true)
                DB-->>TokenService: Updated
                TokenService->>DB: Insert new refresh token
                DB-->>TokenService: Inserted
                TokenService-->>AuthAPI: New tokens
                AuthAPI-->>Client: 200 OK {accessToken, refreshToken}
                Client->>Client: Update stored tokens
                Client->>Client: Continue with new token
            end
        end
    end
```

---

## 4. User Logout Flow

### 4.1 Logout Process

```mermaid
flowchart TD
    Start([User Clicks Logout]) --> ConfirmLogout{Confirm<br/>Logout?}
    
    ConfirmLogout -->|Cancel| End1([Cancel - Stay Logged In])
    
    ConfirmLogout -->|Confirm| SendRequest["POST /api/v1/auth/logout<br/>{refreshToken}"]
    SendRequest --> ValidateToken{Has Refresh<br/>Token?}
    
    ValidateToken -->|No| ClearClient[Clear Tokens from Client]
    
    ValidateToken -->|Yes| FindToken[Find Token in Database]
    FindToken --> TokenFound{Token<br/>Found?}
    
    TokenFound -->|No| ClearClient
    
    TokenFound -->|Yes| RevokeToken[Set isRevoked = true]
    RevokeToken --> DeleteToken[Delete Token from DB]
    DeleteToken --> Return200[200 Success Response]
    Return200 --> ClearClient
    
    ClearClient --> ClearSession[Clear Session Data]
    ClearSession --> RedirectLogin[Redirect to Login Page]
    RedirectLogin --> End2([Logout Complete])

    style Start fill:#FF9800,stroke:#E65100,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 4.2 Logout Sequence

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant AuthAPI as AUTH API
    participant TokenService as Token Service
    participant DB as MongoDB

    User->>Client: Click Logout
    Client->>Client: Get stored refresh token
    Client->>AuthAPI: POST /api/v1/auth/logout<br/>{refreshToken}
    
    AuthAPI->>TokenService: revokeToken(refreshToken)
    TokenService->>DB: Find token in refresh_tokens
    DB-->>TokenService: Token document
    
    alt Token found
        TokenService->>DB: Delete token
        DB-->>TokenService: Deleted
    end
    
    TokenService-->>AuthAPI: Success
    AuthAPI-->>Client: 200 OK
    Client->>Client: Clear access token
    Client->>Client: Clear refresh token
    Client->>Client: Clear user data
    Client->>Client: Clear session storage
    Client->>Client: Redirect to login
    Client-->>User: Show login page
```

---

## 5. Token Verification Flow (Inter-Service)

### 5.1 Token Verification for Other Services

```mermaid
flowchart TD
    Start([Other Service Receives Request]) --> ExtractToken[Extract Bearer Token from Header]
    ExtractToken --> HasToken{Token<br/>Present?}
    
    HasToken -->|No| Return401A[401 Unauthorized]
    Return401A --> End1([Request Rejected])
    
    HasToken -->|Yes| CallAuthService["POST /api/v1/auth/verify<br/>{token}"]
    CallAuthService --> VerifySignature{Verify JWT<br/>Signature}
    
    VerifySignature -->|Invalid| Return401B[401 Invalid Token]
    Return401B --> End1
    
    VerifySignature -->|Valid| CheckExpiry{Token<br/>Expired?}
    
    CheckExpiry -->|Yes| Return401C[401 Token Expired]
    Return401C --> End1
    
    CheckExpiry -->|No| DecodeToken[Decode Token Payload]
    DecodeToken --> ExtractUserId[Extract userId from Payload]
    ExtractUserId --> LoadUser[Load User from Database]
    LoadUser --> UserExists{User<br/>Exists?}
    
    UserExists -->|No| Return401D[401 User Not Found]
    Return401D --> End1
    
    UserExists -->|Yes| CheckActive{User<br/>Active?}
    
    CheckActive -->|No| Return403[403 Account Inactive]
    Return403 --> End1
    
    CheckActive -->|Yes| LoadRole[Load User Role & Permissions]
    LoadRole --> Return200["200 Token Valid<br/>{userId, role, permissions}"]
    Return200 --> CheckPermission{Has Required<br/>Permission?}
    
    CheckPermission -->|No| Return403B[403 Insufficient Permissions]
    Return403B --> End1
    
    CheckPermission -->|Yes| ProcessRequest[Process Original Request]
    ProcessRequest --> End2([Request Processed])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End1 fill:#F44336,stroke:#C62828,color:#fff
```

### 5.2 Inter-Service Token Verification Sequence

```mermaid
sequenceDiagram
    participant Client
    participant PMS as PMS Service
    participant AuthAPI as AUTH Service
    participant DB as MongoDB

    Client->>PMS: GET /api/v1/products<br/>Authorization: Bearer token
    PMS->>PMS: Extract token from header
    
    PMS->>AuthAPI: POST /api/v1/auth/verify<br/>with token
    AuthAPI->>AuthAPI: Verify JWT signature
    AuthAPI->>AuthAPI: Check token expiry
    
    alt Token invalid or expired
        AuthAPI-->>PMS: 401 Unauthorized
        PMS-->>Client: 401 Unauthorized
    else Token valid
        AuthAPI->>AuthAPI: Decode token payload
        AuthAPI->>DB: Find user by ID
        DB-->>AuthAPI: User document
        
        alt User not found or inactive
            AuthAPI-->>PMS: 401/403 Error
            PMS-->>Client: 401/403 Error
        else User valid
            AuthAPI->>DB: Load role & permissions
            DB-->>AuthAPI: Role data
            AuthAPI-->>PMS: 200 OK {userId, role, permissions}
            
            PMS->>PMS: Check permissions for action
            alt Insufficient permissions
                PMS-->>Client: 403 Forbidden
            else Has permission
                PMS->>PMS: Process request
                PMS-->>Client: 200 OK {data}
            end
        end
    end
```

---

## 6. Password Reset Flow

### 6.1 Forgot Password Flow

```mermaid
flowchart TD
    Start([User Clicks Forgot Password]) --> EnterEmail[Enter Email Address]
    EnterEmail --> SubmitEmail[Click Submit]
    SubmitEmail --> ValidateEmail{Valid Email<br/>Format?}
    
    ValidateEmail -->|No| ShowError[Show Validation Error]
    ShowError --> EnterEmail
    
    ValidateEmail -->|Yes| SendRequest[POST /api/v1/auth/forgot-password]
    SendRequest --> FindUser[Query User by Email]
    FindUser --> UserExists{User<br/>Exists?}
    
    UserExists -->|No| GenericResponse[Generic Success Response]
    UserExists -->|Yes| GenResetToken[Generate Reset Token]
    
    GenResetToken --> SaveToken[Save Token with 1hr Expiry]
    SaveToken --> SendEmail[Send Reset Link via Email]
    SendEmail --> GenericResponse
    
    GenericResponse --> ShowMessage[Show: Check Your Email]
    ShowMessage --> End1([End])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End1 fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 6.2 Reset Password Flow

```mermaid
flowchart TD
    Start([User Clicks Reset Link]) --> ExtractToken[Extract Token from URL]
    ExtractToken --> LoadPage[Load Reset Password Page]
    LoadPage --> EnterPassword[Enter New Password Twice]
    EnterPassword --> Submit[Click Submit]
    Submit --> ValidateInput{Passwords Match?<br/>Meet Requirements?}
    
    ValidateInput -->|No| ShowError[Show Validation Errors]
    ShowError --> EnterPassword
    
    ValidateInput -->|Yes| SendRequest["POST /api/v1/auth/reset-password<br/>{resetToken, newPassword}"]
    SendRequest --> FindToken[Find Reset Token in DB]
    FindToken --> TokenValid{Token Valid<br/>& Not Expired?}
    
    TokenValid -->|No| Return401[401 Invalid/Expired Token]
    Return401 --> ShowTokenError[Show: Link Expired]
    ShowTokenError --> End1([Request New Link])
    
    TokenValid -->|Yes| LoadUser[Load User by Token]
    LoadUser --> HashPassword[Hash New Password]
    HashPassword --> UpdatePassword[Update User Password]
    UpdatePassword --> DeleteToken[Delete Reset Token]
    DeleteToken --> RevokeAllTokens[Revoke All Refresh Tokens]
    RevokeAllTokens --> Return200[200 Success Response]
    Return200 --> ShowSuccess[Show: Password Reset Successful]
    ShowSuccess --> RedirectLogin[Redirect to Login]
    RedirectLogin --> End2([Login with New Password])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End1 fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 7. Change Password Flow (Authenticated)

### 7.1 Change Password Process

```mermaid
flowchart TD
    Start([User in Profile Settings]) --> ClickChange[Click Change Password]
    ClickChange --> ShowForm[Show Change Password Form]
    ShowForm --> EnterPasswords[Enter Current & New Passwords]
    EnterPasswords --> Submit[Click Submit]
    Submit --> ValidateInput{Client-Side<br/>Validation}
    
    ValidateInput -->|Invalid| ShowClientError[Show Validation Errors]
    ShowClientError --> EnterPasswords
    
    ValidateInput -->|Valid| SendRequest[POST /api/v1/profile/change-password]
    SendRequest --> VerifyAuth{Valid Access<br/>Token?}
    
    VerifyAuth -->|No| Return401[401 Unauthorized]
    Return401 --> RedirectLogin[Redirect to Login]
    RedirectLogin --> End1([End])
    
    VerifyAuth -->|Yes| LoadUser[Load Current User]
    LoadUser --> VerifyCurrent{Verify Current<br/>Password?}
    
    VerifyCurrent -->|Invalid| Return400A[400 Incorrect Password]
    Return400A --> ShowError1[Show: Current Password Incorrect]
    ShowError1 --> EnterPasswords
    
    VerifyCurrent -->|Valid| CheckMatch{New Passwords<br/>Match?}
    
    CheckMatch -->|No| Return400B[400 Passwords Mismatch]
    Return400B --> ShowError2[Show: Passwords Don't Match]
    ShowError2 --> EnterPasswords
    
    CheckMatch -->|Yes| CheckComplexity{Password<br/>Complexity OK?}
    
    CheckComplexity -->|No| Return400C[400 Weak Password]
    Return400C --> ShowError3[Show: Complexity Requirements]
    ShowError3 --> EnterPasswords
    
    CheckComplexity -->|Yes| HashPassword[Hash New Password]
    HashPassword --> UpdatePassword[Update User Password]
    UpdatePassword --> RevokeTokens[Revoke All Refresh Tokens]
    RevokeTokens --> Return200[200 Success Response]
    Return200 --> ShowSuccess[Show: Password Changed Successfully]
    ShowSuccess --> ClearSession[Clear Current Session]
    ClearSession --> RedirectLogin2[Redirect to Login]
    RedirectLogin2 --> End2([Login with New Password])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 8. User Creation Flow (Admin)

### 8.1 Create User Process

```mermaid
flowchart TD
    Start([Admin Navigates to Users]) --> ClickCreate[Click Create User]
    ClickCreate --> ShowForm[Show User Creation Form]
    ShowForm --> FillForm[Fill User Details & Select Role]
    FillForm --> Submit[Click Save]
    Submit --> ValidateInput{Client-Side<br/>Validation}
    
    ValidateInput -->|Invalid| ShowErrors[Show Validation Errors]
    ShowErrors --> FillForm
    
    ValidateInput -->|Valid| SendRequest["POST /api/v1/users"]
    SendRequest --> CheckAuth{Verify Admin<br/>Token?}
    
    CheckAuth -->|Invalid| Return401[401 Unauthorized]
    Return401 --> End1([End])
    
    CheckAuth -->|Valid| CheckPermission{Has users.create<br/>Permission?}
    
    CheckPermission -->|No| Return403[403 Forbidden]
    Return403 --> ShowPermError[Show: Insufficient Permissions]
    ShowPermError --> End1
    
    CheckPermission -->|Yes| ValidateServer{Server-Side<br/>Validation}
    
    ValidateServer -->|Invalid| Return400[400 Validation Error]
    Return400 --> ShowServerErrors[Show Validation Errors]
    ShowServerErrors --> FillForm
    
    ValidateServer -->|Valid| CheckEmailUnique{Email<br/>Unique?}
    
    CheckEmailUnique -->|No| Return409[409 Email Exists]
    Return409 --> ShowDuplicateError[Show: Email Already Exists]
    ShowDuplicateError --> FillForm
    
    CheckEmailUnique -->|Yes| CheckRole{Role<br/>Exists?}
    
    CheckRole -->|No| Return400B[400 Invalid Role]
    Return400B --> ShowRoleError[Show: Invalid Role Selected]
    ShowRoleError --> FillForm
    
    CheckRole -->|Yes| GenPassword[Generate Temporary Password]
    GenPassword --> HashPassword[Hash Password]
    HashPassword --> CreateUser[Create User in Database]
    CreateUser --> LogAudit[Log Creation in Audit Trail]
    LogAudit --> Return201["201 Created<br/>{user, temporaryPassword}"]
    Return201 --> ShowSuccess["Show Success Message<br/>& Display Temp Password"]
    ShowSuccess --> RefreshList[Refresh Users List]
    RefreshList --> End2([User Created])

    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End1 fill:#F44336,stroke:#C62828,color:#fff
```

---

## 9. Role-Based Access Control (RBAC) Flow

### 9.1 Permission Check Flow

```mermaid
flowchart TD
    Start([User Performs Action]) --> ExtractToken[Extract Access Token]
    ExtractToken --> DecodeToken[Decode JWT Token]
    DecodeToken --> GetUserId[Get userId from Token]
    GetUserId --> LoadUser[Load User from Database]
    LoadUser --> LoadRole[Load User's Role]
    LoadRole --> GetPermissions[Get Role Permissions Array]
    GetPermissions --> CheckAction{Check Required<br/>Permission}
    
    CheckAction --> HasWildcard{Has '*'<br/>Permission?}
    
    HasWildcard -->|Yes - Super Admin| AllowAction[Allow Action]
    AllowAction --> End1([Action Executed])
    
    HasWildcard -->|No| CheckSpecific{Has Specific<br/>Permission?}
    
    CheckSpecific -->|Yes| AllowAction
    
    CheckSpecific -->|No| DenyAction[Deny Action]
    DenyAction --> Return403[403 Forbidden]
    Return403 --> ShowError[Show: Insufficient Permissions]
    ShowError --> End2([Action Denied])

    style End1 fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End2 fill:#F44336,stroke:#C62828,color:#fff
```

### 9.2 Permission Matrix Flow

```mermaid
graph TB
    subgraph "Permission Hierarchy"
        SuperAdmin[Super Admin<br/>Permissions: *] --> AllModules[All Modules<br/>All Actions]
        
        WM[Warehouse Manager] --> WMPerms[warehouses.read<br/>inventory.read<br/>inventory.update]
        
        IM[Inventory Manager] --> IMPerms[inventory.*<br/>products.read<br/>warehouses.read]
        
        PO[Procurement Officer] --> POPerms[suppliers.*<br/>products.read<br/>inventory.read]
        
        WS[Warehouse Staff] --> WSPerms[inventory.read<br/>inventory.update<br/>products.read]
        
        PM[Product Manager] --> PMPerms[products.*<br/>categories.*]
        
        AV[Auditor/Viewer] --> AVPerms[*.read<br/>reports.read<br/>reports.export]
    end
    
    style SuperAdmin fill:#F44336,stroke:#C62828,color:#fff
    style WM fill:#2196F3,stroke:#1565C0,color:#fff
    style IM fill:#4CAF50,stroke:#2E7D32,color:#fff
    style PO fill:#FF9800,stroke:#E65100,color:#fff
    style WS fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style PM fill:#00BCD4,stroke:#00838F,color:#fff
    style AV fill:#607D8B,stroke:#37474F,color:#fff
```

---

## 10. Session Management Flow

### 10.1 Multi-Device Session Handling

```mermaid
flowchart TD
    Start([User Logs In]) --> GenTokens[Generate Access & Refresh Tokens]
    GenTokens --> CaptureDevice[Capture Device Info<br/>IP Address, User Agent]
    CaptureDevice --> SaveToken[Save Refresh Token with Device Info]
    SaveToken --> CheckExisting{User Has<br/>Existing Sessions?}
    
    CheckExisting -->|No| FirstSession[First Session]
    FirstSession --> End1([Session Created])
    
    CheckExisting -->|Yes| CountSessions[Count Active Sessions]
    CountSessions --> CheckLimit{Sessions > 5?}
    
    CheckLimit -->|Yes| RevokeOldest[Revoke Oldest Session]
    RevokeOldest --> CreateNew[Create New Session]
    CreateNew --> End1
    
    CheckLimit -->|No| CreateNew

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style End1 fill:#4CAF50,stroke:#2E7D32,color:#fff
```

### 10.2 Session Timeline

```mermaid
gantt
    title User Session Lifecycle
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Session
    User Login              :milestone, m1, 10:00, 0m
    Access Token Valid      :active, a1, 10:00, 15m
    Access Token Expires    :milestone, m2, 10:15, 0m
    Token Auto-Refresh      :crit, r1, 10:15, 1m
    New Access Token Valid  :active, a2, 10:16, 15m
    User Logout             :milestone, m3, 10:31, 0m
    
    section Token Lifecycle
    Refresh Token Valid     :done, rt1, 10:00, 31m
    Refresh Token Rotated   :crit, rt2, 10:15, 1m
    New Refresh Token Valid :done, rt3, 10:16, 15m
    All Tokens Revoked      :milestone, m4, 10:31, 0m
```

---

## 11. Error Handling Flow

### 11.1 Centralized Error Handling

```mermaid
flowchart TD
    Start([Error Occurs]) --> ErrorType{Error<br/>Type?}
    
    ErrorType -->|Validation Error| ValidationHandler[Validation Error Handler]
    ValidationHandler --> Format400[Format 400 Response<br/>with Field Errors]
    Format400 --> LogError[Log Error Details]
    LogError --> SendResponse[Send Error Response]
    
    ErrorType -->|Authentication Error| AuthHandler[Auth Error Handler]
    AuthHandler --> Format401[Format 401/403 Response]
    Format401 --> LogError
    
    ErrorType -->|Database Error| DBHandler[Database Error Handler]
    DBHandler --> CheckDuplicate{Duplicate Key?}
    CheckDuplicate -->|Yes| Format409[Format 409 Conflict]
    CheckDuplicate -->|No| Format500[Format 500 Server Error]
    Format409 --> LogError
    Format500 --> LogError
    
    ErrorType -->|JWT Error| JWTHandler[JWT Error Handler]
    JWTHandler --> CheckJWTType{JWT Error<br/>Type?}
    CheckJWTType -->|Expired| Format401Expired[401 Token Expired]
    CheckJWTType -->|Invalid| Format401Invalid[401 Invalid Token]
    CheckJWTType -->|Malformed| Format400Malformed[400 Malformed Token]
    Format401Expired --> LogError
    Format401Invalid --> LogError
    Format400Malformed --> LogError
    
    ErrorType -->|Unknown Error| UnknownHandler[Unknown Error Handler]
    UnknownHandler --> Format500B[Format 500 Response]
    Format500B --> LogError
    
    SendResponse --> End1([Response Sent])
    
    style Start fill:#F44336,stroke:#C62828,color:#fff
    style End1 fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 12. Audit Trail Flow

### 12.1 Audit Logging Process

```mermaid
flowchart TD
    Start([User Action Occurs]) --> CaptureAction[Capture Action Details]
    CaptureAction --> GetContext[Get Request Context<br/>userId, IP, timestamp]
    GetContext --> DetermineEvent{Action<br/>Type?}
    
    DetermineEvent -->|User Created| LogUserCreate[Log: USER_CREATED]
    DetermineEvent -->|User Updated| LogUserUpdate[Log: USER_UPDATED]
    DetermineEvent -->|User Deleted| LogUserDelete[Log: USER_DELETED]
    DetermineEvent -->|Login Success| LogLogin[Log: LOGIN_SUCCESS]
    DetermineEvent -->|Login Failed| LogLoginFail[Log: LOGIN_FAILED]
    DetermineEvent -->|Password Changed| LogPassChange[Log: PASSWORD_CHANGED]
    DetermineEvent -->|Role Changed| LogRoleChange[Log: ROLE_CHANGED]
    
    LogUserCreate --> FormatLog[Format Audit Log Entry]
    LogUserUpdate --> FormatLog
    LogUserDelete --> FormatLog
    LogLogin --> FormatLog
    LogLoginFail --> FormatLog
    LogPassChange --> FormatLog
    LogRoleChange --> FormatLog
    
    FormatLog --> SaveLog[Save to Audit Collection/File]
    SaveLog --> End1([Audit Logged])
    
    style Start fill:#2196F3,stroke:#1565C0,color:#fff
    style End1 fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 13. Complete Authentication Architecture

### 13.1 End-to-End System Flow

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application]
        MobileApp[Mobile Application]
    end
    
    subgraph "Authentication Service"
        LoginAPI[Login API]
        RefreshAPI[Refresh API]
        VerifyAPI[Verify API]
        LogoutAPI[Logout API]
        ProfileAPI[Profile API]
    end
    
    subgraph "Middleware Layer"
        RateLimit[Rate Limiter]
        Validator[Input Validator]
        AuthMW[Auth Middleware]
        ErrorMW[Error Handler]
    end
    
    subgraph "Business Logic"
        AuthService[Auth Service]
        UserService[User Service]
        TokenService[Token Service]
        RoleService[Role Service]
    end
    
    subgraph "Data Layer"
        UserModel[User Model]
        RoleModel[Role Model]
        TokenModel[Token Model]
    end
    
    subgraph "Database"
        MongoDB[(MongoDB<br/>auth_db)]
    end
    
    WebApp --> LoginAPI
    MobileApp --> LoginAPI
    WebApp --> RefreshAPI
    MobileApp --> RefreshAPI
    
    LoginAPI --> RateLimit
    RefreshAPI --> Validator
    VerifyAPI --> Validator
    LogoutAPI --> AuthMW
    ProfileAPI --> AuthMW
    
    RateLimit --> Validator
    Validator --> AuthService
    AuthMW --> UserService
    
    AuthService --> TokenService
    AuthService --> UserService
    UserService --> RoleService
    
    TokenService --> TokenModel
    UserService --> UserModel
    RoleService --> RoleModel
    
    UserModel --> MongoDB
    RoleModel --> MongoDB
    TokenModel --> MongoDB
    
    ErrorMW -.-> LoginAPI
    ErrorMW -.-> RefreshAPI
    
    style WebApp fill:#2196F3,stroke:#1565C0,color:#fff
    style MobileApp fill:#2196F3,stroke:#1565C0,color:#fff
    style MongoDB fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## Document End
**Previous Document**: [5-DB-Schema-Collections.md](./5-DB-Schema-Collections.md)  
**Module Progress**: AUTH Documentation (6/6 documents)  
**Overall Progress**: 6/30 documents (20.0%)

---

## Summary

This completes the comprehensive documentation for the **AUTH Service**. All 6 documents have been created:

1. ✅ Architecture Diagram
2. ✅ ER Diagram
3. ✅ User Stories & Use Cases
4. ✅ API Endpoint Specifications
5. ✅ Database Schema & Collections
6. ✅ Authentication Flow Diagrams

The AUTH module documentation is now complete and ready for development team implementation.
