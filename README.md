# Inventory Management System - Frontend & Backend Integration

This is a complete inventory management system with React frontend and FastAPI backend, fully integrated with real API endpoints.

## 🚀 Quick Start

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

## 📋 API Endpoints Available

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

### Frontend Configuration
Update `frontend/src/services/apiService.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change for production
```

## 🎯 Features Implemented

### Backend Features
- ✅ User authentication with JWT
- ✅ Complete CRUD for items, categories, payments
- ✅ Stock movement tracking
- ✅ Automatic low-stock alerts
- ✅ Financial tracking (debt/paid)
- ✅ Barcode scanning integration
- ✅ Comprehensive API documentation
- ✅ 79 passing unit tests

### Frontend Features
- ✅ Modern React interface
- ✅ API integration service
- ✅ Dashboard with real-time stats
- ✅ Items management with filtering
- ✅ Authentication (login/register)
- ✅ Responsive design
- ✅ Arabic/RTL support ready

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

## 📊 Database Schema

The system uses SQLite with the following tables:
- `users` - User authentication
- `categories` - Product categories
- `items` - Inventory items
- `stock_movements` - Stock change history
- `alerts` - System alerts
- `payments` - Financial transactions

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