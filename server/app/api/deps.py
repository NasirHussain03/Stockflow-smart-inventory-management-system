from fastapi import Header, HTTPException, status
from typing import Optional


def get_current_user_id(x_user_id: Optional[str] = Header(None)) -> Optional[int]:
    """
    Extracts the current user's ID from the X-User-Id request header.
    Returns None if the header is missing (unauthenticated / legacy requests).
    """
    if x_user_id is None:
        return None
    try:
        return int(x_user_id)
    except (ValueError, TypeError):
        return None


def verify_admin(x_user_role: str = Header(..., description="Role of the current user")):
    """
    Dependency that checks X-User-Role == 'Admin'.
    Raises 403 Forbidden if not.
    """
    if x_user_role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This action is restricted to Administrators only."
        )
    return x_user_role
