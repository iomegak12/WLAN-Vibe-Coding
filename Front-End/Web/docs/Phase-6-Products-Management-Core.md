# Phase 6: Products Management (Core)

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 6 - Products Management (Core)  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2, 3, 4, 5 must be completed

---

## Phase Objectives

Implement core product management functionality:
- ✅ Products list with advanced filters and search
- ✅ Product create form (multi-step/stepper approach)
- ✅ Product edit functionality
- ✅ Product delete with soft delete
- ✅ SKU auto-generation and display
- ✅ Category and sub-category cascading selection
- ✅ Product specifications (dynamic key-value pairs)
- ✅ Price and warranty management
- ✅ Product status management
- ✅ Integration with PMS service

**Note:** Product images, QR codes, and barcodes will be handled in Phase 7.

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0-5: Foundation through Category Management
- [x] Categories and sub-categories functional
- [x] Navigation includes Products menu

### Backend Verification
Test PMS service product endpoints:

```bash
# Get products list
curl -X GET http://localhost:5002/api/v1/products

# Expected: 200 OK with products array
```

---

## Architecture Overview

### Module Structure

```
src/features/products/
├── pages/
│   ├── ProductsListPage.jsx         # Products list
│   ├── ProductCreatePage.jsx        # Create product (stepper)
│   ├── ProductEditPage.jsx          # Edit product
│   └── ProductDetailPage.jsx        # View product details
├── components/
│   ├── ProductsTable.jsx            # Products data table
│   ├── ProductFilters.jsx           # Advanced filter controls
│   ├── ProductForm.jsx              # Main product form wrapper
│   ├── ProductDeleteDialog.jsx      # Delete confirmation
│   ├── ProductStatusChip.jsx        # Status badge
│   ├── SkuDisplay.jsx               # SKU display component
│   │
│   ├── formSteps/                   # Multi-step form components
│   │   ├── ClassificationStep.jsx   # Step 1: Category/Sub-category
│   │   ├── IdentityStep.jsx         # Step 2: Name, Brand, Model, SKU
│   │   ├── CommercialStep.jsx       # Step 3: Price, Warranty, Status
│   │   ├── SpecificationsStep.jsx   # Step 4: Key-value specs
│   │   └── ReviewStep.jsx           # Step 5: Review and submit
│   │
│   └── shared/
│       ├── CategorySelector.jsx     # Category + sub-category picker
│       ├── SpecificationEditor.jsx  # Dynamic key-value editor
│       └── PriceInput.jsx           # Currency input component
└── hooks/
    ├── useProducts.js               # Fetch products list
    ├── useProductCreate.js          # Create product
    ├── useProductUpdate.js          # Update product
    ├── useProductDelete.js          # Delete product
    └── useProductStepper.js         # Stepper state management
```

---

## Step-by-Step Implementation Guide

### Step 1: Extend PMS Service Layer

**File:** `src/services/pmsService.js` (update)

**Add Product Functions:**

```javascript
// GET /products - with pagination and advanced filters
getProducts({ 
  page, 
  limit, 
  category_id, 
  subcategory_id, 
  brand, 
  status, 
  price_min, 
  price_max, 
  search 
})

// GET /products/:id
getProductById(id)

// POST /products
createProduct(productData)

// PUT /products/:id
updateProduct(id, productData)

// DELETE /products/:id
deleteProduct(id)
```

**Response Handling:**
- Extract from standard envelope
- Handle pagination metadata
- Return standardized format

---

### Step 2: Build Products List Page

**File:** `src/features/products/pages/ProductsListPage.jsx`

**Layout Structure:**

```
┌───────────────────────────────────────────────────────┐
│ Products                              [+ New Product]  │
├───────────────────────────────────────────────────────┤
│ [Advanced Filters - Expandable Panel]                 │
│   Category: [All ▼]  Sub-category: [All ▼]           │
│   Brand: [All ▼]     Status: [All ▼]                  │
│   Price: [Min] - [Max]                                │
│   Search: [............................]               │
│                                     [Clear] [Apply]    │
├───────────────────────────────────────────────────────┤
│                                                        │
│              [ProductsTable Component]                 │
│                                                        │
├───────────────────────────────────────────────────────┤
│           [Pagination: 1 2 3 ... 25 >]                 │
└───────────────────────────────────────────────────────┘
```

**Page Header:**
- Title: "Products"
- Breadcrumbs: Products > Products
- Primary action: "New Product" button (if has `products.create`)

**Filters Section:**

**Collapsible Filter Panel:**
- Collapsed by default (show count of active filters)
- Expand to show all filter controls
- "Clear All" and "Apply Filters" buttons

