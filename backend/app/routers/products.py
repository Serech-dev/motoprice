from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.services.normalizer import normalize_code, extract_alternate_codes, strip_accents
from app.services.pricing_engine import calculate_sale_price

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/", response_model=List[ProductOut])
def list_products(
    q: Optional[str] = Query(None, description="Search across motorcycle model, part name, SKU, OEM, or cross-ref"),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category and category != "Todos":
        query = query.filter(Product.category == category)
    if brand:
        query = query.filter(Product.brand == brand)

    if q and q.strip():
        cleaned_q = strip_accents(q)
        tokens = [t for t in cleaned_q.split() if t]

        if not tokens:
            return query.order_by(Product.internal_code.asc()).offset(offset).limit(limit).all()

        candidates = query.all()
        scored_results = []

        for p in candidates:
            # Build clean searchable representations with accents stripped
            p_name = strip_accents(p.name)
            p_brand = strip_accents(p.brand)
            p_cat = strip_accents(p.category)
            p_models = " ".join(strip_accents(m) for m in (p.compatible_models or []))
            p_internal = strip_accents(p.internal_code)
            p_norm_internal = normalize_code(p.internal_code).lower()
            p_oem = strip_accents(p.oem_code)
            p_norm_oem = normalize_code(p.oem_code).lower()

            # Alternate cross references
            alts_raw = extract_alternate_codes(p.alternate_codes)
            p_alts = " ".join(a.lower() for a in alts_raw)

            # Combined unified text representation
            searchable_blob = f"{p_name} {p_brand} {p_cat} {p_models} {p_internal} {p_norm_internal} {p_oem} {p_norm_oem} {p_alts}"

            # Every token must match somewhere in the product
            all_tokens_match = True
            for t in tokens:
                norm_token = normalize_code(t).lower()
                if (t in searchable_blob) or (norm_token and norm_token in searchable_blob):
                    continue
                all_tokens_match = False
                break

            if all_tokens_match:
                # Rank relevance: model + name matches get higher priority
                score = 0
                for t in tokens:
                    if t in p_name:
                        score += 3
                    if t in p_models:
                        score += 4
                    if t in p_brand:
                        score += 2
                    if t in p_cat:
                        score += 1
                    if t in p_internal or t in p_oem:
                        score += 5
                scored_results.append((score, p))

        # Sort highest score first
        scored_results.sort(key=lambda x: x[0], reverse=True)
        filtered = [p for _, p in scored_results]
        return filtered[offset:offset + limit]

    return query.order_by(Product.internal_code.asc()).offset(offset).limit(limit).all()

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.internal_code == product_in.internal_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this internal code already exists")

    data = product_in.model_dump()
    if not data.get("sale_price_ars") or data.get("sale_price_ars") == 0:
        data["sale_price_ars"] = calculate_sale_price(data.get("cost_price_ars", 0.0), data.get("profit_margin_pct", 45.0))

    product = Product(**data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, update_data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for k, v in update_data.model_dump(exclude_unset=True).items():
        setattr(product, k, v)

    # Recalculate sale price if cost or margin changed and sale_price was not explicitly provided
    if "cost_price_ars" in update_data.model_dump(exclude_unset=True) or "profit_margin_pct" in update_data.model_dump(exclude_unset=True):
        if "sale_price_ars" not in update_data.model_dump(exclude_unset=True):
            product.sale_price_ars = calculate_sale_price(product.cost_price_ars, product.profit_margin_pct)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None
