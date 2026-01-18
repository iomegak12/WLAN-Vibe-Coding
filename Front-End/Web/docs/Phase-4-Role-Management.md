# Phase 4: Role Management Module

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 4 - Role Management Module  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2, 3 must be completed

---

## Phase Objectives

Implement complete role and permission management:
- ✅ Roles list with permissions overview
- ✅ Role create form with permission selection
- ✅ Role edit functionality
- ✅ Role delete with dependency validation
- ✅ Permission selection UI (organized by category)
- ✅ Permission management utilities
- ✅ Integration with AUTH service
- ✅ Permission-based access control

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0-3: Foundation, Auth, App Shell, User Management
- [x] AuthContext with permission checking
- [x] User management using roles

### Backend Verification
Test AUTH service role endpoints:

```bash
# Get roles list
curl -X GET http://localhost:5001/api/v1/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: 200 OK with roles array
```

---

## Architecture Overview

### Module Structure

```
src/features/roles/
├── pages/
│   ├── RolesListPage.jsx       # Roles list with table
│   ├── RoleCreatePage.jsx      # Create new role
│   └── RoleEditPage.jsx        # Edit existing role
├── components/
│   ├── RolesTable.jsx          # Data table for roles
│   ├── RoleForm.jsx            # Reusable create/edit form
│   ├── PermissionSelector.jsx  # Permission selection UI
│   ├── PermissionGroup.jsx     # Grouped permission checkboxes
│   ├── RoleDeleteDialog.jsx    # Confirmation dialog
│   └── RoleStatusChip.jsx      # Active/Inactive status badge
└── hooks/
    ├── useRoles.js             # Fetch roles list
    ├── useRoleCreate.js        # Create role logic
    ├── useRoleUpdate.js        # Update role logic
    └── useRoleDelete.js        # Delete role logic

src/utils/
└── permissions.js              # Permission utilities and constants
```

---

## Step-by-Step Implementation Guide

### Step 1: Create Role Service Layer

**File:** `src/services/roleService.js`

**Purpose:** Centralize all role-related API calls

**Functions to implement:**

```javascript
// GET /roles - with optional filters
getRoles({ isActive })

// GET /roles/:id
getRoleById(id)

// POST /roles
createRole(roleData)

// PUT /roles/:id
updateRole(id, roleData)

// DELETE /roles/:id
deleteRole(id)
```

**Response Handling:**
- Extract data from standard envelope
- No pagination (roles are typically small dataset)
- Return standardized format

---

### Step 2: Create Permission Utilities

**File:** `src/utils/permissions.js`

**Purpose:** Centralize permission constants and helper functions

**Permission Categories Structure:**

Organize all permissions into logical groups:

```javascript
const PERMISSION_GROUPS = {
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
  reporting: {
    label: 'Reporting',
    permissions: [
      { key: 'reports.read', label: 'View Reports' },
      { key: 'reports.export', label: 'Export Reports' },
    ],
  },
  // Future modules (disabled for now)
  supplierManagement: {
    label: 'Supplier Management (Future)',
    disabled: true,
    permissions: [
      { key: 'suppliers.read', label: 'View Suppliers' },
      { key: 'suppliers.create', label: 'Create Suppliers' },
      { key: 'suppliers.update', label: 'Update Suppliers' },
      { key: 'suppliers.delete', label: 'Delete Suppliers' },
    ],
  },
  // ... more groups
};
```

**Helper Functions:**

```javascript
// Get all available permissions as flat array
getAllPermissions()

// Get permissions by group
getPermissionsByGroup(groupKey)

// Format permission for display
formatPermissionLabel(permissionKey)

// Check if permission is valid
isValidPermission(permissionKey)

// Get permission group label
getPermissionGroupLabel(groupKey)
```

---

### Step 3: Build Roles List Page

