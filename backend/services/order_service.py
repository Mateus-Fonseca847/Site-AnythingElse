from __future__ import annotations

import json
from datetime import datetime

from backend.database.db import get_connection


def _generate_order_number() -> str:
    return f"AE-{datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def create_order(*, user: dict, payload: dict) -> dict:
    items = payload.get("items") or []

    if not items:
        return {"ok": False, "message": "Sua sacola esta vazia."}

    subtotal = round(float(payload.get("subtotal") or 0), 2)
    shipping = round(float(payload.get("shipping") or 0), 2)
    total = round(float(payload.get("total") or 0), 2)
    delivery_mode = (payload.get("delivery_mode") or "delivery").strip() or "delivery"
    payment_method = (payload.get("payment_method") or "pix").strip() or "pix"
    selected_shipping = payload.get("selected_shipping") or {}

    order_number = _generate_order_number()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO orders (
            order_number,
            user_id,
            user_email,
            customer_name,
            subtotal,
            shipping,
            total,
            delivery_mode,
            shipping_label,
            shipping_business_days,
            cep,
            recipient,
            address_number,
            address_complement,
            payment_method
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            order_number,
            user.get("id"),
            user.get("email", ""),
            payload.get("customer_name") or user.get("name", ""),
            subtotal,
            shipping,
            total,
            delivery_mode,
            selected_shipping.get("label", ""),
            int(selected_shipping.get("business_days") or 0),
            payload.get("cep", ""),
            payload.get("recipient", ""),
            payload.get("address_number", ""),
            payload.get("address_complement", ""),
            payment_method,
        ),
    )

    order_id = cursor.lastrowid

    for item in items:
        quantity = max(int(item.get("quantity") or 1), 1)
        unit_price = round(float(item.get("price") or 0), 2)
        item_subtotal = round(quantity * unit_price, 2)
        customization_json = json.dumps(
            item.get("customization") or {},
            ensure_ascii=True,
        )

        cursor.execute(
            """
            INSERT INTO order_items (
                order_id,
                sku,
                title,
                quantity,
                unit_price,
                subtotal,
                image,
                size,
                customization_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order_id,
                item.get("sku", ""),
                item.get("title", "Produto"),
                quantity,
                unit_price,
                item_subtotal,
                item.get("image", ""),
                item.get("size", ""),
                customization_json,
            ),
        )

    conn.commit()
    conn.close()

    return {
        "ok": True,
        "order": {
            "id": order_id,
            "order_number": order_number,
        },
    }


def update_order_payment(
    *,
    order_id: int,
    payment_status: str,
    payment_reference: str,
    payment_payload: dict | None,
    order_status: str,
    paid_at: str | None = None,
) -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE orders
        SET payment_status = ?,
            payment_reference = ?,
            payment_payload_json = ?,
            status = ?,
            paid_at = ?
        WHERE id = ?
        """,
        (
            payment_status,
            payment_reference,
            json.dumps(payment_payload or {}, ensure_ascii=True),
            order_status,
            paid_at,
            order_id,
        ),
    )

    conn.commit()
    conn.close()


def list_orders() -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    order_rows = cursor.execute(
        """
        SELECT *
        FROM orders
        ORDER BY datetime(created_at) DESC, id DESC
        """
    ).fetchall()

    item_rows = cursor.execute(
        """
        SELECT *
        FROM order_items
        ORDER BY id ASC
        """
    ).fetchall()

    conn.close()

    items_by_order: dict[int, list] = {}
    for row in item_rows:
        customization = {}
        try:
            customization = json.loads(row["customization_json"] or "{}")
        except json.JSONDecodeError:
            customization = {}

        items_by_order.setdefault(row["order_id"], []).append(
            {
                "id": row["id"],
                "sku": row["sku"],
                "title": row["title"],
                "quantity": row["quantity"],
                "unit_price": row["unit_price"],
                "subtotal": row["subtotal"],
                "image": row["image"],
                "size": row["size"],
                "customization": customization,
            }
        )

    orders = []
    for row in order_rows:
        orders.append(
            {
                "id": row["id"],
                "order_number": row["order_number"],
                "user_id": row["user_id"],
                "user_email": row["user_email"],
                "customer_name": row["customer_name"],
                "subtotal": row["subtotal"],
                "shipping": row["shipping"],
                "total": row["total"],
                "delivery_mode": row["delivery_mode"],
                "shipping_label": row["shipping_label"],
                "shipping_business_days": row["shipping_business_days"],
                "cep": row["cep"],
                "recipient": row["recipient"],
                "address_number": row["address_number"],
                "address_complement": row["address_complement"],
                "payment_method": row["payment_method"],
                "payment_status": row["payment_status"],
                "payment_reference": row["payment_reference"],
                "status": row["status"],
                "paid_at": row["paid_at"],
                "created_at": row["created_at"],
                "items": items_by_order.get(row["id"], []),
            }
        )

    return {"ok": True, "orders": orders}
