from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..schemas.installment_payment import (
    InstallmentPaymentCreate,
    InstallmentPaymentResponse,
    InstallmentPaymentUpdate,
)
from ..models.installment_payment import InstallmentPayment, InstallmentPaymentStatus
from ..models.purchase import Purchase

router = APIRouter()


@router.get("/purchase/{purchase_id}", response_model=List[InstallmentPaymentResponse])
def get_installment_payments(purchase_id: int, db: Session = Depends(get_db)):
    payments = db.query(InstallmentPayment).filter(
        InstallmentPayment.purchase_id == purchase_id
    ).order_by(InstallmentPayment.payment_date.desc()).all()
    return payments


@router.post("/", response_model=InstallmentPaymentResponse, status_code=201)
def create_installment_payment(payment: InstallmentPaymentCreate, db: Session = Depends(get_db)):
    # Check if purchase exists
    purchase = db.query(Purchase).filter(Purchase.id == payment.purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    # Create payment record
    db_payment = InstallmentPayment(
        purchase_id=payment.purchase_id,
        customer_name=payment.customer_name,
        customer_phone=payment.customer_phone,
        amount=payment.amount,
        payment_date=payment.payment_date or datetime.utcnow(),
        payment_method=payment.payment_method,
        reference_number=payment.reference_number,
        notes=payment.notes,
        status=payment.status
    )
    db.add(db_payment)

    # Update purchase paid amount
    purchase.paid_amount += payment.amount
    purchase.remaining_amount = purchase.total_amount - purchase.paid_amount

    if purchase.remaining_amount <= 0:
        purchase.status = "completed"
        purchase.remaining_amount = 0

    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("/{payment_id}", response_model=InstallmentPaymentResponse)
def get_installment_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = db.query(InstallmentPayment).filter(
        InstallmentPayment.id == payment_id
    ).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment


@router.put("/{payment_id}", response_model=InstallmentPaymentResponse)
def update_installment_payment(
    payment_id: int,
    payment: InstallmentPaymentUpdate,
    db: Session = Depends(get_db)
):
    db_payment = db.query(InstallmentPayment).filter(
        InstallmentPayment.id == payment_id
    ).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    # If amount is changed, update purchase amounts
    old_amount = db_payment.amount
    update_data = payment.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_payment, key, value)

    # If amount changed, adjust purchase
    if 'amount' in update_data and update_data['amount'] != old_amount:
        purchase = db.query(Purchase).filter(Purchase.id == db_payment.purchase_id).first()
        if purchase:
            purchase.paid_amount = purchase.paid_amount - old_amount + update_data['amount']
            purchase.remaining_amount = purchase.total_amount - purchase.paid_amount

    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.delete("/{payment_id}")
def delete_installment_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = db.query(InstallmentPayment).filter(
        InstallmentPayment.id == payment_id
    ).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Reverse the amount from purchase
    purchase = db.query(Purchase).filter(Purchase.id == db_payment.purchase_id).first()
    if purchase:
        purchase.paid_amount -= db_payment.amount
        purchase.remaining_amount = purchase.total_amount - purchase.paid_amount
        if purchase.remaining_amount > 0:
            purchase.status = "pending"

    db.delete(db_payment)
    db.commit()
    return {"message": "Payment deleted"}