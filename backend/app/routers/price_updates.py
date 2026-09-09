import io
import json
from datetime import datetime
from typing import Optional, List
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.price_batch import PriceUpdateBatch, PriceUpdateItem
from app.schemas.price_batch import (
    PriceUpdateBatchOut, PriceUpdateBatchDetailOut, PriceUpdateItemOut,
    ItemUpdateRequest, BatchApplyRequest, BatchApplyResponse
)
from app.services.file_parser import parse_file_content
from app.services.matcher import MultiCodeMatcher
from app.services.pricing_engine import (
    calculate_net_cost,
    calculate_sale_price,
    calculate_diff_and_flags
)
from app.routers.settings import get_bundle_from_db

router = APIRouter(prefix="/api/price-updates", tags=["Price Updates"])

@router.post("/upload", response_model=PriceUpdateBatchDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_price_list(
    file: UploadFile = File(...),
    supplier_id: int = Form(...),
    discount_1: Optional[float] = Form(None),
    discount_2: Optional[float] = Form(None),
    discount_3: Optional[float] = Form(None),
    vat_included: Optional[bool] = Form(None),
    exchange_rate: Optional[float] = Form(None),
    rounding_rule: Optional[str] = Form(None),
    column_mapping_json: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    settings_bundle = get_bundle_from_db(db)

    # Resolve active discount parameters
    d1 = discount_1 if discount_1 is not None else supplier.default_discount_1_pct
    d2 = discount_2 if discount_2 is not None else supplier.default_discount_2_pct
    d3 = discount_3 if discount_3 is not None else supplier.default_discount_3_pct
    discounts = [d1, d2, d3]

    vat_inc = vat_included if vat_included is not None else supplier.vat_included
    vat_pct = supplier.custom_vat_pct or settings_bundle.default_vat_pct
    fx_rate = exchange_rate if exchange_rate is not None else settings_bundle.exchange_rate_usd_ars
    currency = supplier.currency or "ARS"
    active_rounding = rounding_rule or settings_bundle.default_rounding_rule

    # Parse custom column mapping if provided
    custom_map = None
    if column_mapping_json:
        try:
            custom_map = json.loads(column_mapping_json)
        except Exception:
            custom_map = supplier.column_mapping or {}
    else:
        custom_map = supplier.column_mapping or {}

    # Read uploaded file bytes
    file_bytes = await file.read()
    try:
        parsed_rows, used_mapping, available_headers = parse_file_content(
            file_bytes=file_bytes,
            filename=file.filename,
            custom_mapping=custom_map
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    if not parsed_rows:
        raise HTTPException(status_code=400, detail="No valid price rows found in file. Check column mapping.")

    # Save mapping to supplier if empty
    if not supplier.column_mapping and used_mapping:
        supplier.column_mapping = used_mapping
        db.commit()

    # Create Batch
    batch = PriceUpdateBatch(
        supplier_id=supplier.id,
        filename=file.filename,
        total_items=len(parsed_rows),
        discount_1_applied=d1,
        discount_2_applied=d2,
        discount_3_applied=d3,
        vat_rate_applied=vat_pct,
        exchange_rate_applied=fx_rate,
        rounding_rule_applied=active_rounding,
        status="pending_review"
    )
    db.add(batch)
    db.flush()

    # Build matcher and iterate rows
    matcher = MultiCodeMatcher(db)
    matched_count = 0
    unmatched_count = 0

    batch_items: List[PriceUpdateItem] = []

    for r in parsed_rows:
        code = r["supplier_code"]
        list_price = r["list_price"]
        desc = r.get("description", "")
        brand = r.get("brand", "")

        matched_prod, match_type = matcher.match(code)

        # Compute Net Cost
        new_cost = calculate_net_cost(
            list_price=list_price,
            discounts=discounts,
            vat_included=vat_inc,
            vat_pct=vat_pct,
            currency=currency,
            exchange_rate=fx_rate
        )

        if matched_prod:
            matched_count += 1
            old_cost = matched_prod.cost_price_ars
            old_sale = matched_prod.sale_price_ars
            proposed_sale = calculate_sale_price(
                net_cost=new_cost,
                margin_pct=matched_prod.profit_margin_pct,
                rounding_rule=active_rounding
            )

            pct_change, is_flagged, flag_reason = calculate_diff_and_flags(
                old_cost=old_cost,
                new_cost=new_cost,
                old_sale=old_sale,
                new_sale=proposed_sale,
                spike_threshold=settings_bundle.spike_threshold_pct,
                drop_threshold=settings_bundle.drop_threshold_pct
            )

            item = PriceUpdateItem(
                batch_id=batch.id,
                product_id=matched_prod.id,
                supplier_code=code,
                supplier_description=desc or matched_prod.name,
                supplier_brand=brand or matched_prod.brand,
                matched_by=match_type,
                list_price=list_price,
                old_cost=old_cost,
                new_cost=new_cost,
                old_sale_price=old_sale,
                proposed_sale_price=proposed_sale,
                pct_change=pct_change,
                is_flagged=is_flagged,
                flag_reason=flag_reason,
                is_approved=not is_flagged  # Spikes require manual confirmation
            )
        else:
            unmatched_count += 1
            proposed_sale = calculate_sale_price(
                net_cost=new_cost,
                margin_pct=settings_bundle.default_margin_pct,
                rounding_rule=active_rounding
            )

            item = PriceUpdateItem(
                batch_id=batch.id,
                product_id=None,
                supplier_code=code,
                supplier_description=desc,
                supplier_brand=brand,
                matched_by=None,
                list_price=list_price,
                old_cost=0.0,
                new_cost=new_cost,
                old_sale_price=0.0,
                proposed_sale_price=proposed_sale,
                pct_change=0.0,
                is_flagged=False,
                flag_reason="Código no encontrado en catálogo",
                is_approved=False
            )

        batch_items.append(item)

    batch.matched_items = matched_count
    batch.unmatched_items = unmatched_count
    db.add_all(batch_items)
    db.commit()
    db.refresh(batch)

    # Format response with nested product preview data
    return build_batch_detail_response(batch, db)

def build_batch_detail_response(batch: PriceUpdateBatch, db: Session) -> PriceUpdateBatchDetailOut:
    items_out = []
    # Pre-fetch products for quick formatting
    prod_ids = [it.product_id for it in batch.items if it.product_id]
    prods_by_id = {p.id: p for p in db.query(Product).filter(Product.id.in_(prod_ids)).all()} if prod_ids else {}

    for it in batch.items:
        p = prods_by_id.get(it.product_id)
        items_out.append(PriceUpdateItemOut(
            id=it.id,
            batch_id=it.batch_id,
            product_id=it.product_id,
            supplier_code=it.supplier_code,
            supplier_description=it.supplier_description,
            supplier_brand=it.supplier_brand,
            matched_by=it.matched_by,
            list_price=it.list_price,
            old_cost=it.old_cost,
            new_cost=it.new_cost,
            old_sale_price=it.old_sale_price,
            proposed_sale_price=it.proposed_sale_price,
            pct_change=it.pct_change,
            is_flagged=it.is_flagged,
            flag_reason=it.flag_reason,
            is_approved=it.is_approved,
            override_sale_price=it.override_sale_price,
            matched_product_name=p.name if p else None,
            matched_product_internal_code=p.internal_code if p else None,
            matched_product_oem=p.oem_code if p else None
        ))

    return PriceUpdateBatchDetailOut(
        id=batch.id,
        supplier_id=batch.supplier_id,
        supplier_name=batch.supplier.name if batch.supplier else None,
        filename=batch.filename,
        total_items=batch.total_items,
        matched_items=batch.matched_items,
        unmatched_items=batch.unmatched_items,
        status=batch.status,
        discount_1_applied=batch.discount_1_applied,
        discount_2_applied=batch.discount_2_applied,
        discount_3_applied=batch.discount_3_applied,
        vat_rate_applied=batch.vat_rate_applied,
        exchange_rate_applied=batch.exchange_rate_applied,
        rounding_rule_applied=batch.rounding_rule_applied,
        created_at=batch.created_at,
        applied_at=batch.applied_at,
        items=items_out
    )

@router.get("/{batch_id}", response_model=PriceUpdateBatchDetailOut)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(PriceUpdateBatch).filter(PriceUpdateBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return build_batch_detail_response(batch, db)

@router.get("/", response_model=List[PriceUpdateBatchOut])
def list_batches(db: Session = Depends(get_db)):
    batches = db.query(PriceUpdateBatch).order_by(PriceUpdateBatch.created_at.desc()).all()
    results = []
    for b in batches:
        results.append(PriceUpdateBatchOut(
            id=b.id,
            supplier_id=b.supplier_id,
            supplier_name=b.supplier.name if b.supplier else None,
            filename=b.filename,
            total_items=b.total_items,
            matched_items=b.matched_items,
            unmatched_items=b.unmatched_items,
            status=b.status,
            discount_1_applied=b.discount_1_applied,
            discount_2_applied=b.discount_2_applied,
            discount_3_applied=b.discount_3_applied,
            vat_rate_applied=b.vat_rate_applied,
            exchange_rate_applied=b.exchange_rate_applied,
            rounding_rule_applied=b.rounding_rule_applied,
            created_at=b.created_at,
            applied_at=b.applied_at
        ))
    return results

@router.put("/{batch_id}/items/{item_id}", response_model=PriceUpdateItemOut)
def update_item(batch_id: int, item_id: int, update_data: ItemUpdateRequest, db: Session = Depends(get_db)):
    item = db.query(PriceUpdateItem).filter(
        PriceUpdateItem.id == item_id,
        PriceUpdateItem.batch_id == batch_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if update_data.is_approved is not None:
        item.is_approved = update_data.is_approved
    if update_data.override_sale_price is not None:
        item.override_sale_price = update_data.override_sale_price

    db.commit()
    db.refresh(item)

    prod = db.query(Product).filter(Product.id == item.product_id).first() if item.product_id else None
    return PriceUpdateItemOut(
        id=item.id,
        batch_id=item.batch_id,
        product_id=item.product_id,
        supplier_code=item.supplier_code,
        supplier_description=item.supplier_description,
        supplier_brand=item.supplier_brand,
        matched_by=item.matched_by,
        list_price=item.list_price,
        old_cost=item.old_cost,
        new_cost=item.new_cost,
        old_sale_price=item.old_sale_price,
        proposed_sale_price=item.proposed_sale_price,
        pct_change=item.pct_change,
        is_flagged=item.is_flagged,
        flag_reason=item.flag_reason,
        is_approved=item.is_approved,
        override_sale_price=item.override_sale_price,
        matched_product_name=prod.name if prod else None,
        matched_product_internal_code=prod.internal_code if prod else None,
        matched_product_oem=prod.oem_code if prod else None
    )

@router.post("/{batch_id}/apply", response_model=BatchApplyResponse)
def apply_price_updates(
    batch_id: int,
    request: BatchApplyRequest = BatchApplyRequest(),
    db: Session = Depends(get_db)
):
    batch = db.query(PriceUpdateBatch).filter(PriceUpdateBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if batch.status == "applied":
        raise HTTPException(status_code=400, detail="This batch has already been applied")

    # Determine which items to apply
    query = db.query(PriceUpdateItem).filter(
        PriceUpdateItem.batch_id == batch.id,
        PriceUpdateItem.product_id.isnot(None)
    )
    if request.selected_item_ids:
        items_to_apply = query.filter(PriceUpdateItem.id.in_(request.selected_item_ids)).all()
    else:
        # Default: all approved items
        items_to_apply = query.filter(PriceUpdateItem.is_approved == True).all()

    if not items_to_apply:
        raise HTTPException(status_code=400, detail="No approved items found to apply")

    now = datetime.utcnow()
    updated_count = 0

    # Execute atomic updates
    for it in items_to_apply:
        prod = db.query(Product).filter(Product.id == it.product_id).first()
        if prod:
            prod.cost_price_ars = it.new_cost
            final_sale = it.override_sale_price if (it.override_sale_price is not None and it.override_sale_price > 0) else it.proposed_sale_price
            prod.sale_price_ars = final_sale
            
            # If USD currency or supplier was USD, update cost_price_usd
            if batch.exchange_rate_applied and batch.exchange_rate_applied > 0:
                prod.cost_price_usd = round(it.new_cost / batch.exchange_rate_applied, 2)
            
            prod.primary_supplier_id = batch.supplier_id
            prod.updated_at = now
            updated_count += 1

    batch.status = "applied"
    batch.applied_at = now
    db.commit()

    return BatchApplyResponse(
        success=True,
        batch_id=batch.id,
        updated_products_count=updated_count,
        message=f"{updated_count} precios de repuestos actualizados exitosamente en el catálogo."
    )

@router.get("/{batch_id}/export")
def export_batch_excel(
    batch_id: int,
    format: str = "xlsx",
    db: Session = Depends(get_db)
):
    batch = db.query(PriceUpdateBatch).filter(PriceUpdateBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    prods = {p.id: p for p in db.query(Product).all()}

    export_rows = []
    for it in batch.items:
        prod = prods.get(it.product_id)
        final_sale = it.override_sale_price if it.override_sale_price is not None else it.proposed_sale_price
        export_rows.append({
            "Codigo Proveedor": it.supplier_code,
            "Codigo Interno": prod.internal_code if prod else "NO_MATCH",
            "Codigo OEM": prod.oem_code if prod else "",
            "Descripcion": it.supplier_description or (prod.name if prod else ""),
            "Marca": it.supplier_brand or (prod.brand if prod else ""),
            "Precio Lista Proveedor": it.list_price,
            "Costo Anterior (ARS)": it.old_cost,
            "Nuevo Costo Neto (ARS)": it.new_cost,
            "Precio Venta Anterior (ARS)": it.old_sale_price,
            "Nuevo Precio Venta (ARS)": final_sale,
            "Variacion Costo %": it.pct_change,
            "Alerta": "SI (>30%)" if it.is_flagged else "NO",
            "Aprobado": "SI" if it.is_approved else "NO"
        })

    df = pd.DataFrame(export_rows)

    if format.lower() == "csv":
        stream = io.StringIO()
        df.to_csv(stream, index=False, sep=";", encoding="utf-8-sig")
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=precios_actualizados_batch_{batch.id}.csv"
        return response
    else:
        stream = io.BytesIO()
        with pd.ExcelWriter(stream, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Actualizaciones Precios")
        stream.seek(0)
        response = StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response.headers["Content-Disposition"] = f"attachment; filename=precios_actualizados_batch_{batch.id}.xlsx"
        return response

