from fastapi import FastAPI
from .database import engine
from .models import (
    user,
    item,
    category,
    stock_movement,
    alert,
    purchase,
    sales_invoice,
    installment_sales,
    notification,
)
from .routers import (
    auth,
    items,
    categories,
    stock,
    scanning,
    alerts,
    purchases,
    sales_invoices,
    installment_sales as installment_sales_router,
    notifications,
)
from .middleware.cors import create_cors_middleware

# Create tables
user.Base.metadata.create_all(bind=engine)
# Also create tables for other models
item.Base.metadata.create_all(bind=engine)
category.Base.metadata.create_all(bind=engine)
stock_movement.Base.metadata.create_all(bind=engine)
alert.Base.metadata.create_all(bind=engine)
purchase.Base.metadata.create_all(bind=engine)
sales_invoice.Base.metadata.create_all(bind=engine)
installment_sales.Base.metadata.create_all(bind=engine)
notification.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API")

# Add CORS middleware
create_cors_middleware(app)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(stock.router, prefix="/stock", tags=["stock"])
app.include_router(scanning.router, prefix="/scanning", tags=["scanning"])
app.include_router(
    alerts.router, prefix="/alerts", tags=["alerts"]
)
app.include_router(
    purchases.router, prefix="/purchases", tags=["purchases"]
)
app.include_router(
    sales_invoices.router, prefix="/sales-invoices", tags=["sales-invoices"]
)
app.include_router(
    installment_sales_router.router, prefix="/installment-sales", tags=["installment-sales"]
)
app.include_router(
    notifications.router, prefix="/notifications", tags=["notifications"]
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Inventory Management API"}
