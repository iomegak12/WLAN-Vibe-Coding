# Phase 7: Product Assets Management

**Project:** WLAN Corporation - Warehouse Management Web Application  
**Phase:** 7 - Product Assets Management  
**Date:** January 14, 2026  
**Developer:** Ramkumar  
**Dependencies:** Phase 0, 1, 2, 3, 4, 5, 6 must be completed

---

## Phase Objectives

Implement product asset management capabilities:
- ✅ Product image upload and management
- ✅ Image gallery with preview
- ✅ Image delete functionality
- ✅ QR code display and download
- ✅ Barcode display and download
- ✅ QR/Barcode regeneration
- ✅ Image drag-and-drop reordering
- ✅ Primary image designation
- ✅ Image validation and optimization
- ✅ Asset viewer modal

**Assets Covered:**
1. **Product Images** - Multiple images per product with primary designation
2. **QR Codes** - Backend-generated, frontend displays and downloads
3. **Barcodes** - Backend-generated, frontend displays and downloads

---

## Prerequisites

### Completed Tasks from Previous Phases
- [x] Phase 0-6: Foundation through Product Core Management
- [x] Products CRUD functional
- [x] Product detail page exists
- [x] Navigation includes Products menu

### Backend Verification
Test PMS service asset endpoints:

```bash
# Upload product image
curl -X POST http://localhost:5002/api/v1/products/{productId}/images \
  -F "image=@test-image.jpg"

# Get product with images
curl -X GET http://localhost:5002/api/v1/products/{productId}

# Expected: Product with images array and QR/barcode IDs
```

---

## Architecture Overview

### Module Structure

```
src/features/products/
├── pages/
│   ├── ProductDetailPage.jsx (update)     # Add gallery section
│   └── ProductEditPage.jsx (update)       # Add image management
├── components/
│   ├── assets/
│   │   ├── ImageGallery.jsx               # Image gallery display
│   │   ├── ImageUploader.jsx              # Upload component
│   │   ├── ImageManager.jsx               # Manage images (edit mode)
│   │   ├── ImagePreviewModal.jsx          # Full-screen preview
│   │   ├── QRCodeViewer.jsx               # QR code display
│   │   ├── BarcodeViewer.jsx              # Barcode display
│   │   ├── AssetDownloadButton.jsx        # Download button
│   │   └── AssetRegenerateDialog.jsx      # Regenerate confirmation
│   └── shared/
│       └── DragDropImageList.jsx          # Drag-drop reorder
└── hooks/
    ├── useImageUpload.js                   # Upload image
    ├── useImageDelete.js                   # Delete image
    ├── useImageReorder.js                  # Reorder images
    ├── useQRCodeRegenerate.js              # Regenerate QR
    └── useBarcodeRegenerate.js             # Regenerate barcode
```

---

## Step-by-Step Implementation Guide

### Step 1: Extend PMS Service Layer

**File:** `src/services/pmsService.js` (update)

**Add Asset Functions:**

```javascript
// POST /products/:productId/images
uploadProductImage(productId, imageFile, isPrimary)

// DELETE /products/:productId/images/:imageId
deleteProductImage(productId, imageId)

// PUT /products/:productId/images/reorder
reorderProductImages(productId, imageIds)

// PUT /products/:productId/images/:imageId/primary
setPrimaryImage(productId, imageId)

// POST /products/:productId/qrcode/regenerate
regenerateQRCode(productId)

// POST /products/:productId/barcode/regenerate
regenerateBarcode(productId)

// GET /products/:productId/qrcode/download
downloadQRCode(productId) // Returns blob

// GET /products/:productId/barcode/download
downloadBarcode(productId) // Returns blob
```

**Image Upload Strategy:**
- Use FormData for file upload
- Set Content-Type: multipart/form-data
- Include isPrimary flag
- Handle progress events
- Return uploaded image object

**Download Strategy:**
- Fetch as blob
- Create object URL
- Trigger browser download
- Clean up object URL

---

### Step 2: Update Product Detail Page

**File:** `src/features/products/pages/ProductDetailPage.jsx` (update)

**Add New Sections:**

```
┌───────────────────────────────────────────────────┐
│ Product Details                    [Edit] [Delete] │
├───────────────────────────────────────────────────┤
│ [Image Gallery - Horizontal Scroll]               │
│ [Primary] [Image1] [Image2] [Image3] ...          │
│                                                    │
│ Cisco Catalyst 2960-X Series Switch               │
│ SKU: ELEC-ROUTER-CISCO-0001           [Active]    │
│                                                    │
│ [QR Code & Barcode Section]                       │
│   QR Code              Barcode                    │
│   [QR Image]           [Barcode Image]            │
│   [Download] [Regen]   [Download] [Regen]         │
│                                                    │
│ Classification                                     │
│   Category: Electronics                            │
│   ...                                              │
└───────────────────────────────────────────────────┘
```

**Image Gallery Section:**
- Horizontal scrollable gallery
- Primary image highlighted with badge
- Click image to open full preview
- Max 5 images visible, scroll for more
- If no images: Placeholder icon

