# Phase 3: User Management Module

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 3 - User Management Module  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2 must be completed

---

## Phase Objectives

Implement complete user management functionality:
- ✅ Users list with pagination, filters, and search
- ✅ User create form with validation
- ✅ User edit functionality
- ✅ User delete (soft delete) with confirmations
- ✅ Profile management (full implementation)
- ✅ Profile image upload
- ✅ Change password functionality
- ✅ Permission-based action visibility

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0: Foundation setup
- [x] Phase 1: Authentication working
- [x] Phase 2: App shell with navigation
- [x] AuthContext with user and permissions
- [x] AppShell layout rendering correctly

### Backend Verification
Test AUTH service user endpoints:

```bash
# Get users list (requires authentication)
curl -X GET http://localhost:5001/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: 200 OK with paginated users list
```

---

## Architecture Overview

### Module Structure

```
src/features/users/
├── pages/
│   ├── UsersListPage.jsx       # Users list with table
│   ├── UserCreatePage.jsx      # Create new user
│   └── UserEditPage.jsx        # Edit existing user
├── components/
│   ├── UsersTable.jsx          # Data table for users
│   ├── UserForm.jsx            # Reusable create/edit form
│   ├── UserFilters.jsx         # Filter controls
│   ├── UserDeleteDialog.jsx    # Confirmation dialog
│   └── UserStatusChip.jsx      # Active/Inactive status badge
└── hooks/
    ├── useUsers.js             # Fetch users list
    ├── useUserCreate.js        # Create user logic
    ├── useUserUpdate.js        # Update user logic
    └── useUserDelete.js        # Delete user logic

src/features/auth/pages/
├── ProfilePage.jsx             # Full profile implementation
└── ChangePasswordPage.jsx      # Change password page

src/features/auth/components/
├── ProfileForm.jsx             # Profile edit form
├── ProfileImageUpload.jsx      # Image upload component
└── PasswordChangeForm.jsx      # Password change form
```

---

## Step-by-Step Implementation Guide

### Step 1: Create User Service Layer

**File:** `src/services/userService.js`

**Purpose:** Centralize all user-related API calls

**Functions to implement:**

```javascript
// GET /users - with pagination and filters
getUsers({ page, limit, roleId, isActive, search })

// GET /users/:id
getUserById(id)

// POST /users
createUser(userData)

// PUT /users/:id
updateUser(id, userData)

// DELETE /users/:id
deleteUser(id)
```

**Response Handling:**
- Extract data from standard envelope
- Handle pagination metadata
- Return standardized format

---

### Step 2: Build Users List Page

