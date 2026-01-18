// Permission Groups - Organized by module
export const PERMISSION_GROUPS = {
  userManagement: {
    label: 'User Management',
    permissions: [
      { key: 'users.read', label: 'View Users' },
      { key: 'users.create', label: 'Create Users' },
      { key: 'users.update', label: 'Update Users' },
      { key: 'users.delete', label: 'Delete Users' },
    ],
  },
  roleManagement: {
    label: 'Role Management',
    permissions: [
      { key: 'roles.read', label: 'View Roles' },
      { key: 'roles.create', label: 'Create Roles' },
      { key: 'roles.update', label: 'Update Roles' },
      { key: 'roles.delete', label: 'Delete Roles' },
    ],
  },
  productManagement: {
    label: 'Product Management',
    permissions: [
      { key: 'products.read', label: 'View Products' },
      { key: 'products.create', label: 'Create Products' },
      { key: 'products.update', label: 'Update Products' },
      { key: 'products.delete', label: 'Delete Products' },
    ],
  },
  categoryManagement: {
    label: 'Category Management',
    permissions: [
      { key: 'categories.read', label: 'View Categories' },
      { key: 'categories.create', label: 'Create Categories' },
      { key: 'categories.update', label: 'Update Categories' },
      { key: 'categories.delete', label: 'Delete Categories' },
    ],
  },
  subcategoryManagement: {
    label: 'Subcategory Management',
    permissions: [
      { key: 'subcategories.read', label: 'View Subcategories' },
      { key: 'subcategories.create', label: 'Create Subcategories' },
      { key: 'subcategories.update', label: 'Update Subcategories' },
      { key: 'subcategories.delete', label: 'Delete Subcategories' },
    ],
  },
  inventoryManagement: {
    label: 'Inventory Management',
    permissions: [
      { key: 'inventory.read', label: 'View Inventory' },
      { key: 'inventory.create', label: 'Add Inventory' },
      { key: 'inventory.update', label: 'Update Inventory' },
      { key: 'inventory.delete', label: 'Remove Inventory' },
    ],
  },
  warehouseManagement: {
    label: 'Warehouse Management',
    permissions: [
      { key: 'warehouses.read', label: 'View Warehouses' },
      { key: 'warehouses.create', label: 'Create Warehouses' },
      { key: 'warehouses.update', label: 'Update Warehouses' },
      { key: 'warehouses.delete', label: 'Delete Warehouses' },
    ],
  },
  supplierManagement: {
    label: 'Supplier Management',
    permissions: [
      { key: 'suppliers.read', label: 'View Suppliers' },
      { key: 'suppliers.create', label: 'Create Suppliers' },
      { key: 'suppliers.update', label: 'Update Suppliers' },
      { key: 'suppliers.delete', label: 'Delete Suppliers' },
    ],
  },
  reporting: {
    label: 'Reporting',
    permissions: [
      { key: 'reports.read', label: 'View Reports' },
      { key: 'reports.export', label: 'Export Reports' },
    ],
  },
};

// Get all available permissions as flat array
export const getAllPermissions = () => {
  const allPermissions = [];
  Object.values(PERMISSION_GROUPS).forEach((group) => {
    group.permissions.forEach((permission) => {
      allPermissions.push(permission);
    });
  });
  return allPermissions;
};

// Get permissions by group
export const getPermissionsByGroup = (groupKey) => {
  return PERMISSION_GROUPS[groupKey]?.permissions || [];
};

// Format permission label
export const formatPermissionLabel = (permissionKey) => {
  const allPermissions = getAllPermissions();
  const permission = allPermissions.find((p) => p.key === permissionKey);
  return permission?.label || permissionKey;
};

// Check if permission is valid
export const isValidPermission = (permissionKey) => {
  if (permissionKey === '*') return true; // Wildcard
  const allPermissions = getAllPermissions();
  return allPermissions.some((p) => p.key === permissionKey);
};

// Get permission group label
export const getPermissionGroupLabel = (groupKey) => {
  return PERMISSION_GROUPS[groupKey]?.label || groupKey;
};

// Get all permission keys as array
export const getAllPermissionKeys = () => {
  return getAllPermissions().map((p) => p.key);
};