**QR Code & Barcode Section:**
- Side-by-side display
- QR code on left, barcode on right
- Display as images (from backend URLs)
- Download button below each
- Regenerate button (admin only)
- Show generation timestamps

**Layout Structure:**
1. Image Gallery (top)
2. Product Name & SKU
3. QR & Barcode (new section)
4. Classification
5. Product Information
6. Pricing & Warranty
7. Specifications
8. Metadata

---

### Step 3: Build Image Gallery Component

**File:** `src/features/products/components/assets/ImageGallery.jsx`

**Purpose:** Display product images in read-only gallery

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Product Images                                   │
├─────────────────────────────────────────────────┤
│ [PRIMARY]                                        │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │        │ │        │ │        │ │        │ → │
│ │  IMG1  │ │  IMG2  │ │  IMG3  │ │  IMG4  │   │
│ │        │ │        │ │        │ │        │   │
│ └────────┘ └────────┘ └────────┘ └────────┘   │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Image Display:**
   - Thumbnail size: 150x150px
   - Maintain aspect ratio
   - Object-fit: cover
   - Border radius: 8px

2. **Primary Image:**
   - Badge: "PRIMARY" in green
   - Slightly larger size or border highlight
   - Always displayed first

3. **Horizontal Scroll:**
   - Overflow-x: auto
   - Smooth scrolling
   - Hide scrollbar (optional)
   - Scroll buttons (left/right arrows)

4. **Click to Preview:**
   - Click image opens full-screen modal
   - Modal shows full resolution
   - Navigation between images in modal
   - Close button and ESC key

5. **Empty State:**
   - Icon: ImageNotSupportedIcon
   - Message: "No images uploaded"
   - Subtle gray placeholder

**Props:**
- `images` - array of image objects
- `primaryImageId` - ID of primary image
- `productName` - for modal title
- `onImageClick` - callback (optional)

---

### Step 4: Build Image Preview Modal

**File:** `src/features/products/components/assets/ImagePreviewModal.jsx`

**Purpose:** Full-screen image preview with navigation

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Product: Cisco Catalyst 2960-X           [X]    │
├─────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│                  [< Prev]                        │
│                                                  │
│              [Full-size Image]                   │
│                                                  │
│                  [Next >]                        │
│                                                  │
│                                                  │
│           Image 1 of 4  |  1.2 MB  |  1920x1080 │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Modal:**
   - Full-screen overlay
   - Dark background (90% opacity)
   - Close button (X) top-right
   - ESC key to close
   - Click outside to close

2. **Navigation:**
   - Previous/Next buttons (if multiple images)
   - Keyboard arrows (left/right)
   - Thumbnail strip at bottom (optional)

3. **Image Display:**
   - Max width/height: 90% of viewport
   - Maintain aspect ratio
   - Centered
   - Loading state while image loads

4. **Metadata Display:**
   - Image number (1 of 4)
   - File size
   - Dimensions
   - Upload date (optional)

**Props:**
- `open` - boolean
- `images` - array
- `currentIndex` - starting index
- `onClose` - callback
- `productName` - title

---

### Step 5: Update Product Edit Page - Add Image Manager

**File:** `src/features/products/pages/ProductEditPage.jsx` (update)

**Add Image Management Section:**

```
┌───────────────────────────────────────────────────┐
│ Edit Product                          [Cancel]    │
├───────────────────────────────────────────────────┤
│ SKU: ELEC-ROUTER-CISCO-0001 (read-only)          │
│                                                    │
│ [Product Images Section]                          │
│   [ImageManager Component]                        │
│                                                    │
│ [Classification Section]                          │
│ [Identity Section]                                │
│ ...                                                │
└───────────────────────────────────────────────────┘
```

**Place Image Manager:**
- After SKU display
- Before Classification section
- Collapsible section (optional)
- Clear visual separation

**Manager Features:**
- Upload new images
- Delete existing images
- Reorder images (drag-drop)
- Set primary image
- Image count indicator (current/max)

---

### Step 6: Build Image Manager Component

**File:** `src/features/products/components/assets/ImageManager.jsx`

**Purpose:** Manage product images in edit mode

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Product Images (3/10)                            │
├─────────────────────────────────────────────────┤
│ [Upload New Image] (max 2MB, JPG/PNG)           │
│                                                   │
│ Drag to reorder images:                          │
│                                                   │
│ [PRIMARY]                                         │
│ ┌────────┐   ID: 123                             │
│ │        │   1.2 MB | 1920x1080                  │
│ │  IMG1  │   [Set as Primary] [Delete]           │
│ │        │                                        │
│ └────────┘                                        │
│                                                   │
│ ┌────────┐   ID: 124                             │
│ │        │   0.8 MB | 1280x720                   │
│ │  IMG2  │   [Set as Primary] [Delete]           │
│ │        │                                        │
│ └────────┘                                        │
│                                                   │
│ ┌────────┐   ID: 125                             │
│ │        │   1.5 MB | 1600x900                   │
│ │  IMG3  │   [Set as Primary] [Delete]           │
│ │        │                                        │
│ └────────┘                                        │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Image Counter:**
   - Show: "Product Images (3/10)"
   - Current count / max allowed
   - Disable upload if max reached

