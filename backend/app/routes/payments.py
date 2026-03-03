"""Project X - Payment API routes."""
from fastapi import APIRouter, Depends, Query
from app.models.payment import PaymentCreate, PaymentConfirm, PaymentResponse
from app.services.payment_service import PaymentService
from app.services.mock_payment import mock_provider
from app.services.loyalty_service import award_payment_points
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role
from app.database import get_database
from app.config import settings

router = APIRouter(prefix="/api/payments", tags=["Payments"])


def _get_payment_service() -> PaymentService:
    """Return a PaymentService wired to Stripe (if keys set) or Mock."""
    if settings.STRIPE_SECRET_KEY:
        from app.services.stripe_payment import get_stripe_provider
        return PaymentService(provider=get_stripe_provider())
    return PaymentService(provider=mock_provider)


# Keep a default for non-Stripe routes
payment_service = _get_payment_service()


@router.get("/config")
async def get_payment_config():
    """Return payment provider info to the frontend.

    Frontend uses this to decide whether to redirect to Stripe Checkout
    or use the instant mock flow.
    """
    is_stripe = bool(settings.STRIPE_SECRET_KEY)
    return {
        "provider": "stripe" if is_stripe else "mock",
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY if is_stripe else None,
    }


@router.post("/initiate", response_model=PaymentResponse, status_code=201)
async def initiate_payment(
    payment_data: PaymentCreate,
    user: dict = Depends(get_current_user),
):
    """Initiate a payment for an event."""
    return await payment_service.initiate_payment(
        user_id=user["id"],
        event_id=payment_data.event_id,
        amount=payment_data.amount,
        coupon_code=payment_data.coupon_code,
    )


@router.post("/confirm", response_model=PaymentResponse)
async def confirm_payment(
    confirm_data: PaymentConfirm,
    user: dict = Depends(get_current_user),
):
    """Confirm/complete a payment."""
    result = await payment_service.confirm_payment(
        payment_id=confirm_data.payment_id,
        user_id=user["id"],
    )

    # Award loyalty points for successful payment
    if result.status == "completed":
        await award_payment_points(
            user_id=user["id"],
            amount=result.amount,
            payment_id=result.id,
        )

    return result


@router.get("/history", response_model=list[PaymentResponse])
async def get_payment_history(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user),
):
    """Get payment history for the current user."""
    return await payment_service.get_user_payments(user["id"], skip, limit)


@router.get("/all")
async def get_all_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: dict = Depends(require_role("admin")),
):
    """List all payment transactions (admin only).

    Uses aggregation pipeline to batch user/event lookups (avoids N+1 queries).
    """
    db = get_database()

    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit},
        # Convert string user_id to ObjectId for lookup
        {"$addFields": {
            "user_oid": {"$toObjectId": "$user_id"},
            "event_oid": {"$toObjectId": "$event_id"},
        }},
        # Join users collection
        {"$lookup": {
            "from": "users",
            "localField": "user_oid",
            "foreignField": "_id",
            "as": "user_info",
        }},
        # Join events collection
        {"$lookup": {
            "from": "events",
            "localField": "event_oid",
            "foreignField": "_id",
            "as": "event_info",
        }},
        # Flatten and project final fields
        {"$addFields": {
            "id": {"$toString": "$_id"},
            "user_name": {"$ifNull": [{"$arrayElemAt": ["$user_info.name", 0]}, "Unknown"]},
            "user_email": {"$ifNull": [{"$arrayElemAt": ["$user_info.email", 0]}, "Unknown"]},
            "event_title": {"$ifNull": [{"$arrayElemAt": ["$event_info.title", 0]}, "Unknown"]},
        }},
        {"$project": {
            "_id": 0, "user_info": 0, "event_info": 0, "user_oid": 0, "event_oid": 0,
        }},
    ]

    payments = await db.payments.aggregate(pipeline).to_list(length=limit)
    total = await db.payments.count_documents({})
    return {"items": payments, "total": total}


