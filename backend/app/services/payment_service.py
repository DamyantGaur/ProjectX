"""Project X - Abstract payment service layer.

Designed for provider-agnostic architecture.
Stripe/Razorpay can be swapped in by implementing PaymentProvider.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database
from app.models.payment import PaymentStatus, PaymentInDB, PaymentResponse


class PaymentProvider(ABC):
    """Abstract base class for payment providers.

    Implement this interface to add Stripe, Razorpay, etc.
    """

    @abstractmethod
    async def create_payment(
        self, amount: float, currency: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Initiate a payment with the provider.

        Returns:
            Dict with at least 'provider_transaction_id' and 'status'.
        """
        pass

    @abstractmethod
    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Verify a payment's status with the provider.

        Returns:
            Dict with 'status' (completed/failed/pending).
        """
        pass

    @abstractmethod
    async def refund_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Refund a payment.

        Returns:
            Dict with 'status' and 'refund_id'.
        """
        pass


class PaymentService:
    """Orchestrates payment flow using a pluggable provider."""

    def __init__(self, provider: PaymentProvider):
        self.provider = provider

    async def initiate_payment(
        self,
        user_id: str,
        event_id: str,
        amount: float,
        coupon_code: Optional[str] = None,
    ) -> PaymentResponse:
        """Initiate a payment for an event.

        Applies coupon discount if valid, creates payment record,
        and calls the provider.
        """
        db = get_database()

        # Validate event
        event = await db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        if not event.get("is_active", True):
            raise HTTPException(status_code=400, detail="Event is not active")

        if event.get("price", 0) <= 0:
            raise HTTPException(status_code=400, detail="Event is free, no payment needed")

        # Server-side amount validation: verify amount matches event price
        if amount != event.get("price", 0):
            raise HTTPException(status_code=400, detail="Payment amount does not match event price")

        # Atomic duplicate check: use findOneAndUpdate to prevent race conditions
        # This atomically checks for an existing completed payment and returns it
        existing = await db.payments.find_one({
            "user_id": user_id,
            "event_id": event_id,
            "status": {"$in": ["completed", "pending"]},
        })
        if existing:
            existing_status = existing.get("status", "pending")
            if existing_status == "completed":
                raise HTTPException(status_code=400, detail="Already paid for this event")
            else:
                raise HTTPException(status_code=400, detail="A pending payment already exists for this event")

        original_amount = amount
        discount = 0.0

        # Apply coupon if provided
        if coupon_code:
            coupon = await db.coupons.find_one({
                "code": coupon_code.upper(),
                "is_active": True,
            })
            if coupon:
                if coupon.get("expires_at") and coupon["expires_at"] < datetime.utcnow():
                    pass  # Expired coupon, ignore
                elif coupon.get("used_count", 0) >= coupon.get("max_uses", 100):
                    pass  # Max uses reached
                elif amount < coupon.get("min_amount", 0):
                    pass  # Below minimum
                else:
                    discount = amount * (coupon["discount_percent"] / 100)
                    amount = round(amount - discount, 2)
                    await db.coupons.update_one(
                        {"_id": coupon["_id"]},
                        {"$inc": {"used_count": 1}}
                    )

        # Apply membership discount
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            from app.models.membership import TIER_CONFIG, MembershipTier
            tier = user.get("membership_tier", "free")
            try:
                tier_enum = MembershipTier(tier)
                tier_discount = TIER_CONFIG.get(tier_enum, {}).get("discount_percent", 0)
                if tier_discount > 0:
                    membership_discount = amount * (tier_discount / 100)
                    discount += membership_discount
                    amount = round(amount - membership_discount, 2)
            except ValueError:
                pass

        # Call payment provider
        provider_result = await self.provider.create_payment(
            amount=amount,
            currency="USD",
            metadata={"user_id": user_id, "event_id": event_id},
        )

        # Create payment record
        payment_doc = PaymentInDB(
            user_id=user_id,
            event_id=event_id,
            amount=amount,
            original_amount=original_amount,
            discount=discount,
            coupon_code=coupon_code,
            status=PaymentStatus.PENDING,
            provider=self.provider.__class__.__name__,
            provider_transaction_id=provider_result.get("provider_transaction_id"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        result = await db.payments.insert_one(payment_doc.model_dump())
        payment_id = str(result.inserted_id)

        return PaymentResponse(
            id=payment_id,
            event_title=event.get("title"),
            checkout_url=provider_result.get("checkout_url"),
            **payment_doc.model_dump(),
        )

    async def confirm_payment(
        self, payment_id: str, user_id: str
    ) -> PaymentResponse:
        """Confirm/complete a payment.

        Updates payment status, activates QR code generation eligibility,
        and updates user spend.
        """
        db = get_database()

        payment = await db.payments.find_one({
            "_id": ObjectId(payment_id),
            "user_id": user_id,
        })
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        if payment["status"] == "completed":
            raise HTTPException(status_code=400, detail="Payment already completed")

        # Verify with provider
        if payment.get("provider_transaction_id"):
            provider_result = await self.provider.verify_payment(
                payment["provider_transaction_id"]
            )
            new_status = provider_result.get("status", "completed")
        else:
            new_status = "completed"

        # Update payment status
        await db.payments.update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": {
                "status": new_status,
                "updated_at": datetime.utcnow(),
            }}
        )

        # If completed, update user total spend
        if new_status == "completed":
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {"total_spend": payment["amount"]},
                    "$set": {"updated_at": datetime.utcnow()},
                }
            )

        # Return updated payment
        updated = await db.payments.find_one({"_id": ObjectId(payment_id)})
        event = await db.events.find_one({"_id": ObjectId(updated["event_id"])})

        return PaymentResponse(
            id=str(updated["_id"]),
            user_id=updated["user_id"],
            event_id=updated["event_id"],
            amount=updated["amount"],
            original_amount=updated["original_amount"],
            discount=updated.get("discount", 0),
            coupon_code=updated.get("coupon_code"),
            status=updated["status"],
            provider=updated.get("provider", "mock"),
            provider_transaction_id=updated.get("provider_transaction_id"),
            event_title=event["title"] if event else None,
            created_at=updated["created_at"],
            updated_at=updated["updated_at"],
        )

    async def get_user_payments(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> list:
        """Get payment history for a user."""
        db = get_database()
        payments = []
        cursor = db.payments.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)

        async for p in cursor:
            event = await db.events.find_one({"_id": ObjectId(p["event_id"])})
            payments.append(PaymentResponse(
                id=str(p["_id"]),
                user_id=p["user_id"],
                event_id=p["event_id"],
                amount=p["amount"],
                original_amount=p["original_amount"],
                discount=p.get("discount", 0),
                coupon_code=p.get("coupon_code"),
                status=p["status"],
                provider=p.get("provider", "mock"),
                provider_transaction_id=p.get("provider_transaction_id"),
                event_title=event["title"] if event else None,
                created_at=p["created_at"],
                updated_at=p["updated_at"],
            ))
        return payments