2. **Upload Section:**
   - Upload button or drag-drop zone
   - Accepted formats: JPG, JPEG, PNG, WebP
   - Max file size: 2MB
   - Single file upload at a time
   - Progress indicator during upload
   - Auto-refresh list after upload

3. **Image List:**
   - Vertical list of uploaded images
   - Draggable items (drag handle icon)
   - Each item shows:
     - Thumbnail (100x100px)
     - File size and dimensions
     - "Set as Primary" button (if not primary)
     - "Delete" button
   - Primary image marked with badge

4. **Drag-Drop Reorder:**
   - Use drag handle icon
   - Show drop target indicators
   - Smooth reordering animation
   - Save order on drop
   - API call to reorder

5. **Set as Primary:**
   - Button visible only for non-primary images
   - API call to update primary
   - Refresh display
   - Success feedback

6. **Delete Image:**
   - Confirmation dialog
   - Show image preview in dialog
   - Warn if deleting primary (suggest setting another as primary first)
   - API call to delete
   - Refresh list
   - Success feedback

**Validation:**
- Cannot delete all images if policy requires at least one
- Cannot delete primary without setting another first
- Max 10 images per product (configurable)
- File size validation before upload
- Image dimension validation (optional minimum)

**Props:**
- `productId` - product ID
- `images` - current images array
- `primaryImageId` - current primary
- `maxImages` - max allowed (default: 10)
- `maxFileSize` - max MB (default: 2)
- `onUpdate` - callback after changes

---

### Step 7: Build Image Uploader Component

**File:** `src/features/products/components/assets/ImageUploader.jsx`

**Purpose:** Handle image file upload

**Layout - Drag-Drop Zone:**

```
┌─────────────────────────────────────────────────┐
│                                                  │
│           [Upload Icon]                          │
│                                                  │
│     Drag & drop image here or click to browse   │
│                                                  │
│     Accepted: JPG, PNG (max 2MB)                │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Layout - Uploading State:**

```
┌─────────────────────────────────────────────────┐
│           [Progress Bar: 45%]                    │
│           Uploading: image.jpg                   │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Drag-Drop Zone:**
   - Dashed border
   - Hover effect (highlight)
   - Click to open file browser
   - Accept attribute: image/jpeg, image/png, image/webp

2. **File Validation:**
   - Check file type (MIME type)
   - Check file size (<= 2MB)
   - Show error if validation fails
   - Prevent upload if invalid

3. **Upload Process:**
   - Show progress bar
   - Show file name
   - Cancel button (optional)
   - Success feedback
   - Error handling

4. **Multiple Upload:**
   - Option to upload multiple (future)
   - For Phase 7, single upload at a time
   - Queue system (future)

**Props:**
- `productId` - product ID
- `onUploadSuccess` - callback with uploaded image
- `onUploadError` - callback with error
- `maxFileSize` - max MB
- `acceptedFormats` - array of MIME types

**Implementation Notes:**
- Use input type="file" with accept attribute
- Read file as FormData
- Use Axios for upload with progress tracking
- Handle multipart/form-data content type

---

### Step 8: Build QR Code Viewer Component

**File:** `src/features/products/components/assets/QRCodeViewer.jsx`

**Purpose:** Display QR code with download and regenerate

**Layout:**

```
┌─────────────────────────────────────┐
│ QR Code                              │
├─────────────────────────────────────┤
│                                      │
│          ┌──────────┐                │
│          │  ██  ██  │                │
│          │  ████    │                │
│          │    ████  │                │
│          │  ██  ██  │                │
│          └──────────┘                │
│                                      │
│  Generated: Jan 14, 2026 10:30 AM   │
│                                      │
│  [Download QR Code] [Regenerate]    │
└─────────────────────────────────────┘
```

**Features:**

1. **QR Code Display:**
   - Display as image
   - Source: Backend-provided URL
   - Size: 200x200px (configurable)
   - Border or padding
   - Alt text: "QR Code for {productName}"

2. **Generation Timestamp:**
   - Show when QR was generated
   - Format: "Jan 14, 2026 10:30 AM"
   - Small gray text below QR

3. **Download Button:**
   - Primary button
   - Icon: DownloadIcon
   - Text: "Download QR Code"
   - Downloads PNG file
   - Filename: `{SKU}-qrcode.png`

4. **Regenerate Button:**
   - Secondary button
   - Icon: RefreshIcon
   - Text: "Regenerate"
   - Permission: products.update or admin
   - Opens confirmation dialog
   - Explain: "This will generate a new QR code. Old code will be invalid."

5. **Empty State:**
   - If no QR code exists
   - Message: "QR Code not available"
   - "Generate QR Code" button