**Filter Controls:**
1. **Category Dropdown** - All categories
2. **Sub-category Dropdown** - Filtered by selected category
3. **Brand Input/Dropdown** - All unique brands (or text input)
4. **Status Dropdown** - Active, Discontinued, Out of Stock, Coming Soon, All
5. **Price Range** - Min and Max inputs
6. **Search Input** - Search SKU, name, brand, model

**Filter Behavior:**
- Category change: Reset sub-category
- Sub-category dropdown: Only show sub-categories of selected category
- Apply button: Execute search
- Clear button: Reset all filters

**State Management:**
- `page`, `limit` - pagination
- `categoryId`, `subCategoryId` - classification filters
- `brand`, `status` - attribute filters
- `priceMin`, `priceMax` - price range
- `search` - search query
- `products` - fetched data
- `loading` - loading state
- `totalPages` - pagination metadata

---

### Step 3: Build Products Table Component

**File:** `src/features/products/components/ProductsTable.jsx`

**Table Columns:**

| Column        | Data Source           | Width | Display                              |
|---------------|-----------------------|-------|--------------------------------------|
| SKU           | sku                   | 12%   | Monospace, bold, copyable            |
| Name          | name                  | 20%   | Bold text, truncate if long          |
| Category      | categoryName          | 12%   | Normal text                          |
| Sub-category  | subCategoryName       | 12%   | Normal text                          |
| Brand         | brand                 | 10%   | Normal text                          |
| Model         | model                 | 10%   | Normal text, truncate                |
| Price         | price + currency      | 8%    | Formatted: ₹45,000.00                |
| Status        | status                | 8%    | Colored chip                         |
| Actions       | -                     | 8%    | View/Edit/Delete buttons             |

**SKU Display:**
- Use `SkuDisplay` component
- Monospace font
- Copy-to-clipboard button
- Tooltip on hover

**Status Display:**
- Use `ProductStatusChip` component
- Colors:
  - Active: Green
  - Discontinued: Red
  - Out of Stock: Orange
  - Coming Soon: Blue

**Price Display:**
- Format with currency symbol
- Indian number format: ₹45,000.00
- Right-aligned

**Actions Column:**
1. **View** - Eye icon, navigate to detail page
2. **Edit** - Edit icon, visible if `products.update`
3. **Delete** - Delete icon, visible if `products.delete`

**Table Features:**
- Sticky header
- Row hover highlighting
- Loading skeleton
- Empty state
- Sort by clicking columns
- Responsive horizontal scroll

---

### Step 4: Build Product Filters Component

**File:** `src/features/products/components/ProductFilters.jsx`

**Purpose:** Advanced filter controls in collapsible panel

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ [▼] Filters (3 active)              [Clear All] │
├─────────────────────────────────────────────────┤
│  Category:      [Select Category ▼]             │
│  Sub-category:  [Select Sub-category ▼]         │
│  Brand:         [Select Brand ▼]                │
│  Status:        [All ▼]                         │
│  Price Range:   [Min] - [Max]                   │
│  Search:        [Search SKU, name, brand...]    │
│                                                  │
│                       [Clear Filters] [Apply]   │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Collapsible Panel:**
   - Accordion component
   - Show active filter count in header
   - Expand/collapse with animation

2. **Category-SubCategory Cascade:**
   - Sub-category dropdown depends on category
   - Disable sub-category if no category selected
   - Auto-fetch sub-categories when category changes

3. **Brand Dropdown:**
   - Fetch unique brands from products (or predefined list)
   - Searchable dropdown
   - "All Brands" option

4. **Price Range:**
   - Two number inputs (min, max)
   - Validation: min <= max
   - Currency symbol prefix

5. **Search Input:**
   - Debounced (500ms)
   - Placeholder: "Search by SKU, name, brand, model..."
   - Clear button

**Props:**
- `filters` - current filter values
- `onFilterChange` - callback when filters change
- `onApply` - callback when Apply clicked
- `onClear` - callback when Clear clicked

---

### Step 5: Build Product Create Page (Multi-Step Form)

**File:** `src/features/products/pages/ProductCreatePage.jsx`

