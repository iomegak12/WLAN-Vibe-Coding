# JWT Token Verification - Integration Guide

## Overview
This document provides comprehensive details for integrating JWT token verification with the WLAN AUTH Service. This endpoint is designed for **microservice-to-microservice** authentication and **frontend authentication state management**.

---

## Endpoint Details

### **Verify JWT Access Token**

**Endpoint:** `GET /api/v1/auth/verify`

**Base URL:** 
- **Development:** `http://localhost:5001`
- **Docker:** `http://auth-service:5001`
- **Production:** `https://auth.wlan-corp.com` *(update as needed)*

**Full URL:** `{BASE_URL}/api/v1/auth/verify`

**Method:** `GET`

**Authentication:** Required (Bearer Token)

**Rate Limit:** 100 requests per minute (general rate limit)

**Purpose:** Validates the JWT access token and returns authenticated user information with role and permissions.

---

## Request Structure

### Headers (Required)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | **Yes** | JWT access token in Bearer format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `Content-Type` | String | **Yes** | Must be `application/json` |

### Request Body

**No request body required** - This is a GET request.

### cURL Example

```bash
curl -X GET http://localhost:5001/api/v1/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzc5YjJhMWYzZTRhNTAwMTJkZjM0NTYiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNzM2MTQwMDAwLCJleHAiOjE3MzYxNDA5MDB9.example_signature" \
  -H "Content-Type: application/json"
```

---

## Response Structure

### ✅ Success Response (200 OK)

**HTTP Status Code:** `200`

**Response Body:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "_id": "6779b2a1f3e4a50012df3456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "profileImage": "uploads/profiles/1736140000123-avatar.jpg",
      "role": {
        "_id": "6779b1a0f3e4a50012df3450",
        "roleName": "Manager",
        "permissions": [
          "USERS_READ",
          "USERS_CREATE",
          "USERS_UPDATE",
          "ROLES_READ"
        ],
        "isActive": true,
        "createdAt": "2026-01-05T10:30:00.000Z",
        "updatedAt": "2026-01-05T10:30:00.000Z"
      },
      "isActive": true,
      "createdAt": "2026-01-05T11:00:00.000Z",
      "updatedAt": "2026-01-08T14:30:00.000Z"
    }
  },
  "message": "Token is valid"
}
```

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Always `true` for successful requests |
| `data.valid` | Boolean | Token validation status (always `true` if request succeeds) |
| `data.user._id` | String | User's unique identifier (MongoDB ObjectId) |
| `data.user.firstName` | String | User's first name |
| `data.user.lastName` | String | User's last name |
| `data.user.email` | String | User's email address |
| `data.user.phone` | String | User's phone number (E.164 format) |
| `data.user.profileImage` | String/Null | Relative path to profile image or `null` |
| `data.user.role` | Object | Complete role object with permissions |
| `data.user.role._id` | String | Role's unique identifier |
| `data.user.role.roleName` | String | Role name (e.g., "Admin", "Manager", "User") |
| `data.user.role.permissions` | Array[String] | List of permission strings |
| `data.user.role.isActive` | Boolean | Role active status |
| `data.user.isActive` | Boolean | User active status |
| `data.user.createdAt` | String (ISO 8601) | User creation timestamp |
| `data.user.updatedAt` | String (ISO 8601) | User last update timestamp |
| `message` | String | Success message |

---

## Error Responses

### ❌ 401 Unauthorized - Missing Token

**Scenario:** No `Authorization` header provided

**HTTP Status Code:** `401`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

### ❌ 401 Unauthorized - Invalid Token Format

**Scenario:** Token is not in Bearer format or malformed

**HTTP Status Code:** `401`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token format",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

### ❌ 401 Unauthorized - Expired Token

**Scenario:** Access token has expired (15 minutes lifetime)

**HTTP Status Code:** `401`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

**Action Required:** Frontend/Client should use the refresh token to obtain a new access token via `POST /api/v1/auth/refresh`

---

### ❌ 401 Unauthorized - Invalid Signature

**Scenario:** Token signature verification failed (tampered token)

**HTTP Status Code:** `401`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

### ❌ 404 Not Found - User Not Found

**Scenario:** Token is valid, but the user no longer exists in the database

**HTTP Status Code:** `404`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

### ❌ 403 Forbidden - Inactive User

**Scenario:** User account has been deactivated

**HTTP Status Code:** `403`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "User account is inactive",
    "details": null
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

### ❌ 429 Too Many Requests

**Scenario:** Rate limit exceeded (100 requests per minute)

**HTTP Status Code:** `429`

**Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  },
  "timestamp": "2026-01-08T13:45:30.123Z"
}
```