**Download Logic:**
1. Call API endpoint: GET /products/:id/qrcode/download
2. Receive blob response
3. Create object URL
4. Trigger download via anchor element
5. Clean up object URL

**Regenerate Logic:**
1. Show confirmation dialog
2. On confirm: Call API endpoint: POST /products/:id/qrcode/regenerate
3. Success: Refresh QR code display
4. Show success message
5. Update timestamp

**Props:**
- `productId` - product ID
- `qrCodeId` - QR code ID
- `qrCodeUrl` - image URL
- `generatedAt` - timestamp
- `productName` - for alt text
- `sku` - for filename
- `canRegenerate` - permission boolean

---

### Step 9: Build Barcode Viewer Component

**File:** `src/features/products/components/assets/BarcodeViewer.jsx`

**Purpose:** Display barcode with download and regenerate

**Layout:**

```
┌─────────────────────────────────────┐
│ Barcode                              │
├─────────────────────────────────────┤
│                                      │
│    ║ ║║ ║║║ ║ ║║ ║║║ ║ ║║ ║        │
│    ║ ║║ ║║║ ║ ║║ ║║║ ║ ║║ ║        │
│    ║ ║║ ║║║ ║ ║║ ║║║ ║ ║║ ║        │
│         123456789012                 │
│                                      │
│  Generated: Jan 14, 2026 10:30 AM   │
│                                      │
│  [Download Barcode] [Regenerate]    │
└─────────────────────────────────────┘
```

**Features:**

**Similar to QR Code Viewer:**
- Display barcode image
- Size: 300x150px (wider than QR)
- Generation timestamp
- Download button
- Regenerate button
- Permission-based actions

**Differences:**
- Wider aspect ratio for barcode
- Different filename: `{SKU}-barcode.png`
- Different API endpoints

**Props:**
- `productId` - product ID
- `barcodeId` - barcode ID
- `barcodeUrl` - image URL
- `generatedAt` - timestamp
- `productName` - for alt text
- `sku` - for filename
- `canRegenerate` - permission boolean

---

### Step 10: Build Asset Regenerate Dialog

**File:** `src/features/products/components/assets/AssetRegenerateDialog.jsx`

**Purpose:** Confirm QR/Barcode regeneration

**Dialog Content:**

```
┌─────────────────────────────────────────┐
│ Regenerate QR Code?                 [X] │
├─────────────────────────────────────────┤
│ Are you sure you want to regenerate     │
│ the QR code for this product?           │
│                                          │
│ Product: Cisco Catalyst 2960-X Series   │
│ SKU: ELEC-ROUTER-CISCO-0001              │
│                                          │
│ ⚠️ Important:                            │
│ • The current QR code will be invalid   │
│ • Any printed materials will need       │
│   updating                               │
│ • This action cannot be undone          │
│                                          │
├─────────────────────────────────────────┤
│                   [Cancel]  [Regenerate] │
└─────────────────────────────────────────┘
```

**Features:**
- Clear warning about consequences
- Show product details
- Destructive action styling for confirm button
- Loading state during regeneration
- Success/error feedback

**Props:**
- `open` - boolean
- `assetType` - "QR Code" or "Barcode"
- `productName` - product name
- `sku` - product SKU
- `onClose` - callback
- `onConfirm` - callback

---

### Step 11: Build Drag-Drop Image List

**File:** `src/features/products/components/shared/DragDropImageList.jsx`

**Purpose:** Reorderable image list

**Use Library:** `@hello-pangea/dnd` (formerly react-beautiful-dnd)

**Installation:**
```bash
npm install @hello-pangea/dnd
```

**Features:**

1. **Drag Handle:**
   - Visual indicator (grip icon)
   - Only handle is draggable
   - Rest of item clickable but not draggable

2. **Drop Zones:**
   - Visual feedback during drag
   - Show drop target line
   - Smooth animation

3. **Reorder Logic:**
   - Update local state immediately
   - Call API to persist order
   - Rollback if API fails
   - Optimistic UI update

4. **Accessibility:**
   - Keyboard navigation
   - Screen reader announcements
   - Focus management

**Props:**
- `images` - array of image objects
- `onReorder` - callback with new order
- `renderItem` - render function for each item
- `primaryImageId` - highlight primary

**Implementation:**
```javascript
// Pseudo structure
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="images">
    {images.map((image, index) => (
      <Draggable key={image.id} draggableId={image.id} index={index}>
        {renderItem(image)}
      </Draggable>
    ))}
  </Droppable>
</DragDropContext>
```

---

### Step 12: Create Custom Hooks

#### useImageUpload Hook

**File:** `src/features/products/hooks/useImageUpload.js`

**Purpose:** Handle image upload with progress

**Returns:**
```javascript
{
  uploadImage,           // Function(productId, file, isPrimary)
  uploading,             // Boolean
  progress,              // Number (0-100)
  error,                 // Error message
}
```

**Implementation:**
- Create FormData with file
- Include isPrimary flag if provided
- Track upload progress
- Return uploaded image data
- Handle errors

