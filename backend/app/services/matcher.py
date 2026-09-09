from typing import Dict, Tuple, Optional, List
from sqlalchemy.orm import Session
from app.models.product import Product
from app.services.normalizer import normalize_code, extract_alternate_codes

class MultiCodeMatcher:
    def __init__(self, db: Session):
        self.db = db
        # Dictionary mapping: normalized_code -> (Product, matched_by_str)
        self.code_index: Dict[str, Tuple[Product, str]] = {}
        self._build_index()

    def _build_index(self):
        products = self.db.query(Product).all()
        for prod in products:
            # 1. Index internal code
            norm_internal = normalize_code(prod.internal_code)
            if norm_internal:
                self.code_index[norm_internal] = (prod, "internal_code")

            # 2. Index OEM code
            if prod.oem_code:
                norm_oem = normalize_code(prod.oem_code)
                if norm_oem and norm_oem not in self.code_index:
                    self.code_index[norm_oem] = (prod, "oem_code")

            # 3. Index Alternate / Cross-reference codes (Fram, Mann, Wega, Bosch, etc.)
            alt_codes = extract_alternate_codes(prod.alternate_codes)
            for alt in alt_codes:
                if alt and alt not in self.code_index:
                    self.code_index[alt] = (prod, "alternate_code")

    def match(self, supplier_code: str) -> Tuple[Optional[Product], Optional[str]]:
        """
        Attempts to match a supplier's raw part code against internal, OEM, or cross-reference codes.
        Returns (Product, match_type) or (None, None).
        """
        if not supplier_code:
            return None, None

        norm = normalize_code(supplier_code)
        if not norm:
            return None, None

        # 1. Exact normalized match
        if norm in self.code_index:
            return self.code_index[norm]

        # 2. Try removing leading zeroes (e.g., '030115561AA' vs '30115561AA')
        stripped_norm = norm.lstrip('0')
        if stripped_norm and stripped_norm in self.code_index:
            return self.code_index[stripped_norm]

        return None, None

