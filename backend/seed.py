"""Project X - Database seed script.

Creates demo accounts for Admin, Staff, and User roles.
Run this script after starting MongoDB to populate demo credentials.

Usage:
    cd backend
    python seed.py
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_ACCOUNTS = [
    {
        "name": "Admin User",
        "email": "admin@projectx.com",
        "password": "Admin@123",
        "role": "admin",
        "membership_tier": "vip",
        "loyalty_points": 5000,
        "total_spend": 2500.00,
    },
    {
        "name": "Staff Member",
        "email": "staff@projectx.com",
        "password": "Staff@123",
        "role": "staff",
        "membership_tier": "gold",
        "loyalty_points": 2000,
        "total_spend": 500.00,
    },
    {
        "name": "Demo User",
        "email": "user@projectx.com",
        "password": "User@123",
        "role": "user",
        "membership_tier": "silver",
        "loyalty_points": 750,
        "total_spend": 150.00,
    },
]

DEMO_EVENTS = [
    {
        "title": "Neon Nights: VIP Launch Party",
        "description": "Exclusive launch event with premium DJ sets, neon cocktails, and VIP-only access zones. The ultimate nightlife experience.",
        "venue": "Club Quantum, Downtown",
        "date": datetime(2026, 3, 15, 22, 0),
        "capacity": 300,
        "price": 49.99,
        "is_active": True,
        "attendee_count": 87,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "title": "Techno Underground",
        "description": "A deep techno experience in an underground warehouse. Featuring international artists and immersive light shows.",
        "venue": "Warehouse 9, Industrial District",
        "date": datetime(2026, 3, 22, 23, 0),
        "capacity": 500,
        "price": 35.00,
        "is_active": True,
        "attendee_count": 213,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "title": "College Fest: Pulse 2026",
        "description": "The biggest college music festival of the year. Live bands, EDM stage, food trucks, and more.",
        "venue": "University Amphitheatre",
        "date": datetime(2026, 4, 5, 17, 0),
        "capacity": 2000,
        "price": 0,
        "is_active": True,
        "attendee_count": 542,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "title": "Midnight Masquerade",
        "description": "An elegant masked ball with live orchestra, premium spirits, and a mysterious atmosphere.",
        "venue": "Grand Ballroom, Ritz Hotel",
        "date": datetime(2026, 4, 12, 21, 0),
        "capacity": 150,
        "price": 99.99,
        "is_active": False,
        "attendee_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]


async def seed():
    """Seed the database with demo data."""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/projectx")
    print(f"\n{'='*50}")
    print("  PROJECT X — Database Seeder")
    print(f"{'='*50}")
    print(f"\nConnecting to MongoDB...")

    print("Starting connection...")

    client = AsyncIOMotorClient(mongo_uri)
    db = client.projectx

    # Test connection
    try:
        await client.admin.command("ping")
        print("[OK] Connected successfully\n")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        print("\nMake sure your MONGO_URI in .env is correct.")
        return

    # --- Seed Users ---
    print("\n--- Seeding Users ---")
    for account in DEMO_ACCOUNTS:
        existing = await db.users.find_one({"email": account["email"]})
        if existing:
            print(f"  [-] {account['email']} already exists (skipped)")
            continue

        user_doc = {
            "name": account["name"],
            "email": account["email"],
            "password_hash": pwd_context.hash(account["password"]),
            "role": account["role"],
            "membership_tier": account["membership_tier"],
            "loyalty_points": account["loyalty_points"],
            "total_spend": account["total_spend"],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db.users.insert_one(user_doc)
        print(f"  [+] Created {account['role']:6s} -> {account['email']} / {account['password']}")

    # --- Seed Events ---
    print("\n--- Seeding Events ---")
    existing_count = await db.events.count_documents({})
    if existing_count > 0:
        print(f"  [-] {existing_count} events already exist (skipped)")
    else:
        for event in DEMO_EVENTS:
            await db.events.insert_one(event)
            status = "ACTIVE" if event["is_active"] else "DRAFT"
            price = f"${event['price']:.2f}" if event["price"] > 0 else "FREE"
            print(f"  [+] {event['title']} [{status}] {price}")

    # --- Create indexes ---
    print("\n--- Creating Indexes ---")
    await db.users.create_index("email", unique=True)
    await db.events.create_index("date")
    await db.events.create_index("is_active")
    await db.qr_codes.create_index("token", unique=True)
    await db.payments.create_index("user_id")
    await db.scan_logs.create_index("scanned_at")
    print("  [+] All indexes created")

    # --- Summary ---
    user_count = await db.users.count_documents({})
    event_count = await db.events.count_documents({})
    print(f"\n{'='*50}")
    print(f"  Seed complete!")
    print(f"  Users: {user_count}  |  Events: {event_count}")
    print(f"{'='*50}")
    print(f"\n  Demo Credentials:")
    print(f"  +--------------------------------------------+")
    print(f"  |  Admin  -> admin@projectx.com / Admin@123   |")
    print(f"  |  Staff  -> staff@projectx.com / Staff@123   |")
    print(f"  |  User   -> user@projectx.com  / User@123    |")
    print(f"  +--------------------------------------------+")
    print()

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
