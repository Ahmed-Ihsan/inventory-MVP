from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    min_stock_level = Column(Integer, default=0)
    current_stock = Column(Integer, default=0)

    # Relationships
    category = relationship("Category", back_populates="items")
    stock_movements = relationship("StockMovement", back_populates="item")
    alerts = relationship("Alert", back_populates="item")
    payments = relationship("Payment", back_populates="item")
    purchase_items = relationship("PurchaseItem", back_populates="item")
