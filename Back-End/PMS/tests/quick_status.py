"""Quick status check"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://admin:password123@localhost:27017/pms_db?authSource=admin')
    db = client['pms_db']
    
    with_images = await db.products.count_documents({
        'isDeleted': False,
        'images': {'$exists': True, '$ne': []}
    })
    
    without_images = await db.products.count_documents({
        'isDeleted': False,
        '$or': [
            {'images': {'$exists': False}},
            {'images': []},
            {'images': {'$size': 0}}
        ]
    })
    
    print(f"\n✅ Products WITH images: {with_images}")
    print(f"❌ Products WITHOUT images: {without_images}")
    print(f"📊 Total: {with_images + without_images}")
    print(f"📈 Progress: {with_images}/{with_images + without_images} ({with_images/(with_images + without_images)*100:.1f}%)\n")
    
    client.close()

asyncio.run(check())
