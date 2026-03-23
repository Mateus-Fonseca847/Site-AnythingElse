from flask import Blueprint, jsonify, request
from backend.services.product_service import (
    list_products,
    get_product_by_codigo,
    create_product,
    update_product,
    update_product_stock,
    list_stock_movements,
)

products_bp = Blueprint("products", __name__)


@products_bp.get("/api/products")
def api_list_products():
    return jsonify({"ok": True, "products": list_products()})


@products_bp.get("/api/products/<codigo>")
def api_get_product(codigo):
    product = get_product_by_codigo(codigo)

    if not product:
        return jsonify({"ok": False, "message": "Produto não encontrado."}), 404

    return jsonify({"ok": True, "product": product})


@products_bp.post("/api/products")
def api_create_product():
    data = request.get_json() or {}

    if not (data.get("codigo") or "").strip():
        return jsonify({"ok": False, "message": "Código é obrigatório."}), 400

    if not (data.get("nome") or "").strip():
        return jsonify({"ok": False, "message": "Nome é obrigatório."}), 400

    result = create_product(data)

    if not result["ok"]:
        return jsonify(result), 400

    return jsonify(result), 201


@products_bp.put("/api/products/<codigo>")
def api_update_product(codigo):
    data = request.get_json() or {}
    result = update_product(codigo, data)

    if not result["ok"]:
        return jsonify(result), 404

    return jsonify(result)


@products_bp.get("/api/stock/<codigo>")
def api_get_stock(codigo):
    product = get_product_by_codigo(codigo)

    if not product:
        return jsonify({"ok": False, "message": "Produto não encontrado."}), 404

    return jsonify(
        {
            "ok": True,
            "codigo": product["codigo"],
            "nome": product["nome"],
            "qtd_estoque": product["qtd_estoque"],
            "status": product["status"],
        }
    )


@products_bp.post("/api/stock/entry")
def api_stock_entry():
    data = request.get_json() or {}
    codigo = (data.get("codigo") or "").strip()
    quantidade = int(data.get("quantidade") or 0)

    if not codigo or quantidade <= 0:
        return jsonify({"ok": False, "message": "Dados inválidos."}), 400

    result = update_product_stock(
        codigo=codigo,
        delta=quantidade,
        origem=data.get("origem", "gestor_comercial"),
        observacao=data.get("observacao", "Entrada manual"),
    )

    if not result["ok"]:
        return jsonify(result), 400

    return jsonify(result)


@products_bp.post("/api/stock/exit")
def api_stock_exit():
    data = request.get_json() or {}
    codigo = (data.get("codigo") or "").strip()
    quantidade = int(data.get("quantidade") or 0)

    if not codigo or quantidade <= 0:
        return jsonify({"ok": False, "message": "Dados inválidos."}), 400

    result = update_product_stock(
        codigo=codigo,
        delta=-quantidade,
        origem=data.get("origem", "gestor_comercial"),
        observacao=data.get("observacao", "Saída manual"),
    )

    if not result["ok"]:
        return jsonify(result), 400

    return jsonify(result)


@products_bp.get("/api/stock/movements")
def api_stock_movements():
    return jsonify({"ok": True, "movements": list_stock_movements()})