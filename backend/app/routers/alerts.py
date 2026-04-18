from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import alert as alert_schema
from ..models import alert as alert_model
from ..services.alert_service import AlertService

router = APIRouter()


@router.get("/", response_model=List[alert_schema.Alert])
def get_active_alerts(db: Session = Depends(get_db)):
    """Get all active alerts"""
    service = AlertService(db)
    return service.get_active_alerts()


@router.get("/{alert_id}", response_model=alert_schema.Alert)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific alert by ID"""
    service = AlertService(db)
    alert = service.get_alert(alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )
    return alert


@router.post(
    "/", response_model=alert_schema.Alert, status_code=status.HTTP_201_CREATED
)
def create_alert(alert: alert_schema.AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert"""
    service = AlertService(db)
    return service.create_alert(alert)


@router.put("/{alert_id}", response_model=alert_schema.Alert)
def update_alert(
    alert_id: int, alert_update: alert_schema.AlertUpdate, db: Session = Depends(get_db)
):
    """Update an alert (e.g., resolve it)"""
    service = AlertService(db)
    updated_alert = service.update_alert(alert_id, alert_update)
    if not updated_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )
    return updated_alert


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    service = AlertService(db)
    if not service.delete_alert(alert_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )
    return None