---

## Integration Examples

### JavaScript/Node.js (Axios)

```javascript
const axios = require('axios');

async function verifyToken(accessToken) {
  try {
    const response = await axios.get('http://localhost:5001/api/v1/auth/verify', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      const user = response.data.data.user;
      console.log('Token is valid for user:', user.email);
      console.log('User permissions:', user.role.permissions);
      return user;
    }
  } catch (error) {
    if (error.response) {
      // Handle specific error codes
      const errorCode = error.response.data.error?.code;
      
      switch (errorCode) {
        case 'TOKEN_EXPIRED':
          console.log('Token expired, refresh required');
          // Implement token refresh logic
          break;
        case 'UNAUTHORIZED':
          console.log('Invalid token, redirect to login');
          // Redirect to login page
          break;
        case 'FORBIDDEN':
          console.log('User account is inactive');
          break;
        default:
          console.error('Verification failed:', error.response.data.error.message);
      }
    } else {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}
```

---

### JavaScript/Frontend (Fetch API)

```javascript
async function verifyToken(accessToken) {
  try {
    const response = await fetch('http://localhost:5001/api/v1/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const user = data.data.user;
      console.log('Authenticated user:', user);
      return user;
    } else {
      // Handle error
      console.error('Verification failed:', data.error.message);
      
      // Check if token expired
      if (data.error.code === 'TOKEN_EXPIRED') {
        // Trigger token refresh
        await refreshAccessToken();
      }
      
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}
```

---

### Python (Requests)

```python
import requests

def verify_token(access_token):
    url = "http://localhost:5001/api/v1/auth/verify"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            user = data['data']['user']
            print(f"Token is valid for user: {user['email']}")
            print(f"User permissions: {user['role']['permissions']}")
            return user
        else:
            error_code = data['error']['code']
            error_message = data['error']['message']
            
            if error_code == 'TOKEN_EXPIRED':
                print("Token expired, refresh required")
                # Implement refresh logic
            elif error_code == 'UNAUTHORIZED':
                print("Invalid token, redirect to login")
            else:
                print(f"Verification failed: {error_message}")
            
            raise Exception(error_message)
            
    except requests.exceptions.RequestException as e:
        print(f"Network error: {str(e)}")
        raise
```

---

### C# (.NET)

```csharp
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

public class AuthService
{
    private readonly HttpClient _httpClient;
    
    public AuthService()
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri("http://localhost:5001")
        };
    }
    
    public async Task<User> VerifyToken(string accessToken)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", accessToken);
            
            var response = await _httpClient.GetAsync("/api/v1/auth/verify");
            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<VerifyResponse>(content);
            
            if (response.IsSuccessStatusCode && data.Success)
            {
                Console.WriteLine($"Token is valid for user: {data.Data.User.Email}");
                return data.Data.User;
            }
            else
            {
                var errorCode = data.Error?.Code;
                
                if (errorCode == "TOKEN_EXPIRED")
                {
                    Console.WriteLine("Token expired, refresh required");
                    // Implement refresh logic
                }
                else if (errorCode == "UNAUTHORIZED")
                {
                    Console.WriteLine("Invalid token, redirect to login");
                }
                
                throw new Exception(data.Error?.Message);
            }
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Network error: {ex.Message}");
            throw;
        }
    }
}
```

---

## Microservice Integration Pattern

### API Gateway Pattern

When using this endpoint in a **microservices architecture**, it's recommended to implement token verification at the API Gateway level:

