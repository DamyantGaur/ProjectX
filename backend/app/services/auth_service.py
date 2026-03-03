"""Project X - Authentication service (business logic layer)."""
import re
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database
from app.models.user import (
    UserCreate, UserLogin, UserResponse, UserInDB, MembershipTier
)
from app.utils.security import hash_password, verify_password, create_access_token


def validate_password_strength(password: str) -> None:
    """Validate password meets minimum security requirements.

    Raises:
        HTTPException 400: If password does not meet requirements.
    """
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("an uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("a lowercase letter")
    if not re.search(r'\d', password):
        errors.append("a digit")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("a special character")
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must contain: {', '.join(errors)}",
        )


def sanitize_email(email: str) -> str:
    """Normalize and sanitize email input."""
    return email.strip().lower()


async def register_user(user_data: UserCreate) -> dict:
    """Register a new user (public registration - user role only).

    Args:
        user_data: Registration data including name, email, password.

    Returns:
        Dict with access_token and user response.

    Raises:
        HTTPException 400: If email already exists.
    """
    db = get_database()

    # SECURITY: Force role to "user" for public registration.
    # Staff and admin accounts can only be created by an admin.
    from app.models.user import UserRole
    forced_role = UserRole.USER

    # Validate and sanitize input
    validate_password_strength(user_data.password)
    clean_email = sanitize_email(user_data.email)
    clean_name = user_data.name.strip()

    if len(clean_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at least 2 characters",
        )

    # Check if email already exists
    existing = await db.users.find_one({"email": clean_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user document
    user_doc = UserInDB(
        name=clean_name,
        email=clean_email,
        password_hash=hash_password(user_data.password),
        role=forced_role,
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
    token = create_access_token({"sub": user_id, "role": forced_role.value})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user_id,
            name=clean_name,
            email=clean_email,
            role=forced_role,
            membership_tier=MembershipTier.FREE,
            loyalty_points=0,
            created_at=user_doc.created_at,
            is_active=True,
        ),
    }


async def create_staff_user(name: str, email: str, password: str, role: str = "staff") -> dict:
    """Create a staff or admin account (admin only).

    Args:
        name: Staff member's name.
        email: Staff member's email.
        password: Staff member's password.
        role: "staff" or "admin".

    Returns:
        Dict with the created user info.

    Raises:
        HTTPException 400: If email already exists or role is invalid.
    """
    db = get_database()

    if role not in ("staff", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'staff' or 'admin'")

    validate_password_strength(password)
    clean_email = sanitize_email(email)
    clean_name = name.strip()

    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    existing = await db.users.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = UserInDB(
        name=clean_name,
        email=clean_email,
        password_hash=hash_password(password),
        role=role,
        membership_tier=MembershipTier.FREE,
        loyalty_points=0,
        total_spend=0.0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    result = await db.users.insert_one(user_doc.model_dump())
    user_id = str(result.inserted_id)

    return UserResponse(
        id=user_id,
        name=clean_name,
        email=clean_email,
        role=role,
        membership_tier=MembershipTier.FREE,
        loyalty_points=0,
        created_at=user_doc.created_at,
        is_active=True,
    )


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
    clean_email = sanitize_email(login_data.email)

    user = await db.users.find_one({"email": clean_email})
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


async def delete_user(user_id: str) -> bool:
    """Delete a user from the system (admin only)."""
    db = get_database()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0
