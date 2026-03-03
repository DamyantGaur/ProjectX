"""Project X - Event models and schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    """Schema for creating an event."""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    venue: str = Field(..., min_length=2, max_length=200)
    date: datetime # Handles ISO strings automatically
    capacity: int = Field(..., gt=0)
    price: float = Field(default=0.0, ge=0)
    image_url: Optional[str] = None
    tags: list[str] = []


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    date: Optional[datetime] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    tags: Optional[list[str]] = None


class EventResponse(BaseModel):
    """Schema for event API responses."""
    id: str
    title: str
    description: str
    venue: str
    date: datetime # Handles ISO strings automatically
    capacity: int
    price: float
    image_url: Optional[str] = None
    tags: list[str] = []
    is_active: bool = True
    attendee_count: int = 0
    created_by: str
    created_at: datetime
    updated_at: datetime


class EventInDB(BaseModel):
    """Internal event schema for MongoDB."""
    title: str
    description: str
    venue: str
    date: datetime # Handles ISO strings automatically
    capacity: int
    price: float = 0.0
    image_url: Optional[str] = None
    tags: list[str] = []
    is_active: bool = True
    attendee_count: int = 0
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
