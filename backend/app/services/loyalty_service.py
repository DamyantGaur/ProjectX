"""Project X - Loyalty and rewards service."""
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database
from app.models.loyalty import (
    LoyaltyTransaction, LoyaltyBalanceResponse,
    PointsTransactionType, POINTS_CONFIG, RedeemRequest,
)


async def add_points(
    user_id: str,
    points: int,
    transaction_type: PointsTransactionType,
    description: str,
    reference_id: Optional[str] = None,
) -> LoyaltyTransaction:
    """Add loyalty points to a user's account.

    Args:
        user_id: User's ID.
        points: Number of points to add (positive).
        transaction_type: Type of earning transaction.
        description: Human-readable description.
        reference_id: Optional event/payment ID.

    Returns:
        The loyalty transaction record.
    """
    db = get_database()

    # Update user points
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"loyalty_points": points}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Get updated balance
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    balance_after = user.get("loyalty_points", 0)

    # Log transaction
    txn = LoyaltyTransaction(
        user_id=user_id,
        type=transaction_type,
        points=points,
        description=description,
        reference_id=reference_id,
        balance_after=balance_after,
        created_at=datetime.utcnow(),
    )
    await db.loyalty_points.insert_one(txn.model_dump())

    # Check for automatic tier upgrade
    from app.services.membership_service import check_and_upgrade_tier
    await check_and_upgrade_tier(user_id)

    return txn


async def redeem_points(
    user_id: str,
    redeem_data: RedeemRequest,
) -> LoyaltyTransaction:
    """Redeem loyalty points for a reward.

    Args:
        user_id: User's ID.
        redeem_data: Redemption details (type, points, optional event_id).

    Returns:
        The loyalty transaction record.
    """
    db = get_database()

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_points = user.get("loyalty_points", 0)
    if current_points < redeem_data.points:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Have {current_points}, need {redeem_data.points}",
        )

    # Deduct points
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"loyalty_points": -redeem_data.points}}
    )

    # Determine transaction type
    type_map = {
        "discount": PointsTransactionType.REDEEM_DISCOUNT,
        "free_entry": PointsTransactionType.REDEEM_FREE_ENTRY,
        "upgrade": PointsTransactionType.REDEEM_UPGRADE,
    }
    txn_type = type_map.get(redeem_data.reward_type, PointsTransactionType.REDEEM_DISCOUNT)

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    balance_after = updated_user.get("loyalty_points", 0)

    txn = LoyaltyTransaction(
        user_id=user_id,
        type=txn_type,
        points=-redeem_data.points,
        description=f"Redeemed {redeem_data.points} points for {redeem_data.reward_type}",
        reference_id=redeem_data.event_id,
        balance_after=balance_after,
        created_at=datetime.utcnow(),
    )
    await db.loyalty_points.insert_one(txn.model_dump())

    return txn


async def get_balance(user_id: str) -> LoyaltyBalanceResponse:
    """Get a user's loyalty points balance and stats."""
    db = get_database()

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate lifetime earned and redeemed
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "earned": {"$sum": {"$cond": [{"$gt": ["$points", 0]}, "$points", 0]}},
            "redeemed": {"$sum": {"$cond": [{"$lt": ["$points", 0]}, {"$abs": "$points"}, 0]}},
        }}
    ]
    stats = await db.loyalty_points.aggregate(pipeline).to_list(1)

    if stats:
        lifetime_earned = stats[0].get("earned", 0)
        lifetime_redeemed = stats[0].get("redeemed", 0)
    else:
        lifetime_earned = 0
        lifetime_redeemed = 0

    return LoyaltyBalanceResponse(
        user_id=user_id,
        total_points=user.get("loyalty_points", 0),
        lifetime_earned=lifetime_earned,
        lifetime_redeemed=lifetime_redeemed,
    )


async def get_history(
    user_id: str, skip: int = 0, limit: int = 50
) -> List[dict]:
    """Get loyalty points transaction history."""
    db = get_database()
    transactions = []
    cursor = (
        db.loyalty_points.find({"user_id": user_id})
        .skip(skip).limit(limit)
        .sort("created_at", -1)
    )

    async for txn in cursor:
        txn["id"] = str(txn["_id"])
        del txn["_id"]
        transactions.append(txn)

    return transactions


async def award_event_entry_points(user_id: str, event_id: str) -> None:
    """Award points for an event entry (called after successful scan)."""
    points = POINTS_CONFIG["event_entry"]
    await add_points(
        user_id=user_id,
        points=points,
        transaction_type=PointsTransactionType.EARN_EVENT,
        description=f"Earned {points} points for event entry",
        reference_id=event_id,
    )


async def award_payment_points(
    user_id: str, amount: float, payment_id: str
) -> None:
    """Award points based on payment amount."""
    points_per_dollar = POINTS_CONFIG["payment_per_dollar"]
    points = int(amount * points_per_dollar)
    if points > 0:
        await add_points(
            user_id=user_id,
            points=points,
            transaction_type=PointsTransactionType.EARN_PAYMENT,
            description=f"Earned {points} points for ${amount:.2f} payment",
            reference_id=payment_id,
        )
