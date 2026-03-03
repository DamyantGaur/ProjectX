"""Project X - Stripe payment provider.

Implements the PaymentProvider interface using Stripe Checkout Sessions.
Drop your Stripe keys into .env to activate.
"""
import stripe
from typing import Dict, Any
from fastapi import HTTPException
from app.services.payment_service import PaymentProvider
from app.config import settings


class StripePaymentProvider(PaymentProvider):
    """Stripe payment provider using Checkout Sessions.

    Flow:
        1. create_payment() → creates a Checkout Session → returns session URL
        2. User redirects to Stripe-hosted checkout page
        3. Stripe webhook confirms payment → confirm_payment() called
    """

    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def create_payment(
        self, amount: float, currency: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a Stripe Checkout Session.

        Returns:
            Dict with 'provider_transaction_id' (session ID),
            'checkout_url' (redirect URL), and 'status'.
        """
        try:
            # Stripe expects amounts in cents
            amount_cents = int(round(amount * 100))

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": currency.lower(),
                        "unit_amount": amount_cents,
                        "product_data": {
                            "name": f"Event Ticket",
                            "description": f"Project X Event Access",
                        },
                    },
                    "quantity": 1,
                }],
                mode="payment",
                metadata={
                    "user_id": metadata.get("user_id", ""),
                    "event_id": metadata.get("event_id", ""),
                },
                success_url=f"{settings.CORS_ORIGINS.split(',')[0]}/dashboard/payments?success=true&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.CORS_ORIGINS.split(',')[0]}/dashboard/payments?canceled=true",
            )

            return {
                "provider_transaction_id": session.id,
                "checkout_url": session.url,
                "status": "pending",
            }

        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Stripe error: {str(e.user_message or e)}",
            )

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Verify a Stripe Checkout Session's payment status.

        Returns:
            Dict with 'status' (completed/pending/failed).
        """
        try:
            session = stripe.checkout.Session.retrieve(transaction_id)

            status_map = {
                "complete": "completed",
                "open": "pending",
                "expired": "failed",
            }

            return {
                "status": status_map.get(session.status, "pending"),
                "transaction_id": transaction_id,
                "payment_intent": session.payment_intent,
            }

        except stripe.error.StripeError as e:
            return {"status": "failed", "error": str(e)}

    async def refund_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Refund a Stripe payment via its Checkout Session.

        Retrieves the PaymentIntent from the session, then issues a full refund.
        """
        try:
            # Get the session to find the PaymentIntent
            session = stripe.checkout.Session.retrieve(transaction_id)
            payment_intent_id = session.payment_intent

            if not payment_intent_id:
                raise HTTPException(
                    status_code=400,
                    detail="No payment intent found for this session",
                )

            refund = stripe.Refund.create(payment_intent=payment_intent_id)

            return {
                "status": "refunded",
                "refund_id": refund.id,
                "original_transaction": transaction_id,
            }

        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Stripe refund error: {str(e.user_message or e)}",
            )


def get_stripe_provider() -> StripePaymentProvider:
    """Factory to create a Stripe provider (refreshes API key from config)."""
    provider = StripePaymentProvider()
    return provider
