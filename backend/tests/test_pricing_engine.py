import pytest
from app.services.pricing_engine import (
    calculate_discounted_price,
    calculate_net_cost,
    apply_rounding,
    calculate_sale_price,
    calculate_diff_and_flags
)

def test_discount_chains():
    # 100 with 25% discount = 75
    assert calculate_discounted_price(100.0, [25.0]) == 75.0
    # 100 with 25% + 5% chain = 75 * 0.95 = 71.25
    assert calculate_discounted_price(100.0, [25.0, 5.0]) == pytest.approx(71.25, 0.001)

def test_net_cost_calculation():
    # List: 10,000, 25% + 5% discount, VAT 21% added
    # 10,000 * 0.75 * 0.95 = 7,125
    # 7,125 * 1.21 = 8,621.25
    cost = calculate_net_cost(
        list_price=10000.0,
        discounts=[25.0, 5.0],
        vat_included=False,
        vat_pct=21.0,
        currency="ARS",
        exchange_rate=1.0
    )
    assert cost == 8621.25

    # USD currency conversion: List 10 USD, 20% discount = 8 USD * 1.21 = 9.68 USD * 1180 ARS = 11,422.40 ARS
    cost_usd = calculate_net_cost(
        list_price=10.0,
        discounts=[20.0],
        vat_included=False,
        vat_pct=21.0,
        currency="USD",
        exchange_rate=1180.0
    )
    assert cost_usd == pytest.approx(11422.40, 0.01)

def test_rounding_presets():
    assert apply_rounding(1424.0, "nearest_10") == 1420.0
    assert apply_rounding(1426.0, "nearest_10") == 1430.0
    assert apply_rounding(1435.0, "nearest_50") == 1450.0
    assert apply_rounding(1460.0, "nearest_100") == 1500.0
    assert apply_rounding(1320.0, "nearest_500") == 1500.0
    assert apply_rounding(14300.0, "psychological_990") == 14990.0

def test_sale_price_markup():
    # Net cost: 10,000, Margin: 40% -> 14,000 -> rounded to nearest 100 = 14,000
    sale = calculate_sale_price(10000.0, 40.0, "nearest_100")
    assert sale == 14000.0

    # Net cost: 4,850, Margin: 45% -> 4850 * 1.45 = 7032.5 -> nearest 100 = 7000
    sale2 = calculate_sale_price(4850.0, 45.0, "nearest_100")
    assert sale2 == 7000.0

def test_diff_and_safety_spikes():
    # Old cost: 1,000, New cost: 1,150 -> +15% (no flag)
    pct, flagged, reason = calculate_diff_and_flags(1000.0, 1150.0, 1500.0, 1700.0, 30.0, -40.0)
    assert pct == 15.0
    assert flagged is False

    # Old cost: 1,000, New cost: 1,450 -> +45% (flagged spike > 30%)
    pct, flagged, reason = calculate_diff_and_flags(1000.0, 1450.0, 1500.0, 2100.0, 30.0, -40.0)
    assert pct == 45.0
    assert flagged is True
    assert "Aumento excesivo" in reason

