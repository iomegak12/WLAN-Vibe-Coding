# Phase 1: Authentication Core

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 1 - Authentication Core  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0 must be completed

---

## Phase Objectives

Implement the complete authentication system:
- ✅ Login page with form validation
- ✅ Token management (access + refresh tokens)
- ✅ Auto token refresh mechanism
- ✅ Session timeout and auto-logout
- ✅ Error handling for auth failures
- ✅ Loading states and UX feedback
- ✅ Integration with AUTH service API

---

## Prerequisites

### Completed Tasks from Phase 0
- [x] Project setup with Vite + React
- [x] Material-UI installed and themed
- [x] Axios configured with interceptors
- [x] AuthContext created
- [x] Basic routing structure

### Backend Verification
Before starting, verify AUTH service is running:

```bash
# Test login endpoint
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wlancorp.com","password":"Test123!@#"}'
```

Expected: 200 OK with accessToken, refreshToken, and user object

---

## Architecture Overview

### Components to Build

```
src/features/auth/
├── pages/
│   └── LoginPage.jsx          # Main login page
├── components/
│   ├── LoginForm.jsx          # Login form with validation
│   └── PasswordInput.jsx      # Password field with show/hide toggle
└── hooks/
    └── useLogin.js            # Login logic hook

src/components/feedback/
├── LoadingSpinner.jsx         # Reusable loading component
└── ErrorAlert.jsx             # Reusable error display component
```

### State Management Flow

1. **Login Form** → validates inputs → calls `login()` from AuthContext
2. **AuthContext** → calls AUTH API → stores tokens in localStorage → updates state
3. **Axios Interceptor** → auto-attaches token to all requests
4. **Token Refresh** → interceptor detects 401 → calls refresh endpoint → retries request
5. **Auto-logout** → timeout timer → clears tokens → redirects to login

---

## Step-by-Step Implementation Guide

### Step 1: Create Auth Service Layer

**File:** `src/services/authService.js`

**Purpose:** Centralize all AUTH API calls

**Functions to implement:**
- `login(email, password)` - POST /auth/login
- `logout(refreshToken)` - POST /auth/logout
- `refreshToken(refreshToken)` - POST /auth/refresh
- `verifyToken()` - GET /auth/verify
- `getProfile()` - GET /profile
- `updateProfile(data)` - PUT /profile
- `changePassword(currentPassword, newPassword)` - PUT /profile/change-password
- `uploadProfileImage(file)` - POST /profile/upload-image

**Key considerations:**
- Use the `authAPI` instance from `src/services/api.js`
- Return standardized response format: `{ success, data, error }`
- Handle API errors gracefully
- Extract data from standard envelope: `response.data.data`

---

### Step 2: Build Login Page Structure

**File:** `src/features/auth/pages/LoginPage.jsx`

**Layout Requirements:**

```
┌─────────────────────────────────────────┐
│                                         │
│           [WLAN Logo/Name]              │
│                                         │
│     ┌─────────────────────────────┐    │
│     │   WLAN Warehouse Manager    │    │
│     │                             │    │
│     │   [LoginForm Component]     │    │
│     │                             │    │
│     └─────────────────────────────┘    │
│                                         │
│         © 2026 WLAN Corporation         │
└─────────────────────────────────────────┘
```

**Design Specifications:**
- **Layout:** Centered card on full-screen background
- **Background:** Subtle gradient (use theme colors)
- **Card:** MUI `Card` component with elevation
- **Max width:** 400px
- **Padding:** Comfortable spacing (32px-48px)
- **Responsive:** Stack on mobile, center on desktop

**Elements:**
1. Logo/Brand name at top
2. Page title: "Sign In" or "Login"
3. Subtitle: "Enter your credentials to access the system"
4. LoginForm component
5. Footer text (optional): Copyright, version info

---

### Step 3: Build Login Form Component

**File:** `src/features/auth/components/LoginForm.jsx`

**Form Fields:**

| Field    | Type     | Validation Rules                           |
|----------|----------|--------------------------------------------|
| Email    | text     | Required, valid email format               |
| Password | password | Required, minimum 8 characters             |

