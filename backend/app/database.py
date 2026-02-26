"""Project X - MongoDB database connection and lifecycle."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Global database client and reference
client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Initialize MongoDB connection on app startup."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.projectx

    # Create indexes for performance
    await db.users.create_index("email", unique=True)
    await db.events.create_index("date")
    await db.events.create_index("is_active")
    await db.qr_codes.create_index([("user_id", 1), ("event_id", 1)])
    await db.qr_codes.create_index("token", unique=True)
    await db.payments.create_index("user_id")
    await db.payments.create_index("event_id")
    await db.scan_logs.create_index("scanned_at")
    await db.loyalty_points.create_index("user_id")

    print("[OK] Connected to MongoDB Atlas")


async def close_mongo_connection():
    """Close MongoDB connection on app shutdown."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


def get_database():
    """Get database reference for dependency injection."""
    return db
