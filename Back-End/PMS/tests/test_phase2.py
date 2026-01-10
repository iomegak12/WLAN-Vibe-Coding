"""
Test script for Phase 2 - Category & Sub-Category Management
Run this script to test the category and sub-category endpoints.

Usage:
    python tests/test_phase2.py
    python tests/test_phase2.py --auth-token YOUR_JWT_TOKEN
"""

import asyncio
import httpx
import sys
from datetime import datetime


BASE_URL = "http://localhost:5002/api/v1"
AUTH_SERVICE_URL = "http://localhost:5001/api/v1"
AUTH_TOKEN = None  # Will be set from login or command line


async def login_and_get_token(email: str, password: str) -> str:
    """
    Login to AUTH service and get JWT token.
    
    Args:
        email: User email
        password: User password
    
    Returns:
        str: JWT token
    """
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
                
                # Try different possible token locations in response
                token = None
                if isinstance(result.get("data"), dict):
                    # Check for tokens.accessToken (AUTH service format)
                    if "tokens" in result["data"] and isinstance(result["data"]["tokens"], dict):
                        token = result["data"]["tokens"].get("accessToken")
                    # Fallback to data.token or data.accessToken
                    if not token:
                        token = result["data"].get("token") or result["data"].get("accessToken")
                elif isinstance(result, dict):
                    token = result.get("token") or result.get("accessToken")
                
                if token:
                    print(f"✓ JWT token obtained (length: {len(token)} chars)")
                    return token
                else:
                    print("✗ Login failed - No token in response")
                    print(f"   Response structure: {list(result.keys())}")
                    return None
            else:
                print(f"✗ Login failed - Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except httpx.ConnectError:
            print("✗ Cannot connect to AUTH service at http://localhost:5001")
            print("   Please ensure AUTH service is running")
            return None
        except Exception as e:
            print(f"✗ Login error: {str(e)}")
            return None


async def test_categories():
    """Test category endpoints."""
    print("\n" + "="*60)
    print("TESTING CATEGORY ENDPOINTS")
    print("="*60)
    
    headers = {}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        results = []
        
        # Test 1: Create category (without auth - should work with optional auth)
        print("\n[1] Creating categories...")
        categories_to_create = [
            {"name": "Electronics", "description": "Electronic devices and accessories"},
            {"name": "Networking Equipment", "description": "Network devices and cables"},
            {"name": "Hardware Components", "description": "Computer hardware parts"}
        ]
        
        created_categories = []
        for cat_data in categories_to_create:
            try:
                response = await client.post(
                    f"{BASE_URL}/categories",
                    json=cat_data,
                    headers=headers
                )
                result = response.json()
                
                if response.status_code == 201:
                    created_categories.append(result.get("data"))
                    code = result.get('data', {}).get('code', 'N/A')
                    print(f"✓ Created: {cat_data['name']} -> Code: {code}")
                    results.append(("Create Category", True))
                else:
                    error_msg = result.get('error', {}).get('message', result.get('message', 'Unknown error'))
                    print(f"✗ Failed to create {cat_data['name']}: {error_msg}")
                    if response.status_code == 401:
                        print(f"   (Authentication required - use --auth-token flag)")
                    results.append(("Create Category", False))
            except Exception as e:
                print(f"✗ Failed to create {cat_data['name']}: {str(e)}")
                results.append(("Create Category", False))
        
        # Test 2: List categories
        print("\n[2] Listing all categories...")
        try:
            response = await client.get(f"{BASE_URL}/categories?page=1&limit=10")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Listed {count} categories")
            results.append(("List Categories", response.status_code == 200))
        except Exception as e:
            print(f"✗ Failed to list categories: {str(e)}")
            results.append(("List Categories", False))
        
        # Test 3: Get category by ID
        if created_categories and created_categories[0]:
            print("\n[3] Getting category by ID...")
            try:
                cat_id = created_categories[0]["id"]
                response = await client.get(f"{BASE_URL}/categories/{cat_id}")
                result = response.json()
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Retrieved: {result.get('data', {}).get('name')}")
                results.append(("Get Category by ID", response.status_code == 200))
            except Exception as e:
                print(f"✗ Failed to get category: {str(e)}")
                results.append(("Get Category by ID", False))
        else:
            print("\n[3] Skipping get by ID test (no categories created)")
        
        # Test 4: Search categories
        print("\n[4] Searching categories...")
        try:
            response = await client.get(f"{BASE_URL}/categories?search=Elect")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 and count > 0 else "✗"
            print(f"{status} Found {count} categories matching 'Elect'")
            results.append(("Search Categories", response.status_code == 200 and count > 0))
        except Exception as e:
            print(f"✗ Failed to search categories: {str(e)}")
            results.append(("Search Categories", False))
        
        # Test 5: Update category (requires auth)
        if created_categories and created_categories[0] and AUTH_TOKEN:
            print("\n[5] Updating category...")
            try:
                cat_id = created_categories[0]["id"]
                response = await client.put(
                    f"{BASE_URL}/categories/{cat_id}",
                    json={"description": "Updated description"},
                    headers=headers
                )
                result = response.json()
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Updated category: {result.get('data', {}).get('name')}")
                results.append(("Update Category", response.status_code == 200))
            except Exception as e:
                print(f"✗ Failed to update category: {str(e)}")
                results.append(("Update Category", False))
        elif not AUTH_TOKEN:
            print("\n[5] Skipping update test (no auth token)")
        else:
            print("\n[5] Skipping update test (no categories created)")
        
        return results, created_categories


async def test_subcategories(created_categories):
    """Test sub-category endpoints."""
    print("\n" + "="*60)
    print("TESTING SUB-CATEGORY ENDPOINTS")
    print("="*60)
    
    if not created_categories or not created_categories[0]:
        print("⚠ No categories available for sub-category tests")
        print("   (Category creation requires authentication)")
        return []
    
    headers = {}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        results = []
        
        # Test 1: Create sub-categories
        print("\n[1] Creating sub-categories...")
        parent_id = created_categories[0]["id"]
        
        subcategories_to_create = [
            {"categoryId": parent_id, "name": "Routers", "description": "Wireless and wired routers"},
            {"categoryId": parent_id, "name": "Switches", "description": "Network switches"},
            {"categoryId": parent_id, "name": "WiFi Access Points", "description": "Wireless access points"}
        ]
        
        created_subcategories = []
        for subcat_data in subcategories_to_create:
            try:
                response = await client.post(
                    f"{BASE_URL}/subcategories",
                    json=subcat_data,
                    headers=headers
                )
                result = response.json()
                
                if response.status_code == 201:
                    created_subcategories.append(result.get("data"))
                    code = result.get('data', {}).get('code', 'N/A')
                    print(f"✓ Created: {subcat_data['name']} -> Code: {code}")
                    results.append(("Create Sub-Category", True))
                else:
                    error_msg = result.get('error', {}).get('message', result.get('message', 'Unknown error'))
                    print(f"✗ Failed to create {subcat_data['name']}: {error_msg}")
                    if response.status_code == 401:
                        print(f"   (Authentication required - use --auth-token flag)")
                    results.append(("Create Sub-Category", False))
            except Exception as e:
                print(f"✗ Failed to create {subcat_data['name']}: {str(e)}")
                results.append(("Create Sub-Category", False))
        
        # Test 2: List all sub-categories
        print("\n[2] Listing all sub-categories...")
        try:
            response = await client.get(f"{BASE_URL}/subcategories?page=1&limit=10")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Listed {count} sub-categories")
            results.append(("List Sub-Categories", response.status_code == 200))
        except Exception as e:
            print(f"✗ Failed to list sub-categories: {str(e)}")
            results.append(("List Sub-Categories", False))
        
        # Test 3: List sub-categories by category
        print("\n[3] Listing sub-categories by parent category...")
        try:
            response = await client.get(
                f"{BASE_URL}/subcategories?category_id={parent_id}"
            )
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 else "✗"
            print(f"{status} Found {count} sub-categories for category")
            results.append(("List Sub-Categories by Category", response.status_code == 200))
        except Exception as e:
            print(f"✗ Failed to list sub-categories by category: {str(e)}")
            results.append(("List Sub-Categories by Category", False))
        
        # Test 4: Get sub-category by ID
        if created_subcategories and created_subcategories[0]:
            print("\n[4] Getting sub-category by ID...")
            try:
                subcat_id = created_subcategories[0]["id"]
                response = await client.get(f"{BASE_URL}/subcategories/{subcat_id}")
                result = response.json()
                data = result.get("data", {})
                status = "✓" if response.status_code == 200 else "✗"
                print(
                    f"{status} Retrieved: {data.get('name')} "
                    f"(Category: {data.get('categoryName')})"
                )
                results.append(("Get Sub-Category by ID", response.status_code == 200))
            except Exception as e:
                print(f"✗ Failed to get sub-category: {str(e)}")
                results.append(("Get Sub-Category by ID", False))
        else:
            print("\n[4] Skipping get by ID test (no sub-categories created)")
        
        # Test 5: Search sub-categories
        print("\n[5] Searching sub-categories...")
        try:
            response = await client.get(f"{BASE_URL}/subcategories?search=Router")
            result = response.json()
            count = len(result.get("data", {}).get("items", []))
            status = "✓" if response.status_code == 200 and count > 0 else "✗"
            print(f"{status} Found {count} sub-categories matching 'Router'")
            results.append(("Search Sub-Categories", response.status_code == 200 and count > 0))
        except Exception as e:
            print(f"✗ Failed to search sub-categories: {str(e)}")
            results.append(("Search Sub-Categories", False))
        
        return results


async def main():
    """Main test runner."""
    global AUTH_TOKEN
    
    print("\n" + "="*60)
    print(f"PMS Phase 2 Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    
    # Login if no token provided
    if not AUTH_TOKEN:
        AUTH_TOKEN = await login_and_get_token(
            email="jtdhamodharan@gmail.com",
            password="Prestige123!"
        )
        
        if not AUTH_TOKEN:
            print("\n⚠ WARNING: No authentication token available")
            print("   Some tests will be skipped (CREATE, UPDATE, DELETE)")
            print("   Please ensure AUTH service is running on http://localhost:5001")
    
    print(f"\nAuth: {'Enabled ✓' if AUTH_TOKEN else 'Disabled (testing public endpoints only)'}")
    
    all_results = []
    
    # Test categories
    cat_results, created_categories = await test_categories()
    all_results.extend(cat_results)
    
    # Test sub-categories
    subcat_results = await test_subcategories(created_categories)
    all_results.extend(subcat_results)
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, success in all_results if success)
    total = len(all_results)
    
    for test_name, success in all_results:
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
    # Check for auth token in command line
    if len(sys.argv) > 1 and sys.argv[1] == "--auth-token":
        if len(sys.argv) > 2:
            AUTH_TOKEN = sys.argv[2]
        else:
            print("Error: --auth-token requires a token value")
            sys.exit(1)
    
    asyncio.run(main())
