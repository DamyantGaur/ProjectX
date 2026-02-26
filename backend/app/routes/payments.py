"""Project X - Payment API routes."""
from fastapi import APIRouter, Depends, Query
from app.models.payment import PaymentCreate, PaymentConfirm, PaymentResponse
from app.services.payment_service import PaymentService
from app.services.mock_payment import mock_provider
from app.services.loyalty_service import award_payment_points
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role
from app.database import get_database

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# Instantiate payment service with mock provider
payment_service = PaymentService(provider=mock_provider)


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
    """List all payment transactions (admin only)."""
    db = get_database()
    cursor = db.payments.find().sort("created_at", -1).skip(skip).limit(limit)
    payments = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        payments.append(doc)

    total = await db.payments.count_documents({})
    return {"items": payments, "total": total}

