from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class InstallmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class InstallmentSale(Base):
    __tablename__ = "installment_sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False, index=True)
    customer_phone = Column(String, nullable=True, index=True)
    total_amount = Column(Float, nullable=False)
    down_payment = Column(Float, default=0)
    remaining_amount = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    total_months = Column(Integer, nullable=False)
    paid_months = Column(Integer, default=0)
    next_payment_date = Column(DateTime, nullable=True, index=True)
    start_date = Column(DateTime, default=datetime.utcnow, index=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(Enum(InstallmentStatus), default=InstallmentStatus.ACTIVE, index=True)
    notes = Column(String, nullable=True)

    # Relationships
    items = relationship("InstallmentSaleItem", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("InstallmentSalePayment", back_populates="sale", cascade="all, delete-orphan")

    @property
    def is_fully_paid(self):
        return self.paid_months >= self.total_months

    def validate_remaining_amount(self):
        """Ensure remaining_amount is never negative due to floating-point errors"""
        if self.remaining_amount < 0:
            self.remaining_amount = max(round(self.remaining_amount, 2), 0)
        return self.remaining_amount


class InstallmentSaleItem(Base):
    __tablename__ = "installment_sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("installment_sales.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    profit_margin = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    # Relationships
    sale = relationship("InstallmentSale", back_populates="items")
    item = relationship("Item", back_populates="installment_sale_items")


class InstallmentSalePayment(Base):
    __tablename__ = "installment_sale_payments"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("installment_sales.id", ondelete="CASCADE"), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow, index=True)
    amount = Column(Float, nullable=False)
    month_number = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)

    # Relationships
    sale = relationship("InstallmentSale", back_populates="payments")
