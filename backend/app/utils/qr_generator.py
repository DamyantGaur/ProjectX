"""Project X - QR Code generation utility."""
import qrcode
import io
import base64
import hashlib
import hmac
import uuid
from datetime import datetime
from app.config import settings


def generate_qr_token(user_id: str, event_id: str) -> str:
    """Generate a unique, signed QR token.

    The token contains a UUID nonce and is signed with HMAC-SHA256
    to prevent forgery.

    Args:
        user_id: The user's ID.
        event_id: The event's ID.

    Returns:
        A signed token string in format: {nonce}.{signature}
    """
    nonce = uuid.uuid4().hex
    payload = f"{user_id}:{event_id}:{nonce}:{datetime.utcnow().isoformat()}"
    signature = hmac.new(
        settings.QR_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()

    return f"{nonce}.{signature}"


def generate_qr_image_base64(data: str) -> str:
    """Generate a QR code image and return as base64 string.

    Args:
        data: The data to encode in the QR code.

    Returns:
        Base64 encoded PNG image string.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode("utf-8")
