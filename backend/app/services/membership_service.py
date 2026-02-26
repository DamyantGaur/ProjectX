"""Project X - Membership service."""
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database
from app.models.user import MembershipTier
from app.models.membership import TIER_CONFIG, MembershipResponse


async def get_membership(user_id: str) -> MembershipResponse:
    """Get a user's current membership details."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = MembershipTier(user.get("membership_tier", "free"))
    config = TIER_CONFIG[tier]
    total_spend = user.get("total_spend", 0)
    loyalty_points = user.get("loyalty_points", 0)

    # Calculate next tier info
    tier_order = [MembershipTier.FREE, MembershipTier.SILVER, MembershipTier.GOLD, MembershipTier.VIP]
    current_idx = tier_order.index(tier)
    next_tier = None
    spend_to_next = None
    points_to_next = None

    if current_idx < len(tier_order) - 1:
        next_t = tier_order[current_idx + 1]
        next_config = TIER_CONFIG[next_t]
        next_tier = next_t.value
        spend_to_next = max(0, next_config["min_spend"] - total_spend)
        points_to_next = max(0, next_config["min_points"] - loyalty_points)

    return MembershipResponse(
        user_id=user_id,
        tier=tier,
        total_spend=total_spend,
        loyalty_points=loyalty_points,
        discount_percent=config["discount_percent"],
        priority_access=config["priority_access"],
        multi_use_qr=config["multi_use_qr"],
        next_tier=next_tier,
        spend_to_next_tier=spend_to_next,
        points_to_next_tier=points_to_next,
    )


async def check_and_upgrade_tier(user_id: str) -> Optional[str]:
    """Check if user qualifies for a tier upgrade and apply it.

    Called after payments/point changes.

    Returns:
        New tier string if upgraded, None otherwise.
    """
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None

    current_tier = MembershipTier(user.get("membership_tier", "free"))
    total_spend = user.get("total_spend", 0)
    loyalty_points = user.get("loyalty_points", 0)

    tier_order = [MembershipTier.FREE, MembershipTier.SILVER, MembershipTier.GOLD, MembershipTier.VIP]
    current_idx = tier_order.index(current_tier)

    new_tier = current_tier
    for tier in tier_order[current_idx + 1:]:
        config = TIER_CONFIG[tier]
        if total_spend >= config["min_spend"] or loyalty_points >= config["min_points"]:
            new_tier = tier
        else:
            break

    if new_tier != current_tier:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "membership_tier": new_tier.value,
                "updated_at": datetime.utcnow(),
            }}
        )
        return new_tier.value

    return None


async def upgrade_tier_manual(user_id: str, target_tier: str, use_points: bool = False) -> MembershipResponse:
    """Manually upgrade a user's tier (e.g., using loyalty points)."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        target = MembershipTier(target_tier)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tier")

    target_config = TIER_CONFIG[target]

    if use_points:
        if user.get("loyalty_points", 0) < target_config["min_points"]:
            raise HTTPException(
                status_code=400,
                detail=f"Need {target_config['min_points']} points. You have {user.get('loyalty_points', 0)}",
            )
        # Deduct points
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "membership_tier": target.value,
                    "updated_at": datetime.utcnow(),
                },
                "$inc": {"loyalty_points": -target_config["min_points"]},
            }
        )
    else:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "membership_tier": target.value,
                "updated_at": datetime.utcnow(),
            }}
        )

    return await get_membership(user_id)
