"""
Test Script: Verify Product Images for SKU AUTOMO-PARTS-LG-0001
Tests whether Unsplash images are returned when fetching product by ID
"""

import httpx
import asyncio


async def test_product_images():
    """Test product images retrieval for AUTOMO-PARTS-LG-0001"""
    
    base_url = "http://localhost:5002/api/v1"
    target_sku = "AUTOMO-PARTS-LG-0001"
    
    print("=" * 70)
    print("Product Images Verification Test")
    print("=" * 70)
    print(f"Target SKU: {target_sku}\n")
    
    async with httpx.AsyncClient() as client:
        try:
            # Step 1: Check server connection
            print("📡 Step 1: Checking server connection...")
            try:
                # Try to get products list to verify server is running
                test_conn = await client.get(f"{base_url}/products?limit=1", timeout=5.0)
                if test_conn.status_code in [200, 401]:  # 200 OK or 401 auth required
                    print("   ✓ Server is running\n")
                else:
                    print(f"   ✗ Server returned status: {test_conn.status_code}\n")
                    return
            except httpx.ConnectError:
                print("   ✗ Cannot connect to server at http://localhost:5002")
                print("   Please start the server: uvicorn app.main:app --reload --port 5002\n")
                return
            
            # Step 2: Get product by SKU
            print(f"🔍 Step 2: Fetching product by SKU '{target_sku}'...")
            sku_response = await client.get(
                f"{base_url}/products/sku/{target_sku}",
                timeout=10.0
            )
            
            if sku_response.status_code != 200:
                print(f"   ✗ Failed to fetch product: {sku_response.status_code}")
                print(f"   Response: {sku_response.text}\n")
                return
            
            product_data = sku_response.json()
            if not product_data.get("success"):
                print(f"   ✗ API returned success=false")
                print(f"   Response: {product_data}\n")
                return
            
            product = product_data.get("data", {})
            product_id = product.get("id")
            product_name = product.get("name")
            
            print(f"   ✓ Product found!")
            print(f"   - ID: {product_id}")
            print(f"   - Name: {product_name}")
            print(f"   - SKU: {product.get('sku')}")
            print(f"   - Brand: {product.get('brand')}\n")
            
            # Step 3: Verify images in SKU response
            print("🖼️  Step 3: Checking images from SKU endpoint...")
            images_from_sku = product.get("images", [])
            print(f"   Found {len(images_from_sku)} images")
            
            if images_from_sku:
                print("   ✓ Images present in SKU response:")
                for i, img_url in enumerate(images_from_sku, 1):
                    print(f"   {i}. {img_url}")
            else:
                print("   ✗ No images found in SKU response")
            print()
            
            # Step 4: Get product by ID
            print(f"🔍 Step 4: Fetching product by ID '{product_id}'...")
            id_response = await client.get(
                f"{base_url}/products/{product_id}",
                timeout=10.0
            )
            
            if id_response.status_code != 200:
                print(f"   ✗ Failed to fetch product by ID: {id_response.status_code}")
                print(f"   Response: {id_response.text}\n")
                return
            
            id_product_data = id_response.json()
            id_product = id_product_data.get("data", {})
            
            print(f"   ✓ Product retrieved by ID successfully\n")
            
            # Step 5: Verify images in ID response
            print("🖼️  Step 5: Checking images from ID endpoint...")
            images_from_id = id_product.get("images", [])
            print(f"   Found {len(images_from_id)} images")
            
            if images_from_id:
                print("   ✓ Images present in ID response:")
                for i, img_url in enumerate(images_from_id, 1):
                    # Show full URL for first 3, truncate rest
                    if i <= 3:
                        print(f"   {i}. {img_url}")
                    else:
                        print(f"   {i}. {img_url[:60]}...")
            else:
                print("   ✗ No images found in ID response")
            print()
            
            # Step 6: Validate image URLs
            print("✅ Step 6: Validating image URLs...")
            valid_images = 0
            invalid_images = 0
            
            for img_url in images_from_id:
                if img_url and img_url.startswith("https://images.unsplash.com/"):
                    valid_images += 1
                else:
                    invalid_images += 1
                    print(f"   ⚠️  Invalid URL format: {img_url}")
            
            if valid_images > 0:
                print(f"   ✓ {valid_images} valid Unsplash URLs")
            if invalid_images > 0:
                print(f"   ✗ {invalid_images} invalid URLs")
            print()
            
            # Step 7: Compare SKU and ID responses
            print("🔄 Step 7: Comparing SKU vs ID responses...")
            if images_from_sku == images_from_id:
                print(f"   ✓ Both endpoints return identical images ({len(images_from_sku)} images)")
            else:
                print(f"   ⚠️  Image arrays differ:")
                print(f"      SKU endpoint: {len(images_from_sku)} images")
                print(f"      ID endpoint: {len(images_from_id)} images")
            print()
            
            # Final Summary
            print("=" * 70)
            print("📊 Test Summary")
            print("=" * 70)
            print(f"Product: {product_name}")
            print(f"SKU: {target_sku}")
            print(f"ID: {product_id}")
            print(f"Images Found: {len(images_from_id)}")
            print(f"Valid Unsplash URLs: {valid_images}")
            print()
            
            if len(images_from_id) >= 5:
                print("✅ PASS: Product has 5+ images from Unsplash")
            elif len(images_from_id) > 0:
                print(f"⚠️  PARTIAL: Product has {len(images_from_id)} images (expected 5-6)")
            else:
                print("❌ FAIL: Product has no images")
            
            print("=" * 70)
            
            # Additional info
            if len(images_from_id) > 0:
                print("\n📝 Sample Image URLs:")
                for i, img_url in enumerate(images_from_id[:3], 1):
                    print(f"{i}. {img_url}")
                print()
                
                print("🌐 To view images in browser:")
                for i, img_url in enumerate(images_from_id[:2], 1):
                    print(f"   {img_url}")
                print()
            
        except httpx.TimeoutException:
            print("⏱️  Request timeout - server may be slow or unresponsive")
        except Exception as e:
            print(f"❌ Error occurred: {str(e)}")
            import traceback
            traceback.print_exc()


async def main():
    """Main test runner"""
    await test_product_images()
    
    print("\n💡 Tips:")
    print("   - Images are fetched from Unsplash when product is created")
    print("   - If no images, the product may have been created before this feature")
    print("   - Recreate the product to get Unsplash images auto-generated")
    print()


if __name__ == "__main__":
    asyncio.run(main())
