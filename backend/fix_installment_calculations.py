import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.installment_sales import InstallmentSale, InstallmentSalePayment

def fix_installment_calculations():
    """
    Recalculate remaining_amount for all installment sales to fix floating-point precision errors.
    """
    db = SessionLocal()
    try:
        print("Fetching all installment sales...")
        sales = db.query(InstallmentSale).all()
        
        fixed_count = 0
        errors = 0
        
        for sale in sales:
            try:
                # Calculate total paid from down payment and all payments
                total_paid = sale.down_payment + sum(p.amount for p in sale.payments)
                correct_remaining = round(sale.total_amount - total_paid, 2)
                
                # Ensure remaining doesn't go negative
                correct_remaining = max(correct_remaining, 0)
                
                # Check if there's a difference
                if abs(sale.remaining_amount - correct_remaining) > 0.01:
                    print(f"Sale ID {sale.id}: {sale.customer_name}")
                    print(f"  Old remaining: {sale.remaining_amount}")
                    print(f"  New remaining: {correct_remaining}")
                    print(f"  Total: {sale.total_amount}, Down payment: {sale.down_payment}")
                    print(f"  Payments: {sum(p.amount for p in sale.payments)}")
                    
                    # Update the remaining amount
                    sale.remaining_amount = correct_remaining
                    fixed_count += 1
                else:
                    print(f"Sale ID {sale.id}: {sale.customer_name} - OK (remaining: {correct_remaining})")
                    
            except Exception as e:
                print(f"Error processing sale ID {sale.id}: {e}")
                errors += 1
        
        db.commit()
        
        print(f"\n=== Summary ===")
        print(f"Total sales processed: {len(sales)}")
        print(f"Fixed: {fixed_count}")
        print(f"Errors: {errors}")
        print(f"\nMigration completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_installment_calculations()