**Purpose:** Create product using a stepper (wizard) approach

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Create New Product                        [Cancel]   │
├─────────────────────────────────────────────────────┤
│ [Stepper: 1.Classification → 2.Identity → 3.Commercial → 4.Specs → 5.Review] │
├─────────────────────────────────────────────────────┤
│                                                      │
│           [Current Step Component]                   │
│                                                      │
├─────────────────────────────────────────────────────┤
│                       [Back]  [Next/Submit]          │
└─────────────────────────────────────────────────────┘
```

**Stepper Structure:**

**Step 1: Classification**
- Select Category (required)
- Select Sub-category (required, depends on category)
- Purpose: Determines product classification

**Step 2: Identity**
- Product Name (required)
- Brand (required)
- Model (required)
- SKU Behavior: Auto-generated (display-only)
- Description (optional)

**Step 3: Commercial**
- Price (required)
- Currency (default: INR)
- Unit of Measure (default: piece)
- Warranty Period (optional)
- Warranty Unit (days/months/years)
- Status (Active/Discontinued/Out of Stock/Coming Soon)

**Step 4: Specifications**
- Dynamic key-value pairs
- Add/remove specification rows
- Optional section

**Step 5: Review**
- Show all entered data
- Organized by sections
- Edit buttons to go back to specific step
- Submit button

**Stepper Behavior:**
- Linear progression (cannot skip steps)
- Validate current step before proceeding to next
- Back button: Go to previous step
- Next button: Validate and go to next step
- Submit button: Only on last step (Review)

**State Management:**
- Single form state object with all fields
- Track current step (0-4)
- Track validation errors per step
- Use custom hook `useProductStepper`

---

### Step 6: Build Stepper Components

#### Step 1: Classification

**File:** `src/features/products/components/formSteps/ClassificationStep.jsx`

**Fields:**
- Category dropdown (required)
- Sub-category dropdown (required, cascading)

**Behavior:**
- Fetch categories on mount
- When category selected: Fetch sub-categories
- Clear sub-category if category changes
- Disable Next until both selected

**Use:** `CategorySelector` shared component

---

#### Step 2: Identity

**File:** `src/features/products/components/formSteps/IdentityStep.jsx`

**Fields:**
- Product Name (text, required, 2-200 chars)
- Brand (text, required, 2-100 chars)
- Model (text, required, 2-100 chars)
- Description (textarea, optional, max 1000 chars)

**SKU Preview:**
- Display read-only SKU preview
- Format: `{CategoryCode}-{SubCategoryCode}-{Brand}-{Sequence}`
- Example: "ELEC-ROUTER-CISCO-0001"
- Use `SkuDisplay` component
- Note: "SKU will be generated by the system"

**Validation:**
- Name required, no leading/trailing spaces
- Brand required
- Model required

---

#### Step 3: Commercial

**File:** `src/features/products/components/formSteps/CommercialStep.jsx`

**Fields:**

| Field            | Type            | Required | Default | Validation        |
|------------------|-----------------|----------|---------|-------------------|
| Price            | Number          | Yes      | -       | Positive, 2 decimals |
| Currency         | Dropdown        | No       | INR     | -                 |
| Unit of Measure  | Text/Dropdown   | No       | piece   | -                 |
| Dimensions       | Object          | No       | -       | Positive numbers  |
| - Length         | Number          | No       | -       | Positive          |
| - Width          | Number          | No       | -       | Positive          |
| - Height         | Number          | No       | -       | Positive          |
| - Unit           | Dropdown        | No       | cm      | cm/m/inch         |
| Weight           | Number          | No       | -       | Positive          |
| Weight Unit      | Dropdown        | No       | kg      | kg/g/lb           |
| Warranty Period  | Number          | No       | -       | Positive integer  |
| Warranty Unit    | Dropdown        | No       | months  | days/months/years |
| Status           | Dropdown        | No       | Active  | Enum              |

**Price Input:**
- Use `PriceInput` component
- Currency symbol prefix
- Format with thousands separator
- Max 2 decimal places

**Dimensions Section:**
- Optional collapsible section
- Only save if at least one dimension provided
- All dimensions or none

**Status Dropdown:**
- Options: Active, Discontinued, Out of Stock, Coming Soon
- Default: Active
- Color-coded in dropdown

---

#### Step 4: Specifications

**File:** `src/features/products/components/formSteps/SpecificationsStep.jsx`

**Purpose:** Add dynamic key-value specifications

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Product Specifications (Optional)           │
│                                             │
│ [+ Add Specification]                       │
│                                             │
│ Key              Value              [Remove]│
│ [Ports        ] [24              ] [X]      │
│ [Type         ] [Gigabit Ethernet] [X]      │
│ [PoE          ] [No              ] [X]      │
│                                             │
│ [+ Add Another]                             │
└─────────────────────────────────────────────┘
```

**Features:**
- Add/remove specification rows
- Two inputs per row: Key and Value
- Minimum 0 rows (optional)
- Maximum 20 rows (reasonable limit)
- Validate: Key and Value both required if row exists

