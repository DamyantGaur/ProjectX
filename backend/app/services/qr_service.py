"""Project X - QR Code service (business logic layer)."""
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database
from app.models.qr import (
    QRCodeCreate, QRCodeResponse, QRCodeInDB, QRType, QRStatus,
    QRValidateRequest, QRValidateResponse, ScanLogInDB,
)
from app.utils.qr_generator import generate_qr_token, generate_qr_image_base64
from app.services.event_service import get_event_by_id, increment_attendee_count


async def generate_qr(user_id: str, qr_data: QRCodeCreate, user: dict) -> QRCodeResponse:
    """Generate a QR code for a user-event combination.

    Rules:
    - Free event → QR generated instantly
    - Paid event → QR only generated after successful payment
    - One QR per user per event (unless multi-use)
    """
    db = get_database()

    # Validate event exists and is active
    event = await get_event_by_id(qr_data.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not event.is_active:
        raise HTTPException(status_code=400, detail="Event is not active")

    # Check capacity
    if event.attendee_count >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is at full capacity")

    # Check for existing QR for this user-event
    existing = await db.qr_codes.find_one({
        "user_id": user_id,
        "event_id": qr_data.event_id,
        "status": {"$in": ["active", "used"]},
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="QR code already exists for this event",
        )

    # For paid events, check payment status
    payment_status = "none"
    if event.price > 0:
        payment = await db.payments.find_one({
            "user_id": user_id,
            "event_id": qr_data.event_id,
            "status": "completed",
        })
        if not payment:
            raise HTTPException(
                status_code=402,
                detail="Payment required before QR generation",
            )
        payment_status = "completed"
    else:
        payment_status = "free"

    # Determine max scans based on QR type and membership
    membership_tier = user.get("membership_tier", "free")
    if qr_data.qr_type == QRType.MULTI_USE:
        if membership_tier not in ("gold", "vip"):
            raise HTTPException(
                status_code=403,
                detail="Multi-use QR requires Gold or VIP membership",
            )
        max_scans = 5 if membership_tier == "gold" else 10
    else:
        max_scans = 1

    # Generate secure token and QR image
    token = generate_qr_token(user_id, qr_data.event_id)
    qr_image = generate_qr_image_base64(token)

    qr_doc = QRCodeInDB(
        user_id=user_id,
        event_id=qr_data.event_id,
        token=token,
        qr_type=qr_data.qr_type,
        status=QRStatus.ACTIVE,
        payment_status=payment_status,
        membership_tier=membership_tier,
        qr_image_base64=qr_image,
        scan_count=0,
        max_scans=max_scans,
        expires_at=qr_data.expires_at,
        created_at=datetime.utcnow(),
    )

    result = await db.qr_codes.insert_one(qr_doc.model_dump())
    qr_id = str(result.inserted_id)

    return QRCodeResponse(
        id=qr_id,
        event_title=event.title,
        **qr_doc.model_dump(),
    )


async def validate_qr(
    token: str,
    scanned_by: str,
) -> QRValidateResponse:
    """Validate a QR code token (staff scanning).

    Performs atomic validation with duplicate prevention.
    Every scan is logged regardless of result.
    """
    db = get_database()

    # Find QR code by token
    qr = await db.qr_codes.find_one({"token": token})

    if not qr:
        await _log_scan(db, "unknown", token, "unknown", "unknown", scanned_by, "invalid")
        return QRValidateResponse(
            status="invalid",
            message="Invalid QR code — not found in system",
        )

    qr_id = str(qr["_id"])
    user_id = qr["user_id"]
    event_id = qr["event_id"]

    # Fetch user and event info
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    user_name = user["name"] if user else "Unknown"
    event_title = event["title"] if event else "Unknown"

    # Check expiry
    if qr.get("expires_at") and qr["expires_at"] < datetime.utcnow():
        await db.qr_codes.update_one(
            {"_id": qr["_id"]}, {"$set": {"status": "expired"}}
        )
        await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "denied_expired")
        return QRValidateResponse(
            status="expired",
            message="QR code has expired",
            user_name=user_name,
            event_title=event_title,
        )

    # Check payment status for paid events
    if qr.get("payment_status") == "none" and event and event.get("price", 0) > 0:
        await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "denied_payment")
        return QRValidateResponse(
            status="payment_pending",
            message="Payment not completed",
            user_name=user_name,
            event_title=event_title,
        )

    # Check if already fully used
    if qr.get("status") == "used":
        await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "denied_used")
        return QRValidateResponse(
            status="already_used",
            message="QR code has already been used",
            user_name=user_name,
            event_title=event_title,
            scan_count=qr.get("scan_count", 0),
        )

    # Check scan count vs max scans
    current_scans = qr.get("scan_count", 0)
    max_scans = qr.get("max_scans", 1)

    if current_scans >= max_scans:
        await db.qr_codes.update_one(
            {"_id": qr["_id"]}, {"$set": {"status": "used"}}
        )
        await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "denied_used")
        return QRValidateResponse(
            status="already_used",
            message="Maximum scans reached",
            user_name=user_name,
            event_title=event_title,
            scan_count=current_scans,
        )

    # Atomic update: increment scan count and potentially mark as used
    new_scan_count = current_scans + 1
    update_fields = {"scan_count": new_scan_count}
    if new_scan_count >= max_scans:
        update_fields["status"] = "used"

    result = await db.qr_codes.update_one(
        {"_id": qr["_id"], "scan_count": current_scans},  # Optimistic lock
        {"$set": update_fields},
    )

    if result.modified_count == 0:
        # Concurrent scan detected
        await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "denied_concurrent")
        return QRValidateResponse(
            status="already_used",
            message="Concurrent scan detected — please try again",
            user_name=user_name,
            event_title=event_title,
        )

    # Success — increment event attendee count
    await increment_attendee_count(event_id)

    # Log successful scan
    await _log_scan(db, qr_id, token, user_id, event_id, scanned_by, "approved")

    return QRValidateResponse(
        status="approved",
        message=f"Welcome, {user_name}!",
        user_name=user_name,
        event_title=event_title,
        membership_tier=qr.get("membership_tier", "free"),
        scan_count=new_scan_count,
    )


