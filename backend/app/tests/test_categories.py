import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from ..database import Base
from ..models import Category, Item, payment

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
        # Clear all tables
        session.query(Item).delete()
        session.query(Category).delete()
        session.commit()
        yield session
    finally:
        session.rollback()
        session.close()


class TestCategoryModel:
    """Test cases for Category database model."""

    def test_create_category(self, db_session):
        """Test creating a new category."""
        category = Category(
            name="Electronics", description="Electronic devices and accessories"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.id is not None
        assert category.name == "Electronics"
        assert category.description == "Electronic devices and accessories"

    def test_category_name_unique_constraint(self, db_session):
        """Test that category names must be unique."""
        # Create first category
        category1 = Category(name="Electronics")
        db_session.add(category1)
        db_session.commit()

        # Try to create category with same name
        category2 = Category(name="Electronics")
        db_session.add(category2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_category_name_required(self, db_session):
        """Test that category name is required."""
        category = Category(description="Test description")
        db_session.add(category)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_category_relationship_with_items(self, db_session):
        """Test relationship between Category and Item models."""
        # Create category
        category = Category(name="Electronics")
        db_session.add(category)
        db_session.commit()

        # Create items in this category
        item1 = Item(name="Laptop", sku="LAP001", price=999.99, category_id=category.id)
        item2 = Item(name="Mouse", sku="MOU001", price=29.99, category_id=category.id)

        db_session.add_all([item1, item2])
        db_session.commit()

        # Test relationship from category side
        assert len(category.items) == 2
        assert category.items[0].name in ["Laptop", "Mouse"]
        assert category.items[1].name in ["Laptop", "Mouse"]

        # Test relationship from item side
        assert item1.category.name == "Electronics"
        assert item2.category.name == "Electronics"

    def test_category_without_description(self, db_session):
        """Test creating category without description."""
        category = Category(name="Books")
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.id is not None
        assert category.name == "Books"
        assert category.description is None

    def test_category_name_index(self, db_session):
        """Test that category name has proper indexing."""
        # This is more of a schema test, but we can verify it exists
        category = Category(name="Test Category")
        db_session.add(category)
        db_session.commit()

        # Query by name to ensure index is working
        found = (
            db_session.query(Category).filter(Category.name == "Test Category").first()
        )
        assert found is not None
        assert found.id == category.id

    def test_category_update(self, db_session):
        """Test updating category information."""
        category = Category(name="Old Name", description="Old description")
        db_session.add(category)
        db_session.commit()

        # Update category
        category.name = "New Name"
        category.description = "New description"
        db_session.commit()
        db_session.refresh(category)

        assert category.name == "New Name"
        assert category.description == "New description"

    def test_category_delete(self, db_session):
        """Test deleting a category."""
        category = Category(name="To Delete")
        db_session.add(category)
        db_session.commit()

        category_id = category.id

        # Delete category
        db_session.delete(category)
        db_session.commit()

        # Verify deletion
        deleted = db_session.query(Category).filter(Category.id == category_id).first()
        assert deleted is None

    def test_category_str_representation(self, db_session):
        """Test string representation of category."""
        category = Category(name="Test Category")
        db_session.add(category)
        db_session.commit()

        # In SQLAlchemy, we can check the object representation
        assert str(category.name) == "Test Category"
        assert category.__tablename__ == "categories"