**Additional UI Elements:**
- "Show/Hide Password" toggle icon
- "Remember Me" checkbox (optional - tokens already in localStorage)
- "Forgot Password?" link (disabled/placeholder for now)
- Submit button: "Sign In" or "Login"

**Validation Strategy:**

**Use React Hook Form:**
- Client-side validation on blur
- Submit validation before API call
- Display field-level errors inline
- Display server-side errors from API

**Validation Rules:**
```
Email:
- Required: "Email is required"
- Pattern: "Please enter a valid email address"

Password:
- Required: "Password is required"
- MinLength (8): "Password must be at least 8 characters"
```

**Form States:**
- **Idle:** Ready for input
- **Validating:** Client-side validation in progress
- **Submitting:** API call in progress (show loading spinner on button)
- **Error:** Show error message from API
- **Success:** Redirect to dashboard

**Error Handling:**

Display different messages based on API response:
- `INVALID_CREDENTIALS` → "Invalid email or password"
- `ACCOUNT_INACTIVE` → "Your account has been deactivated. Contact administrator."
- `VALIDATION_ERROR` → Map field errors to respective inputs
- Network error → "Unable to connect. Please check your connection."

---

### Step 4: Create Password Input Component

**File:** `src/features/auth/components/PasswordInput.jsx`

**Purpose:** Reusable password field with show/hide toggle

**Features:**
- MUI `TextField` with type toggle (password/text)
- Eye icon button (Visibility/VisibilityOff from MUI icons)
- Accepts all standard TextField props
- Integrated with React Hook Form

**Icon Behavior:**
- Default: Show eye-slash icon (password hidden)
- On click: Toggle to eye icon (password visible)
- Accessible: aria-label for screen readers

---

### Step 5: Implement Login Logic Hook

**File:** `src/features/auth/hooks/useLogin.js`

**Purpose:** Encapsulate login business logic

**Hook responsibilities:**
- Call `login()` from AuthContext
- Handle loading state
- Handle error state
- Redirect on success

**Return values:**
```javascript
{
  handleLogin,      // Function to call on form submit
  loading,          // Boolean - true during API call
  error,            // String - error message if failed
}
```

**Flow:**
1. Receive email + password from form
2. Set loading = true
3. Call AuthContext.login(email, password)
4. If success: redirect to /dashboard
5. If error: set error message, loading = false
6. Reset error when user starts typing again

---

### Step 6: Enhance AuthContext with Session Management

**File:** `src/contexts/AuthContext.jsx` (update from Phase 0)

**Add new features:**

#### 6.1 Token Refresh Timer

**Purpose:** Proactively refresh token before expiration

**Implementation approach:**
- Start interval when user logs in
- Interval: Every 5 minutes (configurable in .env)
- Call refresh token API
- Update tokens in localStorage
- Clear interval on logout

**Key logic:**
```
- On login success → startRefreshTimer()
- Timer triggers → call refreshToken() → update localStorage
- On logout → clearRefreshTimer()
```

#### 6.2 Inactivity Timeout

**Purpose:** Auto-logout after 30 minutes of inactivity

**Implementation approach:**
- Track user activity (mouse move, keyboard, clicks)
- Reset timer on any activity
- Show warning dialog at 29 minutes (optional for Phase 2)
- Auto-logout at 30 minutes

**Events to track:**
- mousemove
- keydown
- click
- scroll

**Key logic:**
```
- On login → startInactivityTimer()
- On user activity → resetInactivityTimer()
- On timeout → logout() → redirect to /login
- On logout → clearInactivityTimer()
```

#### 6.3 Silent Token Refresh on App Load

**Already implemented in Phase 0**, but verify:
- On app mount → check localStorage for tokens
- If tokens exist → call /auth/verify
- If valid → set user state, set isAuthenticated = true
- If invalid → clear tokens, redirect to login

---

### Step 7: Create Feedback Components

#### 7.1 Loading Spinner Component

**File:** `src/components/feedback/LoadingSpinner.jsx`

**Purpose:** Reusable loading indicator

**Variants:**
- **Inline:** Small spinner for buttons (20px)
- **Page:** Full-screen centered spinner (48px)
- **Overlay:** Transparent overlay with spinner

