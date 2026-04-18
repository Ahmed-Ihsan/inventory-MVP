from pydantic import BaseModel
from datetime import datetime


class StockMovementBase(BaseModel):
    item_id: int
    quantity_change: int
    reason: str


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementResponse(StockMovementBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
