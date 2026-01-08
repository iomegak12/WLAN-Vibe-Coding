require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../src/models/Role.model');
const User = require('../src/models/User.model');
const { ROLES, PERMISSIONS } = require('../src/utils/constants');
const logger = require('../src/config/logger');

/**
 * Database Seeding Script
 * Seeds the database with default roles and admin user
 */

// Default Roles with Permissions
const defaultRoles = [
  {
    roleName: ROLES.SUPER_ADMIN,
    description: 'Full system access with all permissions',
    permissions: [PERMISSIONS.ALL], // Wildcard permission
    isActive: true,
  },
  {
    roleName: ROLES.WAREHOUSE_MANAGER,
    description: 'Manage specific warehouse operations',
    permissions: [
      PERMISSIONS.WAREHOUSES_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.REPORTS_READ,
    ],
    isActive: true,
  },
  {
    roleName: ROLES.INVENTORY_MANAGER,
    description: 'Manage stock across all warehouses',
    permissions: [
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_CREATE,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.INVENTORY_DELETE,
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.WAREHOUSES_READ,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT,
    ],
    isActive: true,
  },
  {
    roleName: ROLES.PROCUREMENT_OFFICER,
    description: 'Manage suppliers and procurement',
    permissions: [
      PERMISSIONS.SUPPLIERS_READ,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.SUPPLIERS_DELETE,
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.REPORTS_READ,
    ],
    isActive: true,
  },
  {
    roleName: ROLES.WAREHOUSE_STAFF,
    description: 'Basic warehouse operations',
    permissions: [
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.PRODUCTS_READ,
    ],
    isActive: true,
  },
  {
    roleName: ROLES.PRODUCT_MANAGER,
    description: 'Manage product catalog',
    permissions: [
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.CATEGORIES_READ,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,
      PERMISSIONS.CATEGORIES_DELETE,
      PERMISSIONS.REPORTS_READ,
    ],
    isActive: true,
  },
  {
    roleName: ROLES.AUDITOR_VIEWER,
    description: 'Read-only access for auditing and reporting',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.CATEGORIES_READ,
      PERMISSIONS.SUPPLIERS_READ,
      PERMISSIONS.WAREHOUSES_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT,
    ],
    isActive: true,
  },
];

/**
 * Seed Database
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/auth_db?authSource=admin';
    await mongoose.connect(uri);
    logger.info('✅ Connected to MongoDB');

    // Clear existing data (only in development)
    if (process.env.NODE_ENV === 'development') {
      await Role.deleteMany({});
      await User.deleteMany({});
      logger.info('🗑️  Cleared existing data');
    }

    // Insert roles
    const insertedRoles = await Role.insertMany(defaultRoles);
    logger.info(`✅ ${insertedRoles.length} roles inserted successfully`);

    // Find Super Admin role
    const superAdminRole = insertedRoles.find(role => role.roleName === ROLES.SUPER_ADMIN);

    // Create default admin user
    const adminUser = new User({
      firstName: 'JT',
      lastName: 'Dhamodharan',
      email: 'jtdhamodharan@gmail.com',
      password: 'Prestige123!',
      phone: '+919876543210',
      roleId: superAdminRole._id,
      isActive: true,
      profileImage: null,
      lastLogin: null,
      createdBy: null,
      updatedBy: null,
    });

    await adminUser.save();
    logger.info('✅ Default admin user created successfully');
    logger.info('');
    logger.info('=====================================');
    logger.info('📧 Admin Email: jtdhamodharan@gmail.com');
    logger.info('🔑 Admin Password: Prestige123!');
    logger.info('⚠️  Please change the password after first login!');
    logger.info('=====================================');
    logger.info('');
    logger.info('✅ Database seeding completed successfully');

    // Close connection
    await mongoose.connection.close();
    logger.info('👋 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
