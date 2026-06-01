from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services import dashboard_service
from app.api.deps import get_current_user_id
from typing import Optional

router = APIRouter()


@router.get("/stats", response_model=DashboardResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return dashboard_service.get_dashboard_data(db, user_id=user_id)
