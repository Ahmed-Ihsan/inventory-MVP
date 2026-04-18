import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from ..database import Base
from ..models import User
from ..services.auth_service import (
    get_password_hash,
    verify_password,
    authenticate_user,
    create_access_token,
)

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
        # Clear all tables in correct order
        session.query(User).delete()
        session.commit()
        yield session
    finally:
        session.rollback()
        session.close()


class TestUserModel:
    """Test cases for User database model."""

    def test_create_user(self, db_session):
        """Test creating a new user."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpass"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.is_active is True  # Default value

    def test_user_username_unique_constraint(self, db_session):
        """Test that usernames must be unique."""
        user1 = User(
            username="sameuser",
            email="user1@example.com",
            hashed_password=get_password_hash("pass1"),
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            username="sameuser",  # Same username
            email="user2@example.com",
            hashed_password=get_password_hash("pass2"),
        )
        db_session.add(user2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_email_unique_constraint(self, db_session):
        """Test that emails must be unique."""
        user1 = User(
            username="user1",
            email="same@example.com",
            hashed_password=get_password_hash("pass1"),
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            username="user2",
            email="same@example.com",  # Same email
            hashed_password=get_password_hash("pass2"),
        )
        db_session.add(user2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_required_fields(self, db_session):
        """Test that required fields cannot be null."""
        # Missing username
        user = User(email="test@example.com", hashed_password=get_password_hash("pass"))
        db_session.add(user)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_default_values(self, db_session):
        """Test default values for user fields."""
        user = User(
            username="defaultuser",
            email="default@example.com",
            hashed_password=get_password_hash("pass"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.is_active is True

    def test_user_inactive_state(self, db_session):
        """Test setting user as inactive."""
        user = User(
            username="inactiveuser",
            email="inactive@example.com",
            hashed_password=get_password_hash("pass"),
            is_active=False,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.is_active is False

    def test_user_update_operations(self, db_session):
        """Test updating user information."""
        user = User(
            username="updateuser",
            email="update@example.com",
            hashed_password=get_password_hash("oldpass"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        # Update user
        user.email = "updated@example.com"
        user.is_active = False
        db_session.commit()
        db_session.refresh(user)

        assert user.email == "updated@example.com"
        assert user.is_active is False
        assert user.username == "updateuser"  # Unchanged

    def test_user_password_hashing(self, db_session):
        """Test password hashing functionality."""
        plain_password = "mypassword123"
        hashed = get_password_hash(plain_password)

        # Verify hash is different from plain password
        assert hashed != plain_password

        # Verify password verification works
        assert verify_password(plain_password, hashed)
        assert not verify_password("wrongpassword", hashed)

    def test_user_index_performance(self, db_session):
        """Test that user fields have proper indexing."""
        user = User(
            username="indexuser",
            email="index@example.com",
            hashed_password=get_password_hash("pass"),
        )
        db_session.add(user)
        db_session.commit()

        # Test indexed queries
        found_by_username = (
            db_session.query(User).filter(User.username == "indexuser").first()
        )
        assert found_by_username is not None

        found_by_email = (
            db_session.query(User).filter(User.email == "index@example.com").first()
        )
        assert found_by_email is not None


class TestAuthService:
    """Test cases for authentication service layer."""

    def test_authenticate_user_success(self, db_session):
        """Test successful user authentication."""
        # Create a user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpass"),
        )
        db_session.add(user)
        db_session.commit()

        # Test authentication
        authenticated_user = authenticate_user(db_session, "testuser", "testpass")
        assert authenticated_user is not None
        assert authenticated_user.username == "testuser"
        assert authenticated_user.email == "test@example.com"

    def test_authenticate_user_wrong_username(self, db_session):
        """Test authentication with wrong username."""
        # Create a user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpass"),
        )
        db_session.add(user)
        db_session.commit()

        # Test authentication with wrong username
        authenticated_user = authenticate_user(db_session, "wronguser", "testpass")
        assert authenticated_user is False

    def test_authenticate_user_wrong_password(self, db_session):
        """Test authentication with wrong password."""
        # Create a user
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpass"),
        )
        db_session.add(user)
        db_session.commit()

        # Test authentication with wrong password
        authenticated_user = authenticate_user(db_session, "testuser", "wrongpass")
        assert authenticated_user is False

    def test_create_access_token(self, db_session):
        """Test JWT token creation."""
        token = create_access_token(data={"sub": "testuser"})
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expiry(self, db_session):
        """Test JWT token creation with custom expiry."""
        from datetime import timedelta

        token = create_access_token(
            data={"sub": "testuser"}, expires_delta=timedelta(minutes=15)
        )
        assert token is not None
        assert isinstance(token, str)

    def test_password_hashing_workflow(self, db_session):
        """Test complete password hashing workflow."""
        plain_password = "securepassword123"

        # Hash password
        hashed = get_password_hash(plain_password)
        assert hashed != plain_password
        assert len(hashed) > 0

        # Verify password
        assert verify_password(plain_password, hashed)
        assert not verify_password("wrongpassword", hashed)

        # Create user with hashed password
        user = User(
            username="hashuser", email="hash@example.com", hashed_password=hashed
        )
        db_session.add(user)
        db_session.commit()

        # Test authentication with hashed password
        authenticated = authenticate_user(db_session, "hashuser", plain_password)
        assert authenticated is not None
        assert authenticated.username == "hashuser"

    def test_authenticate_inactive_user(self, db_session):
        """Test authentication with inactive user."""
        # Create inactive user
        user = User(
            username="inactiveuser",
            email="inactive@example.com",
            hashed_password=get_password_hash("testpass"),
            is_active=False,
        )
        db_session.add(user)
        db_session.commit()

        # Test authentication - should fail for inactive user
        authenticated_user = authenticate_user(db_session, "inactiveuser", "testpass")
        assert authenticated_user is False

    def test_token_payload_structure(self, db_session):
        """Test JWT token contains expected payload."""
        import jwt
        from ..config import settings

        token = create_access_token(data={"sub": "testuser", "role": "admin"})

        # Decode token (without verification for test)
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"verify_exp": False},
        )

        assert payload["sub"] == "testuser"
        assert payload["role"] == "admin"
        assert "exp" in payload  # Expiration should be present
