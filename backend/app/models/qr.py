"""Project X - QR Code models and schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class QRType(str, Enum):
    """QR code usage type."""
    ONE_TIME = "one_time"
    MULTI_USE = "multi_use"


class QRStatus(str, Enum):
    """QR code status."""
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    REVOKED = "revoked"


class QRCodeCreate(BaseModel):
    """Schema for generating a QR code."""
    event_id: str
    qr_type: QRType = QRType.ONE_TIME
    expires_at: Optional[datetime] = None


class QRCodeResponse(BaseModel):
    """Schema for QR code API responses."""
    id: str
    user_id: str
    event_id: str
    token: str
    qr_type: QRType
    status: QRStatus
    payment_status: str = "none"
    membership_tier: str = "free"
    qr_image_base64: Optional[str] = None
    scan_count: int = 0
    max_scans: Optional[int] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    event_title: Optional[str] = None


class QRCodeInDB(BaseModel):
    """Internal QR code schema for MongoDB."""
    user_id: str
    event_id: str
    token: str
    qr_type: QRType = QRType.ONE_TIME
    status: QRStatus = QRStatus.ACTIVE
    payment_status: str = "none"
    membership_tier: str = "free"
    qr_image_base64: Optional[str] = None
    scan_count: int = 0
    max_scans: Optional[int] = 1
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QRValidateRequest(BaseModel):
    """Schema for QR validation request."""
    token: str


class QRValidateResponse(BaseModel):
    """Schema for QR validation response."""
    status: str   # approved, already_used, expired, payment_pending, invalid
    message: str
    user_name: Optional[str] = None
    event_title: Optional[str] = None
    membership_tier: Optional[str] = None
    scan_count: Optional[int] = None


class ScanLogInDB(BaseModel):
    """Scan log entry for audit trail."""
    qr_id: str
    qr_token: str
    user_id: str
    event_id: str
    scanned_by: str
    result: str  # approved, denied_used, denied_expired, denied_payment
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
