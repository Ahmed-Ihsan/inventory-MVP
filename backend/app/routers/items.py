from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..database import get_db
from ..schemas.item import ItemCreate, ItemUpdate, ItemResponse
from ..models.item import Item
from ..services.alert_service import AlertService

router = APIRouter()


@router.get("/", response_model=List[ItemResponse])
def read_items(
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = Query(None),
    sku: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(Item).options(joinedload(Item.category))
        if name:
            query = query.filter(Item.name.ilike(f"%{name}%"))
        if sku:
            query = query.filter(Item.sku.ilike(f"%{sku}%"))
        if category_id:
            query = query.filter(Item.category_id == category_id)
        items = query.offset(skip).limit(limit).all()
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching items: {str(e)}")


@router.post("/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    try:
        # Check if SKU is unique
        existing_item = db.query(Item).filter(Item.sku == item.sku).first()
        if existing_item:
            raise HTTPException(status_code=400, detail="SKU already exists")

        db_item = Item(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating item: {str(e)}")


@router.get("/{item_id}", response_model=ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    try:
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if db_item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching item: {str(e)}")


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    try:
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if db_item is None:
            raise HTTPException(status_code=404, detail="Item not found")

        # Check SKU uniqueness if updating SKU
        if item.sku:
            existing_item = (
                db.query(Item).filter(Item.sku == item.sku, Item.id != item_id).first()
            )
            if existing_item:
                raise HTTPException(status_code=400, detail="SKU already exists")

        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)

        # Check for low stock alerts if stock level was updated
        if "current_stock" in update_data:
            alert_service = AlertService(db)
            alert_service.check_and_create_low_stock_alerts(item_id)

        return db_item
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating item: {str(e)}")


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    try:
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if db_item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        db.delete(db_item)
        db.commit()
        return {"message": "Item deleted"}
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete item: it may be referenced by other records")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting item: {str(e)}")
