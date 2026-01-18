# Phase 2: App Shell & Navigation

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 2 - App Shell & Navigation  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0 & Phase 1 must be completed

---

## Phase Objectives

Build the main application shell and navigation system:
- ✅ App layout with sidebar and topbar
- ✅ Collapsible sidebar navigation
- ✅ Navigation menu with all module routes
- ✅ Top bar with user profile and logout
- ✅ Breadcrumbs for navigation context
- ✅ Responsive layout (mobile + desktop)
- ✅ Permission-based menu visibility
- ✅ Dashboard placeholder page

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0: Project foundation setup
- [x] Phase 1: Authentication working (login/logout)
- [x] AuthContext with user and permissions
- [x] Material-UI theme configured

### Verify Authentication
- User can successfully log in
- AuthContext provides `user` and `hasPermission()`
- Protected routes work correctly

---

## Architecture Overview

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ TopBar (User Menu, Notifications, Logout)              │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│          │                                              │
│ Sidebar  │         Main Content Area                    │
│ (Nav     │         (Page-specific content)              │
│  Menu)   │                                              │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Component Hierarchy

```
AppShell
├── TopBar
│   ├── AppName/Logo
│   ├── MenuToggle (mobile)
│   └── UserMenu
│       ├── Profile
│       ├── Settings (optional)
│       └── Logout
├── Sidebar
│   ├── Logo/Brand
│   ├── Navigation Menu
│   │   ├── Dashboard
│   │   ├── Products (expandable)
│   │   ├── Users & Access (expandable)
│   │   ├── Reports
│   │   └── System
│   └── Collapse Button
└── MainContent
    ├── Breadcrumbs
    └── Page Content (children)
```

---

## Step-by-Step Implementation Guide

### Step 1: Create Layout Components Structure

**Create these component files:**

```
src/components/layout/
├── AppShell.jsx          # Main layout wrapper
├── TopBar.jsx            # Top navigation bar
├── Sidebar.jsx           # Left sidebar navigation
├── NavMenu.jsx           # Navigation menu items
├── UserMenu.jsx          # User dropdown menu
└── Breadcrumbs.jsx       # Breadcrumb navigation
```

---

### Step 2: Build AppShell Component

**File:** `src/components/layout/AppShell.jsx`

**Purpose:** Main layout wrapper for all protected pages

**Layout Strategy:**
- Use MUI `Box` with flex layout
- Fixed TopBar (height: 64px)
- Sidebar (width: 240px when open, 64px when collapsed)
- Main content takes remaining space
- Responsive: sidebar drawer on mobile, permanent on desktop

**Props:**
- `children` - Page content to render in main area

**State Management:**
- Use `UIContext.sidebarOpen` to control sidebar visibility
- Sync with localStorage for persistence

**Breakpoints:**
- **Mobile** (< 900px): Drawer sidebar (overlay)
- **Desktop** (>= 900px): Permanent sidebar

**Key Responsibilities:**
1. Render TopBar
2. Render Sidebar
3. Render children in main content area
4. Handle responsive behavior
5. Manage sidebar open/close state

---

### Step 3: Build TopBar Component

