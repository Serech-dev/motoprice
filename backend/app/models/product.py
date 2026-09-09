from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    internal_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(80), nullable=False, index=True)
    category = Column(String(80), nullable=False, index=True)

    # Motorcycle Specific Applicability:
    # List of compatible motorcycle models: ["Honda Wave 110S", "Gilera Smash 110", "Motomel Blitz 110"]
    compatible_models = Column(JSON, default=list)

    # OEM & Aftermarket cross references:
    oem_code = Column(String(80), nullable=True, index=True)
    # alternate_codes: [{"brand": "W-Standard", "code": "WST-1436"}, {"brand": "Riffel", "code": "RIF-428"}]
    alternate_codes = Column(JSON, default=list)

    # Cost and Currency:
    cost_price_ars = Column(Float, default=0.0)
    cost_price_usd = Column(Float, default=0.0)
    currency = Column(String(10), default="ARS")  # 'ARS' or 'USD'

    # Sales & Profitability:
    profit_margin_pct = Column(Float, default=45.0)  # e.g., 45.0%
    sale_price_ars = Column(Float, default=0.0)

    # Price Source & Market Benchmarking:
    # 'supplier_list': Verified from distributor upload
    # 'mercadolibre': Benchmark from online market / MercadoLibre reference
    # 'dollar_pegged': Auto-calculated via USD conversion
    price_source = Column(String(30), default="supplier_list")
    market_reference_price = Column(Float, nullable=True)  # MercadoLibre online reference price

    # Stock control:
    min_stock = Column(Integer, default=2)
    current_stock = Column(Integer, default=0)

    # Supplier linkage:
    primary_supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    primary_supplier = relationship("Supplier", back_populates="products")
    price_update_items = relationship("PriceUpdateItem", back_populates="product")
