"""Project X - Role-based access control middleware."""
from functools import wraps
from typing import List
from fastapi import HTTPException, status


def require_role(*allowed_roles: str):
    """Dependency factory for role-based route protection.

    Usage:
        @router.get("/admin-only")
        async def admin_route(user = Depends(require_role("admin"))):
            ...

    Args:
        allowed_roles: One or more role strings that can access the route.

    Returns:
        A FastAPI dependency that validates the user's role.
    """
    from app.middleware.auth import get_current_user
    from fastapi import Depends

    async def role_checker(user: dict = Depends(get_current_user)) -> dict:
        user_role = user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}",
            )
        return user

    return role_checker