**Use:** `SpecificationEditor` shared component

**Data Structure:**
```javascript
specifications: {
  "ports": "24",
  "type": "Gigabit Ethernet",
  "poe": "No",
  "stackable": "Yes"
}
```

---

#### Step 5: Review

**File:** `src/features/products/components/formSteps/ReviewStep.jsx`

**Purpose:** Review all entered data before submission

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Review Product Information                  │
│                                             │
│ Classification                     [Edit]   │
│   Category: Electronics                     │
│   Sub-category: Routers                     │
│                                             │
│ Identity                           [Edit]   │
│   Name: Cisco Catalyst 2960-X Series       │
│   Brand: Cisco                              │
│   Model: WS-C2960X-24TS-L                   │
│   SKU: ELEC-ROUTER-CISCO-0001 (auto)       │
│                                             │
│ Commercial Details                 [Edit]   │
│   Price: ₹45,000.00                         │
│   Warranty: 12 months                       │
│   Status: Active                            │
│                                             │
│ Specifications                     [Edit]   │
│   Ports: 24                                 │
│   Type: Gigabit Ethernet                    │
│   ...                                       │
└─────────────────────────────────────────────┘
```

**Features:**
- Display all data in organized sections
- Edit buttons to jump back to specific step
- Visual indicators (icons) for each section
- Highlight required fields
- Submit button at bottom

**Submit Behavior:**
- Call `createProduct()` API
- Show loading overlay during submit
- On success: Show success message, redirect to products list
- On error: Show error, allow retry

---

### Step 7: Build Shared Components

#### CategorySelector Component

**File:** `src/features/products/components/shared/CategorySelector.jsx`

**Purpose:** Reusable category + sub-category cascading selector

**Props:**
- `categoryId` - selected category
- `subCategoryId` - selected sub-category
- `onCategoryChange` - callback
- `onSubCategoryChange` - callback
- `required` - boolean
- `disabled` - boolean

**Features:**
- Fetch categories on mount
- Fetch sub-categories when category changes
- Reset sub-category when category changes
- Show loading states
- Display validation errors

---

#### SpecificationEditor Component

**File:** `src/features/products/components/shared/SpecificationEditor.jsx`

**Purpose:** Dynamic key-value pair editor

**Props:**
- `specifications` - object with key-value pairs
- `onChange` - callback when specifications change
- `maxRows` - maximum allowed rows (default: 20)

**Features:**
- Add row button
- Remove row button
- Validate both key and value required
- Prevent duplicate keys
- Auto-focus new row inputs

---

#### PriceInput Component

**File:** `src/features/products/components/shared/PriceInput.jsx`

**Purpose:** Currency-formatted number input

**Props:**
- `value` - price value
- `currency` - currency code (default: INR)
- `onChange` - callback
- `disabled` - boolean

**Features:**
- Currency symbol prefix (₹ for INR)
- Thousands separator formatting
- Max 2 decimal places
- Numeric input only
- Blur formatting

---

#### SkuDisplay Component

**File:** `src/features/products/components/SkuDisplay.jsx`

**Purpose:** Display SKU with special styling

**Props:**
- `sku` - SKU string
- `label` - optional label
- `isGenerated` - show "auto-generated" indicator
- `canCopy` - show copy button

**Features:**
- Monospace font
- Bold styling
- Copy to clipboard button
- Tooltip: "Click to copy"
- Success feedback on copy

---

### Step 8: Build Product Edit Page

**File:** `src/features/products/pages/ProductEditPage.jsx`

**Similar to Create, but:**

**Differences:**
1. Fetch product data on mount
2. Pre-populate all form fields
3. SKU displayed as read-only (cannot change)
4. May use single-page form instead of stepper (optional)
5. Show "Last updated" timestamp

**Single-Page Form Option:**
- All fields on one page with sections
- Scroll to sections
- Sticky save button
- Better for editing (don't need wizard)

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Edit Product                      [Cancel]  │
├─────────────────────────────────────────────┤
│ SKU: ELEC-ROUTER-CISCO-0001 (read-only)    │
│                                             │
│ [Classification Section]                    │
│ [Identity Section]                          │
│ [Commercial Section]                        │
│ [Specifications Section]                    │
│                                             │
│                           [Cancel] [Save]   │
└─────────────────────────────────────────────┘
```

**Restrictions:**
- Cannot change category/sub-category (or warn if changing)
- Cannot change brand (or warn if changing - affects SKU)
- SKU always read-only
- Cannot change if product has inventory (future consideration)

---

