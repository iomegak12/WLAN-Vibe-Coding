# Phase 5: Category & Sub-category Management

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 5 - Category & Sub-category Management  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2, 3, 4 must be completed

---

## Phase Objectives

Implement complete category and sub-category management:
- ✅ Categories list with pagination, filters, and search
- ✅ Category create/edit with code auto-generation
- ✅ Category delete with dependency validation
- ✅ Sub-categories list with parent category filter
- ✅ Sub-category create/edit with parent selection
- ✅ Sub-category delete with product validation
- ✅ Active/Inactive status management
- ✅ Integration with PMS service

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0-4: Foundation, Auth, App Shell, User Management, Role Management
- [x] Navigation menu includes Products module
- [x] Permission system for categories management

### Backend Verification
Test PMS service category endpoints:

```bash
# Get categories list
curl -X GET http://localhost:5002/api/v1/categories

# Get sub-categories list
curl -X GET http://localhost:5002/api/v1/subcategories

# Expected: 200 OK with data arrays
```

---

## Architecture Overview

### Module Structure

```
src/features/categories/
├── pages/
│   ├── CategoriesListPage.jsx       # Categories list
│   ├── CategoryCreatePage.jsx       # Create category
│   ├── CategoryEditPage.jsx         # Edit category
│   ├── SubCategoriesListPage.jsx    # Sub-categories list
│   ├── SubCategoryCreatePage.jsx    # Create sub-category
│   └── SubCategoryEditPage.jsx      # Edit sub-category
├── components/
│   ├── CategoriesTable.jsx          # Categories data table
│   ├── CategoryForm.jsx             # Category create/edit form
│   ├── CategoryFilters.jsx          # Category filters
│   ├── CategoryDeleteDialog.jsx     # Delete confirmation
│   ├── SubCategoriesTable.jsx       # Sub-categories data table
│   ├── SubCategoryForm.jsx          # Sub-category create/edit form
│   ├── SubCategoryFilters.jsx       # Sub-category filters
│   ├── SubCategoryDeleteDialog.jsx  # Delete confirmation
│   ├── CategoryStatusChip.jsx       # Active/Inactive status
│   └── CodeDisplay.jsx              # Auto-generated code display
└── hooks/
    ├── useCategories.js             # Fetch categories
    ├── useCategoryCreate.js         # Create category
    ├── useCategoryUpdate.js         # Update category
    ├── useCategoryDelete.js         # Delete category
    ├── useSubCategories.js          # Fetch sub-categories
    ├── useSubCategoryCreate.js      # Create sub-category
    ├── useSubCategoryUpdate.js      # Update sub-category
    └── useSubCategoryDelete.js      # Delete sub-category
```

---

## Step-by-Step Implementation Guide

### Step 1: Create PMS Service Layer

**File:** `src/services/pmsService.js`

**Purpose:** Centralize all PMS-related API calls

**Category Functions:**

```javascript
// GET /categories - with pagination and filters
getCategories({ page, limit, is_active, search })

// GET /categories/:id
getCategoryById(id)

// POST /categories
createCategory(categoryData)

// PUT /categories/:id
updateCategory(id, categoryData)

// DELETE /categories/:id
deleteCategory(id)
```

**Sub-category Functions:**

```javascript
// GET /subcategories - with pagination and filters
getSubCategories({ page, limit, category_id, is_active, search })

// GET /subcategories/:id
getSubCategoryById(id)

// POST /subcategories
createSubCategory(subCategoryData)

// PUT /subcategories/:id
updateSubCategory(id, subCategoryData)

// DELETE /subcategories/:id
deleteSubCategory(id)
```

**Response Handling:**
- Use `pmsAPI` instance from `src/services/api.js`
- Extract data from standard envelope
- Handle pagination metadata
- Return standardized format

---

### Step 2: Build Categories List Page

**File:** `src/features/categories/pages/CategoriesListPage.jsx`

**Layout Structure:**

```
┌──────────────────────────────────────────────────────┐
│ Categories                           [+ New Category] │
├──────────────────────────────────────────────────────┤
│ [Status: All ▼] [Search.....................]         │
├──────────────────────────────────────────────────────┤
│                                                       │
│              [CategoriesTable Component]              │
│                                                       │
├──────────────────────────────────────────────────────┤
│           [Pagination: 1 2 3 ... 10 >]                │
└──────────────────────────────────────────────────────┘
```

