# WLAN AUTH Service

JWT-based Authentication & User Management Service for WLAN Corporation's Warehouse & Inventory Management System.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 📋 Overview

The WLAN AUTH service is a production-ready Node.js microservice providing comprehensive authentication, authorization, and user management. It serves as the central authentication hub for all WLAN Corporation microservices (PMS, SMS, WMS, IMS).

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication** - Access tokens (15min) & refresh tokens (7 days) with rotation
- **RBAC** - Fine-grained permission system with wildcard support
- **Password Security** - bcrypt hashing with complexity requirements
- **Rate Limiting** - 5 req/15min for auth, 100 req/min general
- **Token Revocation** - Immediate logout capability

### 👥 User Management
- **CRUD Operations** - Create, read, update, delete users
- **Advanced Search** - Filter by name/email/role/status
- **Pagination** - Configurable (default: 10, max: 100)
- **Audit Trail** - Track createdBy/updatedBy with timestamps

### 🎭 Role Management
- **Custom Roles** - Unlimited roles with specific permissions
- **7 Pre-configured Roles** - Super Admin, Warehouse Manager, Inventory Manager, Procurement Officer, Warehouse Staff, Product Manager, Auditor/Viewer
- **20+ Permissions** - Granular access control

### 👤 Profile Management
- **Self-Service** - Update name, phone, password
- **Image Upload** - JPG/PNG, 2MB max, auto cleanup
- **Email Notifications** - Profile updates, password changes

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | 22.x |
| Framework | Express.js | 4.x |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.x |
| Auth | jsonwebtoken | Latest |
| Password | bcryptjs | 2.x |
| Validation | Joi | 17.x |
| Email | Nodemailer | 6.x |
| Docs | Swagger UI | 5.x |

## 📦 Prerequisites

- **Node.js** >= 22.0.0
- **MongoDB** >= 7.0
- **npm** >= 9.0.0
- **Docker** (optional)

## 🚀 Quick Start

### Docker Deployment (Recommended)

```bash
# 1. Clone and setup
git clone <repo-url>
cd AUTH
cp .env.example .env

# 2. Update .env with your credentials

# 3. Start services
docker-compose up -d

# 4. Seed database
docker exec -it auth-service npm run seed

# 5. Access API docs
# http://localhost:5001/api-docs
```

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB
docker run -d -p 27017:27017 --name auth-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0

# 3. Setup environment
cp .env.example .env
# Edit .env with your config

# 4. Seed database
npm run seed

# 5. Start server
npm run dev

# 6. Access API docs
# http://localhost:5001/api-docs
```

## 📚 API Documentation

### Interactive Documentation
**Swagger UI**: http://localhost:5001/api-docs

### Endpoints

#### Health
- `GET /health` - Simple health check
- `GET /health-in-detail` - Detailed health with DB stats

#### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/verify` - Verify token

#### Users (RBAC)
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PATCH /api/v1/users/:id/change-password` - Change password
- `PATCH /api/v1/users/:id/toggle-status` - Toggle status

#### Profile
- `GET /api/v1/profile` - Get profile
- `PUT /api/v1/profile` - Update profile
- `POST /api/v1/profile/upload-image` - Upload image
- `DELETE /api/v1/profile/delete-image` - Delete image

#### Roles (Admin)
- `POST /api/v1/roles` - Create role
- `GET /api/v1/roles` - List roles
- `GET /api/v1/roles/:id` - Get role
- `PUT /api/v1/roles/:id` - Update role
- `PATCH /api/v1/roles/:id/toggle-status` - Toggle status
- `DELETE /api/v1/roles/:id` - Delete role

### Authentication
```
Authorization: Bearer <access_token>
```

## ⚙️ Environment Configuration

See `.env.example` for all variables. Key configs:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/auth_db?authSource=admin

# JWT (CHANGE IN PRODUCTION!)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Email (Gmail App Password)
EMAIL_ENABLED=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Gmail App Password
1. Google Account → Security → 2-Step Verification
2. App Passwords → Generate for "Mail"
3. Copy to `EMAIL_PASSWORD`

## 🗄 Database Schema

### Users
```javascript
{
  firstName, lastName, email (unique),
  password (bcrypt), phone, roleId,
  isActive, profileImage, lastLogin,
  createdBy, updatedBy, timestamps
}
```

### Roles
```javascript
{
  roleName (unique), description,
  permissions[], isActive,
  createdBy, updatedBy, timestamps
}
```

### RefreshTokens
```javascript
{
  userId, token (unique, hashed),
  expiresAt, isRevoked,
  ipAddress, userAgent, createdAt
}
```

### Pre-seeded Data
- **7 Roles**: Super Admin, Warehouse Manager, etc.
- **Admin**: jtdhamodharan@gmail.com / NewPass123!@#

## 🔒 Security

### Password Requirements
- Min 8 chars, 1 upper, 1 lower, 1 number, 1 special

### Token Management
- Access: 15min expiry
- Refresh: 7 days, rotated on refresh
- Revocation on logout

### Rate Limiting
- Auth: 5 req/15min
- General: 100 req/min

## 🧪 Testing

### cURL
```bash
# Login
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jtdhamodharan@gmail.com","password":"NewPass123!@#"}'
```

### PowerShell
```powershell
$r = Invoke-RestMethod -Uri "http://localhost:5001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"jtdhamodharan@gmail.com","password":"NewPass123!@#"}'
$token = $r.data.tokens.accessToken
```

## 🚀 Deployment

### Docker Production
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Checklist
- [ ] Change JWT secrets (32+ chars)
- [ ] Update MongoDB credentials
- [ ] Configure Gmail app password
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Configure CORS origins
- [ ] Set LOG_LEVEL=INFO
- [ ] Update admin password
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS

## 📊 Monitoring

```bash
# Health check
curl http://localhost:5001/health

# Detailed health
curl http://localhost:5001/health-in-detail

# Docker logs
docker-compose logs -f auth-service
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

ISC License - see [LICENSE](LICENSE)

---

**Made with ❤️ by WLAN Corporation**
