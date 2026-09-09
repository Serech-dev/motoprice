from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class PriceUpdateBatch(Base):
    __tablename__ = "price_update_batches"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    total_items = Column(Integer, default=0)
    matched_items = Column(Integer, default=0)
    unmatched_items = Column(Integer, default=0)
    status = Column(String(20), default="pending_review")  # 'pending_review', 'applied', 'rejected'
    
    # Metadata for the batch run
    discount_1_applied = Column(Float, default=0.0)
    discount_2_applied = Column(Float, default=0.0)
    discount_3_applied = Column(Float, default=0.0)
    vat_rate_applied = Column(Float, default=21.0)
    exchange_rate_applied = Column(Float, default=1.0)
    rounding_rule_applied = Column(String(30), default="nearest_100")

    created_at = Column(DateTime, default=datetime.utcnow)
    applied_at = Column(DateTime, nullable=True)

    # Relationships
    supplier = relationship("Supplier", back_populates="batches")
    items = relationship("PriceUpdateItem", back_populates="batch", cascade="all, delete-orphan")


class PriceUpdateItem(Base):
    __tablename__ = "price_update_items"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("price_update_batches.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    supplier_code = Column(String(100), nullable=False)
    supplier_description = Column(String(255), nullable=True)
    supplier_brand = Column(String(80), nullable=True)
    matched_by = Column(String(50), nullable=True)  # 'internal_code', 'oem_code', 'alternate_code'

    list_price = Column(Float, nullable=False)
    old_cost = Column(Float, default=0.0)
    new_cost = Column(Float, nullable=False)
    old_sale_price = Column(Float, default=0.0)
    proposed_sale_price = Column(Float, nullable=False)
    
    pct_change = Column(Float, default=0.0)  # ((new_cost - old_cost) / old_cost) * 100
    is_flagged = Column(Boolean, default=False)  # True if spike > 30% or drop < -40%
    flag_reason = Column(String(255), nullable=True)
    
    is_approved = Column(Boolean, default=True)
    override_sale_price = Column(Float, nullable=True)

    # Relationships
    batch = relationship("PriceUpdateBatch", back_populates="items")
    product = relationship("Product", back_populates="price_update_items")