**File:** `src/features/roles/pages/RolesListPage.jsx`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Roles                                    [+ New Role]│
├─────────────────────────────────────────────────────┤
│ [Status Filter: All ▼]                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│              [RolesTable Component]                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Page Header:**
- Title: "Roles"
- Breadcrumbs: Users & Access > Roles
- Primary action: "New Role" button (if has `roles.create` permission)

**Filters Section:**
- **Status Filter:** All, Active, Inactive

**Table Section:**
- Render `RolesTable` component
- Pass filtered data and loading state

**State Management:**
- `isActive` - status filter
- `roles` - fetched roles data
- `loading` - loading state

**Data Fetching:**
- Fetch on component mount
- Re-fetch when filter changes
- No pagination (typically few roles)

---

### Step 4: Build Roles Table Component

**File:** `src/features/roles/components/RolesTable.jsx`

**Table Columns:**

| Column          | Data Source              | Width | Display Logic                    |
|-----------------|--------------------------|-------|----------------------------------|
| Role Name       | roleName                 | 25%   | Bold text                        |
| Description     | description              | 35%   | Truncate if > 100 chars          |
| Permissions     | permissions.length       | 20%   | Count with expandable detail     |
| Status          | isActive (chip)          | 10%   | Active/Inactive chip             |
| Actions         | View/Edit/Delete buttons | 10%   | Based on permissions             |

**Permissions Column Display:**

Show permission count with "View Details" expand:
- Default: "12 permissions" (clickable)
- On click: Expand row to show all permissions in categorized view
- Collapsed view: Hide details

**Expandable Row Content:**
- Group permissions by category
- Show as chips or bullet list
- Color-coded by category (optional)

**Actions Column:**

Show icon buttons based on permissions:

1. **View** - Eye icon, always visible (expand details)
2. **Edit** - Edit icon, visible if `roles.update` permission
3. **Delete** - Delete icon, visible if `roles.delete` permission

**Special Restrictions:**
- Cannot delete "Super Admin" role (system role)
- Show tooltip on disabled delete: "System role cannot be deleted"

**Table Features:**
- MUI `Table` with expandable rows
- Hover row highlighting
- Loading skeleton while fetching
- Empty state when no data

---

### Step 5: Build Role Form Component

**File:** `src/features/roles/components/RoleForm.jsx`

**Purpose:** Reusable form for create and edit

**Form Sections:**

### Section 1: Basic Information

| Field       | Type         | Required | Validation                          |
|-------------|--------------|----------|-------------------------------------|
| Role Name   | Text         | Yes      | 2-50 chars, unique                  |
| Description | Textarea     | No       | Max 500 characters                  |
| Is Active   | Switch/Toggle| No       | Default: true                       |

### Section 2: Permissions

- Render `PermissionSelector` component
- Pass selected permissions
- Handle permission selection changes

**Form Layout:**
- Single column layout
- Clear section dividers
- Scrollable if content exceeds viewport

**Form States:**
- **Idle:** Ready for input
- **Validating:** Field-level validation
- **Submitting:** API call in progress
- **Error:** Display server errors
- **Success:** Redirect to roles list

**Action Buttons:**
- **Save/Create** - Primary button, disabled if no permissions selected
- **Cancel** - Secondary button, navigate back to roles list

**Validation Logic:**
- Role name required and unique
- At least one permission must be selected
- Show warning if granting "*" wildcard permission

**Props:**
- `mode` - 'create' or 'edit'
- `initialData` - Role data for edit mode
- `onSubmit` - Submit handler
- `onCancel` - Cancel handler

---

### Step 6: Build Permission Selector Component

**File:** `src/features/roles/components/PermissionSelector.jsx`

**Purpose:** Comprehensive permission selection UI

**Layout Design:**

