from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setting import AppSetting
from app.schemas.setting import SettingsBundle, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "exchange_rate_usd_ars": "1180.0",
    "default_vat_pct": "21.0",
    "spike_threshold_pct": "30.0",
    "drop_threshold_pct": "-40.0",
    "default_rounding_rule": "nearest_100",
    "default_margin_pct": "40.0"
}

def get_bundle_from_db(db: Session) -> SettingsBundle:
    records = {s.key: s.value for s in db.query(AppSetting).all()}
    return SettingsBundle(
        exchange_rate_usd_ars=float(records.get("exchange_rate_usd_ars", DEFAULT_SETTINGS["exchange_rate_usd_ars"])),
        default_vat_pct=float(records.get("default_vat_pct", DEFAULT_SETTINGS["default_vat_pct"])),
        spike_threshold_pct=float(records.get("spike_threshold_pct", DEFAULT_SETTINGS["spike_threshold_pct"])),
        drop_threshold_pct=float(records.get("drop_threshold_pct", DEFAULT_SETTINGS["drop_threshold_pct"])),
        default_rounding_rule=records.get("default_rounding_rule", DEFAULT_SETTINGS["default_rounding_rule"]),
        default_margin_pct=float(records.get("default_margin_pct", DEFAULT_SETTINGS["default_margin_pct"]))
    )

@router.get("/", response_model=SettingsBundle)
def get_settings(db: Session = Depends(get_db)):
    return get_bundle_from_db(db)

@router.put("/", response_model=SettingsBundle)
def update_settings(updates: SettingsUpdate, db: Session = Depends(get_db)):
    data = updates.model_dump(exclude_unset=True)
    for k, v in data.items():
        record = db.query(AppSetting).filter(AppSetting.key == k).first()
        if not record:
            record = AppSetting(key=k, value=str(v))
            db.add(record)
        else:
            record.value = str(v)
    db.commit()
    return get_bundle_from_db(db)

