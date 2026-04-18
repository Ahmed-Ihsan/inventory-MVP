from pydantic import BaseModel
from typing import Optional


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    price: float
    category_id: Optional[int] = None
    min_stock_level: int = 0
    current_stock: int = 0


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    min_stock_level: Optional[int] = None
    current_stock: Optional[int] = None


class ItemResponse(ItemBase):
    id: int

    class Config:
        orm_mode = True
