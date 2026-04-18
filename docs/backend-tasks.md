# Backend Development Tasks

1. Create the backend directory structure according to `docs/backend-file-structure.md`, including all subdirectories and __init__.py files.

2. Set up `requirements.txt` with all necessary packages: fastapi, uvicorn, sqlalchemy, alembic, pydantic, python-jose[cryptography] (for JWT), passlib[bcrypt] (for password hashing), pyzbar, opencv-python, pytest, python-multipart, and any others like httpx for async HTTP if needed.

3. Implement `app/config.py`: Define settings using Pydantic BaseSettings for database URLs, JWT secret, etc., with environment variable support.

4. Implement `app/database.py`: Set up SQLAlchemy engine, sessionmaker, and base class for models; configure for SQLite initially, switchable to PostgreSQL.

5. Create database models in `app/models/`:
   - `user.py`: User model with id, username, email, hashed_password, is_active.
   - `category.py`: Category model with id, name, description.
   - `item.py`: Item model with id, name, description, sku, price, category_id (foreign key), min_stock_level, current_stock.
   - `stock_movement.py`: StockMovement model with id, item_id (foreign key), quantity_change, reason (e.g., 'inbound', 'outbound'), timestamp.

6. Create Pydantic schemas in `app/schemas/` for request/response validation:
   - `user.py`: UserCreate, UserResponse, Token.
   - `item.py`: ItemCreate, ItemUpdate, ItemResponse.
   - `category.py`: CategoryCreate, CategoryResponse.
   - `stock_movement.py`: StockMovementCreate, StockMovementResponse.

7. Set up Alembic for database migrations: Initialize alembic in `alembic/` directory, configure `env.py`, and create initial migration script for the models.

8. Implement authentication in `app/routers/auth.py` and `app/services/auth_service.py`:
   - Register and login endpoints with JWT token generation.
   - Password hashing and verification.
   - Dependency for getting current user from token.

9. Create CRUD routers in `app/routers/`:
   - `items.py`: Endpoints for listing, creating, updating, deleting items; include search/filter by name, SKU, category.
   - `categories.py`: Endpoints for managing categories.
   - `stock.py`: Endpoints for viewing stock levels, updating stock manually, and logging stock movements.

10. Implement services in `app/services/`:
    - `item_service.py`: Business logic for item operations, stock updates.
    - `scanning_service.py`: Function to process uploaded images with OpenCV preprocessing and pyzbar decoding; update stock based on decoded SKU.

11. Add middleware in `app/middleware/cors.py`: Configure CORS for frontend integration.

12. Implement utilities in `app/utils/dependencies.py`: JWT token verification dependency, database session dependency.

13. Set up the main FastAPI app in `app/main.py`: Include routers, middleware, and startup event for DB creation if needed.

14. Write unit tests in `app/tests/`:
    - `test_auth.py`: Test login, register, token validation.
    - `test_items.py`: Test CRUD operations, stock updates.

15. Test the backend: Run pytest, start uvicorn server, test endpoints with tools like curl or Postman, ensure scanning endpoint processes images correctly.

16. Document the API: Use FastAPI's auto-docs at /docs, add any additional descriptions in the code.

17. Handle errors and logging: Add exception handlers in main.py, integrate logging for debugging.