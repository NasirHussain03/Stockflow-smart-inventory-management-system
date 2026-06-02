from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.activity_log import ActivityLog
from typing import Optional

def create_log(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
    details: Optional[str] = None,
    commit: bool = True
) -> ActivityLog:
    """
    Creates a new activity log. If user_id is provided but user_name is not,
    it attempts to look up the user's full name from the database.
    """
    if user_id and not user_name:
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user_name = user.full_name

    log_entry = ActivityLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details
    )
    db.add(log_entry)
    if commit:
        db.commit()
        db.refresh(log_entry)
    return log_entry

def get_activity_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    user_id: Optional[int] = None
):
    """
    Retrieves activity logs based on pagination, search, and user scoping.
    """
    query = db.query(ActivityLog)
    
    if user_id is not None:
        query = query.filter(ActivityLog.user_id == user_id)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                ActivityLog.action.ilike(search_filter),
                ActivityLog.entity_type.ilike(search_filter),
                ActivityLog.details.ilike(search_filter),
                ActivityLog.user_name.ilike(search_filter)
            )
        )
        
    total = query.count()
    items = query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
    return items, total