### Step 9: Build Product Detail Page

**File:** `src/features/products/pages/ProductDetailPage.jsx`

**Purpose:** View complete product information

**Layout:**

```
┌───────────────────────────────────────────────────┐
│ Product Details                    [Edit] [Delete] │
├───────────────────────────────────────────────────┤
│ [Product Image Placeholder - Phase 7]             │
│                                                    │
│ Cisco Catalyst 2960-X Series Switch               │
│ SKU: ELEC-ROUTER-CISCO-0001           [Active]    │
│                                                    │
│ Classification                                     │
│   Category: Electronics                            │
│   Sub-category: Routers                            │
│                                                    │
│ Product Information                                │
│   Brand: Cisco                                     │
│   Model: WS-C2960X-24TS-L                          │
│   Description: 24-port Gigabit Ethernet switch    │
│                                                    │
│ Pricing & Warranty                                 │
│   Price: ₹45,000.00                                │
│   Unit: piece                                      │
│   Warranty: 12 months                              │
│                                                    │
│ Specifications                                     │
│   Ports: 24                                        │
│   Type: Gigabit Ethernet                           │
│   PoE: No                                          │
│   Stackable: Yes                                   │
│                                                    │
│ Metadata                                           │
│   Created: Jan 14, 2026                            │
│   Updated: Jan 14, 2026                            │
│   Created by: Ramkumar Singh                       │
└───────────────────────────────────────────────────┘
```

**Features:**
- Read-only view of all product data
- Action buttons (Edit, Delete) based on permissions
- Organized in clear sections
- Copy SKU button
- Status chip display
- Navigate to edit page on Edit click
- Show delete confirmation on Delete click

---

### Step 10: Build Product Delete Dialog

**File:** `src/features/products/components/ProductDeleteDialog.jsx`

**Dialog Content:**

```
┌─────────────────────────────────────────┐
│ Delete Product?                     [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to delete this    │
│ product?                                 │
│                                          │
│ Product: Cisco Catalyst 2960-X Series   │
│ SKU: ELEC-ROUTER-CISCO-0001              │
│                                          │
│ This is a soft delete. The product      │
│ will be marked as deleted but data      │
│ will be retained.                        │
├─────────────────────────────────────────┤
│                   [Cancel]  [Delete]     │
└─────────────────────────────────────────┘
```

**Props:**
- `open` - dialog visibility
- `product` - product object
- `onClose` - close handler
- `onConfirm` - delete confirmation handler

**Business Logic:**
- Soft delete (isDeleted flag)
- Cannot delete if linked to inventory (future validation)
- Show loading during delete
- Success message on completion

---

### Step 11: Create Custom Hooks

#### useProductStepper Hook

**File:** `src/features/products/hooks/useProductStepper.js`

**Purpose:** Manage stepper state and navigation

**Returns:**
```javascript
{
  currentStep,           // Current step index (0-4)
  formData,              // All form data
  goToStep,              // Function to navigate to step
  goNext,                // Go to next step
  goBack,                // Go to previous step
  updateFormData,        // Update form data
  validateStep,          // Validate current step
  canProceed,            // Boolean - can go to next step
  resetForm,             // Reset form to initial state
}
```

**Logic:**
- Track current step
- Store form data in state
- Validate data before allowing next step
- Provide navigation functions

---

#### useProducts Hook

**File:** `src/features/products/hooks/useProducts.js`

**Purpose:** Fetch products with filters

**Returns:**
```javascript
{
  products,              // Array of products
  loading,               // Boolean
  error,                 // Error message
  totalPages,            // Number
  totalItems,            // Number
  refetch,               // Function to re-fetch
}
```

**Accepts:**
- Filters object with all filter parameters

---

#### useProductCreate Hook

**File:** `src/features/products/hooks/useProductCreate.js`

**Returns:**
```javascript
{
  createProduct,         // Function to create
  loading,               // Boolean
  error,                 // Error message
}
```

---

#### useProductUpdate Hook

**File:** `src/features/products/hooks/useProductUpdate.js`

**Returns:**
```javascript
{
  updateProduct,         // Function to update
  loading,               // Boolean
  error,                 // Error message
}
```

---

#### useProductDelete Hook

**File:** `src/features/products/hooks/useProductDelete.js`

**Returns:**
```javascript
{
  deleteProduct,         // Function to delete
  loading,               // Boolean
  error,                 // Error message
}
```

---

## API Integration Specifications

