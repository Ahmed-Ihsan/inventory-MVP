from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models.notification import Notification, NotificationType
from ..services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=List[dict])
def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    try:
        service = NotificationService(db)
        if unread_only:
            notifications = service.get_unread_notifications(limit)
        else:
            notifications = db.query(Notification).order_by(Notification.created_at.desc()).limit(limit).all()
        return [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "notification_type": n.notification_type,
                "is_read": n.is_read,
                "sale_id": n.sale_id,
                "item_id": n.item_id,
                "created_at": n.created_at.isoformat(),
                "read_at": n.read_at.isoformat() if n.read_at else None
            }
            for n in notifications
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")


@router.post("/check-due-payments")
def check_due_payments(db: Session = Depends(get_db)):
    try:
        service = NotificationService(db)
        notifications = service.check_and_create_due_notifications()
        return {"message": f"Created {len(notifications)} due payment notifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking due payments: {str(e)}")


@router.post("/check-overdue-payments")
def check_overdue_payments(db: Session = Depends(get_db)):
    try:
        service = NotificationService(db)
        notifications = service.check_and_create_overdue_notifications()
        return {"message": f"Created {len(notifications)} overdue payment notifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking overdue payments: {str(e)}")


@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    try:
        service = NotificationService(db)
        notification = service.mark_as_read(notification_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notification as read: {str(e)}")


@router.put("/read-all")
def mark_all_as_read(db: Session = Depends(get_db)):
    try:
        service = NotificationService(db)
        count = service.mark_all_as_read()
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking all notifications as read: {str(e)}")


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        db.delete(notification)
        db.commit()
        return {"message": "Notification deleted"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")
