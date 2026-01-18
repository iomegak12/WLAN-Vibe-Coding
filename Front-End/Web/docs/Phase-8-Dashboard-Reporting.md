# Phase 8: Dashboard & Reporting

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 8 - Dashboard & Reporting  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2, 3, 4, 5, 6, 7 must be completed

---

## Phase Objectives

Implement dashboard and reporting functionality:
- ✅ KPI widgets (key metrics at a glance)
- ✅ Visual charts and graphs
- ✅ Recently updated products widget
- ✅ Manual refresh functionality
- ✅ PDF report generation
- ✅ Data filtering by date range
- ✅ Export capabilities
- ✅ Responsive dashboard layout
- ✅ Permission-based widget visibility
- ✅ Real-time data updates

**Modules Covered:**
1. **Dashboard Overview** - Main landing page with KPIs and charts
2. **Reports** - Generate and download various reports

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0-7: Foundation through Product Assets Management
- [x] All CRUD operations functional
- [x] Products, categories, users, roles data available
- [x] Navigation includes Dashboard menu

### Backend Verification
Test dashboard and reporting endpoints:

```bash
# Get dashboard statistics
curl -X GET http://localhost:5002/api/v1/dashboard/statistics

# Get products by category chart data
curl -X GET http://localhost:5002/api/v1/dashboard/products-by-category

# Expected: 200 OK with statistics/chart data
```

---

## Architecture Overview

### Module Structure

```
src/features/dashboard/
├── pages/
│   ├── DashboardPage.jsx              # Main dashboard
│   └── ReportsPage.jsx                # Reports page
├── components/
│   ├── widgets/
│   │   ├── KPIWidget.jsx              # Single KPI card
│   │   ├── TotalProductsWidget.jsx    # Total products
│   │   ├── TotalCategoriesWidget.jsx  # Total categories
│   │   ├── TotalUsersWidget.jsx       # Total users
│   │   ├── TotalRolesWidget.jsx       # Total roles
│   │   ├── ProductStatusWidget.jsx    # Products by status
│   │   └── RecentActivityWidget.jsx   # Recent updates
│   │
│   ├── charts/
│   │   ├── ProductsByCategoryChart.jsx    # Pie/Donut chart
│   │   ├── ProductsByStatusChart.jsx      # Bar chart
│   │   ├── ProductTrendsChart.jsx         # Line chart
│   │   └── CategoryDistributionChart.jsx  # Horizontal bar
│   │
│   ├── reports/
│   │   ├── ReportFilters.jsx          # Date range, type filters
│   │   ├── ReportPreview.jsx          # Preview before generate
│   │   ├── ReportGenerator.jsx        # Generate report UI
│   │   └── ReportDownload.jsx         # Download component
│   │
│   └── shared/
│       ├── DashboardGrid.jsx          # Grid layout wrapper
│       ├── WidgetCard.jsx             # Card wrapper for widgets
│       ├── RefreshButton.jsx          # Manual refresh
│       └── DateRangePicker.jsx        # Date range selector
│
└── hooks/
    ├── useDashboardStats.js           # Fetch dashboard stats
    ├── useProductsByCategory.js       # Chart data
    ├── useProductsByStatus.js         # Chart data
    ├── useRecentActivity.js           # Recent updates
    ├── useReportGenerate.js           # Generate report
    └── useReportDownload.js           # Download report
```

---

## Step-by-Step Implementation Guide

### Step 1: Create Dashboard Service Layer

**File:** `src/services/dashboardService.js` (new)

**Add Dashboard Functions:**

```javascript
// GET /dashboard/statistics
getDashboardStatistics()

// GET /dashboard/products-by-category
getProductsByCategory()

// GET /dashboard/products-by-status
getProductsByStatus()

// GET /dashboard/product-trends
getProductTrends(startDate, endDate)

// GET /dashboard/recent-activity
getRecentActivity(limit)

// POST /reports/generate
generateReport(reportType, filters)

// GET /reports/:reportId/download
downloadReport(reportId)
```

**Response Handling:**
- Extract from standard envelope
- Handle errors consistently
- Cache data with short TTL (5 minutes)
- Return standardized format

---

### Step 2: Build Main Dashboard Page

**File:** `src/features/dashboard/pages/DashboardPage.jsx`

**Layout Structure:**

```
┌───────────────────────────────────────────────────────┐
│ Dashboard                                [Refresh]     │
├───────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │  Total   │ │  Total   │ │  Total   │ │  Total   │ │
│ │ Products │ │Categories│ │  Users   │ │  Roles   │ │
│ │  1,234   │ │    45    │ │    32    │ │    8     │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                        │
│ ┌──────────────────────────┐ ┌──────────────────────┐│
│ │ Products by Category     │ │ Products by Status   ││
│ │                          │ │                      ││
│ │   [Pie Chart]            │ │   [Bar Chart]        ││
│ │                          │ │                      ││
│ │                          │ │                      ││
│ └──────────────────────────┘ └──────────────────────┘│
│                                                        │
│ ┌──────────────────────────┐ ┌──────────────────────┐│
│ │ Product Trends           │ │ Recent Activity      ││
│ │                          │ │                      ││
│ │   [Line Chart]           │ │ • Product A updated  ││
│ │                          │ │ • Product B created  ││
│ │                          │ │ • Category C added   ││
│ └──────────────────────────┘ └──────────────────────┘│
│                                                        │
└───────────────────────────────────────────────────────┘
```

