from sqlalchemy import Column, String
from app.database import Base

class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(50), primary_key=True, index=True)
    value = Column(String(255), nullable=False)

