require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../src/models/Role.model');
const User = require('../src/models/User.model');
const { ROLES, PERMISSIONS } = require('../src/utils/constants');
const logger = require('../src/config/logger');

/**
 * Database Seeding Script with Multiple Users
 * Seeds the database with default roles, admin user, and 25 sample users
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

// Sample users with Indian names distributed across different roles
const sampleUsers = [
  // Warehouse Managers (4 users)
  { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@wlan.com', phone: '+919876543211', role: ROLES.WAREHOUSE_MANAGER, isActive: true },
  { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@wlan.com', phone: '+919876543212', role: ROLES.WAREHOUSE_MANAGER, isActive: true },
  { firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@wlan.com', phone: '+919876543213', role: ROLES.WAREHOUSE_MANAGER, isActive: true },
  { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@wlan.com', phone: '+919876543214', role: ROLES.WAREHOUSE_MANAGER, isActive: false },
  
  // Inventory Managers (4 users)
  { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@wlan.com', phone: '+919876543215', role: ROLES.INVENTORY_MANAGER, isActive: true },
  { firstName: 'Anjali', lastName: 'Desai', email: 'anjali.desai@wlan.com', phone: '+919876543216', role: ROLES.INVENTORY_MANAGER, isActive: true },
  { firstName: 'Karthik', lastName: 'Iyer', email: 'karthik.iyer@wlan.com', phone: '+919876543217', role: ROLES.INVENTORY_MANAGER, isActive: true },
  { firstName: 'Divya', lastName: 'Nair', email: 'divya.nair@wlan.com', phone: '+919876543218', role: ROLES.INVENTORY_MANAGER, isActive: true },
  
  // Procurement Officers (3 users)
  { firstName: 'Arjun', lastName: 'Mehta', email: 'arjun.mehta@wlan.com', phone: '+919876543219', role: ROLES.PROCUREMENT_OFFICER, isActive: true },
  { firstName: 'Kavya', lastName: 'Pillai', email: 'kavya.pillai@wlan.com', phone: '+919876543220', role: ROLES.PROCUREMENT_OFFICER, isActive: true },
  { firstName: 'Rohan', lastName: 'Malhotra', email: 'rohan.malhotra@wlan.com', phone: '+919876543221', role: ROLES.PROCUREMENT_OFFICER, isActive: true },
  
  // Warehouse Staff (7 users)
  { firstName: 'Suresh', lastName: 'Rao', email: 'suresh.rao@wlan.com', phone: '+919876543222', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  { firstName: 'Lakshmi', lastName: 'Krishnan', email: 'lakshmi.krishnan@wlan.com', phone: '+919876543223', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  { firstName: 'Anil', lastName: 'Gupta', email: 'anil.gupta@wlan.com', phone: '+919876543224', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  { firstName: 'Pooja', lastName: 'Verma', email: 'pooja.verma@wlan.com', phone: '+919876543225', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  { firstName: 'Manoj', lastName: 'Shetty', email: 'manoj.shetty@wlan.com', phone: '+919876543226', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  { firstName: 'Ritu', lastName: 'Jain', email: 'ritu.jain@wlan.com', phone: '+919876543227', role: ROLES.WAREHOUSE_STAFF, isActive: false },
  { firstName: 'Deepak', lastName: 'Bhat', email: 'deepak.bhat@wlan.com', phone: '+919876543228', role: ROLES.WAREHOUSE_STAFF, isActive: true },
  
  // Product Managers (4 users)
  { firstName: 'Nikhil', lastName: 'Menon', email: 'nikhil.menon@wlan.com', phone: '+919876543229', role: ROLES.PRODUCT_MANAGER, isActive: true },
  { firstName: 'Meera', lastName: 'Shah', email: 'meera.shah@wlan.com', phone: '+919876543230', role: ROLES.PRODUCT_MANAGER, isActive: true },
  { firstName: 'Sanjay', lastName: 'Agarwal', email: 'sanjay.agarwal@wlan.com', phone: '+919876543231', role: ROLES.PRODUCT_MANAGER, isActive: true },
  { firstName: 'Neha', lastName: 'Kapoor', email: 'neha.kapoor@wlan.com', phone: '+919876543232', role: ROLES.PRODUCT_MANAGER, isActive: true },
  
  // Auditor/Viewers (3 users)
  { firstName: 'Rahul', lastName: 'Chopra', email: 'rahul.chopra@wlan.com', phone: '+919876543233', role: ROLES.AUDITOR_VIEWER, isActive: true },
  { firstName: 'Swati', lastName: 'Bansal', email: 'swati.bansal@wlan.com', phone: '+919876543234', role: ROLES.AUDITOR_VIEWER, isActive: true },
  { firstName: 'Gaurav', lastName: 'Saxena', email: 'gaurav.saxena@wlan.com', phone: '+919876543235', role: ROLES.AUDITOR_VIEWER, isActive: true },
];

/**
 * Seed Database with Multiple Users
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

    // Create role map for easy lookup
    const roleMap = {};
    insertedRoles.forEach(role => {
      roleMap[role.roleName] = role._id;
    });

    // Create default admin user
    const adminUser = new User({
      firstName: 'JT',
      lastName: 'Dhamodharan',
      email: 'jtdhamodharan@gmail.com',
      password: 'Prestige123!',
      phone: '+919876543210',
      roleId: roleMap[ROLES.SUPER_ADMIN],
      isActive: true,
      profileImage: null,
      lastLogin: null,
      createdBy: null,
      updatedBy: null,
    });

    await adminUser.save();
    logger.info('✅ Default admin user created successfully');

    // Create sample users
    const usersToCreate = sampleUsers.map(user => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: 'User123!@#', // Default password for all sample users
      phone: user.phone,
      roleId: roleMap[user.role],
      isActive: user.isActive,
      profileImage: null,
      lastLogin: null,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    }));

    // Batch insert users
    const createdUsers = await User.insertMany(usersToCreate);
    logger.info(`✅ ${createdUsers.length} sample users created successfully`);

    // Log summary
    logger.info('');
    logger.info('=====================================');
    logger.info('         SEEDING COMPLETED           ');
    logger.info('=====================================');
    logger.info('');
    logger.info('👤 ADMIN CREDENTIALS:');
    logger.info('📧 Email: jtdhamodharan@gmail.com');
    logger.info('🔑 Password: Prestige123!');
    logger.info('');
    logger.info('👥 SAMPLE USERS (25 users created):');
    logger.info('🔑 Default Password: User123!@#');
    logger.info('');
    
    // Count by role
    const roleCounts = {};
    sampleUsers.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    logger.info('📊 Users by Role:');
    Object.keys(roleCounts).forEach(role => {
      logger.info(`   ${role}: ${roleCounts[role]} users`);
    });
    
    logger.info('');
    logger.info('📋 Sample User Emails:');
    logger.info('   rajesh.kumar@wlan.com (Warehouse Manager)');
    logger.info('   vikram.singh@wlan.com (Inventory Manager)');
    logger.info('   arjun.mehta@wlan.com (Procurement Officer)');
    logger.info('   suresh.rao@wlan.com (Warehouse Staff)');
    logger.info('   nikhil.menon@wlan.com (Product Manager)');
    logger.info('   rahul.chopra@wlan.com (Auditor/Viewer)');
    logger.info('');
    logger.info('⚠️  Note: 2 users are inactive (for testing)');
    logger.info('   - sneha.reddy@wlan.com');
    logger.info('   - ritu.jain@wlan.com');
    logger.info('');
    logger.info('⚠️  Please change passwords after first login!');
    logger.info('=====================================');
    logger.info('');

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