```
┌──────────────────────────────────────────────────┐
│ Permissions (12 selected)                        │
│                                                  │
│ [ ] Select All    [Clear All]                    │
├──────────────────────────────────────────────────┤
│                                                  │
│ [PermissionGroup: User Management]               │
│   [x] View Users                                 │
│   [x] Create Users                               │
│   [x] Update Users                               │
│   [ ] Delete Users                               │
│                                                  │
│ [PermissionGroup: Role Management]               │
│   [x] View Roles                                 │
│   [ ] Create Roles                               │
│   ...                                            │
│                                                  │
│ [PermissionGroup: Product Management]            │
│   ...                                            │
└──────────────────────────────────────────────────┘
```

**Features:**

1. **Select All / Clear All Controls**
   - "Select All" checkbox - selects all available permissions
   - "Clear All" button - deselects all permissions
   - Show count of selected permissions

2. **Grouped Permissions**
   - Group permissions by category (using PERMISSION_GROUPS)
   - Expandable/collapsible groups (Accordion)
   - Group header shows: Label + selected count
   - Group-level "Select All" checkbox

3. **Wildcard Permission Warning**
   - If "*" selected, show warning banner
   - Message: "This role will have FULL access to all features"
   - Highlight in red/orange

4. **Future Module Permissions**
   - Show but disable permissions for future modules
   - Gray out with tooltip: "This module is not yet available"

**Interaction Behaviors:**

- Click group header: Expand/collapse group
- Click group checkbox: Select/deselect all in group
- Click individual checkbox: Toggle single permission
- Select All: Checks all available (not disabled) permissions
- Clear All: Unchecks all permissions

**Props:**
- `selectedPermissions` - Array of selected permission keys
- `onChange` - Callback when selection changes
- `disabled` - Disable all controls (during submit)

**State Management:**
- Track which groups are expanded
- Track selected permissions array
- Emit changes to parent component

---

### Step 7: Build Permission Group Component

**File:** `src/features/roles/components/PermissionGroup.jsx`

**Purpose:** Single permission group with checkboxes

**Layout:**

```
┌──────────────────────────────────────────────┐
│ [▼] User Management            [x] (3/4)     │
├──────────────────────────────────────────────┤
│   [x] View Users                             │
│   [x] Create Users                           │
│   [x] Update Users                           │
│   [ ] Delete Users                           │
└──────────────────────────────────────────────┘
```

**Components:**

1. **Group Header:**
   - Expand/collapse icon (chevron)
   - Group label
   - Group checkbox (indeterminate if partial selection)
   - Selection count: (3/4)

2. **Permission Checkboxes:**
   - Individual checkbox per permission
   - Permission label
   - Disabled state if permission not available
   - Tooltip for disabled permissions

**Props:**
- `groupKey` - Permission group key
- `groupLabel` - Display label for group
- `permissions` - Array of permissions in group
- `selectedPermissions` - Currently selected permissions
- `onChange` - Selection change handler
- `disabled` - Group disabled state

**Checkbox States:**
- **Unchecked:** No permissions selected
- **Checked:** All permissions selected
- **Indeterminate:** Some permissions selected

---

### Step 8: Build Role Create Page

**File:** `src/features/roles/pages/RoleCreatePage.jsx`

**Layout:**

```
┌─────────────────────────────────────────┐
│ Create New Role               [Cancel]  │
├─────────────────────────────────────────┤
│                                         │
│      [RoleForm Component - Create]      │
│                                         │
└─────────────────────────────────────────┘
```

**Page Header:**
- Title: "Create New Role"
- Breadcrumbs: Users & Access > Roles > New Role
- Cancel button (navigate back)

**Form Integration:**
- Render `RoleForm` with `mode="create"`
- Handle form submission
- Call `createRole()` API
- On success: Show success message, redirect to roles list
- On error: Display error on form

**Validation:**
- Role name required and unique
- At least one permission required
- Client-side validation before API call

**Error Handling:**

| Error Code            | Display Message                                      |
|-----------------------|------------------------------------------------------|
| ROLE_EXISTS           | Role with this name already exists                   |
| VALIDATION_ERROR      | Map field errors to respective inputs                |
| FORBIDDEN             | You don't have permission to create roles            |

