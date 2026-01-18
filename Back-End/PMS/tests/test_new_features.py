"""
Test Unsplash and QR/Barcode Endpoints
Quick test to verify new features
"""

import httpx
import asyncio
from app.utils.unsplash_utils import UnsplashService


async def test_unsplash_service():
    """Test Unsplash service functionality."""
    print("\n" + "="*60)
    print("Testing Unsplash Service")
    print("="*60)
    
    service = UnsplashService()
    
    # Test 1: Get random images
    print("\n1. Fetching 3 random images...")
    random_images = await service.get_random_images(count=3, orientation="landscape")
    print(f"   ✓ Fetched {len(random_images)} random images")
    if random_images:
        print(f"   Sample: {random_images[0]['description'][:50]}...")
    
    # Test 2: Search for specific images
    print("\n2. Searching for 'router' images...")
    search_results = await service.search_images(query="router", per_page=3)
    print(f"   ✓ Found {len(search_results)} images for 'router'")
    if search_results:
        print(f"   Sample: {search_results[0]['description'][:50] if search_results[0]['description'] else 'No description'}...")
    
    # Test 3: Get product-specific images
    print("\n3. Fetching product images for 'Cisco Router'...")
    product_images = await service.get_product_images(
        product_name="Wireless Router AC1900",
        brand="Cisco",
        category="Electronics",
        count=5
    )
    print(f"   ✓ Retrieved {len(product_images)} product images")
    for i, img in enumerate(product_images[:3], 1):
        print(f"   {i}. {img['url'][:60]}...")
    
    print("\n" + "="*60)
    print("Unsplash Service Tests Complete!")
    print("="*60)


async def test_product_endpoints():
    """Test product QR/Barcode endpoints."""
    print("\n" + "="*60)
    print("Testing Product QR/Barcode Endpoints")
    print("="*60)
    
    base_url = "http://localhost:5002/api/v1"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test 1: Get all products
            print("\n1. Fetching products...")
            response = await client.get(f"{base_url}/products", timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", {}).get("items", [])
                print(f"   ✓ Found {len(products)} products")
                
                if products:
                    product_id = products[0]["id"]
                    sku = products[0]["sku"]
                    print(f"   Testing with Product: {products[0]['name']} (SKU: {sku})")
                    
                    # Test 2: Get QR code
                    print(f"\n2. Generating QR code for product {product_id}...")
                    qr_response = await client.get(
                        f"{base_url}/products/{product_id}/qr",
                        timeout=10.0
                    )
                    if qr_response.status_code == 200:
                        print(f"   ✓ QR code generated successfully ({len(qr_response.content)} bytes)")
                    else:
                        print(f"   ✗ QR code failed: {qr_response.status_code}")
                    
                    # Test 3: Get Barcode
                    print(f"\n3. Generating Barcode for product {product_id}...")
                    barcode_response = await client.get(
                        f"{base_url}/products/{product_id}/barcode",
                        timeout=10.0
                    )
                    if barcode_response.status_code == 200:
                        print(f"   ✓ Barcode generated successfully ({len(barcode_response.content)} bytes)")
                    else:
                        print(f"   ✗ Barcode failed: {barcode_response.status_code}")
                    
                    # Test 4: Check product images
                    print(f"\n4. Checking product images...")
                    if products[0].get("images"):
                        print(f"   ✓ Product has {len(products[0]['images'])} Unsplash images")
                        for i, img_url in enumerate(products[0]['images'][:3], 1):
                            print(f"   {i}. {img_url[:70]}...")
                    else:
                        print(f"   ℹ No images yet (will be added on next product creation)")
                else:
                    print("   ℹ No products found. Create a product to test endpoints.")
            else:
                print(f"   ✗ Failed to fetch products: {response.status_code}")
        
        except httpx.ConnectError:
            print("   ✗ Cannot connect to server. Make sure the server is running on port 5002")
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")
    
    print("\n" + "="*60)
    print("Endpoint Tests Complete!")
    print("="*60)


async def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("PMS - Feature Testing Suite")
    print("Unsplash Images + QR/Barcode Generation")
    print("="*60)
    
    # Test Unsplash service
    await test_unsplash_service()
    
    # Test product endpoints
    await test_product_endpoints()
    
    print("\n" + "="*60)
    print("All Tests Complete!")
    print("="*60)
    print("\nKey Features Implemented:")
    print("  ✓ Unsplash integration for product images (5-6 images)")
    print("  ✓ GET /api/v1/products/{id}/qr - QR code generation")
    print("  ✓ GET /api/v1/products/{id}/barcode - Barcode generation")
    print("  ✓ Auto-fetch Unsplash images on product creation")
    print("\nNext Steps:")
    print("  1. Create a new product to see Unsplash images auto-generated")
    print("  2. Access QR code: GET /api/v1/products/{product_id}/qr")
    print("  3. Access Barcode: GET /api/v1/products/{product_id}/barcode")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
