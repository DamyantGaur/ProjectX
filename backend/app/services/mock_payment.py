"""Project X - Mock payment provider.

Simulates payment processing for development/testing.
Replace with Stripe/Razorpay by implementing PaymentProvider.
"""
import uuid
import asyncio
from typing import Dict, Any
from app.services.payment_service import PaymentProvider


class MockPaymentProvider(PaymentProvider):
    """Mock payment provider that simulates successful payments.

    Configurable to simulate failures for testing.
    """

    def __init__(self, success_rate: float = 1.0, delay_seconds: float = 0.5):
        """
        Args:
            success_rate: Float between 0 and 1. 1.0 = always succeed.
            delay_seconds: Simulated processing delay.
        """
        self.success_rate = success_rate
        self.delay_seconds = delay_seconds

    async def create_payment(
        self, amount: float, currency: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simulate creating a payment."""
        await asyncio.sleep(self.delay_seconds)

        transaction_id = f"mock_txn_{uuid.uuid4().hex[:16]}"

        return {
            "provider_transaction_id": transaction_id,
            "status": "pending",
            "amount": amount,
            "currency": currency,
        }

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Simulate verifying a payment (always succeeds in mock)."""
        await asyncio.sleep(self.delay_seconds * 0.5)

        import random
        if random.random() <= self.success_rate:
            return {"status": "completed", "transaction_id": transaction_id}
        else:
            return {"status": "failed", "transaction_id": transaction_id}

    async def refund_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Simulate refunding a payment."""
        await asyncio.sleep(self.delay_seconds * 0.5)

        refund_id = f"mock_refund_{uuid.uuid4().hex[:12]}"
        return {
            "status": "refunded",
            "refund_id": refund_id,
            "original_transaction": transaction_id,
        }


# Singleton instance for the application
mock_provider = MockPaymentProvider(success_rate=1.0, delay_seconds=0.3)
