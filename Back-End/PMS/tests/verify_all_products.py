"""
Verify Images for ALL Products
Check which products have images and which don't
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from tabulate import tabulate


# Load environment variables
load_dotenv()


async def verify_all_products():
    """Check image status for all products"""
    
    print("=" * 90)
    print("Product Images Status - All Products Verification")
    print("=" * 90)
    print()
    
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin")
    mongodb_database = os.getenv("MONGODB_DATABASE", "pms_db")
    
    print("🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[mongodb_database]
    products_collection = db["products"]
    files_collection = db["pms_files.files"]
    
    try:
        await client.admin.command('ping')
        print("   ✓ MongoDB connected\n")
    except Exception as e:
        print(f"   ✗ MongoDB connection failed: {str(e)}\n")
        return
    
    try:
        # Get all products
        print("📦 Fetching all products...")
        products = []
        async for product in products_collection.find({"isDeleted": False}).sort("createdAt", -1):
            products.append(product)
        
        total_products = len(products)
        print(f"   ✓ Found {total_products} active products\n")
        
        if total_products == 0:
            print("   ℹ️  No products found in database\n")
            return
        
        # Analyze each product
        print("🔍 Analyzing image status for each product...\n")
        
        results = []
        products_with_images = 0
        products_without_images = 0
        total_images_count = 0
        total_gridfs_files = 0
        
        for product in products:
            product_id = str(product["_id"])
            sku = product.get("sku", "N/A")
            name = product.get("name", "Unknown")
            brand = product.get("brand", "N/A")
            
            # Check images array
            images = product.get("images", [])
            images_count = len(images)
            
            # Check for QR and Barcode
            qr_code = product.get("qrCode")
            barcode = product.get("barcode")
            
            # Count GridFS files for this product
            gridfs_count = 0
            if qr_code:
                gridfs_count += 1
            if barcode:
                gridfs_count += 1
            
            # Determine status
            has_images = images_count > 0
            status = "✓ Has Images" if has_images else "✗ No Images"
            
            if has_images:
                products_with_images += 1
                total_images_count += images_count
            else:
                products_without_images += 1
            
            total_gridfs_files += gridfs_count
            
            # Add to results
            results.append({
                "SKU": sku[:25],
                "Name": name[:30],
                "Brand": brand[:15],
                "Images": images_count,
                "QR": "✓" if qr_code else "✗",
                "Barcode": "✓" if barcode else "✗",
                "Status": status
            })
        
        # Display results in table
        headers = ["SKU", "Name", "Brand", "Images", "QR", "Barcode", "Status"]
        table = [[r["SKU"], r["Name"], r["Brand"], r["Images"], r["QR"], r["Barcode"], r["Status"]] 
                 for r in results]
        
        print(tabulate(table, headers=headers, tablefmt="grid"))
        print()
        
        # Summary statistics
        print("=" * 90)
        print("📊 Summary Statistics")
        print("=" * 90)
        print(f"Total Products: {total_products}")
        print(f"Products WITH Images: {products_with_images} ({products_with_images/total_products*100:.1f}%)")
        print(f"Products WITHOUT Images: {products_without_images} ({products_without_images/total_products*100:.1f}%)")
        print(f"Total Product Images: {total_images_count}")
        print(f"Average Images per Product: {total_images_count/total_products:.1f}")
        print(f"Total QR/Barcode Files: {total_gridfs_files}")
        print()
        
        # List products without images
        if products_without_images > 0:
            print("⚠️  Products WITHOUT Images:")
            print("-" * 90)
            for i, result in enumerate(results, 1):
                if result["Images"] == 0:
                    print(f"{i}. {result['SKU']} - {result['Name']}")
            print()
        
        # GridFS Statistics
        print("💾 GridFS Statistics:")
        total_files = await files_collection.count_documents({})
        qr_codes = await files_collection.count_documents({"metadata.type": "qr_code"})
        barcodes = await files_collection.count_documents({"metadata.type": "barcode"})
        product_images = await files_collection.count_documents({
            "metadata.type": {"$in": ["product_image", "image"]}
        })
        
        print(f"   Total Files: {total_files}")
        print(f"   QR Codes: {qr_codes}")
        print(f"   Barcodes: {barcodes}")
        print(f"   Product Images: {product_images}")
        print()
        
        # Recommendations
        print("💡 Recommendations:")
        if products_without_images > 0:
            print(f"   • {products_without_images} products need images")
            print("   • Run update_product_images.py to add Unsplash images")
            print("   • Or use the file upload endpoint to add custom images")
        else:
            print("   ✅ All products have images!")
        
        print()
        print("=" * 90)
        
        # Export list of products without images
        if products_without_images > 0:
            print("\n📝 Products to Update (SKUs):")
            skus_without_images = [r["SKU"] for r in results if r["Images"] == 0]
            for sku in skus_without_images[:10]:  # Show first 10
                print(f"   - {sku}")
            if len(skus_without_images) > 10:
                print(f"   ... and {len(skus_without_images) - 10} more")
            print()
        
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


async def main():
    """Main runner"""
    await verify_all_products()
    
    print("🔗 Next Steps:")
    print("   1. Review products without images")
    print("   2. Run update_product_images.py for specific SKUs")
    print("   3. Or bulk update all products with missing images\n")


if __name__ == "__main__":
    asyncio.run(main())