**Use MUI:**
- `CircularProgress` component
- Accept size, color props

#### 7.2 Error Alert Component

**File:** `src/components/feedback/ErrorAlert.jsx`

**Purpose:** Reusable error message display

**Features:**
- MUI `Alert` component (severity="error")
- Dismissible (close button)
- Auto-dismiss after 5 seconds (optional)
- Accept custom message and action button

---

### Step 8: Update Routing

**File:** `src/routes/AppRoutes.jsx`

**Changes:**
- Replace placeholder LoginPage with actual component
- Ensure PublicRoute redirects authenticated users to /dashboard
- Ensure ProtectedRoute redirects unauthenticated users to /login

**Import:**
```javascript
import LoginPage from '../features/auth/pages/LoginPage';
```

---

### Step 9: Add Global Loading State

**Purpose:** Show loading overlay during authentication verification on app load

**Approach:**

In `App.jsx`:
- Check `AuthContext.loading`
- If true: Show full-screen loading spinner with "Verifying session..."
- If false: Render AppRoutes

**Why?**
Prevents flash of login page when user is actually authenticated but token verification is in progress.

---

## API Integration Specifications

### Endpoint: POST /auth/login

**Request:**
```json
{
  "email": "ramkumar@wlancorp.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "...",
      "firstName": "Ramkumar",
      "email": "ramkumar@wlancorp.com",
      "role": {
        "roleName": "Super Admin",
        "permissions": ["*"]
      }
    }
  }
}
```

**Error Responses:**
- 400: Validation error
- 401: Invalid credentials
- 403: Account inactive

### Endpoint: POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Endpoint: POST /auth/logout

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Endpoint: GET /auth/verify

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

---

## Validation Rules (Client-Side)

Implement these in the LoginForm:

### Email Field
- **Required:** `value.trim().length > 0`
- **Pattern:** `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`

### Password Field
- **Required:** `value.trim().length > 0`
- **Min Length:** `value.length >= 8`

**Note:** No strict password complexity validation on login (only on password change/user creation)

---

## User Experience Requirements

### Loading States

**During Login:**
- Disable form inputs
- Show spinner on submit button
- Change button text: "Sign In" → "Signing In..."
- Prevent multiple submissions

**During Initial Load:**
- Show full-screen loading with message: "Verifying session..."
- Block all UI until verification complete

### Error States

**Form Validation Errors:**
- Show inline below each field
- Red color (use theme error color)
- Clear on focus

**API Errors:**
- Show `Alert` component above form
- Auto-dismiss after 5 seconds OR allow manual dismiss
- Different messages based on error code

### Success State

**On Successful Login:**
- Clear form
- Show brief success message (optional)
- Immediate redirect to /dashboard (using React Router navigate)

**Smooth Transition:**
- No flash of content
- Loading state maintained until dashboard renders

---

## Security Considerations

### Token Storage
- ✅ Already using localStorage (as per requirement)
- Store `accessToken` and `refreshToken` separately
- Never log tokens to console in production

### Password Handling
- Never store password in state longer than necessary
- Clear password field after submit (success or fail)
- Use `type="password"` (toggle to text only on user action)

### Session Management
- Implement token refresh before expiration
- Clear all tokens on logout
- Handle concurrent tab sessions (Phase 2 consideration)

### Network Security
- HTTPS only in production
- Handle CORS properly (backend responsibility)
- Validate all inputs before sending to API

---

## Testing Checklist

### Manual Testing Tasks

**Login Flow:**
- [ ] Empty form shows validation errors on submit
- [ ] Invalid email format shows error
- [ ] Short password shows error
- [ ] Valid credentials successfully log in
- [ ] Invalid credentials show appropriate error
- [ ] Inactive account shows appropriate error
- [ ] Network error shows appropriate message

**Token Management:**
- [ ] Login stores tokens in localStorage
- [ ] Logout clears tokens from localStorage
- [ ] Token auto-refresh works (check network tab)
- [ ] Expired token triggers refresh and retry
- [ ] Invalid refresh token redirects to login

