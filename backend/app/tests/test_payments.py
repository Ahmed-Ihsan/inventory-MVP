import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from ..database import Base
from ..models import user, item, category, stock_movement, alert, payment
from ..schemas import payment as payment_schema
from ..services.payment_service import PaymentService


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    session = TestingSessionLocal()
    try:
        # Clear all tables in correct order (due to foreign keys)
        session.query(payment.Payment).delete()
        session.query(alert.Alert).delete()
        session.query(stock_movement.StockMovement).delete()
        session.query(item.Item).delete()
        session.query(category.Category).delete()
        session.query(user.User).delete()
        session.commit()
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user_data = user.User(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword",
        is_active=True,
    )
    db_session.add(user_data)
    db_session.commit()
    db_session.refresh(user_data)
    return user_data


@pytest.fixture
def test_item(db_session, test_user):
    """Create a test item"""
    category_data = category.Category(
        name="Test Category", description="Test Description"
    )
    db_session.add(category_data)
    db_session.commit()

    item_data = item.Item(
        name="Test Item",
        description="Test Item Description",
        sku="TEST001",
        price=10.0,
        category_id=category_data.id,
        min_stock_level=5,
        current_stock=10,
    )
    db_session.add(item_data)
    db_session.commit()
    db_session.refresh(item_data)
    return item_data


class TestPaymentModel:
    """Test Payment model constraints and relationships"""

    def test_create_payment_minimal(self, db_session, test_user, test_item):
        """Test creating a payment with minimal required fields"""
        payment_data = payment.Payment(
            amount=100.0,
            payment_type=payment.PaymentType.DEBT,
            transaction_date=datetime.utcnow(),
            status=payment.PaymentStatus.PENDING,
        )
        db_session.add(payment_data)
        db_session.commit()
        db_session.refresh(payment_data)

        assert payment_data.id is not None
        assert payment_data.amount == 100.0
        assert payment_data.payment_type == payment.PaymentType.DEBT
        assert payment_data.status == payment.PaymentStatus.PENDING

    def test_create_payment_with_relations(self, db_session, test_user, test_item):
        """Test creating a payment with user and item relationships"""
        payment_data = payment.Payment(
            amount=50.0,
            payment_type=payment.PaymentType.PAID,
            description="Payment for test item",
            item_id=test_item.id,
            user_id=test_user.id,
            transaction_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=30),
            status=payment.PaymentStatus.COMPLETED,
        )
        db_session.add(payment_data)
        db_session.commit()
        db_session.refresh(payment_data)

        assert payment_data.item.name == "Test Item"
        assert payment_data.user.username == "testuser"

    def test_payment_enum_constraints(self, db_session):
        """Test that payment type and status enums work correctly"""
        payment_data = payment.Payment(
            amount=25.0,
            payment_type=payment.PaymentType.CREDIT,
            transaction_date=datetime.utcnow(),
            status=payment.PaymentStatus.OVERDUE,
        )
        db_session.add(payment_data)
        db_session.commit()

        # Verify enum values are stored correctly
        retrieved = db_session.query(payment.Payment).first()
        assert retrieved.payment_type == payment.PaymentType.CREDIT
        assert retrieved.status == payment.PaymentStatus.OVERDUE


