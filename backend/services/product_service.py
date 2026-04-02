from __future__ import annotations

import re
import unicodedata
from typing import Any

from backend.database.db import get_connection


def _to_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def calculate_status(qtd_estoque: int, qtd_minima: int) -> str:
    if qtd_estoque <= 0:
        return "Sem estoque"
    if qtd_estoque < qtd_minima:
        return "Produto em falta"
    if qtd_estoque <= qtd_minima + 3:
        return "Estoque baixo"
    return "Disponível"


def normalize_product_payload(data: dict[str, Any]) -> dict[str, Any]:
    qtd_estoque = max(0, _to_int(data.get("qtd_estoque"), 0))
    qtd_minima = max(0, _to_int(data.get("qtd_minima"), 0))
    preco = max(0.0, _to_float(data.get("preco"), 0.0))
    custo = max(0.0, _to_float(data.get("custo"), 0.0))

    return {
        "codigo": (data.get("codigo") or "").strip(),
        "nome": (data.get("nome") or "").strip(),
        "descricao": (data.get("descricao") or "").strip(),
        "qtd_estoque": qtd_estoque,
        "qtd_minima": qtd_minima,
        "preco": preco,
        "custo": custo,
        "fornecedor": (data.get("fornecedor") or "").strip(),
        "garantia": (data.get("garantia") or "").strip(),
        "validade": (data.get("validade") or "").strip(),
        "lote": (data.get("lote") or "").strip(),
        "tipo_produto": (data.get("tipo_produto") or "").strip(),
        "imagem": (data.get("imagem") or "").strip(),
        "status": calculate_status(qtd_estoque, qtd_minima),
    }


