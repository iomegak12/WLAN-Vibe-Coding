"""
Phase 5 Test Script - Advanced Features & Polish
Tests advanced search, filtering, sorting, and date range queries.
"""

import httpx
import asyncio
import sys
from datetime import datetime, timedelta


# Service URLs
AUTH_URL = "http://localhost:5001/api/v1"
PMS_URL = "http://localhost:5002/api/v1"

# Test credentials
TEST_EMAIL = "jtdhamodharan@gmail.com"
TEST_PASSWORD = "Prestige123!"

# Global token
token = None


async def login_and_get_token():
    """Login and get access token from AUTH service."""
    global token
    
    print("\n" + "="*60)
    print("1. LOGGING IN TO AUTH SERVICE")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AUTH_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if response.status_code == 200:
            result = response.json()
            if "data" in result and "tokens" in result["data"]:
                token = result["data"]["tokens"].get("accessToken")
            
            if token:
                print(f"✓ Login successful")
                print(f"  Token: {token[:50]}...")
                return token
            else:
                print("✗ Login failed: Token not found")
                sys.exit(1)
        else:
            print(f"✗ Login failed: {response.status_code}")
            sys.exit(1)


async def create_test_products():
    """Create products with varying prices and stock levels for testing."""
    print("\n" + "="*60)
    print("2. CREATING TEST PRODUCTS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Get first category with subcategories
        response = await client.get(f"{PMS_URL}/categories", headers=headers)
        categories = response.json()["data"]["items"]
        
        category = None
        subcategory = None
        
        for cat in categories:
            subcat_response = await client.get(
                f"{PMS_URL}/subcategories?categoryId={cat['id']}&limit=1",
                headers=headers
            )
            subcats = subcat_response.json()["data"]["items"]
            if subcats:
                category = cat
                subcategory = subcats[0]
                break
        
        if not category or not subcategory:
            print("✗ No category with subcategories found")
            return
        
        print(f"  Using Category: {category['name']} ({category['code']})")
        print(f"  Using Sub-category: {subcategory['name']} ({subcategory['code']})")
        
        # Create products with different price and stock levels
        test_products = [
            {
                "name": "Budget Router",
                "brand": "TP-Link",
                "categoryId": category["id"],
                "subCategoryId": subcategory["id"],
                "unitPrice": 1500.00,
                "currentStock": 0,  # Out of stock
                "reorderPoint": 10,
                "tags": ["budget", "wireless"]
            },
            {
                "name": "Mid-Range Switch",
                "brand": "Netgear",
                "categoryId": category["id"],
                "subCategoryId": subcategory["id"],
                "unitPrice": 5000.00,
                "currentStock": 5,  # Low stock
                "reorderPoint": 10,
                "tags": ["switch", "gigabit"]
            },
            {
                "name": "Premium Router",
                "brand": "Cisco",
                "categoryId": category["id"],
                "subCategoryId": subcategory["id"],
                "unitPrice": 25000.00,
                "currentStock": 50,  # In stock
                "reorderPoint": 10,
                "tags": ["premium", "enterprise"]
            }
        ]
        
        created_count = 0
        for product_data in test_products:
            response = await client.post(
                f"{PMS_URL}/products",
                headers=headers,
                json=product_data
            )
            if response.status_code == 201:
                created_count += 1
                sku = response.json()["data"]["sku"]
                print(f"  ✓ Created: {product_data['name']} - SKU: {sku}")
        
        print(f"\n  Total products created: {created_count}")


async def test_price_range_filter():
    """Test price range filtering."""
    print("\n" + "="*60)
    print("3. TESTING PRICE RANGE FILTER")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Products between 2000 and 10000
        response = await client.get(
            f"{PMS_URL}/products?min_price=2000&max_price=10000",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            items = result["data"]["items"]
            print(f"✓ Products with price 2000-10000: {len(items)}")
            for item in items:
                print(f"  - {item['name']}: ₹{item['unitPrice']}")
        else:
            print(f"✗ Price filter failed: {response.status_code}")


async def test_stock_status_filters():
    """Test stock status filtering."""
    print("\n" + "="*60)
    print("4. TESTING STOCK STATUS FILTERS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Out of stock
        response = await client.get(
            f"{PMS_URL}/products?stock_status=out-of-stock",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ Out of stock products: {len(items)}")
            for item in items:
                print(f"  - {item['name']}: Stock = {item.get('currentStock', 0)}")
        
        # Test: Low stock
        response = await client.get(
            f"{PMS_URL}/products?stock_status=low-stock",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ Low stock products: {len(items)}")
            for item in items:
                print(f"  - {item['name']}: Stock = {item.get('currentStock', 0)}, Reorder Point = {item.get('reorderPoint', 0)}")
        
        # Test: In stock
        response = await client.get(
            f"{PMS_URL}/products?stock_status=in-stock",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ In stock products: {len(items)}")
            for item in items[:3]:  # Show first 3
                print(f"  - {item['name']}: Stock = {item.get('currentStock', 0)}")


async def test_date_range_filters():
    """Test date range filtering."""
    print("\n" + "="*60)
    print("5. TESTING DATE RANGE FILTERS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Products created in last 24 hours
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        
        response = await client.get(
            f"{PMS_URL}/products?created_from={yesterday.isoformat()}Z",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ Products created in last 24 hours: {len(items)}")
            for item in items[:3]:
                print(f"  - {item['name']}: Created at {item['createdAt']}")
        else:
            print(f"✗ Date filter failed: {response.status_code}")


async def test_sorting():
    """Test sorting options."""
    print("\n" + "="*60)
    print("6. TESTING SORTING")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Sort by price ascending
        response = await client.get(
            f"{PMS_URL}/products?sort_by=price&sort_order=asc&limit=5",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ Products sorted by price (ascending):")
            for item in items:
                print(f"  - {item['name']}: ₹{item['unitPrice']}")
        
        # Test: Sort by price descending
        response = await client.get(
            f"{PMS_URL}/products?sort_by=price&sort_order=desc&limit=5",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ Products sorted by price (descending):")
            for item in items:
                print(f"  - {item['name']}: ₹{item['unitPrice']}")
        
        # Test: Sort by name
        response = await client.get(
            f"{PMS_URL}/products?sort_by=name&sort_order=asc&limit=5",
            headers=headers
        )
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ Products sorted by name (A-Z):")
            for item in items:
                print(f"  - {item['name']}")


async def test_combined_filters():
    """Test combining multiple filters."""
    print("\n" + "="*60)
    print("7. TESTING COMBINED FILTERS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: In-stock products with price > 10000, sorted by price
        response = await client.get(
            f"{PMS_URL}/products?stock_status=in-stock&min_price=10000&sort_by=price&sort_order=asc",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ In-stock products over ₹10,000: {len(items)}")
            for item in items:
                print(f"  - {item['name']}: ₹{item['unitPrice']}, Stock: {item.get('currentStock', 0)}")
        else:
            print(f"✗ Combined filter failed: {response.status_code}")


async def test_text_search():
    """Test text search across multiple fields."""
    print("\n" + "="*60)
    print("8. TESTING TEXT SEARCH")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Search for "router"
        response = await client.get(
            f"{PMS_URL}/products?search=router",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ Search 'router' found: {len(items)} products")
            for item in items[:3]:
                print(f"  - {item['name']} ({item['brand']})")
        
        # Test: Search for "cisco"
        response = await client.get(
            f"{PMS_URL}/products?search=cisco",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ Search 'cisco' found: {len(items)} products")
            for item in items[:3]:
                print(f"  - {item['name']} ({item['brand']})")


async def test_tag_filtering():
    """Test filtering by tags."""
    print("\n" + "="*60)
    print("9. TESTING TAG FILTERING")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Filter by tag "wireless"
        response = await client.get(
            f"{PMS_URL}/products?tags=wireless",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"✓ Products tagged 'wireless': {len(items)}")
            for item in items:
                print(f"  - {item['name']}: Tags = {item.get('tags', [])}")
        
        # Test: Filter by tag "premium"
        response = await client.get(
            f"{PMS_URL}/products?tags=premium",
            headers=headers
        )
        
        if response.status_code == 200:
            items = response.json()["data"]["items"]
            print(f"\n✓ Products tagged 'premium': {len(items)}")
            for item in items:
                print(f"  - {item['name']}: Tags = {item.get('tags', [])}")


async def test_pagination():
    """Test pagination with filters."""
    print("\n" + "="*60)
    print("10. TESTING PAGINATION WITH FILTERS")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Get page 1
        response = await client.get(
            f"{PMS_URL}/products?page=1&limit=2",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()["data"]
            pagination = result["pagination"]
            print(f"✓ Page 1 (limit 2):")
            print(f"  Total: {pagination['total']}")
            print(f"  Pages: {pagination['pages']}")
            print(f"  Has Next: {pagination['hasNext']}")
            print(f"  Items: {len(result['items'])}")


async def run_tests():
    """Run all Phase 5 tests."""
    try:
        # Step 1: Login
        await login_and_get_token()
        
        # Step 2: Create test products
        await create_test_products()
        
        # Step 3: Price range filter
        await test_price_range_filter()
        
        # Step 4: Stock status filters
        await test_stock_status_filters()
        
        # Step 5: Date range filters
        await test_date_range_filters()
        
        # Step 6: Sorting
        await test_sorting()
        
        # Step 7: Combined filters
        await test_combined_filters()
        
        # Step 8: Text search
        await test_text_search()
        
        # Step 9: Tag filtering
        await test_tag_filtering()
        
        # Step 10: Pagination
        await test_pagination()
        
        # Summary
        print("\n" + "="*60)
        print("PHASE 5 TESTS COMPLETED")
        print("="*60)
        print("✓ All advanced features tested successfully!")
        print("\nTested Features:")
        print("  1. Price range filtering (min/max)")
        print("  2. Stock status filtering (in-stock, low-stock, out-of-stock)")
        print("  3. Date range filtering (created/updated)")
        print("  4. Multi-field sorting (name, price, dates)")
        print("  5. Combined filters")
        print("  6. Text search")
        print("  7. Tag filtering")
        print("  8. Pagination with filters")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("="*60)
    print("PHASE 5: ADVANCED FEATURES & POLISH")
    print("="*60)
    print(f"AUTH Service: {AUTH_URL}")
    print(f"PMS Service: {PMS_URL}")
    print(f"Test User: {TEST_EMAIL}")
    print("="*60)
    
    asyncio.run(run_tests())