**Page Header:**
- Title: "Categories"
- Breadcrumbs: Products > Categories
- Primary action: "New Category" button (if has `categories.create` permission)

**Filters Section:**
1. **Status Filter** - Dropdown: All, Active, Inactive
2. **Search Input** - Search by name or code

**Table Section:**
- Render `CategoriesTable` component
- Pass filtered data, loading state, and pagination info

**Pagination:**
- MUI `Pagination` component
- Items per page selector (10, 20, 50, 100)
- Show total items count
- Server-side pagination

**State Management:**
- `page` - current page number
- `limit` - items per page
- `isActive` - status filter
- `search` - search query
- `categories` - fetched data
- `loading` - loading state
- `totalPages` - pagination metadata

**Data Fetching:**
- Fetch on mount
- Re-fetch when filters/pagination change
- Debounce search input (500ms)
- Handle loading, error, empty states

---

### Step 3: Build Categories Table Component

**File:** `src/features/categories/components/CategoriesTable.jsx`

**Table Columns:**

| Column       | Data Source       | Width | Sortable | Display                         |
|--------------|-------------------|-------|-----------|---------------------------------|
| Name         | name              | 25%   | Yes       | Bold text                       |
| Code         | code              | 15%   | Yes       | Monospace font, uppercase       |
| Description  | description       | 35%   | No        | Truncate if > 100 chars         |
| Status       | isActive          | 10%   | Yes       | Active/Inactive chip            |
| Updated At   | updatedAt         | 10%   | Yes       | Formatted date                  |
| Actions      | -                 | 5%    | No        | View/Edit/Delete buttons        |

**Status Display:**
- Use `CategoryStatusChip` component
- Active: Green chip with "Active" text
- Inactive: Gray chip with "Inactive" text

**Actions Column:**

Show icon buttons based on permissions:

1. **View** - Eye icon, navigate to edit page (read-only mode)
2. **Edit** - Edit icon, visible if `categories.update` permission
3. **Delete** - Delete icon, visible if `categories.delete` permission

**Action Handlers:**
- **View:** Navigate to `/products/categories/:id` (view mode)
- **Edit:** Navigate to `/products/categories/:id/edit`
- **Delete:** Open delete confirmation dialog

**Table Features:**
- Sticky header
- Row hover highlighting
- Loading skeleton rows
- Empty state message
- Sort by clicking column headers
- Responsive horizontal scroll on mobile

**Code Display:**
- Display code in monospace font
- Uppercase styling
- Add copy-to-clipboard button (optional)

---

### Step 4: Build Category Filters Component

**File:** `src/features/categories/components/CategoryFilters.jsx`

**Filter Controls:**

1. **Status Dropdown**
   - Options: All, Active, Inactive
   - Default: All
   - On change: update isActive filter

2. **Search Input**
   - Placeholder: "Search by name or code..."
   - Debounced input (500ms)
   - Clear button (X icon)
   - On change: update search filter

**Layout:**
- Horizontal on desktop (side by side)
- Stack vertically on mobile
- Consistent spacing

**Props:**
- `filters` - current filter values
- `onFilterChange` - callback when any filter changes

---

### Step 5: Build Category Form Component

**File:** `src/features/categories/components/CategoryForm.jsx`

**Purpose:** Reusable form for create and edit

**Form Fields:**

| Field       | Type          | Required | Validation                              |
|-------------|---------------|----------|-----------------------------------------|
| Name        | Text          | Yes      | 2-100 chars, no leading/trailing spaces |
| Code        | Text          | No       | 2-10 chars, uppercase alphanumeric only |
| Description | Textarea      | No       | Max 500 characters                      |
| Is Active   | Switch/Toggle | No       | Default: true                           |

**Code Field Behavior:**

1. **Create Mode:**
   - Optional field
   - If provided: Validate uppercase alphanumeric
   - If empty: Backend auto-generates
   - Show hint: "Leave empty for auto-generation"

2. **Edit Mode:**
   - Display current code as read-only OR
   - Disable code editing (code cannot be changed after creation)
   - Show info message: "Code cannot be modified after creation"

**Code Auto-generation Preview:**
- After entering name, show preview of what code might be
- Example: "Electronics" → Preview: "ELEC" or "ELECT"
- Informational only, not editable
- Use `CodeDisplay` component