**Session Management:**
- [ ] Inactivity timeout logs user out after 30 minutes
- [ ] User activity resets inactivity timer
- [ ] Closing and reopening browser restores session (if tokens valid)

**UI/UX:**
- [ ] Password show/hide toggle works
- [ ] Loading spinner shows during login
- [ ] Error messages display correctly
- [ ] Success redirects to dashboard
- [ ] Responsive on mobile (form stacks properly)
- [ ] Accessible (keyboard navigation works)

**Route Protection:**
- [ ] Unauthenticated user accessing /dashboard redirects to /login
- [ ] Authenticated user accessing /login redirects to /dashboard
- [ ] Logout from any page redirects to /login

---

## Common Issues and Solutions

### Issue: CORS errors when calling localhost:5001

**Cause:** Backend not configured for CORS

**Solution:** Backend team needs to allow `http://localhost:5173` origin. Temporary workaround: use browser extension or proxy.

### Issue: Token refresh loop (infinite 401s)

**Cause:** Refresh token also expired or invalid

**Solution:** Ensure `_retry` flag is set in axios interceptor to prevent infinite loops. Clear tokens and redirect to login.

### Issue: Login successful but redirects back to login

**Cause:** Token not being stored or AuthContext not updating

**Solution:** Verify:
1. Tokens saved to localStorage
2. AuthContext.login() updates state correctly
3. ProtectedRoute reads isAuthenticated from context

### Issue: Inactivity logout too aggressive

**Cause:** Timer not resetting on activity

**Solution:** Ensure event listeners are properly attached and calling reset function.

---

## File Structure After Phase 1

```
src/
├── features/
│   └── auth/
│       ├── pages/
│       │   └── LoginPage.jsx
│       ├── components/
│       │   ├── LoginForm.jsx
│       │   └── PasswordInput.jsx
│       └── hooks/
│           └── useLogin.js
├── components/
│   └── feedback/
│       ├── LoadingSpinner.jsx
│       └── ErrorAlert.jsx
├── services/
│   ├── api.js (from Phase 0)
│   └── authService.js (new)
├── contexts/
│   └── AuthContext.jsx (updated with timers)
└── routes/
    └── AppRoutes.jsx (updated with LoginPage)
```

---

## Success Criteria

Phase 1 is complete when:

- [ ] Login page is fully functional with validation
- [ ] User can log in with valid credentials
- [ ] Tokens are stored and managed correctly
- [ ] Token auto-refresh works in background
- [ ] Inactivity timeout logs user out
- [ ] Error handling covers all scenarios
- [ ] Route protection works (login <-> dashboard)
- [ ] Session persists across browser refresh
- [ ] Logout clears session and redirects to login
- [ ] All manual tests pass
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile and desktop

---

## Design Reference

**Inspiration:** Tabler Admin Login Page
- Clean, minimal design
- Centered card on subtle background
- Clear hierarchy (logo → title → form → footer)
- Professional color scheme

**MUI Components to Use:**
- `Card`, `CardContent`
- `TextField`
- `Button`
- `IconButton` (for password toggle)
- `Alert`
- `CircularProgress`
- `Typography`
- `Box`, `Container`, `Stack`

---

## Performance Considerations

- Debounce validation on input fields (300ms)
- Memoize expensive computations in AuthContext
- Lazy load dashboard components (code splitting)
- Optimize re-renders (use React.memo where appropriate)

---

## Accessibility Checklist

- [ ] All form fields have labels
- [ ] Error messages announced to screen readers
- [ ] Keyboard navigation works (Tab, Enter to submit)
- [ ] Password toggle has aria-label
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards

---

## Next Steps After Phase 1

Once authentication is working:

✅ **Phase 2: App Shell & Navigation**
- Build sidebar navigation
- Build top bar with user menu
- Implement logout from dropdown
- Create layout wrapper for protected pages

---

## Estimated Time

**Total:** 6-8 hours

**Breakdown:**
- Auth service layer: 1 hour
- Login page + form: 2-3 hours
- AuthContext enhancements (timers): 2 hours
- Testing and bug fixes: 1-2 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 1**

**Status:** Ready for implementation  
**Next Phase:** Phase 2 - App Shell & Navigation
