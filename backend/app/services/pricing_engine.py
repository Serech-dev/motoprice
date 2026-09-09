import math
from typing import List, Dict, Any, Tuple

def calculate_discounted_price(list_price: float, discounts: List[float]) -> float:
    """
    Applies multi-tier discount chain:
    Price = List Price * (1 - d1/100) * (1 - d2/100) * ...
    """
    price = float(list_price)
    for d in discounts:
        if d and d > 0:
            price = price * (1.0 - (float(d) / 100.0))
    return max(0.0, price)

def calculate_net_cost(
    list_price: float,
    discounts: List[float],
    vat_included: bool = False,
    vat_pct: float = 21.0,
    currency: str = "ARS",
    exchange_rate: float = 1.0
) -> float:
    """
    Computes exact net cost:
    1. Apply discount chain
    2. Add VAT if not already included
    3. If currency is USD, convert to ARS using exchange rate
    """
    base = calculate_discounted_price(list_price, discounts)
    
    # Apply VAT if not already included
    if not vat_included:
        base = base * (1.0 + (float(vat_pct) / 100.0))

    # Currency conversion
    if currency.upper() == "USD":
        net_cost_ars = base * float(exchange_rate)
    else:
        net_cost_ars = base

    return round(net_cost_ars, 2)

def apply_rounding(price: float, rule: str = "nearest_100") -> float:
    """
    Applies realistic retail rounding presets:
      - 'none': 2 decimal places
      - 'nearest_10': round to nearest 10 ARS (e.g. 1424 -> 1420)
      - 'nearest_50': round to nearest 50 ARS (e.g. 1424 -> 1400, 1435 -> 1450)
      - 'nearest_100': round to nearest 100 ARS (e.g. 1460 -> 1500)
      - 'nearest_500': round to nearest 500 ARS (e.g. 1320 -> 1500)
      - 'psychological_990': round to nearest 1000 minus 10 (e.g. 14,300 -> 14,990)
    """
    if price <= 0:
        return 0.0

    if rule == "none":
        return round(price, 2)
    elif rule == "nearest_10":
        return float(round(price / 10.0) * 10)
    elif rule == "nearest_50":
        return float(round(price / 50.0) * 50)
    elif rule == "nearest_100":
        return float(round(price / 100.0) * 100)
    elif rule == "nearest_500":
        return float(round(price / 500.0) * 500)
    elif rule == "psychological_990":
        # Ceil to nearest 1000 then subtract 10
        base = math.ceil(price / 1000.0) * 1000
        result = base - 10
        return float(result if result >= price else base + 990)
    else:
        return float(round(price / 100.0) * 100)

def calculate_sale_price(
    net_cost: float,
    margin_pct: float = 40.0,
    rounding_rule: str = "nearest_100"
) -> float:
    """
    Computes sale price using markup formula:
    Sale Price = Net Cost * (1 + margin_pct / 100)
    Then applies rounding preset.
    """
    raw_sale = net_cost * (1.0 + (float(margin_pct) / 100.0))
    return apply_rounding(raw_sale, rounding_rule)

def calculate_diff_and_flags(
    old_cost: float,
    new_cost: float,
    old_sale: float,
    new_sale: float,
    spike_threshold: float = 30.0,
    drop_threshold: float = -40.0
) -> Tuple[float, bool, str]:
    """
    Calculates % cost change and checks for abnormal spikes or drops.
    Returns: (pct_change, is_flagged, flag_reason)
    """
    if old_cost > 0:
        pct_change = round(((new_cost - old_cost) / old_cost) * 100.0, 2)
    else:
        # First time seen or old cost was 0
        pct_change = 0.0

    is_flagged = False
    flag_reason = ""

    if old_cost > 0:
        if pct_change >= spike_threshold:
            is_flagged = True
            flag_reason = f"Alerta: Aumento excesivo de {pct_change:+.1f}% (> {spike_threshold}%)"
        elif pct_change <= drop_threshold:
            is_flagged = True
            flag_reason = f"Alerta: Caída abrupta de {pct_change:+.1f}% (posible cambio de unidad o pack)"

    return pct_change, is_flagged, flag_reason

