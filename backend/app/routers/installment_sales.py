from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from calendar import monthrange

from ..database import get_db
from ..schemas.installment_sales import (
    InstallmentSaleCreate,
    InstallmentSaleResponse,
    InstallmentSaleUpdate,
    InstallmentSaleSummary,
    InstallmentSalePaymentCreate,
    InstallmentSalePaymentResponse,
)
from ..models.installment_sales import (
    InstallmentSale,
    InstallmentSaleItem,
    InstallmentSalePayment,
    InstallmentStatus,
)
from ..models.item import Item

router = APIRouter()


@router.get("/", response_model=List[InstallmentSaleResponse])
def read_installment_sales(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(InstallmentSale)
    if status:
        query = query.filter(InstallmentSale.status == status)
    sales = query.order_by(InstallmentSale.start_date.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/summary", response_model=InstallmentSaleSummary)
def get_installment_summary(db: Session = Depends(get_db)):
    sales = db.query(InstallmentSale).all()
    return InstallmentSaleSummary(
        total_sales=len(sales),
        total_amount=sum(s.total_amount for s in sales),
        total_paid=sum(s.down_payment + (s.paid_months * s.monthly_payment) for s in sales),
        total_remaining=sum(s.remaining_amount for s in sales),
        active_sales=len([s for s in sales if s.status == InstallmentStatus.ACTIVE]),
        completed_sales=len([s for s in sales if s.status == InstallmentStatus.COMPLETED])
    )


@router.get("/{sale_id}", response_model=InstallmentSaleResponse)
def read_installment_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    return sale


@router.post("/", response_model=InstallmentSaleResponse, status_code=201)
def create_installment_sale(sale: InstallmentSaleCreate, db: Session = Depends(get_db)):
    # Calculate next payment date (1 month from start date)
    start_dt = sale.start_date
    next_payment_date = add_months(start_dt, 1)
    
    # Calculate end date
    end_date = add_months(start_dt, sale.total_months)

    db_sale = InstallmentSale(
        customer_name=sale.customer_name,
        customer_phone=sale.customer_phone,
        total_amount=sale.total_amount,
        down_payment=sale.down_payment,
        remaining_amount=sale.remaining_amount,
        monthly_payment=sale.monthly_payment,
        total_months=sale.total_months,
        paid_months=sale.paid_months,
        next_payment_date=next_payment_date,
        start_date=sale.start_date,
        end_date=end_date,
        status=sale.status,
        notes=sale.notes
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    # Add sale items and update stock
    for item_data in sale.items:
        db_item = InstallmentSaleItem(
            sale_id=db_sale.id,
            item_id=item_data.item_id,
            item_name=item_data.item_name,
            quantity=item_data.quantity,
            cost_price=item_data.cost_price,
            selling_price=item_data.selling_price,
            profit_margin=item_data.profit_margin,
            total_price=item_data.total_price
        )
        db.add(db_item)

        # Deduct stock if item exists
        if item_data.item_id:
            item = db.query(Item).filter(Item.id == item_data.item_id).first()
            if item:
                item.current_stock -= item_data.quantity

    db.commit()
    db.refresh(db_sale)
    return db_sale


def add_months(dt, months):
    """Add months to a datetime object"""
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    day = min(dt.day, monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


@router.post("/{sale_id}/payment", response_model=InstallmentSalePaymentResponse, status_code=201)
def create_payment(sale_id: int, payment: InstallmentSalePaymentCreate, db: Session = Depends(get_db)):
    sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    
    if sale.status == InstallmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Installment sale is already completed")
    
    if payment.month_number != sale.paid_months + 1:
        raise HTTPException(status_code=400, detail=f"Payment for month {payment.month_number} is out of order. Expected month {sale.paid_months + 1}")

    db_payment = InstallmentSalePayment(
        sale_id=sale_id,
        payment_date=payment.payment_date,
        amount=payment.amount,
        month_number=payment.month_number,
        notes=payment.notes
    )
    db.add(db_payment)

    # Update sale
    sale.paid_months += 1
    sale.remaining_amount -= payment.amount
    
    # Update next payment date
    if sale.paid_months < sale.total_months:
        sale.next_payment_date = add_months(payment.payment_date, 1)
    else:
        # All payments completed
        sale.status = InstallmentStatus.COMPLETED
        sale.next_payment_date = None

    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("/{sale_id}/payments", response_model=List[InstallmentSalePaymentResponse])
def get_sale_payments(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    return sale.payments


@router.put("/{sale_id}", response_model=InstallmentSaleResponse)
def update_installment_sale(sale_id: int, sale: InstallmentSaleUpdate, db: Session = Depends(get_db)):
    db_sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")

    for key, value in sale.dict(exclude_unset=True).items():
        setattr(db_sale, key, value)

    db.commit()
    db.refresh(db_sale)
    return db_sale


@router.delete("/{sale_id}")
def delete_installment_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    db.delete(db_sale)
    db.commit()
    return {"message": "Installment sale deleted successfully"}
