import pytest
import os
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, init_db
from app.services.seed_data import seed_database
from app.models.supplier import Supplier
from app.models.product import Product

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_list_suppliers():
    response = client.get("/api/suppliers/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    names = [s["name"] for s in data]
    assert "W-Standard Argentina" in names
    assert "Pietcard Electrónica" in names
    assert "Far Motopartes & Cables" in names

def test_search_products_moto_models_and_codes():
    # 1. Search by motorcycle model "Smash"
    res = client.get("/api/products/?q=Smash")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 2
    names = [it["name"] for it in items]
    assert any("Transmisión" in n or "CDI" in n or "Zapatas" in n for n in names)

    # 2. Multi-token search (model + part without accents): "smash transmision"
    res_multi = client.get("/api/products/?q=smash transmision")
    assert res_multi.status_code == 200
    multi_items = res_multi.json()
    assert len(multi_items) >= 1
    assert "Transmisión" in multi_items[0]["name"]
    assert any("Smash" in m for m in multi_items[0]["compatible_models"])

    # 3. Multi-token search without accents: "bateria wave"
    res_bat = client.get("/api/products/?q=bateria wave")
    assert res_bat.status_code == 200
    bat_items = res_bat.json()
    assert len(bat_items) >= 1
    assert "Batería" in bat_items[0]["name"]

    # 4. Multi-token search without accents: "tornado pastillas"
    res_pas = client.get("/api/products/?q=tornado pastillas")
    assert res_pas.status_code == 200
    pas_items = res_pas.json()
    assert len(pas_items) >= 1
    assert "Pastillas" in pas_items[0]["name"]

    # 5. Search by cross-reference code Pietcard "2120"
    res_code = client.get("/api/products/?q=2120")
    assert res_code.status_code == 200
    items_code = res_code.json()
    assert len(items_code) >= 1
    assert items_code[0]["internal_code"] == "ELEC-PIET-2120"

def test_upload_price_list_and_diff():
    # Fetch W-Standard supplier
    sup_res = client.get("/api/suppliers/")
    wstandard = next(s for s in sup_res.json() if "W-Standard" in s["name"])

    # Upload the generated moto sample excel file
    excel_path = os.path.join("sample_files", "wstandard_transmisiones_y_frenos.xlsx")
    with open(excel_path, "rb") as f:
        files = {"file": ("wstandard_transmisiones_y_frenos.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        data = {
            "supplier_id": wstandard["id"],
            "discount_1": 25.0,
            "discount_2": 5.0,
            "vat_included": False
        }
        res = client.post("/api/price-updates/upload", files=files, data=data)

    assert res.status_code == 201
    batch = res.json()
    assert batch["total_items"] == 9
    assert batch["matched_items"] >= 7
    assert batch["unmatched_items"] >= 1
    assert batch["status"] == "pending_review"

    # Verify spike detection: FAR-5021 was bumped with intentional spike
    flagged_items = [it for it in batch["items"] if it["is_flagged"]]
    assert len(flagged_items) >= 1

    # Test Apply Price Batch
    batch_id = batch["id"]
    apply_res = client.post(f"/api/price-updates/{batch_id}/apply")
    assert apply_res.status_code == 200
    assert apply_res.json()["success"] is True
    assert apply_res.json()["updated_products_count"] >= 6
