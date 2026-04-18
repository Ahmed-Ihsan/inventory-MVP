from faker import Faker
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models import category, item, alert, payment, purchase

fake = Faker()

def create_fake_categories(db: Session, num_categories: int = 5):
    categories = []
    for _ in range(num_categories):
        category_data = category.Category(
            name=fake.unique.word().capitalize(),
            description=fake.text(max_nb_chars=100)
        )
        db.add(category_data)
        categories.append(category_data)
    db.commit()
    for cat in categories:
        db.refresh(cat)
    return categories

def create_fake_items(db: Session, categories, num_items: int = 20):
    items = []
    for _ in range(num_items):
        item_data = item.Item(
            name=f"{fake.word().capitalize()} {fake.word().capitalize()}",
            description=fake.text(max_nb_chars=200),
            sku=fake.unique.ean13(),
            price=round(fake.pyfloat(left_digits=2, right_digits=2, positive=True), 2),
            category_id=fake.random_element(categories).id if categories else None,
            min_stock_level=fake.random_int(min=1, max=20),
            current_stock=fake.random_int(min=0, max=50)
        )
        db.add(item_data)
        items.append(item_data)
    db.commit()
    for it in items:
        db.refresh(it)
    return items

def create_fake_alerts(db: Session, items):
    alerts_created = 0
    for it in items:
        if it.current_stock <= it.min_stock_level:
            alert_type = "out_of_stock" if it.current_stock == 0 else "low_stock"
            message = f"{it.name} is {'out of stock' if alert_type == 'out_of_stock' else f'below minimum stock level of {it.min_stock_level}'}. Current stock: {it.current_stock}."

            existing_alert = db.query(alert.Alert).filter(
                alert.Alert.item_id == it.id,
                alert.Alert.alert_type == alert_type,
                alert.Alert.is_active == True
            ).first()

            if not existing_alert:
                alert_data = alert.Alert(
                    item_id=it.id,
                    alert_type=alert_type,
                    message=message,
                    is_active=True
                )
                db.add(alert_data)
                alerts_created += 1

    db.commit()
    return alerts_created

def create_fake_payments(db: Session, items, num_payments: int = 15):
    payment_types = ['paid', 'debt', 'credit']
    payment_statuses = ['pending', 'completed', 'overdue']
    payments = []
    for _ in range(num_payments):
        payment_data = payment.Payment(
            amount=round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2),
            payment_type=fake.random_element(payment_types),
            description=fake.text(max_nb_chars=100),
            item_id=fake.random_element(items).id if items else None,
            transaction_date=fake.date_time_between(start_date='-30d', end_date='now'),
            due_date=fake.date_time_between(start_date='now', end_date='+30d') if fake.boolean() else None,
            status=fake.random_element(payment_statuses)
        )
        db.add(payment_data)
        payments.append(payment_data)
    db.commit()
    for pay in payments:
        db.refresh(pay)
    return payments

def create_fake_purchases(db: Session, items, num_purchases: int = 10):
    payment_methods = ['cash', 'installment']
    statuses = ['pending', 'completed', 'cancelled']
    purchases = []
    for _ in range(num_purchases):
        total = round(fake.pyfloat(left_digits=4, right_digits=2, positive=True), 2)
        paid = round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2) if fake.boolean() else total
        purchase_data = purchase.Purchase(
            supplier_name=fake.company(),
            total_amount=total,
            paid_amount=min(paid, total),
            remaining_amount=max(total - paid, 0),
            payment_method=fake.random_element(payment_methods),
            description=fake.text(max_nb_chars=100),
            purchase_date=fake.date_time_between(start_date='-60d', end_date='now'),
            status=fake.random_element(statuses)
        )
        db.add(purchase_data)
        purchases.append(purchase_data)
    db.commit()
    for p in purchases:
        db.refresh(p)
    return purchases

def populate_database():
    db = SessionLocal()
    try:
        print("Creating fake categories...")
        categories = create_fake_categories(db, 5)
        print(f"Created {len(categories)} categories.")

        print("Creating fake items...")
        items = create_fake_items(db, categories, 20)
        print(f"Created {len(items)} items.")

        print("Creating fake alerts...")
        alerts_count = create_fake_alerts(db, items)
        print(f"Created {alerts_count} alerts.")

        print("Creating fake payments...")
        payments = create_fake_payments(db, items, 15)
        print(f"Created {len(payments)} payments.")

        print("Creating fake purchases...")
        purchases = create_fake_purchases(db, items, 10)
        print(f"Created {len(purchases)} purchases.")

        print("Database populated successfully!")
    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()