### GET /products

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category_id` (optional)
- `subcategory_id` (optional)
- `brand` (optional)
- `status` (optional)
- `price_min` (optional)
- `price_max` (optional)
- `search` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "6789abcd1234567890123458",
        "sku": "ELEC-ROUTER-CISCO-0001",
        "name": "Cisco Catalyst 2960-X Series Switch",
        "categoryName": "Electronics",
        "subCategoryName": "Routers",
        "brand": "Cisco",
        "model": "WS-C2960X-24TS-L",
        "price": 45000.00,
        "currency": "INR",
        "status": "Active",
        "createdAt": "2026-01-14T12:00:00Z",
        "updatedAt": "2026-01-14T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "pages": 250,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /products/:id

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "6789abcd1234567890123458",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch",
    "categoryId": "6789abcd1234567890123456",
    "categoryName": "Electronics",
    "subCategoryId": "6789abcd1234567890123457",
    "subCategoryName": "Routers",
    "brand": "Cisco",
    "model": "WS-C2960X-24TS-L",
    "description": "24-port Gigabit Ethernet switch",
    "specifications": {
      "ports": "24",
      "type": "Gigabit Ethernet",
      "poe": "No",
      "stackable": "Yes"
    },
    "price": 45000.00,
    "currency": "INR",
    "unitOfMeasure": "piece",
    "dimensions": {
      "length": 44.5,
      "width": 24.4,
      "height": 4.4,
      "unit": "cm"
    },
    "weight": 3.6,
    "weightUnit": "kg",
    "warrantyPeriod": 12,
    "warrantyUnit": "months",
    "status": "Active",
    "qrCodeId": "...",
    "barcodeId": "...",
    "images": [],
    "isDeleted": false,
    "createdBy": "...",
    "createdAt": "2026-01-14T12:00:00Z",
    "updatedAt": "2026-01-14T12:00:00Z"
  }
}
```

### POST /products

**Request Body:**
```json
{
  "name": "Cisco Catalyst 2960-X Series Switch",
  "categoryId": "6789abcd1234567890123456",
  "subCategoryId": "6789abcd1234567890123457",
  "brand": "Cisco",
  "model": "WS-C2960X-24TS-L",
  "description": "24-port Gigabit Ethernet switch",
  "specifications": {
    "ports": "24",
    "type": "Gigabit Ethernet",
    "poe": "No",
    "stackable": "Yes"
  },
  "price": 45000.00,
  "currency": "INR",
  "unitOfMeasure": "piece",
  "dimensions": {
    "length": 44.5,
    "width": 24.4,
    "height": 4.4,
    "unit": "cm"
  },
  "weight": 3.6,
  "weightUnit": "kg",
  "warrantyPeriod": 12,
  "warrantyUnit": "months",
  "status": "Active"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "sku": "ELEC-ROUTER-CISCO-0001",
    "name": "Cisco Catalyst 2960-X Series Switch",
    "qrCodeId": "...",
    "barcodeId": "...",
    // ... other fields
  },
  "message": "Product created successfully with SKU ELEC-ROUTER-CISCO-0001"
}
```

### PUT /products/:id

**Request Body:** (all fields optional except SKU which cannot be changed)
```json
{
  "name": "Cisco Catalyst 2960-X Series Switch (Updated)",
  "description": "Updated description",
  "price": 48000.00,
  "status": "Active"
}
```

### DELETE /products/:id

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Validation Rules

### Classification Step
- **Category:** Required
- **Sub-category:** Required, must belong to selected category

### Identity Step
- **Name:** Required, 2-200 chars, no leading/trailing spaces
- **Brand:** Required, 2-100 chars
- **Model:** Required, 2-100 chars
- **Description:** Optional, max 1000 chars

### Commercial Step
- **Price:** Required, positive decimal, max 2 decimals
- **Currency:** Optional, default INR
- **Dimensions:** All or none (if providing, all fields required)
- **Weight:** Optional, positive if provided
- **Warranty Period:** Optional, positive integer if provided
- **Status:** Optional, enum, default Active

### Specifications Step
- **Specifications:** Optional
- **Key:** Required if row exists, max 100 chars
- **Value:** Required if row exists, max 500 chars
- **Duplicate keys:** Not allowed

---

## User Experience Requirements

### Loading States

**Products List:**
- Skeleton table rows (10 rows)
- Disable filters during load
- Show count: "Loading products..."

**Stepper Form:**
- Show loading when fetching categories/sub-categories
- Disable Next button during step validation
- Overlay with spinner during submit

**Edit Page:**
- Full-page skeleton while loading product
- Disable form during save

### Success Feedback

**Product Created:**
- Success snackbar: "Product created successfully! SKU: {sku}"
- Redirect to products list after 2 seconds
- Or offer: "View Product" / "Create Another"

