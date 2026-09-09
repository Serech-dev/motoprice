from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
    name: str
    cuit: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None

class ShopOut(ShopBase):
    id: int
    license_status: str
    trial_ends_at: datetime
    license_expires_at: Optional[datetime] = None
    plan_name: str
    monthly_fee_ars: float
    is_license_valid: bool
    days_remaining: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LicenseInfo(BaseModel):
    shop_id: int
    shop_name: str
    license_status: str
    is_valid: bool
    days_remaining: int
    trial_ends_at: datetime
    license_expires_at: Optional[datetime] = None
    plan_name: str
    monthly_fee_ars: float
    message: str

    model_config = ConfigDict(from_attributes=True)
