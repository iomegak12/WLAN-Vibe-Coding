"""
Test Data Generator for PMS
Generates 100 products with diverse categories, subcategories, and attributes
"""

import random
import httpx
import asyncio
from datetime import datetime, timedelta

# API Configuration
BASE_URL = "http://localhost:5002/api/v1"
AUTH_SERVICE_URL = "http://localhost:5001/api/v1/auth"

# Login credentials
LOGIN_EMAIL = "jtdhamodharan@gmail.com"
LOGIN_PASSWORD = "Prestige123!"

# Will be populated after login
AUTH_TOKEN = None
HEADERS = {
    "Content-Type": "application/json"
}

# Data Templates
CATEGORIES = [
    {"name": "Electronics", "description": "Electronic devices and accessories"},
    {"name": "Clothing", "description": "Fashion and apparel"},
    {"name": "Home & Kitchen", "description": "Home appliances and kitchenware"},
    {"name": "Sports & Outdoors", "description": "Sports equipment and outdoor gear"},
    {"name": "Books & Media", "description": "Books, movies, and music"},
    {"name": "Health & Beauty", "description": "Health products and cosmetics"},
    {"name": "Toys & Games", "description": "Toys and gaming products"},
    {"name": "Automotive", "description": "Auto parts and accessories"},
]

SUBCATEGORIES = {
    "Electronics": [
        {"name": "Smartphones", "description": "Mobile phones and accessories"},
        {"name": "Laptops", "description": "Portable computers"},
        {"name": "Tablets", "description": "Tablet devices"},
        {"name": "Audio", "description": "Headphones, speakers, and audio equipment"},
    ],
    "Clothing": [
        {"name": "Men's Wear", "description": "Clothing for men"},
        {"name": "Women's Wear", "description": "Clothing for women"},
        {"name": "Kids Wear", "description": "Clothing for children"},
        {"name": "Footwear", "description": "Shoes and sandals"},
    ],
    "Home & Kitchen": [
        {"name": "Cookware", "description": "Pots, pans, and cooking utensils"},
        {"name": "Appliances", "description": "Kitchen appliances"},
        {"name": "Furniture", "description": "Home furniture"},
        {"name": "Decor", "description": "Home decoration items"},
    ],
    "Sports & Outdoors": [
        {"name": "Fitness", "description": "Fitness equipment"},
        {"name": "Camping", "description": "Camping gear"},
        {"name": "Team Sports", "description": "Sports equipment"},
        {"name": "Water Sports", "description": "Water sports gear"},
    ],
    "Books & Media": [
        {"name": "Fiction", "description": "Fiction books"},
        {"name": "Non-Fiction", "description": "Non-fiction books"},
        {"name": "Movies", "description": "Movies and DVDs"},
        {"name": "Music", "description": "Music CDs and vinyl"},
    ],
    "Health & Beauty": [
        {"name": "Skincare", "description": "Skincare products"},
        {"name": "Makeup", "description": "Cosmetics and makeup"},
        {"name": "Supplements", "description": "Health supplements"},
        {"name": "Personal Care", "description": "Personal care items"},
    ],
    "Toys & Games": [
        {"name": "Action Figures", "description": "Action figures and collectibles"},
        {"name": "Board Games", "description": "Board games"},
        {"name": "Puzzles", "description": "Puzzles and brain teasers"},
        {"name": "Educational", "description": "Educational toys"},
    ],
    "Automotive": [
        {"name": "Parts", "description": "Auto parts"},
        {"name": "Accessories", "description": "Car accessories"},
        {"name": "Tools", "description": "Automotive tools"},
        {"name": "Care", "description": "Car care products"},
    ],
}

BRANDS = [
    "Samsung", "Apple", "Sony", "LG", "Dell", "HP", "Lenovo", "Asus",
    "Nike", "Adidas", "Puma", "Reebok", "Levi's", "H&M", "Zara",
    "Philips", "Panasonic", "Bosch", "Whirlpool", "KitchenAid",
    "Wilson", "Spalding", "Coleman", "The North Face", "Decathlon",
    "Penguin", "HarperCollins", "Universal", "Warner Bros",
    "L'Oreal", "Nivea", "Dove", "Maybelline", "Olay",
    "Lego", "Hasbro", "Mattel", "Fisher-Price", "Nerf",
    "Michelin", "Bosch", "3M", "Castrol", "Shell"
]

