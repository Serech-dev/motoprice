from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timedelta
from app.database import Base

class Shop(Base):
    """
    Shop / Tenant model representing the motorcycle parts store.
    Tracks subscription licensing, trial period, and commercial billing.
    """
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Moto Repuestos")
    cuit = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Licensing: 'trial', 'active', 'expired', 'suspended'
    license_status = Column(String, default="trial", nullable=False, index=True)
    trial_ends_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=30))
    license_expires_at = Column(DateTime, nullable=True)
    
    plan_name = Column(String, default="Prueba Gratuita 30 Días", nullable=False)
    monthly_fee_ars = Column(Float, default=30000.0, nullable=False)  # $30.000 ARS agreed maintenance fee
    
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def is_license_valid(self) -> bool:
        now = datetime.utcnow()
        if self.license_status == "active":
            if self.license_expires_at:
                return now <= self.license_expires_at
            return True
        elif self.license_status == "trial":
            return now <= self.trial_ends_at
        return False

    @property
    def days_remaining(self) -> int:
        now = datetime.utcnow()
        target = self.license_expires_at if self.license_status == "active" and self.license_expires_at else self.trial_ends_at
        if not target:
            return 0
        diff = target - now
        return max(0, diff.days)