---

### Step 9: Build Role Edit Page

**File:** `src/features/roles/pages/RoleEditPage.jsx`

**Similar to Create Page, but:**
- Title: "Edit Role"
- Breadcrumbs: Users & Access > Roles > Edit Role
- Fetch role data on mount using roleId from URL params
- Pre-populate form with existing role data
- Call `updateRole(id, data)` API on submit

**Additional Features:**

1. **System Role Protection:**
   - If role is system role (e.g., "Super Admin")
   - Show read-only mode OR
   - Disable critical fields (role name, certain permissions)

2. **User Count Display:**
   - Show how many users have this role
   - Warning if reducing permissions: "This will affect X users"

**Restrictions:**
- Cannot edit system roles (optional)
- Cannot remove all permissions
- Show warning if users are assigned to this role

**Loading State:**
- Show skeleton/spinner while fetching role data
- Show 404 if role not found

---

### Step 10: Build Role Delete Dialog

**File:** `src/features/roles/components/RoleDeleteDialog.jsx`

**Purpose:** Confirmation dialog with dependency check

**Dialog Content:**

```
┌─────────────────────────────────────────┐
│ Delete Role?                        [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to delete this    │
│ role?                                    │
│                                          │
│ Role: Product Manager                   │
│ Users: 5 users assigned                 │
│                                          │
│ ⚠ Warning: You cannot delete a role     │
│ with assigned users. Please reassign    │
│ users to another role first.            │
├─────────────────────────────────────────┤
│                        [Close]           │
└─────────────────────────────────────────┘
```

**OR if no users assigned:**

```
┌─────────────────────────────────────────┐
│ Delete Role?                        [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to delete this    │
│ role?                                    │
│                                          │
│ Role: Product Manager                   │
│                                          │
│ This action cannot be undone.            │
├─────────────────────────────────────────┤
│                   [Cancel]  [Delete]     │
└─────────────────────────────────────────┘
```

**Props:**
- `open` - Dialog visibility
- `role` - Role object to delete
- `onClose` - Close handler
- `onConfirm` - Delete confirmation handler

**Business Logic:**
- Fetch user count for this role
- If users > 0: Show warning, disable delete
- If users = 0: Allow delete
- Cannot delete system roles

**Delete Button:**
- Red color (error)
- Show loading spinner during delete
- Disabled if users assigned or system role

---

### Step 11: Create Custom Hooks

#### Hook 1: useRoles

**File:** `src/features/roles/hooks/useRoles.js`

**Purpose:** Fetch and manage roles list

**Returns:**
```javascript
{
  roles,           // Array of role objects
  loading,         // Boolean
  error,           // Error message
  refetch,         // Function to re-fetch
}
```

**Accepts:**
- Filters object: { isActive }

#### Hook 2: useRoleCreate

**File:** `src/features/roles/hooks/useRoleCreate.js`

**Purpose:** Handle role creation logic

**Returns:**
```javascript
{
  createRole,      // Function to create role
  loading,         // Boolean
  error,           // Error message
}
```

#### Hook 3: useRoleUpdate

**File:** `src/features/roles/hooks/useRoleUpdate.js`

**Purpose:** Handle role update logic

**Returns:**
```javascript
{
  updateRole,      // Function to update role
  loading,         // Boolean
  error,           // Error message
}
```

#### Hook 4: useRoleDelete

**File:** `src/features/roles/hooks/useRoleDelete.js`

**Purpose:** Handle role deletion with dependency check

**Returns:**
```javascript
{
  deleteRole,      // Function to delete role
  canDelete,       // Boolean - if role can be deleted
  userCount,       // Number of users with this role
  loading,         // Boolean
  error,           // Error message
}
```

**Logic:**
- Check user count before allowing delete
- Return canDelete flag based on dependency

