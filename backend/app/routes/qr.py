"""Project X - QR Code API routes."""
from fastapi import APIRouter, Depends
from app.models.qr import QRCodeCreate, QRCodeResponse, QRValidateRequest, QRValidateResponse
from app.services.qr_service import generate_qr, validate_qr, get_user_qr_codes, get_scan_history
from app.middleware.auth import get_current_user
from app.middleware.roles import require_role

router = APIRouter(prefix="/api/qr", tags=["QR Codes"])


@router.post("/generate", response_model=QRCodeResponse, status_code=201)
async def generate_qr_code(
    qr_data: QRCodeCreate,
    user: dict = Depends(get_current_user),
):
    """Generate a QR code for an event."""
    return await generate_qr(user["id"], qr_data, user)


@router.post("/validate", response_model=QRValidateResponse)
async def validate_qr_code(
    validate_data: QRValidateRequest,
    staff: dict = Depends(require_role("staff", "admin")),
):
    """Validate/scan a QR code (staff only)."""
    return await validate_qr(validate_data.token, staff["id"])


@router.get("/my-passes", response_model=list[QRCodeResponse])
async def get_my_passes(user: dict = Depends(get_current_user)):
    """Get all QR passes for the current user."""
    return await get_user_qr_codes(user["id"])


@router.get("/scan-history")
async def get_scans(
    event_id: str = None,
    staff: dict = Depends(require_role("staff", "admin")),
):
    """Get scan history (staff/admin)."""
    return await get_scan_history(scanned_by=staff["id"], event_id=event_id)
