from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from app.schemas.supplier import SupplierOut

class ProductBase(BaseModel):
    internal_code: str = Field(..., json_schema_extra={"example": "TR-WST-1436"})
    name: str = Field(..., json_schema_extra={"example": "Kit Transmisión Corona 36 Piñón 14 Cadena 428H"})
    brand: str = Field(..., json_schema_extra={"example": "W-Standard"})
    category: str = Field(..., json_schema_extra={"example": "Transmisión"})
    compatible_models: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Gilera Smash 110", "Honda Wave 110S", "Motomel Blitz 110"]})
    oem_code: Optional[str] = Field(None, json_schema_extra={"example": "06405-KWB-600"})
    alternate_codes: List[Any] = Field(default_factory=list)
    cost_price_ars: float = Field(0.0, json_schema_extra={"example": 14500.0})
    cost_price_usd: float = Field(0.0, json_schema_extra={"example": 12.3})
    currency: str = Field("ARS", json_schema_extra={"example": "ARS"})
    profit_margin_pct: float = Field(45.0, json_schema_extra={"example": 45.0})
    sale_price_ars: float = Field(0.0, json_schema_extra={"example": 21000.0})
    price_source: str = Field("supplier_list", json_schema_extra={"example": "supplier_list"})
    market_reference_price: Optional[float] = Field(None, json_schema_extra={"example": 23500.0})
    min_stock: int = Field(2, json_schema_extra={"example": 2})
    current_stock: int = Field(0, json_schema_extra={"example": 5})
    primary_supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    internal_code: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    compatible_models: Optional[List[str]] = None
    oem_code: Optional[str] = None
    alternate_codes: Optional[List[Any]] = None
    cost_price_ars: Optional[float] = None
    cost_price_usd: Optional[float] = None
    currency: Optional[str] = None
    profit_margin_pct: Optional[float] = None
    sale_price_ars: Optional[float] = None
    price_source: Optional[str] = None
    market_reference_price: Optional[float] = None
    min_stock: Optional[int] = None
    current_stock: Optional[int] = None
    primary_supplier_id: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    primary_supplier: Optional[SupplierOut] = None

    model_config = ConfigDict(from_attributes=True)
