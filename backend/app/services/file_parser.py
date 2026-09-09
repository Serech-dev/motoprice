import io
import re
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

COMMON_CODE_HEADERS = ["CODIGO", "COD", "ARTICULO", "ITEM", "PARTE", "REFERENCIA", "SKU", "NRO_PIEZA", "PART_NUMBER", "NUMERO"]
COMMON_PRICE_HEADERS = ["PRECIO", "LISTA", "P_LISTA", "PLISTA", "PRECIO_LISTA", "PRECIO_NETO", "COSTO", "VALOR", "PVP", "PRICE", "IMPORTE"]
COMMON_DESC_HEADERS = ["DESCRIPCION", "DETALLE", "DENOMINACION", "APLICACION", "NOMBRE", "PRODUCTO", "DESC", "DESCRIPTION"]
COMMON_BRAND_HEADERS = ["MARCA", "BRAND", "FABRICANTE", "LINEA"]
COMMON_CAT_HEADERS = ["RUBRO", "CATEGORIA", "FAMILIA", "GRUPO", "CATEGORY"]

def clean_price_value(val: Any) -> float:
    """
    Parses numeric price values from various formats (e.g. '$14.500,50', '14500.50', ' 14,500 ', 14500)
    """
    if pd.isna(val) or val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)

    s = str(val).strip()
    # Remove currency signs and spaces
    s = re.sub(r'[\$\s]', '', s)
    if not s:
        return 0.0

    # If format is Argentine/European 14.500,50
    if '.' in s and ',' in s:
        if s.find('.') < s.find(','):
            s = s.replace('.', '').replace(',', '.')
        else:
            s = s.replace(',', '')
    elif ',' in s:
        # Check if comma is decimal separator (e.g. 1500,50)
        parts = s.split(',')
        if len(parts) == 2 and len(parts[1]) <= 2:
            s = s.replace(',', '.')
        else:
            s = s.replace(',', '')

    try:
        return float(s)
    except ValueError:
        return 0.0

def detect_headers(df: pd.DataFrame) -> Tuple[int, Dict[str, str]]:
    """
    Scans the first 10 rows of a dataframe to detect where column headers are located,
    and returns (header_row_index, suggested_column_mapping).
    """
    best_row_idx = 0
    best_mapping: Dict[str, str] = {}
    max_matches = -1

    for row_idx in range(min(12, len(df))):
        row_vals = [str(v).strip().upper() for v in df.iloc[row_idx].tolist() if pd.notna(v)]
        
        mapping = {}
        # Try matching Code
        for col_name in row_vals:
            cleaned_col = re.sub(r'[^A-Z0-9_]', '', col_name.replace(' ', '_'))
            if not mapping.get("code") and any(h in cleaned_col for h in COMMON_CODE_HEADERS):
                mapping["code"] = col_name
            elif not mapping.get("price") and any(h in cleaned_col for h in COMMON_PRICE_HEADERS):
                mapping["price"] = col_name
            elif not mapping.get("desc") and any(h in cleaned_col for h in COMMON_DESC_HEADERS):
                mapping["desc"] = col_name
            elif not mapping.get("brand") and any(h in cleaned_col for h in COMMON_BRAND_HEADERS):
                mapping["brand"] = col_name
            elif not mapping.get("category") and any(h in cleaned_col for h in COMMON_CAT_HEADERS):
                mapping["category"] = col_name

        matches = len(mapping)
        if matches > max_matches and "code" in mapping and "price" in mapping:
            max_matches = matches
            best_row_idx = row_idx
            best_mapping = mapping

    return best_row_idx, best_mapping

def parse_file_content(
    file_bytes: bytes,
    filename: str,
    custom_mapping: Optional[Dict[str, str]] = None
) -> Tuple[List[Dict[str, Any]], Dict[str, str], List[str]]:
    """
    Parses an uploaded Excel or CSV file.
    Returns:
      - parsed_rows: List of records [{"supplier_code": ..., "description": ..., "list_price": ..., "brand": ...}]
      - column_mapping_used: Mapping from internal keys to file headers
      - available_columns: All headers discovered in the file
    """
    # 1. Read file into raw dataframe
    if filename.lower().endswith(".csv"):
        # Try utf-8 first, fallback to latin-1 (very common in Argentine ERP exports)
        try:
            df_raw = pd.read_csv(io.BytesIO(file_bytes), header=None, dtype=str)
        except Exception:
            df_raw = pd.read_csv(io.BytesIO(file_bytes), header=None, encoding="latin-1", dtype=str)
    else:
        # Excel (.xlsx or .xls)
        df_raw = pd.read_excel(io.BytesIO(file_bytes), header=None, dtype=str)

    if df_raw.empty:
        return [], {}, []

    # 2. Determine header row
    header_idx, detected_mapping = detect_headers(df_raw)
    
    # 3. Create DataFrame with proper headers
    headers = [str(h).strip() if pd.notna(h) else f"COL_{i}" for i, h in enumerate(df_raw.iloc[header_idx])]
    df = df_raw.iloc[header_idx + 1:].copy()
    df.columns = headers

    # Merge detected mapping with any supplier custom mapping preset
    mapping = dict(detected_mapping)
    if custom_mapping:
        for k, v in custom_mapping.items():
            if v and v in headers:
                mapping[k] = v

    # If code or price still not mapped, fallback to first column for code and last numeric for price
    if "code" not in mapping and len(headers) > 0:
        mapping["code"] = headers[0]
    if "price" not in mapping and len(headers) > 1:
        mapping["price"] = headers[1]

    # 4. Extract records
    code_col = mapping.get("code")
    price_col = mapping.get("price")
    desc_col = mapping.get("desc")
    brand_col = mapping.get("brand")

    rows: List[Dict[str, Any]] = []
    for _, r in df.iterrows():
        raw_code = r.get(code_col) if code_col else None
        if pd.isna(raw_code) or not str(raw_code).strip():
            continue

        code_str = str(raw_code).strip()
        raw_price = r.get(price_col) if price_col else 0.0
        price_val = clean_price_value(raw_price)

        if price_val <= 0:
            continue

        desc_val = str(r.get(desc_col, "")).strip() if desc_col and pd.notna(r.get(desc_col)) else ""
        brand_val = str(r.get(brand_col, "")).strip() if brand_col and pd.notna(r.get(brand_col)) else ""

        rows.append({
            "supplier_code": code_str,
            "description": desc_val,
            "list_price": price_val,
            "brand": brand_val
        })

    return rows, mapping, headers