**File:** `src/features/users/pages/UsersListPage.jsx`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Users                                    [+ New User]│
├─────────────────────────────────────────────────────┤
│ [Filters: Role ▼] [Status ▼] [Search.............]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│              [UsersTable Component]                  │
│                                                      │
├─────────────────────────────────────────────────────┤
│                     [Pagination]                     │
└─────────────────────────────────────────────────────┘
```

**Page Header:**
- Title: "Users"
- Breadcrumbs: Users & Access > Users
- Primary action: "New User" button (if has `users.create` permission)

**Filters Section:**
1. **Role Filter** - Dropdown with all roles
2. **Status Filter** - Active/Inactive/All
3. **Search** - Text input (searches firstName, lastName, email)

**Table Section:**
- Render `UsersTable` component
- Pass filtered data and loading state

**Pagination:**
- MUI `Pagination` component
- Show total items count
- Items per page selector (10, 20, 50, 100)

**State Management:**
- `page` - current page number
- `limit` - items per page
- `roleId` - selected role filter
- `isActive` - status filter
- `search` - search query
- `users` - fetched users data
- `loading` - loading state
- `totalPages` - pagination metadata

**Data Fetching Logic:**
- Fetch on component mount
- Re-fetch when filters change
- Debounce search input (500ms)
- Show loading state during fetch
- Show error state if fetch fails
- Show empty state if no results

---

### Step 3: Build Users Table Component

**File:** `src/features/users/components/UsersTable.jsx`

**Table Columns:**

| Column       | Data Source              | Width | Sortable |
|--------------|--------------------------|-------|----------|
| Name         | firstName + lastName     | 20%   | Yes      |
| Email        | email                    | 25%   | Yes      |
| Phone        | phone                    | 15%   | No       |
| Role         | role.roleName            | 15%   | Yes      |
| Status       | isActive (chip)          | 10%   | Yes      |
| Last Login   | lastLogin (formatted)    | 10%   | Yes      |
| Actions      | View/Edit/Delete buttons | 5%    | No       |

**Status Display:**
- Use `UserStatusChip` component
- Active: Green chip with "Active" text
- Inactive: Gray chip with "Inactive" text

**Actions Column:**

Show icon buttons based on permissions:

1. **View** - Eye icon, always visible, navigate to view page (or show details dialog)
2. **Edit** - Edit icon, visible if `users.update` permission
3. **Delete** - Delete icon, visible if `users.delete` permission

**Action Handlers:**
- **View:** Navigate to `/access/users/:id` (detail page) OR open dialog
- **Edit:** Navigate to `/access/users/:id/edit`
- **Delete:** Open confirmation dialog

**Table Features:**
- MUI `Table` with `TableContainer`
- Sticky header
- Hover row highlighting
- Loading skeleton rows while fetching
- Empty state when no data
- Responsive: horizontal scroll on mobile

**Sorting:**
- Click column header to sort
- Show sort indicator (up/down arrow)
- Toggle ascending/descending
- Send sort params to API

---

### Step 4: Build User Filters Component

**File:** `src/features/users/components/UserFilters.jsx`

**Purpose:** Reusable filter controls

**Filter Controls:**

1. **Role Dropdown**
   - Fetch roles from `/roles` endpoint
   - Show "All Roles" as default option
   - On change: update roleId filter

2. **Status Dropdown**
   - Options: All, Active, Inactive
   - On change: update isActive filter

3. **Search Input**
   - Placeholder: "Search by name or email..."
   - Debounced input (500ms delay)
   - Clear button (X icon)
   - On change: update search filter

**Layout:**
- Horizontal on desktop (3 controls in row)
- Stack vertically on mobile
- Consistent spacing and alignment

**Props:**
- `filters` - current filter values
- `onFilterChange` - callback when filter changes

---

### Step 5: Build User Form Component

**File:** `src/features/users/components/UserForm.jsx`

**Purpose:** Reusable form for create and edit

**Form Fields:**

| Field       | Type         | Required | Validation                                  |
|-------------|--------------|----------|---------------------------------------------|
| First Name  | Text         | Yes      | 2-50 chars, no leading/trailing spaces      |
| Last Name   | Text         | Yes      | 2-50 chars, no leading/trailing spaces      |
| Email       | Email        | Yes      | Valid email format, unique                  |
| Phone       | Text         | No       | International format (+919876543210)        |
| Password    | Password     | Yes*     | *Required on create, optional on edit       |
| Role        | Dropdown     | Yes      | Select from available roles                 |
| Is Active   | Switch/Toggle| No       | Default: true                               |

**Password Field Behavior:**
- **Create mode:** Required, show strength indicator
- **Edit mode:** Optional (leave empty to keep current password)

**Password Validation Rules:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Show password strength indicator:**
- Weak (red) - less than 4 criteria met
- Medium (orange) - 4 criteria met
- Strong (green) - all criteria met

**Form Layout:**
- Two-column layout on desktop (>=900px)
- Single column on mobile
- Comfortable spacing between fields
- Labels above inputs
- Required field indicator (asterisk)

**Form States:**
- **Idle:** Ready for input
- **Validating:** Field-level validation
- **Submitting:** API call in progress
- **Error:** Display server errors
- **Success:** Redirect to users list

**Action Buttons:**
- **Save/Create** - Primary button, disabled during submit
- **Cancel** - Secondary button, navigate back to users list
- Show loading spinner on submit button during save

**Props:**
- `mode` - 'create' or 'edit'
- `initialData` - User data for edit mode (null for create)
- `onSubmit` - Submit handler
- `onCancel` - Cancel handler

---

### Step 6: Build User Create Page

**File:** `src/features/users/pages/UserCreatePage.jsx`

**Layout:**

```
┌─────────────────────────────────────────┐
│ Create New User               [Cancel]  │
├─────────────────────────────────────────┤
│                                         │
│      [UserForm Component - Create]      │
│                                         │
└─────────────────────────────────────────┘
```

**Page Header:**
- Title: "Create New User"
- Breadcrumbs: Users & Access > Users > New User
- Cancel button (navigate back to users list)

**Form Integration:**
- Render `UserForm` with `mode="create"`
- Handle form submission
- Call `createUser()` API
- On success: Show success message, redirect to users list
- On error: Display error message on form

**Validation:**
- Client-side validation before API call
- Server-side validation errors mapped to fields
- Email uniqueness check (handled by backend)

**Error Handling:**

| Error Code            | Display Message                                      |
|-----------------------|------------------------------------------------------|
| EMAIL_EXISTS          | Email already exists. Please use a different email.  |
| VALIDATION_ERROR      | Map field errors to respective inputs                |
| FORBIDDEN             | You don't have permission to create users            |
| Network error         | Unable to save. Please check your connection.        |

---

### Step 7: Build User Edit Page

**File:** `src/features/users/pages/UserEditPage.jsx`

**Similar to Create Page, but:**
- Title: "Edit User"
- Breadcrumbs: Users & Access > Users > Edit User
- Fetch user data on mount using userId from URL params
- Pre-populate form with existing user data
- Password field optional (empty = no change)
- Cannot change email (make field read-only)
- Call `updateUser(id, data)` API on submit

**Additional Restrictions:**
- Cannot edit own role (prevent privilege escalation)
- Cannot deactivate own account
- Show warning if changing user's role

**Loading State:**
- Show skeleton/spinner while fetching user data
- Show 404 if user not found

---

### Step 8: Build User Delete Dialog

**File:** `src/features/users/components/UserDeleteDialog.jsx`

**Purpose:** Confirmation dialog for user deletion

**Dialog Content:**

```
┌─────────────────────────────────────────┐
│ Delete User?                        [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to delete this    │
│ user?                                    │
│                                          │
│ User: Ramkumar Singh                     │
│ Email: ramkumar@wlancorp.com             │
│                                          │
│ This action cannot be undone.            │
├─────────────────────────────────────────┤
│                   [Cancel]  [Delete]     │
└─────────────────────────────────────────┘
```

**Props:**
- `open` - Dialog visibility
- `user` - User object to delete
- `onClose` - Close handler
- `onConfirm` - Delete confirmation handler

**Delete Button:**
- Red color (error)
- Show loading spinner during delete
- Disabled during delete operation

**Business Logic:**
- Cannot delete self (check user.id === currentUser.id)
- Show different message if trying to delete self: "You cannot delete your own account"

---

### Step 9: Implement Profile Management

**File:** `src/features/auth/pages/ProfilePage.jsx` (update from Phase 2 placeholder)

**Full Implementation:**

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ My Profile                                          │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐                                       │
│  │          │   Ramkumar Singh                      │
│  │  Avatar  │   Super Admin                         │
│  │  Image   │   ramkumar@wlancorp.com               │
│  │          │   [Change Photo] [Remove Photo]       │
│  └──────────┘                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│        [Profile Information Form]                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│        [Password Section]                           │
│        [Change Password]                            │
└─────────────────────────────────────────────────────┘
```

**Sections:**

1. **Profile Header**
   - Large avatar (120px x 120px)
   - User name and role (read-only display)
   - Email (read-only display)
   - Last login timestamp

2. **Profile Image Section**
   - Current profile image or placeholder
   - "Change Photo" button → opens file picker
   - "Remove Photo" button → removes current photo (if exists)
   - Image upload with preview
   - Validation: max 2MB, JPEG/PNG only

3. **Profile Information Form**
   - First Name (editable)
   - Last Name (editable)
   - Phone (editable)
   - Email (read-only, cannot change)
   - Save/Cancel buttons

4. **Password Section**
   - "Change Password" button
   - Opens separate page or dialog for password change

**Data Flow:**
- Fetch current user profile from `/profile` endpoint
- Display in form
- On save: Call `/profile` PUT endpoint
- On success: Update AuthContext user state
- Show success message

---

### Step 10: Build Profile Image Upload Component

**File:** `src/features/auth/components/ProfileImageUpload.jsx`

**Purpose:** Handle profile image upload with preview

**Features:**

1. **Current Image Display**
   - Show current profile image or avatar placeholder
   - Circular shape (120px diameter)
   - Border with theme color

2. **Upload Mechanism**
   - Hidden file input
   - "Change Photo" button triggers file picker
   - Accept: image/jpeg, image/png
   - Max size: 2MB

3. **Preview Before Upload**
   - Show selected image immediately
   - "Upload" button to confirm
   - "Cancel" button to discard

4. **Upload Progress**
   - Show progress indicator during upload
   - Disable buttons during upload

5. **Remove Photo**
   - "Remove Photo" button
   - Shows confirmation dialog
   - Resets to default avatar

**Validation:**
- File type check (JPEG/PNG only)
- File size check (max 2MB)
- Show error message if validation fails

**API Integration:**
- POST `/profile/upload-image` with multipart/form-data
- Receive image URL in response
- Update displayed image

---

### Step 11: Build Change Password Form

**File:** `src/features/auth/components/PasswordChangeForm.jsx`

**Form Fields:**

| Field            | Type     | Validation                                     |
|------------------|----------|------------------------------------------------|
| Current Password | Password | Required                                       |
| New Password     | Password | Required, min 8 chars, complexity rules        |
| Confirm Password | Password | Required, must match new password              |

**Password Strength Indicator:**
- Display below "New Password" field
- Show requirements checklist:
  - [x] At least 8 characters
  - [x] Contains uppercase letter
  - [x] Contains lowercase letter
  - [x] Contains number
  - [x] Contains special character
- Green checkmarks when criteria met

**Validation Rules:**
- Current password cannot be empty
- New password must meet complexity requirements
- New password cannot match current password
- Confirm password must match new password

**Submit Behavior:**
- Call PUT `/profile/change-password`
- On success:
  - Show success message
  - Clear form
  - Optionally: Logout and redirect to login (force re-authentication)
- On error:
  - Show error message
  - Possible errors:
    - INCORRECT_PASSWORD: "Current password is incorrect"
    - VALIDATION_ERROR: Show specific validation errors

**Form Actions:**
- "Change Password" button (primary)
- "Cancel" button (secondary)

---

### Step 12: Create Custom Hooks

#### Hook 1: useUsers

**File:** `src/features/users/hooks/useUsers.js`

**Purpose:** Fetch and manage users list

**Returns:**
```javascript
{
  users,           // Array of user objects
  loading,         // Boolean
  error,           // Error message
  totalPages,      // Number
  refetch,         // Function to re-fetch
}
```

**Accepts:**
- Filters object: { page, limit, roleId, isActive, search }

**Logic:**
- Fetch users from API when filters change
- Handle loading and error states
- Cache results (optional)

#### Hook 2: useUserCreate

**File:** `src/features/users/hooks/useUserCreate.js`

**Purpose:** Handle user creation logic

**Returns:**
```javascript
{
  createUser,      // Function to create user
  loading,         // Boolean
  error,           // Error message
}
```

**Logic:**
- Call createUser API
- Handle validation errors
- Return success/failure

#### Hook 3: useUserUpdate

**File:** `src/features/users/hooks/useUserUpdate.js`

**Purpose:** Handle user update logic

**Returns:**
```javascript
{
  updateUser,      // Function to update user
  loading,         // Boolean
  error,           // Error message
}
```

#### Hook 4: useUserDelete

**File:** `src/features/users/hooks/useUserDelete.js`

**Purpose:** Handle user deletion logic

**Returns:**
```javascript
{
  deleteUser,      // Function to delete user
  loading,         // Boolean
  error,           // Error message
}
```

---

## API Integration Specifications

### GET /users

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `roleId` (optional)
- `isActive` (optional, boolean)
- `search` (optional, string)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "firstName": "Ramkumar",
        "lastName": "Singh",
        "email": "ramkumar@wlancorp.com",
        "phone": "+919876543210",
        "role": {
          "id": "...",
          "roleName": "Super Admin"
        },
        "isActive": true,
        "lastLogin": "2026-01-14T10:30:00.000Z",
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### POST /users

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@wlancorp.com",
  "password": "SecurePass123!",
  "phone": "+919876543211",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k3",
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@wlancorp.com",
    // ... other fields
  },
  "message": "User created successfully"
}
```

### PUT /users/:id

**Request Body:** (all fields optional)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543211",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k3",
  "isActive": true
}
```

