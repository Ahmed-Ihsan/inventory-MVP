# Inventory Management System - Frontend & Backend Integration

This is a complete inventory management system with React frontend and FastAPI backend, fully integrated with real API endpoints.

## 🚀 Quick Start

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migration tool
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **SQLite** - Database

### Frontend
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **i18next** - Internationalization (Arabic/English)
- **xlsx** - Excel export functionality
- **Recharts** - Data visualization
- **React Icons** - Icon library

### Infrastructure
- **Docker** - Containerization
- **nginx** - Web server and reverse proxy
- **Supervisor** - Process manager

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
alembic upgrade head  # Initialize database
uvicorn app.main:app --reload
```

Backend will run on: `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend will run on: `http://localhost:3000`

## 🐳 Docker Setup (Recommended for Easy Installation)

### Prerequisites
- Docker Desktop installed on your machine
- Docker Compose (included with Docker Desktop)

### Quick Start with Docker
```bash
# Clone the repository
git clone <repository-url>
cd inv

# Build and start the application (single image with both frontend and backend)
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Docker Commands
```bash
# Start application in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Stop application and remove volumes (clears database)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# View running container
docker-compose ps
```

### Docker Architecture
- **Single Container Image**: Contains both frontend (React) and backend (FastAPI)
- **Frontend**: Served by nginx on port 80
- **Backend**: FastAPI running on port 8000
- **Process Manager**: Supervisor manages both services in the same container
- **Database**: SQLite database persisted in `backend/data/` directory
- **API Proxy**: nginx proxies API requests to the backend

### Benefits of Docker Setup
- ✅ No need to install Python, Node.js, or dependencies manually
- ✅ Consistent environment across all machines
- ✅ Easy to deploy on any PC with Docker
- ✅ Simple one-command startup
- ✅ Single image for both frontend and backend
- ✅ Isolated from host system

## �📋 API Endpoints Available

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Categories
- `GET /categories/` - List all categories
- `POST /categories/` - Create category
- `GET /categories/{id}` - Get specific category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Items Management
- `GET /items/` - List items with filtering
- `POST /items/` - Create new item
- `GET /items/{id}` - Get specific item
- `PUT /items/{id}` - Update item
- `DELETE /items/{id}` - Delete item

### Stock Management
- `GET /stock/levels` - Get all stock levels
- `POST /stock/movement` - Record stock movement
- `GET /stock/movements` - Get stock movement history

### Alerts System
- `GET /alerts/` - Get active alerts
- `POST /alerts/` - Create alert
- `GET /alerts/{id}` - Get specific alert
- `PUT /alerts/{id}` - Update alert
- `DELETE /alerts/{id}` - Delete alert

### Payments & Financial
- `GET /payments/` - List payments
- `POST /payments/` - Create payment
- `GET /payments/{id}` - Get specific payment
- `PUT /payments/{id}` - Update payment
- `DELETE /payments/{id}` - Delete payment
- `GET /payments/summary/debt` - Total debt
- `GET /payments/summary/paid` - Total paid

### Installment Sales
- `GET /installment-sales/` - List installment plans
- `POST /installment-sales/` - Create installment plan
- `GET /installment-sales/{id}` - Get specific plan
- `PUT /installment-sales/{id}` - Update plan
- `DELETE /installment-sales/{id}` - Delete plan
- `POST /installment-sales/{id}/payments` - Add payment to plan
- `GET /installment-sales/{id}/payments` - Get plan payments
- `POST /installment-sales/{id}/payments/export` - Export payment history to Excel

### Barcode Scanning
- `POST /scanning/scan` - Scan barcode (requires auth)

## 🔧 Configuration

### Backend Configuration
Update `backend/app/config.py`:
```python
class Settings(BaseSettings):
    database_url: str = "sqlite:///./inventory.db"  # Change for production
    secret_key: str = "your-secret-key-here"        # Change for production
    access_token_expire_minutes: int = 30
```

### Frontend API Configuration

The frontend automatically detects the environment and configures the API base URL:

- **Docker/Production**: Uses relative paths (empty string) - API requests go through nginx proxy
- **Local Development**: Uses `http://localhost:8000` - direct backend access

To override this behavior, set the environment variable:

