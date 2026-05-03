import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import category, item, alert, payment, installment_sales

fake = Faker()

def populate_database():
    db = SessionLocal()
    try:
        print("Creating fake categories...")
        for _ in range(5):
            cat = category.Category(
                name=fake.unique.word().capitalize(),
                description=fake.text(max_nb_chars=100)
            )
            db.add(cat)
        db.commit()
        print("Created 5 categories.")

        print("Creating fake items...")
        categories = db.query(category.Category).all()
        for _ in range(20):
            it = item.Item(
                name=fake.product_name(),
                description=fake.text(max_nb_chars=200),
                sku=fake.unique.ean13(),
                price=round(fake.pyfloat(left_digits=2, right_digits=2, positive=True), 2),
                category_id=fake.random_element(categories).id if categories else None,
                min_stock_level=fake.random_int(min=1, max=20),
                current_stock=fake.random_int(min=0, max=50)
            )
            db.add(it)
        db.commit()
        print("Created 20 items.")

        print("Creating fake alerts...")
        items_list = db.query(item.Item).all()
        alerts_created = 0
        for it in items_list:
            if it.current_stock <= it.min_stock_level:
                alert_type = "out_of_stock" if it.current_stock == 0 else "low_stock"
                message = f"{it.name} is {'out of stock' if alert_type == 'out_of_stock' else f'below minimum stock level of {it.min_stock_level}'}. Current stock: {it.current_stock}."
                existing = db.query(alert.Alert).filter(
                    alert.Alert.item_id == it.id,
                    alert.Alert.alert_type == alert_type,
                    alert.Alert.is_active == True
                ).first()
                if not existing:
                    al = alert.Alert(
                        item_id=it.id,
                        alert_type=alert_type,
                        message=message,
                        is_active=True
                    )
                    db.add(al)
                    alerts_created += 1
        db.commit()
        print(f"Created {alerts_created} alerts.")

        print("Creating fake payments...")
        items_list = db.query(item.Item).all()
        payment_types = ['paid', 'debt', 'credit']
        payment_statuses = ['pending', 'completed', 'overdue']
        for _ in range(15):
            pay = payment.Payment(
                amount=round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2),
                payment_type=fake.random_element(payment_types),
                description=fake.text(max_nb_chars=100),
                item_id=fake.random_element(items_list).id if items_list else None,
                transaction_date=fake.date_time_between(start_date='-30d', end_date='now'),
                due_date=fake.date_time_between(start_date='now', end_date='+30d') if fake.boolean() else None,
                status=fake.random_element(payment_statuses)
            )
            db.add(pay)
        db.commit()
        print("Created 15 payments.")

        print("Creating fake installment sales...")
        items_list = db.query(item.Item).all()
        for i in range(10):
            # Create installment sale with some overdue
            from datetime import datetime, timedelta
            is_overdue = i < 3  # First 3 will be overdue
            start_date = datetime.now() - timedelta(days=60) if is_overdue else datetime.now()
            next_payment_date = start_date - timedelta(days=30) if is_overdue else datetime.now() + timedelta(days=30)
            
            # Create an item for the installment sale
            if items_list:
                sale_item = items_list[i % len(items_list)]
                installment = installment_sales.InstallmentSale(
                    customer_name=fake.name(),
                    customer_phone=fake.phone_number(),
                    total_amount=round(fake.pyfloat(left_digits=3, right_digits=2, positive=True) * 12, 2),  # Total for 12 months
                    monthly_payment=round(fake.pyfloat(left_digits=2, right_digits=2, positive=True), 2),
                    paid_months=0,
                    total_months=12,
                    status='active',
                    start_date=start_date,
                    end_date=start_date + timedelta(days=365),
                    next_payment_date=next_payment_date,
                    notes=fake.text(max_nb_chars=100),
                )
                db.add(installment)
                db.commit()
                
                # Add items to the installment sale
                sale_item_data = installment_sales.InstallmentSaleItem(
                    installment_sale_id=installment.id,
                    item_id=sale_item.id,
                    item_name=sale_item.name,
                    quantity=fake.random_int(min=1, max=5),
                    cost_price=sale_item.price * 0.7,
                    selling_price=sale_item.price,
                    total_price=sale_item.price * fake.random_int(min=1, max=5),
                )
                db.add(sale_item_data)
                db.commit()
        print("Created 10 installment sales (3 overdue).")

        print("Database populated successfully!")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()