from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from app.schemas.shop import ShopOut, LicenseInfo

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    shop_id: Optional[int] = None
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class LoginResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserOut
    license: Optional[LicenseInfo] = None

class MeResponse(BaseModel):
    user: UserOut
    shop: Optional[ShopOut] = None
    license: Optional[LicenseInfo] = None