**Page Components:**
1. **Page Header:**
   - Title: "Dashboard"
   - Breadcrumbs: Dashboard
   - Refresh button (manual data refresh)
   - Last updated timestamp

2. **KPI Row:**
   - 4 KPI cards in a row
   - Responsive (2x2 on tablet, 1 column on mobile)
   - Color-coded icons
   - Percentage change (optional)

3. **Charts Section:**
   - 2x2 grid layout
   - Each chart in a card
   - Title and subtitle
   - Loading states
   - Empty states

4. **Recent Activity:**
   - Timeline/list view
   - Last 10 activities
   - Timestamps
   - User avatars (optional)
   - Link to detail pages

**State Management:**
- `statistics` - all KPI data
- `loading` - loading state
- `lastUpdated` - timestamp
- `error` - error state
- `autoRefresh` - auto-refresh toggle (optional)

**Auto-Refresh (Optional):**
- Toggle in header
- Refresh every 5 minutes
- Show countdown timer
- Pause when user inactive

---

### Step 3: Build KPI Widget Component

**File:** `src/features/dashboard/components/widgets/KPIWidget.jsx`

**Purpose:** Reusable KPI card component

**Layout:**

```
┌────────────────────────┐
│ [Icon]                 │
│                        │
│ 1,234                  │
│ Total Products         │
│                        │
│ ↑ 5.2% from last month │
└────────────────────────┘
```

**Props:**
- `title` - Widget title
- `value` - Main value (number or string)
- `icon` - MUI icon component
- `color` - Icon/accent color (primary, success, info, warning)
- `trend` - Optional trend object: { value: 5.2, direction: 'up', label: 'from last month' }
- `loading` - Loading state
- `onClick` - Optional click handler (navigate to detail)

**Features:**

1. **Icon Display:**
   - Large icon (48px)
   - Colored background circle
   - Top-left or top-center placement

2. **Value Display:**
   - Large font (32px)
   - Bold weight
   - Formatted with thousands separator
   - Center or left-aligned

3. **Title:**
   - Subtitle font size (14px)
   - Gray color
   - Below value

4. **Trend Indicator (Optional):**
   - Small text (12px)
   - Up arrow (green) or down arrow (red)
   - Percentage and label
   - Bottom of card

5. **Loading State:**
   - Skeleton placeholder
   - Shimmer animation

6. **Hover Effect:**
   - Subtle elevation increase
   - Cursor pointer if clickable

---

### Step 4: Build Specific KPI Widgets

#### Total Products Widget

**File:** `src/features/dashboard/components/widgets/TotalProductsWidget.jsx`

**Features:**
- Icon: InventoryIcon
- Color: primary (blue)
- Value: Total product count
- Click: Navigate to products list
- Trend: Growth from last period

---

#### Total Categories Widget

**File:** `src/features/dashboard/components/widgets/TotalCategoriesWidget.jsx`

**Features:**
- Icon: CategoryIcon
- Color: success (green)
- Value: Total categories + sub-categories count
- Format: "45 (32 + 13)" - categories + sub-categories
- Click: Navigate to categories page

---

#### Total Users Widget

**File:** `src/features/dashboard/components/widgets/TotalUsersWidget.jsx`

**Features:**
- Icon: PeopleIcon
- Color: info (cyan)
- Value: Total active users
- Click: Navigate to users page
- Permission: Only show if user has users.read

---

#### Total Roles Widget

**File:** `src/features/dashboard/components/widgets/TotalRolesWidget.jsx`

**Features:**
- Icon: SecurityIcon
- Color: warning (orange)
- Value: Total roles
- Click: Navigate to roles page
- Permission: Only show if user has roles.read

---

### Step 5: Build Products by Category Chart

**File:** `src/features/dashboard/components/charts/ProductsByCategoryChart.jsx`

**Purpose:** Visualize product distribution across categories

**Chart Type:** Donut/Pie Chart

**Library:** Recharts or Chart.js (Recharts recommended)

**Installation:**
```bash
npm install recharts
```

**Layout:**

```
┌──────────────────────────────────┐
│ Products by Category             │
├──────────────────────────────────┤
│                                  │
│         ╱───────╲                │
│       ╱           ╲              │
│      │  [Donut]   │             │
│       ╲           ╱              │
│         ╲───────╱                │
│                                  │
│  ■ Electronics (450)             │
│  ■ Furniture (320)               │
│  ■ Office Supplies (280)         │
│  ■ IT Equipment (184)            │
└──────────────────────────────────┘
```