---

## API Integration Specifications

### GET /roles

**Query Parameters:**
- `isActive` (optional, boolean)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roleName": "Super Admin",
      "description": "Full system access",
      "permissions": ["*"],
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "roleName": "Product Manager",
      "description": "Manage product catalog",
      "permissions": [
        "products.read",
        "products.create",
        "products.update",
        "products.delete",
        "categories.read",
        "categories.create",
        "categories.update",
        "categories.delete"
      ],
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /roles/:id

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "roleName": "Product Manager",
    "description": "Manage product catalog",
    "permissions": [
      "products.read",
      "products.create",
      "products.update",
      "products.delete",
      "categories.read",
      "categories.create",
      "categories.update",
      "categories.delete"
    ],
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### POST /roles

**Request Body:**
```json
{
  "roleName": "Warehouse Supervisor",
  "description": "Supervise warehouse operations",
  "permissions": [
    "products.read",
    "inventory.read",
    "inventory.update"
  ],
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "roleName": "Warehouse Supervisor",
    "description": "Supervise warehouse operations",
    "permissions": [
      "products.read",
      "inventory.read",
      "inventory.update"
    ],
    "isActive": true,
    "createdAt": "2026-01-14T12:00:00.000Z"
  },
  "message": "Role created successfully"
}
```

**Error (409):**
```json
{
  "success": false,
  "error": {
    "code": "ROLE_EXISTS",
    "message": "Role with this name already exists"
  }
}
```

### PUT /roles/:id

**Request Body:** (all fields optional)
```json
{
  "roleName": "Warehouse Supervisor",
  "description": "Updated description",
  "permissions": [
    "products.read",
    "inventory.read",
    "inventory.update",
    "inventory.create"
  ],
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "roleName": "Warehouse Supervisor",
    "description": "Updated description",
    "permissions": [
      "products.read",
      "inventory.read",
      "inventory.update",
      "inventory.create"
    ],
    "isActive": true,
    "updatedAt": "2026-01-14T12:30:00.000Z"
  },
  "message": "Role updated successfully"
}
```

