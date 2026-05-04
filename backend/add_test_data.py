import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import item, category, installment_sales

def add_test_data():
    db = SessionLocal()
    try:
        print("Adding test data...")
        
        # Create categories first
        categories = []
        category_names = ["إلكترونيات", "ملابس", "أدوات منزلية", "مستحضرات تجميل", "أحذية"]
        for cat_name in category_names:
            cat = category.Category(
                name=cat_name,
                description=f"فئة {cat_name}"
            )
            db.add(cat)
            db.commit()
            db.refresh(cat)
            categories.append(cat)
        
        print(f"Created {len(categories)} categories")
        
        # Create items
        items_data = [
            {"name": "لابتوب HP", "sku": "LAP001", "price": 1200000, "category_id": categories[0].id, "current_stock": 15, "min_stock_level": 5},
            {"name": "هاتف سامسونج", "sku": "PHN001", "price": 450000, "category_id": categories[0].id, "current_stock": 20, "min_stock_level": 10},
            {"name": "تيشيرت قطن", "sku": "CLT001", "price": 25000, "category_id": categories[1].id, "current_stock": 50, "min_stock_level": 20},
            {"name": "بنطلون جينز", "sku": "JEAN001", "price": 35000, "category_id": categories[1].id, "current_stock": 30, "min_stock_level": 15},
            {"name": "غسالة سامسونج", "sku": "WASH001", "price": 750000, "category_id": categories[2].id, "current_stock": 8, "min_stock_level": 3},
            {"name": "ثلاجة LG", "sku": "FRIDGE001", "price": 950000, "category_id": categories[2].id, "current_stock": 6, "min_stock_level": 2},
            {"name": "كريم الوجه", "sku": "CRM001", "price": 45000, "category_id": categories[3].id, "current_stock": 40, "min_stock_level": 15},
            {"name": "صابون طبيعي", "sku": "SOAP001", "price": 12000, "category_id": categories[3].id, "current_stock": 60, "min_stock_level": 25},
            {"name": "حذاء رياضي", "sku": "SHOE001", "price": 55000, "category_id": categories[4].id, "current_stock": 25, "min_stock_level": 10},
            {"name": "حذاء كلاسيك", "sku": "SHOE002", "price": 85000, "category_id": categories[4].id, "current_stock": 18, "min_stock_level": 8},
        ]
        
        items_list = []
        for item_data in items_data:
            new_item = item.Item(**item_data)
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            items_list.append(new_item)
        
        print(f"Created {len(items_list)} items")
        
        # Create 3 overdue installment sales
        print("Adding overdue installment sales...")
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
            db.refresh(installment)
            
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
        print("Adding active installment sales...")
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
            db.refresh(installment)
            
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
        print("\nTest data added successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_data()