```bash
# For local development (if needed)
cd frontend
set REACT_APP_API_BASE_URL=http://localhost:8000
npm start

# For custom backend URL
set REACT_APP_API_BASE_URL=http://your-backend-url:8000
npm start
```

**Setting NODE_ENV:**

The `NODE_ENV` environment variable controls the build mode:

**Windows:**
```bash
# PowerShell
set NODE_ENV=production
npm start

# CMD
set NODE_ENV=production
npm start

# Or inline
$env:NODE_ENV="production"; npm start
```

**Linux/Mac:**
```bash
export NODE_ENV=production
npm start

# Or inline
NODE_ENV=production npm start
```

**In Docker (docker-compose.yml):**
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
```

**How it works:**
- Docker: Frontend and backend run in same container, nginx proxies API requests internally (NODE_ENV=production)
- Local: Frontend (port 3000) connects directly to backend (port 8000) (NODE_ENV=development)

## 🎯 Features Implemented

### Backend Features
- ✅ User authentication with JWT
- ✅ Complete CRUD for items, categories, payments
- ✅ Stock movement tracking
- ✅ Automatic low-stock alerts
- ✅ Financial tracking (debt/paid)
- ✅ Barcode scanning integration
- ✅ Installment sales management
- ✅ Payment history tracking
- ✅ Comprehensive API documentation
- ✅ 79 passing unit tests

### Frontend Features
- ✅ Modern React 19 interface with hooks
- ✅ API integration service with error handling
- ✅ Dashboard with real-time stats and charts
- ✅ Items management with filtering and search
- ✅ Authentication (login/register)
- ✅ Responsive design with Tailwind CSS
- ✅ Arabic/RTL support with i18n
- ✅ Professional print functionality for all pages
- ✅ Excel export with xlsx library for reports
- ✅ shadcn/ui components for consistent design
- ✅ Stock tracking with tabbed interface
- ✅ Installment plan management and tracking
- ✅ Payment receipts and CSV/Excel export
- ✅ Gradient-styled headers and buttons
- ✅ Professional table designs

### Print Features
- ✅ Print for all major pages (Dashboard, Items, Categories, Stock, Purchases, Sales, Installments)
- ✅ Professional print layouts with Arabic font support
- ✅ Compact single-page printouts for installment plans
- ✅ Receipt-style print formats
- ✅ Print-friendly CSS with proper page sizing

### Export Features
- ✅ Excel export with professional styling (xlsx library)
- ✅ Multi-sheet Excel reports (Summary, Payments, Schedule)
- ✅ Color-coded payment status
- ✅ Complete payment history export
- ✅ CSV export with BOM for Excel compatibility

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest --tb=short
# Result: 79 passed
```

### Manual Testing
1. Register a new user at `/register`
2. Login at `/login`
3. View dashboard at `/dashboard`
4. Manage items at `/items`

## 📱 API Usage Examples

### JavaScript/React Integration
```javascript
import apiService from './services/apiService';

// Login
await apiService.login('username', 'password');

// Get items
const items = await apiService.getItems({ name: 'search term' });

// Create item
await apiService.createItem({
  name: 'New Item',
  sku: 'NEW001',
  price: 29.99,
  category_id: 1
});

// Stock movement
await apiService.createStockMovement({
  item_id: 1,
  quantity_change: 5,
  reason: 'Restock'
});
```

### Python Requests
```python
import requests

# Login
response = requests.post('http://localhost:8000/auth/login',
    data={'username': 'user', 'password': 'pass'})
token = response.json()['access_token']

headers = {'Authorization': f'Bearer {token}'}

# Get items
items = requests.get('http://localhost:8000/items/', headers=headers)

# Create item
requests.post('http://localhost:8000/items/', headers=headers, json={
    'name': 'Test Item',
    'sku': 'TEST001',
    'price': 19.99
})
```

## 🔒 Security Features

- JWT token authentication
- Password hashing
- Protected API endpoints
- Input validation
- SQL injection prevention

## 🚀 Production Deployment

### Backend Deployment
```bash
# Use production WSGI server
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Or use Docker
docker build -t inventory-backend .
docker run -p 8000:8000 inventory-backend
```

### Frontend Deployment
```bash
npm run build
# Serve build folder with nginx/apache
```

