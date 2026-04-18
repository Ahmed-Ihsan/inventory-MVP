from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.scanning_service import decode_barcode
from ..models.item import Item
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.post("/scan", response_model=dict)
def scan_barcode(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = file.file.read()
    sku = decode_barcode(image_bytes)

    if not sku:
        raise HTTPException(status_code=400, detail="Barcode not found or unreadable")

    # Find item by SKU
    item = db.query(Item).filter(Item.sku == sku).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found for this SKU")

    # Return item info or update stock? For MVP, return item
    return {"sku": sku, "item": item.name, "current_stock": item.current_stock}
