# Testing Guide - Unsplash Images & QR/Barcode Features

## Prerequisites

1. **Start the Server**
   ```bash
   # In PowerShell
   cd "d:\000-Interim(NL)\Vibe-Coding\Back-End\PMS"
   & "D:/000-Interim(NL)/Vibe-Coding/Back-End/PMS/env/Scripts/python.exe" -m uvicorn app.main:app --reload --port 5002
   ```

2. **Verify Server is Running**
   - Open browser: http://localhost:5002/docs
   - Or test health: http://localhost:5002/api/v1/health

## Test 1: Unsplash Service (Standalone)

```bash
# Run the Unsplash test
python test_new_features.py
```

**Expected Output:**
```
✓ Fetched 3 random images
✓ Found 3 images for 'router'
✓ Retrieved 4+ product images
```

## Test 2: Create Product with Auto-Generated Images

### Using Swagger UI (Recommended)

1. Open http://localhost:5002/docs
2. Click **POST /api/v1/products**
3. Click **Try it out**
4. Use this payload:

```json
{
  "name": "iPhone 15 Pro Max",
  "categoryId": "YOUR_CATEGORY_ID",
  "subCategoryId": "YOUR_SUBCATEGORY_ID",
  "brand": "Apple",
  "description": "Latest flagship smartphone",
  "specifications": {
    "screen": "6.7 inch",
    "storage": "256GB",
    "color": "Titanium Blue"
  },
  "unitPrice": 134900,
  "currency": "INR",
  "currentStock": 50,
  "minStockLevel": 10,
  "reorderPoint": 15,
  "tags": ["smartphone", "apple", "iphone", "5g"]
}
```

5. Click **Execute**

### Expected Response

```json
{
  "success": true,
  "data": {
    "id": "6967a6e3c4613dcc20340dcc",
    "sku": "ELEC-PHONE-APPLE-0001",
    "name": "iPhone 15 Pro Max",
    "images": [
      "https://images.unsplash.com/photo-1...",
      "https://images.unsplash.com/photo-2...",
      "https://images.unsplash.com/photo-3...",
      "https://images.unsplash.com/photo-4...",
      "https://images.unsplash.com/photo-5...",
      "https://images.unsplash.com/photo-6..."
    ],
    "qrCode": "...",
    "barcode": "...",
    ...
  }
}
```

**✅ Verification:** Check that `images` array contains 5-6 Unsplash URLs

## Test 3: QR Code Endpoint

### Using Browser

1. Get a product ID from the previous test (e.g., `6967a6e3c4613dcc20340dcc`)
2. Open in browser:
   ```
   http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/qr
   ```
3. You should see a QR code image displayed

### Using cURL

```bash
# View in browser
curl http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/qr -o qr_code.png
start qr_code.png
```

### Using Swagger UI

1. Open http://localhost:5002/docs
2. Find **GET /api/v1/products/{product_id}/qr**
3. Click **Try it out**
4. Enter product ID: `6967a6e3c4613dcc20340dcc`
5. Click **Execute**
6. Click **Download file**

**✅ Verification:** QR code PNG image displays/downloads successfully

## Test 4: Barcode Endpoint

### Using Browser

1. Open in browser:
   ```
   http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/barcode
   ```
2. You should see a barcode image displayed

### Using cURL

```bash
# Download and view
curl http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/barcode -o barcode.png
start barcode.png
```

### Using Swagger UI

1. Open http://localhost:5002/docs
2. Find **GET /api/v1/products/{product_id}/barcode**
3. Click **Try it out**
4. Enter product ID: `6967a6e3c4613dcc20340dcc`
5. Click **Execute**
6. Click **Download file**

**✅ Verification:** Barcode PNG image displays/downloads successfully

## Test 5: Quick Automated Test

```bash
# Run quick test script
python quick_test.py
```

**Expected Output:**
```
Testing server connection...
✓ Server is running: 200

Fetching products...
✓ Found X products

1. iPhone 15 Pro Max (SKU: ELEC-PHONE-APPLE-0001)
   ID: 6967a6e3c4613dcc20340dcc
   Images: 6 Unsplash images
   QR URL: http://localhost:5002/api/v1/products/.../qr
   Barcode URL: http://localhost:5002/api/v1/products/.../barcode

📱 Testing QR Code endpoint...
   Status: 200
   Content-Type: image/png
   Size: ~15000 bytes

🏷️ Testing Barcode endpoint...
   Status: 200
   Content-Type: image/png
   Size: ~20000 bytes

✅ All endpoints working correctly!
```

