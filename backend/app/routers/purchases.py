from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..schemas.purchase import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseUpdate,
    PurchaseSummary,
)
from ..models.purchase import Purchase, PurchaseItem, PaymentMethod, PurchaseStatus

router = APIRouter()


@router.get("/", response_model=List[PurchaseResponse])
def read_purchases(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    payment_method: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Purchase)
    if status:
        query = query.filter(Purchase.status == status)
    if payment_method:
        query = query.filter(Purchase.payment_method == payment_method)
    purchases = query.order_by(Purchase.purchase_date.desc()).offset(skip).limit(limit).all()
    return purchases


@router.get("/summary", response_model=PurchaseSummary)
def get_purchase_summary(db: Session = Depends(get_db)):
    purchases = db.query(Purchase).all()
    return PurchaseSummary(
        total_purchases=len(purchases),
        total_amount=sum(p.total_amount for p in purchases),
        total_paid=sum(p.paid_amount for p in purchases),
        total_remaining=sum(p.remaining_amount for p in purchases)
    )


@router.post("/", response_model=PurchaseResponse, status_code=201)
def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    # Calculate remaining amount
    remaining = purchase.total_amount - purchase.paid_amount

    db_purchase = Purchase(
        supplier_name=purchase.supplier_name,
        total_amount=purchase.total_amount,
        paid_amount=purchase.paid_amount,
        remaining_amount=remaining,
        payment_method=purchase.payment_method,
        description=purchase.description,
        purchase_date=purchase.purchase_date,
        status=purchase.status
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)

    # Add purchase items
    for item_data in purchase.items:
        db_item = PurchaseItem(
            purchase_id=db_purchase.id,
            item_id=item_data.item_id,
            item_name=item_data.item_name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.total_price
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def read_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return db_purchase


@router.put("/{purchase_id}", response_model=PurchaseResponse)
def update_purchase(
    purchase_id: int,
    purchase: PurchaseUpdate,
    db: Session = Depends(get_db)
):
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")

    update_data = purchase.dict(exclude_unset=True)

    # Recalculate remaining if amounts changed
    if 'total_amount' in update_data or 'paid_amount' in update_data:
        total = update_data.get('total_amount', db_purchase.total_amount)
        paid = update_data.get('paid_amount', db_purchase.paid_amount)
        update_data['remaining_amount'] = total - paid

    for key, value in update_data.items():
        setattr(db_purchase, key, value)

    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.put("/{purchase_id}/pay", response_model=PurchaseResponse)
def make_payment(
    purchase_id: int,
    amount: float,
    db: Session = Depends(get_db)
):
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")

    db_purchase.paid_amount += amount
    db_purchase.remaining_amount = db_purchase.total_amount - db_purchase.paid_amount

    if db_purchase.remaining_amount <= 0:
        db_purchase.status = PurchaseStatus.COMPLETED
        db_purchase.remaining_amount = 0

    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.delete("/{purchase_id}")
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    db.delete(db_purchase)
    db.commit()
    return {"message": "Purchase deleted"}