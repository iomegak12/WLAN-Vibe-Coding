"""
Test script for Phase 3 - Product Management
Run this script to test the product endpoints.

Usage:
    python tests/test_phase3.py
"""

import asyncio
import httpx
from datetime import datetime


BASE_URL = "http://localhost:5002/api/v1"
AUTH_SERVICE_URL = "http://localhost:5001/api/v1"
AUTH_TOKEN = None


async def login_and_get_token(email: str, password: str) -> str:
    """Login to AUTH service and get JWT token."""
    print("\n" + "="*60)
    print("AUTHENTICATING WITH AUTH SERVICE")
    print("="*60)
    print(f"Email: {email}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/auth/login",
                json={"email": email, "password": password}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Login successful - Status: 200")
                
                token = None
                if isinstance(result.get("data"), dict):
                    if "tokens" in result["data"] and isinstance(result["data"]["tokens"], dict):
                        token = result["data"]["tokens"].get("accessToken")
                    if not token:
                        token = result["data"].get("token") or result["data"].get("accessToken")
                
                if token:
                    print(f"✓ JWT token obtained")
                    return token
                    
        except Exception as e:
            print(f"✗ Login error: {str(e)}")
        
        return None


async def test_products():
    """Test product endpoints."""
    print("\n" + "="*60)
    print("TESTING PRODUCT ENDPOINTS")
    print("="*60)
    
    headers = {}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        results = []
        
        # Get categories and subcategories first
        print("\n[0] Getting categories and subcategories...")
        categories_response = await client.get(f"{BASE_URL}/categories?limit=10")
        categories_data = categories_response.json().get("data", {})
        categories = categories_data.get("items", [])
        
        if not categories:
            print("✗ No categories found - please run Phase 2 tests first")
            return []
        
        # Try to find a category with subcategories
        category = None
        subcategory = None
        
        for cat in categories:
            subcategories_response = await client.get(
                f"{BASE_URL}/subcategories?category_id={cat['id']}&limit=1"
            )
            subcategories_data = subcategories_response.json().get("data", {})
            subcategories = subcategories_data.get("items", [])
            
            if subcategories:
                category = cat
                subcategory = subcategories[0]
                break
        
        if not category or not subcategory:
            print("✗ No subcategories found - please run Phase 2 tests first")
            print("   Run: python tests\\test_phase2.py")
            return []
        
        print(f"✓ Using category: {category['name']} ({category['code']})")
        print(f"✓ Using subcategory: {subcategory['name']} ({subcategory['code']})")
        
        # Test 1: Create products
        print("\n[1] Creating products...")
        products_to_create = [
            {
                "name": "Cisco Wireless Router AC1900",
                "categoryId": category['id'],
                "subCategoryId": subcategory['id'],
                "brand": "Cisco",
                "description": "High-performance dual-band wireless router",
                "specifications": {
                    "frequency": "2.4GHz/5GHz",
                    "ports": 4,
                    "speed": "1900Mbps"
                },
                "unitPrice": 12500.00,
                "currency": "INR",
                "minStockLevel": 10,
                "maxStockLevel": 500,
                "reorderPoint": 20,
                "unit": "PCS",
                "weight": 0.5,
                "dimensions": {"length": 20, "width": 15, "height": 5},
                "manufacturer": "Cisco Systems",
                "warrantyPeriod": 24,
                "tags": ["wireless", "router", "networking", "cisco"]
            },
            {
                "name": "TP-Link Gigabit Router",
                "categoryId": category['id'],
                "subCategoryId": subcategory['id'],
                "brand": "TP-Link",
                "description": "Affordable gigabit router for home use",
                "unitPrice": 3500.00,
                "tags": ["router", "gigabit", "tplink"]
            }
        ]
        
        created_products = []
        for prod_data in products_to_create:
            try:
                response = await client.post(
                    f"{BASE_URL}/products",
                    json=prod_data,
                    headers=headers
                )
                result = response.json()
                
                if response.status_code == 201:
                    product = result.get("data")
                    created_products.append(product)
                    print(f"✓ Created: {prod_data['name']}")
                    print(f"   SKU: {product.get('sku')}")
                    print(f"   QR Code: {product.get('qrCode')}")
                    print(f"   Barcode: {product.get('barcode')}")
                    results.append(("Create Product", True))
                else:
                    error_msg = result.get('error', {}).get('message', 'Unknown error')
                    print(f"✗ Failed to create {prod_data['name']}: {error_msg}")
                    results.append(("Create Product", False))
            except Exception as e:
                print(f"✗ Error: {str(e)}")
                results.append(("Create Product", False))
        
        # Test 2: List products
        print("\n[2] Listing all products...")
        try:
            response = await client.get(f"{BASE_URL}/products?page=1&limit=10")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Listed {count} products")
            results.append(("List Products", response.status_code == 200))
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            results.append(("List Products", False))
        
        # Test 3: Get product by ID
        if created_products:
            print("\n[3] Getting product by ID...")
            try:
                product_id = created_products[0]["id"]
                response = await client.get(f"{BASE_URL}/products/{product_id}")
                result = response.json()
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Retrieved: {result.get('data', {}).get('name')}")
                results.append(("Get Product by ID", response.status_code == 200))
            except Exception as e:
                print(f"✗ Error: {str(e)}")
                results.append(("Get Product by ID", False))
        
        # Test 4: Get product by SKU
        if created_products:
            print("\n[4] Getting product by SKU...")
            try:
                sku = created_products[0]["sku"]
                response = await client.get(f"{BASE_URL}/products/sku/{sku}")
                result = response.json()
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Retrieved by SKU: {sku}")
                results.append(("Get Product by SKU", response.status_code == 200))
            except Exception as e:
                print(f"✗ Error: {str(e)}")
                results.append(("Get Product by SKU", False))
        
        # Test 5: Search products
        print("\n[5] Searching products...")
        try:
            response = await client.get(f"{BASE_URL}/products?search=Cisco")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 and count > 0 else "✗"
            print(f"{status} Found {count} products matching 'Cisco'")
            results.append(("Search Products", response.status_code == 200 and count > 0))
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            results.append(("Search Products", False))
        
        # Test 6: Filter by category
        print("\n[6] Filtering by category...")
        try:
            response = await client.get(
                f"{BASE_URL}/products?category_id={category['id']}"
            )
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Found {count} products in category")
            results.append(("Filter by Category", response.status_code == 200))
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            results.append(("Filter by Category", False))
        
        # Test 7: Filter by brand
        print("\n[7] Filtering by brand...")
        try:
            response = await client.get(f"{BASE_URL}/products?brand=Cisco")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Found {count} Cisco products")
            results.append(("Filter by Brand", response.status_code == 200))
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            results.append(("Filter by Brand", False))
        
        # Test 8: Update product
        if created_products and AUTH_TOKEN:
            print("\n[8] Updating product...")
            try:
                product_id = created_products[0]["id"]
                response = await client.put(
                    f"{BASE_URL}/products/{product_id}",
                    json={"unitPrice": 13000.00, "description": "Updated description"},
                    headers=headers
                )
                result = response.json()
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Updated product: {result.get('data', {}).get('name')}")
                print(f"   New price: ₹{result.get('data', {}).get('unitPrice')}")
                results.append(("Update Product", response.status_code == 200))
            except Exception as e:
                print(f"✗ Error: {str(e)}")
                results.append(("Update Product", False))
        
        return results


async def main():
    """Main test runner."""
    global AUTH_TOKEN
    
    print("\n" + "="*60)
    print(f"PMS Phase 3 Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    
    # Login
    AUTH_TOKEN = await login_and_get_token(
        email="jtdhamodharan@gmail.com",
        password="Prestige123!"
    )
    
    if not AUTH_TOKEN:
        print("\n⚠ WARNING: No authentication token available")
        return
    
    print(f"\nAuth: Enabled ✓")
    
    # Test products
    results = await test_products()
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({passed*100//total if total > 0 else 0}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
    elif passed > 0:
        print("⚠ Some tests failed")
    else:
        print("❌ All tests failed")


if __name__ == "__main__":
    asyncio.run(main())
