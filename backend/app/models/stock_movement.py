from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity_change = Column(
        Integer, nullable=False
    )  # Positive for inbound, negative for outbound
    reason = Column(String, nullable=False)  # e.g., 'inbound', 'outbound', 'adjustment'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    item = relationship("Item", back_populates="stock_movements")
