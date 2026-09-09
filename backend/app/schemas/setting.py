from pydantic import BaseModel
from typing import Optional, Dict

class SettingItem(BaseModel):
    key: str
    value: str

class SettingsBundle(BaseModel):
    exchange_rate_usd_ars: float = 1180.0
    default_vat_pct: float = 21.0
    spike_threshold_pct: float = 30.0
    drop_threshold_pct: float = -40.0
    default_rounding_rule: str = "nearest_100"
    default_margin_pct: float = 40.0

class SettingsUpdate(BaseModel):
    exchange_rate_usd_ars: Optional[float] = None
    default_vat_pct: Optional[float] = None
    spike_threshold_pct: Optional[float] = None
    drop_threshold_pct: Optional[float] = None
    default_rounding_rule: Optional[str] = None
    default_margin_pct: Optional[float] = None

