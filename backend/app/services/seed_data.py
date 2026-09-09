from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.setting import AppSetting
from app.services.pricing_engine import calculate_sale_price

def seed_database(db: Session):
    """
    Seeds realistic motorcycle distributors (W-Standard, Pietcard, Far, etc.)
    and high-velocity motorcycle parts (Honda Wave, Smash 110, Tornado, Titan, Rouser)
    with compatibility lists and market reference prices.
    """
    # 1. Check if already seeded
    if db.query(Supplier).first():
        return

    # Seed initial App Settings
    settings_data = {
        "exchange_rate_usd_ars": "1180.0",
        "default_vat_pct": "21.0",
        "spike_threshold_pct": "30.0",
        "drop_threshold_pct": "-40.0",
        "default_rounding_rule": "nearest_100",
        "default_margin_pct": "45.0"
    }
    for k, v in settings_data.items():
        if not db.query(AppSetting).filter(AppSetting.key == k).first():
            db.add(AppSetting(key=k, value=v))

    # 2. Seed Motorcycle Distributors
    wstandard = Supplier(
        name="W-Standard Argentina",
        contact_info="distribucion@wstandard.com.ar | Tel: (011) 4732-8800",
        currency="ARS",
        default_discount_1_pct=25.0,
        default_discount_2_pct=5.0,
        default_discount_3_pct=0.0,
        vat_included=False,
        custom_vat_pct=21.0,
        column_mapping={"code": "CODIGO", "price": "PRECIO_LISTA", "desc": "DESCRIPCION", "brand": "MARCA"}
    )
    pietcard = Supplier(
        name="Pietcard Electrónica",
        contact_info="pedidos@pietcard.com.ar | Tel: (03492) 424-900",
        currency="ARS",
        default_discount_1_pct=20.0,
        default_discount_2_pct=5.0,
        default_discount_3_pct=0.0,
        vat_included=False,
        custom_vat_pct=21.0,
        column_mapping={"code": "CODIGO", "price": "P_LISTA", "desc": "DESCRIPCION", "brand": "MARCA"}
    )
    far = Supplier(
        name="Far Motopartes & Cables",
        contact_info="ventas@farmotopartes.com.ar",
        currency="ARS",
        default_discount_1_pct=30.0,
        default_discount_2_pct=10.0,
        default_discount_3_pct=0.0,
        vat_included=False,
        custom_vat_pct=21.0,
        column_mapping={"code": "ARTICULO", "price": "PRECIO", "desc": "DETALLE"}
    )
    db.add_all([wstandard, pietcard, far])
    db.commit()
    db.refresh(wstandard)
    db.refresh(pietcard)
    db.refresh(far)

    # 3. Seed High-Velocity Motorcycle Parts Catalog
    catalog = [
        # Transmisión
        {
            "internal_code": "TR-WST-110",
            "name": "Kit Transmisión Completo Corona 36T Piñón 14T Cadena 428H",
            "brand": "W-Standard",
            "category": "Transmisión",
            "compatible_models": ["Gilera Smash 110", "Honda Wave 110S", "Motomel Blitz 110", "Corven Energy 110", "Zanella ZB 110", "Guerrero Trip 110"],
            "oem_code": "06405-KWB-600",
            "alternate_codes": [
                {"brand": "W-Standard", "code": "WST-1436"},
                {"brand": "Riffel", "code": "RIF-428-116"},
                {"brand": "Choho", "code": "CH-428-3614"}
            ],
            "cost_price_ars": 14200.0,
            "cost_price_usd": 12.03,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 26900.0,
            "min_stock": 4,
            "current_stock": 12,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "TR-WST-150",
            "name": "Kit Transmisión Reforzado 15/43 Cadena 428H-118L CG Titan",
            "brand": "W-Standard",
            "category": "Transmisión",
            "compatible_models": ["Honda CG 150 Titan", "Honda New Titan", "Honda XR 150L", "Motomel S2 150"],
            "oem_code": "06406-KRM-840",
            "alternate_codes": [
                {"brand": "W-Standard", "code": "WST-1543"},
                {"brand": "DID", "code": "DID-428H-118"}
            ],
            "cost_price_ars": 18500.0,
            "cost_price_usd": 15.67,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 32500.0,
            "min_stock": 3,
            "current_stock": 8,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "TR-RIF-250",
            "name": "Kit Corona 38T Piñón 13T Cadena 520H Honda Tornado XR 250",
            "brand": "Riffel",
            "category": "Transmisión",
            "compatible_models": ["Honda XR 250 Tornado", "Honda CBX 250 Twister"],
            "oem_code": "06405-KPE-900",
            "alternate_codes": [
                {"brand": "Riffel", "code": "RIF-520-3813"},
                {"brand": "W-Standard", "code": "WST-520-TOR"}
            ],
            "cost_price_ars": 32000.0,
            "cost_price_usd": 27.12,
            "profit_margin_pct": 40.0,
            "price_source": "mercadolibre",
            "market_reference_price": 54000.0,
            "min_stock": 2,
            "current_stock": 4,
            "primary_supplier_id": wstandard.id
        },
        # Frenos
        {
            "internal_code": "FR-CIN-110",
            "name": "Juego de Zapatas / Cintas de Freno Traseras Cub 110cc",
            "brand": "W-Standard",
            "category": "Frenos",
            "compatible_models": ["Gilera Smash 110", "Honda Wave 110S", "Motomel Blitz 110", "Corven Energy 110", "Guerrero Trip 110"],
            "oem_code": "06430-KWB-600",
            "alternate_codes": [
                {"brand": "W-Standard", "code": "WST-CIN110"},
                {"brand": "Fras-le", "code": "CB-102"}
            ],
            "cost_price_ars": 5200.0,
            "cost_price_usd": 4.41,
            "profit_margin_pct": 50.0,
            "price_source": "supplier_list",
            "market_reference_price": 10500.0,
            "min_stock": 6,
            "current_stock": 18,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "FR-PAS-TOR",
            "name": "Pastillas de Freno Delanteras Sinterizadas Tornado / Falcon",
            "brand": "W-Standard",
            "category": "Frenos",
            "compatible_models": ["Honda XR 250 Tornado", "Honda NX 400 Falcon", "Yamaha XTZ 250 Lander"],
            "oem_code": "06455-KAZ-003",
            "alternate_codes": [
                {"brand": "W-Standard", "code": "WST-PDTOR"},
                {"brand": "Brenta", "code": "FT3054"}
            ],
            "cost_price_ars": 8600.0,
            "cost_price_usd": 7.28,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 16800.0,
            "min_stock": 3,
            "current_stock": 7,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "FR-PAS-NS200",
            "name": "Pastillas de Freno Delanteras Bajaj Rouser NS 200 / AS 200",
            "brand": "Far",
            "category": "Frenos",
            "compatible_models": ["Bajaj Rouser NS 200", "Bajaj Rouser AS 200", "Bajaj Dominar 400"],
            "oem_code": "DK151085",
            "alternate_codes": [
                {"brand": "Far", "code": "FAR-PDNS200"},
                {"brand": "Fras-le", "code": "PD-201"}
            ],
            "cost_price_ars": 11500.0,
            "cost_price_usd": 9.74,
            "profit_margin_pct": 45.0,
            "price_source": "mercadolibre",
            "market_reference_price": 21500.0,
            "min_stock": 2,
            "current_stock": 5,
            "primary_supplier_id": far.id
        },
        # Electricidad & Encendido
        {
            "internal_code": "ELEC-PIET-2120",
            "name": "CDI Electrónico Alimentado a Batería 4 Pines Cub 110",
            "brand": "Pietcard",
            "category": "Encendido",
            "compatible_models": ["Gilera Smash 110", "Motomel Blitz 110", "Zanella ZB 110", "Corven Energy 110"],
            "oem_code": "30410-KWB-901",
            "alternate_codes": [
                {"brand": "Pietcard", "code": "2120"},
                {"brand": "DZE", "code": "DZE-1450"}
            ],
            "cost_price_ars": 9800.0,
            "cost_price_usd": 8.30,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 19000.0,
            "min_stock": 3,
            "current_stock": 9,
            "primary_supplier_id": pietcard.id
        },
        {
            "internal_code": "ELEC-PIET-1035",
            "name": "Regulador de Voltaje Monofásico 12V 4 Pines 110cc",
            "brand": "Pietcard",
            "category": "Encendido",
            "compatible_models": ["Gilera Smash 110", "Honda Wave 110", "Motomel Blitz 110", "Zanella ZB 110"],
            "oem_code": "31600-KWB-601",
            "alternate_codes": [
                {"brand": "Pietcard", "code": "1035"}
            ],
            "cost_price_ars": 12400.0,
            "cost_price_usd": 10.51,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 24000.0,
            "min_stock": 2,
            "current_stock": 6,
            "primary_supplier_id": pietcard.id
        },
        {
            "internal_code": "BUJ-NGK-C7HSA",
            "name": "Bujía de Encendido NGK C7HSA Rosca Corta 110cc",
            "brand": "NGK",
            "category": "Encendido",
            "compatible_models": ["Honda Wave 110", "Gilera Smash 110", "Motomel Blitz 110", "Zanella ZB 110", "Guerrero Trip 110"],
            "oem_code": "98056-57716",
            "alternate_codes": [
                {"brand": "NGK", "code": "C7HSA"},
                {"brand": "Bosch", "code": "U24FS-U"}
            ],
            "cost_price_ars": 3200.0,
            "cost_price_usd": 2.71,
            "profit_margin_pct": 50.0,
            "price_source": "supplier_list",
            "market_reference_price": 6500.0,
            "min_stock": 10,
            "current_stock": 35,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "BUJ-NGK-CPR8EA9",
            "name": "Bujía de Encendido NGK CPR8EA-9 Titan 150 / FZ 16",
            "brand": "NGK",
            "category": "Encendido",
            "compatible_models": ["Honda CG 150 Titan", "Yamaha FZ 16", "Honda Wave 110S Inyección", "Honda XR 150L"],
            "oem_code": "98056-58718",
            "alternate_codes": [
                {"brand": "NGK", "code": "CPR8EA-9"},
                {"brand": "NGK", "code": "CPR8EA9"}
            ],
            "cost_price_ars": 5500.0,
            "cost_price_usd": 4.66,
            "profit_margin_pct": 45.0,
            "price_source": "dollar_pegged",
            "market_reference_price": 10500.0,
            "min_stock": 5,
            "current_stock": 14,
            "primary_supplier_id": wstandard.id
        },
        # Baterías
        {
            "internal_code": "BAT-GEL-5AH",
            "name": "Batería de Gel Libre Mantenimiento 12V 5Ah YTX5L-BS",
            "brand": "Bosch",
            "category": "Baterías",
            "compatible_models": ["Honda Wave 110", "Gilera Smash 110", "Yamaha Crypton 110", "Motomel Blitz 110", "Zanella ZB 110"],
            "oem_code": "31500-KWB-601",
            "alternate_codes": [
                {"brand": "Yuasa", "code": "YTX5L-BS"},
                {"brand": "Outdo", "code": "OTX5L-BS"}
            ],
            "cost_price_ars": 28500.0,
            "cost_price_usd": 24.15,
            "profit_margin_pct": 40.0,
            "price_source": "supplier_list",
            "market_reference_price": 48000.0,
            "min_stock": 3,
            "current_stock": 7,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "BAT-GEL-7AH",
            "name": "Batería Reforzada 12V 7Ah YTX7L-BS Tornado / Twister / FZ",
            "brand": "Yuasa",
            "category": "Baterías",
            "compatible_models": ["Honda XR 250 Tornado", "Honda CBX 250 Twister", "Yamaha FZ 16", "Yamaha YBR 125 ED"],
            "oem_code": "31500-KPE-900",
            "alternate_codes": [
                {"brand": "Yuasa", "code": "YTX7L-BS"}
            ],
            "cost_price_ars": 44000.0,
            "cost_price_usd": 37.28,
            "profit_margin_pct": 40.0,
            "price_source": "dollar_pegged",
            "market_reference_price": 75000.0,
            "min_stock": 2,
            "current_stock": 3,
            "primary_supplier_id": wstandard.id
        },
        # Cables & Comandos
        {
            "internal_code": "CAB-EMB-TITAN",
            "name": "Cable de Embrague Completo Reforzado Honda CG Titan 150",
            "brand": "Far",
            "category": "Cables",
            "compatible_models": ["Honda CG 150 Titan", "Honda New Titan 150"],
            "oem_code": "22870-KRM-860",
            "alternate_codes": [
                {"brand": "Far", "code": "FAR-5021"}
            ],
            "cost_price_ars": 3800.0,
            "cost_price_usd": 3.22,
            "profit_margin_pct": 50.0,
            "price_source": "supplier_list",
            "market_reference_price": 8200.0,
            "min_stock": 3,
            "current_stock": 6,
            "primary_supplier_id": far.id
        },
        {
            "internal_code": "CAB-ACE-SMASH",
            "name": "Cable de Acelerador Gilera Smash 110 / Motomel Blitz",
            "brand": "Far",
            "category": "Cables",
            "compatible_models": ["Gilera Smash 110", "Motomel Blitz 110", "Corven Energy 110"],
            "oem_code": "17910-KWB-600",
            "alternate_codes": [
                {"brand": "Far", "code": "FAR-3012"}
            ],
            "cost_price_ars": 3400.0,
            "cost_price_usd": 2.88,
            "profit_margin_pct": 50.0,
            "price_source": "supplier_list",
            "market_reference_price": 7500.0,
            "min_stock": 3,
            "current_stock": 8,
            "primary_supplier_id": far.id
        },
        # Motor, Carburación y Aceites
        {
            "internal_code": "CARB-110-STD",
            "name": "Carburador Completo con Cebador Manual 110cc Cub",
            "brand": "W-Standard",
            "category": "Carburación",
            "compatible_models": ["Gilera Smash 110", "Honda Wave 110", "Motomel Blitz 110", "Corven Energy 110", "Zanella ZB 110"],
            "oem_code": "16100-KWB-600",
            "alternate_codes": [
                {"brand": "W-Standard", "code": "WST-CARB110"}
            ],
            "cost_price_ars": 22000.0,
            "cost_price_usd": 18.64,
            "profit_margin_pct": 45.0,
            "price_source": "supplier_list",
            "market_reference_price": 42000.0,
            "min_stock": 2,
            "current_stock": 5,
            "primary_supplier_id": wstandard.id
        },
        {
            "internal_code": "LUB-MOTUL-5100",
            "name": "Aceite Semisintético Motul 5100 15W50 4T Technosynthese 1L",
            "brand": "Motul",
            "category": "Lubricantes",
            "compatible_models": ["Honda XR 250 Tornado", "Yamaha FZ 16", "Bajaj Rouser NS 200", "Honda CG 150 Titan", "Universal 4T"],
            "oem_code": "MOTUL-5100-1L",
            "alternate_codes": [
                {"brand": "Motul", "code": "5100-15W50"}
            ],
            "cost_price_ars": 14800.0,
            "cost_price_usd": 12.54,
            "profit_margin_pct": 38.0,
            "price_source": "supplier_list",
            "market_reference_price": 25000.0,
            "min_stock": 6,
            "current_stock": 24,
            "primary_supplier_id": wstandard.id
        }
    ]

    for item in catalog:
        cost = item["cost_price_ars"]
        margin = item["profit_margin_pct"]
        sale = calculate_sale_price(cost, margin, "nearest_100")
        
        prod = Product(
            internal_code=item["internal_code"],
            name=item["name"],
            brand=item["brand"],
            category=item["category"],
            compatible_models=item.get("compatible_models", []),
            oem_code=item.get("oem_code"),
            alternate_codes=item.get("alternate_codes", []),
            cost_price_ars=cost,
            cost_price_usd=item.get("cost_price_usd", 0.0),
            currency="ARS",
            profit_margin_pct=margin,
            sale_price_ars=sale,
            price_source=item.get("price_source", "supplier_list"),
            market_reference_price=item.get("market_reference_price"),
            min_stock=item["min_stock"],
            current_stock=item["current_stock"],
            primary_supplier_id=item["primary_supplier_id"]
        )
        db.add(prod)

    db.commit()
