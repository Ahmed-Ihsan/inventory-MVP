import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import category, item, alert, installment_sales, purchase, sales_invoice, stock_movement, notification, user

fake = Faker()

def populate_database():
    db = SessionLocal()
    try:
        print("Clearing existing data...")
        # Clear data in reverse order of dependencies
        db.query(notification.Notification).delete()
        db.query(installment_sales.InstallmentSalePayment).delete()
        db.query(installment_sales.InstallmentSaleItem).delete()
        db.query(installment_sales.InstallmentSale).delete()
        db.query(sales_invoice.SalesInvoiceItem).delete()
        db.query(sales_invoice.SalesInvoice).delete()
        db.query(purchase.PurchaseItem).delete()
        db.query(purchase.Purchase).delete()
        db.query(stock_movement.StockMovement).delete()
        db.query(alert.Alert).delete()
        db.query(item.Item).delete()
        db.query(category.Category).delete()
        db.query(user.User).delete()
        db.commit()
        print("Cleared existing data.")

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
                name=fake.word().capitalize() + ' ' + fake.word().capitalize(),
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
                message = f"{it.name} {'نفد من المخزون' if alert_type == 'out_of_stock' else f'أقل من الحد الأدنى للمخزون ({it.min_stock_level})'}. المخزون الحالي: {it.current_stock}."
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
                total_amount = round(fake.pyfloat(left_digits=3, right_digits=2, positive=True) * 12, 2)
                down_payment = round(fake.pyfloat(left_digits=2, right_digits=2, positive=True), 2)
                monthly_payment = round((total_amount - down_payment) / 12, 2)
                installment = installment_sales.InstallmentSale(
                    customer_name=fake.name(),
                    customer_phone=fake.phone_number(),
                    total_amount=total_amount,
                    down_payment=down_payment,
                    remaining_amount=total_amount - down_payment,
                    monthly_payment=monthly_payment,
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
                item_quantity = fake.random_int(min=1, max=5)
                sale_item_data = installment_sales.InstallmentSaleItem(
                    sale_id=installment.id,
                    item_id=sale_item.id,
                    item_name=sale_item.name,
                    quantity=item_quantity,
                    cost_price=round(sale_item.price * 0.7, 2),
                    selling_price=sale_item.price,
                    profit_margin=round(((sale_item.price - (sale_item.price * 0.7)) / sale_item.price * 100), 2),
                    total_price=round(sale_item.price * item_quantity, 2),
                )
                db.add(sale_item_data)
                db.commit()
        print("Created 10 installment sales (3 overdue).")

        print("Creating fake purchases...")
        items_list = db.query(item.Item).all()
        for i in range(8):
            from datetime import datetime, timedelta
            pur_date = datetime.now() - timedelta(days=fake.random_int(min=1, max=60))
            pur = purchase.Purchase(
                supplier_name=fake.company(),
                purchase_date=pur_date,
                description=fake.text(max_nb_chars=100),
                total_amount=round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2),
                paid_amount=round(fake.pyfloat(left_digits=2, right_digits=2, positive=True), 2),
                payment_method=fake.random_element(['cash', 'installment']),
                status=fake.random_element(['pending', 'completed', 'cancelled']),
            )
            pur.remaining_amount = pur.total_amount - pur.paid_amount
            db.add(pur)
            db.commit()
            
            # Add items to purchase
            if items_list:
                for j in range(fake.random_int(min=1, max=3)):
                    pur_item = items_list[(i + j) % len(items_list)]
                    pur_item_data = purchase.PurchaseItem(
                        purchase_id=pur.id,
                        item_id=pur_item.id,
                        item_name=pur_item.name,
                        quantity=fake.random_int(min=1, max=10),
                        unit_price=pur_item.price * 0.7,
                        total_price=pur_item.price * fake.random_int(min=1, max=10),
                    )
                    db.add(pur_item_data)
                    db.commit()
        print("Created 8 purchases with items.")

        print("Creating fake sales invoices...")
        for i in range(12):
            inv_date = datetime.now() - timedelta(days=fake.random_int(min=1, max=30))
            total = round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2)
            paid = round(total * fake.random_element([0.5, 0.75, 1.0]), 2)
            inv = sales_invoice.SalesInvoice(
                customer_name=fake.name(),
                customer_phone=fake.phone_number(),
                invoice_date=inv_date,
                total_amount=total,
                paid_amount=paid,
                payment_method=fake.random_element(['cash', 'card', 'credit']),
                notes=fake.text(max_nb_chars=100) if fake.boolean(chance_of_getting_true=50) else '',
            )
            db.add(inv)
            db.commit()
            
            # Add items to invoice
            if items_list:
                for j in range(fake.random_int(min=1, max=4)):
                    inv_item = items_list[(i + j) % len(items_list)]
                    qty = fake.random_int(min=1, max=5)
                    inv_item_data = sales_invoice.SalesInvoiceItem(
                        invoice_id=inv.id,
                        item_id=inv_item.id,
                        item_name=inv_item.name,
                        quantity=qty,
                        cost_price=inv_item.price * 0.7,
                        selling_price=inv_item.price,
                        profit_margin=round(((inv_item.price - (inv_item.price * 0.7)) / inv_item.price * 100), 2),
                        total_price=inv_item.price * qty,
                    )
                    db.add(inv_item_data)
                    db.commit()
        print("Created 12 sales invoices with items.")

        print("Creating fake stock movements...")
        for i in range(15):
            mov_item = items_list[i % len(items_list)] if items_list else None
            if mov_item:
                mov = stock_movement.StockMovement(
                    item_id=mov_item.id,
                    quantity_change=fake.random_int(min=-10, max=20),
                    reason=fake.random_element(['inbound', 'outbound', 'adjustment']),
                )
                db.add(mov)
                db.commit()
                
                # Add a note to some movements
                if fake.boolean(chance_of_getting_true=40):
                    mov.notes = fake.text(max_nb_chars=100) if fake.boolean(chance_of_getting_true=50) else ''
                    db.commit()
        print("Created 15 stock movements.")

        print("Creating fake installment sale payments...")
        installment_sales_list = db.query(installment_sales.InstallmentSale).all()
        for sale in installment_sales_list:
            if sale.status == 'active' and sale.paid_months < sale.total_months:
                # Add some payments
                num_payments = fake.random_int(min=0, max=2)
                for i in range(num_payments):
                    payment_date = sale.start_date + timedelta(days=30 * (i + 1))
                    pay = installment_sales.InstallmentSalePayment(
                        sale_id=sale.id,
                        payment_date=payment_date,
                        amount=sale.monthly_payment,
                        month_number=i + 1,
                        notes=fake.text(max_nb_chars=100) if fake.boolean(chance_of_getting_true=30) else '',
                    )
                    db.add(pay)
                    # Update sale totals to stay consistent
                    sale.paid_months += 1
                    sale.remaining_amount = max(round(sale.remaining_amount - sale.monthly_payment, 2), 0)
                    if sale.remaining_amount <= 0:
                        sale.status = 'completed'
                        sale.remaining_amount = 0
                        break
                db.commit()
        print("Created installment sale payments.")

        print("Creating fake notifications...")
        for i in range(8):
            notif = notification.Notification(
                title=fake.word().capitalize(),
                message=fake.text(max_nb_chars=200),
                notification_type=fake.random_element(['payment_due', 'payment_overdue', 'low_stock', 'out_of_stock']),
                is_read=fake.boolean(chance_of_getting_true=60),
            )
            db.add(notif)
            db.commit()
        print("Created 8 notifications.")

        print("Creating admin user...")
        admin_user = user.User(
            username='admin',
            email='admin@example.com',
            hashed_password='$2b$12$dummy_hash_for_testing',  # This is a dummy hash
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        print("Created admin user.")

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