### DELETE /users/:id

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SELF",
    "message": "You cannot delete your own account"
  }
}
```

### GET /profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "Ramkumar",
    "lastName": "Singh",
    "email": "ramkumar@wlancorp.com",
    "phone": "+919876543210",
    "role": { /* role object */ },
    "profileImage": "https://storage.example.com/profiles/...",
    "lastLogin": "2026-01-14T10:30:00.000Z"
  }
}
```

### PUT /profile

**Request Body:**
```json
{
  "firstName": "Ramkumar",
  "lastName": "Singh",
  "phone": "+919876543210"
}
```

### POST /profile/upload-image

**Request:** multipart/form-data
- Field name: `profileImage`
- Max size: 2MB
- Allowed types: image/jpeg, image/png

**Response:**
```json
{
  "success": true,
  "data": {
    "profileImage": "https://storage.example.com/profiles/..."
  }
}
```

### PUT /profile/change-password

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!@#"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Validation Rules Summary

### User Create/Edit Form

**First Name:**
- Required
- 2-50 characters
- No leading/trailing spaces
- Client-side: trim before validation

**Last Name:**
- Same as First Name

**Email:**
- Required (create only)
- Valid email format: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`
- Unique (backend validates)
- Read-only in edit mode

**Phone:**
- Optional
- International format: `/^\+?[1-9]\d{9,14}$/`
- Example: +919876543210

**Password:**
- Required on create, optional on edit
- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)

**Role:**
- Required
- Must be valid roleId from available roles

**Is Active:**
- Optional, default true

### Profile Update Form

**First Name:** Same as above  
**Last Name:** Same as above  
**Phone:** Same as above

### Change Password Form

**Current Password:**
- Required

**New Password:**
- Same rules as user password
- Cannot match current password

**Confirm Password:**
- Required
- Must match new password

---

## User Experience Requirements

### Loading States

**Users List:**
- Show skeleton table rows while loading (5 rows)
- Show spinner in pagination during page change
- Disable filter controls during load

**Form Submit:**
- Disable all inputs
- Show spinner on submit button
- Change button text: "Save" → "Saving..."

**Image Upload:**
- Show progress bar during upload
- Disable upload button
- Preview image immediately after selection

### Success Feedback

**User Created:**
- Show success snackbar: "User created successfully"
- Redirect to users list after 1 second

**User Updated:**
- Show success snackbar: "User updated successfully"
- Redirect to users list

**User Deleted:**
- Show success snackbar: "User deleted successfully"
- Refresh users list

**Profile Updated:**
- Show success snackbar: "Profile updated successfully"
- Update user info in AuthContext

**Password Changed:**
- Show success snackbar: "Password changed successfully"
- Clear form
- Optional: Logout and force re-login

### Error Feedback

**Field Errors:**
- Show inline below each field
- Red color, small font size
- Clear on field focus

**Form Errors:**
- Show Alert component above form
- Auto-dismiss after 5 seconds
- Allow manual dismiss

**API Errors:**
- Map error codes to user-friendly messages
- Show in Alert or Snackbar
- Include action button if applicable (e.g., "Try Again")

### Empty States

**No Users Found:**
- Icon: PersonOffIcon
- Message: "No users found"
- Suggestion: "Try adjusting your filters"
- Action: "Clear Filters" button

**No Search Results:**
- Icon: SearchOffIcon
- Message: "No users match your search"
- Search term display: "Searched for: {searchTerm}"
- Action: "Clear Search" button

---

## Permission-Based UI Rendering

### Users List Page

| Element        | Required Permission | Behavior if Missing    |
|----------------|---------------------|------------------------|
| View Page      | users.read          | Redirect to 403        |
| "New User" btn | users.create        | Hide button            |
| Edit action    | users.update        | Hide edit icon         |
| Delete action  | users.delete        | Hide delete icon       |

### User Create/Edit Pages

| Element           | Required Permission | Behavior if Missing    |
|-------------------|---------------------|------------------------|
| Access Create Page| users.create        | Redirect to 403        |
| Access Edit Page  | users.update        | Redirect to 403        |

### Profile Page

| Element           | Required Permission | Behavior if Missing    |
|-------------------|---------------------|------------------------|
| View Profile      | None (own profile)  | Always accessible      |
| Edit Profile      | None (own profile)  | Always accessible      |
| Change Password   | None (own profile)  | Always accessible      |

---

## Testing Checklist

### Users List Tests

- [ ] Users list loads with pagination
- [ ] Role filter works correctly
- [ ] Status filter works correctly
- [ ] Search filters results (debounced)
- [ ] Pagination navigation works
- [ ] Items per page selector works
- [ ] Sorting by column works
- [ ] View action navigates to user details
- [ ] Edit action navigates to edit page (if permission)
- [ ] Delete action opens confirmation dialog (if permission)
- [ ] Empty state shows when no results
- [ ] Loading state shows during fetch
- [ ] Error state shows on fetch failure

### User Create Tests

- [ ] Form displays with all fields
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Phone format validation works
- [ ] Password strength indicator works
- [ ] Role dropdown populates from API
- [ ] Form submits with valid data
- [ ] Success message shows on create
- [ ] Redirects to users list after success
- [ ] Server errors display correctly
- [ ] Duplicate email error shows
- [ ] Cancel button navigates back

### User Edit Tests

- [ ] User data loads and pre-populates form
- [ ] Email field is read-only
- [ ] Password field is optional
- [ ] Can update name, phone, role, status
- [ ] Cannot edit own role
- [ ] Cannot deactivate own account
- [ ] Form submits with valid data
- [ ] Success message shows on update
- [ ] Redirects to users list after success
- [ ] 404 shows if user not found

### User Delete Tests

- [ ] Confirmation dialog opens on delete click
- [ ] Dialog shows user details
- [ ] Cannot delete own account
- [ ] Delete succeeds with confirmation
- [ ] Success message shows
- [ ] Users list refreshes after delete
- [ ] Cancel closes dialog without deleting

### Profile Management Tests

- [ ] Profile page loads current user data
- [ ] Can update first name, last name, phone
- [ ] Cannot change email
- [ ] Profile image displays
- [ ] Can upload new profile image (JPEG/PNG)
- [ ] Image validation works (type, size)
- [ ] Upload progress shows
- [ ] New image displays after upload
- [ ] Can remove profile image
- [ ] Profile update saves successfully
- [ ] AuthContext updates after profile save

### Change Password Tests

- [ ] Form displays with all fields
- [ ] Current password required
- [ ] New password complexity validation works
- [ ] Password strength indicator shows
- [ ] Confirm password must match
- [ ] Cannot use same password
- [ ] Form submits with valid data
- [ ] Success message shows
- [ ] Form clears after success
- [ ] Incorrect current password shows error

### Permission Tests

- [ ] User without users.read cannot access users list
- [ ] User without users.create cannot see "New User" button
- [ ] User without users.update cannot see edit actions
- [ ] User without users.delete cannot see delete actions
- [ ] Any user can access own profile
- [ ] Super Admin (*) can access all features

---

## Common Issues and Solutions

### Issue: Email uniqueness not validated

**Cause:** Backend validation only, no client-side check

**Solution:** Accept backend error and display to user. Optional: Add async validation on blur.

### Issue: Cannot delete user - "user in use" error

**Cause:** User has associated data (created records, etc.)

**Solution:** Display backend error message. Consider showing related data count.

### Issue: Profile image upload fails

**Cause:** File too large or wrong format

**Solution:** Validate file before upload. Show clear error message.

### Issue: Password change fails with "incorrect password"

**Cause:** User entered wrong current password

**Solution:** Display error on current password field. Suggest using "Forgot Password" if available.

### Issue: Form validation not triggering

**Cause:** React Hook Form not configured properly

**Solution:** Ensure validation rules defined in form registration.

---

## Performance Considerations

- Debounce search input (500ms)
- Memoize filter components
- Virtualize large tables (if > 100 rows per page)
- Lazy load user details on expand/view
- Optimize image uploads (compress before upload if large)
- Cache roles list (doesn't change frequently)

---

## Accessibility Requirements

- [ ] All form fields have labels
- [ ] Required fields indicated with asterisk and aria-required
- [ ] Error messages announced to screen readers
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Delete confirmation dialog keyboard accessible
- [ ] Table keyboard navigable
- [ ] Status chips have aria-label
- [ ] Image upload has aria-label

---

## File Structure After Phase 3

```
src/
├── features/
│   ├── users/
│   │   ├── pages/
│   │   │   ├── UsersListPage.jsx
│   │   │   ├── UserCreatePage.jsx
│   │   │   └── UserEditPage.jsx
│   │   ├── components/
│   │   │   ├── UsersTable.jsx
│   │   │   ├── UserForm.jsx
│   │   │   ├── UserFilters.jsx
│   │   │   ├── UserDeleteDialog.jsx
│   │   │   └── UserStatusChip.jsx
│   │   └── hooks/
│   │       ├── useUsers.js
│   │       ├── useUserCreate.js
│   │       ├── useUserUpdate.js
│   │       └── useUserDelete.js
│   └── auth/
│       ├── pages/
│       │   ├── ProfilePage.jsx (updated)
│       │   └── ChangePasswordPage.jsx
│       └── components/
│           ├── ProfileForm.jsx
│           ├── ProfileImageUpload.jsx
│           └── PasswordChangeForm.jsx
├── services/
│   └── userService.js
└── routes/
    └── AppRoutes.jsx (updated with user routes)
