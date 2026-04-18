# Backend File Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── item.py
│   │   ├── category.py
│   │   ├── stock_movement.py
│   │   ├── alert.py
│   │   └── payment.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── item.py
│   │   ├── category.py
│   │   ├── stock_movement.py
│   │   ├── alert.py
│   │   └── payment.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── items.py
│   │   ├── categories.py
│   │   ├── stock.py
│   │   ├── scanning.py
│   │   ├── alerts.py
│   │   └── payments.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── item_service.py
│   │   ├── scanning_service.py
│   │   ├── alert_service.py
│   │   └── payment_service.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── cors.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── dependencies.py
│   └── tests/
│       ├── __init__.py
│       ├── test_auth.py
│       ├── test_items.py
│       ├── test_categories.py
│       ├── test_stock_movements.py
│       ├── test_alerts.py
│       └── test_payments.py
├── alembic/
│   ├── versions/
│   ├── script.py.mako
│   ├── env.py
│   └── alembic.ini
├── requirements.txt
├── inventory.db
└── venv/
    └── ... (virtual environment files)
```