**Product Updated:**
- Success snackbar: "Product updated successfully"
- Redirect to detail page or list

**Product Deleted:**
- Success snackbar: "Product deleted successfully"
- Refresh products list

### Error Feedback

**Step Validation Errors:**
- Inline below fields (red text)
- Clear on field change
- Prevent next step until fixed

**API Errors:**
- Alert component above form
- Clear message
- Action: "Try Again" or "Go Back"

**Submit Errors:**
- Show in dialog or banner
- Map errors to specific steps if possible
- Allow user to go back and fix

### Empty States

**No Products:**
- Icon: InventoryIcon
- Message: "No products found"
- Suggestion: "Start by adding your first product"
- Action: "Create Product" button

**No Search Results:**
- Icon: SearchOffIcon
- Message: "No products match your filters"
- Suggestion: "Try adjusting your filters"
- Action: "Clear Filters" button

---

## SKU Auto-Generation Display

**Format:** `{CategoryCode}-{SubCategoryCode}-{Brand}-{Sequence}`

**Examples:**
- ELEC-ROUTER-CISCO-0001
- ELEC-ROUTER-CISCO-0002
- FURN-DESK-IKEA-0001

**Display Strategy:**

1. **During Creation:**
   - Show as "Preview" after classification step
   - Message: "Your SKU will be: ELEC-ROUTER-CISCO-XXXX"
   - Actual SKU assigned by backend on creation

2. **After Creation:**
   - Display prominently in detail view
   - Show in table monospace bold
   - Copy button available

3. **In Edit Mode:**
   - Always read-only
   - Gray box with lock icon
   - Message: "SKU cannot be changed after creation"

---

## Permission-Based UI Rendering

| Element              | Required Permission | Behavior if Missing     |
|----------------------|---------------------|-------------------------|
| View List            | products.read       | Redirect to 403         |
| "New Product" btn    | products.create     | Hide button             |
| View Detail          | products.read       | Redirect to 403         |
| Edit action          | products.update     | Hide edit icon          |
| Delete action        | products.delete     | Hide delete icon        |
| Create page          | products.create     | Redirect to 403         |
| Edit page            | products.update     | Redirect to 403         |

---

## Testing Checklist

### Products List Tests

- [ ] Products list loads with pagination
- [ ] All filters work correctly
- [ ] Category-subcategory cascade works
- [ ] Price range filter works
- [ ] Search filters (SKU, name, brand, model)
- [ ] Filters persist across page navigation
- [ ] Clear filters resets all
- [ ] Pagination works
- [ ] Sorting works
- [ ] Loading states show
- [ ] Empty states show
- [ ] View action navigates to detail
- [ ] Edit action navigates to edit (if permission)
- [ ] Delete action shows confirmation (if permission)

### Product Create Tests (Stepper)

- [ ] Step 1: Category/subcategory selection works
- [ ] Step 1: Cannot proceed without selection
- [ ] Step 2: All identity fields validate
- [ ] Step 2: SKU preview shows
- [ ] Step 3: Price input formats correctly
- [ ] Step 3: Dimensions optional validation works
- [ ] Step 4: Can add/remove specifications
- [ ] Step 4: Duplicate keys prevented
- [ ] Step 5: Review shows all data correctly
- [ ] Step 5: Edit buttons navigate back
- [ ] Back button works at each step
- [ ] Next button validates before proceeding
- [ ] Submit creates product successfully
- [ ] Success shows with generated SKU
- [ ] Redirects to list after success
- [ ] Errors display appropriately

### Product Edit Tests

- [ ] Product data loads and pre-populates
- [ ] SKU displayed as read-only
- [ ] Can update name, description, price
- [ ] Can update specifications
- [ ] Can change status
- [ ] Form validates before submit
- [ ] Update succeeds
- [ ] Success message shows
- [ ] Redirects appropriately

### Product Detail Tests

- [ ] Product details load and display
- [ ] All sections show correct data
- [ ] SKU copy button works
- [ ] Status chip displays correctly
- [ ] Edit button navigates (if permission)
- [ ] Delete button shows dialog (if permission)
- [ ] 404 shows if product not found

### Product Delete Tests

- [ ] Delete confirmation dialog opens
- [ ] Dialog shows product details
- [ ] Soft delete explanation shown
- [ ] Delete succeeds
- [ ] Success message shows
- [ ] List refreshes

### Permission Tests

- [ ] User without products.read cannot access list
- [ ] User without products.create cannot see create button
- [ ] User without products.update cannot edit
- [ ] User without products.delete cannot delete
- [ ] Super Admin can access all features