```javascript
// Express.js Middleware Example for PMS/SMS/WMS/IMS Services

const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';

/**
 * Middleware to verify JWT token with AUTH service
 */
const verifyTokenMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with AUTH service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/v1/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      // Attach user info to request object
      req.user = response.data.data.user;
      req.userId = response.data.data.user._id;
      req.userPermissions = response.data.data.user.role.permissions;
      
      next();
    } else {
      return res.status(401).json(response.data);
    }
    
  } catch (error) {
    if (error.response) {
      // Forward AUTH service error response
      return res.status(error.response.status).json(error.response.data);
    } else {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Token verification failed'
        }
      });
    }
  }
};

// Usage in routes
app.get('/api/v1/products', verifyTokenMiddleware, (req, res) => {
  // req.user contains authenticated user info
  console.log('Authenticated user:', req.user.email);
  console.log('User permissions:', req.userPermissions);
  
  // Your business logic here
});
```

---

## Permission Checking

After verifying the token, you can check user permissions for authorization:

```javascript
/**
 * Middleware to check if user has required permission
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.userPermissions || [];
    
    // Check for wildcard permission (admin)
    if (userPermissions.includes('*')) {
      return next();
    }
    
    // Check for specific permission
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      }
    });
  };
};

// Usage
app.post('/api/v1/products', 
  verifyTokenMiddleware, 
  checkPermission('PRODUCTS_CREATE'), 
  createProduct
);
```

---

## Available Permissions

The AUTH service provides the following permissions that can be checked:

| Permission | Description |
|------------|-------------|
| `*` | Wildcard - Full access (Super Admin only) |
| `USERS_CREATE` | Create new users |
| `USERS_READ` | View user information |
| `USERS_UPDATE` | Update user information |
| `USERS_DELETE` | Delete users |
| `ROLES_CREATE` | Create new roles |
| `ROLES_READ` | View roles |
| `ROLES_UPDATE` | Update roles |
| `ROLES_DELETE` | Delete roles |

---

## Best Practices

### 1. **Token Storage**
- **Frontend:** Store access token in memory (React state/Vuex) and refresh token in httpOnly cookie
- **Mobile Apps:** Use secure storage (Keychain for iOS, Keystore for Android)
- **Microservices:** Pass token in Authorization header between services

### 2. **Token Refresh Strategy**
- Access tokens expire in **15 minutes**
- Implement automatic token refresh before expiration
- Use refresh token endpoint: `POST /api/v1/auth/refresh`

### 3. **Error Handling**
- Always check `success` field in response
- Handle `TOKEN_EXPIRED` by refreshing the token
- Redirect to login on `UNAUTHORIZED` errors
- Show appropriate messages for `FORBIDDEN` (inactive account)

### 4. **Caching (Optional)**
For high-traffic microservices, consider caching verification results:
- Cache key: `token_${accessToken_hash}`
- TTL: 5-10 minutes (less than token expiry)
- Invalidate on user/role updates

### 5. **Security**
- Always use HTTPS in production
- Never log or expose tokens in error messages
- Implement request timeout (recommended: 5 seconds)
- Rate limit verification requests per service

---

## Token Refresh Endpoint

When you receive a `TOKEN_EXPIRED` error, use the refresh endpoint:

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  },
  "message": "Token refreshed successfully"
}
```

**Note:** The AUTH service uses **refresh token rotation** - each refresh generates a new refresh token and invalidates the old one.

---

## Testing

### Using Postman

1. **Login First:**
   - POST `http://localhost:5001/api/v1/auth/login`
   - Body: `{"email": "jtdhamodharan@gmail.com", "password": "NewPass123!@#"}`
   - Copy the `accessToken` from response

2. **Verify Token:**
   - GET `http://localhost:5001/api/v1/auth/verify`
   - Header: `Authorization: Bearer <access_token>`

### Using cURL

```bash
# Step 1: Login and get token
TOKEN=$(curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jtdhamodharan@gmail.com","password":"NewPass123!@#"}' \
  | jq -r '.data.accessToken')

# Step 2: Verify token
curl -X GET http://localhost:5001/api/v1/auth/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Contact & Support

For integration issues or questions:
- **Technical Lead:** JT Dhamodharan (jtdhamodharan@gmail.com)
- **Support Email:** support@wlan-corp.com
- **Documentation:** See `/api-docs` for Swagger UI (http://localhost:5001/api-docs)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-08 | Initial release |

---

**Document Version:** 1.0.0  
**Last Updated:** January 8, 2026  
**Service Version:** AUTH Service v1.0.0
