from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..schemas import payment as payment_schema
from ..services.payment_service import PaymentService

router = APIRouter()


@router.get("/", response_model=List[payment_schema.Payment])
def get_payments(
    skip: int = 0,
    limit: int = 100,
    payment_type: Optional[payment_schema.PaymentType] = None,
    status: Optional[payment_schema.PaymentStatus] = None,
    item_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Get payments with optional filtering"""
    service = PaymentService(db)
    return service.get_payments(
        skip=skip,
        limit=limit,
        payment_type=payment_type,
        status=status,
        item_id=item_id,
        user_id=user_id,
    )


@router.get("/{payment_id}", response_model=payment_schema.Payment)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get a specific payment by ID"""
    service = PaymentService(db)
    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found"
        )
    return payment


@router.post(
    "/", response_model=payment_schema.Payment, status_code=status.HTTP_201_CREATED
)
def create_payment(
    payment: payment_schema.PaymentCreate, db: Session = Depends(get_db)
):
    """Create a new payment"""
    service = PaymentService(db)
    return service.create_payment(payment)


@router.put("/{payment_id}", response_model=payment_schema.Payment)
def update_payment(
    payment_id: int,
    payment_update: payment_schema.PaymentUpdate,
    db: Session = Depends(get_db),
):
    """Update a payment"""
    service = PaymentService(db)
    updated_payment = service.update_payment(payment_id, payment_update)
    if not updated_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found"
        )
    return updated_payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Delete a payment"""
    service = PaymentService(db)
    if not service.delete_payment(payment_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found"
        )
    return None


@router.get("/summary/debt", response_model=dict)
def get_total_debt(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get total debt amount"""
    service = PaymentService(db)
    total = service.get_total_debt(user_id)
    return {"total_debt": total}


@router.get("/summary/paid", response_model=dict)
def get_total_paid(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get total paid amount"""
    service = PaymentService(db)
    total = service.get_total_paid(user_id)
    return {"total_paid": total}


@router.post("/check-overdue", response_model=List[payment_schema.Payment])
def check_overdue_payments(db: Session = Depends(get_db)):
    """Check and mark overdue payments"""
    service = PaymentService(db)
    return service.check_overdue_payments()