---

#### useImageDelete Hook

**File:** `src/features/products/hooks/useImageDelete.js`

**Returns:**
```javascript
{
  deleteImage,           // Function(productId, imageId)
  deleting,              // Boolean
  error,                 // Error message
}
```

---

#### useImageReorder Hook

**File:** `src/features/products/hooks/useImageReorder.js`

**Returns:**
```javascript
{
  reorderImages,         // Function(productId, imageIds)
  reordering,            // Boolean
  error,                 // Error message
}
```

**Implementation:**
- Accept array of image IDs in new order
- Call API to update order
- Backend determines position based on array index

---

#### useQRCodeRegenerate Hook

**File:** `src/features/products/hooks/useQRCodeRegenerate.js`

**Returns:**
```javascript
{
  regenerateQR,          // Function(productId)
  regenerating,          // Boolean
  error,                 // Error message
}
```

---

#### useBarcodeRegenerate Hook

**File:** `src/features/products/hooks/useBarcodeRegenerate.js`

**Returns:**
```javascript
{
  regenerateBarcode,     // Function(productId)
  regenerating,          // Boolean
  error,                 // Error message
}
```

---

## API Integration Specifications

### POST /products/:productId/images

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with "image" field

```javascript
const formData = new FormData();
formData.append('image', fileObject);
formData.append('isPrimary', isPrimary ? 'true' : 'false');
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "img123456",
    "productId": "prod789",
    "url": "https://storage.example.com/products/prod789/img123456.jpg",
    "isPrimary": false,
    "fileSize": 1248576,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "uploadedAt": "2026-01-14T12:00:00Z"
  },
  "message": "Image uploaded successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "File size exceeds maximum allowed (2MB)",
  "errors": {
    "image": "File too large"
  }
}
```

---

### DELETE /products/:productId/images/:imageId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete primary image. Set another image as primary first."
}
```

---

### PUT /products/:productId/images/reorder

**Request Body:**
```json
{
  "imageIds": ["img123", "img456", "img789"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Images reordered successfully"
}
```

---

### PUT /products/:productId/images/:imageId/primary

**Request Body:**
```json
{
  "isPrimary": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "img456",
    "isPrimary": true
  },
  "message": "Primary image updated successfully"
}
```

---

### POST /products/:productId/qrcode/regenerate

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCodeId": "qr-new-789",
    "qrCodeUrl": "https://storage.example.com/qrcodes/qr-new-789.png",
    "generatedAt": "2026-01-14T12:30:00Z"
  },
  "message": "QR code regenerated successfully"
}
```

---

### POST /products/:productId/barcode/regenerate

**Response (200):**
```json
{
  "success": true,
  "data": {
    "barcodeId": "bc-new-456",
    "barcodeUrl": "https://storage.example.com/barcodes/bc-new-456.png",
    "generatedAt": "2026-01-14T12:30:00Z"
  },
  "message": "Barcode regenerated successfully"
}
```

---

### GET /products/:productId/qrcode/download

**Response:**
- Content-Type: image/png
- Content-Disposition: attachment; filename="{SKU}-qrcode.png"
- Body: Binary image data

**Frontend Handling:**
```javascript
const response = await axios.get(url, { responseType: 'blob' });
const blob = response.data;
const downloadUrl = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = downloadUrl;
link.download = `${sku}-qrcode.png`;
link.click();
window.URL.revokeObjectURL(downloadUrl);
```

---

### GET /products/:productId/barcode/download

**Same as QR code download**, different endpoint and filename.

---

## Validation Rules

### Image Upload Validation

**File Type:**
- Allowed: JPG, JPEG, PNG, WebP
- Reject: GIF, BMP, SVG, TIFF, other formats
- Validation: Check MIME type

**File Size:**
- Maximum: 2MB (2,097,152 bytes)
- Validation: Check file.size before upload
- Error message: "File size exceeds 2MB limit"

**Image Dimensions (Optional):**
- Minimum: 400x400px (recommended)
- Maximum: 4000x4000px (recommended)
- Validation: Read image dimensions before upload
- Warning: "Image is very small/large"

**File Count:**
- Maximum: 10 images per product
- Validation: Check current count before allowing upload
- Error: "Maximum 10 images allowed per product"

### Image Delete Validation

**Primary Image:**
- Cannot delete if it's the only image and policy requires one
- Cannot delete primary without setting another first
- Validation: Check isPrimary flag
- Error: "Set another image as primary before deleting this one"

**Referenced Images:**
- Check if image used elsewhere (future validation)
- Warn user before deletion
- Soft delete option (future)

### Image Reorder Validation

**Order Array:**
- Must include all image IDs
- No duplicates
- No missing IDs
- Validation: Compare with current image list

---

## User Experience Requirements

### Loading States

**Image Upload:**
- Show progress bar (0-100%)
- Show file name being uploaded
- Disable upload button during upload
- Show success animation on completion

