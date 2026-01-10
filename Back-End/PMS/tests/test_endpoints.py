"""
API Endpoint Testing Script
Simple script to test all PMS service endpoints
"""

import httpx
import asyncio
import json
from typing import Dict, Optional


class PMSTestClient:
    """
    Test client for PMS service endpoints.
    """
    
    def __init__(self, base_url: str = "http://localhost:5002", auth_token: Optional[str] = None):
        """
        Initialize test client.
        
        Args:
            base_url: PMS service base URL
            auth_token: JWT access token for authenticated requests
        """
        self.base_url = base_url
        self.auth_token = auth_token
        self.results = []
    
    def get_headers(self, authenticated: bool = True) -> Dict:
        """
        Get request headers.
        
        Args:
            authenticated: Include Authorization header
        
        Returns:
            Dict: Request headers
        """
        headers = {"Content-Type": "application/json"}
        
        if authenticated and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        return headers
    
    async def test_endpoint(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        authenticated: bool = True,
        expected_status: int = 200
    ):
        """
        Test a single endpoint.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            data: Request body data
            authenticated: Require authentication
            expected_status: Expected HTTP status code
        """
        url = f"{self.base_url}{endpoint}"
        headers = self.get_headers(authenticated)
        
        print(f"\n{'='*60}")
        print(f"Testing: {method} {endpoint}")
        print(f"{'='*60}")
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                if method.upper() == "GET":
                    response = await client.get(url, headers=headers)
                elif method.upper() == "POST":
                    response = await client.post(url, headers=headers, json=data)
                elif method.upper() == "PUT":
                    response = await client.put(url, headers=headers, json=data)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, headers=headers)
                else:
                    print(f"❌ Unsupported method: {method}")
                    return
                
                status_match = response.status_code == expected_status
                status_icon = "✅" if status_match else "❌"
                
                print(f"\nStatus Code: {status_icon} {response.status_code} (Expected: {expected_status})")
                print(f"\nResponse:")
                print(json.dumps(response.json(), indent=2))
                
                self.results.append({
                    "endpoint": f"{method} {endpoint}",
                    "status_code": response.status_code,
                    "expected": expected_status,
                    "success": status_match
                })
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            self.results.append({
                "endpoint": f"{method} {endpoint}",
                "status_code": None,
                "expected": expected_status,
                "success": False,
                "error": str(e)
            })
    
    async def run_all_tests(self):
        """
        Run all endpoint tests.
        """
        print("\n" + "="*60)
        print("PMS SERVICE - ENDPOINT TESTING")
        print("="*60)
        
        # Health Check Tests (No Authentication)
        print("\n\n🏥 HEALTH CHECK ENDPOINTS")
        await self.test_endpoint("GET", "/health", authenticated=False)
        await self.test_endpoint("GET", "/health/ready", authenticated=False)
        await self.test_endpoint("GET", "/health/live", authenticated=False)
        
        # Root Endpoint
        print("\n\n🏠 ROOT ENDPOINT")
        await self.test_endpoint("GET", "/", authenticated=False)
        
        # If auth token provided, test authenticated endpoints
        if self.auth_token:
            print("\n\n📂 CATEGORY ENDPOINTS")
            print("Note: These tests require AUTH service to be running")
            
            # Categories
            await self.test_endpoint(
                "POST",
                "/api/v1/categories",
                data={"name": "Test Category", "code": "TEST", "description": "Test category"},
                expected_status=201
            )
            
            await self.test_endpoint("GET", "/api/v1/categories")
            
            # More tests can be added here
            print("\n\nℹ️  Add more endpoint tests as features are implemented")
        else:
            print("\n\n⚠️  Skipping authenticated endpoint tests (no auth token provided)")
            print("To test authenticated endpoints:")
            print("1. Get a token from AUTH service:")
            print("   POST http://localhost:5001/api/v1/auth/login")
            print("2. Run this script with --token parameter")
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        """
        Print test results summary.
        """
        print("\n\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.get("success", False))
        failed = total - passed
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n\nFailed Tests:")
            for result in self.results:
                if not result.get("success", False):
                    print(f"  - {result['endpoint']}")
                    if "error" in result:
                        print(f"    Error: {result['error']}")


async def main():
    """
    Main test function.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Test PMS Service Endpoints")
    parser.add_argument(
        "--url",
        default="http://localhost:5002",
        help="PMS service base URL (default: http://localhost:5002)"
    )
    parser.add_argument(
        "--token",
        help="JWT access token for authenticated requests"
    )
    
    args = parser.parse_args()
    
    client = PMSTestClient(base_url=args.url, auth_token=args.token)
    await client.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