## Test 6: HTML Integration Test

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>PMS Product Display</title>
    <style>
        .product { margin: 20px; padding: 20px; border: 1px solid #ddd; }
        .images { display: flex; gap: 10px; flex-wrap: wrap; }
        .images img { width: 200px; height: 150px; object-fit: cover; }
        .codes { display: flex; gap: 20px; margin-top: 20px; }
        .codes img { border: 1px solid #ccc; padding: 10px; }
    </style>
</head>
<body>
    <div class="product">
        <h2>iPhone 15 Pro Max</h2>
        
        <h3>Product Images (Unsplash)</h3>
        <div class="images">
            <img src="https://images.unsplash.com/photo-..." alt="Image 1">
            <img src="https://images.unsplash.com/photo-..." alt="Image 2">
            <img src="https://images.unsplash.com/photo-..." alt="Image 3">
            <!-- Use actual URLs from your product response -->
        </div>
        
        <h3>QR & Barcode</h3>
        <div class="codes">
            <div>
                <p>QR Code</p>
                <img src="http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/qr" 
                     alt="QR Code">
            </div>
            <div>
                <p>Barcode</p>
                <img src="http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/barcode" 
                     alt="Barcode">
            </div>
        </div>
    </div>
</body>
</html>
```

Save as `test_display.html` and open in browser.

## Common Issues & Solutions

### Issue 1: Server Not Running
**Error:** `Cannot connect to server`
**Solution:**
```bash
uvicorn app.main:app --reload --port 5002
```

### Issue 2: No Images Generated
**Error:** Product created but `images` array is empty
**Possible Causes:**
- Unsplash API credentials missing/invalid
- Network connectivity issues
- API rate limit exceeded

**Check:**
1. Verify credentials in `.env`
2. Check logs: Look for "Fetched X images from Unsplash"
3. Test Unsplash directly: `python test_new_features.py`

### Issue 3: QR/Barcode Returns 404
**Error:** `404 Not Found`
**Solution:**
- Verify product ID exists
- Check product was created successfully
- Test: `GET /api/v1/products/{id}` first

### Issue 4: Invalid Product ID
**Error:** `Invalid product ID format`
**Solution:**
- Ensure you're using the full MongoDB ObjectId (24 chars)
- Example: `6967a6e3c4613dcc20340dcc`
- Not the SKU (e.g., `ELEC-PHONE-APPLE-0001`)

## Verification Checklist

- [ ] Server starts without errors
- [ ] Swagger UI accessible at /docs
- [ ] Can create products via API
- [ ] Products have 5-6 Unsplash images
- [ ] QR code endpoint returns PNG
- [ ] Barcode endpoint returns PNG
- [ ] Images display in browser
- [ ] Test script runs successfully
- [ ] Logs show Unsplash fetch messages

## Success Criteria

✅ **Unsplash Integration:**
- New products automatically get 5-6 images
- Images are relevant to product/brand/category
- Failures don't block product creation

✅ **QR Code:**
- `/products/{id}/qr` returns PNG image
- QR code contains product SKU
- Image is scannable

✅ **Barcode:**
- `/products/{id}/barcode` returns PNG image
- Barcode contains cleaned SKU
- Image is scannable

## Next Steps

1. **Create Multiple Products** - Test with various categories/brands
2. **Verify Image Quality** - Check Unsplash images are relevant
3. **Test QR Scanning** - Use phone to scan generated QR codes
4. **Test Barcode Scanning** - Use barcode scanner to verify
5. **Performance Testing** - Create products in bulk
6. **Frontend Integration** - Integrate with your UI

## Support

For issues:
1. Check server logs for errors
2. Review [docs/unsplash-qr-barcode-features.md](unsplash-qr-barcode-features.md)
3. Run test suite: `python test_new_features.py`
4. Check Unsplash API status: https://status.unsplash.com/

## Quick Reference

### Endpoints
- **Create Product**: `POST /api/v1/products`
- **Get Product**: `GET /api/v1/products/{id}`
- **QR Code**: `GET /api/v1/products/{id}/qr`
- **Barcode**: `GET /api/v1/products/{id}/barcode`

### Test Scripts
- **Full Test**: `python test_new_features.py`
- **Quick Test**: `python quick_test.py`

### Documentation
- **Full Docs**: `docs/unsplash-qr-barcode-features.md`
- **Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `docs/TESTING_GUIDE.md`
