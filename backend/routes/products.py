from flask import Blueprint, jsonify, request

from backend.services.product_service import (
    create_product,
    get_product_by_codigo,
    list_products,
    list_stock_movements,
    update_product,
    update_product_stock,
)

products_bp = Blueprint("products", __name__)


@products_bp.get("/api/health")
def api_health():
    return jsonify({"ok": True, "service": "inventory-api"})


@products_bp.get("/api/products")
def api_list_products():
    return jsonify({"ok": True, "products": list_products()})


@products_bp.get("/api/products/<string:codigo>")
def api_get_product(codigo: str):
    product = get_product_by_codigo(codigo)
    if not product:
        return jsonify({"ok": False, "message": "Produto não encontrado."}), 404
    return jsonify({"ok": True, "product": product})


@products_bp.post("/api/products")
def api_create_product():
    data = request.get_json(silent=True) or {}
    result = create_product(data)
    if not result["ok"]:
        return jsonify(result), 400
    return jsonify(result), 201


@products_bp.put("/api/products/<string:codigo>")
def api_update_product(codigo: str):
    data = request.get_json(silent=True) or {}
    result = update_product(codigo, data)
    if not result["ok"]:
        return jsonify(result), 404
    return jsonify(result)


@products_bp.get("/api/stock/<string:codigo>")
def api_get_stock(codigo: str):
    product = get_product_by_codigo(codigo)
    if not product:
        return jsonify({"ok": False, "message": "Produto não encontrado."}), 404

    return jsonify(
        {
            "ok": True,
            "codigo": product["codigo"],
            "nome": product["nome"],
            "qtd_estoque": product["qtd_estoque"],
            "qtd_minima": product["qtd_minima"],
            "status": product["status"],
        }
    )


@products_bp.post("/api/stock/entry")
def api_stock_entry():
    data = request.get_json(silent=True) or {}
    codigo = (data.get("codigo") or "").strip()

    try:
        quantidade = int(data.get("quantidade") or 0)
    except (TypeError, ValueError):
        quantidade = 0

    if not codigo or quantidade <= 0:
        return jsonify({"ok": False, "message": "Dados inválidos."}), 400

    result = update_product_stock(
        codigo=codigo,
        delta=quantidade,
        origem=(data.get("origem") or "gestor_comercial").strip(),
        observacao=(data.get("observacao") or "Entrada manual").strip(),
    )

    if not result["ok"]:
        return jsonify(result), 400

    return jsonify(result)


@products_bp.post("/api/stock/exit")
def api_stock_exit():
    data = request.get_json(silent=True) or {}
    codigo = (data.get("codigo") or "").strip()

    try:
        quantidade = int(data.get("quantidade") or 0)
    except (TypeError, ValueError):
        quantidade = 0

    if not codigo or quantidade <= 0:
        return jsonify({"ok": False, "message": "Dados inválidos."}), 400

    result = update_product_stock(
        codigo=codigo,
        delta=-quantidade,
        origem=(data.get("origem") or "ecommerce").strip(),
        observacao=(data.get("observacao") or "Saída por compra").strip(),
    )

    if not result["ok"]:
        return jsonify(result), 400

    return jsonify(result)


@products_bp.get("/api/stock/movements")
def api_stock_movements():
    return jsonify({"ok": True, "movements": list_stock_movements()})