### DELETE /roles/:id

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "ROLE_IN_USE",
    "message": "Cannot delete role. 5 users are assigned to this role.",
    "details": {
      "userCount": 5
    }
  }
}
```

---

## Validation Rules

### Role Form Validation

**Role Name:**
- Required
- 2-50 characters
- Unique (case-insensitive)
- No leading/trailing spaces
- Pattern: Letters, numbers, spaces, hyphens allowed

**Description:**
- Optional
- Max 500 characters
- Multiline allowed

**Permissions:**
- At least one permission required
- Must be valid permission keys
- Array cannot be empty

**Is Active:**
- Optional, default true

---

## User Experience Requirements

### Loading States

**Roles List:**
- Show skeleton table rows while loading (3-5 rows)
- Disable filter controls during load

**Form Submit:**
- Disable all inputs
- Show spinner on submit button
- Change button text: "Save" → "Saving..."

**Permission Selector:**
- Show loading spinner while fetching available permissions
- Disable checkboxes during submit

### Success Feedback

**Role Created:**
- Show success snackbar: "Role created successfully"
- Redirect to roles list after 1 second

**Role Updated:**
- Show success snackbar: "Role updated successfully"
- Redirect to roles list

**Role Deleted:**
- Show success snackbar: "Role deleted successfully"
- Refresh roles list

### Error Feedback

**Field Errors:**
- Show inline below each field
- Red color, small font size
- Clear on field focus

**Permission Errors:**
- Show alert above permission selector
- Message: "Please select at least one permission"

**Delete Errors:**
- Show in dialog
- Clear message about dependency
- Suggest resolution (reassign users)

### Empty States

**No Roles Found:**
- Icon: AdminPanelSettingsOffIcon
- Message: "No roles found"
- Suggestion: "Create your first role"
- Action: "Create Role" button

**No Active Roles:**
- Message: "No active roles"
- Action: "Show All" button (clear filter)

---

## Permission-Based UI Rendering

### Roles List Page

| Element        | Required Permission | Behavior if Missing    |
|----------------|---------------------|------------------------|
| View Page      | roles.read          | Redirect to 403        |
| "New Role" btn | roles.create        | Hide button            |
| Edit action    | roles.update        | Hide edit icon         |
| Delete action  | roles.delete        | Hide delete icon       |

### Role Create/Edit Pages

| Element           | Required Permission | Behavior if Missing    |
|-------------------|---------------------|------------------------|
| Access Create Page| roles.create        | Redirect to 403        |
| Access Edit Page  | roles.update        | Redirect to 403        |

---

## Testing Checklist

### Roles List Tests

- [ ] Roles list loads with all roles
- [ ] Status filter works (Active/Inactive/All)
- [ ] Expandable row shows permission details
- [ ] Permission count displays correctly
- [ ] View action expands role details
- [ ] Edit action navigates to edit page (if permission)
- [ ] Delete action opens confirmation dialog (if permission)
- [ ] Empty state shows when no roles
- [ ] Loading state shows during fetch
- [ ] System roles marked as non-deletable

### Role Create Tests

- [ ] Form displays with all fields
- [ ] Role name required validation works
- [ ] Permission selector displays all groups
- [ ] Can select/deselect individual permissions
- [ ] Group "Select All" works
- [ ] Master "Select All" works
- [ ] "Clear All" works
- [ ] At least one permission required
- [ ] Wildcard (*) permission shows warning
- [ ] Form submits with valid data
- [ ] Success message shows on create
- [ ] Redirects to roles list after success
- [ ] Duplicate role name error shows
- [ ] Cancel button navigates back

### Role Edit Tests

- [ ] Role data loads and pre-populates
- [ ] Permissions pre-selected correctly
- [ ] Can add/remove permissions
- [ ] System roles read-only (if applicable)
- [ ] Warning shows if users assigned
- [ ] Form submits with valid data
- [ ] Success message shows on update
- [ ] 404 shows if role not found

### Role Delete Tests

- [ ] Confirmation dialog opens on delete
- [ ] Dialog shows role details
- [ ] Shows user count if users assigned
- [ ] Cannot delete if users assigned
- [ ] Cannot delete system roles
- [ ] Delete succeeds if no dependencies
- [ ] Success message shows
- [ ] Roles list refreshes after delete
- [ ] Cancel closes dialog without deleting

### Permission Selector Tests

- [ ] All permission groups display
- [ ] Groups expand/collapse
- [ ] Group checkboxes work (select all in group)
- [ ] Individual checkboxes work
- [ ] Master "Select All" works
- [ ] "Clear All" works
- [ ] Indeterminate state shows for partial selection
- [ ] Future module permissions disabled
- [ ] Tooltips show on disabled permissions
- [ ] Selected count updates correctly

### Permission Tests

- [ ] User without roles.read cannot access roles list
- [ ] User without roles.create cannot see "New Role"
- [ ] User without roles.update cannot edit roles
- [ ] User without roles.delete cannot delete roles
- [ ] Super Admin (*) can access all features

---

## Common Issues and Solutions

### Issue: Permission selector too long/overwhelming

**Solution:** Use accordion groups, keep collapsed by default. Add search filter for permissions (future enhancement).

### Issue: Cannot delete role - users assigned

**Cause:** Backend prevents deletion if users have this role

**Solution:** Show clear error message with user count. Provide link to users page to reassign.

### Issue: Wildcard permission not working

**Cause:** Permission check logic doesn't handle "*"

**Solution:** Ensure hasPermission() function checks for "*" first before specific permissions.

### Issue: Role name uniqueness check fails

**Cause:** Case-sensitivity mismatch

**Solution:** Backend should handle case-insensitive uniqueness. Frontend shows clear error.

### Issue: Too many permissions to display

**Cause:** Future expansion with many modules

**Solution:** Implement search/filter in permission selector. Group by module clearly.

---

## Advanced Features (Optional Enhancements)

### Permission Templates

Create role templates for common scenarios:
- "Admin" template - select all permissions
- "Manager" template - read + update permissions
- "Viewer" template - read-only permissions
- Custom templates saved by organization

### Role Cloning

Add "Duplicate Role" action:
- Clone existing role with all permissions
- User can modify name and permissions
- Faster than creating from scratch

### Permission Search

Add search box in permission selector:
- Filter permissions by keyword
- Highlight matching permissions
- Show group if any permission matches

### Role Preview

Before saving, show preview of selected permissions:
- Categorized list
- Count per category
- Warning if extensive permissions selected

---

## Performance Considerations

- Cache roles list (changes infrequently)
- Memoize permission groups rendering
- Use checkbox indeterminate state efficiently
- Lazy load role details on expand
- Debounce permission selection changes (batch updates)

---

## Accessibility Requirements

- [ ] All form fields have labels
- [ ] Checkboxes have proper labels
- [ ] Group expand/collapse keyboard accessible
- [ ] Checkbox keyboard navigation (Tab, Space)
- [ ] Screen reader announces permission selection
- [ ] Error messages announced
- [ ] Dialog keyboard accessible (Esc to close)
- [ ] Focus management in forms

---

## File Structure After Phase 4

```
src/
├── features/
│   └── roles/
│       ├── pages/
│       │   ├── RolesListPage.jsx
│       │   ├── RoleCreatePage.jsx
│       │   └── RoleEditPage.jsx
│       ├── components/
│       │   ├── RolesTable.jsx
│       │   ├── RoleForm.jsx
│       │   ├── PermissionSelector.jsx
│       │   ├── PermissionGroup.jsx
│       │   ├── RoleDeleteDialog.jsx
│       │   └── RoleStatusChip.jsx
│       └── hooks/
│           ├── useRoles.js
│           ├── useRoleCreate.js
│           ├── useRoleUpdate.js
│           └── useRoleDelete.js
├── services/
│   └── roleService.js
├── utils/
│   └── permissions.js
└── routes/
    └── AppRoutes.jsx (updated with role routes)