**Features:**

1. **Donut Chart:**
   - Each category as a slice
   - Different colors per category
   - Hover shows tooltip: "Electronics: 450 products (36.5%)"
   - Center shows total count

2. **Legend:**
   - Below or right side of chart
   - Color box + category name + count
   - Clickable to toggle slice visibility

3. **Data:**
   - Fetch from API
   - Format: `[{ name: 'Electronics', value: 450, color: '#1976d2' }, ...]`
   - Sort by value descending
   - Show top 5, group rest as "Others"

4. **Empty State:**
   - Message: "No products to display"
   - Icon: DonutLargeIcon

5. **Loading State:**
   - Skeleton placeholder

**Props:**
- `data` - array of category objects
- `loading` - boolean
- `height` - chart height (default: 300)

---

### Step 6: Build Products by Status Chart

**File:** `src/features/dashboard/components/charts/ProductsByStatusChart.jsx`

**Purpose:** Show product distribution by status

**Chart Type:** Bar Chart

**Layout:**

```
┌──────────────────────────────────┐
│ Products by Status               │
├──────────────────────────────────┤
│                                  │
│  Active        ████████████ 850  │
│  Out of Stock  ████ 200          │
│  Discontinued  ██ 120            │
│  Coming Soon   ██ 64             │
│                                  │
└──────────────────────────────────┘
```

**Features:**

1. **Horizontal Bar Chart:**
   - Y-axis: Status names
   - X-axis: Product count
   - Bars colored by status
   - Show count at end of bar

