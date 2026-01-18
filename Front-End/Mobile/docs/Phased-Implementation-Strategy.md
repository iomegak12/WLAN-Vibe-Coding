# Phased Implementation Strategy - WLAN Mobile App (React Native + Expo)

**Project:** WLAN Corporation Warehouse Mobile Application  
**Technology:** React Native (JavaScript) + Expo Development Build  
**Platform:** Android (Java 21)  
**Date Created:** January 18, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Technology Stack Recommendations](#1-technology-stack-recommendations)
2. [UI/UX Libraries & Component Recommendations](#2-uiux-libraries--component-recommendations)
3. [Project Setup & Configuration](#3-project-setup--configuration)
4. [Phase-wise Implementation Plan](#4-phase-wise-implementation-plan)
5. [API Endpoints Mapping](#5-api-endpoints-mapping)
6. [Development Timeline Estimates](#6-development-timeline-estimates)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Strategy](#8-deployment-strategy)

---

## 1. Technology Stack Recommendations

### Core Framework
- **React Native:** Latest stable version (0.73+)
- **Expo SDK:** 50+ (with development build for custom native modules)
- **Language:** JavaScript (ES6+)
- **Android JDK:** Java 21 (as specified)

### State Management
- **Redux Toolkit** - Comprehensive state management with built-in best practices
  - Redux Persist - For token and user data persistence
  - RTK Query - Integrated API caching and data fetching

### Navigation
- **React Navigation v6** - Industry standard
  - Bottom Tabs Navigator - Primary navigation
  - Stack Navigator - Screen stacks
  - Native Stack Navigator - Performance optimized

### HTTP Client
- **Axios** - Promise-based HTTP client
  - Axios interceptors for token management
  - Request/response transformation
  - Automatic token refresh

### Form Management
- **React Hook Form** - Performant form validation
  - Minimal re-renders
  - Easy integration with validation libraries

### Validation
- **Yup** - Schema validation
  - Works seamlessly with React Hook Form
  - Custom validation rules support

### Camera & Scanning
- **expo-camera** - Camera access and control
- **expo-barcode-scanner** - QR/Barcode scanning
- **react-native-vision-camera** (via development build if needed for advanced features)

### Storage
- **@react-native-async-storage/async-storage** - Local data persistence
- **expo-secure-store** - Secure token storage (recommended for production)

### Image Handling
- **expo-image-picker** - Image selection from gallery/camera
- **expo-image-manipulator** - Image resizing and optimization
- **react-native-fast-image** - Cached image loading with better performance

### Permissions
- **expo-permissions** - Unified permission handling
- **expo-camera (permissions)** - Camera permissions

### UI Feedback
- **react-native-toast-message** - Toast notifications
- **lottie-react-native** - Smooth animations for loading/success states
- **expo-haptics** - Haptic feedback

### Utilities
- **date-fns** - Date formatting and manipulation
- **lodash** - Utility functions (debounce, throttle, etc.)

---

## 2. UI/UX Libraries & Component Recommendations

### Recommended: React Native Paper (Material Design 3)

**Why React Native Paper?**
- ✅ Full Material Design 3 implementation (Google's latest design system)
- ✅ Android-native look and feel
- ✅ Comprehensive component library
- ✅ Built-in theming system
- ✅ Accessibility compliance
- ✅ Regular updates and active community
- ✅ Excellent documentation

**Components Available:**
- Buttons, FABs, Chips, Cards
- TextInputs with validation states
- Dialogs, Modals, Snackbars
- Lists, DataTables
- Bottom Navigation, AppBar
- Searchbar, Badges, Avatars
- Progress indicators (Circular, Linear)

### Installation:
```bash
npx expo install react-native-paper react-native-safe-area-context
```

### Alternative Options (if needed):

#### Option 2: React Native Elements
- Highly customizable
- Platform-agnostic design
- Good for cross-platform consistency

#### Option 3: NativeBase v3
- Rich component library
- Utility-first styling
- Good theming support

#### Option 4: UI Kitten (Eva Design System)
- Complete design system
- Customizable themes
- Good for complex apps

### **Recommendation: Go with React Native Paper**
**Justification:**
1. **Android-first design** - Material Design is native to Android
2. **Warehouse-optimized** - Large touch targets, high contrast
3. **Accessibility** - WCAG 2.1 compliant
4. **Theming** - Easy customization for brand colors
5. **Community** - Large ecosystem, extensive examples

---

## 3. Project Setup & Configuration

### Step 1: Initialize Expo Project
```bash
npx create-expo-app@latest wlan-mobile --template blank
cd wlan-mobile
```

### Step 2: Configure for Development Build
```bash
npx expo install expo-dev-client
```

### Step 3: Install Core Dependencies
```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# UI Library
npx expo install react-native-paper react-native-vector-icons

# State Management
npm install @reduxjs/toolkit react-redux redux-persist

# HTTP Client
npm install axios

# Forms & Validation
npm install react-hook-form yup @hookform/resolvers

# Camera & Scanning
npx expo install expo-camera expo-barcode-scanner

# Storage
npx expo install @react-native-async-storage/async-storage expo-secure-store

# Image Handling
npx expo install expo-image-picker expo-image-manipulator react-native-fast-image

# Utilities
npm install date-fns lodash

# UI Feedback
npm install react-native-toast-message lottie-react-native
npx expo install expo-haptics

# Permissions
npx expo install expo-permissions
```

### Step 4: Configure Android for Java 21
Update `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
```

Update `android/build.gradle`:
```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.0"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
    }
}
```

Update `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
    
    defaultConfig {
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
    }
}
```

### Step 5: Project Structure Setup
```
wlan-mobile/
├── src/
│   ├── api/              # API services and interceptors
│   ├── assets/           # Images, fonts, icons
│   ├── components/       # Reusable components
│   │   ├── common/       # Buttons, Inputs, Cards
│   │   ├── forms/        # Form components
│   │   └── layout/       # Headers, Footers
│   ├── config/           # App configuration
│   ├── constants/        # Constants (colors, strings)
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Logout
│   │   ├── scan/         # Scanner screen
│   │   ├── search/       # Search screen
│   │   ├── products/     # Product list, details, CRUD
│   │   ├── tasks/        # Tasks (placeholder)
│   │   └── profile/      # Profile, settings
│   ├── store/            # Redux store, slices
│   ├── theme/            # Theme configuration
│   ├── utils/            # Utility functions
│   └── validators/       # Validation schemas
├── App.js
└── app.json
```

---

## 4. Phase-wise Implementation Plan

### **PHASE 0: Project Foundation (Week 1)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Deliverables:**
- ✅ Expo project initialized with development build
- ✅ Android configuration with Java 21
- ✅ Folder structure created
- ✅ React Native Paper theme configured
- ✅ Navigation setup (bottom tabs + stacks)
- ✅ Redux store configured with persist
- ✅ Axios instance with interceptors
- ✅ Environment variables setup (.env)
- ✅ Git repository initialized with .gitignore

**Key Files:**
- `src/config/api.config.js` - API base URLs and config
- `src/store/index.js` - Redux store setup
- `src/navigation/AppNavigator.js` - Navigation configuration
- `src/theme/theme.js` - Material Design theme
- `src/api/axiosInstance.js` - Axios setup with interceptors

**Success Criteria:**
- App builds successfully on Android
- Navigation between tabs works
- Redux DevTools integrated (development)
- Environment switching works (dev/prod)

---

### **PHASE 1: Authentication & Session Management (Week 2)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Objective:** Implement complete authentication flow with token management

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | Login user |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/logout` | POST | Logout user |
| `/api/v1/auth/verify` | GET | Verify token validity |

**Features:**
1. **Login Screen**
   - Email/password inputs
   - Show/hide password toggle
   - Form validation (Yup schema)
   - Loading state during submission
   - Error handling (401, 422, 429)
   - "Remember Me" functionality

2. **Token Management**
   - Store tokens in secure storage (expo-secure-store)
   - Axios interceptor for automatic token attachment
   - Automatic token refresh on 401
   - Token rotation handling

3. **Session Persistence**
   - Auto-login if valid token exists
   - Session verification on app startup
   - Splash screen during verification

4. **Auto-logout**
   - Inactivity timer implementation
   - Warning dialog before logout
   - Automatic redirect to login

**Components to Build:**
- `screens/auth/LoginScreen.js`
- `components/forms/LoginForm.js`
- `store/slices/authSlice.js`
- `api/services/authService.js`
- `utils/tokenManager.js`
- `utils/activityTracker.js`

**Validation Rules:**
```javascript
// Email validation
email: yup.string()
  .email('Invalid email format')
  .required('Email is required')

// Password validation
password: yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required')
```

**Success Criteria:**
- ✅ User can login with valid credentials
- ✅ Invalid credentials show appropriate error
- ✅ Token refresh works automatically
- ✅ Session persists after app restart
- ✅ Auto-logout works after inactivity
- ✅ All error states handled gracefully

---

### **PHASE 2: Profile Management (Week 3)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Objective:** User profile view, edit, and password change

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/profile` | GET | Get user profile |
| `/api/v1/profile` | PUT | Update profile |
| `/api/v1/profile/upload-image` | POST | Upload profile image |
| `/api/v1/profile/delete-image` | DELETE | Delete profile image |
| `/api/v1/users/{id}/change-password` | PATCH | Change password |

**Features:**
1. **Profile Screen**
   - Display user info (name, email, phone, role)
   - Profile image with placeholder
   - Edit profile button
   - Change password button
   - Logout button

2. **Edit Profile**
   - Edit firstName, lastName, phone
   - Form validation
   - Optimistic UI update
   - Success/error feedback

3. **Profile Image**
   - Upload from camera/gallery
   - Image preview before upload
   - Image compression (max 2MB)
   - Delete current image

4. **Change Password**
   - Current password validation
   - New password strength meter
   - Confirm password matching
   - Success message with auto-logout

**Components to Build:**
- `screens/profile/ProfileScreen.js`
- `screens/profile/EditProfileScreen.js`
- `screens/profile/ChangePasswordScreen.js`
- `components/profile/ProfileCard.js`
- `components/profile/ImageUploader.js`
- `store/slices/profileSlice.js`
- `api/services/profileService.js`

**Validation Rules:**
```javascript
// Profile update
firstName: yup.string()
  .min(2, 'Minimum 2 characters')
  .max(50, 'Maximum 50 characters')
  .trim()

phone: yup.string()
  .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')

// Password change
currentPassword: yup.string().required()
newPassword: yup.string()
  .min(8)
  .matches(/[A-Z]/, 'Must contain uppercase')
  .matches(/[a-z]/, 'Must contain lowercase')
  .matches(/[0-9]/, 'Must contain number')
  .matches(/[!@#$%^&*]/, 'Must contain special character')
  .notOneOf([yup.ref('currentPassword')], 'Must be different')
```

**Success Criteria:**
- ✅ Profile loads and displays correctly
- ✅ Profile edit saves successfully
- ✅ Image upload/delete works
- ✅ Password change validates correctly
- ✅ All validation rules enforced
- ✅ Role-based UI elements display

---

### **PHASE 3: Categories & Sub-categories (Week 4)**
**Duration:** 3-5 days  
**Team:** 1 Developer + 1 QA

**Objective:** Fetch and cache categories/subcategories for product forms

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/categories` | GET | List all categories |
| `/api/v1/subcategories` | GET | List subcategories (filtered) |

**Features:**
1. **Category Service**
   - Fetch all active categories
   - Cache in Redux store
   - Auto-refresh on app start

2. **Sub-category Service**
   - Fetch filtered by category_id
   - Lazy loading on category selection
   - Cache per category

3. **Picker Components**
   - Category picker with search
   - Sub-category picker (dependent on category)
   - Clear selection option
   - Loading states

**Components to Build:**
- `components/pickers/CategoryPicker.js`
- `components/pickers/SubCategoryPicker.js`
- `store/slices/categoriesSlice.js`
- `api/services/categoryService.js`

**Caching Strategy:**
- Categories: Cache for entire session
- Sub-categories: Cache per category_id
- Invalidate on logout

**Success Criteria:**
- ✅ Categories load on app startup
- ✅ Picker components work smoothly
- ✅ Sub-categories filter correctly
- ✅ Cache reduces API calls
- ✅ Loading states visible

---

### **PHASE 4: Product Search & List (Week 5)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Objective:** Product search with filters and infinite scroll

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/products` | GET | List/search products |

**Query Parameters:**
- `page` - Pagination
- `limit` - Items per page (10-20 for mobile)
- `search` - Search term (SKU, name, brand)
- `category_id` - Filter by category
- `subcategory_id` - Filter by subcategory
- `brand` - Filter by brand
- `is_active` - Filter by status

**Features:**
1. **Search Screen**
   - Searchbar with debounce (300ms)
   - Minimum 2 characters to search
   - Clear search button
   - Recent searches (local storage)

2. **Product List**
   - Infinite scroll (load more on 80% scroll)
   - Pull-to-refresh
   - Empty state
   - Loading skeleton
   - Product card with image, SKU, name, price

3. **Filters**
   - Filter modal/bottom sheet
   - Category filter
   - Brand filter (extracted from products)
   - Status filter
   - Clear all filters button

4. **Product Card**
   - Thumbnail image
   - SKU badge
   - Product name
   - Brand + Model
   - Price (formatted)
   - Status chip (color-coded)
   - Tap to view details

**Components to Build:**
- `screens/search/SearchScreen.js`
- `screens/products/ProductListScreen.js`
- `components/products/ProductCard.js`
- `components/products/ProductListSkeleton.js`
- `components/filters/FilterModal.js`
- `store/slices/productsSlice.js`
- `api/services/productService.js`

**Pagination Logic:**
```javascript
// Load more when scrolled to 80%
const handleLoadMore = () => {
  if (!loading && pagination.hasNext) {
    fetchProducts(pagination.page + 1);
  }
};
```

**Success Criteria:**
- ✅ Search with debounce works
- ✅ Infinite scroll loads next page
- ✅ Pull-to-refresh reloads
- ✅ Filters apply correctly
- ✅ Empty states show
- ✅ Loading skeletons visible

---

### **PHASE 5: Product Details Screen (Week 6)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Objective:** Display complete product information with images and codes

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/products/{id}` | GET | Get product details |
| `/api/v1/files/{file_id}` | GET | Get image/QR/barcode |

**Features:**
1. **Product Details Layout**
   - Header with SKU and status chip
   - Image carousel (if multiple images)
   - Product information sections
   - Action buttons (Edit, Share)

2. **Information Sections**
   - Identity: Name, Brand, Model
   - Classification: Category, Sub-category
   - Commercial: Price (formatted with currency)
   - Inventory: Current stock, min/max levels
   - Specifications: Dynamic key-value display
   - Description: Expandable text
   - Metadata: Created/Updated timestamps

3. **Image Carousel**
   - Swipeable image gallery
   - Pinch-to-zoom on tap
   - Pagination dots
   - Placeholder if no images

4. **QR Code & Barcode Display**
   - Dedicated section
   - Tap to enlarge (full-screen modal)
   - Download/Share options
   - Regenerate option (if permitted)

5. **Actions**
   - Edit button (permission-based)
   - Share product info
   - Download QR/Barcode

**Components to Build:**
- `screens/products/ProductDetailScreen.js`
- `components/products/ImageCarousel.js`
- `components/products/ProductInfo.js`
- `components/products/CodeViewer.js` (QR/Barcode)
- `components/modals/ImageViewerModal.js`
- `components/products/SpecificationsList.js`

**Image Loading Strategy:**
- Use `react-native-fast-image` for caching
- Show placeholder during load
- Handle load errors gracefully

**Success Criteria:**
- ✅ Product details load completely
- ✅ Images display in carousel
- ✅ QR/Barcode viewable and downloadable
- ✅ Edit button shows only with permission
- ✅ All data formatted correctly
- ✅ Pinch-to-zoom works

---

### **PHASE 6: Scanner Implementation (Week 7)**
**Duration:** 7-10 days  
**Team:** 1 Developer + 1 QA

**Objective:** QR/Barcode scanning with product resolution

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/products` | GET | Search by SKU |
| `/api/v1/products/sku/{sku}` | GET | Get by SKU directly |

**Features:**
1. **Scanner Screen**
   - Camera preview with framing guide
   - Torch toggle button
   - Manual entry fallback
   - Close/Back button
   - Instruction text

2. **Camera Permissions**
   - Permission request on mount
   - Rationale dialog if denied
   - Settings redirect if permanently denied
   - Permission status indicator

3. **Scan Detection**
   - Support QR codes (QR_CODE)
   - Support barcodes (CODE_128, EAN_13)
   - Vibration on successful scan
   - Sound feedback (optional)
   - Prevent duplicate scans (500ms cooldown)

4. **Scan Resolution**
   - Parse scan data (JSON or plain text)
   - Extract SKU or product ID
   - Call search API
   - Navigate to product details if found
   - Show not-found state if missing

5. **Not Found State**
   - "Product not found" message
   - Display scanned value
   - Actions:
     - Scan again
     - Manual search
     - Create product (if permitted)

6. **Manual Entry**
   - Bottom sheet with input field
   - Enter SKU manually
   - Search button
   - Same resolution logic

**Components to Build:**
- `screens/scan/ScannerScreen.js`
- `components/scanner/CameraView.js`
- `components/scanner/ScanFrame.js`
- `components/scanner/ManualEntrySheet.js`
- `components/scanner/NotFoundState.js`
- `utils/scanParser.js`
- `hooks/useScanner.js`

**Scan Data Parsing:**
```javascript
// QR Code format (JSON)
{
  "productId": "6789abcd1234567890123459",
  "sku": "ELEC-ROUTER-CISCO-0001",
  ...
}

// Barcode format (plain text)
"ELEC-ROUTER-CISCO-0001"

// Parser logic
const parseScanData = (data) => {
  try {
    const parsed = JSON.parse(data);
    return { type: 'qr', sku: parsed.sku || parsed.productId };
  } catch {
    return { type: 'barcode', sku: data };
  }
};
```

**Permission Flow:**
```javascript
// Check permission
const { status } = await Camera.requestCameraPermissionsAsync();

if (status === 'granted') {
  // Open camera
} else if (status === 'denied') {
  // Show rationale
} else {
  // Permanently denied - show settings
}
```

**Success Criteria:**
- ✅ Camera opens quickly (< 1 second)
- ✅ QR codes scan successfully
- ✅ Barcodes scan successfully
- ✅ Vibration/sound feedback works
- ✅ Product resolution navigates correctly
- ✅ Not-found state displays
- ✅ Manual entry works
- ✅ Permission handling complete
- ✅ Torch toggle works

---

### **PHASE 7: Product Create/Edit Forms (Week 8-9)**
**Duration:** 10-14 days  
**Team:** 1 Developer + 1 QA

**Objective:** Multi-step product creation and editing

**API Endpoints Used:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/products` | POST | Create product |
| `/api/v1/products/{id}` | PUT | Update product |
| `/api/v1/files/products/{id}/images` | POST | Upload images |
| `/api/v1/files/products/{id}/images/{imageId}` | DELETE | Delete image |

**Features:**

#### 7.1 Create Product (Multi-step Form)

**Step 1: Classification**
- Category picker (required)
- Sub-category picker (required, filtered)
- Next button

**Step 2: Identity**
- Product name (required, 2-200 chars)
- Brand (required, 2-100 chars)
- Model (required, 2-100 chars)
- Manufacturer (optional)
- Tags (optional, multi-input)
- Next button

**Step 3: Commercial & Inventory**
- Unit price (required, decimal)
- Currency selector (default: INR)
- Current stock (optional, default: 0)
- Min stock level (optional, default: 1)
- Max stock level (optional, default: 1000)
- Reorder point (optional, default: 20)
- Unit of measurement (default: PCS)
- Next button

**Step 4: Details & Specifications**
- Description (optional, max 2000 chars)
- Specifications (key-value pairs, dynamic)
- Weight (optional)
- Dimensions (optional: L x W x H)
- Warranty period (optional, months)
- Next button

**Step 5: Images & Review**
- Upload images (max 5, each max 5MB)
- Image preview with delete
- Review all entered data
- Submit button

**Progress Indicator:**
- Step dots/bar at top
- Back button (except step 1)
- Save draft option (local storage)

#### 7.2 Edit Product (Single Form)

- Pre-fill all fields
- Same validation as create
- Allow partial updates
- Image management (add/delete)
- Save button
- Discard changes confirmation

**Components to Build:**
- `screens/products/CreateProductScreen.js`
- `screens/products/EditProductScreen.js`
- `components/forms/StepIndicator.js`
- `components/forms/ClassificationStep.js`
- `components/forms/IdentityStep.js`
- `components/forms/CommercialStep.js`
- `components/forms/DetailsStep.js`
- `components/forms/ImagesStep.js`
- `components/forms/ReviewStep.js`
- `components/forms/SpecificationInput.js`
- `components/images/ImageUploader.js`
- `store/slices/productFormSlice.js`

**Validation Schemas:**
```javascript
// Step 1
const classificationSchema = yup.object({
  categoryId: yup.string().required('Category is required'),
  subCategoryId: yup.string().required('Sub-category is required'),
});

// Step 2
const identitySchema = yup.object({
  name: yup.string().min(2).max(200).required(),
  brand: yup.string().min(2).max(100).required(),
  model: yup.string().min(2).max(100).required(),
});

// Step 3
const commercialSchema = yup.object({
  unitPrice: yup.number().positive().required(),
  currency: yup.string().length(3).required(),
});
```

**Form State Management:**
- Store form data in Redux
- Validate each step before next
- Allow back navigation without validation
- Clear form data after submit
- Auto-save draft every 30 seconds

**Image Upload Flow:**
1. Pick image from camera/gallery
2. Compress image (max 2MB)
3. Preview locally
4. Upload after form submit
5. Show upload progress
6. Handle upload errors

**Success Criteria:**
- ✅ Multi-step form navigates smoothly
- ✅ All validation rules enforced
- ✅ Form data persists across steps
- ✅ Product creation succeeds
- ✅ Product edit pre-fills correctly
- ✅ Images upload successfully
- ✅ Error handling on all fields
- ✅ Draft save/restore works

---

### **PHASE 8: Error Handling & Feedback (Week 10)**
**Duration:** 3-5 days  
**Team:** 1 Developer + 1 QA

**Objective:** Comprehensive error handling and user feedback

**Features:**

1. **Global Error Boundary**
   - Catch unexpected errors
   - Show fallback UI
   - Restart app option
   - Error reporting (optional)

2. **Network Error Handling**
   - No internet connection state
   - Timeout errors
   - Server unavailable (500)
   - Retry mechanisms

3. **HTTP Error Handling**
   - 400: Show field-level errors
   - 401: Auto-logout and redirect
   - 403: Show permission error
   - 404: Show not-found state
   - 409: Show conflict message
   - 500: Show retry option
   - 503: Service unavailable

4. **Toast Notifications**
   - Success messages (green)
   - Error messages (red)
   - Warning messages (yellow)
   - Info messages (blue)
   - Auto-dismiss (3 seconds)
   - Manual dismiss option

5. **Loading States**
   - Full-screen loading (initial loads)
   - Skeleton screens (lists)
   - Button loading states
   - Inline spinners
   - Progress bars (uploads)

6. **Empty States**
   - No products found
   - No search results
   - No images available
   - Custom illustrations + text

7. **Haptic Feedback**
   - Success actions (light impact)
   - Error actions (notification)
   - Scan success (heavy impact)
   - Button taps (selection)

**Components to Build:**
- `components/errors/ErrorBoundary.js`
- `components/errors/NetworkError.js`
- `components/loading/FullScreenLoader.js`
- `components/loading/Skeleton.js`
- `components/empty/EmptyState.js`
- `components/feedback/Toast.js`
- `utils/errorHandler.js`
- `utils/haptics.js`

**Error Handler Utility:**
```javascript
export const handleApiError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return data.error?.message || 'Invalid request';
    case 401:
      // Trigger logout
      return 'Session expired. Please login again.';
    case 403:
      return 'You don\'t have permission for this action';
    case 404:
      return 'Resource not found';
    case 409:
      return data.error?.message || 'Conflict occurred';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred';
  }
};
```

**Success Criteria:**
- ✅ All API errors handled gracefully
- ✅ Network errors detected and shown
- ✅ Toast notifications work
- ✅ Loading states visible
- ✅ Empty states display correctly
- ✅ Haptic feedback on key actions
- ✅ Error boundary catches crashes

---

### **PHASE 9: Testing & QA (Week 11)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 2 QA

**Objective:** Comprehensive testing across all features

**Testing Types:**

1. **Unit Testing**
   - Utility functions
   - Validation schemas
   - Redux reducers
   - API services

2. **Integration Testing**
   - API integration
   - Form submission flows
   - Navigation flows

3. **E2E Testing (Manual)**
   - Complete user journeys
   - All QA checklist items (from guide)
   - Edge cases

4. **Device Testing**
   - Android 12, 13, 14 (latest 3 versions)
   - Different screen sizes
   - Different manufacturers
   - Physical devices (not just emulator)

5. **Performance Testing**
   - App launch time
   - Camera open time
   - Search response time
   - Image loading time
   - Memory usage
   - Battery consumption

6. **Accessibility Testing**
   - Screen reader support
   - Touch target sizes
   - Color contrast
   - Font scaling

**Test Coverage Goals:**
- Unit tests: 60%+
- Critical paths: 100% manual testing
- All QA checklist items: ✅

**Bug Priority:**
- P0 (Blocker): Fix immediately
- P1 (Critical): Fix before release
- P2 (Major): Fix in next sprint
- P3 (Minor): Backlog

**Success Criteria:**
- ✅ All P0 and P1 bugs fixed
- ✅ Complete QA checklist passed
- ✅ Performance metrics met
- ✅ No crashes in testing
- ✅ Accessibility standards met

---

### **PHASE 10: Optimization & Polish (Week 12)**
**Duration:** 5-7 days  
**Team:** 1 Developer + 1 QA

**Objective:** Performance optimization and final polish

**Optimization Tasks:**

1. **Performance Optimization**
   - Bundle size analysis
   - Image optimization
   - Lazy loading components
   - Memoization (useMemo, useCallback)
   - FlatList optimization
   - Reduce re-renders

2. **Code Quality**
   - Code review
   - Remove console.logs
   - Remove unused imports
   - Fix ESLint warnings
   - Add comments for complex logic

3. **UI Polish**
   - Consistent spacing
   - Animation smoothness
   - Transition timing
   - Color consistency
   - Typography consistency

4. **Offline Experience**
   - Cache API responses
   - Show cached data while loading
   - Offline indicator

5. **Analytics Setup** (Optional)
   - Screen tracking
   - Event tracking
   - Error tracking
   - User flow analysis

**Tools:**
- React Native Debugger
- Flipper
- Chrome DevTools
- Android Studio Profiler

**Success Criteria:**
- ✅ App launch < 2 seconds
- ✅ Camera opens < 1 second
- ✅ No performance warnings
- ✅ Smooth 60 FPS animations
- ✅ Code quality standards met

---

### **PHASE 11: Deployment Preparation (Week 13)**
**Duration:** 3-5 days  
**Team:** 1 Developer + 1 DevOps

**Objective:** Prepare for production deployment

**Tasks:**

1. **Environment Configuration**
   - Production API URLs
   - API keys management
   - Feature flags

2. **Build Configuration**
   - Update app version
   - Generate release keystore
   - Configure ProGuard (code obfuscation)
   - Enable Hermes engine

3. **App Icon & Splash Screen**
   - Design app icon (1024x1024)
   - Generate all sizes
   - Create splash screen
   - Configure adaptive icon

4. **Store Listing Preparation**
   - App title
   - Description
   - Screenshots (6-8 screens)
   - Feature graphic
   - Privacy policy URL
   - Support email

5. **Build APK/AAB**
   - Generate signed release build
   - Test release build thoroughly
   - Verify all features work

**Commands:**
```bash
# Build release APK
cd android
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease
```

**Success Criteria:**
- ✅ Release build successful
- ✅ All features work in release mode
- ✅ Store listing ready
- ✅ No sensitive data in build

---

## 5. API Endpoints Mapping

### Authentication Service (http://localhost:5001/api/v1)

| Feature | Endpoint | Method | Mobile Usage | Priority |
|---------|----------|--------|--------------|----------|
| **Login** | `/auth/login` | POST | Initial authentication | P0 |
| **Refresh Token** | `/auth/refresh` | POST | Automatic token renewal | P0 |
| **Logout** | `/auth/logout` | POST | User logout | P0 |
| **Verify Token** | `/auth/verify` | GET | Session validation on startup | P1 |
| **Get Profile** | `/profile` | GET | Display user info | P1 |
| **Update Profile** | `/profile` | PUT | Edit user info | P1 |
| **Upload Profile Image** | `/profile/upload-image` | POST | Profile picture | P2 |
| **Delete Profile Image** | `/profile/delete-image` | DELETE | Remove picture | P2 |
| **Change Password** | `/users/{id}/change-password` | PATCH | Security | P1 |

### PMS Service (http://localhost:5002/api/v1)

| Feature | Endpoint | Method | Mobile Usage | Priority |
|---------|----------|--------|--------------|----------|
| **List Categories** | `/categories` | GET | Pickers for forms | P0 |
| **List Subcategories** | `/subcategories` | GET | Filtered pickers | P0 |
| **Search Products** | `/products` | GET | Search & list with filters | P0 |
| **Get Product by ID** | `/products/{id}` | GET | Product details | P0 |
| **Get Product by SKU** | `/products/sku/{sku}` | GET | Scanner resolution | P0 |
| **Create Product** | `/products` | POST | Create new product | P1 |
| **Update Product** | `/products/{id}` | PUT | Edit product | P1 |
| **Delete Product** | `/products/{id}` | DELETE | Remove product (rare) | P2 |
| **Upload Images** | `/files/products/{id}/images` | POST | Product images | P1 |
| **List Images** | `/files/products/{id}/images` | GET | Gallery | P1 |
| **Delete Image** | `/files/products/{id}/images/{imageId}` | DELETE | Image management | P2 |
| **Get File** | `/files/{file_id}` | GET | Display images/QR/barcode | P0 |
| **Get QR Code** | `/products/{id}/qr` | GET | Display QR | P1 |
| **Get Barcode** | `/products/{id}/barcode` | GET | Display barcode | P1 |

**Priority Legend:**
- **P0:** Critical - App cannot function without
- **P1:** High - Core features depend on it
- **P2:** Medium - Nice to have, can be post-MVP

---

## 6. Development Timeline Estimates

### Summary Timeline

| Phase | Duration | Team Size | Milestones |
|-------|----------|-----------|------------|
| Phase 0: Foundation | 1 week | 1 Dev + 1 QA | Project setup complete |
| Phase 1: Authentication | 1 week | 1 Dev + 1 QA | Login/logout working |
| Phase 2: Profile | 1 week | 1 Dev + 1 QA | Profile CRUD complete |
| Phase 3: Categories | 0.5 week | 1 Dev + 1 QA | Pickers ready |
| Phase 4: Search & List | 1 week | 1 Dev + 1 QA | Product browsing works |
| Phase 5: Product Details | 1 week | 1 Dev + 1 QA | Details screen complete |
| Phase 6: Scanner | 1.5 weeks | 1 Dev + 1 QA | Scanning functional |
| Phase 7: CRUD Forms | 2 weeks | 1 Dev + 1 QA | Create/Edit complete |
| Phase 8: Error Handling | 0.5 week | 1 Dev + 1 QA | All errors handled |
| Phase 9: Testing & QA | 1 week | 1 Dev + 2 QA | All tests passed |
| Phase 10: Optimization | 1 week | 1 Dev + 1 QA | Performance optimized |
| Phase 11: Deployment | 0.5 week | 1 Dev + 1 DevOps | Ready for release |
| **TOTAL** | **12 weeks** | **2-3 people** | **MVP Complete** |

### Detailed Weekly Breakdown

```
Week 1:  [========] Phase 0: Foundation
Week 2:  [========] Phase 1: Authentication
Week 3:  [========] Phase 2: Profile
Week 4:  [====]     Phase 3: Categories
Week 4:  [    ====] Phase 4: Search (start)
Week 5:  [========] Phase 4: Search (complete)
Week 6:  [========] Phase 5: Product Details
Week 7:  [========] Phase 6: Scanner (Week 1)
Week 8:  [====]     Phase 6: Scanner (complete)
Week 8:  [    ====] Phase 7: CRUD (start)
Week 9:  [========] Phase 7: CRUD (continue)
Week 10: [====]     Phase 7: CRUD (complete)
Week 10: [    ====] Phase 8: Error Handling
Week 11: [========] Phase 9: Testing & QA
Week 12: [========] Phase 10: Optimization
Week 13: [====]     Phase 11: Deployment
```

### Parallel Work Opportunities

**Weeks 1-3:** UI Designer can work on screens for phases 4-7
**Weeks 4-7:** Backend team can optimize API performance
**Weeks 8-11:** Documentation team prepares user guides

---

## 7. Testing Strategy

### 7.1 Unit Testing (Jest)

**Target Coverage:** 60%+

**What to Test:**
- Utility functions (validators, formatters, parsers)
- Redux reducers and actions
- API service functions
- Custom hooks

**Example Test Structure:**
```javascript
// validators/productValidator.test.js
import { validateProductName } from '../productValidator';

describe('Product Validator', () => {
  it('should validate correct product name', () => {
    const result = validateProductName('Valid Product Name');
    expect(result.isValid).toBe(true);
  });
  
  it('should reject names shorter than 2 characters', () => {
    const result = validateProductName('A');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('minimum');
  });
});
```

### 7.2 Integration Testing

**Tools:** Jest + React Native Testing Library

**What to Test:**
- API integration (mock API responses)
- Form submission flows
- Navigation transitions
- State updates

### 7.3 E2E Testing (Manual)

**Critical User Journeys:**

1. **Authentication Flow**
   - Login → Verify token → Navigate to home
   - Login → Logout → Verify session cleared

2. **Scanner Flow**
   - Open scanner → Scan QR → View product
   - Open scanner → Scan barcode → View product
   - Scan unknown code → See not found

3. **Search Flow**
   - Open search → Type query → See results → View product
   - Apply filters → See filtered results

4. **Product CRUD Flow**
   - Create product → Submit → View details
   - Edit product → Save → Verify changes
   - Upload image → Verify display

5. **Profile Flow**
   - View profile → Edit → Save → Verify
   - Change password → Logout → Login with new password

### 7.4 Device Testing Matrix

| Device Category | Android Version | Screen Size | Test Priority |
|----------------|-----------------|-------------|---------------|
| Flagship | 14 | 6.5" | P0 |
| Mid-range | 13 | 6.1" | P0 |
| Budget | 12 | 5.5" | P1 |
| Tablet | 13 | 10" | P2 |

**Recommended Test Devices:**
- Samsung Galaxy S23 (Android 14)
- Google Pixel 7 (Android 13)
- OnePlus Nord (Android 12)

### 7.5 Performance Testing

**Metrics to Track:**

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| App launch time | < 2s | React Native Performance |
| Camera open time | < 1s | Manual timing |
| Search response | < 500ms | Network tab |
| Image load time | < 1s | Fast Image metrics |
| Memory usage | < 200MB | Android Profiler |
| FPS (animations) | 60 FPS | Flipper |

### 7.6 QA Checklist (from Implementation Guide)

Refer to **Section 18** of UI Implementation Guide for complete checklist covering:
- Authentication & Session (7 items)
- Scanning (9 items)
- Product Search & List (8 items)
- Product Details (6 items)
- Product Create/Edit (8 items)
- Profile (5 items)
- Network & Error Handling (7 items)
- Performance (6 items)
- Usability (10 items)

---

## 8. Deployment Strategy

### 8.1 Pre-deployment Checklist

- ✅ All P0 and P1 bugs fixed
- ✅ QA checklist completed
- ✅ Code review completed
- ✅ Performance metrics met
- ✅ Security audit passed
- ✅ Privacy policy in place
- ✅ Terms of service ready
- ✅ Support email configured

### 8.2 Build Configuration

**Production Environment Variables:**
```bash
API_BASE_URL_AUTH=https://api.wlancorp.com/auth/api/v1
API_BASE_URL_PMS=https://pms.wlancorp.com/api/v1
ENV=production
ENABLE_ANALYTICS=true
```

**Android Build Config:**
```gradle
android {
    defaultConfig {
        applicationId "com.wlancorp.warehouse"
        versionCode 1
        versionName "1.0.0"
        minSdkVersion 23
        targetSdkVersion 34
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 8.3 Release Process

**Step 1: Internal Testing**
- Build internal testing APK
- Distribute via Firebase App Distribution
- Gather feedback from 5-10 warehouse staff

**Step 2: Closed Beta**
- Upload AAB to Google Play Console
- Create closed testing track
- Add 20-50 testers
- Monitor crash reports
- Collect feedback

**Step 3: Open Beta (Optional)**
- Expand to open testing track
- Monitor for 1-2 weeks
- Fix critical issues

**Step 4: Production Release**
- Create production release
- Staged rollout:
  - Day 1: 10% of users
  - Day 3: 25% of users
  - Day 5: 50% of users
  - Day 7: 100% of users
- Monitor crash-free rate (target: 99.5%+)

### 8.4 Post-deployment Monitoring

**Key Metrics to Track:**
- Daily Active Users (DAU)
- Crash-free rate
- API error rate
- Average session duration
- Feature usage (scanner, search, CRUD)

**Monitoring Tools:**
- Google Play Console (crashes, ANRs)
- Firebase Analytics (user behavior)
- Sentry/Bugsnag (error tracking)
- API monitoring dashboard

### 8.5 Rollback Plan

**If critical issues found:**
1. Halt staged rollout
2. Investigate issue severity
3. If P0 bug: Roll back to previous version
4. If P1 bug: Hot-fix and release patch
5. Communicate with users

---

## 9. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scanner doesn't work on all devices | High | Medium | Test on 10+ devices, fallback to manual entry |
| API performance issues | High | Low | Implement caching, optimize queries |
| Android version compatibility | Medium | Low | Test on Android 12, 13, 14 |
| Image upload failures | Medium | Medium | Retry mechanism, show clear errors |
| Token refresh failures | High | Low | Robust error handling, auto-logout |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| User adoption resistance | High | Training sessions, user-friendly UI |
| Incomplete requirements | Medium | Weekly stakeholder reviews |
| Timeline slippage | Medium | Buffer time, prioritize MVP features |

---

## 10. Success Criteria

### MVP Launch Criteria

- ✅ All Phase 0-7 complete (core features)
- ✅ Scanner works reliably
- ✅ Product CRUD functional
- ✅ < 1% crash rate
- ✅ Positive feedback from 5+ pilot users
- ✅ All critical bugs fixed

### Post-MVP Success Metrics (3 months)

- Daily Active Users: 80%+ of warehouse staff
- Scanner usage: 500+ scans/day
- Product creation: 50+ products/week
- Crash-free rate: 99%+
- Average session: 5+ minutes
- User satisfaction: 4/5 stars

---

## 11. Future Enhancements (Post-MVP)

### Phase 12: Advanced Features (Future)

1. **Offline Mode**
   - Sync product data for offline viewing
   - Queue actions when offline
   - Auto-sync when online

2. **Push Notifications**
   - Low stock alerts
   - New product assignments
   - System announcements

3. **Barcode Printing**
   - Generate printable labels
   - Bluetooth printer integration

4. **Multi-language Support**
   - Hindi language
   - Regional language support

5. **Biometric Authentication**
   - Fingerprint login
   - Face unlock

6. **Advanced Search**
   - Voice search
   - Image-based search

7. **Batch Operations**
   - Bulk product updates
   - Batch scanning

8. **Analytics Dashboard**
   - Personal productivity stats
   - Warehouse metrics

---

## 12. Appendix

### A. Recommended VSCode Extensions

- ES7 React/Redux Snippets
- Prettier - Code formatter
- ESLint
- React Native Tools
- Auto Rename Tag
- Path Intellisense
- GitLens

### B. Useful Commands Reference

```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Clear cache
npx expo start -c

# Build development client
npx expo prebuild
cd android && ./gradlew assembleDebug

# Check bundle size
npx react-native-bundle-visualizer

# Run tests
npm test

# Generate APK
cd android && ./gradlew assembleRelease
```

### C. Troubleshooting Common Issues

**Issue:** Metro bundler fails to start
**Solution:** Clear cache: `npx expo start -c`

**Issue:** Camera not working on emulator
**Solution:** Test on physical device, emulator doesn't support camera

**Issue:** Build fails with Java version error
**Solution:** Verify Java 21 is installed and set in Android Studio

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Next Review:** End of Phase 3  
**Prepared By:** Development Team Lead  
**Approved By:** [Pending Stakeholder Review]

---

## Questions for Stakeholder Clarification

1. **Auto-logout timer:** Preferred inactivity duration? (15/30/60 minutes)
2. **Product creation permission:** Should warehouse staff create products or only edit?
3. **Image limits:** Maximum images per product? (Guide says 5)
4. **Barcode types:** Support only Code128 or also EAN-13, UPC?
5. **Analytics:** Which analytics platform? (Firebase/Mixpanel/Custom)
6. **Error reporting:** Crash reporting service preference? (Sentry/Bugsnag)
7. **Beta testing:** How many internal testers available?
8. **Staging environment:** Separate staging API available?

---

**END OF DOCUMENT**