## 📦 Standalone Executable Builds

The recommended approach is a **single combined EXE** that includes both the FastAPI backend and React frontend. This is simpler, smaller, and has no CORS issues.

### Combined Backend + Frontend EXE (Recommended)

**Prerequisites:**
- Python 3.8+ with virtual environment
- All backend dependencies installed (`pip install -r requirements.txt`)
- React build created (`cd frontend && npm run build`)

**Build Steps:**
```bash
# 1. Build React frontend
cd frontend
npm run build

# 2. Copy build folder to backend
xcopy build ..\backend\build /E /I /Y  # Windows
# or
cp -r build ../backend/build  # Linux/Mac

# 3. Build combined EXE
cd ../backend
.\venv\Scripts\activate
pip install pyinstaller
pyinstaller inventory_backend.spec
```

**Output:**
- `backend/dist/inventory_backend/` folder containing:
  - `inventory_backend.exe` (~8.5 MB)
  - `_internal/` folder with all dependencies
  - `build/` folder with React frontend

**Running the EXE:**
```bash
.\dist\inventory_backend\inventory_backend.exe
```
- Automatically creates `inventory.db` in the same folder
- Serves React frontend at `http://0.0.0.0:8000/`
- Serves API at `http://0.0.0.0:8000/api`
- No Python or Node.js installation required

**Distribution:**
- Copy the entire `dist/inventory_backend/` folder to any Windows machine
- No dependencies needed
- Single EXE handles both frontend and backend

**Rebuilding after code changes:**
```bash
# Frontend changes
cd frontend
npm run build
xcopy build ..\backend\build /E /I /Y

# Backend changes
cd ../backend
pyinstaller --clean inventory_backend.spec
```

**Files Created:**
- `backend/run_exe.py` - Entry point with Windows multiprocessing fix
- `backend/inventory_backend.spec` - PyInstaller configuration with all hidden imports and build folder
- `backend/app/main.py` - Updated to serve React static files

**Important:** The React build must use absolute paths (not relative) to avoid chunk loading errors when accessing the app via IP address. Ensure `frontend/package.json` does NOT have `"homepage": "."` set. The build should use default absolute paths starting with `/`.

**Note:** This approach bundles everything into one EXE. The React app is served directly by FastAPI, eliminating CORS issues and reducing deployment complexity.

---

### Backend EXE Only (API Only)

If you only need the API backend without the frontend:

**Build Steps:**
```bash
cd backend
.\venv\Scripts\activate
pip install pyinstaller
pyinstaller inventory_backend.spec
```

**Output:** `backend/dist/inventory_backend/inventory_backend.exe` (~8.5 MB)

---

### Frontend EXE (Electron - Alternative)

**Note:** The combined EXE approach above is recommended. Use Electron only if you need a native desktop window with specific Electron features.

**Build Steps:**
```bash
cd frontend
npm install --save-dev electron electron-builder
npm run build
npx electron-builder
```

**Output:** `frontend/dist/Inventory Management Setup 0.1.0.exe` (~142 MB)

**Issues:**
- Requires Node.js for building
- Larger file size
- More complex deployment
- Requires custom protocol or HTTP server for React paths

## �📊 Database Schema

The system uses SQLite with the following tables:
- `users` - User authentication
- `categories` - Product categories
- `items` - Inventory items
- `stock_movements` - Stock change history
- `alerts` - System alerts
- `payments` - Financial transactions
- `installment_sales` - Installment plan records
- `installment_payments` - Installment payment history

## 🐛 Troubleshooting

### Backend Issues
- Check if database file exists: `backend/inventory.db`
- Run migrations: `alembic upgrade head`
- Check logs for detailed error messages

### Frontend Issues
- Ensure backend is running on correct port
- Check browser console for API errors
- Verify CORS settings if needed

### Authentication Issues
- Check JWT token expiration (30 minutes default)
- Verify token format in requests
- Check user credentials in database

## 📝 Development Notes

- Backend uses FastAPI with SQLAlchemy ORM
- Frontend uses React with modern hooks
- API follows REST conventions
- Authentication uses OAuth2 with JWT
- All endpoints include proper error handling

---

**Ready for production use!** 🚀