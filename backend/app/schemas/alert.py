from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertBase(BaseModel):
    item_id: int
    alert_type: str
    message: str
    is_active: bool = True


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    resolved_at: Optional[datetime] = None


class Alert(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