async def get_user_qr_codes(user_id: str) -> List[QRCodeResponse]:
    """Get all QR codes for a user."""
    db = get_database()
    qr_codes = []
    cursor = db.qr_codes.find({"user_id": user_id}).sort("created_at", -1)

    async for qr in cursor:
        event = await db.events.find_one({"_id": ObjectId(qr["event_id"])})
        qr_codes.append(QRCodeResponse(
            id=str(qr["_id"]),
            user_id=qr["user_id"],
            event_id=qr["event_id"],
            token=qr["token"],
            qr_type=qr["qr_type"],
            status=qr["status"],
            payment_status=qr.get("payment_status", "none"),
            membership_tier=qr.get("membership_tier", "free"),
            qr_image_base64=qr.get("qr_image_base64"),
            scan_count=qr.get("scan_count", 0),
            max_scans=qr.get("max_scans", 1),
            expires_at=qr.get("expires_at"),
            created_at=qr["created_at"],
            event_title=event["title"] if event else "Unknown",
        ))
    return qr_codes


async def get_scan_history(
    scanned_by: Optional[str] = None,
    event_id: Optional[str] = None,
    limit: int = 50,
) -> list:
    """Get scan history with optional filters."""
    db = get_database()
    query = {}
    if scanned_by:
        query["scanned_by"] = scanned_by
    if event_id:
        query["event_id"] = event_id

    logs = []
    cursor = db.scan_logs.find(query).sort("scanned_at", -1).limit(limit)
    async for log in cursor:
        log["id"] = str(log["_id"])
        del log["_id"]
        logs.append(log)
    return logs


async def _log_scan(
    db, qr_id: str, token: str, user_id: str,
    event_id: str, scanned_by: str, result: str,
) -> None:
    """Log every scan attempt for audit trail."""
    log = ScanLogInDB(
        qr_id=qr_id,
        qr_token=token,
        user_id=user_id,
        event_id=event_id,
        scanned_by=scanned_by,
        result=result,
        scanned_at=datetime.utcnow(),
    )
    await db.scan_logs.insert_one(log.model_dump())
