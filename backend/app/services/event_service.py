"""Project X - Event management service."""
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database
from app.models.event import EventCreate, EventUpdate, EventResponse, EventInDB


async def create_event(event_data: EventCreate, admin_id: str) -> EventResponse:
    """Create a new event (admin only)."""
    db = get_database()

    event_doc = EventInDB(
        title=event_data.title,
        description=event_data.description,
        venue=event_data.venue,
        date=event_data.date,
        capacity=event_data.capacity,
        price=event_data.price,
        image_url=event_data.image_url,
        tags=event_data.tags,
        is_active=True,
        attendee_count=0,
        created_by=admin_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    result = await db.events.insert_one(event_doc.model_dump())
    event_id = str(result.inserted_id)

    return EventResponse(id=event_id, **event_doc.model_dump())


async def update_event(event_id: str, update_data: EventUpdate) -> EventResponse:
    """Update an existing event."""
    db = get_database()

    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow()
    result = await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return await get_event_by_id(event_id)


async def delete_event(event_id: str) -> bool:
    """Delete an event."""
    db = get_database()
    result = await db.events.delete_one({"_id": ObjectId(event_id)})
    return result.deleted_count > 0


async def get_event_by_id(event_id: str) -> Optional[EventResponse]:
    """Get a single event by ID."""
    db = get_database()
    event = await db.events.find_one({"_id": ObjectId(event_id)})

    if not event:
        return None

    return EventResponse(
        id=str(event["_id"]),
        title=event["title"],
        description=event["description"],
        venue=event["venue"],
        date=event["date"],
        capacity=event["capacity"],
        price=event.get("price", 0),
        image_url=event.get("image_url"),
        tags=event.get("tags", []),
        is_active=event.get("is_active", True),
        attendee_count=event.get("attendee_count", 0),
        created_by=event["created_by"],
        created_at=event["created_at"],
        updated_at=event.get("updated_at", event["created_at"]),
    )


async def get_all_events(
    skip: int = 0,
    limit: int = 50,
    active_only: bool = False
) -> List[EventResponse]:
    """Get all events with optional filtering."""
    db = get_database()
    query = {"is_active": True} if active_only else {}
    cursor = db.events.find(query).skip(skip).limit(limit).sort("date", -1)

    events = []
    async for event in cursor:
        events.append(EventResponse(
            id=str(event["_id"]),
            title=event["title"],
            description=event["description"],
            venue=event["venue"],
            date=event["date"],
            capacity=event["capacity"],
            price=event.get("price", 0),
            image_url=event.get("image_url"),
            tags=event.get("tags", []),
            is_active=event.get("is_active", True),
            attendee_count=event.get("attendee_count", 0),
            created_by=event["created_by"],
            created_at=event["created_at"],
            updated_at=event.get("updated_at", event["created_at"]),
        ))
    return events


async def toggle_event_active(event_id: str) -> EventResponse:
    """Toggle an event's active status."""
    db = get_database()
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    new_status = not event.get("is_active", True)
    await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}}
    )
    return await get_event_by_id(event_id)


async def increment_attendee_count(event_id: str) -> None:
    """Increment event attendee count atomically."""
    db = get_database()
    await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$inc": {"attendee_count": 1}}
    )
