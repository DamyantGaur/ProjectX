"""Project X - Loyalty and rewards models."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class PointsTransactionType(str, Enum):
    """Types of loyalty point transactions."""
    EARN_EVENT = "earn_event"
    EARN_PAYMENT = "earn_payment"
    EARN_REFERRAL = "earn_referral"
    EARN_BONUS = "earn_bonus"
    REDEEM_DISCOUNT = "redeem_discount"
    REDEEM_FREE_ENTRY = "redeem_free_entry"
    REDEEM_UPGRADE = "redeem_upgrade"


class LoyaltyTransaction(BaseModel):
    """Schema for a loyalty points transaction."""
    user_id: str
    type: PointsTransactionType
    points: int  # Positive for earn, negative for redeem
    description: str
    reference_id: Optional[str] = None  # Event/payment ID
    balance_after: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LoyaltyBalanceResponse(BaseModel):
    """Schema for loyalty balance response."""
    user_id: str
    total_points: int
    lifetime_earned: int
    lifetime_redeemed: int


class RewardItem(BaseModel):
    """Available reward for redemption."""
    id: str
    name: str
    description: str
    points_cost: int
    reward_type: str  # discount, free_entry, upgrade
    value: float = 0  # Discount amount or percentage
    is_active: bool = True


class RedeemRequest(BaseModel):
    """Schema for redeeming points."""
    reward_type: str  # discount, free_entry, upgrade
    points: int = Field(..., gt=0)
    event_id: Optional[str] = None

# Points earning rules
POINTS_CONFIG = {
    "event_entry": 50,
    "payment_per_dollar": 10,  # 10 points per $1 spent
    "referral_bonus": 200,
    "first_event_bonus": 100,
}
