import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from ..database import Base
from ..models import user, item, category, stock_movement, alert, payment
from ..schemas import alert as alert_schema
from ..services.alert_service import AlertService

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
        session.query(alert.Alert).delete()
        session.query(stock_movement.StockMovement).delete()
        session.query(item.Item).delete()
        session.query(category.Category).delete()
        session.commit()
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def test_user(db_session):
    # Create a test user
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
def test_category(db_session):
    # Create a test category
    category_data = category.Category(
        name="Test Category", description="Test category description"
    )
    db_session.add(category_data)
    db_session.commit()
    db_session.refresh(category_data)
    return category_data


@pytest.fixture
def test_item(db_session, test_category):
    # Create a test item
    item_data = item.Item(
        name="Test Item",
        description="Test item description",
        sku="TEST001",
        price=10.99,
        category_id=test_category.id,
        min_stock_level=5,
        current_stock=3,  # This should trigger a low stock alert
    )
    db_session.add(item_data)
    db_session.commit()
    db_session.refresh(item_data)
    return item_data


class TestAlertModel:
    def test_alert_creation(self, db_session, test_item):
        """Test creating an alert"""
        alert_data = alert.Alert(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Test alert message",
            is_active=True,
        )
        db_session.add(alert_data)
        db_session.commit()
        db_session.refresh(alert_data)

        assert alert_data.id is not None
        assert alert_data.item_id == test_item.id
        assert alert_data.alert_type == "low_stock"
        assert alert_data.message == "Test alert message"
        assert alert_data.is_active is True
        assert alert_data.created_at is not None
        assert alert_data.resolved_at is None


