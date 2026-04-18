from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import enum


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    INSTALLMENT = "installment"


class PurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PurchaseItemBase(BaseModel):
    item_id: Optional[int] = None
    item_name: str
    quantity: int
    unit_price: float
    total_price: float


class PurchaseItemCreate(PurchaseItemBase):
    pass


class PurchaseItemResponse(PurchaseItemBase):
    id: int

    class Config:
        orm_mode = True


class PurchaseItemUpdate(BaseModel):
    item_id: Optional[int] = None
    item_name: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None


class PurchaseBase(BaseModel):
    supplier_name: str
    total_amount: float
    paid_amount: float = 0
    remaining_amount: float = 0
    payment_method: PaymentMethod
    description: Optional[str] = None
    purchase_date: datetime
    status: PurchaseStatus = PurchaseStatus.PENDING


class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate] = []


class PurchaseUpdate(BaseModel):
    supplier_name: Optional[str] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    description: Optional[str] = None
    purchase_date: Optional[datetime] = None
    status: Optional[PurchaseStatus] = None


class PurchaseResponse(PurchaseBase):
    id: int
    items: List[PurchaseItemResponse] = []

    class Config:
        orm_mode = True


class PurchaseSummary(BaseModel):
    total_purchases: int
    total_amount: float
    total_paid: float
    total_remaining: float

    class Config:
        orm_mode = True