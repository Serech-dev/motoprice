import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Auto Parts Dynamic Price Tracker"
    database_url: str = "sqlite:///./autoparts.db"
    default_exchange_rate_usd_ars: float = 1180.0
    default_vat_pct: float = 21.0
    spike_threshold_pct: float = 30.0
    drop_threshold_pct: float = -40.0
    
    # Can be provided as comma-separated string in .env / Render: "https://auto-price.vercel.app,http://localhost:5173"
    cors_allowed_origins: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="allow"
    )

    @field_validator("database_url")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        # Render and other PaaS sometimes provide postgres:// which SQLAlchemy 2 expects as postgresql://
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.cors_allowed_origins, str):
            return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]
        return self.cors_allowed_origins

settings = Settings()