**Form Layout:**
- Single column layout
- Clear field labels
- Helper text below each field
- Required field indicator (asterisk)

**Form States:**
- **Idle:** Ready for input
- **Validating:** Field-level validation
- **Submitting:** API call in progress
- **Error:** Display server errors
- **Success:** Redirect to categories list

**Action Buttons:**
- **Save/Create** - Primary button
- **Cancel** - Secondary button, navigate back

**Props:**
- `mode` - 'create' or 'edit'
- `initialData` - Category data for edit mode
- `onSubmit` - Submit handler
- `onCancel` - Cancel handler

---

### Step 6: Build Category Create Page

**File:** `src/features/categories/pages/CategoryCreatePage.jsx`

**Layout:**

```
┌─────────────────────────────────────────┐
│ Create New Category           [Cancel]  │
├─────────────────────────────────────────┤
│                                         │
│      [CategoryForm Component]           │
│                                         │
└─────────────────────────────────────────┘
```

**Page Header:**
- Title: "Create New Category"
- Breadcrumbs: Products > Categories > New Category
- Cancel button (navigate back)

**Form Integration:**
- Render `CategoryForm` with `mode="create"`
- Handle form submission
- Call `createCategory()` API
- On success: Show success message, redirect to list
- On error: Display error on form

**Error Handling:**

| Error Code                | Display Message                                    |
|---------------------------|----------------------------------------------------|
| DUPLICATE_CATEGORY_NAME   | Category with this name already exists             |
| DUPLICATE_CATEGORY_CODE   | Category with this code already exists             |
| VALIDATION_ERROR          | Map field errors to respective inputs              |
| FORBIDDEN                 | You don't have permission to create categories     |

---

### Step 7: Build Category Edit Page

**File:** `src/features/categories/pages/CategoryEditPage.jsx`

**Similar to Create Page, but:**
- Title: "Edit Category"
- Breadcrumbs: Products > Categories > Edit Category
- Fetch category data on mount using categoryId from URL params
- Pre-populate form with existing data
- Code field read-only (cannot be changed)
- Call `updateCategory(id, data)` API on submit

**Additional Features:**

1. **Dependency Information:**
   - Show count of sub-categories under this category
   - Show count of products under this category
   - Warning: "This category has X sub-categories and Y products"

2. **Status Toggle Impact:**
   - If deactivating: Show warning about impact
   - Message: "Deactivating this category will affect X sub-categories and Y products"

**Loading State:**
- Show skeleton/spinner while fetching
- Show 404 if category not found

---

### Step 8: Build Category Delete Dialog

**File:** `src/features/categories/components/CategoryDeleteDialog.jsx`

**Purpose:** Confirmation dialog with dependency validation

**Dialog Content (with dependencies):**

```
┌─────────────────────────────────────────┐
│ Cannot Delete Category              [X] │
├─────────────────────────────────────────┤
│ Cannot delete category with active      │
│ sub-categories or products.              │
│                                          │
│ Category: Electronics                    │
│ Sub-categories: 5                        │
│ Products: 125                            │
│                                          │
│ Please move or delete sub-categories    │
│ and products first.                      │
├─────────────────────────────────────────┤
│                        [Close]           │
└─────────────────────────────────────────┘
```

**Dialog Content (no dependencies):**

```
┌─────────────────────────────────────────┐
│ Delete Category?                    [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to delete this    │
│ category?                                │
│                                          │
│ Category: Accessories                    │
│ Code: ACCES                              │
│                                          │
│ This action cannot be undone.            │
├─────────────────────────────────────────┤
│                   [Cancel]  [Delete]     │
└─────────────────────────────────────────┘
```

**Props:**
- `open` - Dialog visibility
- `category` - Category object to delete
- `onClose` - Close handler
- `onConfirm` - Delete confirmation handler

**Business Logic:**
- Backend returns dependency counts in error response
- Parse error and show counts
- Disable delete button if dependencies exist
- Only show delete button if no dependencies

---

### Step 9: Build Sub-Categories List Page

**File:** `src/features/categories/pages/SubCategoriesListPage.jsx`

**Layout Structure:**

```
┌──────────────────────────────────────────────────────┐
│ Sub-Categories                   [+ New Sub-Category] │
├──────────────────────────────────────────────────────┤
│ [Category: All ▼] [Status: All ▼] [Search...........]│
├──────────────────────────────────────────────────────┤
│                                                       │
│           [SubCategoriesTable Component]              │
│                                                       │
├──────────────────────────────────────────────────────┤
│           [Pagination: 1 2 3 ... 10 >]                │
└──────────────────────────────────────────────────────┘
```

