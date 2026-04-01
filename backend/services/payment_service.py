from __future__ import annotations

import json
from datetime import datetime

from backend.database.db import get_connection
from backend.services.order_service import create_order, update_order_payment


def _generate_transaction_id() -> str:
    return f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def _build_payment_result(*, method: str, total: float, transaction_id: str) -> dict:
    if method == "pix":
        pix_code = f"000201PIXANYTHINGELSE{transaction_id}{int(total * 100):010d}"
        return {
            "status": "Aprovado",
            "details": {
                "pix_code": pix_code,
                "qr_code_text": pix_code,
            },
        }

    if method == "ticket":
        boleto_url = f"/pagamento/boleto/{transaction_id}"
        return {
            "status": "Aguardando boleto",
            "details": {
                "boleto_url": boleto_url,
                "expires_in_days": 2,
            },
        }

    return {
        "status": "Aprovado",
        "details": {
            "authorization_code": transaction_id[-6:],
            "card_brand": "Credito",
        },
    }


def _register_payment(
    *,
    order_id: int,
    transaction_id: str,
    payment_method: str,
    amount: float,
    status: str,
    payload: dict,
) -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO payments (
            order_id,
            transaction_id,
            payment_method,
            amount,
            status,
            payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            order_id,
            transaction_id,
            payment_method,
            round(float(amount or 0), 2),
            status,
            json.dumps(payload, ensure_ascii=True),
        ),
    )

    conn.commit()
    conn.close()


def process_checkout_payment(*, user: dict, payload: dict) -> dict:
    order_result = create_order(user=user, payload=payload)
    if not order_result.get("ok"):
        return order_result

    order = order_result["order"]
    order_id = int(order["id"])
    payment_method = (payload.get("payment_method") or "pix").strip() or "pix"
    total = round(float(payload.get("total") or 0), 2)
    transaction_id = _generate_transaction_id()
    payment_result = _build_payment_result(
        method=payment_method,
        total=total,
        transaction_id=transaction_id,
    )

    _register_payment(
        order_id=order_id,
        transaction_id=transaction_id,
        payment_method=payment_method,
        amount=total,
        status=payment_result["status"],
        payload=payment_result["details"],
    )

    paid_at = None
    order_status = "Aguardando pagamento"

    if payment_result["status"] == "Aprovado":
        order_status = "Pagamento aprovado"
        paid_at = datetime.now().isoformat(timespec="seconds")
    elif payment_result["status"] == "Aguardando boleto":
        order_status = "Aguardando boleto"

    update_order_payment(
        order_id=order_id,
        payment_status=payment_result["status"],
        payment_reference=transaction_id,
        payment_payload=payment_result["details"],
        order_status=order_status,
        paid_at=paid_at,
    )

    return {
        "ok": True,
        "order": order,
        "payment": {
            "transaction_id": transaction_id,
            "method": payment_method,
            "status": payment_result["status"],
            "amount": total,
            "details": payment_result["details"],
        },
    }
