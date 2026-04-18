from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class InstallmentPaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class InstallmentPayment(Base):
    __tablename__ = "installment_payments"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String, default="cash")  # cash, bank_transfer, etc.
    reference_number = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    status = Column(Enum(InstallmentPaymentStatus), default=InstallmentPaymentStatus.COMPLETED)

    # Relationships
    purchase = relationship("Purchase", back_populates="installment_payments")