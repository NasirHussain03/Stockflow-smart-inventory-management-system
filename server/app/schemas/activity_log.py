from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ActivityLogListResponse(BaseModel):
    items: list[ActivityLogResponse]
    total: int
