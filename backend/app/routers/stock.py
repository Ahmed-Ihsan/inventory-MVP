from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.stock_movement import StockMovementCreate, StockMovementResponse
from ..models.stock_movement import StockMovement
from ..models.item import Item
from ..services.alert_service import AlertService

router = APIRouter()


@router.get("/levels", response_model=List[dict])
def read_stock_levels(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    stock_levels = [
        {
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "current_stock": item.current_stock,
            "min_stock_level": item.min_stock_level,
        }
        for item in items
    ]
    return stock_levels


@router.post("/movement", response_model=StockMovementResponse)
def create_stock_movement(movement: StockMovementCreate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == movement.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Determine if we should add or subtract based on reason
    if movement.reason in ['outbound', 'adjustment'] and movement.quantity_change > 0:
        # For outbound and adjustment with positive number, subtract
        item.current_stock -= movement.quantity_change
    else:
        # For inbound, add the quantity
        item.current_stock += movement.quantity_change

    # Check for low stock alerts
    alert_service = AlertService(db)
    alert_service.check_and_create_low_stock_alerts(item.id)

    # Create movement record
    db_movement = StockMovement(**movement.dict())
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement


@router.get("/movements", response_model=List[StockMovementResponse])
def read_stock_movements(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    movements = db.query(StockMovement).offset(skip).limit(limit).all()
    return movements