PRODUCT_PREFIXES = {
    "Electronics": ["Smart", "Pro", "Ultra", "Plus", "Max", "Elite", "Premium"],
    "Clothing": ["Classic", "Modern", "Casual", "Formal", "Sport", "Trendy"],
    "Home & Kitchen": ["Deluxe", "Essential", "Professional", "Compact", "Multi"],
    "Sports & Outdoors": ["Athletic", "Professional", "Training", "Competition", "Outdoor"],
    "Books & Media": ["The", "A", "Complete", "Ultimate", "Essential"],
    "Health & Beauty": ["Natural", "Advanced", "Daily", "Premium", "Organic"],
    "Toys & Games": ["Super", "Mega", "Ultimate", "Classic", "Deluxe"],
    "Automotive": ["Heavy-Duty", "Premium", "Professional", "Standard", "High-Performance"],
}

PRODUCT_SUFFIXES = {
    "Smartphones": ["Series X", "Pro", "Lite", "Plus", "Max", "Mini"],
    "Laptops": ["Book", "Pad", "Pro", "Air", "Elite"],
    "Tablets": ["Tab", "Slate", "Pad", "Note"],
    "Audio": ["Headphones", "Earbuds", "Speaker", "System"],
    "Men's Wear": ["Shirt", "Pants", "Jacket", "Jeans", "T-Shirt"],
    "Women's Wear": ["Dress", "Top", "Skirt", "Blouse", "Pants"],
    "Kids Wear": ["Set", "Outfit", "Combo", "Collection"],
    "Footwear": ["Sneakers", "Boots", "Sandals", "Shoes"],
    "Cookware": ["Set", "Pan", "Pot", "Utensil Kit"],
    "Appliances": ["Blender", "Mixer", "Processor", "Cooker"],
    "Furniture": ["Chair", "Table", "Sofa", "Cabinet"],
    "Decor": ["Lamp", "Vase", "Frame", "Clock"],
    "Fitness": ["Dumbbells", "Mat", "Bench", "Band"],
    "Camping": ["Tent", "Bag", "Stove", "Lantern"],
    "Team Sports": ["Ball", "Net", "Goal", "Kit"],
    "Water Sports": ["Board", "Vest", "Paddle", "Fins"],
    "Fiction": ["Novel", "Thriller", "Mystery", "Adventure"],
    "Non-Fiction": ["Guide", "Biography", "History", "Encyclopedia"],
    "Movies": ["Collection", "Series", "Edition", "Box Set"],
    "Music": ["Album", "Collection", "Greatest Hits", "Live"],
    "Skincare": ["Cream", "Serum", "Lotion", "Cleanser"],
    "Makeup": ["Kit", "Palette", "Set", "Collection"],
    "Supplements": ["Vitamins", "Protein", "Formula", "Complex"],
    "Personal Care": ["Kit", "Set", "Pack", "Bundle"],
    "Action Figures": ["Figure", "Set", "Collection", "Pack"],
    "Board Games": ["Game", "Deluxe Edition", "Strategy Game"],
    "Puzzles": ["Puzzle", "3D Puzzle", "Jigsaw"],
    "Educational": ["Learning Kit", "STEM Set", "Building Blocks"],
    "Parts": ["Filter", "Belt", "Brake Pads", "Spark Plugs"],
    "Accessories": ["Cover", "Mat", "Organizer", "Holder"],
    "Tools": ["Wrench Set", "Screwdriver Kit", "Toolbox"],
    "Care": ["Polish", "Wax", "Cleaner", "Protectant"],
}

DESCRIPTIONS = [
    "High-quality product with excellent durability",
    "Perfect for everyday use and special occasions",
    "Designed with premium materials for long-lasting performance",
    "Innovative design meets practical functionality",
    "Trusted by professionals worldwide",
    "Best-in-class quality at an affordable price",
    "Combines style and performance seamlessly",
    "Engineered for optimal performance and reliability",
    "Ideal choice for both beginners and experts",
    "Features cutting-edge technology and sleek design",
]


