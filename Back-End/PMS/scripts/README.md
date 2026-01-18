# Test Data Generator

## Overview
This script generates comprehensive test data for the PMS system including:
- **8 Categories** (Electronics, Clothing, Home & Kitchen, Sports, Books, Health, Toys, Automotive)
- **32 Subcategories** (4 under each category)
- **100 Products** with diverse combinations

## Features
- Realistic product names based on category/subcategory
- Category-specific pricing (e.g., Electronics: $299-$2499, Clothing: $19-$199)
- Varied stock levels (70% well-stocked, 20% low-stock, 10% out-of-stock)
- 45+ different brands
- Automatic SKU generation
- QR code and barcode generation for all products

## Prerequisites
1. PMS service running at `http://localhost:5002`
2. Valid JWT token from AUTH service
3. Required packages: `httpx`

## Setup

### 1. Install Dependencies
```bash
pip install httpx
```

### 2. Get Authentication Token
```bash
# Login to AUTH service to get JWT token
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

### 3. Update Script Configuration
Open `generate_test_data.py` and update:
```python
AUTH_TOKEN = "your-actual-jwt-token-here"
```

## Usage

### Run the Script
```bash
python scripts/generate_test_data.py
```

### Expected Output
```
============================================================
PMS TEST DATA GENERATOR
============================================================

⚠️  IMPORTANT: Update AUTH_TOKEN in this script before running!
   Get token from: POST http://localhost:5001/api/v1/auth/login

Press Enter to start generation (or Ctrl+C to cancel)...

============================================================
STARTING DATA GENERATION
============================================================

STEP 1: Creating Categories...
------------------------------------------------------------
✓ Created category: Electronics (ID: 67..., Code: CAT001)
✓ Created category: Clothing (ID: 67..., Code: CAT002)
...

STEP 2: Creating Subcategories...
------------------------------------------------------------
Category: Electronics
  ✓ Created subcategory: Smartphones (ID: 67..., Code: SUB001)
  ✓ Created subcategory: Laptops (ID: 67..., Code: SUB002)
...

STEP 3: Creating 100 Products...
------------------------------------------------------------
  ✓ [1/100] Product: Samsung Smart Smartphones Series X (SKU: CAT001-SUB001-SAM-0001)
  ✓ [2/100] Product: Nike Athletic Sneakers (SKU: CAT002-SUB004-NIK-0001)
...

============================================================
DATA GENERATION COMPLETE!
============================================================

📊 Summary:
   Categories: 8
   Subcategories: 32
   Products: 100

============================================================
```

## Generated Data Structure

### Categories (8)
1. **Electronics** - Electronic devices and accessories
2. **Clothing** - Fashion and apparel
3. **Home & Kitchen** - Home appliances and kitchenware
4. **Sports & Outdoors** - Sports equipment and outdoor gear
5. **Books & Media** - Books, movies, and music
6. **Health & Beauty** - Health products and cosmetics
7. **Toys & Games** - Toys and gaming products
8. **Automotive** - Auto parts and accessories

### Subcategories (32)
Each category has 4 specialized subcategories (see script for full list)

### Products (100)
- Distributed across all category/subcategory combinations
- Varied brands (45+ brands)
- Realistic pricing based on category
- Diverse stock levels
- Unique SKUs, QR codes, and barcodes

## Customization

### Add More Categories
```python
CATEGORIES.append({
    "name": "Your Category",
    "description": "Category description"
})
```

### Add More Subcategories
```python
SUBCATEGORIES["Your Category"] = [
    {"name": "Subcategory 1", "description": "Description"},
    {"name": "Subcategory 2", "description": "Description"},
]
```

### Change Product Count
Modify the loop in `generate_all_data()`:
```python
for i in range(200):  # Generate 200 products instead of 100
```

### Adjust Stock Distribution
Modify `generate_stock()` method:
```python
def generate_stock(self) -> int:
    rand = random.random()
    if rand < 0.8:  # 80% well-stocked
        return random.randint(100, 1000)
    # ...
```

## Troubleshooting

### Authentication Error (401)
- Verify AUTH_TOKEN is valid and not expired
- Get a new token from AUTH service

### Connection Error
- Ensure PMS service is running at `http://localhost:5002`
- Check MongoDB is running and accessible

### Rate Limiting
- The script includes 0.1s delay between products
- Increase delay if needed: `await asyncio.sleep(0.2)`

## Clean Up

To remove all generated data:
```bash
# Delete all products
curl -X DELETE http://localhost:5002/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete all subcategories (if endpoint exists)
# Delete all categories (if endpoint exists)
```

Or directly in MongoDB:
```javascript
use pms_db
db.products.deleteMany({})
db.subcategories.deleteMany({})
db.categories.deleteMany({})
db.fs.files.deleteMany({})
db.fs.chunks.deleteMany({})
```

## Notes
- Each product automatically gets SKU, QR code, and barcode generated
- Files are stored in MongoDB GridFS
- Script includes error handling and progress tracking
- Safe to run multiple times (creates duplicate data)