class TestPaymentService:
    """Test PaymentService business logic"""

    def test_create_payment(self, db_session, test_user, test_item):
        """Test creating a payment through service"""
        service = PaymentService(db_session)

        payment_data = payment_schema.PaymentCreate(
            amount=75.0,
            payment_type=payment_schema.PaymentType.DEBT,
            description="Test debt payment",
            item_id=test_item.id,
            user_id=test_user.id,
            transaction_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=15),
            status=payment_schema.PaymentStatus.PENDING,
        )

        created_payment = service.create_payment(payment_data)

        assert created_payment.id is not None
        assert created_payment.amount == 75.0
        assert created_payment.description == "Test debt payment"

    def test_get_payments_with_filters(self, db_session, test_user, test_item):
        """Test filtering payments"""
        service = PaymentService(db_session)

        # Create multiple payments
        payments_data = [
            payment_schema.PaymentCreate(
                amount=100.0,
                payment_type=payment_schema.PaymentType.DEBT,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
            payment_schema.PaymentCreate(
                amount=50.0,
                payment_type=payment_schema.PaymentType.PAID,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.COMPLETED,
            ),
            payment_schema.PaymentCreate(
                amount=25.0,
                payment_type=payment_schema.PaymentType.DEBT,
                item_id=test_item.id,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
        ]

        for payment_data in payments_data:
            service.create_payment(payment_data)

        # Test filtering by payment type
        debt_payments = service.get_payments(
            payment_type=payment_schema.PaymentType.DEBT
        )
        assert len(debt_payments) == 2

        # Test filtering by status
        completed_payments = service.get_payments(
            status=payment_schema.PaymentStatus.COMPLETED
        )
        assert len(completed_payments) == 1

        # Test filtering by item
        item_payments = service.get_payments(item_id=test_item.id)
        assert len(item_payments) == 1

    def test_update_payment(self, db_session):
        """Test updating a payment"""
        service = PaymentService(db_session)

        # Create payment
        payment_data = payment_schema.PaymentCreate(
            amount=100.0,
            payment_type=payment_schema.PaymentType.DEBT,
            transaction_date=datetime.utcnow(),
            status=payment_schema.PaymentStatus.PENDING,
        )
        created_payment = service.create_payment(payment_data)

        # Update payment
        update_data = payment_schema.PaymentUpdate(
            amount=150.0,
            status=payment_schema.PaymentStatus.COMPLETED,
        )
        updated_payment = service.update_payment(created_payment.id, update_data)

        assert updated_payment.amount == 150.0
        assert updated_payment.status == payment_schema.PaymentStatus.COMPLETED

    def test_delete_payment(self, db_session):
        """Test deleting a payment"""
        service = PaymentService(db_session)

        # Create payment
        payment_data = payment_schema.PaymentCreate(
            amount=100.0,
            payment_type=payment_schema.PaymentType.DEBT,
            transaction_date=datetime.utcnow(),
            status=payment_schema.PaymentStatus.PENDING,
        )
        created_payment = service.create_payment(payment_data)

        # Delete payment
        result = service.delete_payment(created_payment.id)
        assert result is True

        # Verify deletion
        deleted_payment = service.get_payment(created_payment.id)
        assert deleted_payment is None

    def test_get_total_debt(self, db_session, test_user):
        """Test calculating total debt"""
        service = PaymentService(db_session)

        # Create debt payments
        debts = [
            payment_schema.PaymentCreate(
                amount=100.0,
                payment_type=payment_schema.PaymentType.DEBT,
                user_id=test_user.id,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
            payment_schema.PaymentCreate(
                amount=50.0,
                payment_type=payment_schema.PaymentType.DEBT,
                user_id=test_user.id,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.OVERDUE,
            ),
            payment_schema.PaymentCreate(
                amount=25.0,
                payment_type=payment_schema.PaymentType.DEBT,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.COMPLETED,  # Should not count as debt
            ),
        ]

        for debt in debts:
            service.create_payment(debt)

        total_debt = service.get_total_debt(test_user.id)
        assert total_debt == 150.0  # 100 + 50, completed debt not included

    def test_get_total_paid(self, db_session, test_user):
        """Test calculating total paid"""
        service = PaymentService(db_session)

        # Create paid payments
        payments = [
            payment_schema.PaymentCreate(
                amount=200.0,
                payment_type=payment_schema.PaymentType.PAID,
                user_id=test_user.id,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.COMPLETED,
            ),
            payment_schema.PaymentCreate(
                amount=75.0,
                payment_type=payment_schema.PaymentType.PAID,
                user_id=test_user.id,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,  # Should not count as paid
            ),
        ]

        for payment_data in payments:
            service.create_payment(payment_data)

        total_paid = service.get_total_paid(test_user.id)
        assert total_paid == 200.0  # Only completed payments count

    def test_check_overdue_payments(self, db_session):
        """Test checking and marking overdue payments"""
        service = PaymentService(db_session)

        # Create payments with past due dates
        past_date = datetime.utcnow() - timedelta(days=5)
        future_date = datetime.utcnow() + timedelta(days=5)

        payments_data = [
            payment_schema.PaymentCreate(
                amount=100.0,
                payment_type=payment_schema.PaymentType.DEBT,
                due_date=past_date,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
            payment_schema.PaymentCreate(
                amount=50.0,
                payment_type=payment_schema.PaymentType.DEBT,
                due_date=future_date,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
            payment_schema.PaymentCreate(
                amount=25.0,
                payment_type=payment_schema.PaymentType.PAID,  # Not debt, should be ignored
                due_date=past_date,
                transaction_date=datetime.utcnow(),
                status=payment_schema.PaymentStatus.PENDING,
            ),
        ]

        for payment_data in payments_data:
            service.create_payment(payment_data)

        # Check overdue payments
        overdue_payments = service.check_overdue_payments()

        assert len(overdue_payments) == 1
        assert overdue_payments[0].amount == 100.0
        assert overdue_payments[0].status == payment_schema.PaymentStatus.OVERDUE
