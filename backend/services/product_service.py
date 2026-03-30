from __future__ import annotations

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