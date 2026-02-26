"""Project X - Loyalty and rewards API routes."""
from fastapi import APIRouter, Depends
from app.models.loyalty import LoyaltyBalanceResponse, RedeemRequest
from app.services.loyalty_service import get_balance, redeem_points, get_history
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/loyalty", tags=["Loyalty"])


@router.get("/balance", response_model=LoyaltyBalanceResponse)
async def get_loyalty_balance(user: dict = Depends(get_current_user)):
    """Get current loyalty points balance."""
    return await get_balance(user["id"])


@router.post("/redeem")
async def redeem_loyalty_points(
    redeem_data: RedeemRequest,
    user: dict = Depends(get_current_user),
):
    """Redeem loyalty points for rewards."""
    txn = await redeem_points(user["id"], redeem_data)
    return {"message": "Points redeemed successfully", "transaction": txn}


@router.get("/history")
async def get_loyalty_history(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user),
):
    """Get loyalty points transaction history."""
    return await get_history(user["id"], skip, limit)