2. **Colors:**
   - Active: Green (#4caf50)
   - Out of Stock: Orange (#ff9800)
   - Discontinued: Red (#f44336)
   - Coming Soon: Blue (#2196f3)

3. **Tooltip:**
   - Hover shows: "Active: 850 products (68.7%)"

4. **Sort:**
   - By count descending

**Props:**
- `data` - array of status objects
- `loading` - boolean
- `height` - chart height (default: 250)

---

### Step 7: Build Product Trends Chart

**File:** `src/features/dashboard/components/charts/ProductTrendsChart.jsx`

**Purpose:** Show product creation/update trends over time

**Chart Type:** Line Chart

**Layout:**

```
┌──────────────────────────────────┐
│ Product Trends (Last 30 Days)    │
├──────────────────────────────────┤
│ 50 ┤                   ╱──╲      │
│ 40 ┤                 ╱      ╲    │
│ 30 ┤               ╱          ╲  │
│ 20 ┤             ╱              ╲│
│ 10 ┤           ╱                 │
│  0 └───────────────────────────  │
│    Jan 1  Jan 8  Jan 15  Jan 22  │
│                                  │
│  ─ Products Created              │
│  ─ Products Updated              │
└──────────────────────────────────┘
```

**Features:**

1. **Line Chart:**
   - X-axis: Dates
   - Y-axis: Count
   - Two lines:
     - Products created (solid blue)
     - Products updated (dashed green)
   - Smooth curves

2. **Date Range:**
   - Default: Last 30 days
   - Optional: Date range picker to customize

3. **Tooltip:**
   - Show date and both values
   - "Jan 14, 2026: 15 created, 23 updated"

4. **Grid:**
   - Light gray gridlines
   - Help read values

**Props:**
- `data` - array of date objects
- `startDate` - start date
- `endDate` - end date
- `loading` - boolean
- `height` - chart height (default: 300)

---

### Step 8: Build Recent Activity Widget

**File:** `src/features/dashboard/components/widgets/RecentActivityWidget.jsx`

**Purpose:** Show recent product/category/user activities

**Layout:**

```
┌──────────────────────────────────┐
│ Recent Activity                  │
├──────────────────────────────────┤
│ [📦] Cisco Router added          │
│      by Ramkumar • 2 mins ago    │
│                                  │
│ [📝] Dell Laptop updated         │
│      by Admin • 15 mins ago      │
│                                  │
│ [🗑️] Old Product deleted         │
│      by Manager • 1 hour ago     │
│                                  │
│ [📁] New Category created        │
│      by Admin • 2 hours ago      │
│                                  │
│ [👤] New User added              │
│      by Admin • 3 hours ago      │
│                                  │
│         [View All Activity]      │
└──────────────────────────────────┘
```

**Features:**

1. **Activity List:**
   - Last 10 activities
   - Scrollable if more
   - Max height: 400px

2. **Activity Item:**
   - Icon based on type (create/update/delete)
   - Entity name (clickable link)
   - Action description
   - User who performed action
   - Relative timestamp ("2 mins ago")

3. **Activity Types:**
   - Product created
   - Product updated
   - Product deleted
   - Category created
   - User created
   - Role created/updated

4. **Click Behavior:**
   - Click activity item: Navigate to detail page
   - Hover: Highlight

5. **Empty State:**
   - Message: "No recent activity"
   - Icon: TimelineIcon

6. **View All Button:**
   - At bottom
   - Navigate to full activity log (future)

**Props:**
- `activities` - array of activity objects
- `loading` - boolean
- `limit` - number of items to show (default: 10)

---

### Step 9: Build Reports Page

**File:** `src/features/dashboard/pages/ReportsPage.jsx`

**Layout:**

```
┌───────────────────────────────────────────────────┐
│ Reports                                            │
├───────────────────────────────────────────────────┤
│ Generate Report                                    │
│                                                    │
│ Report Type:  [Products Report ▼]                 │
│ Date Range:   [Jan 1, 2026] - [Jan 14, 2026]     │
│ Category:     [All Categories ▼]                  │
│ Status:       [All Statuses ▼]                    │
│ Format:       [PDF ▼]                             │
│                                                    │
│           [Preview] [Generate & Download]         │
│                                                    │
├───────────────────────────────────────────────────┤
│ Recent Reports                                     │
│                                                    │
│ Products Report - Jan 2026        [Download] [🗑️] │
│ Generated: Jan 14, 2026 10:30 AM                  │
│                                                    │
│ Category Report - Dec 2025        [Download] [🗑️] │
│ Generated: Dec 31, 2025 11:45 PM                  │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Report Types:**

1. **Products Report**
   - All products with details
   - Filtered by category, status, date
   - Includes images (thumbnails)
   - Includes specifications

2. **Category Report**
   - All categories and sub-categories
   - Product counts per category
   - Status distribution

3. **Inventory Summary** (Future)
   - Stock levels
   - Low stock alerts
   - Out of stock items

4. **User Activity Report** (Future)
   - User actions
   - Login history
   - Changes made

**Filters:**
- Date range (start and end)
- Category (all or specific)
- Status (all or specific)
- Sort order (name, date, SKU)

**Format Options:**
- PDF (primary)
- Excel/CSV (future)
- JSON (future)

**Preview Feature:**
- Show first page/summary
- Modal with preview
- "Looks good? Generate full report"

---

### Step 10: Build Report Filters Component

**File:** `src/features/dashboard/components/reports/ReportFilters.jsx`

**Purpose:** Filter controls for report generation

**Layout:**

```
┌───────────────────────────────────────┐
│ Report Filters                        │
├───────────────────────────────────────┤
│ Report Type:                          │
│   [Products Report ▼]                 │
│                                       │
│ Date Range:                           │
│   From: [Jan 1, 2026]                 │
│   To:   [Jan 14, 2026]                │
│                                       │
│ Category: (Products Report only)      │
│   [All Categories ▼]                  │
│                                       │
│ Status:                               │
│   [All Statuses ▼]                    │
│                                       │
│ Format:                               │
│   ○ PDF   ○ Excel   ○ CSV            │
│                                       │
│         [Clear] [Apply Filters]       │
└───────────────────────────────────────┘
```

**Features:**

1. **Report Type Dropdown:**
   - Products Report
   - Category Report
   - Inventory Summary (grayed out - future)
   - User Activity Report (grayed out - future)

2. **Date Range Picker:**
   - Use Material-UI DatePicker
   - From and To dates
   - Presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month

3. **Dynamic Filters:**
   - Show/hide filters based on report type
   - Category filter only for Products Report
   - Status filter for Products Report

4. **Format Selection:**
   - Radio buttons
   - PDF, Excel, CSV
   - Default: PDF

5. **Validation:**
   - Start date <= end date
   - Date range not more than 1 year
   - Required fields highlighted

**Props:**
- `filters` - current filter values
- `onChange` - callback when filters change
- `onApply` - callback when Apply clicked
- `onClear` - callback when Clear clicked

---

### Step 11: Build Report Generator Component

**File:** `src/features/dashboard/components/reports/ReportGenerator.jsx`

**Purpose:** Handle report generation process

**Features:**

1. **Generate Button:**
   - Primary action button
   - "Generate & Download"
   - Disabled if filters invalid

2. **Generation Process:**
   - Call API with filter parameters
   - Show loading overlay
   - Progress indicator (if backend supports)
   - Status messages: "Generating report...", "Processing 250/1000 products..."

3. **Success:**
   - Auto-download file
   - Success message: "Report generated successfully!"
   - Option to generate another

4. **Error Handling:**
   - Show error message
   - Retry button
   - Common errors:
     - Timeout (large report)
     - No data found
     - Permission denied

**State Flow:**
1. Idle - Show generate button
2. Generating - Show progress
3. Success - Download file, show success message
4. Error - Show error, allow retry

---

### Step 12: Build Report Preview Component

**File:** `src/features/dashboard/components/reports/ReportPreview.jsx`

**Purpose:** Preview report before generating full version

**Layout:**

```
┌───────────────────────────────────────────┐
│ Report Preview                        [X] │
├───────────────────────────────────────────┤
│ Products Report - January 2026            │
│ Generated on: Jan 14, 2026                │
│                                           │
│ Summary:                                  │
│ • Total Products: 1,234                   │
│ • Categories: 45                          │
│ • Date Range: Jan 1 - Jan 14, 2026       │
│                                           │
│ Sample Data:                              │
│ ┌─────────────────────────────────────┐  │
│ │ SKU    | Name         | Category    │  │
│ │ ELEC..  | Cisco Router | Electronics │  │
│ │ FURN..  | Office Desk  | Furniture   │  │
│ │ ...    | ...          | ...         │  │
│ └─────────────────────────────────────┘  │
│                                           │
│ Showing 5 of 1,234 items                  │
│                                           │
│       [Cancel] [Generate Full Report]     │
└───────────────────────────────────────────┘
```

**Features:**
- Summary statistics
- First 5-10 rows of data
- Styled like final report
- Quick validation of filters
- Modal display

---

### Step 13: Build Dashboard Grid Layout

**File:** `src/features/dashboard/components/shared/DashboardGrid.jsx`

**Purpose:** Responsive grid system for widgets

**Features:**

1. **Grid System:**
   - Material-UI Grid
   - 12-column layout
   - Responsive breakpoints:
     - xs: 1 column (mobile)
     - sm: 2 columns (tablet)
     - md: 2 columns (small desktop)
     - lg: 4 columns (large desktop)

2. **Widget Sizing:**
   - KPI: 3 columns (1/4 width on desktop)
   - Chart: 6 columns (1/2 width on desktop)
   - Full width: 12 columns

3. **Gap:**
   - Consistent spacing between widgets
   - 16px or 24px gap

**Props:**
- `children` - widget components
- `spacing` - gap size (default: 3)

---

### Step 14: Build Refresh Button Component

**File:** `src/features/dashboard/components/shared/RefreshButton.jsx`

**Purpose:** Manual data refresh

**Features:**

1. **Icon Button:**
   - RefreshIcon
   - Rotate animation when refreshing
   - Tooltip: "Refresh dashboard"

2. **Refresh Logic:**
   - Call all data fetch hooks
   - Invalidate cache
   - Update last updated timestamp
   - Show success feedback

3. **Auto-Refresh Toggle (Optional):**
   - Checkbox or switch
   - "Auto-refresh every 5 minutes"
   - Countdown timer

**Props:**
- `onRefresh` - callback to refresh data
- `loading` - boolean
- `lastUpdated` - timestamp

---

### Step 15: Create Custom Hooks

#### useDashboardStats Hook

**File:** `src/features/dashboard/hooks/useDashboardStats.js`

**Purpose:** Fetch dashboard statistics

**Returns:**
```javascript
{
  stats: {
    totalProducts,
    totalCategories,
    totalSubCategories,
    totalUsers,
    totalRoles,
    productsByStatus: {...},
    recentGrowth: {...}
  },
  loading,
  error,
  refetch
}
```

---

#### useProductsByCategory Hook

**File:** `src/features/dashboard/hooks/useProductsByCategory.js`

**Returns:**
```javascript
{
  data: [
    { name: 'Electronics', value: 450, color: '#1976d2' },
    { name: 'Furniture', value: 320, color: '#388e3c' },
    ...
  ],
  loading,
  error,
  refetch
}
```

---

#### useProductsByStatus Hook

**File:** `src/features/dashboard/hooks/useProductsByStatus.js`

**Returns:**
```javascript
{
  data: [
    { name: 'Active', value: 850, color: '#4caf50' },
    { name: 'Out of Stock', value: 200, color: '#ff9800' },
    ...
  ],
  loading,
  error,
  refetch
}
```

---

#### useRecentActivity Hook

**File:** `src/features/dashboard/hooks/useRecentActivity.js`

**Returns:**
```javascript
{
  activities: [
    {
      id: '1',
      type: 'product_created',
      entityName: 'Cisco Router',
      entityId: 'prod123',
      userName: 'Ramkumar',
      timestamp: '2026-01-14T10:28:00Z',
      relativeTime: '2 mins ago'
    },
    ...
  ],
  loading,
  error,
  refetch
}
```

---

#### useReportGenerate Hook

**File:** `src/features/dashboard/hooks/useReportGenerate.js`

**Returns:**
```javascript
{
  generateReport,        // Function(reportType, filters)
  generating,            // Boolean
  progress,              // Number (0-100) if supported
  reportUrl,             // Download URL
  error
}
```

---

## API Integration Specifications

### GET /dashboard/statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 1234,
    "totalCategories": 32,
    "totalSubCategories": 13,
    "totalUsers": 28,
    "totalRoles": 8,
    "productsByStatus": {
      "Active": 850,
      "Out of Stock": 200,
      "Discontinued": 120,
      "Coming Soon": 64
    },
    "growth": {
      "products": {
        "value": 5.2,
        "direction": "up",
        "period": "last month"
      }
    }
  }
}
```

---

### GET /dashboard/products-by-category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "categoryId": "cat123",
      "categoryName": "Electronics",
      "productCount": 450
    },
    {
      "categoryId": "cat124",
      "categoryName": "Furniture",
      "productCount": 320
    }
  ]
}
```

---

### GET /dashboard/products-by-status

**Response:**
```json
{
  "success": true,
  "data": {
    "Active": 850,
    "Out of Stock": 200,
    "Discontinued": 120,
    "Coming Soon": 64
  }
}
```

---

### GET /dashboard/product-trends

**Query Parameters:**
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-01",
      "created": 12,
      "updated": 28
    },
    {
      "date": "2026-01-02",
      "created": 8,
      "updated": 35
    }
  ]
}
```

---

### GET /dashboard/recent-activity

**Query Parameters:**
- `limit` (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "act123",
      "type": "product_created",
      "entityType": "product",
      "entityId": "prod789",
      "entityName": "Cisco Catalyst Router",
      "action": "created",
      "userId": "user456",
      "userName": "Ramkumar Singh",
      "timestamp": "2026-01-14T10:28:00Z"
    },
    {
      "id": "act124",
      "type": "product_updated",
      "entityType": "product",
      "entityId": "prod788",
      "entityName": "Dell Laptop",
      "action": "updated",
      "userId": "user457",
      "userName": "Admin User",
      "timestamp": "2026-01-14T10:15:00Z"
    }
  ]
}
```

---

### POST /reports/generate

**Request Body:**
```json
{
  "reportType": "products",
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-14",
    "categoryId": "cat123",
    "status": "Active"
  },
  "format": "pdf",
  "sort": "name",
  "sortOrder": "asc"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reportId": "rpt-456",
    "downloadUrl": "https://storage.example.com/reports/rpt-456.pdf",
    "filename": "products-report-2026-01-14.pdf",
    "fileSize": 1248576,
    "generatedAt": "2026-01-14T10:30:00Z",
    "expiresAt": "2026-01-15T10:30:00Z"
  },
  "message": "Report generated successfully"
}
```

**Async Option (for large reports):**

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "reportId": "rpt-456",
    "status": "processing",
    "progress": 0
  },
  "message": "Report generation started"
}
```