class DataGenerator:
    def __init__(self):
        self.category_map = {}  # Store category_code -> category_id
        self.subcategory_map = {}  # Store subcategory_code -> subcategory_id
        self.created_products = 0
        self.auth_token = None

    async def login(self, client: httpx.AsyncClient) -> bool:
        """Login to AUTH service and get JWT token"""
        try:
            print("🔐 Logging in to AUTH service...")
            response = await client.post(
                f"{AUTH_SERVICE_URL}/login",
                json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            # Try different possible response structures
            if "data" in data and "tokens" in data["data"] and "accessToken" in data["data"]["tokens"]:
                self.auth_token = data["data"]["tokens"]["accessToken"]
            elif "data" in data and "accessToken" in data["data"]:
                self.auth_token = data["data"]["accessToken"]
            elif "data" in data and "token" in data["data"]:
                self.auth_token = data["data"]["token"]
            elif "accessToken" in data:
                self.auth_token = data["accessToken"]
            elif "token" in data:
                self.auth_token = data["token"]
            else:
                print(f"✗ Unexpected response structure: {data}")
                return False
            
            print(f"✓ Login successful! Token obtained.\n")
            return True
        except Exception as e:
            print(f"✗ Login failed: {e}")
            print("⚠️  Make sure AUTH service is running at http://localhost:5001")
            return False

    def get_headers(self):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }

    async def get_or_create_category(self, client: httpx.AsyncClient, category_data: dict) -> tuple:
        """Get existing category or create new one"""
        try:
            # Try to create first
            response = await client.post(
                f"{BASE_URL}/categories",
                json=category_data,
                headers=self.get_headers(),
                timeout=30.0
            )
            
            if response.status_code == 201:
                data = response.json()
                category = data.get("data", data)
                category_id = category.get("_id") or category.get("id")
                category_code = category.get("code")
                print(f"✓ Created category: {category_data['name']} (ID: {category_id}, Code: {category_code})")
                return category_id, category_code
            elif response.status_code == 409:
                # Category exists, fetch it
                print(f"⚠ Category {category_data['name']} already exists, fetching...")
                get_response = await client.get(
                    f"{BASE_URL}/categories",
                    headers=self.get_headers(),
                    timeout=30.0
                )
                get_response.raise_for_status()
                categories_data = get_response.json()
                
                # Debug: print the response structure
                print(f"  DEBUG: Response structure: {list(categories_data.keys())}")
                
                # Try different response structures
                categories_list = categories_data.get("data", {})
                if isinstance(categories_list, dict):
                    categories_list = categories_list.get("categories", categories_list.get("items", []))
                elif isinstance(categories_list, list):
                    pass
                else:
                    categories_list = []
                
                # If still empty, try top-level categories key
                if not categories_list:
                    categories_list = categories_data.get("categories", [])
                
                print(f"  DEBUG: Found {len(categories_list)} categories in response")
                
                for cat in categories_list:
                    if cat.get("name") == category_data["name"]:
                        category_id = cat.get("_id") or cat.get("id")
                        category_code = cat.get("code")
                        print(f"✓ Found category: {category_data['name']} (ID: {category_id}, Code: {category_code})")
                        return category_id, category_code
                
                print(f"✗ Failed to find existing category {category_data['name']}")
                return None, None
            else:
                response.raise_for_status()
                return None, None
        except Exception as e:
            print(f"✗ Failed to get/create category {category_data['name']}: {e}")
            return None, None

    async def get_or_create_subcategory(self, client: httpx.AsyncClient, subcategory_data: dict) -> tuple:
        """Get existing subcategory or create new one"""
        try:
            # Try to create first
            response = await client.post(
                f"{BASE_URL}/subcategories",
                json=subcategory_data,
                headers=self.get_headers(),
                timeout=30.0
            )
            
            if response.status_code == 201:
                data = response.json()
                subcategory = data.get("data", data)
                subcategory_id = subcategory.get("_id") or subcategory.get("id")
                subcategory_code = subcategory.get("code")
                print(f"  ✓ Created subcategory: {subcategory_data['name']} (ID: {subcategory_id}, Code: {subcategory_code})")
                return subcategory_id, subcategory_code
            elif response.status_code == 409:
                # Subcategory exists, fetch it
                print(f"  ⚠ Subcategory {subcategory_data['name']} already exists, fetching...")
                get_response = await client.get(
                    f"{BASE_URL}/subcategories?categoryId={subcategory_data['categoryId']}",
                    headers=self.get_headers(),
                    timeout=30.0
                )
                get_response.raise_for_status()
                subcategories_data = get_response.json()
                
                # Debug: print the response structure
                print(f"    DEBUG: Response structure: {list(subcategories_data.keys())}")
                
                # Try different response structures
                subcategories_list = subcategories_data.get("data", {})
                if isinstance(subcategories_list, dict):
                    subcategories_list = subcategories_list.get("subCategories", subcategories_list.get("subcategories", subcategories_list.get("items", [])))
                elif isinstance(subcategories_list, list):
                    pass
                else:
                    subcategories_list = []
                
                # If still empty, try top-level subcategories key
                if not subcategories_list:
                    subcategories_list = subcategories_data.get("subCategories", subcategories_data.get("subcategories", []))
                
                print(f"    DEBUG: Found {len(subcategories_list)} subcategories in response")
                
                for subcat in subcategories_list:
                    if subcat.get("name") == subcategory_data["name"]:
                        subcategory_id = subcat.get("_id") or subcat.get("id")
                        subcategory_code = subcat.get("code")
                        print(f"  ✓ Found subcategory: {subcategory_data['name']} (ID: {subcategory_id}, Code: {subcategory_code})")
                        return subcategory_id, subcategory_code
                
                print(f"  ✗ Failed to find existing subcategory {subcategory_data['name']}")
                return None, None
            else:
                response.raise_for_status()
                return None, None
        except Exception as e:
            print(f"  ✗ Failed to get/create subcategory {subcategory_data['name']}: {e}")
            return None, None

    async def create_product(self, client: httpx.AsyncClient, product_data: dict) -> bool:
        """Create a product"""
        try:
            response = await client.post(
                f"{BASE_URL}/products",
                json=product_data,
                headers=self.get_headers(),
                timeout=30.0
            )
            
            if response.status_code == 201:
                data = response.json()
                # Extract product data
                product = data.get("data", data)
                sku = product.get("sku", "N/A")
                
                self.created_products += 1
                print(f"  ✓ [{self.created_products}/100] Product: {product_data['name']} (SKU: {sku})")
                return True
            else:
                # Show validation errors for debugging
                error_data = response.json()
                print(f"  ✗ Failed to create product {product_data['name']}: {response.status_code}")
                if 'detail' in error_data:
                    print(f"     Validation errors: {error_data['detail']}")
                elif 'message' in error_data:
                    print(f"     Error: {error_data['message']}")
                return False
        except Exception as e:
            print(f"  ✗ Failed to create product {product_data['name']}: {e}")
            return False

    def generate_product_name(self, category_name: str, subcategory_name: str, brand: str) -> str:
        """Generate a realistic product name"""
        prefix = random.choice(PRODUCT_PREFIXES.get(category_name, ["Quality"]))
        suffix = random.choice(PRODUCT_SUFFIXES.get(subcategory_name, ["Product"]))
        
        # Different naming patterns
        patterns = [
            f"{brand} {prefix} {suffix}",
            f"{brand} {suffix} {prefix}",
            f"{prefix} {brand} {suffix}",
            f"{brand} {suffix}",
        ]
        return random.choice(patterns)

    def generate_price(self, category_name: str) -> float:
        """Generate realistic price based on category"""
        price_ranges = {
            "Electronics": (299, 2499),
            "Clothing": (19, 199),
            "Home & Kitchen": (29, 899),
            "Sports & Outdoors": (39, 499),
            "Books & Media": (9, 99),
            "Health & Beauty": (14, 149),
            "Toys & Games": (12, 199),
            "Automotive": (24, 499),
        }
        min_price, max_price = price_ranges.get(category_name, (10, 500))
        return round(random.uniform(min_price, max_price), 2)

    def generate_stock(self) -> int:
        """Generate realistic stock quantity"""
        # 70% well-stocked, 20% low stock, 10% out of stock
        rand = random.random()
        if rand < 0.7:
            return random.randint(50, 500)
        elif rand < 0.9:
            return random.randint(1, 15)
        else:
            return 0

    async def generate_all_data(self):
        """Generate all categories, subcategories, and products"""
        async with httpx.AsyncClient() as client:
            # Login first
            if not await self.login(client):
                return
            
            print("\n" + "="*60)
            print("STARTING DATA GENERATION")
            print("="*60 + "\n")

            # Step 1: Create Categories
            print("STEP 1: Creating Categories...")
            print("-" * 60)
            for category_data in CATEGORIES:
                category_id, category_code = await self.get_or_create_category(client, category_data)
                if category_id:
                    self.category_map[category_data["name"]] = {
                        "id": category_id,
                        "code": category_code
                    }
            print(f"\n✓ Created {len(self.category_map)} categories\n")

            # Step 2: Create Subcategories
            print("STEP 2: Creating Subcategories...")
            print("-" * 60)
            for category_name, subcategories in SUBCATEGORIES.items():
                if category_name in self.category_map:
                    print(f"\nCategory: {category_name}")
                    for subcategory_data in subcategories:
                        subcategory_payload = {
                            **subcategory_data,
                            "categoryId": self.category_map[category_name]["id"]
                        }
                        subcategory_id, subcategory_code = await self.get_or_create_subcategory(
                            client, subcategory_payload
                        )
                        if subcategory_id:
                            key = f"{category_name}:{subcategory_data['name']}"
                            self.subcategory_map[key] = {
                                "id": subcategory_id,
                                "code": subcategory_code,
                                "category_code": self.category_map[category_name]["code"]
                            }
            print(f"\n✓ Created {len(self.subcategory_map)} subcategories\n")

            # Step 3: Create 100 Products
            print("STEP 3: Creating 100 Products...")
            print("-" * 60)
            
            # Prepare combinations
            combinations = []
            for key, subcat_info in self.subcategory_map.items():
                category_name, subcategory_name = key.split(":")
                combinations.append({
                    "category_name": category_name,
                    "subcategory_name": subcategory_name,
                    "category_id": self.category_map[category_name]["id"],
                    "subcategory_id": subcat_info["id"],
                })

            # Generate 100 products
            for i in range(100):
                combo = random.choice(combinations)
                brand = random.choice(BRANDS)
                
                product_data = {
                    "name": self.generate_product_name(
                        combo["category_name"],
                        combo["subcategory_name"],
                        brand
                    ),
                    "description": random.choice(DESCRIPTIONS),
                    "categoryId": combo["category_id"],
                    "subCategoryId": combo["subcategory_id"],
                    "brand": brand,
                    "unitPrice": self.generate_price(combo["category_name"]),
                    "currentStock": self.generate_stock(),
                    "lowStockThreshold": random.randint(5, 20),
                    "reorderPoint": random.randint(10, 30),
                    "reorderQuantity": random.randint(50, 200),
                }

                await self.create_product(client, product_data)
                
                # Small delay to avoid overwhelming the server
                await asyncio.sleep(0.1)

            print("\n" + "="*60)
            print("DATA GENERATION COMPLETE!")
            print("="*60)
            print(f"\n📊 Summary:")
            print(f"   Categories: {len(self.category_map)}")
            print(f"   Subcategories: {len(self.subcategory_map)}")
            print(f"   Products: {self.created_products}/100")
            print("\n" + "="*60 + "\n")


async def main():
    print("\n" + "="*60)
    print("PMS TEST DATA GENERATOR")
    print("="*60)
    print(f"\n📧 Using credentials: {LOGIN_EMAIL}")
    print(f"🔗 AUTH Service: {AUTH_SERVICE_URL}")
    print(f"🔗 PMS Service: {BASE_URL}")
    print("\n")
    
    try:
        input("Press Enter to start generation (or Ctrl+C to cancel)...")
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        return
    
    generator = DataGenerator()
    await generator.generate_all_data()


if __name__ == "__main__":
    asyncio.run(main())
