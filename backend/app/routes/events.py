"""Project X - Event management API routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import (
    create_event, update_event, delete_event,
    get_event_by_id, get_all_events, toggle_event_active,
)
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.post("/", response_model=EventResponse, status_code=201)
async def create_new_event(
    event_data: EventCreate,
    admin: dict = Depends(require_role("admin")),
):
    """Create a new event (admin only)."""
    return await create_event(event_data, admin["id"])


@router.get("/", response_model=list[EventResponse])
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    active_only: bool = Query(False),
):
    """List all events (public)."""
    return await get_all_events(skip, limit, active_only)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get a single event by ID (public)."""
    event = await get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_existing_event(
    event_id: str,
    update_data: EventUpdate,
    admin: dict = Depends(require_role("admin")),
):
    """Update an event (admin only)."""
    return await update_event(event_id, update_data)


@router.delete("/{event_id}")
async def delete_existing_event(
    event_id: str,
    admin: dict = Depends(require_role("admin")),
):
    """Delete an event (admin only)."""
    success = await delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}


@router.put("/{event_id}/toggle-active", response_model=EventResponse)
async def toggle_active(
    event_id: str,
    admin: dict = Depends(require_role("admin")),
):
    """Toggle event active status (admin only)."""
    return await toggle_event_active(event_id)
