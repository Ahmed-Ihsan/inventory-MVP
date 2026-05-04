from app.database import engine
from app.models import (
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

print("Creating database tables...")
user.Base.metadata.create_all(bind=engine)
item.Base.metadata.create_all(bind=engine)
category.Base.metadata.create_all(bind=engine)
stock_movement.Base.metadata.create_all(bind=engine)
alert.Base.metadata.create_all(bind=engine)
purchase.Base.metadata.create_all(bind=engine)
sales_invoice.Base.metadata.create_all(bind=engine)
installment_sales.Base.metadata.create_all(bind=engine)
notification.Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
