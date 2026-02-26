"""Project X - Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserUpdate
from app.services.auth_service import (
    register_user, login_user, get_user_by_id, get_all_users,
    update_user_role, toggle_user_active
)
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user account."""
    return await register_user(user_data)


@router.post("/login", response_model=dict)
async def login(login_data: UserLogin):
    """Login with email and password."""
    return await login_user(login_data)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    user = await get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    db = get_database()
    update_fields = {
        k: v for k, v in update_data.model_dump().items() if v is not None
    }
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow()
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields}
    )
    return await get_user_by_id(current_user["id"])


# ─── Admin-only user management ───

@router.get("/users", response_model=list)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    admin: dict = Depends(require_role("admin"))
):
    """List all users (admin only)."""
    return await get_all_users(skip, limit)


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    role: str,
    admin: dict = Depends(require_role("admin"))
):
    """Change a user's role (admin only)."""
    valid_roles = ["admin", "staff", "user"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    success = await update_user_role(user_id, role)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User role updated to {role}"}


@router.put("/users/{user_id}/toggle-active")
async def toggle_active(
    user_id: str,
    admin: dict = Depends(require_role("admin"))
):
    """Toggle a user's active status (admin only)."""
    success = await toggle_user_active(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User status toggled"}
