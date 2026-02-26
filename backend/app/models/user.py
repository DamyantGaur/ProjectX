"""Project X - User models and schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    """User roles for RBAC."""
    ADMIN = "admin"
    STAFF = "staff"
    USER = "user"


class MembershipTier(str, Enum):
    """Membership tier levels."""
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"
    VIP = "vip"


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.USER


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user API responses."""
    id: str
    name: str
    email: str
    role: UserRole
    membership_tier: MembershipTier = MembershipTier.FREE
    loyalty_points: int = 0
    created_at: datetime
    is_active: bool = True


class UserInDB(BaseModel):
    """Internal user schema with password hash."""
    name: str
    email: str
    password_hash: str
    role: UserRole = UserRole.USER
    membership_tier: MembershipTier = MembershipTier.FREE
    loyalty_points: int = 0
    total_spend: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
