from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import enum


class InstallmentPaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class InstallmentPaymentBase(BaseModel):
    purchase_id: int
    customer_name: str
    customer_phone: Optional[str] = None
    amount: float
    payment_date: Optional[datetime] = None
    payment_method: str = "cash"
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    status: InstallmentPaymentStatus = InstallmentPaymentStatus.COMPLETED


class InstallmentPaymentCreate(InstallmentPaymentBase):
    pass


class InstallmentPaymentUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    amount: Optional[float] = None
    payment_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[InstallmentPaymentStatus] = None


class InstallmentPaymentResponse(InstallmentPaymentBase):
    id: int

    class Config:
        orm_mode = True


class PurchaseWithPayments(BaseModel):
    id: int
    supplier_name: str
    total_amount: float
    paid_amount: float
    remaining_amount: float
    payment_method: str
    purchase_date: datetime
    status: str
    installment_payments: List[InstallmentPaymentResponse] = []

    class Config:
        orm_mode = True