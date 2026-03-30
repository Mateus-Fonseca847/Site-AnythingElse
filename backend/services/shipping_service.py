from __future__ import annotations

from typing import Any


ORIGIN_CITY = "Petrópolis"
ORIGIN_STATE = "RJ"
ORIGIN_CEP = "25600000"


def normalize_cep(value: str) -> str:
    return "".join(char for char in str(value or "") if char.isdigit())


def _resolve_shipping_zone(cep: str) -> tuple[str, int]:
    cep_number = int(cep)
    first_digit = int(cep[0])

    if 25600000 <= cep_number <= 25699999:
        return "same_city", 0

    if 20000000 <= cep_number <= 28999999:
        return "same_state", 1

    if first_digit in {0, 1, 3}:
        return "southeast", 2

    if first_digit in {8, 9}:
        return "south", 3

    if first_digit == 7:
        return "center_west", 4

    return "north_northeast", 5


def _build_option(
    *,
    option_id: str,
    label: str,
    business_days: int,
    price: float,
    selected: bool = False,
) -> dict[str, Any]:
    return {
        "id": option_id,
        "label": label,
        "price": round(max(price, 0.0), 2),
        "business_days": business_days,
        "selected": selected,
    }


def calculate_shipping_options(
    cep: str,
    *,
    subtotal: float = 0.0,
    item_count: int = 0,
) -> dict[str, Any]:
    normalized_cep = normalize_cep(cep)

    if len(normalized_cep) != 8:
        return {
            "ok": False,
            "message": "Informe um CEP válido com 8 dígitos.",
        }

    zone, distance_rank = _resolve_shipping_zone(normalized_cep)
    safe_subtotal = max(float(subtotal or 0.0), 0.0)
    safe_item_count = max(int(item_count or 0), 1)

    volumetric_factor = max(safe_item_count - 1, 0) * 2.75
    order_factor = min(safe_subtotal * 0.018, 24.0)

    standard_price = 9.9 + (distance_rank * 6.5) + volumetric_factor + order_factor
    express_price = 18.9 + (distance_rank * 9.5) + (volumetric_factor * 1.2) + (
        order_factor * 1.25
    )

    standard_days_map = {
        "same_city": 1,
        "same_state": 3,
        "southeast": 5,
        "south": 6,
        "center_west": 7,
        "north_northeast": 9,
    }
    express_days_map = {
        "same_city": 1,
        "same_state": 2,
        "southeast": 3,
        "south": 4,
        "center_west": 5,
        "north_northeast": 6,
    }

    if zone == "same_city":
        standard_price = 7.9 + volumetric_factor
        express_price = 12.9 + (volumetric_factor * 1.1)

    options = [
        _build_option(
            option_id="standard",
            label="Entrega padrão",
            business_days=standard_days_map[zone],
            price=standard_price,
            selected=True,
        ),
        _build_option(
            option_id="express",
            label="Entrega expressa",
            business_days=express_days_map[zone],
            price=express_price,
            selected=False,
        ),
    ]

    return {
        "ok": True,
        "origin": {
            "city": ORIGIN_CITY,
            "state": ORIGIN_STATE,
            "cep": ORIGIN_CEP,
        },
        "destination_cep": normalized_cep,
        "zone": zone,
        "options": options,
    }
