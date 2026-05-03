from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import enum


class InstallmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class InstallmentSaleItemBase(BaseModel):
    item_id: Optional[int] = None
    item_name: str
    quantity: int
    cost_price: float
    selling_price: float
    profit_margin: float
    total_price: float


class InstallmentSaleItemCreate(InstallmentSaleItemBase):
    pass


class InstallmentSaleItemResponse(InstallmentSaleItemBase):
    id: int

    class Config:
        orm_mode = True


class InstallmentSalePaymentBase(BaseModel):
    payment_date: datetime
    amount: float
    month_number: int
    notes: Optional[str] = None


class InstallmentSalePaymentCreate(InstallmentSalePaymentBase):
    pass


class InstallmentSalePaymentResponse(InstallmentSalePaymentBase):
    id: int

    class Config:
        orm_mode = True


class InstallmentSaleBase(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    total_amount: float
    down_payment: float = 0
    remaining_amount: float
    monthly_payment: float
    total_months: int
    paid_months: int = 0
    next_payment_date: Optional[datetime] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    status: InstallmentStatus = InstallmentStatus.ACTIVE
    notes: Optional[str] = None


class InstallmentSaleCreate(InstallmentSaleBase):
    items: List[InstallmentSaleItemCreate] = []


class InstallmentSaleUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: Optional[float] = None
    down_payment: Optional[float] = None
    remaining_amount: Optional[float] = None
    monthly_payment: Optional[float] = None
    total_months: Optional[int] = None
    paid_months: Optional[int] = None
    next_payment_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[InstallmentStatus] = None
    notes: Optional[str] = None


class InstallmentSaleResponse(InstallmentSaleBase):
    id: int
    items: List[InstallmentSaleItemResponse] = []
    payments: List[InstallmentSalePaymentResponse] = []

    class Config:
        orm_mode = True


class InstallmentSaleSummary(BaseModel):
    total_sales: int
    total_amount: float
    total_paid: float
    total_remaining: float
    active_sales: int
    completed_sales: int

    class Config:
        orm_mode = True
