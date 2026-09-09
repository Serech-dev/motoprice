from app.services.normalizer import normalize_code, extract_alternate_codes, strip_accents

def test_strip_accents():
    assert strip_accents("Transmisión") == "transmision"
    assert strip_accents("Batería") == "bateria"
    assert strip_accents("Piñón") == "pinon"
    assert strip_accents("Carburación") == "carburacion"
    assert strip_accents("GÜÉRRERO") == "guerrero"
    assert strip_accents(None) == ""

def test_normalize_code():
    assert normalize_code("W 712/52") == "W71252"
    assert normalize_code("030-115-561-AA") == "030115561AA"
    assert normalize_code("PH.5949") == "PH5949"
    assert normalize_code("WO-340") == "WO340"
    assert normalize_code("  0 986 B00 019  ") == "0986B00019"
    assert normalize_code(None) == ""
    assert normalize_code(5949) == "5949"

def test_extract_alternate_codes():
    raw_list = [
        {"brand": "Fram", "code": "PH 5949"},
        {"brand": "Mann", "code": "W 712/52"},
        {"brand": "Wega", "code": "WO-340"}
    ]
    extracted = extract_alternate_codes(raw_list)
    assert "PH5949" in extracted
    assert "W71252" in extracted
    assert "WO340" in extracted

    # String format separated by commas or pipes
    extracted_str = extract_alternate_codes("PH5949, W 712/52 | WO-340")
    assert "PH5949" in extracted_str
    assert "W71252" in extracted_str
    assert "WO340" in extracted_str
