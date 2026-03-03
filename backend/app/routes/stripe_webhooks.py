"""Project X - Stripe Webhook handler.

Receives events from Stripe (checkout completed, etc.) and updates
payment records + user spend in the database.
"""
import stripe
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from bson import ObjectId
from app.config import settings
from app.database import get_database
from app.services.loyalty_service import award_payment_points

router = APIRouter(prefix="/api/stripe", tags=["Stripe Webhooks"])


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle incoming Stripe webhook events.

    Verifies signature (if webhook secret is configured), then processes:
      - checkout.session.completed → mark payment completed
      - checkout.session.expired  → mark payment failed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Verify webhook signature if secret is configured
    if settings.STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        # In development without webhook secret, parse directly
        import json
        event = json.loads(payload)

    event_type = event.get("type", "")
    data = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        await _handle_checkout_completed(data)
    elif event_type == "checkout.session.expired":
        await _handle_checkout_expired(data)

    return {"status": "ok"}


async def _handle_checkout_completed(session_data: dict):
    """Handle a completed Stripe checkout session.

    Updates payment record to 'completed', increments user total_spend,
    and awards loyalty points.
    """
    db = get_database()
    session_id = session_data.get("id", "")
    metadata = session_data.get("metadata", {})
    user_id = metadata.get("user_id", "")

    # Find matching payment record by provider_transaction_id
    payment = await db.payments.find_one({
        "provider_transaction_id": session_id,
    })

    if not payment:
        return  # No matching payment — could be a duplicate or manual session

    if payment.get("status") == "completed":
        return  # Already processed — idempotent

    # Update payment to completed
    await db.payments.update_one(
        {"_id": payment["_id"]},
        {"$set": {
            "status": "completed",
            "updated_at": datetime.utcnow(),
        }}
    )

    # Update user's total spend
    if user_id:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$inc": {"total_spend": payment["amount"]},
                "$set": {"updated_at": datetime.utcnow()},
            }
        )

        # Award loyalty points
        await award_payment_points(
            user_id=user_id,
            amount=payment["amount"],
            payment_id=str(payment["_id"]),
        )


async def _handle_checkout_expired(session_data: dict):
    """Handle an expired/canceled Stripe checkout session.

    Marks the payment record as 'failed'.
    """
    db = get_database()
    session_id = session_data.get("id", "")

    await db.payments.update_one(
        {"provider_transaction_id": session_id},
        {"$set": {
            "status": "failed",
            "updated_at": datetime.utcnow(),
        }}
    )
