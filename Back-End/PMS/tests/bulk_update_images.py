"""
Bulk Update All Products with Unsplash Images
Adds 5-6 Unsplash images to all products that don't have images
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add app to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.unsplash_utils import UnsplashService


# Load environment variables
load_dotenv()


async def bulk_update_products_with_images():
    """Bulk update all products without images"""
    
    print("=" * 90)
    print("Bulk Update Products with Unsplash Images")
    print("=" * 90)
    print()
    
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
        # Step 2: Find products without images
        print("🔍 Step 2: Finding products without images...")
        products_without_images = []
        
        async for product in products_collection.find({
            "isDeleted": False,
            "$or": [
                {"images": {"$exists": False}},
                {"images": {"$size": 0}},
                {"images": []}
            ]
        }):
            products_without_images.append(product)
        
        total_to_update = len(products_without_images)
        print(f"   ✓ Found {total_to_update} products without images\n")
        
        if total_to_update == 0:
            print("   ✅ All products already have images!\n")
            return
        
        # Step 3: Ask for confirmation
        print(f"⚠️  This will update {total_to_update} products with Unsplash images (5-6 per product)")
        print(f"   Total API calls: ~{total_to_update * 3} requests to Unsplash")
        print(f"   Estimated time: ~{total_to_update * 4} seconds")
        print()
        
        response = input("   Continue? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("\n   ❌ Operation cancelled by user\n")
            return
        
        print("\n   ✓ Starting bulk update...\n")
        
        # Step 4: Initialize Unsplash service
        print("🖼️  Step 3: Initializing Unsplash service...")
        unsplash_service = UnsplashService()
        print("   ✓ Unsplash service ready\n")
        
        # Step 5: Process each product
        print("🔄 Step 4: Processing products...")
        print("=" * 90)
        
        successful = 0
        failed = 0
        skipped = 0
        
        for i, product in enumerate(products_without_images, 1):
            product_id = str(product["_id"])
            sku = product.get("sku", "N/A")
            name = product.get("name", "Unknown")
            brand = product.get("brand", "Unknown")
            category_id = product.get("categoryId")
            
            print(f"\n[{i}/{total_to_update}] Processing: {sku}")
            print(f"    Name: {name}")
            print(f"    Brand: {brand}")
            
            try:
                # Get category name
                category_doc = await categories_collection.find_one({"_id": category_id})
                category_name = category_doc.get("name", "General") if category_doc else "General"
                
                # Fetch Unsplash images
                images = await unsplash_service.get_product_images(
                    product_name=name,
                    brand=brand,
                    category=category_name,
                    count=6
                )
                
                if not images:
                    print(f"    ⚠️  No images fetched - skipping")
                    skipped += 1
                    continue
                
                # Extract image URLs
                image_urls = [img.get("url") for img in images if img.get("url")]
                
                if not image_urls:
                    print(f"    ⚠️  No valid URLs - skipping")
                    skipped += 1
                    continue
                
                # Update product
                await products_collection.update_one(
                    {"_id": product["_id"]},
                    {
                        "$set": {
                            "images": image_urls,
                            "updatedAt": datetime.utcnow()
                        }
                    }
                )
                
                print(f"    ✅ Updated with {len(image_urls)} images")
                successful += 1
                
                # Small delay to respect API rate limits
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"    ❌ Error: {str(e)}")
                failed += 1
                continue
        
        # Final Summary
        print("\n" + "=" * 90)
        print("📊 Bulk Update Summary")
        print("=" * 90)
        print(f"Total Products Processed: {total_to_update}")
        print(f"✅ Successfully Updated: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Skipped: {skipped}")
        print()
        
        if successful > 0:
            avg_images = successful * 5  # Assuming ~5 images per product
            print(f"📸 Total Images Added: ~{avg_images}")
            print(f"✨ Success Rate: {successful/total_to_update*100:.1f}%")
        
        print("=" * 90)
        print()
        
        if failed > 0:
            print("⚠️  Some products failed to update. Possible reasons:")
            print("   • Unsplash API rate limit reached (50 requests/hour)")
            print("   • Network connectivity issues")
            print("   • Invalid product data")
            print()
            print("💡 You can re-run this script to retry failed products\n")
        
        if successful > 0:
            print("✅ Bulk update completed!")
            print("\n🔍 Verify results:")
            print("   • Run: python verify_all_products.py")
            print("   • Check API: GET /api/v1/products")
            print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Update interrupted by user")
        print("   Some products may have been updated. Run verify_all_products.py to check status\n")
    except Exception as e:
        print(f"\n❌ Fatal error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


async def main():
    """Main runner"""
    print("\n🚀 Starting bulk update process...\n")
    await bulk_update_products_with_images()
    
    print("\n💡 Tips:")
    print("   • Unsplash free tier: 50 requests/hour")
    print("   • If you hit rate limits, wait 1 hour and re-run")
    print("   • New products will auto-generate images on creation")
    print()


if __name__ == "__main__":
    asyncio.run(main())
