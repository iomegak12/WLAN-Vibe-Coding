"""
Enhanced Test Script: Verify Product Images Including GridFS Storage
Tests product images from both the images array and GridFS collections
Target SKU: AUTOMO-PARTS-LG-0001
"""

import httpx
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


async def test_product_images_with_gridfs():
    """Test product images retrieval including GridFS storage"""
    
    base_url = "http://localhost:5002/api/v1"
    target_sku = "AUTOMO-PARTS-LG-0001"
    
    print("=" * 70)
    print("Product Images Verification Test (with GridFS)")
    print("=" * 70)
    print(f"Target SKU: {target_sku}\n")
    
    # Connect to MongoDB
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://admin:password123@localhost:27017/pms_db?authSource=admin")
    mongodb_database = os.getenv("MONGODB_DATABASE", "pms_db")
    
    print("🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[mongodb_database]
    products_collection = db["products"]
    files_collection = db["pms_files.files"]
    
    try:
        # Verify MongoDB connection
        await client.admin.command('ping')
        print("   ✓ MongoDB connected\n")
    except Exception as e:
        print(f"   ✗ MongoDB connection failed: {str(e)}\n")
        return
    
    async with httpx.AsyncClient() as http_client:
        try:
            # Step 1: Check server connection
            print("📡 Step 1: Checking API server connection...")
            try:
                test_conn = await http_client.get(f"{base_url}/products?limit=1", timeout=5.0)
                if test_conn.status_code in [200, 401]:
                    print("   ✓ API server is running\n")
                else:
                    print(f"   ⚠️  Server returned status: {test_conn.status_code}\n")
            except httpx.ConnectError:
                print("   ✗ Cannot connect to API server at http://localhost:5002")
                print("   Note: Continuing with database check...\n")
            
            # Step 2: Get product from database directly
            print(f"🔍 Step 2: Fetching product from database by SKU '{target_sku}'...")
            product_doc = await products_collection.find_one({"sku": target_sku})
            
            if not product_doc:
                print(f"   ✗ Product not found in database\n")
                return
            
            product_id = str(product_doc["_id"])
            product_name = product_doc.get("name")
            
            print(f"   ✓ Product found in database!")
            print(f"   - ID: {product_id}")
            print(f"   - Name: {product_name}")
            print(f"   - SKU: {product_doc.get('sku')}")
            print(f"   - Brand: {product_doc.get('brand')}\n")
            
            # Step 3: Check images array in product document
            print("🖼️  Step 3: Checking 'images' array in product document...")
            images_array = product_doc.get("images", [])
            print(f"   Found {len(images_array)} entries in images array")
            
            if images_array:
                print("   ✓ Images in array:")
                for i, img in enumerate(images_array, 1):
                    if isinstance(img, str):
                        if img.startswith("http"):
                            print(f"   {i}. URL: {img[:70]}...")
                        else:
                            print(f"   {i}. GridFS ID: {img}")
                    else:
                        print(f"   {i}. {type(img)}: {img}")
            else:
                print("   ℹ️  Images array is empty\n")
            
            # Step 4: Check QR code and Barcode
            print("📱 Step 4: Checking QR code and Barcode fields...")
            qr_code = product_doc.get("qrCode")
            barcode = product_doc.get("barcode")
            
            if qr_code:
                print(f"   ✓ QR Code: {qr_code}")
            else:
                print("   ℹ️  No QR code")
            
            if barcode:
                print(f"   ✓ Barcode: {barcode}")
            else:
                print("   ℹ️  No barcode")
            print()
            
            # Step 5: Search GridFS for all files related to this product
            print("💾 Step 5: Searching GridFS for product-related files...")
            
            # Search by product ID in metadata
            gridfs_files = []
            
            # Search for files with product ID in metadata
            async for file in files_collection.find({
                "$or": [
                    {"metadata.productId": ObjectId(product_id)},
                    {"metadata.sku": target_sku}
                ]
            }):
                gridfs_files.append(file)
            
            # Also check if qrCode/barcode IDs point to GridFS files
            if qr_code and ObjectId.is_valid(qr_code):
                qr_file = await files_collection.find_one({"_id": ObjectId(qr_code)})
                if qr_file and qr_file not in gridfs_files:
                    gridfs_files.append(qr_file)
            
            if barcode and ObjectId.is_valid(barcode):
                barcode_file = await files_collection.find_one({"_id": ObjectId(barcode)})
                if barcode_file and barcode_file not in gridfs_files:
                    gridfs_files.append(barcode_file)
            
            # Check images array for GridFS IDs
            for img_id in images_array:
                if isinstance(img_id, str) and ObjectId.is_valid(img_id):
                    img_file = await files_collection.find_one({"_id": ObjectId(img_id)})
                    if img_file and img_file not in gridfs_files:
                        gridfs_files.append(img_file)
            
            print(f"   Found {len(gridfs_files)} files in GridFS")
            
            if gridfs_files:
                print("   ✓ GridFS Files:")
                for i, file in enumerate(gridfs_files, 1):
                    file_id = str(file["_id"])
                    filename = file.get("filename", "unknown")
                    file_type = file.get("metadata", {}).get("type", "unknown")
                    content_type = file.get("contentType", "unknown")
                    size = file.get("length", 0)
                    
                    print(f"   {i}. {filename}")
                    print(f"      - ID: {file_id}")
                    print(f"      - Type: {file_type}")
                    print(f"      - Content-Type: {content_type}")
                    print(f"      - Size: {size:,} bytes")
            else:
                print("   ℹ️  No files found in GridFS\n")
            
            # Step 6: Get total count of all files in GridFS
            print("\n📊 Step 6: GridFS statistics...")
            total_files = await files_collection.count_documents({})
            print(f"   Total files in GridFS: {total_files}")
            
            # Check if there are any product images at all
            product_images_count = await files_collection.count_documents({
                "metadata.type": {"$in": ["product_image", "image"]}
            })
            print(f"   Total product images in GridFS: {product_images_count}")
            
            qr_codes_count = await files_collection.count_documents({
                "metadata.type": "qr_code"
            })
            print(f"   Total QR codes in GridFS: {qr_codes_count}")
            
            barcodes_count = await files_collection.count_documents({
                "metadata.type": "barcode"
            })
            print(f"   Total barcodes in GridFS: {barcodes_count}\n")
            
            # Step 7: Try API endpoints
            print("🌐 Step 7: Testing API endpoints...")
            try:
                # Get product by ID via API
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
                    
                    if api_images:
                        for i, img in enumerate(api_images[:3], 1):
                            print(f"   {i}. {img[:70]}...")
                else:
                    print(f"   ⚠️  API returned status: {api_response.status_code}")
            except Exception as e:
                print(f"   ⚠️  API test skipped: {str(e)}")
            
            print()
            
            # Final Summary
            print("=" * 70)
            print("📊 Test Summary")
            print("=" * 70)
            print(f"Product: {product_name}")
            print(f"SKU: {target_sku}")
            print(f"ID: {product_id}")
            print(f"Images array entries: {len(images_array)}")
            print(f"GridFS files found: {len(gridfs_files)}")
            print(f"QR Code: {'Yes' if qr_code else 'No'}")
            print(f"Barcode: {'Yes' if barcode else 'No'}")
            print()
            
            # Determine test result
            total_images = len(images_array) + len(gridfs_files)
            
            if total_images > 0:
                print(f"✅ PASS: Product has {total_images} total images/files")
                if len(images_array) > 0:
                    print(f"   - {len(images_array)} in images array")
                if len(gridfs_files) > 0:
                    print(f"   - {len(gridfs_files)} in GridFS")
            else:
                print("❌ FAIL: No images found")
                print("\n💡 Possible reasons:")
                print("   1. Product was created before Unsplash feature")
                print("   2. Images were not uploaded via file upload endpoint")
                print("   3. GridFS metadata doesn't link to this product")
            
            print("=" * 70)
            
        except Exception as e:
            print(f"❌ Error occurred: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            client.close()


async def main():
    """Main test runner"""
    await test_product_images_with_gridfs()
    
    print("\n📝 Notes:")
    print("   - Images array: URLs or GridFS file IDs")
    print("   - GridFS storage: pms_files.files and pms_files.chunks")
    print("   - QR/Barcode: Stored as GridFS file IDs")
    print("   - Unsplash images: Added to images array as URLs")
    print()


if __name__ == "__main__":
    asyncio.run(main())
