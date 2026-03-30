from flask import Blueprint, jsonify, request

from backend.services.shipping_service import calculate_shipping_options


shipping_bp = Blueprint("shipping", __name__)


@shipping_bp.post("/api/shipping/quote")
def api_shipping_quote():
    data = request.get_json(silent=True) or {}

    cep = (data.get("cep") or "").strip()

    try:
        subtotal = float(data.get("subtotal") or 0)
    except (TypeError, ValueError):
        subtotal = 0.0

    try:
        item_count = int(data.get("item_count") or 0)
    except (TypeError, ValueError):
        item_count = 0

    result = calculate_shipping_options(
        cep,
        subtotal=subtotal,
        item_count=item_count,
    )

    status_code = 200 if result.get("ok") else 400
    return jsonify(result), status_code