class TestAlertService:
    def test_create_alert(self, db_session, test_item):
        """Test creating an alert through the service"""
        service = AlertService(db_session)
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Test service alert",
            is_active=True,
        )

        created_alert = service.create_alert(alert_data)

        assert created_alert.id is not None
        assert created_alert.item_id == test_item.id
        assert created_alert.alert_type == "low_stock"
        assert created_alert.message == "Test service alert"
        assert created_alert.is_active is True

    def test_get_active_alerts(self, db_session, test_item):
        """Test getting all active alerts"""
        service = AlertService(db_session)

        # Create an alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Active alert",
            is_active=True,
        )
        service.create_alert(alert_data)

        # Get active alerts
        active_alerts = service.get_active_alerts()

        assert len(active_alerts) == 1
        assert active_alerts[0].is_active is True

    def test_get_alert(self, db_session, test_item):
        """Test getting a specific alert"""
        service = AlertService(db_session)

        # Create an alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Specific alert",
            is_active=True,
        )
        created_alert = service.create_alert(alert_data)

        # Get the alert
        retrieved_alert = service.get_alert(created_alert.id)

        assert retrieved_alert.id == created_alert.id
        assert retrieved_alert.message == "Specific alert"

    def test_update_alert(self, db_session, test_item):
        """Test updating an alert"""
        service = AlertService(db_session)

        # Create an alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Original alert",
            is_active=True,
        )
        created_alert = service.create_alert(alert_data)

        # Update the alert
        update_data = alert_schema.AlertUpdate(is_active=False)
        updated_alert = service.update_alert(created_alert.id, update_data)

        assert updated_alert.is_active is False
        assert updated_alert.resolved_at is not None

    def test_delete_alert(self, db_session, test_item):
        """Test deleting an alert"""
        service = AlertService(db_session)

        # Create an alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Alert to delete",
            is_active=True,
        )
        created_alert = service.create_alert(alert_data)

        # Delete the alert
        result = service.delete_alert(created_alert.id)

        assert result is True

        # Verify the alert is gone
        retrieved_alert = service.get_alert(created_alert.id)
        assert retrieved_alert is None

    def test_check_and_create_low_stock_alerts(self, db_session, test_item):
        """Test automatic low stock alert creation"""
        service = AlertService(db_session)

        # Check and create alert
        created_alert = service.check_and_create_low_stock_alerts(test_item.id)

        assert created_alert is not None
        assert created_alert.alert_type == "low_stock"
        assert "below minimum stock level" in created_alert.message
        assert created_alert.is_active is True

    def test_no_duplicate_alerts(self, db_session, test_item):
        """Test that duplicate alerts aren't created"""
        service = AlertService(db_session)

        # Create first alert
        service.check_and_create_low_stock_alerts(test_item.id)

        # Try to create another alert
        second_alert = service.check_and_create_low_stock_alerts(test_item.id)

        # Should return None as alert already exists
        assert second_alert is None

    def test_bulk_create_alerts(self, db_session, test_item):
        """Test creating multiple alerts efficiently."""
        service = AlertService(db_session)

        alerts_data = [
            alert_schema.AlertCreate(
                item_id=test_item.id,
                alert_type="low_stock",
                message=f"Bulk alert {i}",
                is_active=True,
            )
            for i in range(5)
        ]

        created_alerts = []
        for alert_data in alerts_data:
            alert = service.create_alert(alert_data)
            created_alerts.append(alert)

        assert len(created_alerts) == 5
        for alert in created_alerts:
            assert alert.is_active is True
            assert alert.item_id == test_item.id

    def test_alert_message_formatting(self, db_session, test_item):
        """Test that alert messages are properly formatted."""
        service = AlertService(db_session)

        # Test automatic low stock alert message
        alert = service.check_and_create_low_stock_alerts(test_item.id)

        assert alert is not None
        assert "below minimum stock level" in alert.message
        assert test_item.name in alert.message
        assert str(test_item.min_stock_level) in alert.message

    def test_alert_timestamps(self, db_session, test_item):
        """Test alert timestamp handling."""
        service = AlertService(db_session)

        # Create alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="test",
            message="Timestamp test",
            is_active=True,
        )
        alert = service.create_alert(alert_data)

        assert alert.created_at is not None
        assert alert.resolved_at is None

        # Resolve alert
        update_data = alert_schema.AlertUpdate(is_active=False)
        updated_alert = service.update_alert(alert.id, update_data)

        assert updated_alert.resolved_at is not None
        assert updated_alert.created_at <= updated_alert.resolved_at

    def test_alert_statistics(self, db_session, test_item, test_category):
        """Test alert statistics and reporting."""
        service = AlertService(db_session)

        # Create another item
        item2 = item.Item(
            name="Second Item",
            sku="SEC002",
            price=25.99,
            category=test_category,
            current_stock=15,
            min_stock_level=10,
        )
        db_session.add(item2)
        db_session.commit()

        # Create various alerts
        alerts_data = [
            (test_item.id, "low_stock"),
            (test_item.id, "out_of_stock"),
            (item2.id, "low_stock"),
        ]

        for item_id, alert_type in alerts_data:
            alert_data = alert_schema.AlertCreate(
                item_id=item_id,
                alert_type=alert_type,
                message=f"Test {alert_type}",
                is_active=True,
            )
            service.create_alert(alert_data)

        # Get active alerts
        active_alerts = service.get_active_alerts()
        assert len(active_alerts) == 3

        # Verify different alert types
        alert_types = [a.alert_type for a in active_alerts]
        assert "low_stock" in alert_types
        assert "out_of_stock" in alert_types

    def test_alert_item_relationship_integrity(self, db_session, test_item):
        """Test that alerts maintain proper relationship with items."""
        service = AlertService(db_session)

        # Create alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Relationship test",
            is_active=True,
        )
        alert = service.create_alert(alert_data)

        # Verify relationship from alert to item
        assert alert.item.name == test_item.name
        assert alert.item.sku == test_item.sku

        # Verify relationship from item to alerts
        from ..models.alert import Alert

        item_alerts = (
            db_session.query(Alert).filter(Alert.item_id == test_item.id).all()
        )
        assert len(item_alerts) == 1
        assert item_alerts[0].message == "Relationship test"

    def test_alert_cascading_behavior(self, db_session, test_item):
        """Test alert behavior when items are modified."""
        service = AlertService(db_session)

        # Create alert
        alert_data = alert_schema.AlertCreate(
            item_id=test_item.id,
            alert_type="low_stock",
            message="Cascade test",
            is_active=True,
        )
        alert = service.create_alert(alert_data)

        # Modify item stock (should affect alert logic)
        test_item.current_stock = test_item.min_stock_level + 5
        db_session.commit()

        # The alert should still exist (we don't auto-resolve)
        retrieved_alert = service.get_alert(alert.id)
        assert retrieved_alert is not None
        assert retrieved_alert.is_active is True

    def test_alert_service_error_handling(self, db_session):
        """Test error handling in alert service."""
        service = AlertService(db_session)

        # Enable foreign key enforcement for SQLite
        db_session.execute(text("PRAGMA foreign_keys = ON"))

        # Try to get non-existent alert
        result = service.get_alert(999)
        assert result is None

        # Try to delete non-existent alert
        result = service.delete_alert(999)
        assert result is False

        # Try to create alert for non-existent item
        alert_data = alert_schema.AlertCreate(
            item_id=999, alert_type="test", message="Error test", is_active=True
        )
        # This should raise an exception due to foreign key constraint
        with pytest.raises(Exception):  # Could be IntegrityError or similar
            service.create_alert(alert_data)

    def test_update_nonexistent_alert(self, db_session):
        """Test updating a non-existent alert"""
        service = AlertService(db_session)

        # Try to update non-existent alert
        update_data = alert_schema.AlertUpdate(is_active=False)
        result = service.update_alert(999, update_data)
        assert result is None  # Should return None for non-existent alert

    def test_delete_nonexistent_alert(self, db_session):
        """Test deleting a non-existent alert"""
        service = AlertService(db_session)

        # Try to delete non-existent alert
        result = service.delete_alert(999)
        assert result is False  # Should return False for non-existent alert