**Page Header:**
- Title: "Sub-Categories"
- Breadcrumbs: Products > Sub-Categories
- Primary action: "New Sub-Category" button

**Filters Section:**
1. **Parent Category Filter** - Dropdown with all categories
2. **Status Filter** - All, Active, Inactive
3. **Search Input** - Search by name or code

**Table Section:**
- Similar to categories table
- Additional column: Parent Category

**State Management:**
- Additional filter: `category_id` (parent category filter)

---

### Step 10: Build Sub-Categories Table Component

**File:** `src/features/categories/components/SubCategoriesTable.jsx`

**Table Columns:**

| Column          | Data Source       | Width | Sortable | Display                         |
|-----------------|-------------------|-------|-----------|---------------------------------|
| Name            | name              | 20%   | Yes       | Bold text                       |
| Code            | code              | 12%   | Yes       | Monospace, uppercase            |
| Parent Category | categoryName      | 20%   | Yes       | Link to parent category         |
| Description     | description       | 28%   | No        | Truncate if long                |
| Status          | isActive          | 10%   | Yes       | Active/Inactive chip            |
| Updated At      | updatedAt         | 10%   | Yes       | Formatted date                  |
| Actions         | -                 | 5%    | No        | View/Edit/Delete                |

**Parent Category Display:**
- Clickable link to parent category edit page
- Or show as badge/chip
- Tooltip with parent category description

**Actions:**
- Similar to categories table
- View, Edit, Delete based on permissions

---

### Step 11: Build Sub-Category Form Component

**File:** `src/features/categories/components/SubCategoryForm.jsx`

**Form Fields:**

| Field           | Type          | Required | Validation                              |
|-----------------|---------------|----------|-----------------------------------------|
| Parent Category | Dropdown      | Yes      | Must select valid active category       |
| Name            | Text          | Yes      | 2-100 chars, no leading/trailing spaces |
| Code            | Text          | No       | 2-10 chars, uppercase alphanumeric      |
| Description     | Textarea      | No       | Max 500 characters                      |
| Is Active       | Switch/Toggle | No       | Default: true                           |

**Parent Category Dropdown:**
- Fetch all active categories
- Display: "Category Name (CODE)"
- Required field
- On change: May update code preview
- Show loading state while fetching categories

**Code Field Behavior:**
- Same as Category form (optional, auto-generated if empty)
- In edit mode: read-only

**Form Layout:**
- Single column
- Parent category field at top
- Clear visual hierarchy

**Validation:**
- Parent category required
- Parent category must be active
- Name required and unique within parent
- Code unique if provided

**Props:**
- `mode` - 'create' or 'edit'
- `initialData` - Sub-category data for edit mode
- `onSubmit` - Submit handler
- `onCancel` - Cancel handler

---

### Step 12: Build Sub-Category Create/Edit Pages

**Files:**
- `src/features/categories/pages/SubCategoryCreatePage.jsx`
- `src/features/categories/pages/SubCategoryEditPage.jsx`

**Similar to Category pages, but:**

**Create Page:**
- Pre-select parent category if coming from category detail page (via URL param)
- Title: "Create New Sub-Category"

**Edit Page:**
- Show parent category as read-only (cannot change parent)
- Show product count under this sub-category
- Warning if products exist and deactivating

**Error Handling:**

| Error Code                   | Display Message                                      |
|------------------------------|------------------------------------------------------|
| INVALID_CATEGORY             | Parent category not found or inactive                |
| DUPLICATE_SUBCATEGORY_NAME   | Sub-category with this name already exists           |
| DUPLICATE_SUBCATEGORY_CODE   | Sub-category with this code already exists           |

---

### Step 13: Build Sub-Category Delete Dialog

**File:** `src/features/categories/components/SubCategoryDeleteDialog.jsx`

**Similar to Category Delete Dialog:**

**With dependencies (products exist):**
```
Cannot delete sub-category with active products.

Sub-category: Wireless Routers
Parent: Electronics
Products: 45

Please move or delete products first.
```

**Without dependencies:**
```
Are you sure you want to delete this sub-category?

Sub-category: Wireless Routers
Parent: Electronics
Code: WROUTER

This action cannot be undone.
```

