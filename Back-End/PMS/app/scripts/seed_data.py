"""
Seed Data Script
Loads sample data into the database for testing and development
"""

from datetime import datetime
from bson import ObjectId
from app.config.database import Database
from app.utils.logger import logger


async def load_seed_data() -> None:
    """
    Load seed data into the database.
    Only loads if collections are empty.
    """
    logger.info("Starting seed data loading...")
    
    try:
        db = Database.get_database()
        
        # Check if data already exists
        categories_count = await db.categories.count_documents({})
        
        if categories_count > 0:
            logger.info("Seed data already exists. Skipping seed data loading.")
            return
        
        # Load categories
        category_ids = await _load_categories(db)
        
        # Load subcategories
        subcategory_ids = await _load_subcategories(db, category_ids)
        
        # Load products
        await _load_products(db, category_ids, subcategory_ids)
        
        logger.info("Seed data loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load seed data: {str(e)}")
        # Don't raise - seed data is optional


async def _load_categories(db) -> dict:
    """
    Load sample categories.
    
    Returns:
        dict: Category IDs mapped by category code
    """
    # Sample user ID for createdBy (replace with actual user ID from AUTH service)
    admin_user_id = ObjectId()
    
    categories = [
        {
            "_id": ObjectId(),
            "name": "Electronics",
            "code": "ELEC",
            "description": "Electronic devices and accessories",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Networking",
            "code": "NETW",
            "description": "Networking equipment and cables",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Hardware",
            "code": "HARD",
            "description": "Computer hardware components",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.categories.insert_many(categories)
    logger.info(f"Loaded {len(categories)} categories")
    
    # Return mapping of code -> ID
    return {cat["code"]: cat["_id"] for cat in categories}


async def _load_subcategories(db, category_ids: dict) -> dict:
    """
    Load sample subcategories.
    
    Args:
        category_ids: Category IDs mapped by code
    
    Returns:
        dict: Subcategory IDs mapped by subcategory code
    """
    admin_user_id = ObjectId()
    
    subcategories = [
        # Electronics subcategories
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "name": "Routers",
            "code": "ROUTER",
            "description": "Wireless and wired routers",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "name": "Switches",
            "code": "SWITCH",
            "description": "Network switches",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "name": "Access Points",
            "code": "ACCPNT",
            "description": "Wireless access points",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        # Networking subcategories
        {
            "_id": ObjectId(),
            "categoryId": category_ids["NETW"],
            "name": "Cables",
            "code": "CABLE",
            "description": "Network cables and connectors",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["NETW"],
            "name": "Adapters",
            "code": "ADAPTR",
            "description": "Network adapters and converters",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        # Hardware subcategories
        {
            "_id": ObjectId(),
            "categoryId": category_ids["HARD"],
            "name": "Storage",
            "code": "STORAG",
            "description": "Hard drives and SSDs",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.subcategories.insert_many(subcategories)
    logger.info(f"Loaded {len(subcategories)} subcategories")
    
    return {subcat["code"]: subcat["_id"] for subcat in subcategories}


async def _load_products(db, category_ids: dict, subcategory_ids: dict) -> None:
    """
    Load sample products.
    
    Args:
        category_ids: Category IDs mapped by code
        subcategory_ids: Subcategory IDs mapped by code
    """
    admin_user_id = ObjectId()
    
    products = [
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "subCategoryId": subcategory_ids["ROUTER"],
            "name": "Cisco Router 2900 Series",
            "sku": "ELEC-ROUTER-CISCO-0001",
            "brand": "Cisco",
            "model": "2900",
            "description": "Enterprise-grade router with advanced security features",
            "specifications": {
                "ports": "4x Gigabit Ethernet",
                "throughput": "100 Mbps",
                "vpn": "Yes",
                "warranty": "3 years"
            },
            "unitOfMeasure": "piece",
            "weight": 2.5,
            "dimensions": {
                "length": 44.0,
                "width": 43.6,
                "height": 4.4,
                "unit": "cm"
            },
            "price": 45000.00,
            "warrantyPeriod": "3 years",
            "productImage": None,
            "qrCode": None,
            "barcode": None,
            "status": "Active",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "subCategoryId": subcategory_ids["ROUTER"],
            "name": "TP-Link Archer C6 AC1200",
            "sku": "ELEC-ROUTER-TPLINK-0001",
            "brand": "TP-Link",
            "model": "Archer C6",
            "description": "Dual-band wireless router for home and small office",
            "specifications": {
                "frequency": "2.4GHz + 5GHz",
                "speed": "1200 Mbps",
                "antennas": "4x External",
                "ports": "4x LAN, 1x WAN"
            },
            "unitOfMeasure": "piece",
            "weight": 0.5,
            "dimensions": {
                "length": 23.0,
                "width": 14.4,
                "height": 3.2,
                "unit": "cm"
            },
            "price": 2500.00,
            "warrantyPeriod": "1 year",
            "productImage": None,
            "qrCode": None,
            "barcode": None,
            "status": "Active",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["ELEC"],
            "subCategoryId": subcategory_ids["SWITCH"],
            "name": "Cisco Catalyst 2960-X Series",
            "sku": "ELEC-SWITCH-CISCO-0001",
            "brand": "Cisco",
            "model": "2960-X",
            "description": "24-port managed switch with PoE support",
            "specifications": {
                "ports": "24x Gigabit Ethernet",
                "poe": "Yes (PoE+)",
                "switching_capacity": "104 Gbps",
                "management": "Managed"
            },
            "unitOfMeasure": "piece",
            "weight": 4.0,
            "dimensions": {
                "length": 44.5,
                "width": 25.2,
                "height": 4.4,
                "unit": "cm"
            },
            "price": 65000.00,
            "warrantyPeriod": "Lifetime",
            "productImage": None,
            "qrCode": None,
            "barcode": None,
            "status": "Active",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["NETW"],
            "subCategoryId": subcategory_ids["CABLE"],
            "name": "Cat6 Ethernet Cable 10m",
            "sku": "NETW-CABLE-GENRIC-0001",
            "brand": "Generic",
            "model": "CAT6-10M",
            "description": "High-speed Cat6 ethernet cable, 10 meters",
            "specifications": {
                "type": "Cat6 UTP",
                "length": "10 meters",
                "color": "Blue",
                "connector": "RJ45"
            },
            "unitOfMeasure": "piece",
            "weight": 0.2,
            "dimensions": {
                "length": 1000.0,
                "width": 0.6,
                "height": 0.6,
                "unit": "cm"
            },
            "price": 150.00,
            "warrantyPeriod": "6 months",
            "productImage": None,
            "qrCode": None,
            "barcode": None,
            "status": "Active",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "categoryId": category_ids["HARD"],
            "subCategoryId": subcategory_ids["STORAG"],
            "name": "Samsung 870 EVO SSD 1TB",
            "sku": "HARD-STORAG-SAMSUN-0001",
            "brand": "Samsung",
            "model": "870 EVO",
            "description": "2.5-inch SATA III SSD with 1TB capacity",
            "specifications": {
                "capacity": "1TB",
                "interface": "SATA III 6Gb/s",
                "read_speed": "560 MB/s",
                "write_speed": "530 MB/s",
                "form_factor": "2.5 inch"
            },
            "unitOfMeasure": "piece",
            "weight": 0.05,
            "dimensions": {
                "length": 10.0,
                "width": 7.0,
                "height": 0.7,
                "unit": "cm"
            },
            "price": 8500.00,
            "warrantyPeriod": "5 years",
            "productImage": None,
            "qrCode": None,
            "barcode": None,
            "status": "Active",
            "isActive": True,
            "isDeleted": False,
            "createdBy": admin_user_id,
            "updatedBy": admin_user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.products.insert_many(products)
    logger.info(f"Loaded {len(products)} products")
