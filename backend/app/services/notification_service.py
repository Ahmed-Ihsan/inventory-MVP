from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from ..models.notification import Notification, NotificationType
from ..models.installment_sales import InstallmentSale, InstallmentStatus


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_payment_due_notification(self, sale_id: int, days_until_due: int) -> Notification:
        sale = self.db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
        if not sale:
            return None

        notification = Notification(
            title=f"دفعة مستحقة: {sale.customer_name}",
            message=f"القسط رقم {sale.paid_months + 1} من {sale.total_months} مستحق خلال {days_until_due} أيام",
            notification_type=NotificationType.PAYMENT_DUE,
            sale_id=sale_id,
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def create_payment_overdue_notification(self, sale_id: int) -> Notification:
        sale = self.db.query(InstallmentSale).filter(InstallmentSale.id == sale_id).first()
        if not sale:
            return None

        days_overdue = (datetime.utcnow() - sale.next_payment_date).days if sale.next_payment_date else 0

        notification = Notification(
            title=f"دفعة متأخرة: {sale.customer_name}",
            message=f"القسط رقم {sale.paid_months + 1} متأخر بـ {days_overdue} أيام",
            notification_type=NotificationType.PAYMENT_OVERDUE,
            sale_id=sale_id,
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def check_and_create_due_notifications(self) -> List[Notification]:
        """Check for payments due in the next 7 days and create notifications"""
        notifications = []
        upcoming_date = datetime.utcnow() + timedelta(days=7)
        
        sales = self.db.query(InstallmentSale).filter(
            InstallmentSale.status == InstallmentStatus.ACTIVE,
            InstallmentSale.next_payment_date <= upcoming_date,
            InstallmentSale.next_payment_date > datetime.utcnow()
        ).all()
        
        for sale in sales:
            days_until_due = (sale.next_payment_date - datetime.utcnow()).days
            notification = self.create_payment_due_notification(sale.id, days_until_due)
            if notification:
                notifications.append(notification)
        
        return notifications

    def check_and_create_overdue_notifications(self) -> List[Notification]:
        """Check for overdue payments and create notifications"""
        notifications = []
        
        sales = self.db.query(InstallmentSale).filter(
            InstallmentSale.status == InstallmentStatus.ACTIVE,
            InstallmentSale.next_payment_date < datetime.utcnow()
        ).all()
        
        for sale in sales:
            notification = self.create_payment_overdue_notification(sale.id)
            if notification:
                notifications.append(notification)
        
        return notifications

    def get_unread_notifications(self, limit: int = 50) -> List[Notification]:
        return self.db.query(Notification).filter(
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_as_read(self, notification_id: int) -> Notification:
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(notification)
        return notification

    def mark_all_as_read(self) -> int:
        count = self.db.query(Notification).filter(Notification.is_read == False).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        self.db.commit()
        return count
