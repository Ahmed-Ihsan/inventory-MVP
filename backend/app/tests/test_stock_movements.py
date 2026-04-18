import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from ..database import Base
from ..models import StockMovement, Item, Category, payment

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    session = TestingSessionLocal()
    try:
        # Clear all tables in correct order (due to foreign keys)
        session.query(StockMovement).delete()
        session.query(Item).delete()
        session.query(Category).delete()
        session.commit()
        yield session
    finally:
        session.rollback()
        session.close()


class TestStockMovementModel:
    """Test cases for StockMovement database model."""

    def test_create_stock_movement(self, db_session):
        """Test creating a new stock movement."""
        # First create an item
        category = Category(name="Electronics")
        item = Item(name="Laptop", sku="LAP001", price=999.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create stock movement
        movement = StockMovement(item_id=item.id, quantity_change=10, reason="inbound")
        db_session.add(movement)
        db_session.commit()
        db_session.refresh(movement)

        assert movement.id is not None
        assert movement.item_id == item.id
        assert movement.quantity_change == 10
        assert movement.reason == "inbound"
        assert movement.timestamp is not None

    def test_stock_movement_required_fields(self, db_session):
        """Test that required fields cannot be null."""
        # Missing item_id
        movement = StockMovement(quantity_change=5, reason="inbound")
        db_session.add(movement)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_stock_movement_quantity_required(self, db_session):
        """Test that quantity_change is required."""
        # Create item first
        category = Category(name="Books")
        item = Item(name="Book", sku="BK001", price=10.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Missing quantity_change
        movement = StockMovement(item_id=item.id, reason="inbound")
        db_session.add(movement)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_stock_movement_reason_required(self, db_session):
        """Test that reason is required."""
        # Create item first
        category = Category(name="Books")
        item = Item(name="Book", sku="BK001", price=10.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Missing reason
        movement = StockMovement(item_id=item.id, quantity_change=1)
        db_session.add(movement)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_stock_movement_relationship_with_item(self, db_session):
        """Test relationship between StockMovement and Item models."""
        # Create item
        category = Category(name="Electronics")
        item = Item(name="Phone", sku="PHN001", price=599.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create multiple movements
        movement1 = StockMovement(item_id=item.id, quantity_change=5, reason="inbound")
        movement2 = StockMovement(
            item_id=item.id, quantity_change=-2, reason="outbound"
        )

        db_session.add_all([movement1, movement2])
        db_session.commit()

        # Test relationship from item side
        assert len(item.stock_movements) == 2
        movements = item.stock_movements
        quantity_changes = [m.quantity_change for m in movements]
        assert 5 in quantity_changes
        assert -2 in quantity_changes

        # Test relationship from movement side
        assert movement1.item.name == "Phone"
        assert movement2.item.name == "Phone"

    def test_stock_movement_timestamp_auto_generated(self, db_session):
        """Test that timestamp is automatically generated."""
        # Create item
        category = Category(name="Tools")
        item = Item(name="Hammer", sku="HAM001", price=25.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create movement
        movement = StockMovement(
            item_id=item.id, quantity_change=3, reason="adjustment"
        )
        db_session.add(movement)
        db_session.commit()
        db_session.refresh(movement)

        assert movement.timestamp is not None
        assert isinstance(movement.timestamp, datetime)

    def test_stock_movement_positive_quantity(self, db_session):
        """Test stock movement with positive quantity (inbound)."""
        category = Category(name="Clothing")
        item = Item(name="Shirt", sku="SHIRT001", price=29.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        movement = StockMovement(item_id=item.id, quantity_change=20, reason="inbound")
        db_session.add(movement)
        db_session.commit()

        assert movement.quantity_change == 20
        assert movement.reason == "inbound"

    def test_stock_movement_negative_quantity(self, db_session):
        """Test stock movement with negative quantity (outbound)."""
        category = Category(name="Clothing")
        item = Item(name="Pants", sku="PANTS001", price=49.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        movement = StockMovement(item_id=item.id, quantity_change=-5, reason="outbound")
        db_session.add(movement)
        db_session.commit()

        assert movement.quantity_change == -5
        assert movement.reason == "outbound"

    def test_stock_movement_zero_quantity(self, db_session):
        """Test stock movement with zero quantity."""
        category = Category(name="Accessories")
        item = Item(name="Belt", sku="BELT001", price=19.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        movement = StockMovement(
            item_id=item.id, quantity_change=0, reason="adjustment"
        )
        db_session.add(movement)
        db_session.commit()

        assert movement.quantity_change == 0

    def test_stock_movement_different_reasons(self, db_session):
        """Test different movement reasons."""
        category = Category(name="Food")
        item = Item(name="Apple", sku="APL001", price=2.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        reasons = ["inbound", "outbound", "adjustment", "return", "damage"]

        for reason in reasons:
            movement = StockMovement(item_id=item.id, quantity_change=1, reason=reason)
            db_session.add(movement)

        db_session.commit()

        # Verify all movements were created
        movements = (
            db_session.query(StockMovement)
            .filter(StockMovement.item_id == item.id)
            .all()
        )
        assert len(movements) == 5
        db_reasons = [m.reason for m in movements]
        for reason in reasons:
            assert reason in db_reasons

    def test_stock_movement_item_relationship(self, db_session):
        """Test that stock movements are properly linked to items."""
        # Create item
        category = Category(name="Relation Test")
        item = Item(name="Relation Item", sku="REL001", price=15.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create movement with valid item_id
        movement = StockMovement(
            item_id=item.id,
            quantity_change=10,
            reason="inbound",
        )
        db_session.add(movement)
        db_session.commit()

        # Verify relationship
        assert movement.item.name == "Relation Item"
        assert item.stock_movements[0].quantity_change == 10

    def test_stock_movement_bulk_operations(self, db_session):
        """Test creating multiple stock movements efficiently."""
        # Create item
        category = Category(name="Bulk Test")
        item = Item(name="Bulk Item", sku="BULK001", price=9.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create bulk movements
        movements = []
        for i in range(10):
            movement = StockMovement(
                item_id=item.id, quantity_change=i + 1, reason="adjustment"
            )
            movements.append(movement)

        db_session.add_all(movements)
        db_session.commit()

        # Verify bulk creation
        count = (
            db_session.query(StockMovement)
            .filter(StockMovement.item_id == item.id)
            .count()
        )
        assert count == 10

    def test_stock_movement_multiple_movements_per_item(self, db_session):
        """Test that multiple movements can be recorded for the same item."""
        # Create item
        category = Category(name="Multi Test")
        item = Item(name="Multi Item", sku="MULTI001", price=12.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create multiple movements
        movements_data = [
            {"quantity_change": 10, "reason": "inbound"},
            {"quantity_change": -3, "reason": "outbound"},
            {"quantity_change": 5, "reason": "adjustment"},
        ]

        movements = []
        for data in movements_data:
            movement = StockMovement(item_id=item.id, **data)
            movements.append(movement)

        db_session.add_all(movements)
        db_session.commit()

        # Verify all movements are recorded
        item_movements = (
            db_session.query(StockMovement)
            .filter(StockMovement.item_id == item.id)
            .all()
        )
        assert len(item_movements) == 3

        # Calculate total change
        total_change = sum(m.quantity_change for m in item_movements)
        assert total_change == 12  # 10 - 3 + 5