**File:** `src/components/layout/TopBar.jsx`

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────────┐
│ [☰] WLAN Warehouse Management        [🔔] [👤 User ▼]  │
└─────────────────────────────────────────────────────────┘
```

**Elements (Left to Right):**

1. **Menu Toggle Button** (mobile only)
   - Icon: MenuIcon
   - Action: Toggle sidebar drawer
   - Visible only on < 900px

2. **App Name/Logo**
   - Text: "WLAN Warehouse Management" (from env)
   - Logo: Small logo icon (optional)
   - Desktop: Always visible
   - Mobile: Centered when menu closed

3. **Spacer** (flex-grow)

4. **Notification Icon** (optional placeholder)
   - Icon: NotificationsIcon
   - Badge: Show count (future feature)
   - Disabled/grayed out for now

5. **User Menu** (component)

**Styling:**
- Height: 64px
- Background: White (theme.palette.background.paper)
- Box shadow: subtle elevation
- Sticky/fixed at top
- z-index: 1200 (above sidebar)

---

### Step 4: Build UserMenu Component

**File:** `src/components/layout/UserMenu.jsx`

**Purpose:** User dropdown menu in TopBar

**Trigger Element:**
```
[Avatar] Ramkumar Singh ▼
```

**Menu Items:**

| Icon         | Label          | Action                    | Route/Function      |
|--------------|----------------|---------------------------|---------------------|
| PersonIcon   | Profile        | Navigate to profile page  | /profile            |
| SettingsIcon | Settings       | Placeholder (disabled)    | -                   |
| Divider      | -              | -                         | -                   |
| LogoutIcon   | Logout         | Call logout function      | AuthContext.logout  |

**User Display:**
- Avatar: First letter of first name (or profile image if available)
- Name: `${user.firstName} ${user.lastName}`
- Role: `user.role.roleName` (smaller, gray text)

**Dropdown Behavior:**
- Click avatar/name to open menu
- Click outside to close
- Click item to execute action

**Logout Flow:**
1. User clicks "Logout"
2. Show confirmation dialog (optional)
3. Call `AuthContext.logout()`
4. Redirect to /login (handled by AuthContext)

---

### Step 5: Build Sidebar Component

**File:** `src/components/layout/Sidebar.jsx`

**Purpose:** Left navigation sidebar

**Sections:**

1. **Header Section**
   - Logo/brand
   - Company name (when expanded)
   - Close button (mobile only)

2. **Navigation Menu**
   - Render NavMenu component

3. **Footer Section** (optional)
   - Version number
   - Collapse button (desktop)

**States:**
- **Expanded:** 240px width, show icons + text
- **Collapsed:** 64px width, show icons only (tooltips on hover)

**Responsive Behavior:**
- **Mobile:** Temporary drawer (overlay)
- **Desktop:** Permanent drawer (always visible)

**Styling:**
- Background: Slightly darker than main content
- Border-right: 1px solid divider color
- Height: 100vh (minus topbar)
- Scrollable if content exceeds height

---

### Step 6: Build Navigation Menu Component

**File:** `src/components/layout/NavMenu.jsx`

**Purpose:** Render navigation menu items with permission checking

**Menu Structure (from UI guide):**

```
Dashboard
Products
  ├── Categories
  ├── Sub-categories
  ├── Products
  └── Bulk Import (future)
Users & Access
  ├── Users
  └── Roles
Reports
  └── Product Reports
System (optional)
  ├── API Health
  └── Logs
```

**Implementation Approach:**

Define menu structure as configuration array:

```javascript
const menuConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    permission: null, // null = everyone can see
  },
  {
    id: 'products',
    label: 'Products',
    icon: InventoryIcon,
    permission: 'products.read',
    children: [
      {
        id: 'categories',
        label: 'Categories',
        path: '/products/categories',
        permission: 'categories.read',
      },
      // ... more items
    ],
  },
  // ... more menu items
];
```

**Menu Item Types:**

1. **Simple Item** (no children)
   - Icon + Label
   - Click → navigate to path
   - Highlight if active route

2. **Expandable Item** (has children)
   - Icon + Label + Expand icon
   - Click → expand/collapse
   - Children indented
   - Highlight if any child active

**Permission Logic:**
- Use `AuthContext.hasPermission(permission)`
- Hide menu item if user lacks permission
- If parent has no accessible children, hide parent too

**Active Route Highlighting:**
- Check current route against item path
- Use different background color for active item
- Use primary color for icon/text

**Icons to Use (MUI Icons):**
- Dashboard: `DashboardIcon`
- Products: `InventoryIcon`
- Categories: `CategoryIcon`
- Users: `PeopleIcon`
- Roles: `AdminPanelSettingsIcon`
- Reports: `AssessmentIcon`
- Settings: `SettingsIcon`

---

### Step 7: Build Breadcrumbs Component

**File:** `src/components/layout/Breadcrumbs.jsx`

**Purpose:** Show current page location in hierarchy

**Example Display:**
```
Home > Products > Categories
```

**Implementation Strategy:**

1. Parse current route path
2. Map route segments to labels
3. Render MUI `Breadcrumbs` component
4. Make breadcrumbs clickable (navigate to parent routes)

**Route to Breadcrumb Mapping:**

| Route                        | Breadcrumbs                           |
|------------------------------|---------------------------------------|
| `/dashboard`                 | Dashboard                             |
| `/products/categories`       | Products > Categories                 |
| `/products/categories/new`   | Products > Categories > New Category  |
| `/products/products`         | Products > Products                   |
| `/access/users`              | Users & Access > Users                |
| `/profile`                   | Profile                               |

**Styling:**
- Small font size (0.875rem)
- Gray color for non-active crumbs
- Current page (last item) in darker color, not clickable

---

### Step 8: Create Dashboard Page

**File:** `src/features/dashboard/pages/DashboardPage.jsx`

**Purpose:** Placeholder dashboard (will be fully implemented in Phase 8)

**Current Implementation:**

Display simple placeholder with:
1. Page title: "Dashboard"
2. Welcome message: "Welcome back, {firstName}!"
3. Grid of placeholder cards (4 cards)
   - Total Products (placeholder)
   - Active Products (placeholder)
   - Categories (placeholder)
   - Users (placeholder)
4. Message: "Dashboard widgets will be implemented in Phase 8"

**Layout:**
- Use MUI `Grid` for responsive card layout
- 4 columns on desktop, 2 on tablet, 1 on mobile

**Card Structure:**
- Icon
- Value (e.g., "125")
- Label (e.g., "Total Products")
- Small trend indicator (optional: +5% from last month)

**Styling:**
- Use theme colors
- Elevation for cards
- Comfortable padding

---

### Step 9: Update Routing Structure

**File:** `src/routes/AppRoutes.jsx`

**Add new routes:**

```javascript
Protected Routes (wrapped in AppShell):
- /dashboard → DashboardPage
- /profile → ProfilePage (placeholder)

