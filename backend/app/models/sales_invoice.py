from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    CREDIT = "credit"


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SalesInvoice(Base):
    __tablename__ = "sales_invoices"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False, index=True)
    customer_phone = Column(String, nullable=True, index=True)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0)
    remaining_amount = Column(Float, default=0)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    notes = Column(String, nullable=True)
    invoice_date = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.PENDING, index=True)

    # Relationships
    items = relationship("SalesInvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

    @property
    def is_fully_paid(self):
        return self.remaining_amount == 0


class SalesInvoiceItem(Base):
    __tablename__ = "sales_invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("sales_invoices.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    profit_margin = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    # Relationships
    invoice = relationship("SalesInvoice", back_populates="items")
    item = relationship("Item", back_populates="sales_invoice_items")