**Image Gallery:**
- Skeleton placeholders while loading
- Smooth fade-in when images load
- Lazy load images (intersection observer)

**QR/Barcode Display:**
- Loading skeleton while fetching
- Smooth transition when loaded

**Image Delete:**
- Show loading spinner on delete button
- Disable other actions during delete
- Remove item with animation on success

**Regenerate:**
- Show loading overlay on modal
- Disable regenerate button during process
- Update display smoothly after regeneration

### Success Feedback

**Image Uploaded:**
- Success snackbar: "Image uploaded successfully"
- Auto-scroll to new image
- Highlight new image briefly

**Image Deleted:**
- Success snackbar: "Image deleted successfully"
- Smooth removal animation
- Update counter

**Primary Image Set:**
- Success snackbar: "Primary image updated"
- Badge moves to new primary
- Smooth transition

**Images Reordered:**
- Success snackbar: "Images reordered"
- No need for explicit message (visual feedback sufficient)

**QR/Barcode Regenerated:**
- Success snackbar: "QR code regenerated successfully"
- Refresh display
- Show updated timestamp

**Download Complete:**
- Success snackbar: "Downloaded successfully"
- Browser download notification

### Error Feedback

**Upload Errors:**
- File too large: "Image exceeds 2MB limit. Please choose a smaller file."
- Invalid format: "Invalid file format. Please upload JPG, PNG, or WebP."
- Max count reached: "Maximum 10 images allowed. Delete an image to upload new one."
- Network error: "Upload failed. Please check your connection and try again."

**Delete Errors:**
- Primary image: "Cannot delete primary image. Set another image as primary first."
- Last image: "At least one image is required for this product."
- Network error: "Delete failed. Please try again."

**Reorder Errors:**
- Network error: "Failed to save new order. Changes reverted."

**Regenerate Errors:**
- Permission denied: "You don't have permission to regenerate QR codes."
- Network error: "Regeneration failed. Please try again."

**Download Errors:**
- Not available: "QR code not available for download."
- Network error: "Download failed. Please try again."

### Empty States

**No Images:**
- Icon: ImageNotSupportedIcon
- Message: "No images uploaded yet"
- Suggestion: "Upload product images to showcase this item"
- Action: "Upload Image" button (if in edit mode)

**No QR Code:**
- Icon: QrCode2Icon
- Message: "QR code not generated"
- Suggestion: "QR code will be auto-generated by the system"
- No action required (backend handles generation)

**No Barcode:**
- Icon: BarcodeIcon (custom)
- Message: "Barcode not generated"
- Suggestion: "Barcode will be auto-generated by the system"

---

## Image Optimization Strategy

### Frontend Optimization

**Before Upload:**
1. Client-side resize (optional):
   - Max width: 2000px
   - Max height: 2000px
   - Maintain aspect ratio
   - Use canvas API

2. Quality reduction (optional):
   - JPEG quality: 85%
   - Balance size vs quality

**Display Optimization:**
1. Thumbnails:
   - Request smaller versions from backend (if available)
   - Use srcset for responsive images
   - Lazy load images

2. Full preview:
   - Load full resolution on demand
   - Progressive loading

### Backend Expectations

**Backend Should:**
- Generate multiple image sizes (thumbnail, medium, large)
- Compress images on server
- Store optimized versions
- Serve via CDN (future)
- Return URLs for different sizes

**Response Format:**
```json
{
  "id": "img123",
  "urls": {
    "thumbnail": "https://.../thumb.jpg",
    "medium": "https://.../medium.jpg",
    "large": "https://.../large.jpg",
    "original": "https://.../original.jpg"
  }
}
```

**Frontend Usage:**
- Gallery: Use thumbnail
- Preview modal: Use large or original
- Detail page: Use medium

---

## Drag-Drop Implementation Details

### Library Installation

```bash
npm install @hello-pangea/dnd
```

### Basic Structure

**DragDropContext:**
- Wrap entire draggable area
- Provide onDragEnd handler

**Droppable:**
- Define drop zone
- Contains draggable items
- Provides droppableProps

**Draggable:**
- Individual draggable item
- Provides dragHandleProps
- Provides draggableProps

### Reorder Logic

```javascript
const handleDragEnd = (result) => {
  if (!result.destination) return;
  
  const items = Array.from(images);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);
  
  // Update local state optimistically
  setImages(items);
  
  // Save to backend
  const imageIds = items.map(img => img.id);
  reorderImages(productId, imageIds);
};
```

### Visual Feedback

**During Drag:**
- Dragged item: Slightly elevated (box-shadow)
- Drop target: Show blue line or highlight
- Other items: Shift smoothly

**After Drop:**
- Smooth animation to final position
- Brief highlight of moved item
- Success feedback

---

## Permission-Based UI Rendering