```

---

## Success Criteria

Phase 3 is complete when:

- [ ] Users list page displays all users with pagination
- [ ] Filters and search work correctly
- [ ] Can create new user with validation
- [ ] Can edit existing user
- [ ] Can delete user with confirmation
- [ ] Cannot delete own account
- [ ] Profile page shows current user info
- [ ] Can update profile information
- [ ] Can upload/remove profile image
- [ ] Can change password
- [ ] All permission checks work
- [ ] All validations work (client + server)
- [ ] Loading and error states handled
- [ ] Responsive design works
- [ ] All tests pass
- [ ] No console errors

---

## Next Steps After Phase 3

Once user management is complete:

✅ **Phase 4: Role Management Module**
- Roles list with permissions display
- Role create/edit forms
- Permission selection UI
- Role delete with dependency checks
- Permission-based UI utilities

---

## Estimated Time

**Total:** 12-15 hours

**Breakdown:**
- User service layer: 1 hour
- Users list page + table: 3 hours
- User create/edit pages + form: 3 hours
- User delete functionality: 1 hour
- Profile management: 2 hours
- Profile image upload: 1.5 hours
- Change password: 1.5 hours
- Testing and bug fixes: 2 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 3**

**Status:** Ready for implementation  
**Next Phase:** Phase 4 - Role Management Module
