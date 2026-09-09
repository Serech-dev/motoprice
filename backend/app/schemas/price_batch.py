from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class PriceUpdateItemOut(BaseModel):
    id: int
    batch_id: int
    product_id: Optional[int] = None
    supplier_code: str
    supplier_description: Optional[str] = None
    supplier_brand: Optional[str] = None
    matched_by: Optional[str] = None
    list_price: float
    old_cost: float
    new_cost: float
    old_sale_price: float
    proposed_sale_price: float
    pct_change: float
    is_flagged: bool
    flag_reason: Optional[str] = None
    is_approved: bool
    override_sale_price: Optional[float] = None
    
    # Nested minimal product data if matched
    matched_product_name: Optional[str] = None
    matched_product_internal_code: Optional[str] = None
    matched_product_oem: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PriceUpdateBatchOut(BaseModel):
    id: int
    supplier_id: int
    supplier_name: Optional[str] = None
    filename: str
    total_items: int
    matched_items: int
    unmatched_items: int
    status: str
    discount_1_applied: float
    discount_2_applied: float
    discount_3_applied: float
    vat_rate_applied: float
    exchange_rate_applied: float
    rounding_rule_applied: str
    created_at: datetime
    applied_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PriceUpdateBatchDetailOut(PriceUpdateBatchOut):
    items: List[PriceUpdateItemOut] = []

class ItemUpdateRequest(BaseModel):
    is_approved: Optional[bool] = None
    override_sale_price: Optional[float] = None

class BatchApplyRequest(BaseModel):
    selected_item_ids: Optional[List[int]] = None  # None means apply all approved items

class BatchApplyResponse(BaseModel):
    success: bool
    batch_id: int
    updated_products_count: int
    message: str

