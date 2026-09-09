from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class SupplierBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Distribuidora Warnes"})
    contact_info: Optional[str] = None
    currency: str = Field("ARS", json_schema_extra={"example": "ARS"})
    default_discount_1_pct: float = Field(0.0, json_schema_extra={"example": 25.0})
    default_discount_2_pct: float = Field(0.0, json_schema_extra={"example": 5.0})
    default_discount_3_pct: float = Field(0.0, json_schema_extra={"example": 0.0})
    vat_included: bool = Field(False, json_schema_extra={"example": False})
    custom_vat_pct: float = Field(21.0, json_schema_extra={"example": 21.0})
    column_mapping: Dict[str, Any] = Field(default_factory=dict)

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_info: Optional[str] = None
    currency: Optional[str] = None
    default_discount_1_pct: Optional[float] = None
    default_discount_2_pct: Optional[float] = None
    default_discount_3_pct: Optional[float] = None
    vat_included: Optional[bool] = None
    custom_vat_pct: Optional[float] = None
    column_mapping: Optional[Dict[str, Any]] = None

class SupplierOut(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

