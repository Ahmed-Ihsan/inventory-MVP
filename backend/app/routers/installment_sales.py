from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from calendar import monthrange
import csv
import io

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
    overdue_only: bool = False,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(InstallmentSale).options(
            joinedload(InstallmentSale.items),
            joinedload(InstallmentSale.payments)
        )
        
        if status:
            query = query.filter(InstallmentSale.status == status)
        
        if overdue_only:
            # Server-side overdue detection: active or overdue sales with next_payment_date in the past
            query = query.filter(
                (InstallmentSale.status == InstallmentStatus.ACTIVE) | (InstallmentSale.status == InstallmentStatus.OVERDUE),
                InstallmentSale.next_payment_date < datetime.utcnow()
            )
        
        sales = query.order_by(InstallmentSale.start_date.desc()).offset(skip).limit(limit).all()
        
        # Update overdue status for active sales
        for sale in sales:
            if (sale.status == InstallmentStatus.ACTIVE and 
                sale.next_payment_date and 
                sale.next_payment_date < datetime.utcnow()):
                sale.status = InstallmentStatus.OVERDUE
        
        db.commit()
        return sales
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching installment sales: {str(e)}")


@router.get("/summary", response_model=InstallmentSaleSummary)
def get_installment_summary(db: Session = Depends(get_db)):
    try:
        sales = db.query(InstallmentSale).all()
        return InstallmentSaleSummary(
            total_sales=len(sales),
            total_amount=sum(s.total_amount for s in sales),
            total_paid=sum(s.down_payment + (s.paid_months * s.monthly_payment) for s in sales),
            total_remaining=sum(s.remaining_amount for s in sales),
            active_sales=len([s for s in sales if s.status == InstallmentStatus.ACTIVE]),
            completed_sales=len([s for s in sales if s.status == InstallmentStatus.COMPLETED])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching installment summary: {str(e)}")


@router.get("/{sale_id}", response_model=InstallmentSaleResponse)
def read_installment_sale(sale_id: int, db: Session = Depends(get_db)):
    try:
        sale = db.query(InstallmentSale).options(
            joinedload(InstallmentSale.items),
            joinedload(InstallmentSale.payments)
        ).filter(InstallmentSale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Installment sale not found")
        return sale
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching installment sale: {str(e)}")


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
    return dt.replace(year=year, month=month, day=day, hour=dt.hour, minute=dt.minute, second=dt.second, microsecond=dt.microsecond)


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
    

    # Recalculate remaining amount from total and all payments to avoid floating-point errors
    total_paid = sale.down_payment + sum(p.amount for p in sale.payments) + payment.amount
    sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)

    # Update next payment date or mark as completed
    if sale.remaining_amount <= 0:
        # All payments completed (early payoff or regular completion)
        sale.status = InstallmentStatus.COMPLETED
        sale.remaining_amount = 0
        sale.next_payment_date = None
    elif sale.paid_months < sale.total_months:
        # Continue with installment plan (use original scheduled date, not actual payment date)
        sale.next_payment_date = add_months(sale.next_payment_date, 1)
    else:
        # All scheduled payments made but still has remaining amount (shouldn't happen)
        sale.next_payment_date = None

    # for attr_name, attr_value in vars(sale).items():
    #     if attr_name != '__class__':
    #         print(f"{attr_name}: {attr_value}")

    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("/{sale_id}/payments", response_model=List[InstallmentSalePaymentResponse])
def get_sale_payments(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    return sale.payments


@router.get("/{sale_id}/payments/{payment_id}/receipt")
def get_payment_receipt(sale_id: int, payment_id: int, db: Session = Depends(get_db)):
    sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Installment sale not found")
    
    payment = db.query(InstallmentSalePayment).filter(
        InstallmentSalePayment.id == payment_id,
        InstallmentSalePayment.sale_id == sale_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    receipt = {
        "receipt_id": f"RCP-{payment.id:06d}",
        "customer_name": sale.customer_name,
        "customer_phone": sale.customer_phone,
        "payment_date": payment.payment_date.strftime("%Y-%m-%d %H:%M:%S"),
        "amount": payment.amount,
        "month_number": payment.month_number,
        "total_months": sale.total_months,
        "remaining_amount": sale.remaining_amount,
        "sale_id": sale.id,
        "notes": payment.notes
    }
    return receipt


@router.post("/{sale_id}/payments/{payment_id}/refund")
def refund_payment(sale_id: int, payment_id: int, reason: str = None, db: Session = Depends(get_db)):
    try:
        sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Installment sale not found")
        
        payment = db.query(InstallmentSalePayment).filter(
            InstallmentSalePayment.id == payment_id,
            InstallmentSalePayment.sale_id == sale_id
        ).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Check if payment was already refunded
        if payment.notes and "REFUNDED" in payment.notes:
            raise HTTPException(status_code=400, detail="Payment already refunded")
        
        # Update sale to reverse the payment
        sale.paid_months -= 1

        # Recalculate remaining amount from total and all payments (excluding the refunded one)
        total_paid = sale.down_payment + sum(p.amount for p in sale.payments if p.id != payment_id)
        sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)
        
        # Update status if it was completed
        if sale.status == InstallmentStatus.COMPLETED:
            sale.status = InstallmentStatus.ACTIVE
            # Recalculate next payment date
            if payment.payment_date:
                sale.next_payment_date = add_months(payment.payment_date, 1)
        
        # Mark payment as refunded
        payment.notes = f"REFUNDED: {reason}" if reason else "REFUNDED"
        
        db.commit()
        
        return {
            "message": "Payment refunded successfully",
            "refund_amount": payment.amount,
            "remaining_amount": sale.remaining_amount
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error refunding payment: {str(e)}")


@router.get("/{sale_id}/payments/export")
def export_payment_history(sale_id: int, db: Session = Depends(get_db)):
    try:
        sale = db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Installment sale not found")
        
        payments = sale.payments
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(["Payment ID", "Customer Name", "Payment Date", "Amount", "Month Number", "Notes"])
        
        # Write payment data
        for payment in payments:
            writer.writerow([
                payment.id,
                sale.customer_name,
                payment.payment_date.strftime("%Y-%m-%d %H:%M:%S"),
                payment.amount,
                payment.month_number,
                payment.notes or ""
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="payment_history_sale_{sale_id}.csv"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting payment history: {str(e)}")


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
    
    # Restore stock for all items in the sale
    for item in db_sale.items:
        if item.item_id:
            item_obj = db.query(Item).filter(Item.id == item.item_id).first()
            if item_obj:
                item_obj.current_stock += item.quantity
    
    db.delete(db_sale)
    db.commit()
    return {"message": "Installment sale deleted successfully"}