---

### Step 14: Create Code Display Component

**File:** `src/features/categories/components/CodeDisplay.jsx`

**Purpose:** Display auto-generated code with styling

**Features:**
- Monospace font
- Uppercase display
- Border/background styling
- Copy to clipboard button
- Icon indicator (code icon)

**Usage Contexts:**
1. **Preview during creation** - Show what code will be generated
2. **Display in forms** - Show current code in edit mode
3. **Table display** - Show code in list tables

**Props:**
- `code` - Code string to display
- `label` - Optional label text
- `readOnly` - Whether this is read-only
- `canCopy` - Show copy button

---

## API Integration Specifications

### GET /categories

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `is_active` (optional, boolean)
- `search` (optional, string)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123456",
        "name": "Electronics",
        "code": "ELEC",
        "description": "Electronic devices and accessories",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2026-01-14T10:00:00Z",
        "updatedAt": "2026-01-14T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /categories

**Request Body:**
```json
{
  "name": "Electronics",
  "code": "ELEC",
  "description": "Electronic devices and accessories",
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123456",
    "name": "Electronics",
    "code": "ELEC",
    "description": "Electronic devices and accessories",
    "isActive": true,
    "createdAt": "2026-01-14T10:00:00Z"
  },
  "message": "Category 'Electronics' created successfully"
}
```

**Error (409):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CATEGORY_NAME",
    "message": "Category with name 'Electronics' already exists"
  }
}
```

### PUT /categories/:id

**Request Body:** (all fields optional except code)
```json
{
  "name": "Electronics & Gadgets",
  "description": "Updated description",
  "isActive": true
}
```

**Note:** Code cannot be updated after creation

### DELETE /categories/:id

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error (400) - Has Dependencies:**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_SUBCATEGORIES",
    "message": "Cannot delete category. It has 5 active sub-categories.",
    "details": {
      "subCategoryCount": 5,
      "productCount": 125
    }
  }
}
```

