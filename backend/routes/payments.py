from flask import Blueprint, jsonify, request, session

from backend.services.payment_service import process_checkout_payment


payments_bp = Blueprint("payments", __name__)


@payments_bp.post("/api/payments/checkout")
def api_payments_checkout():
    user = session.get("user")

    if not user:
        return jsonify({"ok": False, "message": "Faca login para concluir o pagamento."}), 401

    payload = request.get_json(silent=True) or {}
    result = process_checkout_payment(user=user, payload=payload)
    status_code = 201 if result.get("ok") else 400
    return jsonify(result), status_code
