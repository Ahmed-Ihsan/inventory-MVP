# Backend Setup and Installation Guide

This guide will help you set up and run the Inventory Management backend API locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8 or higher** - The backend is built with Python
- **pip** - Python package installer (usually comes with Python)
- **Git** - For cloning the repository (optional)
- **SQLite** - For the database (comes pre-installed on most systems)

## Installation

### 1. Clone the Repository (if applicable)
```bash
git clone <repository-url>
cd inventory-management
```

### 2. Navigate to Backend Directory
```bash
cd backend
```

### 3. Create Virtual Environment
It's recommended to use a virtual environment to isolate the project dependencies.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
Install all required packages using pip:
```bash
pip install -r requirements.txt
```

The main dependencies include:
- **FastAPI** - Web framework for building APIs
- **Uvicorn** - ASGI server for running FastAPI
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migration tool
- **Pydantic** - Data validation
- **PyJWT** - JSON Web Token handling
- **PassLib** - Password hashing
- **python-multipart** - File upload handling
- **pytest** - Testing framework

### 5. Environment Configuration (Optional)
The application uses default configuration values, but you can create a `.env` file in the backend directory to override settings:

```env
# Database
DATABASE_URL=sqlite:///./inventory.db

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Settings
APP_NAME=Inventory Management API
DEBUG=true
```

## Database Setup

### Initialize Database
The application automatically creates the database tables when it starts. However, you can also initialize them manually:

```bash
python -c "from app.database import engine; from app.models import user, item, category, stock_movement, alert, payment; user.Base.metadata.create_all(bind=engine)"
```

### Database Migrations (Optional)
If you need to modify the database schema, you can use Alembic for migrations:

1. Initialize Alembic (if not already done):
```bash
alembic init alembic
```

2. Configure `alembic.ini` and `alembic/env.py` as needed

3. Create and run migrations:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Running the Application

### Development Server
Start the development server using Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- `--reload`: Automatically reload the server when code changes
- `--host 0.0.0.0`: Bind to all network interfaces
- `--port 8000`: Run on port 8000

The API will be available at: `http://localhost:8000`

### Production Deployment
For production deployment, use a production ASGI server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing the API

### Run Tests
Execute the test suite using pytest:

```bash
pytest
```

Run specific test files:
```bash
pytest app/tests/test_auth.py
pytest app/tests/test_items.py
```

### Interactive Documentation
Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Manual Testing
You can test the API endpoints using tools like:
- **curl** (command line)
- **Postman** (GUI)
- **HTTPie** (command line alternative to curl)

Example curl commands:

**Register a user:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d {username: testuser, email: test@example.com, password: testpass}
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=testpass"
```

**Get items (requires authentication):**
```bash
curl -X GET "http://localhost:8000/items/" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database File
The application uses SQLite by default, creating a file called `inventory.db` in the backend directory. This file contains all your data and will be created automatically when you first run the application.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port: `uvicorn app.main:app --port 8001`

2. **Import errors**
   - Ensure you're in the correct directory and virtual environment is activated
   - Check Python path: `python -c "import sys; print(sys.path)"`

3. **Database connection errors**
   - Ensure the database file path is correct
   - Check file permissions

4. **Dependency installation issues**
   - Upgrade pip: `pip install --upgrade pip`
   - Install in user space: `pip install --user -r requirements.txt`

### Logs
The application logs important information to the console. For more detailed logging, you can set the log level:

```bash
uvicorn app.main:app --log-level debug
```

## Next Steps
Once the backend is running:
1. Test the API endpoints
2. Set up the frontend application
3. Configure any additional settings as needed
4. Deploy to production if required

For more information about the API endpoints, see the [API Documentation](backend-api-documentation.md).
