import os
import hmac
import hashlib
import secrets
from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, AuthToken
from app.models.shop import Shop

# --- PASSWORD HASHING (PBKDF2-HMAC-SHA256) ---
ITERATIONS = 100_000

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        ITERATIONS
    )
    return f"pbkdf2_sha256${ITERATIONS}${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against the PBKDF2-HMAC-SHA256 hash."""
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]
        
        calculated_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return hmac.compare_digest(calculated_key.hex(), expected_hash)
    except Exception:
        return False


# --- TOKEN MANAGEMENT ---
def create_auth_token(db: Session, user: User) -> AuthToken:
    """Generate and store a new secure authentication token."""
    token_str = secrets.token_hex(32)
    auth_token = AuthToken(
        token=token_str,
        user_id=user.id,
        created_at=datetime.utcnow(),
        last_used_at=datetime.utcnow()
    )
    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)
    return auth_token

def revoke_auth_token(db: Session, token_str: str) -> bool:
    """Delete a token on logout."""
    token_record = db.query(AuthToken).filter(AuthToken.token == token_str).first()
    if token_record:
        db.delete(token_record)
        db.commit()
        return True
    return False


# --- FASTAPI DEPENDENCIES ---
def extract_token_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract token supporting:
    - Authorization: Bearer <token>
    - Authorization: Token <token>
    - Raw token string
    """
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) == 2 and parts[0].lower() in ("bearer", "token"):
        return parts[1]
    elif len(parts) == 1:
        return parts[0]
    return None

def get_current_user_optional(
    token_str: Optional[str] = Depends(extract_token_from_header),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Retrieve authenticated user if token is valid, without failing if absent."""
    if not token_str:
        return None
    token_record = db.query(AuthToken).filter(AuthToken.token == token_str).first()
    if not token_record:
        return None
    
    # Update last_used_at timestamp
    token_record.last_used_at = datetime.utcnow()
    db.commit()

    user = token_record.user
    if not user or not user.is_active:
        return None
    return user

def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    """Enforce that the request is authenticated."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales no proporcionadas o sesión expirada.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforce that the authenticated user has admin privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido: Se requieren permisos de Administrador."
        )
    return current_user

