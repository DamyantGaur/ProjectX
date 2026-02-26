"""Project X - Payment models and schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class PaymentStatus(str, Enum):
    """Payment state machine states."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentCreate(BaseModel):
    """Schema for initiating a payment."""
    event_id: str
    amount: float = Field(..., gt=0)
    coupon_code: Optional[str] = None


class PaymentConfirm(BaseModel):
    """Schema for confirming a payment."""
    payment_id: str
    provider_transaction_id: Optional[str] = None


class PaymentResponse(BaseModel):
    """Schema for payment API responses."""
    id: str
    user_id: str
    event_id: str
    amount: float
    original_amount: float
    discount: float = 0.0
    coupon_code: Optional[str] = None
    status: PaymentStatus
    provider: str = "mock"
    provider_transaction_id: Optional[str] = None
    event_title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PaymentInDB(BaseModel):
    """Internal payment schema for MongoDB."""
    user_id: str
    event_id: str
    amount: float
    original_amount: float
    discount: float = 0.0
    coupon_code: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    provider: str = "mock"
    provider_transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CouponInDB(BaseModel):
    """Coupon schema for discount codes."""
    code: str
    discount_percent: float = Field(..., ge=0, le=100)
    max_uses: int = 100
    used_count: int = 0
    min_amount: float = 0.0
    is_active: bool = True
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