### GET /subcategories

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category_id` (optional) - Filter by parent category
- `is_active` (optional, boolean)
- `search` (optional, string)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123457",
        "name": "Routers",
        "code": "ROUTER",
        "categoryId": "6789abcd1234567890123456",
        "categoryName": "Electronics",
        "description": "Network routers",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2026-01-14T10:30:00Z",
        "updatedAt": "2026-01-14T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /subcategories

**Request Body:**
```json
{
  "name": "Routers",
  "code": "ROUTER",
  "categoryId": "6789abcd1234567890123456",
  "description": "Network routers and access points",
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123457",
    "name": "Routers",
    "code": "ROUTER",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "description": "Network routers and access points",
    "isActive": true,
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "Sub-category 'Routers' created successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY",
    "message": "Parent category not found or inactive"
  }
}
```

### DELETE /subcategories/:id

**Error (400) - Has Products:**
```json
{
  "success": false,
  "error": {
    "code": "SUBCATEGORY_HAS_PRODUCTS",
    "message": "Cannot delete sub-category. It has 25 active products.",
    "details": {
      "productCount": 25
    }
  }
}
```

---

## Validation Rules

### Category Form Validation

**Name:**
- Required
- 2-100 characters
- No leading/trailing spaces
- Unique (case-insensitive)

**Code:**
- Optional on create (auto-generated if empty)
- If provided: 2-10 characters
- Uppercase alphanumeric only: `/^[A-Z0-9]+$/`
- Unique
- Read-only in edit mode (cannot change)

**Description:**
- Optional
- Max 500 characters
- Multiline allowed

**Is Active:**
- Optional, default true

### Sub-Category Form Validation

**Parent Category:**
- Required
- Must be valid active category ID

**Name:**
- Required
- 2-100 characters
- No leading/trailing spaces
- Unique within parent category

**Code:**
- Same as Category code validation

**Description:**
- Same as Category description validation

---

## User Experience Requirements

### Loading States

**List Pages:**
- Skeleton table rows (5 rows)
- Disable filters during load
- Show spinner in pagination

**Form Submit:**
- Disable all inputs
- Spinner on submit button
- Button text: "Save" → "Saving..."

**Delete Operation:**
- Show spinner in delete button
- Disable dialog close during delete

### Success Feedback

**Created:**
- Snackbar: "Category created successfully"
- Redirect to list after 1 second

**Updated:**
- Snackbar: "Category updated successfully"
- Redirect to list

**Deleted:**
- Snackbar: "Category deleted successfully"
- Refresh list

### Error Feedback

**Dependency Errors:**
- Clear modal dialog explaining dependencies
- Show counts (sub-categories, products)
- Suggest resolution steps
- No delete button, only close

**Validation Errors:**
- Inline below fields (red text)
- Clear on field focus
- Highlight invalid field borders

**Duplicate Errors:**
- Show on relevant field
- Message: "This name/code already exists"
- Suggest alternatives if possible

### Empty States

**No Categories:**
- Icon: CategoryOffIcon
- Message: "No categories found"
- Action: "Create Category" button

**No Sub-Categories:**
- Icon: SubdirectoryArrowRightIcon
- Message: "No sub-categories found"
- Action: "Create Sub-Category" button

**No Search Results:**
- Icon: SearchOffIcon
- Message: "No results for '{searchTerm}'"
- Action: "Clear Search" button

---

## Code Auto-Generation Logic (Frontend Display)

The backend handles actual generation, but frontend should:

**Preview Strategy:**
1. User types category name: "Electronics"
2. Show preview: "Suggested code: ELEC"
3. Informational only (backend decides final code)
4. If user provides custom code, validate format

**Display Strategy:**
- Show in light gray box with monospace font
- Icon: CodeIcon
- Label: "Auto-generated Code" or "Code"
- Copy button for convenience

---

## Permission-Based UI Rendering

### Categories Module

| Element             | Required Permission  | Behavior if Missing     |
|---------------------|----------------------|-------------------------|
| View List           | categories.read      | Redirect to 403         |
| "New Category" btn  | categories.create    | Hide button             |
| Edit action         | categories.update    | Hide edit icon          |
| Delete action       | categories.delete    | Hide delete icon        |
| Create page         | categories.create    | Redirect to 403         |
| Edit page           | categories.update    | Redirect to 403         |

### Sub-Categories Module

| Element                | Required Permission  | Behavior if Missing     |
|------------------------|----------------------|-------------------------|
| View List              | categories.read      | Redirect to 403         |
| "New Sub-Category" btn | categories.create    | Hide button             |
| Edit action            | categories.update    | Hide edit icon          |
| Delete action          | categories.delete    | Hide delete icon        |

---

## Testing Checklist

### Categories Tests

- [ ] Categories list loads with pagination
- [ ] Status filter works (All/Active/Inactive)
- [ ] Search filters correctly (debounced)
- [ ] Pagination navigation works
- [ ] Items per page selector works
- [ ] Sorting works
- [ ] Can create category with auto-generated code
- [ ] Can create category with custom code
- [ ] Custom code validated (uppercase alphanumeric)
- [ ] Cannot create duplicate name
- [ ] Cannot create duplicate code
- [ ] Can edit category (name, description, status)
- [ ] Code read-only in edit mode
- [ ] Cannot delete category with sub-categories
- [ ] Cannot delete category with products
- [ ] Can delete category without dependencies
- [ ] Success messages display correctly
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Empty states show

### Sub-Categories Tests

- [ ] Sub-categories list loads with pagination
- [ ] Parent category filter works
- [ ] Status filter works
- [ ] Search works
- [ ] Can create sub-category with parent selection
- [ ] Parent category dropdown loads categories
- [ ] Cannot create without parent category
- [ ] Cannot create with inactive parent category
- [ ] Code auto-generation works
- [ ] Can edit sub-category
- [ ] Cannot change parent category in edit mode
- [ ] Cannot delete sub-category with products
- [ ] Can delete without products
- [ ] Parent category displays as link in table
- [ ] All validations work

### Permission Tests

- [ ] User without categories.read cannot access lists
- [ ] User without categories.create cannot see create buttons
- [ ] User without categories.update cannot edit
- [ ] User without categories.delete cannot delete
- [ ] Super Admin can access all features

---

## Common Issues and Solutions

### Issue: Code auto-generation not consistent

**Cause:** Frontend trying to generate code, backend generates differently

**Solution:** Frontend only shows preview/suggestion. Backend is source of truth.

### Issue: Cannot delete category - has products but no sub-categories

**Cause:** Products linked directly to category

**Solution:** Backend should return both counts. Show clear message with product count.

### Issue: Parent category dropdown empty

**Cause:** No active categories OR permission issue

**Solution:** Handle empty state. Show message: "No active categories available. Create a category first."

### Issue: Search not working across code and name

**Cause:** Backend only searches one field

**Solution:** Verify backend searches both. If not, document limitation.

### Issue: Duplicate code error on create

**Cause:** User manually entered code that already exists

**Solution:** Clear error message. Backend should suggest alternative.

---

## Advanced Features (Optional Enhancements)

### Category Tree View

Alternative view showing hierarchical structure:
- Expandable tree
- Category → Sub-categories
- Visual hierarchy
- Quick navigation

### Bulk Operations

- Bulk activate/deactivate
- Bulk delete (with validation)
- Export to CSV
- Import from CSV

### Category Details Page

Dedicated page showing:
- Category information
- All sub-categories under it
- Product count and samples
- Edit inline
- Quick actions

### Drag-and-Drop Reordering

Allow reordering categories/sub-categories:
- Visual drag handles
- Save order to backend
- Display order reflected in dropdowns

---

## Performance Considerations

- Cache categories list for parent dropdown (changes infrequently)
- Debounce search input (500ms)
- Server-side pagination for large datasets
- Memoize filter components
- Optimize table rendering (virtualization if needed)

---

## Accessibility Requirements

- [ ] All form fields have labels
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Keyboard navigation works
- [ ] Dropdown keyboard accessible
- [ ] Table keyboard navigable
- [ ] Status chips have aria-label
- [ ] Delete dialogs keyboard accessible

---

## File Structure After Phase 5

```
src/
├── features/
│   └── categories/
│       ├── pages/
│       │   ├── CategoriesListPage.jsx
│       │   ├── CategoryCreatePage.jsx
│       │   ├── CategoryEditPage.jsx
│       │   ├── SubCategoriesListPage.jsx
│       │   ├── SubCategoryCreatePage.jsx
│       │   └── SubCategoryEditPage.jsx
│       ├── components/
│       │   ├── CategoriesTable.jsx
│       │   ├── CategoryForm.jsx
│       │   ├── CategoryFilters.jsx
│       │   ├── CategoryDeleteDialog.jsx
│       │   ├── SubCategoriesTable.jsx
│       │   ├── SubCategoryForm.jsx
│       │   ├── SubCategoryFilters.jsx
│       │   ├── SubCategoryDeleteDialog.jsx
│       │   ├── CategoryStatusChip.jsx
│       │   └── CodeDisplay.jsx
│       └── hooks/
│           ├── useCategories.js
│           ├── useCategoryCreate.js
│           ├── useCategoryUpdate.js
│           ├── useCategoryDelete.js
│           ├── useSubCategories.js
│           ├── useSubCategoryCreate.js
│           ├── useSubCategoryUpdate.js
│           └── useSubCategoryDelete.js
├── services/
│   └── pmsService.js
└── routes/
    └── AppRoutes.jsx (updated with category routes)