**Poll Status:**
```bash
GET /reports/rpt-456/status
```

**Status Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "rpt-456",
    "status": "completed",
    "progress": 100,
    "downloadUrl": "..."
  }
}
```

---

### GET /reports/:reportId/download

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="products-report-2026-01-14.pdf"
- Body: Binary PDF data

---

## Validation Rules

### Date Range Validation
- Start date required
- End date required
- Start date <= end date
- Date range <= 1 year
- Dates cannot be future dates (for historical reports)

### Report Filters
- Report type required
- Format required (default: PDF)
- Category optional (valid category ID if provided)
- Status optional (valid enum value if provided)

---

## User Experience Requirements

### Loading States

**Dashboard Page:**
- Skeleton for KPI cards (4 cards)
- Skeleton for charts (placeholders)
- Show "Loading dashboard..." message
- Shimmer animation

**Chart Loading:**
- Placeholder with chart shape
- Loading spinner in center
- Fade-in when data loads

**Report Generation:**
- Full-page loading overlay
- Progress bar (if supported)
- Status messages
- Cannot close during generation
- Estimated time (if available)

### Success Feedback

**Dashboard Refresh:**
- Success snackbar: "Dashboard refreshed"
- Update "Last updated" timestamp
- Smooth data transition

**Report Generated:**
- Success snackbar: "Report generated successfully!"
- Auto-download starts
- Show download location tip

### Error Feedback

**Dashboard Load Error:**
- Alert component
- Message: "Failed to load dashboard data"
- Retry button
- Contact support link

**Chart Error:**
- Show in chart area
- Icon: ErrorOutlineIcon
- Message: "Failed to load chart data"
- Retry button

**Report Generation Error:**
- Alert dialog
- Specific error message:
  - "No data found for selected filters"
  - "Report generation timeout. Try smaller date range."
  - "Permission denied"
- Close button
- Retry option

### Empty States

**No Recent Activity:**
- Icon: TimelineIcon
- Message: "No recent activity"
- Subtitle: "Activities will appear here as users make changes"

**No Chart Data:**
- Icon: BarChartIcon
- Message: "No data available"
- Subtitle: "Add products to see statistics"

---

## Report PDF Structure

### Products Report Template

**Header:**
- Company name: "WLAN Corporation"
- Report title: "Products Report"
- Date range: "January 1 - January 14, 2026"
- Generated on: "January 14, 2026 10:30 AM"
- Page numbers

**Summary Section:**
- Total products
- Categories included
- Status distribution
- Price range

**Products Table:**
| SKU | Name | Category | Brand | Price | Status |
|-----|------|----------|-------|-------|--------|
| ... | ...  | ...      | ...   | ...   | ...    |

**Product Details (Optional):**
- Each product on separate section
- Thumbnail image
- Full specifications
- QR code (small)

**Footer:**
- Company info
- Contact details
- Confidentiality notice
- Page numbers

---

## Permission-Based UI Rendering

| Element              | Required Permission | Behavior if Missing     |
|----------------------|---------------------|-------------------------|
| Dashboard page       | dashboard.read      | Redirect to 403         |
| Total products       | products.read       | Show widget             |
| Total categories     | categories.read     | Show widget             |
| Total users          | users.read          | Hide widget             |
| Total roles          | roles.read          | Hide widget             |
| Products chart       | products.read       | Show chart              |
| Recent activity      | dashboard.read      | Show activity           |
| Generate report      | reports.create      | Hide generate button    |
| Download report      | reports.read        | Show download           |

**Fallback:**
- If user has no dashboard permissions, redirect to products page
- Show only widgets user has permissions for
- Hide entire sections if no widgets visible

---

## Testing Checklist

### Dashboard Tests

- [ ] Dashboard page loads successfully
- [ ] All KPI widgets display correct data
- [ ] KPI widgets show loading state
- [ ] Click KPI widget navigates to detail page
- [ ] Products by category chart displays
- [ ] Products by status chart displays
- [ ] Product trends chart displays
- [ ] Recent activity widget displays
- [ ] Refresh button refreshes all data
- [ ] Last updated timestamp updates
- [ ] Auto-refresh works (if implemented)
- [ ] Empty states show when no data
- [ ] Error states show on API failure
- [ ] Responsive layout works (mobile/tablet/desktop)

### Chart Tests

- [ ] Donut chart renders correctly
- [ ] Chart legend works
- [ ] Hover tooltip shows correct data
- [ ] Chart colors distinct
- [ ] Bar chart renders correctly
- [ ] Line chart renders correctly
- [ ] Charts responsive to container size
- [ ] Loading states show
- [ ] Empty states show
- [ ] Error states show with retry

### Report Tests

- [ ] Reports page loads
- [ ] Report filters display
- [ ] Date range picker works
- [ ] Filter validation works
- [ ] Generate button disabled if invalid filters
- [ ] Report generation starts
- [ ] Progress indicator shows
- [ ] Report downloads automatically
- [ ] Success message shows
- [ ] Error handling works
- [ ] Can generate multiple reports
- [ ] Report preview works (if implemented)
- [ ] PDF opens correctly
- [ ] PDF contains correct data

### Permission Tests

- [ ] User without dashboard.read redirected
- [ ] User without users.read doesn't see user widget
- [ ] User without roles.read doesn't see role widget
- [ ] User without reports.create can't generate reports
- [ ] Super Admin sees all widgets

### Integration Tests

- [ ] Dashboard reflects latest data
- [ ] Creating product updates KPI immediately (optional)
- [ ] Recent activity shows latest actions
- [ ] Charts update after data changes
- [ ] Report includes latest data

---

## Common Issues and Solutions

### Issue: Charts not rendering

**Cause:** Recharts library issue or data format problem

**Solution:**
- Check Recharts installed correctly
- Verify data format matches Recharts requirements
- Check browser console for errors
- Ensure parent container has defined height

### Issue: Report generation timeout

**Cause:** Large dataset, slow server

**Solution:**
- Implement async report generation
- Poll for status instead of waiting
- Allow user to continue using app
- Email report when ready (future)
- Suggest smaller date range

### Issue: Dashboard slow to load

**Cause:** Multiple API calls, large data

**Solution:**
- Implement caching (5-minute TTL)
- Lazy load charts (intersection observer)
- Use React.memo for chart components
- Debounce auto-refresh
- Consider server-side caching

### Issue: KPI values incorrect

**Cause:** Caching issue, stale data

**Solution:**
- Implement cache invalidation
- Manual refresh button
- Show last updated timestamp
- Auto-refresh periodically

---

## Advanced Features (Optional Enhancements)

### Real-Time Updates

Use WebSocket for live updates:
- Dashboard updates without refresh
- Real-time activity feed
- Live KPI counters
- Notification on data change

### Custom Dashboard

Allow users to customize:
- Widget arrangement (drag-drop)
- Show/hide widgets
- Custom date ranges per chart
- Save preferences

### Scheduled Reports

Email reports automatically:
- Daily/weekly/monthly schedule
- Recipients list
- Custom templates
- Report history

### Comparative Analytics

Compare periods:
- This month vs last month
- Year-over-year comparison
- Trend indicators
- Growth percentages

### Export Data

Export raw data:
- Excel/CSV format
- JSON format
- API endpoint for integrations
- Bulk download

### Drill-Down

Click chart to drill down:
- Click category slice → Products in that category
- Click status bar → Products with that status
- Click activity → Full activity details

---

## Performance Considerations

- Cache dashboard data (5 minutes)
- Lazy load charts (intersection observer)
- Memoize chart components
- Debounce auto-refresh (5 minutes)
- Use React.memo for widgets
- Implement virtual scrolling for large activity lists
- Compress large reports
- Stream large report downloads
- Use CDN for chart libraries
- Optimize chart data (aggregate if >100 items)

---

## Accessibility Requirements

- [ ] All charts have text alternatives
- [ ] Chart data available in table format
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation for all controls
- [ ] Screen reader announcements for updates
- [ ] Focus management in modals
- [ ] ARIA labels on interactive elements
- [ ] Skip links for sections
- [ ] Alt text for chart images (fallback)

---

## Mobile Responsiveness

### Dashboard Layout
- Stack KPI cards vertically on mobile
- Charts full-width on mobile
- Scrollable chart legends
- Touch-friendly controls

### Charts
- Responsive width
- Readable labels on small screens
- Touch-friendly tooltips
- Simplified legends on mobile

### Reports
- Simplified filter UI on mobile
- Touch-friendly date picker
- Clear button placement
- Progress indicator visible

---

## Chart Library Comparison

### Recharts (Recommended)
**Pros:**
- React-native, declarative
- Easy to customize
- Good documentation
- TypeScript support
- Responsive

**Cons:**
- Limited chart types
- Performance with large datasets

### Chart.js with react-chartjs-2
**Pros:**
- Many chart types
- Good performance
- Popular, well-maintained
- Extensive plugins

**Cons:**
- Imperative API (less React-like)
- More complex customization

### Victory
**Pros:**
- React-native
- Highly customizable
- Animations built-in

**Cons:**
- Larger bundle size
- Learning curve

**Recommendation:** Use **Recharts** for simplicity and React-friendly API.

---

## File Structure After Phase 8

```
src/
├── features/
│   └── dashboard/
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   └── ReportsPage.jsx
│       ├── components/
│       │   ├── widgets/
│       │   │   ├── KPIWidget.jsx
│       │   │   ├── TotalProductsWidget.jsx
│       │   │   ├── TotalCategoriesWidget.jsx
│       │   │   ├── TotalUsersWidget.jsx
│       │   │   ├── TotalRolesWidget.jsx
│       │   │   └── RecentActivityWidget.jsx
│       │   ├── charts/
│       │   │   ├── ProductsByCategoryChart.jsx
│       │   │   ├── ProductsByStatusChart.jsx
│       │   │   ├── ProductTrendsChart.jsx
│       │   │   └── CategoryDistributionChart.jsx
│       │   ├── reports/
│       │   │   ├── ReportFilters.jsx
│       │   │   ├── ReportPreview.jsx
│       │   │   ├── ReportGenerator.jsx
│       │   │   └── ReportDownload.jsx
│       │   └── shared/
│       │       ├── DashboardGrid.jsx
│       │       ├── WidgetCard.jsx
│       │       ├── RefreshButton.jsx
│       │       └── DateRangePicker.jsx
│       └── hooks/
│           ├── useDashboardStats.js
│           ├── useProductsByCategory.js
│           ├── useProductsByStatus.js
│           ├── useRecentActivity.js
│           ├── useReportGenerate.js
│           └── useReportDownload.js
├── services/
│   ├── dashboardService.js (new)
│   └── reportService.js (new)
└── routes/
    └── AppRoutes.jsx (updated)
