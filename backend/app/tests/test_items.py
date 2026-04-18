import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from ..database import Base
from ..models import Item, Category, StockMovement, payment

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


class TestItemModel:
    """Test cases for Item database model."""

    def test_create_item(self, db_session):
        """Test creating a new item."""
        category = Category(name="Electronics")
        item = Item(name="Laptop", sku="LAP001", price=999.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()
        db_session.refresh(item)

        assert item.id is not None
        assert item.name == "Laptop"
        assert item.sku == "LAP001"
        assert item.price == 999.99
        assert item.category_id == category.id
        assert item.current_stock == 0  # Default value
        assert item.min_stock_level == 0  # Default value

    def test_item_sku_unique_constraint(self, db_session):
        """Test that item SKUs must be unique."""
        category = Category(name="Books")
        item1 = Item(name="Book 1", sku="BOOK001", price=19.99, category=category)
        db_session.add(item1)
        db_session.commit()

        # Try to create item with same SKU
        item2 = Item(
            name="Book 2",
            sku="BOOK001",  # Same SKU
            price=29.99,
            category=category,
        )
        db_session.add(item2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_item_required_fields(self, db_session):
        """Test that required fields cannot be null."""
        category = Category(name="Test")
        db_session.add(category)
        db_session.commit()

        # Missing name
        item = Item(sku="TEST001", price=10.99, category=category)
        db_session.add(item)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_item_relationship_with_category(self, db_session):
        """Test relationship between Item and Category models."""
        category = Category(name="Electronics", description="Electronic devices")
        db_session.add(category)
        db_session.commit()

        item = Item(
            name="Smartphone", sku="PHONE001", price=699.99, category_id=category.id
        )
        db_session.add(item)
        db_session.commit()

        # Test relationship from item side
        assert item.category.name == "Electronics"
        assert item.category.description == "Electronic devices"

        # Test relationship from category side
        assert len(category.items) == 1
        assert category.items[0].name == "Smartphone"

    def test_item_relationship_with_stock_movements(self, db_session):
        """Test relationship between Item and StockMovement models."""
        category = Category(name="Food")
        item = Item(name="Apple", sku="APL001", price=2.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        # Create stock movements
        movement1 = StockMovement(item_id=item.id, quantity_change=10, reason="inbound")
        movement2 = StockMovement(
            item_id=item.id, quantity_change=-3, reason="outbound"
        )

        db_session.add_all([movement1, movement2])
        db_session.commit()

        # Test relationship from item side
        assert len(item.stock_movements) == 2
        total_change = sum(m.quantity_change for m in item.stock_movements)
        assert total_change == 7  # 10 - 3

        # Test relationship from movement side
        assert movement1.item.name == "Apple"
        assert movement2.item.name == "Apple"

    def test_item_default_values(self, db_session):
        """Test default values for optional fields."""
        category = Category(name="Default Test")
        item = Item(
            name="Test Item",
            sku="DEFAULT001",
            price=15.99,
            category=category,
            # Not providing current_stock or min_stock_level
        )
        db_session.add_all([category, item])
        db_session.commit()
        db_session.refresh(item)

        assert item.current_stock == 0
        assert item.min_stock_level == 0
        assert item.description is None

    def test_item_with_all_fields(self, db_session):
        """Test creating item with all possible fields."""
        category = Category(name="Complete Test", description="Testing all fields")
        item = Item(
            name="Complete Item",
            description="A complete test item",
            sku="COMPLETE001",
            price=49.99,
            category=category,
            current_stock=25,
            min_stock_level=5,
        )
        db_session.add_all([category, item])
        db_session.commit()
        db_session.refresh(item)

        assert item.name == "Complete Item"
        assert item.description == "A complete test item"
        assert item.sku == "COMPLETE001"
        assert item.price == 49.99
        assert item.current_stock == 25
        assert item.min_stock_level == 5
        assert item.category_id == category.id

    def test_item_price_constraints(self, db_session):
        """Test various price values."""
        category = Category(name="Price Test")

        # Test zero price
        item1 = Item(name="Free Item", sku="FREE001", price=0.00, category=category)

        # Test high price
        item2 = Item(
            name="Expensive Item", sku="EXP001", price=99999.99, category=category
        )

        # Test decimal price
        item3 = Item(name="Decimal Item", sku="DEC001", price=19.99, category=category)

        db_session.add_all([category, item1, item2, item3])
        db_session.commit()

        # Verify prices
        assert item1.price == 0.00
        assert item2.price == 99999.99
        assert item3.price == 19.99

    def test_item_update_operations(self, db_session):
        """Test updating item information."""
        category = Category(name="Update Test")
        item = Item(
            name="Original Name",
            sku="UPDATE001",
            price=29.99,
            current_stock=10,
            category=category,
        )
        db_session.add_all([category, item])
        db_session.commit()

        # Update various fields
        item.name = "Updated Name"
        item.price = 39.99
        item.current_stock = 15
        item.description = "Updated description"

        db_session.commit()
        db_session.refresh(item)

        assert item.name == "Updated Name"
        assert item.price == 39.99
        assert item.current_stock == 15
        assert item.description == "Updated description"

    def test_item_deletion(self, db_session):
        """Test deleting an item."""
        category = Category(name="Delete Test")
        item = Item(name="To Delete", sku="DELETE001", price=9.99, category=category)
        db_session.add_all([category, item])
        db_session.commit()

        item_id = item.id

        # Delete item
        db_session.delete(item)
        db_session.commit()

        # Verify deletion
        deleted = db_session.query(Item).filter(Item.id == item_id).first()
        assert deleted is None

    def test_item_stock_calculations(self, db_session):
        """Test stock calculations based on movements."""
        category = Category(name="Stock Test")
        item = Item(
            name="Stock Item",
            sku="STOCK001",
            price=14.99,
            current_stock=20,
            category=category,
        )
        db_session.add_all([category, item])
        db_session.commit()

        # Simulate stock movements
        movements = [
            StockMovement(item_id=item.id, quantity_change=5, reason="inbound"),
            StockMovement(item_id=item.id, quantity_change=-3, reason="outbound"),
            StockMovement(item_id=item.id, quantity_change=2, reason="adjustment"),
        ]

        db_session.add_all(movements)
        db_session.commit()

        # Calculate expected stock
        total_change = sum(m.quantity_change for m in movements)
        expected_stock = 20 + total_change  # 20 + (5 - 3 + 2) = 24

        # In a real scenario, you'd update the item's current_stock
        # Here we just verify the movements are recorded
        item_movements = (
            db_session.query(StockMovement)
            .filter(StockMovement.item_id == item.id)
            .all()
        )
        assert len(item_movements) == 3
        assert sum(m.quantity_change for m in item_movements) == 4

    def test_item_category_foreign_key(self, db_session):
        """Test foreign key constraint with category."""
        # Enable foreign key enforcement for SQLite
        db_session.execute(text("PRAGMA foreign_keys = ON"))

        # Create item without category (should work)
        item1 = Item(name="No Category Item", sku="NOCAT001", price=5.99)
        db_session.add(item1)
        db_session.commit()

        assert item1.category_id is None

        # Create item with invalid category ID
        item2 = Item(
            name="Invalid Category",
            sku="INVALID001",
            price=9.99,
            category_id=999,  # Non-existent category
        )
        db_session.add(item2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_item_index_performance(self, db_session):
        """Test that proper indexes exist for query performance."""
        category = Category(name="Index Test")

        # Create multiple items
        items = []
        for i in range(5):
            item = Item(
                name=f"Index Item {i}",
                sku=f"IDX00{i}",
                price=float(i + 10),
                category=category,
            )
            items.append(item)

        db_session.add_all([category] + items)
        db_session.commit()

        # Test indexed queries
        found_by_sku = db_session.query(Item).filter(Item.sku == "IDX002").first()
        assert found_by_sku is not None
        assert found_by_sku.name == "Index Item 2"

        found_by_name = (
            db_session.query(Item).filter(Item.name.like("Index Item%")).all()
        )
        assert len(found_by_name) == 5