def list_products() -> list[dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT *
        FROM products
        WHERE ativo = 1
        ORDER BY id DESC
        """
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def normalize_search_text(value: Any) -> str:
    text = str(value or "").strip().lower()
    normalized = unicodedata.normalize("NFKD", text)
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", normalized)


def search_products(query: str, limit: int | None = None) -> list[dict[str, Any]]:
    normalized_query = normalize_search_text(query)
    if not normalized_query:
        return []

    terms = [term for term in normalized_query.split(" ") if term]
    scored_products: list[tuple[int, dict[str, Any]]] = []

    for product in list_products():
        codigo = normalize_search_text(product.get("codigo"))
        nome = normalize_search_text(product.get("nome"))
        tipo = normalize_search_text(product.get("tipo_produto"))
        descricao = normalize_search_text(product.get("descricao"))
        descricao_detalhada = normalize_search_text(product.get("descricao_detalhada"))

        haystack = " ".join(
            part for part in [codigo, nome, tipo, descricao, descricao_detalhada] if part
        )

        if normalized_query not in haystack and not all(term in haystack for term in terms):
            continue

        score = 0

        if codigo == normalized_query:
            score += 160
        elif codigo.startswith(normalized_query):
            score += 120
        elif normalized_query in codigo:
            score += 80

        if nome == normalized_query:
            score += 150
        elif nome.startswith(normalized_query):
            score += 110
        elif normalized_query in nome:
            score += 75

        if tipo == normalized_query:
            score += 70
        elif tipo.startswith(normalized_query):
            score += 40
        elif normalized_query in tipo:
            score += 25

        if normalized_query in descricao:
            score += 22

        if normalized_query in descricao_detalhada:
            score += 12

        for term in terms:
            if term in codigo:
                score += 35
            if term in nome:
                score += 28
            if term in tipo:
                score += 14
            if term in descricao:
                score += 10
            if term in descricao_detalhada:
                score += 5

        score += min(int(product.get("vendas") or 0), 30)

        scored_products.append((score, product))

    scored_products.sort(
        key=lambda item: (
            item[0],
            int(item[1].get("vendas") or 0),
            item[1].get("data_lancamento") or "",
            item[1].get("nome") or "",
        ),
        reverse=True,
    )

    results = [product for _, product in scored_products]
    if limit is not None:
        return results[:limit]
    return results


def get_product_by_codigo(codigo: str) -> dict[str, Any] | None:
    conn = get_connection()
    row = conn.execute(
        """
        SELECT *
        FROM products
        WHERE codigo = ? AND ativo = 1
        """,
        (codigo,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def create_product(data: dict[str, Any]) -> dict[str, Any]:
    payload = normalize_product_payload(data)

    if not payload["codigo"]:
        return {"ok": False, "message": "Código é obrigatório."}

    if not payload["nome"]:
        return {"ok": False, "message": "Nome é obrigatório."}

    conn = get_connection()
    existing = conn.execute(
        "SELECT id FROM products WHERE codigo = ?",
        (payload["codigo"],),
    ).fetchone()

    if existing:
        conn.close()
        return {"ok": False, "message": "Já existe um produto com esse código."}

    conn.execute(
        """
        INSERT INTO products (
            codigo, nome, descricao, qtd_estoque, qtd_minima, preco, custo,
            fornecedor, garantia, validade, lote, status, tipo_produto, imagem, ativo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """,
        (
            payload["codigo"],
            payload["nome"],
            payload["descricao"],
            payload["qtd_estoque"],
            payload["qtd_minima"],
            payload["preco"],
            payload["custo"],
            payload["fornecedor"],
            payload["garantia"],
            payload["validade"],
            payload["lote"],
            payload["status"],
            payload["tipo_produto"],
            payload["imagem"],
        ),
    )
    conn.commit()
    conn.close()

    return {
        "ok": True,
        "message": "Produto criado com sucesso.",
        "product": get_product_by_codigo(payload["codigo"]),
    }


def update_product(codigo: str, data: dict[str, Any]) -> dict[str, Any]:
    existing = get_product_by_codigo(codigo)
    if not existing:
        return {"ok": False, "message": "Produto não encontrado."}

    merged = {**existing, **(data or {})}
    payload = normalize_product_payload(merged)
    payload["codigo"] = codigo

    conn = get_connection()
    conn.execute(
        """
        UPDATE products
        SET
            nome = ?,
            descricao = ?,
            qtd_estoque = ?,
            qtd_minima = ?,
            preco = ?,
            custo = ?,
            fornecedor = ?,
            garantia = ?,
            validade = ?,
            lote = ?,
            status = ?,
            tipo_produto = ?,
            imagem = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE codigo = ? AND ativo = 1
        """,
        (
            payload["nome"],
            payload["descricao"],
            payload["qtd_estoque"],
            payload["qtd_minima"],
            payload["preco"],
            payload["custo"],
            payload["fornecedor"],
            payload["garantia"],
            payload["validade"],
            payload["lote"],
            payload["status"],
            payload["tipo_produto"],
            payload["imagem"],
            codigo,
        ),
    )
    conn.commit()
    conn.close()

    return {
        "ok": True,
        "message": "Produto atualizado com sucesso.",
        "product": get_product_by_codigo(codigo),
    }


def register_stock_movement(
    codigo: str,
    nome: str,
    tipo: str,
    quantidade: int,
    origem: str,
    observacao: str = "",
) -> None:
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO stock_movements (
            codigo_produto, nome_produto, tipo, quantidade, origem, observacao
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (codigo, nome, tipo, quantidade, origem, observacao),
    )
    conn.commit()
    conn.close()


def list_stock_movements() -> list[dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT *
        FROM stock_movements
        ORDER BY datetime(created_at) DESC, id DESC
        """
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_product_stock(
    codigo: str,
    delta: int,
    origem: str = "gestor_comercial",
    observacao: str = "",
) -> dict[str, Any]:
    conn = get_connection()
    row = conn.execute(
        """
        SELECT *
        FROM products
        WHERE codigo = ? AND ativo = 1
        """,
        (codigo,),
    ).fetchone()

    if not row:
        conn.close()
        return {"ok": False, "message": "Produto não encontrado."}

    current_stock = row["qtd_estoque"]
    new_stock = current_stock + int(delta)

    if new_stock < 0:
        conn.close()
        return {"ok": False, "message": "Estoque insuficiente."}

    status = calculate_status(new_stock, row["qtd_minima"])

    conn.execute(
        """
        UPDATE products
        SET qtd_estoque = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE codigo = ?
        """,
        (new_stock, status, codigo),
    )
    conn.commit()
    conn.close()

    register_stock_movement(
        codigo=row["codigo"],
        nome=row["nome"],
        tipo="Entrada" if delta > 0 else "Saída",
        quantidade=abs(int(delta)),
        origem=origem,
        observacao=observacao,
    )

    return {
        "ok": True,
        "message": "Estoque atualizado com sucesso.",
        "codigo": codigo,
        "qtd_estoque": new_stock,
        "status": status,
        "product": get_product_by_codigo(codigo),
    }
