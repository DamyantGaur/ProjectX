"""Project X - Membership models and schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import MembershipTier


# Tier configuration: thresholds and benefits
TIER_CONFIG = {
    MembershipTier.FREE: {
        "min_spend": 0,
        "min_points": 0,
        "discount_percent": 0,
        "priority_access": False,
        "multi_use_qr": False,
        "color": "#6B7280",
        "label": "Free",
    },
    MembershipTier.SILVER: {
        "min_spend": 500,
        "min_points": 200,
        "discount_percent": 5,
        "priority_access": False,
        "multi_use_qr": False,
        "color": "#9CA3AF",
        "label": "Silver",
    },
    MembershipTier.GOLD: {
        "min_spend": 2000,
        "min_points": 800,
        "discount_percent": 10,
        "priority_access": True,
        "multi_use_qr": True,
        "color": "#F59E0B",
        "label": "Gold",
    },
    MembershipTier.VIP: {
        "min_spend": 5000,
        "min_points": 2000,
        "discount_percent": 20,
        "priority_access": True,
        "multi_use_qr": True,
        "color": "#D946EF",
        "label": "VIP",
    },
}


class MembershipResponse(BaseModel):
    """Schema for membership API responses."""
    user_id: str
    tier: MembershipTier
    total_spend: float
    loyalty_points: int
    discount_percent: float
    priority_access: bool
    multi_use_qr: bool
    next_tier: Optional[str] = None
    spend_to_next_tier: Optional[float] = None
    points_to_next_tier: Optional[int] = None


class MembershipUpgrade(BaseModel):
    """Schema for membership upgrade request."""
    target_tier: MembershipTier
    use_points: bool = False
