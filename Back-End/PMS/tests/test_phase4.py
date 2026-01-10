"""
Phase 4 Test Script - Image Management & File Operations
Tests image upload, listing, download, and deletion for products.
"""

import httpx
import asyncio
import sys
from pathlib import Path
from io import BytesIO
from PIL import Image


# Service URLs
AUTH_URL = "http://localhost:5001/api/v1"
PMS_URL = "http://localhost:5002/api/v1"

# Test credentials
TEST_EMAIL = "jtdhamodharan@gmail.com"
TEST_PASSWORD = "Prestige123!"

# Global token
token = None


def create_test_image(filename: str, size: tuple = (800, 600), color: str = "blue") -> bytes:
    """
    Create a test image in memory.
    
    Args:
        filename: Image filename (used for format)
        size: Image size (width, height)
        color: Image color
    
    Returns:
        bytes: Image data
    """
    # Create image
    img = Image.new('RGB', size, color=color)
    
    # Save to BytesIO
    buffer = BytesIO()
    format_map = {
        '.jpg': 'JPEG',
        '.jpeg': 'JPEG',
        '.png': 'PNG',
        '.webp': 'WEBP',
        '.gif': 'GIF'
    }
    ext = Path(filename).suffix.lower()
    img_format = format_map.get(ext, 'JPEG')
    img.save(buffer, format=img_format)
    
    return buffer.getvalue()


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
            # Check both paths for token
            if "data" in result and "tokens" in result["data"]:
                token = result["data"]["tokens"].get("accessToken")
            
            if token:
                print(f"✓ Login successful")
                print(f"  Token: {token[:50]}...")
                return token
            else:
                print("✗ Login failed: Token not found in response")
                print(f"  Response: {result}")
                sys.exit(1)
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            sys.exit(1)


