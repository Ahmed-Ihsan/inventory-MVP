from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    INSTALLMENT = "installment"


class PurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0)
    remaining_amount = Column(Float, default=0)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    description = Column(String, nullable=True)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(PurchaseStatus), default=PurchaseStatus.PENDING)

    # Relationships
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")

    @property
    def is_fully_paid(self):
        return self.remaining_amount == 0


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    # Relationships
    purchase = relationship("Purchase", back_populates="items")
    item = relationship("Item", back_populates="purchase_items")