| Element              | Required Permission | Behavior if Missing     |
|----------------------|---------------------|-------------------------|
| View images          | products.read       | Show images             |
| Upload image         | products.update     | Hide upload button      |
| Delete image         | products.update     | Hide delete buttons     |
| Reorder images       | products.update     | Disable drag-drop       |
| Set primary          | products.update     | Hide set primary button |
| Download QR/Barcode  | products.read       | Show download           |
| Regenerate QR        | products.update     | Hide regenerate button  |
| Regenerate Barcode   | products.update     | Hide regenerate button  |

---

## Testing Checklist

### Image Upload Tests

- [ ] Can upload JPG image
- [ ] Can upload PNG image
- [ ] Can upload WebP image
- [ ] Cannot upload GIF (rejected)
- [ ] Cannot upload >2MB file (rejected)
- [ ] Upload shows progress bar
- [ ] Success feedback shows after upload
- [ ] Image appears in gallery
- [ ] Counter updates after upload
- [ ] Cannot upload when max limit reached
- [ ] Upload button disabled during upload

### Image Gallery Tests

- [ ] Gallery displays all images
- [ ] Primary image shown first with badge
- [ ] Gallery scrolls horizontally
- [ ] Click image opens preview modal
- [ ] Preview modal shows full image
- [ ] Can navigate between images in modal
- [ ] ESC key closes modal
- [ ] Click outside closes modal
- [ ] Empty state shows when no images
- [ ] Loading state shows while fetching

### Image Management Tests

- [ ] Can reorder images via drag-drop
- [ ] Order persists after save
- [ ] Can set image as primary
- [ ] Primary badge moves to new image
- [ ] Can delete non-primary image
- [ ] Cannot delete primary without setting another
- [ ] Delete confirmation shows
- [ ] Delete succeeds and removes image
- [ ] Counter updates after delete
- [ ] All actions show loading states

### QR Code Tests

- [ ] QR code displays if available
- [ ] QR code downloads as PNG
- [ ] Download filename includes SKU
- [ ] Regenerate shows confirmation dialog
- [ ] Regenerate succeeds and updates display
- [ ] Generation timestamp updates
- [ ] Empty state shows if no QR code
- [ ] Loading state shows during regeneration
- [ ] Error feedback on failure

### Barcode Tests

- [ ] Barcode displays if available
- [ ] Barcode downloads as PNG
- [ ] Download filename includes SKU
- [ ] Regenerate shows confirmation dialog
- [ ] Regenerate succeeds and updates display
- [ ] Generation timestamp updates
- [ ] Empty state shows if no barcode
- [ ] Loading state shows during regeneration
- [ ] Error feedback on failure

### Permission Tests

- [ ] User without products.update cannot upload
- [ ] User without products.update cannot delete
- [ ] User without products.update cannot reorder
- [ ] User without products.update cannot regenerate
- [ ] User with products.read can view and download
- [ ] Super Admin can access all features

### Integration Tests

- [ ] Uploaded images appear in detail page
- [ ] Primary image shows first in gallery
- [ ] Images persist after page refresh
- [ ] QR/Barcode persist after regeneration
- [ ] Download works in different browsers
- [ ] Mobile responsive design works

---

## Common Issues and Solutions

### Issue: Image upload fails silently

**Cause:** File size too large or wrong format

**Solution:** 
- Validate file before upload
- Show clear error message
- Check browser console for errors

### Issue: Images not displaying

**Cause:** CORS issues or invalid URLs

**Solution:**
- Check backend CORS configuration
- Verify image URLs are accessible
- Check network tab for failed requests

### Issue: Drag-drop not working

**Cause:** Library not installed or incorrect structure

**Solution:**
- Verify @hello-pangea/dnd installed
- Check DragDropContext wrapper
- Ensure unique IDs for draggables

### Issue: Download not working

**Cause:** Blob handling or browser restrictions

**Solution:**
- Check responseType: 'blob'
- Verify Content-Disposition header
- Test in different browsers
- Check pop-up blocker settings

### Issue: Primary image not updating

**Cause:** State not refreshing

**Solution:**
- Refetch product after update
- Update local state optimistically
- Check API response

### Issue: QR/Barcode regeneration slow

**Cause:** Backend generation time

**Solution:**
- Show clear loading state
- Consider websocket for real-time updates (future)
- Add timeout handling

---

## Advanced Features (Optional Enhancements)

### Image Cropping

Allow users to crop images before upload:
- Use react-image-crop library
- Crop modal after file selection
- Preview before upload

### Image Compression

Client-side compression before upload:
- Use browser-image-compression library
- Reduce file size automatically
- Maintain quality

### Bulk Image Upload

Upload multiple images at once:
- Multiple file selection
- Queue system
- Batch upload with progress

### Image Annotations

Add text or markers on images:
- Canvas-based editor
- Highlight product features
- Save annotated version

### Image Zoom

Zoom in on images in preview:
- Use react-image-magnifiers
- Mouse wheel zoom
- Pinch zoom on mobile

### QR Code Customization

Customize QR code appearance:
- Color selection
- Logo overlay
- Error correction level

### Print QR/Barcode

Print directly from browser:
- Print-specific styling
- Label templates
- Batch printing

