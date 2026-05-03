from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import enum


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    CREDIT = "credit"


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SalesInvoiceItemBase(BaseModel):
    item_id: Optional[int] = None
    item_name: str
    quantity: int
    cost_price: float
    selling_price: float
    profit_margin: float
    total_price: float


class SalesInvoiceItemCreate(SalesInvoiceItemBase):
    pass


class SalesInvoiceItemResponse(SalesInvoiceItemBase):
    id: int

    class Config:
        orm_mode = True


class SalesInvoiceItemUpdate(BaseModel):
    item_id: Optional[int] = None
    item_name: Optional[str] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    profit_margin: Optional[float] = None
    total_price: Optional[float] = None


class SalesInvoiceBase(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    total_amount: float
    paid_amount: float = 0
    remaining_amount: float = 0
    payment_method: PaymentMethod
    notes: Optional[str] = None
    invoice_date: datetime
    status: InvoiceStatus = InvoiceStatus.PENDING


class SalesInvoiceCreate(SalesInvoiceBase):
    items: List[SalesInvoiceItemCreate] = []


class SalesInvoiceUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    invoice_date: Optional[datetime] = None
    status: Optional[InvoiceStatus] = None


class SalesInvoiceResponse(SalesInvoiceBase):
    id: int
    items: List[SalesInvoiceItemResponse] = []

    class Config:
        orm_mode = True


class SalesInvoiceSummary(BaseModel):
    total_invoices: int
    total_amount: float
    total_paid: float
    total_remaining: float

    class Config:
        orm_mode = True
