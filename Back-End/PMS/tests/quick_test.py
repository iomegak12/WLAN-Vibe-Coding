"""
Quick endpoint test - Test QR and Barcode endpoints
"""

import httpx
import asyncio


async def test_endpoints():
    base_url = "http://localhost:5002/api/v1"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test health endpoint first
            print("Testing server connection...")
            health = await client.get(f"{base_url}/health", timeout=5.0)
            print(f"✓ Server is running: {health.status_code}")
            
            # Get products
            print("\nFetching products...")
            response = await client.get(f"{base_url}/products?limit=5", timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("data", {}).get("items", [])
                print(f"✓ Found {len(products)} products\n")
                
                if products:
                    for i, product in enumerate(products[:3], 1):
                        print(f"{i}. {product['name']} (SKU: {product['sku']})")
                        print(f"   ID: {product['id']}")
                        print(f"   Images: {len(product.get('images', []))} Unsplash images")
                        
                        # Test QR code
                        qr_url = f"{base_url}/products/{product['id']}/qr"
                        barcode_url = f"{base_url}/products/{product['id']}/barcode"
                        
                        print(f"   QR URL: {qr_url}")
                        print(f"   Barcode URL: {barcode_url}")
                        print()
                    
                    # Test actual endpoints with first product
                    test_id = products[0]['id']
                    print(f"Testing with product: {products[0]['name']} (ID: {test_id})")
                    
                    # Test QR
                    print(f"\n📱 Testing QR Code endpoint...")
                    qr_response = await client.get(f"{base_url}/products/{test_id}/qr", timeout=10.0)
                    print(f"   Status: {qr_response.status_code}")
                    print(f"   Content-Type: {qr_response.headers.get('content-type')}")
                    print(f"   Size: {len(qr_response.content)} bytes")
                    
                    # Test Barcode
                    print(f"\n🏷️  Testing Barcode endpoint...")
                    barcode_response = await client.get(f"{base_url}/products/{test_id}/barcode", timeout=10.0)
                    print(f"   Status: {barcode_response.status_code}")
                    print(f"   Content-Type: {barcode_response.headers.get('content-type')}")
                    print(f"   Size: {len(barcode_response.content)} bytes")
                    
                    if qr_response.status_code == 200 and barcode_response.status_code == 200:
                        print("\n✅ All endpoints working correctly!")
                    else:
                        print("\n⚠️  Some endpoints returned errors")
                else:
                    print("ℹ️  No products found. Create a product first.")
            else:
                print(f"❌ Failed to fetch products: {response.status_code}")
                print(response.text)
        
        except httpx.ConnectError:
            print("❌ Cannot connect to server at http://localhost:5002")
            print("   Make sure the server is running: uvicorn app.main:app --reload --port 5002")
        except Exception as e:
            print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_endpoints())
