"""Project X - Authentication service (business logic layer)."""
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database
from app.models.user import (
    UserCreate, UserLogin, UserResponse, UserInDB, MembershipTier
)
from app.utils.security import hash_password, verify_password, create_access_token


async def register_user(user_data: UserCreate) -> dict:
    """Register a new user.

    Args:
        user_data: Registration data including name, email, password.

    Returns:
        Dict with access_token and user response.

    Raises:
        HTTPException 400: If email already exists.
    """
    db = get_database()

    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user document
    user_doc = UserInDB(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        membership_tier=MembershipTier.FREE,
        loyalty_points=0,
        total_spend=0.0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    result = await db.users.insert_one(user_doc.model_dump())
    user_id = str(result.inserted_id)

    # Generate JWT token
    token = create_access_token({"sub": user_id, "role": user_data.role.value})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            membership_tier=MembershipTier.FREE,
            loyalty_points=0,
            created_at=user_doc.created_at,
            is_active=True,
        ),
    }


async def login_user(login_data: UserLogin) -> dict:
    """Authenticate a user and return a JWT token.

    Args:
        login_data: Email and password.

    Returns:
        Dict with access_token and user response.

    Raises:
        HTTPException 401: If credentials are invalid.
    """
    db = get_database()

    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            role=user["role"],
            membership_tier=user.get("membership_tier", "free"),
            loyalty_points=user.get("loyalty_points", 0),
            created_at=user["created_at"],
            is_active=user.get("is_active", True),
        ),
    }


async def get_user_by_id(user_id: str) -> Optional[UserResponse]:
    """Get a user by their ID.

    Args:
        user_id: MongoDB ObjectId string.

    Returns:
        UserResponse or None.
    """
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return None

    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        membership_tier=user.get("membership_tier", "free"),
        loyalty_points=user.get("loyalty_points", 0),
        created_at=user["created_at"],
        is_active=user.get("is_active", True),
    )


async def get_all_users(skip: int = 0, limit: int = 50) -> list:
    """Get all users (admin use).

    Args:
        skip: Number of records to skip.
        limit: Maximum records to return.

    Returns:
        List of UserResponse objects.
    """
    db = get_database()
    users = []
    cursor = db.users.find().skip(skip).limit(limit).sort("created_at", -1)
    async for user in cursor:
        users.append(
            UserResponse(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                role=user["role"],
                membership_tier=user.get("membership_tier", "free"),
                loyalty_points=user.get("loyalty_points", 0),
                created_at=user["created_at"],
                is_active=user.get("is_active", True),
            )
        )
    return users


async def update_user_role(user_id: str, new_role: str) -> bool:
    """Update a user's role (admin only).

    Args:
        user_id: MongoDB ObjectId string.
        new_role: New role value.

    Returns:
        True if updated, False otherwise.
    """
    db = get_database()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


async def toggle_user_active(user_id: str) -> bool:
    """Toggle a user's active status (admin only)."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return False

    new_status = not user.get("is_active", True)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}}
    )
    return True
