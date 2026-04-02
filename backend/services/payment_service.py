from __future__ import annotations

import json
import unicodedata
from datetime import datetime, timedelta
from urllib.parse import quote

from backend.database.db import get_connection
from backend.services.order_service import create_order, update_order_payment

PIX_RECEIVER_KEY = "18453526702"
PIX_RECEIVER_NAME = "Mateus de Souza Fonseca"
PIX_RECEIVER_CITY = "Petropolis"


def _generate_transaction_id() -> str:
    return f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def _normalize_pix_text(value: str, limit: int) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    normalized = normalized.upper().strip()
    normalized = "".join(char for char in normalized if char.isalnum() or char == " ")
    normalized = " ".join(normalized.split())
    return normalized[:limit]


def _emv_field(field_id: str, value: str) -> str:
    text = str(value or "")
    return f"{field_id}{len(text):02d}{text}"


def _crc16_ccitt(payload: str) -> str:
    polynomial = 0x1021
    result = 0xFFFF

    for char in payload.encode("utf-8"):
      result ^= char << 8
      for _ in range(8):
          if result & 0x8000:
              result = ((result << 1) ^ polynomial) & 0xFFFF
          else:
              result = (result << 1) & 0xFFFF

    return f"{result:04X}"


def _build_pix_code(*, total: float, transaction_id: str) -> dict:
    txid = _normalize_pix_text(transaction_id, 25) or "***"
    merchant_name = _normalize_pix_text(PIX_RECEIVER_NAME, 25)
    merchant_city = _normalize_pix_text(PIX_RECEIVER_CITY, 15)
    amount = f"{round(float(total or 0), 2):.2f}"

    merchant_account_info = (
        _emv_field("00", "br.gov.bcb.pix")
        + _emv_field("01", PIX_RECEIVER_KEY)
    )

    additional_data = _emv_field("05", txid)

    payload_without_crc = (
        _emv_field("00", "01")
        + _emv_field("26", merchant_account_info)
        + _emv_field("52", "0000")
        + _emv_field("53", "986")
        + _emv_field("54", amount)
        + _emv_field("58", "BR")
        + _emv_field("59", merchant_name)
        + _emv_field("60", merchant_city)
        + _emv_field("62", additional_data)
        + "6304"
    )

    crc = _crc16_ccitt(payload_without_crc)
    pix_code = f"{payload_without_crc}{crc}"
    qr_code_url = (
        "https://api.qrserver.com/v1/create-qr-code/"
        f"?size=512x512&data={quote(pix_code)}"
    )

    return {
        "pix_code": pix_code,
        "qr_code_text": pix_code,
        "qr_code_url": qr_code_url,
        "receiver_name": merchant_name,
        "receiver_city": merchant_city,
        "receiver_key": PIX_RECEIVER_KEY,
        "txid": txid,
    }


def _build_payment_result(*, method: str, total: float, transaction_id: str) -> dict:
    if method == "pix":
        return {
            "status": "Aguardando Pix",
            "details": _build_pix_code(total=total, transaction_id=transaction_id),
        }

    if method == "ticket":
        boleto_url = f"/pagamento/boleto?ref={transaction_id}"
        due_date = (datetime.now() + timedelta(days=2)).date().isoformat()
        boleto_code = (
            f"34191.79001 {transaction_id[-5:]}43210 "
            f"12345.678901 {transaction_id[-10:-5]}43210 "
            f"1 {int(total * 100):010d}"
        )
        return {
            "status": "Aguardando boleto",
            "details": {
                "boleto_url": boleto_url,
                "expires_in_days": 2,
                "due_date": due_date,
                "boleto_code": boleto_code,
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