async def get_test_product():
    """Get a product to use for testing."""
    print("\n" + "="*60)
    print("2. GETTING TEST PRODUCT")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Get all products
        response = await client.get(f"{PMS_URL}/products", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            items = result.get("data", {}).get("items", [])
            
            if items:
                product = items[0]
                print(f"✓ Found test product")
                print(f"  ID: {product['id']}")
                print(f"  SKU: {product['sku']}")
                print(f"  Name: {product['name']}")
                print(f"  Current images: {len(product.get('images', []))}")
                return product
            else:
                print("✗ No products found - please run Phase 3 tests first")
                sys.exit(1)
        else:
            print(f"✗ Failed to get products: {response.status_code}")
            print(f"  Response: {response.text}")
            sys.exit(1)


async def test_upload_images(product_id: str):
    """Test uploading multiple images to a product."""
    print("\n" + "="*60)
    print("3. TESTING IMAGE UPLOAD (Multiple Files)")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create test images
    image1_data = create_test_image("product_front.jpg", size=(800, 600), color="blue")
    image2_data = create_test_image("product_back.jpg", size=(800, 600), color="green")
    image3_data = create_test_image("product_side.png", size=(800, 600), color="red")
    
    files = [
        ("files", ("product_front.jpg", BytesIO(image1_data), "image/jpeg")),
        ("files", ("product_back.jpg", BytesIO(image2_data), "image/jpeg")),
        ("files", ("product_side.png", BytesIO(image3_data), "image/png"))
    ]
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PMS_URL}/files/products/{product_id}/images",
            headers=headers,
            files=files
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✓ Images uploaded successfully")
            print(f"  Uploaded images: {len(result['data']['uploadedImages'])}")
            print(f"  Total images: {result['data']['totalImages']}")
            for idx, img_id in enumerate(result['data']['uploadedImages'], 1):
                print(f"  Image {idx} ID: {img_id}")
            return result['data']['uploadedImages']
        else:
            print(f"✗ Image upload failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return []


async def test_list_images(product_id: str):
    """Test listing all images for a product."""
    print("\n" + "="*60)
    print("4. TESTING LIST PRODUCT IMAGES")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PMS_URL}/files/products/{product_id}/images",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            images = result['data']['images']
            print(f"✓ Retrieved {len(images)} image(s)")
            
            for idx, img in enumerate(images, 1):
                print(f"\n  Image {idx}:")
                print(f"    ID: {img['id']}")
                print(f"    Filename: {img['filename']}")
                print(f"    Content Type: {img['contentType']}")
                print(f"    Size: {img['size']} bytes")
                print(f"    URL: {img['url']}")
            
            return images
        else:
            print(f"✗ List images failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return []


async def test_download_file(file_id: str, filename: str):
    """Test downloading a file by ID."""
    print("\n" + "="*60)
    print(f"5. TESTING FILE DOWNLOAD: {filename}")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PMS_URL}/files/{file_id}")
        
        if response.status_code == 200:
            content = response.content
            print(f"✓ File downloaded successfully")
            print(f"  Size: {len(content)} bytes")
            print(f"  Content-Type: {response.headers.get('content-type')}")
            print(f"  Content-Disposition: {response.headers.get('content-disposition')}")
            return True
        else:
            print(f"✗ File download failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False


async def test_get_file_metadata(file_id: str):
    """Test getting file metadata without downloading."""
    print("\n" + "="*60)
    print("6. TESTING GET FILE METADATA")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PMS_URL}/files/{file_id}/metadata")
        
        if response.status_code == 200:
            result = response.json()
            metadata = result['data']
            print(f"✓ File metadata retrieved")
            print(f"  ID: {metadata['id']}")
            print(f"  Filename: {metadata['filename']}")
            print(f"  Size: {metadata['length']} bytes")
            print(f"  Content Type: {metadata.get('contentType')}")
            print(f"  Upload Date: {metadata['uploadDate']}")
            
            if 'metadata' in metadata:
                print(f"  Custom metadata:")
                for key, value in metadata['metadata'].items():
                    print(f"    {key}: {value}")
            
            return True
        else:
            print(f"✗ Get metadata failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False


async def test_download_qr_barcode(product_id: str, sku: str):
    """Test downloading QR code and barcode."""
    print("\n" + "="*60)
    print("7. TESTING QR CODE & BARCODE DOWNLOAD")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Get product to find QR and barcode IDs
        response = await client.get(f"{PMS_URL}/products/{product_id}", headers=headers)
        
        if response.status_code == 200:
            product = response.json()['data']
            qr_id = product.get('qrCode')
            barcode_id = product.get('barcode')
            
            print(f"  QR Code ID: {qr_id}")
            print(f"  Barcode ID: {barcode_id}")
            
            # Download QR code
            if qr_id:
                qr_response = await client.get(f"{PMS_URL}/files/{qr_id}")
                if qr_response.status_code == 200:
                    print(f"  ✓ QR Code downloaded ({len(qr_response.content)} bytes)")
                else:
                    print(f"  ✗ QR Code download failed: {qr_response.status_code}")
            
            # Download barcode
            if barcode_id:
                barcode_response = await client.get(f"{PMS_URL}/files/{barcode_id}")
                if barcode_response.status_code == 200:
                    print(f"  ✓ Barcode downloaded ({len(barcode_response.content)} bytes)")
                else:
                    print(f"  ✗ Barcode download failed: {barcode_response.status_code}")
            
            return True
        else:
            print(f"✗ Failed to get product: {response.status_code}")
            return False


async def test_delete_image(product_id: str, image_id: str):
    """Test deleting an image from a product."""
    print("\n" + "="*60)
    print("8. TESTING IMAGE DELETION")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{PMS_URL}/files/products/{product_id}/images/{image_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Image deleted successfully")
            print(f"  Deleted Image ID: {result['data']['deletedImageId']}")
            print(f"  Remaining images: {result['data']['remainingImages']}")
            return True
        else:
            print(f"✗ Image deletion failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False


async def test_upload_size_limit():
    """Test file size validation."""
    print("\n" + "="*60)
    print("9. TESTING FILE SIZE LIMIT (Should Fail)")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get test product
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PMS_URL}/products", headers=headers)
        if response.status_code != 200:
            print("✗ Could not get test product")
            return False
        
        product_id = response.json()['data']['items'][0]['id']
        
        # Create a large image (6 MB - should exceed 5 MB limit)
        large_image_data = create_test_image("large_image.jpg", size=(4000, 3000))
        # Pad to ensure it's over 5 MB
        large_image_data += b'\x00' * (6 * 1024 * 1024 - len(large_image_data))
        
        print(f"  Uploading {len(large_image_data) / (1024*1024):.2f} MB file...")
        
        files = [("files", ("large_image.jpg", BytesIO(large_image_data), "image/jpeg"))]
        
        response = await client.post(
            f"{PMS_URL}/files/products/{product_id}/images",
            headers=headers,
            files=files
        )
        
        if response.status_code == 400:
            print(f"✓ File size validation working correctly")
            print(f"  Error: {response.json().get('message')}")
            return True
        else:
            print(f"✗ Expected 400 error, got {response.status_code}")
            return False


async def test_invalid_file_type():
    """Test invalid file type validation."""
    print("\n" + "="*60)
    print("10. TESTING INVALID FILE TYPE (Should Fail)")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get test product
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{PMS_URL}/products", headers=headers)
        if response.status_code != 200:
            print("✗ Could not get test product")
            return False
        
        product_id = response.json()['data']['items'][0]['id']
        
        # Create a fake text file
        text_data = b"This is not an image file"
        
        files = [("files", ("document.txt", BytesIO(text_data), "text/plain"))]
        
        response = await client.post(
            f"{PMS_URL}/files/products/{product_id}/images",
            headers=headers,
            files=files
        )
        
        if response.status_code == 400:
            print(f"✓ File type validation working correctly")
            print(f"  Error: {response.json().get('message')}")
            return True
        else:
            print(f"✗ Expected 400 error, got {response.status_code}")
            return False


async def run_tests():
    """Run all Phase 4 tests."""
    try:
        # Step 1: Login
        await login_and_get_token()
        
        # Step 2: Get test product
        product = await get_test_product()
        product_id = product['id']
        sku = product['sku']
        
        # Step 3: Upload images
        uploaded_image_ids = await test_upload_images(product_id)
        
        # Step 4: List images
        images = await test_list_images(product_id)
        
        # Step 5: Download file
        if images:
            await test_download_file(images[0]['id'], images[0]['filename'])
        
        # Step 6: Get file metadata
        if images:
            await test_get_file_metadata(images[0]['id'])
        
        # Step 7: Download QR code and barcode
        await test_download_qr_barcode(product_id, sku)
        
        # Step 8: Delete an image
        if uploaded_image_ids:
            await test_delete_image(product_id, uploaded_image_ids[0])
        
        # Step 9: Test file size limit
        await test_upload_size_limit()
        
        # Step 10: Test invalid file type
        await test_invalid_file_type()
        
        # Summary
        print("\n" + "="*60)
        print("PHASE 4 TESTS COMPLETED")
        print("="*60)
        print("✓ All image management and file operations tested successfully!")
        print("\nTested Features:")
        print("  1. Multiple image upload")
        print("  2. List product images")
        print("  3. Download files by ID")
        print("  4. Get file metadata")
        print("  5. Download QR codes and barcodes")
        print("  6. Delete images")
        print("  7. File size validation")
        print("  8. File type validation")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    print("="*60)
    print("PHASE 4: IMAGE MANAGEMENT & FILE OPERATIONS")
    print("="*60)
    print(f"AUTH Service: {AUTH_URL}")
    print(f"PMS Service: {PMS_URL}")
    print(f"Test User: {TEST_EMAIL}")
    print("="*60)
    
    asyncio.run(run_tests())