```

---

## Success Criteria

Phase 8 is complete when:

- [ ] Dashboard page displays with all widgets
- [ ] KPI widgets show correct data
- [ ] KPI widgets clickable and navigate
- [ ] Products by category chart displays
- [ ] Products by status chart displays
- [ ] Product trends chart displays
- [ ] Recent activity widget displays
- [ ] Refresh button works
- [ ] Last updated timestamp shows
- [ ] Reports page functional
- [ ] Can generate products report
- [ ] Can apply filters to report
- [ ] Report downloads as PDF
- [ ] Report contains correct data
- [ ] All loading states work
- [ ] Error handling works
- [ ] Empty states display
- [ ] Permission-based rendering works
- [ ] Responsive design works
- [ ] No console errors
- [ ] All tests pass

---

## Next Steps After Phase 8

Once dashboard and reporting are complete:

✅ **Phase 9: Polish & Advanced Features**
- Web-based QR/Barcode scanning
- Advanced search & filter combinations
- Performance optimizations
- Error boundaries
- Final UX polish
- Production preparation

---

## Estimated Time

**Total:** 16-20 hours

**Breakdown:**
- Dashboard page layout: 2 hours
- KPI widgets (4 widgets): 3 hours
- Charts (3 charts): 5 hours
- Recent activity widget: 2 hours
- Reports page: 3 hours
- Report generation & download: 3 hours
- Testing and bug fixes: 3 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 8**

**Status:** Ready for implementation  
**Next Phase:** Phase 9 - Polish & Advanced Features
