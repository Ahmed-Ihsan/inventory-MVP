from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from ..database import get_db
from ..schemas.sales_invoice import (
    SalesInvoiceCreate,
    SalesInvoiceResponse,
    SalesInvoiceUpdate,
    SalesInvoiceSummary,
)
from ..models.sales_invoice import SalesInvoice, SalesInvoiceItem, PaymentMethod, InvoiceStatus
from ..models.item import Item

router = APIRouter()


@router.get("/", response_model=List[SalesInvoiceResponse])
def read_sales_invoices(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    payment_method: str = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(SalesInvoice).options(joinedload(SalesInvoice.items))
        if status:
            query = query.filter(SalesInvoice.status == status)
        if payment_method:
            query = query.filter(SalesInvoice.payment_method == payment_method)
        invoices = query.order_by(SalesInvoice.invoice_date.desc()).offset(skip).limit(limit).all()
        return invoices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales invoices: {str(e)}")


@router.get("/summary", response_model=SalesInvoiceSummary)
def get_sales_summary(db: Session = Depends(get_db)):
    try:
        invoices = db.query(SalesInvoice).all()
        return SalesInvoiceSummary(
            total_invoices=len(invoices),
            total_amount=sum(inv.total_amount for inv in invoices),
            total_paid=sum(inv.paid_amount for inv in invoices),
            total_remaining=sum(inv.remaining_amount for inv in invoices)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales summary: {str(e)}")


@router.get("/{invoice_id}", response_model=SalesInvoiceResponse)
def read_sales_invoice(invoice_id: int, db: Session = Depends(get_db)):
    try:
        invoice = db.query(SalesInvoice).options(joinedload(SalesInvoice.items)).filter(SalesInvoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Sales invoice not found")
        return invoice
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales invoice: {str(e)}")


@router.post("/", response_model=SalesInvoiceResponse, status_code=201)
def create_sales_invoice(invoice: SalesInvoiceCreate, db: Session = Depends(get_db)):
    # Check stock availability for each item
    for item_data in invoice.items:
        if item_data.item_id:
            item = db.query(Item).filter(Item.id == item_data.item_id).first()
            if not item:
                raise HTTPException(status_code=404, detail=f"Item with id {item_data.item_id} not found")
            if item.current_stock < item_data.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for item '{item.name}'. Available: {item.current_stock}, Required: {item_data.quantity}"
                )

    # Calculate remaining amount
    remaining = invoice.total_amount - invoice.paid_amount

    db_invoice = SalesInvoice(
        customer_name=invoice.customer_name,
        customer_phone=invoice.customer_phone,
        total_amount=invoice.total_amount,
        paid_amount=invoice.paid_amount,
        remaining_amount=remaining,
        payment_method=invoice.payment_method,
        notes=invoice.notes,
        invoice_date=invoice.invoice_date,
        status=invoice.status
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # Add invoice items and update stock
    for item_data in invoice.items:
        db_item = SalesInvoiceItem(
            invoice_id=db_invoice.id,
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
    db.refresh(db_invoice)
    return db_invoice


@router.put("/{invoice_id}", response_model=SalesInvoiceResponse)
def update_sales_invoice(invoice_id: int, invoice: SalesInvoiceUpdate, db: Session = Depends(get_db)):
    db_invoice = db.query(SalesInvoice).filter(SalesInvoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Sales invoice not found")

    for key, value in invoice.dict(exclude_unset=True).items():
        setattr(db_invoice, key, value)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@router.delete("/{invoice_id}")
def delete_sales_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(SalesInvoice).filter(SalesInvoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Sales invoice not found")
    
    # Restore stock for all items in the invoice
    for item in db_invoice.items:
        if item.item_id:
            item_obj = db.query(Item).filter(Item.id == item.item_id).first()
            if item_obj:
                item_obj.current_stock += item.quantity
    
    db.delete(db_invoice)
    db.commit()
    return {"message": "Sales invoice deleted successfully"}