```

---

## Success Criteria

Phase 5 is complete when:

- [ ] Categories list page functional
- [ ] Can create/edit/delete categories
- [ ] Code auto-generation works
- [ ] Cannot delete category with dependencies
- [ ] Sub-categories list page functional
- [ ] Can create/edit/delete sub-categories
- [ ] Parent category selection works
- [ ] Cannot delete sub-category with products
- [ ] All filters work (status, search, parent)
- [ ] Pagination works correctly
- [ ] All validations work
- [ ] Permission-based access works
- [ ] Loading and error states handled
- [ ] Responsive design works
- [ ] All tests pass
- [ ] No console errors

---

## Next Steps After Phase 5

Once category management is complete:

✅ **Phase 6: Products Management (Core)**
- Products list with advanced filters
- Product create form (multi-step/stepper)
- Product edit functionality
- Product delete
- SKU auto-generation display
- Category and sub-category selection

---

## Estimated Time

**Total:** 14-16 hours

**Breakdown:**
- PMS service layer: 1.5 hours
- Categories list + table: 2.5 hours
- Category create/edit + form: 2.5 hours
- Category delete with validation: 1 hour
- Sub-categories list + table: 2 hours
- Sub-category create/edit + form: 2 hours
- Sub-category delete: 1 hour
- Code display component: 0.5 hour
- Testing and bug fixes: 2 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 5**

**Status:** Ready for implementation  
**Next Phase:** Phase 6 - Products Management (Core)