Public Routes:
- /login → LoginPage (no AppShell)
```

**Route Organization:**

Create a layout route wrapper:
- All protected routes render inside `<AppShell>`
- Public routes (login) render without AppShell
- 404 page renders without AppShell

**Implementation Pattern:**

```
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Protected Routes with AppShell */}
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    {/* More routes in future phases */}
  </Route>
</Routes>
```

Where `ProtectedLayout` is:
```javascript
<ProtectedRoute>
  <AppShell>
    <Outlet /> {/* React Router outlet for nested routes */}
  </AppShell>
</ProtectedRoute>
```

---

### Step 10: Create Profile Page Placeholder

**File:** `src/features/auth/pages/ProfilePage.jsx`

**Purpose:** User profile page (full implementation in Phase 3)

**Current Implementation:**

Simple page showing:
1. Page title: "My Profile"
2. User information display:
   - Name
   - Email
   - Role
   - Last login
3. Message: "Profile editing will be implemented in Phase 3"

**Layout:**
- Single card with user details
- Avatar/profile image placeholder
- Read-only fields for now

---

## Navigation Configuration Reference

### Complete Route Mapping

| Route                          | Page Title          | Permission Required    | Phase |
|--------------------------------|---------------------|------------------------|-------|
| `/dashboard`                   | Dashboard           | -                      | 2     |
| `/profile`                     | My Profile          | -                      | 2     |
| `/products/categories`         | Categories          | categories.read        | 5     |
| `/products/categories/new`     | New Category        | categories.create      | 5     |
| `/products/categories/:id/edit`| Edit Category       | categories.update      | 5     |
| `/products/subcategories`      | Sub-categories      | categories.read        | 5     |
| `/products/subcategories/new`  | New Sub-category    | categories.create      | 5     |
| `/products/products`           | Products            | products.read          | 6     |
| `/products/products/new`       | New Product         | products.create        | 6     |
| `/products/products/:id`       | Product Details     | products.read          | 6     |
| `/products/products/:id/edit`  | Edit Product        | products.update        | 6     |
| `/access/users`                | Users               | users.read             | 3     |
| `/access/users/new`            | New User            | users.create           | 3     |
| `/access/users/:id/edit`       | Edit User           | users.update           | 3     |
| `/access/roles`                | Roles               | roles.read             | 4     |
| `/access/roles/new`            | New Role            | roles.create           | 4     |
| `/access/roles/:id/edit`       | Edit Role           | roles.update           | 4     |
| `/reports/products`            | Product Reports     | reports.read           | 8     |

---

## Responsive Design Requirements

### Breakpoints

- **Mobile:** < 600px (xs)
- **Tablet:** 600px - 899px (sm, md)
- **Desktop:** >= 900px (lg, xl)

### Mobile Behavior (< 900px)

**Sidebar:**
- Temporary drawer (overlay)
- Opens from left
- Closes on navigation or outside click
- Toggle via hamburger menu in TopBar

**TopBar:**
- Show hamburger menu button
- Center app name/logo
- Keep user menu on right

**Content:**
- Full width
- Cards stack vertically
- Tables scroll horizontally

### Desktop Behavior (>= 900px)

**Sidebar:**
- Permanent drawer
- Can collapse to icon-only (64px)
- Expands to full width (240px)
- State persists in localStorage

**TopBar:**
- Hide hamburger menu
- Left-align app name
- User menu on right

**Content:**
- Left margin = sidebar width
- Cards in grid (responsive columns)
- Tables with horizontal scroll if needed

---

## State Management

### UI State (UIContext)

Store these values:
- `sidebarOpen` (boolean)
- `sidebarCollapsed` (boolean, desktop only)
- `tableDensity` (string)

**Methods:**
- `toggleSidebar()` - Open/close sidebar
- `setSidebarOpen(boolean)` - Set sidebar state
- `toggleCollapse()` - Collapse/expand sidebar (desktop)
- `setTableDensity(string)` - Set table density preference

**Persistence:**
- Save sidebar state to localStorage
- Restore on app load

### Navigation State

- Use React Router's `useLocation()` hook
- Determine active route
- Pass to menu items for highlighting
- Generate breadcrumbs from current location

---

## Styling Guidelines

### Color Scheme (from Theme)

- **Sidebar Background:** `#f8f9fa` (light gray)
- **Active Item Background:** `rgba(32, 107, 196, 0.08)` (primary with opacity)
- **Active Item Text:** `#206bc4` (primary)
- **Hover Background:** `rgba(0, 0, 0, 0.04)`
- **Divider Color:** `rgba(0, 0, 0, 0.12)`

