"""
Update Product with Unsplash Images
Fetches Unsplash images and updates product AUTOMO-PARTS-LG-0001
"""

import httpx
import asyncio
import sys
import os

# Add app to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.unsplash_utils import UnsplashService
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


async def update_product_with_unsplash_images():
    """Update product with Unsplash images"""
    
    target_sku = "AUTOMO-PARTS-LG-0001"
    
    print("=" * 70)
    print("Update Product with Unsplash Images")
    print("=" * 70)
    print(f"Target SKU: {target_sku}\n")
    
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin")
    mongodb_database = os.getenv("MONGODB_DATABASE", "pms_db")
    
    print("🔌 Step 1: Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[mongodb_database]
    products_collection = db["products"]
    categories_collection = db["categories"]
    
    try:
        await client.admin.command('ping')
        print("   ✓ MongoDB connected\n")
    except Exception as e:
        print(f"   ✗ MongoDB connection failed: {str(e)}\n")
        return
    
    try:
        # Step 2: Get product from database
        print(f"🔍 Step 2: Fetching product '{target_sku}'...")
        product_doc = await products_collection.find_one({"sku": target_sku})
        
        if not product_doc:
            print(f"   ✗ Product not found\n")
            return
        
        product_id = str(product_doc["_id"])
        product_name = product_doc.get("name")
        brand = product_doc.get("brand")
        category_id = product_doc.get("categoryId")
        
        print(f"   ✓ Product found!")
        print(f"   - ID: {product_id}")
        print(f"   - Name: {product_name}")
        print(f"   - Brand: {brand}")
        print(f"   - Current images: {len(product_doc.get('images', []))}\n")
        
        # Step 3: Get category name
        print("📂 Step 3: Fetching category information...")
        category_doc = await categories_collection.find_one({"_id": category_id})
        category_name = category_doc.get("name", "Automotive") if category_doc else "Automotive"
        print(f"   ✓ Category: {category_name}\n")
        
        # Step 4: Fetch Unsplash images
        print("🖼️  Step 4: Fetching Unsplash images...")
        print(f"   Query: product='{product_name}', brand='{brand}', category='{category_name}'")
        
        unsplash_service = UnsplashService()
        images = await unsplash_service.get_product_images(
            product_name=product_name,
            brand=brand,
            category=category_name,
            count=6
        )
        
        if not images:
            print("   ✗ No images fetched from Unsplash")
            print("   This could be due to API rate limits or connectivity issues\n")
            return
        
        print(f"   ✓ Fetched {len(images)} images from Unsplash")
        for i, img in enumerate(images[:3], 1):
            desc = img.get('description', 'No description')[:50]
            print(f"   {i}. {desc}...")
        if len(images) > 3:
            print(f"   ... and {len(images) - 3} more images")
        print()
        
        # Step 5: Extract image URLs
        print("📝 Step 5: Preparing image URLs...")
        image_urls = [img.get("url") for img in images if img.get("url")]
        print(f"   ✓ Prepared {len(image_urls)} image URLs\n")
        
        # Step 6: Update product in database
        print("💾 Step 6: Updating product in database...")
        update_result = await products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {
                "$set": {
                    "images": image_urls,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count > 0:
            print(f"   ✓ Product updated successfully!")
            print(f"   - Modified count: {update_result.modified_count}\n")
        else:
            print(f"   ⚠️  No changes made (already up to date?)\n")
        
        # Step 7: Verify update
        print("✅ Step 7: Verifying update...")
        updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
        updated_images = updated_product.get("images", [])
        
        print(f"   ✓ Product now has {len(updated_images)} images")
        print("\n   Image URLs:")
        for i, url in enumerate(updated_images, 1):
            print(f"   {i}. {url}")
        print()
        
        # Step 8: Test API endpoint
        print("🌐 Step 8: Testing API endpoint...")
        base_url = "http://localhost:5002/api/v1"
        
        async with httpx.AsyncClient() as http_client:
            try:
                api_response = await http_client.get(
                    f"{base_url}/products/{product_id}",
                    timeout=10.0
                )
                
                if api_response.status_code == 200:
                    api_data = api_response.json()
                    api_product = api_data.get("data", {})
                    api_images = api_product.get("images", [])
                    
                    print(f"   ✓ API returned product successfully")
                    print(f"   - Images in API response: {len(api_images)}")
                    
                    if len(api_images) == len(updated_images):
                        print(f"   ✓ API and database match!\n")
                    else:
                        print(f"   ⚠️  Mismatch: DB has {len(updated_images)}, API has {len(api_images)}\n")
                else:
                    print(f"   ⚠️  API returned status: {api_response.status_code}\n")
            except httpx.ConnectError:
                print(f"   ℹ️  API server not available, skipping API test\n")
            except Exception as e:
                print(f"   ⚠️  API test error: {str(e)}\n")
        
        # Final Summary
        print("=" * 70)
        print("📊 Update Summary")
        print("=" * 70)
        print(f"Product: {product_name}")
        print(f"SKU: {target_sku}")
        print(f"ID: {product_id}")
        print(f"Images added: {len(image_urls)}")
        print(f"Total images now: {len(updated_images)}")
        print()
        print("✅ SUCCESS: Product updated with Unsplash images!")
        print("=" * 70)
        
        print("\n🔗 View product:")
        print(f"   API: http://localhost:5002/api/v1/products/{product_id}")
        print(f"   Swagger: http://localhost:5002/docs#/Products/get_product_api_v1_products__product_id__get")
        print()
        
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


async def main():
    """Main runner"""
    print("\n🚀 Starting update process...\n")
    await update_product_with_unsplash_images()
    
    print("\n💡 Next steps:")
    print("   1. Run test_product_images.py to verify images")
    print("   2. Check API: GET /api/v1/products/sku/AUTOMO-PARTS-LG-0001")
    print("   3. View images in your application\n")


if __name__ == "__main__":
    asyncio.run(main())
