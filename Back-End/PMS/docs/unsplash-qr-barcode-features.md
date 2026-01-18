# Unsplash Images & QR/Barcode Features

## Overview
This implementation adds automatic Unsplash image generation and QR/Barcode endpoints for products in the PMS system.

## Features Implemented

### 1. Unsplash Image Integration
Automatically fetches 5-6 relevant product images from Unsplash when creating products.

#### Configuration
Add to `.env`:
```env
UNSPLASH_ACCESS_KEY=AZBKfvSErVqd2VDa4Sd04MSCLxzXBdNtozlPJ3sEy6E
UNSPLASH_SECRET_KEY=K7qWwH3oVFEw1i6ynUsReQ9h4ZlZ30eMp1NIHXWZBMo
UNSPLASH_APPLICATION_ID=323710
```

#### How It Works
When creating a product, the system:
1. Takes the product name, brand, and category
2. Searches Unsplash for relevant images using multiple query strategies:
   - `{brand} {product_name}`
   - `{category} {product_name}`
   - `{product_name}`
   - `{brand} {category}`
   - `{category}` (fallback)
3. Fetches up to 6 unique images
4. Stores image URLs in the product's `images` field

#### Example
```json
{
  "name": "Wireless Router AC1900",
  "brand": "Cisco",
  "categoryId": "...",
  "subCategoryId": "...",
  "unitPrice": 12500.00
}
```

Will automatically fetch 5-6 images of routers and networking equipment from Unsplash.

### 2. QR Code Endpoint

#### Endpoint
```
GET /api/v1/products/{product_id}/qr
```

#### Description
Generates and returns a QR code image (PNG) for the product's SKU.

#### Example Usage
```bash
curl http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/qr -o qr_code.png
```

#### Response
- **Content-Type**: `image/png`
- **Headers**: 
  - `Content-Disposition: inline; filename=qr_{sku}.png`
  - `Cache-Control: public, max-age=3600`

#### Use Cases
- Print on product labels
- Display in product catalogs
- Mobile app scanning for quick product lookup
- Inventory management

### 3. Barcode Endpoint

#### Endpoint
```
GET /api/v1/products/{product_id}/barcode
```

#### Description
Generates and returns a barcode image (PNG) for the product's SKU.

#### Example Usage
```bash
curl http://localhost:5002/api/v1/products/6967a6e3c4613dcc20340dcc/barcode -o barcode.png
```

#### Response
- **Content-Type**: `image/png`
- **Headers**: 
  - `Content-Disposition: inline; filename=barcode_{sku}.png`
  - `Cache-Control: public, max-age=3600`

#### Use Cases
- Product packaging
- Warehouse labeling
- Point of sale scanning
- Inventory tracking

## API Examples

### Create Product with Auto-Generated Images
```bash
POST /api/v1/products
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "MacBook Pro 16-inch",
  "categoryId": "6789abcd1234567890123456",
  "subCategoryId": "6789abcd1234567890123457",
  "brand": "Apple",
  "description": "Professional laptop with M2 chip",
  "unitPrice": 199999.00,
  "currency": "INR",
  "tags": ["laptop", "macbook", "apple"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "sku": "ELEC-LAPTOP-APPLE-0001",
    "name": "MacBook Pro 16-inch",
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

### Get QR Code
```bash
GET /api/v1/products/6967a6e3c4613dcc20340dcc/qr
```

Returns PNG image directly (can be used in `<img>` tags).

### Get Barcode
```bash
GET /api/v1/products/6967a6e3c4613dcc20340dcc/barcode
```

Returns PNG image directly (can be used in `<img>` tags).

## Technical Details

### Dependencies Added
```txt
pyunsplash==1.0.0rc2  # Unsplash API client
```

### Files Modified/Created

#### New Files
- `app/utils/unsplash_utils.py` - Unsplash service implementation
- `test_new_features.py` - Test suite for new features
- `docs/unsplash-qr-barcode-features.md` - This documentation

#### Modified Files
- `.env` - Added Unsplash credentials
- `app/config/settings.py` - Added Unsplash configuration
- `app/services/product.py` - Integrated Unsplash image fetching
- `app/routes/product.py` - Added QR and Barcode endpoints
- `requirements.txt` - Added pyunsplash dependency

### UnsplashService Methods

#### `get_random_images(query, count, orientation)`
Fetch random images from Unsplash.

#### `search_images(query, per_page, page, orientation)`
Search for specific images.

#### `get_product_images(product_name, brand, category, count)`
Smart image fetching using multiple search strategies.

#### `download_image(url)`
Download image bytes from URL.

## Testing

### Run Test Suite
```bash
python test_new_features.py
```

### Manual Testing

1. **Create a product:**
```bash
POST /api/v1/products
{
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "categoryId": "...",
  "subCategoryId": "...",
  "unitPrice": 129900
}
```

2. **Check the response** - should include 5-6 Unsplash image URLs

3. **Generate QR code:**
```bash
GET /api/v1/products/{product_id}/qr
```

4. **Generate Barcode:**
```bash
GET /api/v1/products/{product_id}/barcode
```

## Configuration Options

### Unsplash Settings
```env
UNSPLASH_ACCESS_KEY=your_access_key
UNSPLASH_SECRET_KEY=your_secret_key
UNSPLASH_APPLICATION_ID=your_app_id
```

### QR Code Settings (existing)
```env
QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=H
```

### Barcode Settings (existing)
```env
BARCODE_WIDTH=400
BARCODE_HEIGHT=200
```

## Error Handling

### Unsplash API Failures
- If Unsplash API fails, product creation continues with empty images array
- Errors are logged but don't block product creation
- Timeout: 10 seconds for API requests

### QR/Barcode Generation
- Returns 404 if product not found
- Generates codes on-demand (not stored)
- 1-hour cache for generated images

## Performance Considerations

1. **Async/Await**: All Unsplash calls are async to avoid blocking
2. **Caching**: QR/Barcode responses include cache headers (1 hour)
3. **Timeout**: 10-second timeout on Unsplash API calls
4. **Deduplication**: Removes duplicate images by ID
5. **Limits**: Max 30 images per Unsplash request (we use 6)

## Best Practices

1. **Image Count**: Default 6 images provides good variety without overload
2. **Query Strategy**: Multi-tier search ensures relevant results
3. **Fallback**: Falls back to category-based search if specific search fails
4. **Non-Blocking**: Image fetching failures don't prevent product creation

## Future Enhancements

1. **Image Download**: Option to download and store Unsplash images locally
2. **Image Selection**: Allow manual selection from fetched images
3. **Custom Images**: Mix Unsplash with user-uploaded images
4. **Image Optimization**: Resize/optimize images for faster loading
5. **Attribution**: Store and display photographer attribution
6. **Batch Generation**: Bulk QR/Barcode generation for multiple products

## Troubleshooting

### No images fetched
- Check Unsplash credentials in `.env`
- Verify network connectivity
- Check logs for API errors
- Ensure `pyunsplash` is installed

### QR/Barcode returns 404
- Verify product ID exists
- Check product retrieval endpoint first
- Ensure product has valid SKU

### Images not relevant
- Adjust search query logic in `get_product_images()`
- Add more specific product tags
- Use more descriptive product names/brands

## License & Attribution

When using Unsplash images:
- Follow Unsplash license terms
- Provide attribution to photographers (stored in image metadata)
- Respect API rate limits (50 requests/hour for free tier)

## Contact

For issues or questions about these features, refer to:
- Unsplash API Docs: https://unsplash.com/documentation
- Python Barcode Docs: https://python-barcode.readthedocs.io/
- QRCode Docs: https://pypi.org/project/qrcode/
