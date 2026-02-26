"""Project X - Membership API routes."""
from fastapi import APIRouter, Depends, HTTPException
from app.models.membership import MembershipResponse, MembershipUpgrade
from app.models.user import MembershipTier
from app.services.membership_service import get_membership, upgrade_tier_manual
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/memberships", tags=["Memberships"])


@router.get("/me", response_model=MembershipResponse)
async def get_my_membership(user: dict = Depends(get_current_user)):
    """Get current user's membership details."""
    return await get_membership(user["id"])


@router.post("/upgrade", response_model=MembershipResponse)
async def upgrade_membership(
    upgrade_data: MembershipUpgrade,
    user: dict = Depends(get_current_user),
):
    """Upgrade membership tier."""
    return await upgrade_tier_manual(
        user_id=user["id"],
        target_tier=upgrade_data.target_tier.value,
        use_points=upgrade_data.use_points,
    )


@router.put("/override/{user_id}")
async def override_membership(
    user_id: str,
    tier: str,
    admin: dict = Depends(require_role("admin")),
):
    """Admin override: set any user's membership tier directly."""
    valid_tiers = [t.value for t in MembershipTier]
    if tier not in valid_tiers:
        raise HTTPException(status_code=400, detail=f"Invalid tier. Must be one of: {valid_tiers}")

    db = get_database()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"membership_tier": tier, "updated_at": datetime.utcnow()}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Membership tier updated to {tier}"}

