from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..models import alert as alert_model
from ..schemas import alert as alert_schema

class AlertService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_active_alerts(self) -> List[alert_model.Alert]:
        """Get all active alerts"""
        return self.db.query(alert_model.Alert).filter(
            alert_model.Alert.is_active == True
        ).all()
    
    def get_alert(self, alert_id: int) -> Optional[alert_model.Alert]:
        """Get a specific alert by ID"""
        return self.db.query(alert_model.Alert).filter(
            alert_model.Alert.id == alert_id
        ).first()
    
    def create_alert(self, alert: alert_schema.AlertCreate) -> alert_model.Alert:
        """Create a new alert"""
        db_alert = alert_model.Alert(
            item_id=alert.item_id,
            alert_type=alert.alert_type,
            message=alert.message,
            is_active=alert.is_active
        )
        self.db.add(db_alert)
        self.db.commit()
        self.db.refresh(db_alert)
        return db_alert
    
    def update_alert(self, alert_id: int, alert_update: alert_schema.AlertUpdate) -> Optional[alert_model.Alert]:
        """Update an alert (e.g., resolve it)"""
        db_alert = self.get_alert(alert_id)
        if not db_alert:
            return None
        
        if alert_update.is_active is not None:
            db_alert.is_active = alert_update.is_active
            if not alert_update.is_active:  # If resolving the alert
                db_alert.resolved_at = datetime.utcnow()
        
        if alert_update.resolved_at is not None:
            db_alert.resolved_at = alert_update.resolved_at
        
        self.db.commit()
        self.db.refresh(db_alert)
        return db_alert
    
    def delete_alert(self, alert_id: int) -> bool:
        """Delete an alert"""
        db_alert = self.get_alert(alert_id)
        if not db_alert:
            return False
        
        self.db.delete(db_alert)
        self.db.commit()
        return True
    
    def check_and_create_low_stock_alerts(self, item_id: int) -> Optional[alert_model.Alert]:
        """Check if an item is below minimum stock and create alert if needed"""
        from ..models import item as item_model
        
        item = self.db.query(item_model.Item).filter(
            item_model.Item.id == item_id
        ).first()
        
        if not item:
            return None
        
        # Check if item is below minimum stock
        if item.current_stock < item.min_stock_level:
            # Check if there's already an active alert for this item
            existing_alert = self.db.query(alert_model.Alert).filter(
                alert_model.Alert.item_id == item_id,
                alert_model.Alert.is_active == True,
                alert_model.Alert.alert_type == "low_stock"
            ).first()
            
            if not existing_alert:
                # Create a new low stock alert
                alert_data = alert_schema.AlertCreate(
                    item_id=item_id,
                    alert_type="low_stock",
                    message=f"Item {item.name} is below minimum stock level. Current: {item.current_stock}, Minimum: {item.min_stock_level}",
                    is_active=True
                )
                return self.create_alert(alert_data)
        
        return None