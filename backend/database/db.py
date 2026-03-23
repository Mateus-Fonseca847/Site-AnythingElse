import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "app.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL UNIQUE,
            nome TEXT NOT NULL,
            descricao TEXT DEFAULT '',
            qtd_estoque INTEGER NOT NULL DEFAULT 0,
            qtd_minima INTEGER NOT NULL DEFAULT 0,
            preco REAL NOT NULL DEFAULT 0,
            custo REAL NOT NULL DEFAULT 0,
            fornecedor TEXT DEFAULT '',
            garantia TEXT DEFAULT '',
            validade TEXT DEFAULT '',
            lote TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'Disponível',
            tipo_produto TEXT DEFAULT '',
            imagem TEXT DEFAULT '',
            ativo INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS stock_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_produto TEXT NOT NULL,
            nome_produto TEXT NOT NULL,
            tipo TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            origem TEXT NOT NULL,
            observacao TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()


def seed_products() -> None:
    conn = get_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT COUNT(*) AS total FROM products").fetchone()
    if existing["total"] > 0:
        conn.close()
        return

    products = [
        {
            "codigo": "ITA-2324-001",
            "nome": "Camisa Itália Edição Especial 23/24",
            "descricao": "Camisa Itália Edição Especial 23/24 - Adidas Jogador Masculina",
            "qtd_estoque": 18,
            "qtd_minima": 5,
            "preco": 349.90,
            "custo": 189.90,
            "fornecedor": "Adidas Distribuição",
            "garantia": "90 dias",
            "validade": "Não se aplica",
            "lote": "L-ITA-2026-01",
            "status": "Disponível",
            "tipo_produto": "Camisa esportiva",
            "imagem": "img/produto-1-a.png",
        },
        {
            "codigo": "BAR-2425-002",
            "nome": "Camisa Barcelona 24/25",
            "descricao": "Camisa Barcelona 24/25 Nike Versão Jogador - Preto",
            "qtd_estoque": 9,
            "qtd_minima": 4,
            "preco": 329.90,
            "custo": 174.90,
            "fornecedor": "Nike Supply",
            "garantia": "90 dias",
            "validade": "Não se aplica",
            "lote": "L-BAR-2026-01",
            "status": "Estoque baixo",
            "tipo_produto": "Camisa esportiva",
            "imagem": "img/produto-2-a.png",
        },
        {
            "codigo": "RMA-2324-003",
            "nome": "Camisa Real Madrid Home 23/24",
            "descricao": "Camisa Real Madrid Home 23/24 Torcedor Adidas",
            "qtd_estoque": 21,
            "qtd_minima": 6,
            "preco": 339.90,
            "custo": 182.90,
            "fornecedor": "Adidas Distribuição",
            "garantia": "90 dias",
            "validade": "Não se aplica",
            "lote": "L-RMA-2026-01",
            "status": "Disponível",
            "tipo_produto": "Camisa esportiva",
            "imagem": "img/produto-3-a.png",
        },
        {
            "codigo": "SUR-2026-004",
            "nome": "Camiseta Surfista Prateado",
            "descricao": "Camiseta Surfista Prateado edição especial",
            "qtd_estoque": 14,
            "qtd_minima": 4,
            "preco": 89.90,
            "custo": 42.00,
            "fornecedor": "Fornecedor Geek",
            "garantia": "90 dias",
            "validade": "Não se aplica",
            "lote": "L-SUR-2026-01",
            "status": "Disponível",
            "tipo_produto": "Camiseta",
            "imagem": "img/produto-1-a.png",
        },
        {
            "codigo": "BAT-2026-005",
            "nome": "Camiseta Batman Vintage",
            "descricao": "Camiseta Batman com estampa vintage",
            "qtd_estoque": 11,
            "qtd_minima": 3,
            "preco": 99.90,
            "custo": 47.00,
            "fornecedor": "Fornecedor Geek",
            "garantia": "90 dias",
            "validade": "Não se aplica",
            "lote": "L-BAT-2026-01",
            "status": "Disponível",
            "tipo_produto": "Camiseta",
            "imagem": "img/produto-2-a.png",
        },
    ]

    cursor.executemany(
        """
        INSERT INTO products (
            codigo, nome, descricao, qtd_estoque, qtd_minima, preco, custo,
            fornecedor, garantia, validade, lote, status, tipo_produto, imagem, ativo
        )
        VALUES (
            :codigo, :nome, :descricao, :qtd_estoque, :qtd_minima, :preco, :custo,
            :fornecedor, :garantia, :validade, :lote, :status, :tipo_produto, :imagem, 1
        )
        """,
        products,
    )

    conn.commit()
    conn.close()