---

## Common Issues and Solutions

### Issue: Sub-category dropdown empty

**Cause:** Category not selected or no sub-categories exist

**Solution:** Show message "Please select a category first" or "No sub-categories available"

### Issue: SKU not showing in create form

**Cause:** Classification not complete

**Solution:** Only show SKU preview after category, sub-category, and brand selected

### Issue: Stepper validation too strict

**Cause:** All fields validated even optional ones

**Solution:** Only validate required fields. Allow proceeding with warnings for optional fields.

### Issue: Price formatting issues

**Cause:** Locale-specific number formatting

**Solution:** Use consistent formatting. Parse number correctly before sending to API.

### Issue: Specifications editor confusing

**Cause:** UX not clear

**Solution:** Add clear labels, placeholders, examples. Show helper text.

---

## Advanced Features (Optional Enhancements)

### Bulk Import

Defer to future phase as per UI guide

### Product Variants

If products have variants (size, color):
- Define parent-child relationship
- SKU variation handling
- Variant-specific attributes

### Product Duplication

"Duplicate Product" action:
- Clone existing product
- Generate new SKU
- Allow editing before save
- Faster than creating from scratch

### Recently Viewed Products

Track and show recently viewed products:
- Store in localStorage
- Show in sidebar or header
- Quick access to frequent products

---

## Performance Considerations

- Debounce search and filter inputs (500ms)
- Lazy load product images (Phase 7)
- Virtualize large product lists (if >100 items per page)
- Cache categories and sub-categories
- Memoize filter components
- Code-split stepper steps (lazy load)

---

## Accessibility Requirements

- [ ] All form fields have labels
- [ ] Stepper keyboard navigable
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Skip to content link in detail page
- [ ] Table keyboard navigable
- [ ] Dropdowns keyboard accessible
- [ ] Dialog keyboard accessible (Esc to close)

---

## File Structure After Phase 6

```
src/
├── features/
│   └── products/
│       ├── pages/
│       │   ├── ProductsListPage.jsx
│       │   ├── ProductCreatePage.jsx
│       │   ├── ProductEditPage.jsx
│       │   └── ProductDetailPage.jsx
│       ├── components/
│       │   ├── ProductsTable.jsx
│       │   ├── ProductFilters.jsx
│       │   ├── ProductForm.jsx
│       │   ├── ProductDeleteDialog.jsx
│       │   ├── ProductStatusChip.jsx
│       │   ├── SkuDisplay.jsx
│       │   ├── formSteps/
│       │   │   ├── ClassificationStep.jsx
│       │   │   ├── IdentityStep.jsx
│       │   │   ├── CommercialStep.jsx
│       │   │   ├── SpecificationsStep.jsx
│       │   │   └── ReviewStep.jsx
│       │   └── shared/
│       │       ├── CategorySelector.jsx
│       │       ├── SpecificationEditor.jsx
│       │       └── PriceInput.jsx
│       └── hooks/
│           ├── useProducts.js
│           ├── useProductCreate.js
│           ├── useProductUpdate.js
│           ├── useProductDelete.js
│           └── useProductStepper.js
├── services/
│   └── pmsService.js (updated)
└── routes/
    └── AppRoutes.jsx (updated)
```

---

## Success Criteria

Phase 6 is complete when:

- [ ] Products list displays with all filters
- [ ] Advanced filters work (category, brand, price, search)
- [ ] Can create product using stepper
- [ ] All 5 steps of stepper functional
- [ ] Category-subcategory cascade works
- [ ] SKU auto-generation displayed
- [ ] Specifications editor works
- [ ] Can edit existing product
- [ ] Can view product details
- [ ] Can delete product (soft delete)
- [ ] All validations work
- [ ] Permission-based access works
- [ ] Loading and error states handled
- [ ] Responsive design works
- [ ] All tests pass
- [ ] No console errors

---

## Next Steps After Phase 6

Once core product management is complete:

✅ **Phase 7: Product Assets Management**
- Product image upload and gallery
- Image delete functionality
- QR code display and download
- Barcode display and download
- QR/Barcode regeneration

---

## Estimated Time

**Total:** 18-22 hours

**Breakdown:**
- Products list + table + filters: 4 hours
- Product stepper create flow: 6 hours
- Product edit page: 2 hours
- Product detail page: 2 hours
- Shared components (CategorySelector, SpecEditor, Price): 3 hours
- Product delete: 1 hour
- Testing and bug fixes: 3 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 6**

**Status:** Ready for implementation  
**Next Phase:** Phase 7 - Product Assets Management
