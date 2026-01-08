# AUTH Service - Database Schema & Collections

## Document Information
- **Project**: WLAN Corporation - Warehouse & Inventory Management System
- **Module**: Authentication & User Profile Management (AUTH)
- **Version**: 1.0
- **Date**: January 7, 2026
- **Prepared For**: WLAN Corporation, Bengaluru

---

## 1. Overview

This document provides detailed MongoDB schema definitions for the AUTH service. The AUTH_DB database contains three primary collections: `users`, `refresh_tokens`, and `roles`.

**Database Name**: `auth_db`  
**MongoDB Version**: 6.x or higher  
**Connection String**: `mongodb://localhost:27017/auth_db`

---

## 2. Collection: users

### 2.1 Schema Definition

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  roleId: ObjectId,
  isActive: Boolean,
  profileImage: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

### 2.2 Mongoose Schema

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't return password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^\+?[1-9]\d{9,14}$/,
        'Please provide a valid phone number in international format'
      ],
      default: null
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profileImage: {
      type: String,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ roleId: 1 });
userSchema.index({ isActive: 1, roleId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output (remove __v, transform _id to id)
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
```

### 2.3 Field Specifications

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | Primary key |
| `firstName` | String | Yes | No | - | User's first name (2-50 chars) |
| `lastName` | String | Yes | No | - | User's last name (2-50 chars) |
| `email` | String | Yes | Yes | - | Login email (lowercase, validated) |
| `password` | String | Yes | No | - | Bcrypt hashed password (min 8 chars) |
| `phone` | String | No | No | null | International format phone number |
| `roleId` | ObjectId | Yes | No | - | Reference to roles collection |
| `isActive` | Boolean | Yes | No | true | Account active status |
| `profileImage` | String | No | No | null | URL to profile picture |
| `lastLogin` | Date | No | No | null | Last successful login timestamp |
| `createdAt` | Date | Auto | No | Auto-generated | Record creation timestamp |
| `updatedAt` | Date | Auto | No | Auto-updated | Last modification timestamp |
| `createdBy` | ObjectId | No | No | null | User who created this record |
| `updatedBy` | ObjectId | No | No | null | User who last updated this record |

### 2.4 Sample Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "Ramkumar",
  "lastName": "Singh",
  "email": "ramkumar@wlancorp.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzKq1z6V1n7QHQF9QY5qk8Zc8gJ4S",
  "phone": "+919876543210",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "isActive": true,
  "profileImage": "https://storage.example.com/profiles/ramkumar.jpg",
  "lastLogin": "2026-01-07T10:30:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-07T10:30:00.000Z",
  "createdBy": null,
  "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### 2.5 Indexes

```javascript
// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ roleId: 1 });
db.users.createIndex({ isActive: 1, roleId: 1 });
db.users.createIndex({ firstName: 1, lastName: 1 });
db.users.createIndex({ email: "text", firstName: "text", lastName: "text" });
```

---

## 3. Collection: roles

### 3.1 Schema Definition

```javascript
{
  _id: ObjectId,
  roleName: String,
  description: String,
  permissions: Array[String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

### 3.2 Mongoose Schema

```javascript
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      enum: {
        values: [
          'Super Admin',
          'Warehouse Manager',
          'Inventory Manager',
          'Procurement Officer',
          'Warehouse Staff',
          'Product Manager',
          'Auditor/Viewer'
        ],
        message: '{VALUE} is not a valid role'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    permissions: {
      type: [String],
      required: true,
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

// Indexes
roleSchema.index({ roleName: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });

// Transform output
roleSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Role', roleSchema);
```

### 3.3 Field Specifications

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | Primary key |
| `roleName` | String | Yes | Yes | - | Role name (from enum) |
| `description` | String | No | No | '' | Role description (max 500 chars) |
| `permissions` | Array[String] | Yes | No | [] | List of permission codes |
| `isActive` | Boolean | Yes | No | true | Role active status |
| `createdAt` | Date | Auto | No | Auto-generated | Record creation timestamp |
| `updatedAt` | Date | Auto | No | Auto-updated | Last modification timestamp |
| `createdBy` | ObjectId | No | No | null | User who created this role |
| `updatedBy` | ObjectId | No | No | null | User who last updated this role |

### 3.4 Permission Codes

```javascript
const PERMISSIONS = {
  // User Management
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Role Management
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  
  // Product Management
  PRODUCTS_READ: 'products.read',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  
  // Category Management
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  
  // Supplier Management
  SUPPLIERS_READ: 'suppliers.read',
  SUPPLIERS_CREATE: 'suppliers.create',
  SUPPLIERS_UPDATE: 'suppliers.update',
  SUPPLIERS_DELETE: 'suppliers.delete',
  
  // Warehouse Management
  WAREHOUSES_READ: 'warehouses.read',
  WAREHOUSES_CREATE: 'warehouses.create',
  WAREHOUSES_UPDATE: 'warehouses.update',
  WAREHOUSES_DELETE: 'warehouses.delete',
  
  // Inventory Management
  INVENTORY_READ: 'inventory.read',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Reporting
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export'
};

module.exports = PERMISSIONS;
```

### 3.5 Sample Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "roleName": "Super Admin",
  "description": "Full system access with all permissions",
  "permissions": [
    "users.read", "users.create", "users.update", "users.delete",
    "roles.read", "roles.create", "roles.update", "roles.delete",
    "products.read", "products.create", "products.update", "products.delete",
    "categories.read", "categories.create", "categories.update", "categories.delete",
    "suppliers.read", "suppliers.create", "suppliers.update", "suppliers.delete",
    "warehouses.read", "warehouses.create", "warehouses.update", "warehouses.delete",
    "inventory.read", "inventory.create", "inventory.update", "inventory.delete",
    "reports.read", "reports.export"
  ],
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "createdBy": null,
  "updatedBy": null
}
```

### 3.6 Indexes

```javascript
db.roles.createIndex({ roleName: 1 }, { unique: true });
db.roles.createIndex({ isActive: 1 });
```

---

## 4. Collection: refresh_tokens

### 4.1 Schema Definition

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  token: String,
  expiresAt: Date,
  isRevoked: Boolean,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

### 4.2 Mongoose Schema

```javascript
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required']
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      maxlength: 500,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false, // Manual createdAt handling
    collection: 'refresh_tokens'
  }
);

// Indexes
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Transform output
refreshTokenSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
```

### 4.3 Field Specifications

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | Primary key |
| `userId` | ObjectId | Yes | No | - | Reference to users collection |
| `token` | String | Yes | Yes | - | Hashed refresh token |
| `expiresAt` | Date | Yes | No | - | Token expiration timestamp |
| `isRevoked` | Boolean | Yes | No | false | Token revocation status |
| `ipAddress` | String | No | No | null | IP address from which token was issued |
| `userAgent` | String | No | No | null | Browser/device user agent (max 500 chars) |
| `createdAt` | Date | Auto | No | Auto-generated | Token creation timestamp |

### 4.4 Sample Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "token": "$2a$10$hKkLXwJKJH.kJHKJhkjhKJHkjhKJHKJhkjhKJHKJhkjhKJHKJhkj",
  "expiresAt": "2026-01-14T10:30:00.000Z",
  "isRevoked": false,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "createdAt": "2026-01-07T10:30:00.000Z"
}
```

### 4.5 Indexes

```javascript
db.refresh_tokens.createIndex({ token: 1 }, { unique: true });
db.refresh_tokens.createIndex({ userId: 1 });
db.refresh_tokens.createIndex({ userId: 1, isRevoked: 1 });
db.refresh_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 4.6 TTL (Time-To-Live) Index

The TTL index automatically deletes expired tokens:

```javascript
// MongoDB will automatically delete documents where expiresAt < current time
db.refresh_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 5. Database Seed Data

### 5.1 Seed Roles

```javascript
// seed/roles.js
const roles = [
  {
    roleName: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'roles.read', 'roles.create', 'roles.update', 'roles.delete',
      'products.read', 'products.create', 'products.update', 'products.delete',
      'categories.read', 'categories.create', 'categories.update', 'categories.delete',
      'suppliers.read', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
      'warehouses.read', 'warehouses.create', 'warehouses.update', 'warehouses.delete',
      'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
      'reports.read', 'reports.export'
    ],
    isActive: true
  },
  {
    roleName: 'Warehouse Manager',
    description: 'Manage specific warehouse operations',
    permissions: [
      'warehouses.read',
      'inventory.read', 'inventory.update',
      'products.read',
      'reports.read'
    ],
    isActive: true
  },
  {
    roleName: 'Inventory Manager',
    description: 'Manage stock across all warehouses',
    permissions: [
      'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
      'products.read',
      'warehouses.read',
      'reports.read', 'reports.export'
    ],
    isActive: true
  },
  {
    roleName: 'Procurement Officer',
    description: 'Manage suppliers and procurement',
    permissions: [
      'suppliers.read', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
      'products.read',
      'inventory.read',
      'reports.read'
    ],
    isActive: true
  },
  {
    roleName: 'Warehouse Staff',
    description: 'Basic warehouse operations',
    permissions: [
      'inventory.read', 'inventory.update',
      'products.read'
    ],
    isActive: true
  },
  {
    roleName: 'Product Manager',
    description: 'Manage product catalog',
    permissions: [
      'products.read', 'products.create', 'products.update', 'products.delete',
      'categories.read', 'categories.create', 'categories.update', 'categories.delete',
      'reports.read'
    ],
    isActive: true
  },
  {
    roleName: 'Auditor/Viewer',
    description: 'Read-only access for auditing and reporting',
    permissions: [
      'users.read',
      'products.read',
      'categories.read',
      'suppliers.read',
      'warehouses.read',
      'inventory.read',
      'reports.read', 'reports.export'
    ],
    isActive: true
  }
];

module.exports = roles;
```

### 5.2 Seed Default Admin User

```javascript
// seed/users.js
const bcrypt = require('bcryptjs');

async function createDefaultAdmin(roleId) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);
  
  return {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@wlancorp.com',
    password: hashedPassword,
    phone: '+919999999999',
    roleId: roleId, // Super Admin role ID
    isActive: true,
    profileImage: null,
    lastLogin: null,
    createdBy: null,
    updatedBy: null
  };
}

module.exports = { createDefaultAdmin };
```

### 5.3 Seed Script

```javascript
// seed/index.js
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const roles = require('./roles');
const { createDefaultAdmin } = require('./users');

async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (only in development)
    if (process.env.NODE_ENV === 'development') {
      await Role.deleteMany({});
      await User.deleteMany({});
      console.log('Cleared existing data');
    }

    // Insert roles
    const insertedRoles = await Role.insertMany(roles);
    console.log(`${insertedRoles.length} roles inserted`);

    // Find Super Admin role
    const superAdminRole = insertedRoles.find(r => r.roleName === 'Super Admin');

    // Create default admin user
    const adminUser = await createDefaultAdmin(superAdminRole._id);
    await User.create(adminUser);
    console.log('Default admin user created');
    console.log('Email: admin@wlancorp.com');
    console.log('Password: Admin@123');

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
```

---

## 6. MongoDB Queries

### 6.1 Common Queries

**Find user by email**:
```javascript
db.users.findOne({ email: "ramkumar@wlancorp.com" });
```

**Find all active users with role populated**:
```javascript
db.users.aggregate([
  { $match: { isActive: true } },
  {
    $lookup: {
      from: "roles",
      localField: "roleId",
      foreignField: "_id",
      as: "role"
    }
  },
  { $unwind: "$role" }
]);
```

**Find all users by role**:
```javascript
// First get role ID
const role = db.roles.findOne({ roleName: "Warehouse Manager" });
// Then find users
db.users.find({ roleId: role._id });
```

**Find active refresh tokens for a user**:
```javascript
db.refresh_tokens.find({
  userId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  isRevoked: false,
  expiresAt: { $gt: new Date() }
});
```

**Revoke all tokens for a user (logout from all devices)**:
```javascript
db.refresh_tokens.updateMany(
  { userId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") },
  { $set: { isRevoked: true } }
);
```

**Get user count by role**:
```javascript
db.users.aggregate([
  { $match: { isActive: true } },
  {
    $lookup: {
      from: "roles",
      localField: "roleId",
      foreignField: "_id",
      as: "role"
    }
  },
  { $unwind: "$role" },
  {
    $group: {
      _id: "$role.roleName",
      count: { $sum: 1 }
    }
  }
]);
```

**Search users by name or email**:
```javascript
db.users.find({
  $or: [
    { firstName: { $regex: "john", $options: "i" } },
    { lastName: { $regex: "john", $options: "i" } },
    { email: { $regex: "john", $options: "i" } }
  ]
});
```

---

## 7. Data Validation Rules

### 7.1 Password Complexity

```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && 
             hasLowerCase && hasNumber && hasSpecialChar,
    errors: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    }
  };
}
```

### 7.2 Email Validation

```javascript
function validateEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}
```

### 7.3 Phone Validation

```javascript
function validatePhone(phone) {
  // International format: +[country code][number]
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
}
```

---

## 8. Database Migration Scripts

### 8.1 Add New Permission to Role

```javascript
// migrations/add-permission-to-role.js
async function addPermissionToRole(roleName, permission) {
  await db.roles.updateOne(
    { roleName: roleName },
    { $addToSet: { permissions: permission } }
  );
}

// Usage
addPermissionToRole('Super Admin', 'notifications.send');
```

### 8.2 Bulk Update User Status

```javascript
// migrations/bulk-update-users.js
async function deactivateInactiveUsers(daysInactive) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
  const result = await db.users.updateMany(
    {
      lastLogin: { $lt: cutoffDate },
      isActive: true
    },
    { $set: { isActive: false } }
  );
  
  console.log(`Deactivated ${result.modifiedCount} users`);
}
```

---

## 9. Backup and Restore

### 9.1 Backup Commands

```bash
# Backup entire auth_db database
mongodump --uri="mongodb://localhost:27017/auth_db" --out=/backup/auth_db_backup

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/auth_db" --collection=users --out=/backup/users_backup

# Backup with compression
mongodump --uri="mongodb://localhost:27017/auth_db" --gzip --out=/backup/auth_db_compressed
```

### 9.2 Restore Commands

```bash
# Restore entire database
mongorestore --uri="mongodb://localhost:27017" /backup/auth_db_backup

# Restore specific collection
mongorestore --uri="mongodb://localhost:27017/auth_db" --collection=users /backup/users_backup/auth_db/users.bson

# Restore from compressed backup
mongorestore --uri="mongodb://localhost:27017" --gzip /backup/auth_db_compressed
```

---

## 10. Performance Optimization

### 10.1 Query Optimization Tips

1. **Use Indexes**: Ensure all frequently queried fields have indexes
2. **Project Only Needed Fields**: Use `.select()` or projection to limit returned fields
3. **Limit Results**: Always use `.limit()` for list queries
4. **Avoid $where**: Use standard query operators instead of $where
5. **Use Lean Queries**: Use `.lean()` for read-only queries

### 10.2 Index Usage Analysis

```javascript
// Explain query plan
db.users.find({ email: "test@example.com" }).explain("executionStats");

// Get index usage statistics
db.users.aggregate([{ $indexStats: {} }]);
```

---

## 11. Data Retention Policy

### 11.1 Refresh Tokens

- Expired tokens are automatically deleted by TTL index
- Revoked tokens older than 30 days should be manually cleaned:

```javascript
db.refresh_tokens.deleteMany({
  isRevoked: true,
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});
```

### 11.2 Inactive Users

- Users inactive for 180 days should be flagged for review
- Automated deactivation after 365 days (configurable)

---

## Document End
**Previous Document**: [4-API-Endpoint-Specifications.md](./4-API-Endpoint-Specifications.md)  
**Next Document**: [6-Authentication-Flow-Diagrams.md](./6-Authentication-Flow-Diagrams.md)  
**Module Progress**: AUTH Documentation (5/6 documents)  
**Overall Progress**: 5/30 documents (16.7%)
