from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User, AuthToken
from app.models.shop import Shop
from app.schemas.auth import LoginRequest, LoginResponse, MeResponse, UserOut
from app.schemas.shop import LicenseInfo, ShopOut
from app.services.auth import (
    verify_password,
    create_auth_token,
    revoke_auth_token,
    get_current_user,
    extract_token_from_header
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _build_license_info(shop: Optional[Shop]) -> Optional[LicenseInfo]:
    if not shop:
        return None
    
    is_valid = shop.is_license_valid
    days = shop.days_remaining

    if not is_valid:
        msg = f"La licencia de {shop.name} ha caducado. Contacte a soporte para renovar su abono mensual de ${shop.monthly_fee_ars:,.0f} ARS."
    elif shop.license_status == "trial":
        msg = f"Período de prueba activo: {days} días restantes (Plan: {shop.plan_name})."
    else:
        msg = f"Licencia comercial activa: {days} días restantes."

    return LicenseInfo(
        shop_id=shop.id,
        shop_name=shop.name,
        license_status=shop.license_status,
        is_valid=is_valid,
        days_remaining=days,
        trial_ends_at=shop.trial_ends_at,
        license_expires_at=shop.license_expires_at,
        plan_name=shop.plan_name,
        monthly_fee_ars=shop.monthly_fee_ars,
        message=msg
    )

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning an auth token."""
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos. Verifique sus credenciales."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta de usuario se encuentra desactivada."
        )

    # Issue token
    auth_token = create_auth_token(db, user)
    license_info = _build_license_info(user.shop)

    return LoginResponse(
        token=auth_token.token,
        token_type="Bearer",
        user=UserOut.model_validate(user),
        license=license_info
    )

@router.get("/me", response_model=MeResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current authenticated user profile and shop license status."""
    shop_out = ShopOut.model_validate(current_user.shop) if current_user.shop else None
    license_info = _build_license_info(current_user.shop)
    
    return MeResponse(
        user=UserOut.model_validate(current_user),
        shop=shop_out,
        license=license_info
    )

@router.get("/license", response_model=LicenseInfo)
def get_license(
    current_user: User = Depends(get_current_user)
):
    """Retrieve current store license and subscription details."""
    if not current_user.shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no tiene un comercio asignado."
        )
    lic = _build_license_info(current_user.shop)
    return lic

@router.post("/logout")
def logout(
    authorization: Optional[str] = Header(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke active session token."""
    token_str = extract_token_from_header(authorization)
    if token_str:
        revoke_auth_token(db, token_str)
    return {"status": "ok", "message": "Sesión cerrada correctamente."}