### Spacing

- **Sidebar Padding:** 8px horizontal
- **Menu Item Padding:** 12px vertical, 16px horizontal
- **Icon Size:** 24px
- **Gap between icon and text:** 12px

### Typography

- **Menu Item:** 0.875rem, weight 500
- **Section Header:** 0.75rem, weight 600, uppercase, letter-spacing
- **User Name:** 0.875rem, weight 500
- **User Role:** 0.75rem, weight 400, gray

---

## User Experience Requirements

### Navigation Feedback

**Menu Item Interaction:**
1. **Hover:** Change background color
2. **Active:** Different background + primary color
3. **Click:** Immediate navigation (no delay)
4. **Disabled:** Gray out, no hover effect

**Expandable Menus:**
1. Show expand/collapse icon (chevron)
2. Rotate icon when expanded
3. Smooth animation (200ms)
4. Indent child items

**Breadcrumbs:**
1. Clickable (except current page)
2. Hover: underline
3. Separator: "/" or ">"

### Loading States

**On Route Change:**
- Optional: Show loading bar at top of page
- Or: Show skeleton screen for new page

**On Logout:**
- Show loading overlay
- Message: "Logging out..."
- Immediate redirect after token cleared

### Error Handling

**Navigation Errors:**
- If user navigates to route without permission → show 403 page
- If route doesn't exist → show 404 page

---

## Accessibility Requirements

- [ ] Sidebar has proper `role="navigation"`
- [ ] Menu items have proper `aria-label`
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Focus visible on all interactive elements
- [ ] User menu dropdown keyboard accessible
- [ ] Screen reader announces current page
- [ ] Breadcrumbs navigable via keyboard
- [ ] Collapse button has `aria-label`

---

## Testing Checklist

### Desktop Tests

- [ ] Sidebar displays all menu items
- [ ] Menu items navigate to correct routes
- [ ] Active route highlighted correctly
- [ ] Expandable menus open/close smoothly
- [ ] User menu opens on click
- [ ] Logout works from user menu
- [ ] Breadcrumbs show correct path
- [ ] Breadcrumbs navigate on click
- [ ] Sidebar collapse/expand works
- [ ] Collapsed sidebar shows icons only
- [ ] Tooltips show on collapsed sidebar items
- [ ] Sidebar state persists after refresh

### Mobile Tests

- [ ] Hamburger menu button visible
- [ ] Sidebar opens as drawer overlay
- [ ] Drawer closes on navigation
- [ ] Drawer closes on outside click
- [ ] User menu still accessible
- [ ] Breadcrumbs responsive (stack if needed)
- [ ] Dashboard cards stack vertically

### Permission Tests

