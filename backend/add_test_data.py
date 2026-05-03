import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import item, installment_sales

def add_test_data():
    db = SessionLocal()
    try:
        print("Adding test installment sales...")
        
        # Get some items
        items_list = db.query(item.Item).all()
        if not items_list:
            print("No items found. Please create items first.")
            return
        
        # Create 3 overdue installment sales
        for i in range(3):
            sale_item = items_list[i % len(items_list)]
            start_date = datetime.now() - timedelta(days=60)
            next_payment_date = start_date - timedelta(days=30)  # Overdue
            
            installment = installment_sales.InstallmentSale(
                customer_name=f"زبون اختبار {i+1}",
                customer_phone=f"0770123456{i}",
                total_amount=120000.0,
                down_payment=0.0,
                remaining_amount=120000.0,
                monthly_payment=10000.0,
                paid_months=0,
                total_months=12,
                status='active',
                start_date=start_date,
                end_date=start_date + timedelta(days=365),
                next_payment_date=next_payment_date,
                notes="بيانات اختبار",
            )
            db.add(installment)
            db.commit()
            
            # Add item to the installment sale
            sale_item_data = installment_sales.InstallmentSaleItem(
                sale_id=installment.id,
                item_id=sale_item.id,
                item_name=sale_item.name,
                quantity=1,
                cost_price=sale_item.price * 0.7 if sale_item.price else 0,
                selling_price=sale_item.price if sale_item.price else 0,
                total_price=sale_item.price if sale_item.price else 0,
                profit_margin=30.0,
            )
            db.add(sale_item_data)
            db.commit()
        
        print("Created 3 overdue installment sales successfully!")
        
        # Create 2 active (not overdue) installment sales
        for i in range(2):
            sale_item = items_list[(i + 3) % len(items_list)]
            start_date = datetime.now()
            next_payment_date = datetime.now() + timedelta(days=30)  # Future date
            
            installment = installment_sales.InstallmentSale(
                customer_name=f"زبون نشط {i+1}",
                customer_phone=f"0770123456{i+3}",
                total_amount=120000.0,
                down_payment=0.0,
                remaining_amount=120000.0,
                monthly_payment=10000.0,
                paid_months=0,
                total_months=12,
                status='active',
                start_date=start_date,
                end_date=start_date + timedelta(days=365),
                next_payment_date=next_payment_date,
                notes="بيانات اختبار",
            )
            db.add(installment)
            db.commit()
            
            # Add item to the installment sale
            sale_item_data = installment_sales.InstallmentSaleItem(
                sale_id=installment.id,
                item_id=sale_item.id,
                item_name=sale_item.name,
                quantity=1,
                cost_price=sale_item.price * 0.7 if sale_item.price else 0,
                selling_price=sale_item.price if sale_item.price else 0,
                total_price=sale_item.price if sale_item.price else 0,
                profit_margin=30.0,
            )
            db.add(sale_item_data)
            db.commit()
        
        print("Created 2 active installment sales successfully!")
        print("Total: 3 overdue + 2 active = 5 installment sales")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_data()
