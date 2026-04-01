from flask import Blueprint, jsonify, request, session

from backend.services.order_service import create_order, list_orders


orders_bp = Blueprint("orders", __name__)


@orders_bp.post("/api/orders")
def api_create_order():
    user = session.get("user")

    if not user:
        return jsonify({"ok": False, "message": "Faca login para finalizar a compra."}), 401

    payload = request.get_json(silent=True) or {}
    result = create_order(user=user, payload=payload)
    status_code = 201 if result.get("ok") else 400
    return jsonify(result), status_code


@orders_bp.get("/api/seller/orders")
def api_list_seller_orders():
    result = list_orders()
    return jsonify(result), 200