- [ ] User with `users.read` sees Users menu
- [ ] User without `users.read` doesn't see Users menu
- [ ] Super Admin (permission: "*") sees all menus
- [ ] Product Manager sees Product menus only
- [ ] Viewer (read-only) sees appropriate menus

### Navigation Flow

- [ ] Login → redirects to /dashboard
- [ ] Logout → redirects to /login
- [ ] Click Dashboard → shows dashboard page
- [ ] Click Profile → shows profile page
- [ ] Direct URL navigation works
- [ ] Browser back/forward buttons work
- [ ] 404 page shows for invalid routes

---

## Common Issues and Solutions

### Issue: Sidebar flickers on page load

**Cause:** Sidebar state not initialized before render

**Solution:** Initialize sidebar state from localStorage in UIContext before first render

### Issue: Active menu item not highlighting

**Cause:** Route matching logic incorrect

**Solution:** Use React Router's `useMatch()` hook or compare pathname accurately

### Issue: Drawer doesn't close on mobile

**Cause:** Event handler not attached

**Solution:** Ensure onClick closes drawer for temporary variant

### Issue: Menu items overlap on mobile

**Cause:** Incorrect z-index or positioning

**Solution:** Set proper z-index hierarchy (TopBar > Drawer > Content)

### Issue: Permission check fails

**Cause:** User object not loaded or permission array empty

**Solution:** Always check if `user` and `user.role.permissions` exist before checking permission

---

## Performance Considerations

- Memoize menu configuration to prevent re-renders
- Use `React.memo` for menu item components
- Lazy load page components (code splitting)
- Debounce sidebar toggle animations
- Optimize icon imports (tree-shaking)

---

## File Structure After Phase 2

```
src/
├── components/
│   └── layout/
│       ├── AppShell.jsx
│       ├── TopBar.jsx
│       ├── Sidebar.jsx
│       ├── NavMenu.jsx
│       ├── UserMenu.jsx
│       └── Breadcrumbs.jsx
├── features/
│   ├── auth/
│   │   └── pages/
│   │       └── ProfilePage.jsx (placeholder)
│   └── dashboard/
│       └── pages/
│           └── DashboardPage.jsx (placeholder)
├── contexts/
│   └── UIContext.jsx (updated with sidebar state)
└── routes/
    └── AppRoutes.jsx (updated with layout structure)
```

---

## Success Criteria

Phase 2 is complete when:

- [ ] AppShell layout renders correctly
- [ ] TopBar shows app name and user menu
- [ ] Sidebar shows navigation menu
- [ ] All menu items defined (even if routes not implemented)
- [ ] Permission-based menu filtering works
- [ ] User menu dropdown functional
- [ ] Logout from user menu works
- [ ] Dashboard placeholder page displays
- [ ] Profile placeholder page displays
- [ ] Breadcrumbs show on all pages
- [ ] Responsive behavior works (mobile + desktop)
- [ ] Sidebar collapse/expand works (desktop)
- [ ] Sidebar drawer works (mobile)
- [ ] Active route highlighting works
- [ ] No console errors
- [ ] All tests pass

---

## Design Reference

**Inspiration:** Tabler Admin Dashboard Layout

**Key Characteristics:**
- Clean, professional appearance
- Clear hierarchy
- Comfortable spacing
- Subtle shadows and borders
- Consistent iconography
- Smooth transitions

**MUI Components to Use:**
- `AppBar`, `Toolbar`
- `Drawer` (permanent/temporary)
- `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`
- `Menu`, `MenuItem`
- `Avatar`
- `Breadcrumbs`
- `Divider`
- `IconButton`
- `Collapse` (for expandable menus)

---

## Next Steps After Phase 2

Once app shell and navigation are complete:

✅ **Phase 3: User Management Module**
- Users list with pagination and filters
- User create/edit forms
- User delete functionality
- Profile management (full implementation)
- Profile image upload
- Change password

---

## Estimated Time

**Total:** 8-10 hours

**Breakdown:**
- AppShell and layout structure: 2 hours
- TopBar with user menu: 1.5 hours
- Sidebar and navigation menu: 3 hours
- Breadcrumbs: 1 hour
- Dashboard/Profile placeholders: 1 hour
- Responsive behavior: 1.5 hours
- Testing and polish: 1 hour

---

**End of Phase 2**

**Status:** Ready for implementation  
**Next Phase:** Phase 3 - User Management Module