---

## Performance Considerations

- Lazy load images (intersection observer)
- Compress images before upload (client-side optional)
- Request thumbnails for gallery, full size for preview
- Cache images in browser
- Debounce reorder API calls (save after drag ends, not during)
- Use object URLs for local preview (before upload)
- Clean up object URLs after use (memory management)
- Virtual scrolling for large image galleries (future)
- Progressive image loading (blur-up technique)

---

## Accessibility Requirements

- [ ] All images have alt text
- [ ] Upload button keyboard accessible
- [ ] Drag-drop has keyboard alternative
- [ ] Delete buttons have aria-labels
- [ ] Modal has focus trap
- [ ] Modal close on ESC key
- [ ] Screen reader announcements for state changes
- [ ] Image preview modal accessible
- [ ] Download buttons have descriptive text
- [ ] Error messages announced to screen readers

---

## Mobile Responsiveness

### Image Gallery
- Horizontal scroll touch-friendly
- Larger tap targets for images
- Swipe to navigate in preview modal
- Pinch to zoom in preview

### Image Upload
- Mobile camera access
- Take photo directly
- Touch-friendly file selection

### Image Management
- Simplified layout on small screens
- Touch-friendly drag handles
- Larger action buttons
- Responsive grid/list toggle

### QR/Barcode
- Stack vertically on mobile
- Full-width display
- Large download buttons

---

## File Structure After Phase 7

```
src/
├── features/
│   └── products/
│       ├── pages/
│       │   ├── ProductsListPage.jsx
│       │   ├── ProductCreatePage.jsx
│       │   ├── ProductEditPage.jsx (updated)
│       │   └── ProductDetailPage.jsx (updated)
│       ├── components/
│       │   ├── assets/
│       │   │   ├── ImageGallery.jsx
│       │   │   ├── ImageUploader.jsx
│       │   │   ├── ImageManager.jsx
│       │   │   ├── ImagePreviewModal.jsx
│       │   │   ├── QRCodeViewer.jsx
│       │   │   ├── BarcodeViewer.jsx
│       │   │   ├── AssetDownloadButton.jsx
│       │   │   └── AssetRegenerateDialog.jsx
│       │   ├── shared/
│       │   │   ├── CategorySelector.jsx
│       │   │   ├── SpecificationEditor.jsx
│       │   │   ├── PriceInput.jsx
│       │   │   └── DragDropImageList.jsx
│       │   └── ...
│       └── hooks/
│           ├── useImageUpload.js
│           ├── useImageDelete.js
│           ├── useImageReorder.js
│           ├── useQRCodeRegenerate.js
│           ├── useBarcodeRegenerate.js
│           └── ...
├── services/
│   └── pmsService.js (updated)
└── utils/
    ├── imageValidation.js (new)
    └── downloadHelper.js (new)
```

---

## Additional Utilities

### Image Validation Utility

**File:** `src/utils/imageValidation.js`

**Functions:**
- `validateFileType(file)` - Check MIME type
- `validateFileSize(file, maxMB)` - Check file size
- `readImageDimensions(file)` - Get width/height
- `validateImageDimensions(file, minWidth, minHeight)` - Validate dimensions

### Download Helper Utility

**File:** `src/utils/downloadHelper.js`

**Functions:**
- `downloadBlob(blob, filename)` - Trigger browser download
- `downloadFromUrl(url, filename)` - Download from URL as blob
- `formatFileSize(bytes)` - Format bytes to readable string (1.2 MB)

---

## Success Criteria

Phase 7 is complete when:

- [ ] Can upload product images
- [ ] Image gallery displays on detail page
- [ ] Can manage images in edit mode
- [ ] Can delete images
- [ ] Can reorder images via drag-drop
- [ ] Can set primary image
- [ ] QR code displays and downloads
- [ ] Barcode displays and downloads
- [ ] Can regenerate QR code
- [ ] Can regenerate barcode
- [ ] Full-screen image preview works
- [ ] All validations work (file type, size, count)
- [ ] Permission-based access works
- [ ] Loading and error states handled
- [ ] Success feedback provided
- [ ] Mobile responsive
- [ ] Accessible with keyboard and screen readers
- [ ] No console errors

---

## Next Steps After Phase 7

Once asset management is complete:

✅ **Phase 8: Dashboard & Reporting**
- KPI widgets
- Charts and graphs
- Recent activities
- Report generation

---

## Estimated Time

**Total:** 14-18 hours

**Breakdown:**
- Image gallery component: 2 hours
- Image uploader component: 2 hours
- Image manager with drag-drop: 4 hours
- QR/Barcode viewers: 2 hours
- Download functionality: 1 hour
- Regenerate functionality: 1 hour
- Image preview modal: 2 hours
- Integration with detail/edit pages: 2 hours
- Testing and bug fixes: 3 hours
- Polish and UX refinements: 1 hour

---

**End of Phase 7**

**Status:** Ready for implementation  
**Next Phase:** Phase 8 - Dashboard & Reporting
