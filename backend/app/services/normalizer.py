import re
import unicodedata
from typing import List, Optional, Any

def strip_accents(text: Optional[Any]) -> str:
    """
    Removes Spanish/Latin accents and diacritics, returning clean lowercase ASCII text.
    Examples:
      'Transmisión' -> 'transmision'
      'Batería'     -> 'bateria'
      'Piñón'       -> 'pinon'
      'GÜÉRRERO'    -> 'guerrero'
    """
    if text is None:
        return ""
    s = str(text)
    nfkd = unicodedata.normalize('NFKD', s)
    return "".join(c for c in nfkd if unicodedata.category(c) != 'Mn').lower().strip()

def normalize_code(code: Optional[Any]) -> str:
    """
    Normalizes automotive part codes by removing spaces, dashes, slashes, dots,
    and converting to uppercase.
    Examples:
      'W 712/52'       -> 'W71252'
      '030-115-561-AA' -> '030115561AA'
      'PH.5949'        -> 'PH5949'
      'WO-340'         -> 'WO340'
      ' 0 986 B00 019 ' -> '0986B00019'
    """
    if code is None:
        return ""
    # Convert to string in case it's numeric in excel (e.g. 5949)
    cleaned = str(code).strip().upper()
    # Remove all non-alphanumeric characters
    return re.sub(r'[^A-Z0-9]', '', cleaned)

def extract_alternate_codes(raw_data: Any) -> List[str]:
    """
    Extracts all normalized alternate/cross-reference codes from a JSON list or string.
    Accepts:
      - List of strings: ["PH5949", "WO-340", "W 712/52"]
      - List of dicts: [{"brand": "Fram", "code": "PH5949"}, {"brand": "Wega", "code": "WO-340"}]
      - Comma/semicolon/pipe/newline separated string: "PH5949, W 712/52 | WO-340"
      (Note: Slashes are preserved inside part numbers like Mann 'W 712/52')
    """
    normalized_list = []
    if not raw_data:
        return normalized_list

    if isinstance(raw_data, list):
        for item in raw_data:
            if isinstance(item, dict):
                code = item.get("code") or item.get("code_number") or item.get("part_number")
                if code:
                    norm = normalize_code(str(code))
                    if norm:
                        normalized_list.append(norm)
            elif isinstance(item, (str, int, float)):
                norm = normalize_code(str(item))
                if norm:
                    normalized_list.append(norm)
    elif isinstance(raw_data, str):
        # Delimit by comma, semicolon, pipe, or newline (do NOT split on '/' because of Mann filter codes like W 712/52)
        parts = re.split(r'[,;|\n]+', raw_data)
        for part in parts:
            norm = normalize_code(part)
            if norm:
                normalized_list.append(norm)

    return list(dict.fromkeys(normalized_list))  # preserve order while deduplicating
