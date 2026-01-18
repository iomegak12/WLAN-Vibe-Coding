"""
Unsplash API Utility
Fetch product images from Unsplash
"""

import httpx
from typing import List, Optional
from app.config.settings import Settings
from app.utils.logger import logger


class UnsplashService:
    """
    Service for fetching images from Unsplash API.
    """
    
    BASE_URL = "https://api.unsplash.com"
    
    def __init__(self):
        """Initialize Unsplash service with settings."""
        self.settings = Settings()
        self.access_key = self.settings.unsplash_access_key
        self.headers = {
            "Authorization": f"Client-ID {self.access_key}",
            "Accept-Version": "v1"
        }
    
    async def get_random_images(
        self,
        query: Optional[str] = None,
        count: int = 6,
        orientation: str = "landscape"
    ) -> List[dict]:
        """
        Get random images from Unsplash.
        
        Args:
            query: Search query for related images
            count: Number of images to fetch (default: 6)
            orientation: Image orientation (landscape, portrait, squarish)
        
        Returns:
            List of image URLs and metadata
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "count": min(count, 30),  # Max 30 per request
                    "orientation": orientation
                }
                
                if query:
                    params["query"] = query
                
                response = await client.get(
                    f"{self.BASE_URL}/photos/random",
                    headers=self.headers,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Unsplash API error: {response.status_code} - {response.text}")
                    return []
                
                photos = response.json()
                
                # Handle single photo response
                if isinstance(photos, dict):
                    photos = [photos]
                
                images = []
                for photo in photos:
                    images.append({
                        "id": photo.get("id"),
                        "url": photo.get("urls", {}).get("regular"),
                        "thumb": photo.get("urls", {}).get("thumb"),
                        "small": photo.get("urls", {}).get("small"),
                        "download_url": photo.get("links", {}).get("download"),
                        "author": photo.get("user", {}).get("name"),
                        "author_url": photo.get("user", {}).get("links", {}).get("html"),
                        "description": photo.get("description") or photo.get("alt_description"),
                        "width": photo.get("width"),
                        "height": photo.get("height")
                    })
                
                logger.info(f"Fetched {len(images)} images from Unsplash for query: {query}")
                return images
                
        except httpx.TimeoutException:
            logger.error("Unsplash API request timeout")
            return []
        except Exception as e:
            logger.error(f"Error fetching Unsplash images: {str(e)}")
            return []
    
    async def search_images(
        self,
        query: str,
        per_page: int = 6,
        page: int = 1,
        orientation: str = "landscape"
    ) -> List[dict]:
        """
        Search for images on Unsplash.
        
        Args:
            query: Search query
            per_page: Results per page (max 30)
            page: Page number
            orientation: Image orientation
        
        Returns:
            List of image URLs and metadata
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "query": query,
                    "per_page": min(per_page, 30),
                    "page": page,
                    "orientation": orientation
                }
                
                response = await client.get(
                    f"{self.BASE_URL}/search/photos",
                    headers=self.headers,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Unsplash search error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                photos = data.get("results", [])
                
                images = []
                for photo in photos:
                    images.append({
                        "id": photo.get("id"),
                        "url": photo.get("urls", {}).get("regular"),
                        "thumb": photo.get("urls", {}).get("thumb"),
                        "small": photo.get("urls", {}).get("small"),
                        "download_url": photo.get("links", {}).get("download"),
                        "author": photo.get("user", {}).get("name"),
                        "author_url": photo.get("user", {}).get("links", {}).get("html"),
                        "description": photo.get("description") or photo.get("alt_description"),
                        "width": photo.get("width"),
                        "height": photo.get("height")
                    })
                
                logger.info(f"Found {len(images)} images for search: {query}")
                return images
                
        except httpx.TimeoutException:
            logger.error("Unsplash search request timeout")
            return []
        except Exception as e:
            logger.error(f"Error searching Unsplash images: {str(e)}")
            return []
    
    async def get_product_images(
        self,
        product_name: str,
        brand: str,
        category: str,
        count: int = 6
    ) -> List[dict]:
        """
        Get product-related images from Unsplash.
        
        Args:
            product_name: Product name
            brand: Brand name
            category: Category name
            count: Number of images to fetch
        
        Returns:
            List of relevant product images
        """
        # Build search query with product context
        search_queries = [
            f"{brand} {product_name}",
            f"{category} {product_name}",
            product_name,
            f"{brand} {category}",
            category
        ]
        
        all_images = []
        images_per_query = max(1, count // 3)  # Split among first 3 queries
        
        for query in search_queries[:3]:
            images = await self.search_images(
                query=query,
                per_page=images_per_query,
                orientation="landscape"
            )
            all_images.extend(images)
            
            if len(all_images) >= count:
                break
        
        # If not enough images, try random with category
        if len(all_images) < count:
            remaining = count - len(all_images)
            random_images = await self.get_random_images(
                query=category,
                count=remaining,
                orientation="landscape"
            )
            all_images.extend(random_images)
        
        # Deduplicate by ID and limit to requested count
        seen_ids = set()
        unique_images = []
        for img in all_images:
            if img["id"] not in seen_ids:
                seen_ids.add(img["id"])
                unique_images.append(img)
                if len(unique_images) >= count:
                    break
        
        logger.info(
            f"Retrieved {len(unique_images)} unique images for product: "
            f"{product_name} ({brand}, {category})"
        )
        
        return unique_images[:count]
    
    async def download_image(self, url: str) -> Optional[bytes]:
        """
        Download image from URL.
        
        Args:
            url: Image URL
        
        Returns:
            Image bytes or None if failed
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=15.0)
                if response.status_code == 200:
                    return response.content
                logger.error(f"Failed to download image: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error downloading image: {str(e)}")
            return None
