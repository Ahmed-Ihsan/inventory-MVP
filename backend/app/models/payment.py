from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class PaymentType(str, enum.Enum):
    PAID = "paid"
    DEBT = "debt"
    CREDIT = "credit"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    payment_type = Column(Enum(PaymentType), nullable=False)
    description = Column(String, nullable=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)

    # Relationships
    item = relationship("Item", back_populates="payments")
    user = relationship("User", back_populates="payments")
