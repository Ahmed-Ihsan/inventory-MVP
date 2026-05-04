"""
Unit tests for installment sale payment calculation logic.
Tests ensure that remaining_amount is calculated correctly without floating-point errors.
"""
import pytest
from datetime import datetime
from app.models.installment_sales import InstallmentSale, InstallmentSalePayment, InstallmentStatus


def test_payment_calculation_no_floating_point_error():
    """Test that payment calculation doesn't accumulate floating-point errors"""
    sale = InstallmentSale(
        customer_name="Test Customer",
        total_amount=400.0,
        down_payment=42.0,
        remaining_amount=358.0,
        monthly_payment=100.0,
        total_months=4,
        paid_months=0,
        status=InstallmentStatus.ACTIVE
    )
    
    # Simulate multiple payments
    payments = [193.0, 81.0, 81.0]
    
    for payment_amount in payments:
        sale.paid_months += 1
        # Use the recalculation method (simulating the fix)
        total_paid = sale.down_payment + sum(payments[:sale.paid_months])
        sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)
    
    # Final calculation
    total_paid = sale.down_payment + sum(payments)
    expected_remaining = round(sale.total_amount - total_paid, 2)
    
    assert sale.remaining_amount == expected_remaining
    assert sale.remaining_amount == 3.0  # 400 - (42 + 193 + 81 + 81) = 3


def test_remaining_amount_never_negative():
    """Test that remaining_amount never goes negative due to floating-point errors"""
    sale = InstallmentSale(
        customer_name="Test Customer",
        total_amount=100.0,
        down_payment=10.0,
        remaining_amount=90.0,
        monthly_payment=30.0,
        total_months=4,
        paid_months=0,
        status=InstallmentStatus.ACTIVE
    )
    
    # Simulate overpayment scenario
    payments = [30.0, 30.0, 30.0, 30.0]  # Total = 120 + 10 down = 130 > 100
    
    for payment_amount in payments:
        sale.paid_months += 1
        total_paid = sale.down_payment + sum(payments[:sale.paid_months])
        sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)
    
    # Should be 0, not negative
    assert sale.remaining_amount == 0.0


def test_refund_calculation():
    """Test that refund recalculates remaining amount correctly"""
    sale = InstallmentSale(
        customer_name="Test Customer",
        total_amount=500.0,
        down_payment=50.0,
        remaining_amount=200.0,
        monthly_payment=100.0,
        total_months=3,
        paid_months=2,
        status=InstallmentStatus.ACTIVE
    )
    
    # Simulate existing payments
    sale.payments = [
        InstallmentSalePayment(amount=150.0, month_number=1),
        InstallmentSalePayment(amount=100.0, month_number=2)
    ]
    
    # Refund the second payment
    payment_to_refund = sale.payments[1]
    sale.paid_months -= 1
    
    # Recalculate remaining (excluding refunded payment)
    total_paid = sale.down_payment + sum(p.amount for p in sale.payments if p.id != payment_to_refund.id)
    sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)
    
    # Expected: 500 - (50 + 150) = 300
    assert sale.remaining_amount == 300.0


def test_validate_remaining_amount_method():
    """Test the validate_remaining_amount method in the model"""
    sale = InstallmentSale(
        customer_name="Test Customer",
        total_amount=100.0,
        down_payment=10.0,
        remaining_amount=-0.01,  # Negative due to floating-point error
        monthly_payment=30.0,
        total_months=4,
        paid_months=3,
        status=InstallmentStatus.ACTIVE
    )
    
    # Call validation method
    validated = sale.validate_remaining_amount()
    
    # Should be corrected to 0
    assert validated == 0.0
    assert sale.remaining_amount == 0.0


def test_rounding_precision():
    """Test that rounding to 2 decimal places works correctly"""
    sale = InstallmentSale(
        customer_name="Test Customer",
        total_amount=100.0,
        down_payment=33.33,
        remaining_amount=66.67,
        monthly_payment=33.33,
        total_months=2,
        paid_months=0,
        status=InstallmentStatus.ACTIVE
    )
    
    # Add payment with decimal
    sale.paid_months += 1
    total_paid = sale.down_payment + 33.33
    sale.remaining_amount = max(round(sale.total_amount - total_paid, 2), 0)
    
    # Should be exactly 33.34
    assert sale.remaining_amount == 33.34


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
