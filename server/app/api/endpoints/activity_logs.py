from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.activity_log import ActivityLogListResponse
from app.services import activity_log_service
from app.api.deps import get_current_user_id
from typing import Optional

router = APIRouter()

@router.get("/", response_model=ActivityLogListResponse)
def read_activity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
    x_user_role: str = Header(..., description="Role of the current user")
):
    # Admins can see all action history. Staff can only see their own history.
    filter_user_id = None if x_user_role == "Admin" else user_id
    
    items, total = activity_log_service.get_activity_logs(
        db,
        skip=skip,
        limit=limit,
        search=search,
        user_id=filter_user_id
    )
    return {"items": items, "total": total}
