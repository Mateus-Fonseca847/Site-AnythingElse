from backend.database.db import get_connection


def list_products():
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT *
        FROM products
        WHERE ativo = 1
        ORDER BY id ASC
        """
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]


def get_product_by_codigo(codigo: str):
    conn = get_connection()
    cursor = conn.cursor()

    row = cursor.execute(
        "SELECT * FROM products WHERE codigo = ? AND ativo = 1",
        (codigo,),
    ).fetchone()

    conn.close()
    return dict(row) if row else None

def update_product_stock(codigo: str, delta: int):
    conn = get_connection()
    cursor = conn.cursor()

    row = cursor.execute(
        "SELECT * FROM products WHERE codigo = ? AND ativo = 1",
        (codigo,),
    ).fetchone()

    if not row:
        conn.close()
        return {"ok": False, "message": "Produto não encontrado."}

    current_stock = row["qtd_estoque"]
    new_stock = current_stock + delta

    if new_stock < 0:
        conn.close()
        return {"ok": False, "message": "Estoque insuficiente."}

    qtd_minima = row["qtd_minima"]

    if new_stock <= 0:
        status = "Sem estoque"
    elif new_stock < qtd_minima:
        status = "Produto em falta"
    elif new_stock <= qtd_minima + 3:
        status = "Estoque baixo"
    else:
        status = "Disponível"

    cursor.execute(
        """
        UPDATE products
        SET qtd_estoque = ?, status = ?
        WHERE codigo = ?
        """,
        (new_stock, status, codigo),
    )

    conn.commit()
    conn.close()

    return {
        "ok": True,
        "codigo": codigo,
        "qtd_estoque": new_stock,
        "status": status,
    }

from backend.database.db import get_connection


def list_products():
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT *
        FROM products
        WHERE ativo = 1
        ORDER BY id DESC
        """
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]


def get_product_by_codigo(codigo: str):
    conn = get_connection()
    cursor = conn.cursor()

    row = cursor.execute(
        "SELECT * FROM products WHERE codigo = ? AND ativo = 1",
        (codigo,),
    ).fetchone()

    conn.close()
    return dict(row) if row else None


def create_product(data):
    conn = get_connection()
    cursor = conn.cursor()

    existing = cursor.execute(
        "SELECT id FROM products WHERE codigo = ?",
        (data["codigo"],),
    ).fetchone()

    if existing:
        conn.close()
        return {"ok": False, "message": "Já existe um produto com esse código."}

    cursor.execute(
        """
        INSERT INTO products (
            codigo, nome, descricao, qtd_estoque, qtd_minima, preco, custo,
            fornecedor, garantia, validade, lote, status, tipo_produto, imagem, ativo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """,
        (
            data["codigo"],
            data["nome"],
            data.get("descricao", ""),
            data.get("qtd_estoque", 0),
            data.get("qtd_minima", 0),
            data.get("preco", 0),
            data.get("custo", 0),
            data.get("fornecedor", ""),
            data.get("garantia", ""),
            data.get("validade", ""),
            data.get("lote", ""),
            data.get("status", "Disponível"),
            data.get("tipo_produto", ""),
            data.get("imagem", ""),
        ),
    )

    conn.commit()
    conn.close()
    return {"ok": True, "message": "Produto criado com sucesso."}


def update_product(codigo, data):
    conn = get_connection()
    cursor = conn.cursor()

    existing = cursor.execute(
        "SELECT id FROM products WHERE codigo = ? AND ativo = 1",
        (codigo,),
    ).fetchone()

    if not existing:
        conn.close()
        return {"ok": False, "message": "Produto não encontrado."}

    cursor.execute(
        """
        UPDATE products
        SET nome = ?, descricao = ?, qtd_estoque = ?, qtd_minima = ?, preco = ?, custo = ?,
            fornecedor = ?, garantia = ?, validade = ?, lote = ?, status = ?, tipo_produto = ?, imagem = ?
        WHERE codigo = ?
        """,
        (
            data.get("nome", ""),
            data.get("descricao", ""),
            data.get("qtd_estoque", 0),
            data.get("qtd_minima", 0),
            data.get("preco", 0),
            data.get("custo", 0),
            data.get("fornecedor", ""),
            data.get("garantia", ""),
            data.get("validade", ""),
            data.get("lote", ""),
            data.get("status", "Disponível"),
            data.get("tipo_produto", ""),
            data.get("imagem", ""),
            codigo,
        ),
    )

    conn.commit()
    conn.close()
    return {"ok": True, "message": "Produto atualizado com sucesso."}


def register_stock_movement(codigo, nome, tipo, quantidade, origem, observacao=""):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
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


def list_stock_movements():
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT *
        FROM stock_movements
        ORDER BY datetime(created_at) DESC, id DESC
        """
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]


def calculate_status(qtd_estoque, qtd_minima):
    if qtd_estoque <= 0:
        return "Sem estoque"
    if qtd_estoque < qtd_minima:
        return "Produto em falta"
    if qtd_estoque <= qtd_minima + 3:
        return "Estoque baixo"
    return "Disponível"


def update_product_stock(codigo: str, delta: int, origem="gestor_comercial", observacao=""):
    conn = get_connection()
    cursor = conn.cursor()

    row = cursor.execute(
        "SELECT * FROM products WHERE codigo = ? AND ativo = 1",
        (codigo,),
    ).fetchone()

    if not row:
        conn.close()
        return {"ok": False, "message": "Produto não encontrado."}

    current_stock = row["qtd_estoque"]
    new_stock = current_stock + delta

    if new_stock < 0:
        conn.close()
        return {"ok": False, "message": "Estoque insuficiente."}

    status = calculate_status(new_stock, row["qtd_minima"])

    cursor.execute(
        """
        UPDATE products
        SET qtd_estoque = ?, status = ?
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
        quantidade=abs(delta),
        origem=origem,
        observacao=observacao,
    )

    return {
        "ok": True,
        "codigo": codigo,
        "qtd_estoque": new_stock,
        "status": status,
    }