```

---

## Success Criteria

Phase 4 is complete when:

- [ ] Roles list page displays all roles
- [ ] Can expand roles to see permissions
- [ ] Permission selector organized by groups
- [ ] Can create new role with permissions
- [ ] Can edit existing role
- [ ] Can delete role (with dependency check)
- [ ] Cannot delete role with users assigned
- [ ] Cannot delete system roles
- [ ] All permission groups display correctly
- [ ] Select All / Clear All works
- [ ] Group-level selection works
- [ ] Wildcard permission handled correctly
- [ ] All validations work (client + server)
- [ ] Loading and error states handled
- [ ] Permission-based access control works
- [ ] Responsive design works
- [ ] All tests pass
- [ ] No console errors

---

## Next Steps After Phase 4

Once role management is complete:

✅ **Phase 5: Category & Sub-category Management**
- Categories CRUD with pagination
- Sub-categories CRUD with parent selection
- Code auto-generation
- Dependency warnings (delete restrictions)
- Active/inactive toggles

---

## Estimated Time

**Total:** 10-12 hours

**Breakdown:**
- Role service layer: 1 hour
- Roles list page + table: 2 hours
- Permission utilities: 1 hour
- Permission selector component: 3 hours
- Role create/edit pages + form: 2 hours
- Role delete with dependencies: 1 hour
- Testing and bug fixes: 1.5 hours
- Polish and UX refinements: 0.5 hour

---

**End of Phase 4**

**Status:** Ready for implementation  
**Next Phase:** Phase 5 - Category & Sub-category Management
