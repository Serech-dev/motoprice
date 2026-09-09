from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    contact_info = Column(String(255), nullable=True)
    currency = Column(String(10), default="ARS")  # 'ARS' or 'USD'
    
    # Discount chain tiers (e.g., 25% + 5% + 2%)
    default_discount_1_pct = Column(Float, default=0.0)
    default_discount_2_pct = Column(Float, default=0.0)
    default_discount_3_pct = Column(Float, default=0.0)

    # VAT (IVA) inclusion
    vat_included = Column(Boolean, default=False)  # False means 21% must be added
    custom_vat_pct = Column(Float, default=21.0)

    # Column mapping preset for parsing Excel/CSV:
    # {"code": "CODIGO", "price": "PRECIO_LISTA", "desc": "DESCRIPCION", "brand": "MARCA"}
    column_mapping = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="primary_supplier")
    batches = relationship("PriceUpdateBatch", back_populates="supplier")

