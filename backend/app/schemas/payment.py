from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import enum


class PaymentType(str, enum.Enum):
    PAID = "paid"
    DEBT = "debt"
    CREDIT = "credit"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class PaymentBase(BaseModel):
    amount: float
    payment_type: PaymentType
    description: Optional[str] = None
    item_id: Optional[int] = None
    user_id: Optional[int] = None
    transaction_date: datetime
    due_date: Optional[datetime] = None
    status: PaymentStatus = PaymentStatus.PENDING


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_type: Optional[PaymentType] = None
    description: Optional[str] = None
    item_id: Optional[int] = None
    user_id: Optional[int] = None
    transaction_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[PaymentStatus] = None


class Payment(PaymentBase):
    id: int

    class Config:
        orm_mode = True
