from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from ..models import payment as payment_model
from ..schemas import payment as payment_schema


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get_payments(
        self,
        skip: int = 0,
        limit: int = 100,
        payment_type: Optional[payment_schema.PaymentType] = None,
        status: Optional[payment_schema.PaymentStatus] = None,
        item_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> List[payment_model.Payment]:
        """Get payments with optional filtering"""
        query = self.db.query(payment_model.Payment)

        if payment_type:
            query = query.filter(payment_model.Payment.payment_type == payment_type)
        if status:
            query = query.filter(payment_model.Payment.status == status)
        if item_id:
            query = query.filter(payment_model.Payment.item_id == item_id)
        if user_id:
            query = query.filter(payment_model.Payment.user_id == user_id)

        return query.offset(skip).limit(limit).all()

    def get_payment(self, payment_id: int) -> Optional[payment_model.Payment]:
        """Get a specific payment by ID"""
        return (
            self.db.query(payment_model.Payment)
            .filter(payment_model.Payment.id == payment_id)
            .first()
        )

    def create_payment(
        self, payment: payment_schema.PaymentCreate
    ) -> payment_model.Payment:
        """Create a new payment"""
        db_payment = payment_model.Payment(**payment.dict())
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def update_payment(
        self, payment_id: int, payment_update: payment_schema.PaymentUpdate
    ) -> Optional[payment_model.Payment]:
        """Update a payment"""
        db_payment = self.get_payment(payment_id)
        if not db_payment:
            return None

        update_data = payment_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_payment, key, value)

        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def delete_payment(self, payment_id: int) -> bool:
        """Delete a payment"""
        db_payment = self.get_payment(payment_id)
        if not db_payment:
            return False

        self.db.delete(db_payment)
        self.db.commit()
        return True

    def get_total_debt(self, user_id: Optional[int] = None) -> float:
        """Calculate total debt amount"""
        query = self.db.query(payment_model.Payment).filter(
            payment_model.Payment.payment_type == payment_schema.PaymentType.DEBT,
            payment_model.Payment.status.in_(
                [
                    payment_schema.PaymentStatus.PENDING,
                    payment_schema.PaymentStatus.OVERDUE,
                ]
            ),
        )

        if user_id:
            query = query.filter(payment_model.Payment.user_id == user_id)

        payments = query.all()
        return sum(payment.amount for payment in payments)

    def get_total_paid(self, user_id: Optional[int] = None) -> float:
        """Calculate total paid amount"""
        query = self.db.query(payment_model.Payment).filter(
            payment_model.Payment.payment_type == payment_schema.PaymentType.PAID,
            payment_model.Payment.status == payment_schema.PaymentStatus.COMPLETED,
        )

        if user_id:
            query = query.filter(payment_model.Payment.user_id == user_id)

        payments = query.all()
        return sum(payment.amount for payment in payments)

    def check_overdue_payments(self) -> List[payment_model.Payment]:
        """Check for payments that should be marked as overdue"""
        now = datetime.utcnow()
        overdue_payments = (
            self.db.query(payment_model.Payment)
            .filter(
                payment_model.Payment.due_date < now,
                payment_model.Payment.status == payment_schema.PaymentStatus.PENDING,
                payment_model.Payment.payment_type == payment_schema.PaymentType.DEBT,
            )
            .all()
        )

        # Mark them as overdue
        for payment in overdue_payments:
            payment.status = payment_schema.PaymentStatus.OVERDUE

        if overdue_payments:
            self.db.commit()

        return overdue_payments
