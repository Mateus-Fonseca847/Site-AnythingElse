import sqlite3
from pathlib import Path
from datetime import date, timedelta


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "app.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_column(cursor, table_name: str, column_name: str, definition: str) -> None:
    columns = cursor.execute(f"PRAGMA table_info({table_name})").fetchall()
    existing_columns = {column["name"] for column in columns}
    if column_name not in existing_columns:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")


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
            descricao_detalhada TEXT DEFAULT '',
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
            imagem_hover TEXT DEFAULT '',
            cor TEXT DEFAULT '',
            tamanhos TEXT DEFAULT '',
            data_lancamento TEXT DEFAULT '',
            vendas INTEGER NOT NULL DEFAULT 0,
            desconto REAL DEFAULT NULL,
            ativo INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Migração para bancos já existentes
    ensure_column(cursor, "products", "cor", "TEXT DEFAULT ''")
    ensure_column(cursor, "products", "tamanhos", "TEXT DEFAULT ''")
    ensure_column(cursor, "products", "data_lancamento", "TEXT DEFAULT ''")
    ensure_column(cursor, "products", "vendas", "INTEGER NOT NULL DEFAULT 0")
    ensure_column(cursor, "products", "desconto", "REAL DEFAULT NULL")
    ensure_column(cursor, "products", "descricao_detalhada", "TEXT DEFAULT ''")
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

    today = date.today()

    all_sizes = "2P,P,M,G,2G,3G,4G"

    products = [
    {
        "codigo": "ECO-001",
        "nome": "Ecobag Frankenstein",
        "descricao": "Ecobag temática Frankenstein",
        "descricao_detalhada": """
Ecobag temática inspirada no clássico Frankenstein, ideal para uso no dia a dia com uma proposta visual marcante e criativa.
É uma peça prática para carregar itens pessoais, livros, compras leves e acessórios, sem abrir mão de estilo.

INFORMAÇÕES DO PRODUTO:
- Categoria: ecobag
- Material: tecido resistente para uso cotidiano
- Estilo: temática clássica de horror
- Cor predominante: branco
- Indicação: uso casual, estudos, passeios e rotina
""".strip(),
        "qtd_estoque": 20,
        "qtd_minima": 5,
        "preco": 59.90,
        "custo": 25.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-ECO-2026-01",
        "status": "Disponível",
        "tipo_produto": "Ecobag",
        "imagem": "img/ecobag-frankenstein-a.png",
        "imagem_hover": "img/ecobag-frankenstein-b.png",
        "cor": "branco",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=3)),
        "vendas": 18,
        "desconto": None,
    },
    {
        "codigo": "NEC-002",
        "nome": "Necessaire Monstros",
        "descricao": "Necessaire temática monstros clássicos",
        "descricao_detalhada": """
Necessaire compacta com arte inspirada em monstros clássicos do cinema, perfeita para organizar objetos pequenos com personalidade.
É ideal para guardar itens de higiene, maquiagem, cabos, acessórios ou materiais de uso diário.

INFORMAÇÕES DO PRODUTO:
- Categoria: acessório
- Uso: organização pessoal
- Estilo: monstros clássicos
- Cor predominante: branco
- Indicação: rotina, viagem e presente criativo
""".strip(),
        "qtd_estoque": 15,
        "qtd_minima": 4,
        "preco": 29.90,
        "custo": 12.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-NEC-2026-01",
        "status": "Disponível",
        "tipo_produto": "Acessório",
        "imagem": "img/necessaire-a.png",
        "imagem_hover": "img/necessaire-b.png",
        "cor": "branco",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=12)),
        "vendas": 9,
        "desconto": None,
    },
    {
        "codigo": "CAM-003",
        "nome": "Camisa O agente secreto off white",
        "descricao": "Camiseta temática O Agente Secreto",
        "descricao_detalhada": """
Camiseta temática inspirada em O Agente Secreto, com visual expressivo e proposta casual para quem gosta de peças marcantes.
A modelagem foi pensada para uso confortável no dia a dia, combinando com looks urbanos e coleções voltadas à cultura pop.

INFORMAÇÕES DO PRODUTO:
- Categoria: camiseta
- Modelagem: unissex
- Tecido: malha confortável
- Estampa: impressão digital de alta definição
- Cor predominante: branco
- Tamanhos disponíveis: 2P, P, M, G, 2G, 3G e 4G
""".strip(),
        "qtd_estoque": 18,
        "qtd_minima": 5,
        "preco": 85.41,
        "custo": 40.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-CAM-2026-01",
        "status": "Disponível",
        "tipo_produto": "Camiseta",
        "imagem": "img/agente-a.png",
        "imagem_hover": "img/agente-b.png",
        "cor": "branco",
        "tamanhos": all_sizes,
        "data_lancamento": str(today - timedelta(days=2)),
        "vendas": 22,
        "desconto": None,
    },
    {
        "codigo": "CAM-004",
        "nome": "Camisa Evil Dead olhos",
        "descricao": "Camiseta temática Evil Dead",
        "descricao_detalhada": """
Camiseta inspirada no universo de Evil Dead, criada para destacar a identidade visual do filme com uma estampa impactante.
É uma peça versátil para quem busca conforto, estilo geek e presença visual em uma camiseta de uso diário.

INFORMAÇÕES DO PRODUTO:
- Categoria: camiseta
- Modelagem: unissex
- Tecido: toque macio e confortável
- Estampa: temática de horror cult
- Cor predominante: branco
- Tamanhos disponíveis: 2P, P, M, G, 2G, 3G e 4G
""".strip(),
        "qtd_estoque": 18,
        "qtd_minima": 5,
        "preco": 85.41,
        "custo": 40.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-CAM-2026-02",
        "status": "Disponível",
        "tipo_produto": "Camiseta",
        "imagem": "img/evil-a.png",
        "imagem_hover": "img/evil-b.png",
        "cor": "branco",
        "tamanhos": all_sizes,
        "data_lancamento": str(today - timedelta(days=5)),
        "vendas": 17,
        "desconto": None,
    },
    {
        "codigo": "CAM-005",
        "nome": "Camisa Halloween",
        "descricao": "Camiseta temática Halloween",
        "descricao_detalhada": """
Camiseta temática inspirada em Halloween, com proposta visual sombria e forte identidade para fãs do gênero.
A peça foi pensada para entregar conforto, bom caimento e presença em looks casuais com temática de horror.

INFORMAÇÕES DO PRODUTO:
- Categoria: camiseta
- Modelagem: unissex
- Estampa: inspirada em clássico do horror
- Cor predominante: preto
- Uso indicado: dia a dia, eventos temáticos e coleção
- Tamanhos disponíveis: 2P, P, M, G, 2G, 3G e 4G
""".strip(),
        "qtd_estoque": 18,
        "qtd_minima": 5,
        "preco": 85.41,
        "custo": 40.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-CAM-2026-03",
        "status": "Disponível",
        "tipo_produto": "Camiseta",
        "imagem": "img/halloween-a.png",
        "imagem_hover": "img/halloween-b.png",
        "cor": "preto",
        "tamanhos": all_sizes,
        "data_lancamento": str(today - timedelta(days=8)),
        "vendas": 31,
        "desconto": None,
    },
    {
        "codigo": "CAM-006",
        "nome": "Camisa Jaws - Tubarão",
        "descricao": "Camiseta filme Tubarão",
        "descricao_detalhada": """
Camiseta inspirada no filme Tubarão, com arte de destaque para quem gosta de peças ligadas ao cinema clássico.
Combina estilo casual com referência pop forte, sendo uma ótima opção para compor catálogo geek e coleções temáticas.

INFORMAÇÕES DO PRODUTO:
- Categoria: camiseta
- Modelagem: unissex
- Estampa: inspirada em filme clássico
- Cor predominante: azul
- Tecido: malha leve para uso diário
- Tamanhos disponíveis: 2P, P, M, G, 2G, 3G e 4G
""".strip(),
        "qtd_estoque": 18,
        "qtd_minima": 5,
        "preco": 85.41,
        "custo": 40.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-CAM-2026-04",
        "status": "Disponível",
        "tipo_produto": "Camiseta",
        "imagem": "img/jaws-a.png",
        "imagem_hover": "img/jaws-b.png",
        "cor": "azul",
        "tamanhos": all_sizes,
        "data_lancamento": str(today - timedelta(days=10)),
        "vendas": 26,
        "desconto": None,
    },
    {
        "codigo": "CAM-007",
        "nome": "Camisa Monstros",
        "descricao": "Camiseta temática monstros",
        "descricao_detalhada": """
Camiseta com arte inspirada em monstros clássicos, criada para reunir estilo retrô, cultura pop e conforto em uma só peça.
É ideal para quem curte estampas mais densas visualmente e quer uma camiseta com identidade forte.

INFORMAÇÕES DO PRODUTO:
- Categoria: camiseta
- Modelagem: unissex
- Tecido: confortável para uso prolongado
- Estampa: monstros clássicos do cinema
- Cor predominante: preto
- Tamanhos disponíveis: 2P, P, M, G, 2G, 3G e 4G
""".strip(),
        "qtd_estoque": 18,
        "qtd_minima": 5,
        "preco": 85.41,
        "custo": 40.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-CAM-2026-05",
        "status": "Disponível",
        "tipo_produto": "Camiseta",
        "imagem": "img/monstros-a.png",
        "imagem_hover": "img/monstros-b.png",
        "cor": "preto",
        "tamanhos": all_sizes,
        "data_lancamento": str(today - timedelta(days=6)),
        "vendas": 14,
        "desconto": None,
    },
    {
        "codigo": "MOC-009",
        "nome": "Mochila com fecho Superman",
        "descricao": "Mochila personalizada com fecho",
        "descricao_detalhada": """
Mochila com fechamento seguro e arte temática inspirada no universo do Superman, ideal para uso diário com personalidade.
Oferece praticidade para carregar objetos pessoais, materiais e itens de rotina em uma peça funcional e estilosa.

INFORMAÇÕES DO PRODUTO:
- Categoria: mochila
- Estilo: temática de super-herói
- Fechamento: com fecho
- Cor predominante: preto
- Indicação: escola, trabalho, passeio e uso casual
""".strip(),
        "qtd_estoque": 10,
        "qtd_minima": 3,
        "preco": 59.90,
        "custo": 25.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-MOC-2026-01",
        "status": "Disponível",
        "tipo_produto": "Mochila",
        "imagem": "img/mochila-fecho-a.png",
        "imagem_hover": "img/mochila-fecho-b.png",
        "cor": "preto",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=14)),
        "vendas": 12,
        "desconto": None,
    },
    {
        "codigo": "MOC-010",
        "nome": "Mochila saco Superman",
        "descricao": "Mochila saco personalizada",
        "descricao_detalhada": """
Mochila saco com arte temática inspirada no Superman, leve e prática para quem busca funcionalidade com visual diferenciado.
É uma ótima opção para transportar itens do cotidiano com conforto e estilo em uma peça versátil.

INFORMAÇÕES DO PRODUTO:
- Categoria: mochila
- Modelo: saco
- Estilo: temática de super-herói
- Cor predominante: preto
- Indicação: academia, rotina, passeios e uso casual
""".strip(),
        "qtd_estoque": 10,
        "qtd_minima": 3,
        "preco": 49.90,
        "custo": 20.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-MOC-2026-02",
        "status": "Disponível",
        "tipo_produto": "Mochila",
        "imagem": "img/mochila-saco-a.png",
        "imagem_hover": "img/mochila-saco-b.png",
        "cor": "preto",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=7)),
        "vendas": 16,
        "desconto": None,
    },
    {
        "codigo": "ECO-011",
        "nome": "Ecobag Quarteto Fantástico",
        "descricao": "Ecobag personalizada",
        "descricao_detalhada": """
Ecobag com arte inspirada no universo do Quarteto Fantástico, pensada para unir praticidade e identidade visual em um único produto.
É ideal para quem gosta de acessórios funcionais e personalizados para a rotina.

INFORMAÇÕES DO PRODUTO:
- Categoria: ecobag
- Estilo: temática de super-herói
- Cor predominante: branco
- Indicação: compras leves, estudos, rotina e passeio
- Diferencial: visual personalizado com referência pop
""".strip(),
        "qtd_estoque": 14,
        "qtd_minima": 4,
        "preco": 59.90,
        "custo": 25.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-ECO-2026-02",
        "status": "Disponível",
        "tipo_produto": "Ecobag",
        "imagem": "img/ecobag-personalizada-a.png",
        "imagem_hover": "img/ecobag-personalizada-b.png",
        "cor": "branco",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=4)),
        "vendas": 11,
        "desconto": None,
    },
    {
        "codigo": "ACT-012",
        "nome": "Action figure do Rambo",
        "descricao": "Boneco colecionável Rambo",
        "descricao_detalhada": """
Action figure inspirada em Rambo, desenvolvida para colecionadores e fãs de cinema de ação que valorizam peças com forte apelo visual.
É ideal para exposição em estantes, vitrines e espaços temáticos.

INFORMAÇÕES DO PRODUTO:
- Categoria: action figure
- Estilo: colecionável temático
- Referência: cinema de ação
- Indicação: decoração e coleção
- Público: fãs de filmes clássicos e colecionadores
""".strip(),
        "qtd_estoque": 6,
        "qtd_minima": 2,
        "preco": 265.91,
        "custo": 120.00,
        "fornecedor": "Colecionáveis",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-ACT-2026-01",
        "status": "Disponível",
        "tipo_produto": "Action Figure",
        "imagem": "img/rambo-a.png",
        "imagem_hover": "img/rambo-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=20)),
        "vendas": 4,
        "desconto": None,
    },
    {
        "codigo": "ACT-013",
        "nome": "Action figure - O profissional filme.",
        "descricao": "Boneco do filme O Profissional",
        "descricao_detalhada": """
Item colecionável inspirado no filme O Profissional, pensado para fãs de cinema e coleções com estética marcante.
É uma peça decorativa que agrega valor visual a ambientes, estantes e composições temáticas.

INFORMAÇÕES DO PRODUTO:
- Categoria: action figure
- Estilo: colecionável cinematográfico
- Referência: filme cult
- Indicação: decoração, coleção e presente temático
- Público: fãs de cinema e cultura pop
""".strip(),
        "qtd_estoque": 6,
        "qtd_minima": 2,
        "preco": 190.00,
        "custo": 90.00,
        "fornecedor": "Colecionáveis",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-ACT-2026-02",
        "status": "Disponível",
        "tipo_produto": "Action Figure",
        "imagem": "img/leon-a.png",
        "imagem_hover": "img/leon-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=18)),
        "vendas": 6,
        "desconto": None,
    },
    {
        "codigo": "GAR-014",
        "nome": "Garrafa de alumínio do Toy Story edição de 30 anos",
        "descricao": "Garrafa de alumínio Toy Story",
        "descricao_detalhada": """
Garrafa de alumínio temática do Toy Story em edição especial, ideal para quem deseja um item útil com forte identidade visual.
É indicada para uso diário e também como peça diferenciada dentro do catálogo de acessórios.

INFORMAÇÕES DO PRODUTO:
- Categoria: garrafa
- Material: alumínio
- Estilo: temática licenciada inspirada em Toy Story
- Cor predominante: azul
- Indicação: rotina, estudos, trabalho e presente
""".strip(),
        "qtd_estoque": 12,
        "qtd_minima": 4,
        "preco": 49.90,
        "custo": 20.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-GAR-2026-01",
        "status": "Disponível",
        "tipo_produto": "Garrafa",
        "imagem": "img/toy-a.png",
        "imagem_hover": "img/toy-b.png",
        "cor": "azul",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=9)),
        "vendas": 28,
        "desconto": None,
    },
    {
        "codigo": "MAS-015",
        "nome": "Máscara Darth Vader",
        "descricao": "Máscara colecionável Darth Vader",
        "descricao_detalhada": """
Máscara inspirada em Darth Vader, criada para fãs do universo sci-fi e colecionáveis com presença visual marcante.
É uma peça ideal para decoração, coleção e composição de ambientes temáticos.

INFORMAÇÕES DO PRODUTO:
- Categoria: máscara
- Estilo: item colecionável temático
- Referência: universo de ficção científica
- Indicação: decoração, coleção e presente geek
- Destaque: visual icônico e forte apelo visual
""".strip(),
        "qtd_estoque": 5,
        "qtd_minima": 2,
        "preco": 227.91,
        "custo": 110.00,
        "fornecedor": "Colecionáveis",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-MAS-2026-01",
        "status": "Disponível",
        "tipo_produto": "Máscara",
        "imagem": "img/darth-a.png",
        "imagem_hover": "img/darth-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=16)),
        "vendas": 7,
        "desconto": None,
    },
    {
        "codigo": "BOX-016",
        "nome": "Box Cinema Policia Hong Kong DVD",
        "descricao": "Box de filmes Cinema Polícia Hong Kong",
        "descricao_detalhada": """
Box em DVD com curadoria inspirada no cinema policial de Hong Kong, ideal para apreciadores de ação, colecionismo e cinema asiático.
É uma peça interessante tanto para consumo quanto para exposição em coleções audiovisuais.

INFORMAÇÕES DO PRODUTO:
- Categoria: box DVD
- Conteúdo: edição temática
- Estilo: cinema policial e ação
- Indicação: coleção, presente e acervo pessoal
- Público: fãs de cinema internacional
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 94.05,
        "custo": 40.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-BOX-2026-01",
        "status": "Disponível",
        "tipo_produto": "filme",
        "imagem": "img/hongkong-a.png",
        "imagem_hover": "img/hongkong-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=22)),
        "vendas": 5,
        "desconto": None,
    },
    {
        "codigo": "BOX-017",
        "nome": "Box - Cinema Yakuza 5 DVD",
        "descricao": "Box Cinema Yakuza 5 em DVD",
        "descricao_detalhada": """
Box em DVD inspirado no universo Yakuza, com proposta visual intensa e appeal para fãs de ação e cinema oriental.
É um produto voltado para quem valoriza acervo temático e itens com identidade forte.

INFORMAÇÕES DO PRODUTO:
- Categoria: box DVD
- Estilo: ação e cinema oriental
- Formato: mídia física
- Indicação: coleção, presente e acervo pessoal
- Público: fãs de filmes temáticos e cultura pop
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 94.05,
        "custo": 40.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-BOX-2026-02",
        "status": "Disponível",
        "tipo_produto": "filme",
        "imagem": "img/yakuza-a.png",
        "imagem_hover": "img/yakuza-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=21)),
        "vendas": 8,
        "desconto": None,
    },
    {
        "codigo": "BOX-018",
        "nome": "Box - Os irmãos Marx filme",
        "descricao": "Box do filme Os Irmãos Marx",
        "descricao_detalhada": """
Box temático de Os Irmãos Marx, desenvolvido para amantes de cinema clássico e colecionadores de mídia física.
É um produto com apelo nostálgico, ideal para ampliar acervos e presentear fãs de produções consagradas.

INFORMAÇÕES DO PRODUTO:
- Categoria: box DVD
- Referência: cinema clássico
- Formato: mídia física
- Indicação: coleção, acervo e presente temático
- Público: fãs de filmes clássicos e humor clássico
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 94.05,
        "custo": 40.00,
        "fornecedor": "Loja Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-BOX-2026-03",
        "status": "Disponível",
        "tipo_produto": "filme",
        "imagem": "img/marx-a.png",
        "imagem_hover": "img/marx-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=19)),
        "vendas": 10,
        "desconto": None,
    },
    {
        "codigo": "LIV-019",
        "nome": "Livro - BTK",
        "descricao": "Livro sobre o caso BTK",
        "descricao_detalhada": """
Livro com temática investigativa inspirado no caso BTK, indicado para leitores que se interessam por suspense, crime real e narrativas densas.
É uma obra que também funciona muito bem como item de coleção dentro de um catálogo temático.

INFORMAÇÕES DO PRODUTO:
- Categoria: livro
- Gênero: investigação e suspense
- Formato: capa ilustrada
- Indicação: leitura, coleção e presente
- Público: leitores de true crime e mistério
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 64.99,
        "custo": 25.00,
        "fornecedor": "Editora",
        "garantia": "Sem garantia",
        "validade": "Não se aplica",
        "lote": "L-LIV-2026-01",
        "status": "Disponível",
        "tipo_produto": "Livro",
        "imagem": "img/btk-a.png",
        "imagem_hover": "img/btk-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=15)),
        "vendas": 13,
        "desconto": None,
    },
    {
        "codigo": "LIV-020",
        "nome": "Livro O segredo dos corpos",
        "descricao": "Livro investigativo",
        "descricao_detalhada": """
Livro investigativo com atmosfera densa e proposta narrativa voltada para mistério, suspense e curiosidade.
É indicado para leitores que buscam experiências intensas e também para compor um catálogo com identidade forte.

INFORMAÇÕES DO PRODUTO:
- Categoria: livro
- Gênero: investigação e suspense
- Formato: capa ilustrada
- Indicação: leitura, coleção e presente
- Público: leitores de mistério e crime
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 49.99,
        "custo": 20.00,
        "fornecedor": "Editora",
        "garantia": "Sem garantia",
        "validade": "Não se aplica",
        "lote": "L-LIV-2026-02",
        "status": "Disponível",
        "tipo_produto": "Livro",
        "imagem": "img/corpos-a.png",
        "imagem_hover": "img/corpos-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=13)),
        "vendas": 15,
        "desconto": None,
    },
    {
        "codigo": "LIV-021",
        "nome": "Livro Menina Má",
        "descricao": "Livro suspense",
        "descricao_detalhada": """
Livro de suspense com proposta visual marcante, indicado para leitores que gostam de histórias sombrias e envolventes.
É uma opção forte para ampliar a seção de livros temáticos com uma peça de boa presença estética.

INFORMAÇÕES DO PRODUTO:
- Categoria: livro
- Gênero: suspense
- Formato: capa ilustrada
- Indicação: leitura, coleção e presente
- Público: leitores de thriller e mistério
""".strip(),
        "qtd_estoque": 8,
        "qtd_minima": 3,
        "preco": 44.99,
        "custo": 18.00,
        "fornecedor": "Editora",
        "garantia": "Sem garantia",
        "validade": "Não se aplica",
        "lote": "L-LIV-2026-03",
        "status": "Disponível",
        "tipo_produto": "Livro",
        "imagem": "img/menina-a.png",
        "imagem_hover": "img/menina-b.png",
        "cor": "",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=11)),
        "vendas": 19,
        "desconto": None,
    },
    {
        "codigo": "GAR-022",
        "nome": "Garrafa de alumínio do Quarteto Fantástico",
        "descricao": "Garrafa temática Quarteto Fantástico",
        "descricao_detalhada": """
Garrafa de alumínio com arte inspirada no Quarteto Fantástico, ideal para unir utilidade e identidade visual em um único produto.
É indicada para quem busca acessórios temáticos para o dia a dia, com proposta prática e criativa.

INFORMAÇÕES DO PRODUTO:
- Categoria: garrafa
- Material: alumínio
- Estilo: temática de super-herói
- Cor predominante: azul
- Indicação: rotina, trabalho, estudos e presente
""".strip(),
        "qtd_estoque": 12,
        "qtd_minima": 4,
        "preco": 79.90,
        "custo": 30.00,
        "fornecedor": "Fornecedor Geek",
        "garantia": "90 dias",
        "validade": "Não se aplica",
        "lote": "L-GAR-2026-02",
        "status": "Disponível",
        "tipo_produto": "Garrafa",
        "imagem": "img/quarteto-a.png",
        "imagem_hover": "img/quarteto-b.png",
        "cor": "azul",
        "tamanhos": "",
        "data_lancamento": str(today - timedelta(days=17)),
        "vendas": 21,
        "desconto": None,
    },
]

    cursor.executemany(
        """
        INSERT INTO products (
            codigo, nome, descricao, descricao_detalhada, qtd_estoque, qtd_minima, preco, custo,
            fornecedor, garantia, validade, lote, status, tipo_produto,
            imagem, imagem_hover, cor, tamanhos, data_lancamento, vendas, desconto, ativo
        )
        VALUES (
            :codigo, :nome, :descricao, :descricao_detalhada, :qtd_estoque, :qtd_minima, :preco, :custo,
            :fornecedor, :garantia, :validade, :lote, :status, :tipo_produto,
            :imagem, :imagem_hover, :cor, :tamanhos, :data_lancamento, :vendas, :desconto, 1
        )
        ON CONFLICT(codigo) DO UPDATE SET
            nome = excluded.nome,
            descricao = excluded.descricao,
            descricao_detalhada = excluded.descricao_detalhada,
            qtd_estoque = excluded.qtd_estoque,
            qtd_minima = excluded.qtd_minima,
            preco = excluded.preco,
            custo = excluded.custo,
            fornecedor = excluded.fornecedor,
            garantia = excluded.garantia,
            validade = excluded.validade,
            lote = excluded.lote,
            status = excluded.status,
            tipo_produto = excluded.tipo_produto,
            imagem = excluded.imagem,
            imagem_hover = excluded.imagem_hover,
            cor = excluded.cor,
            tamanhos = excluded.tamanhos,
            data_lancamento = excluded.data_lancamento,
            vendas = excluded.vendas,
            desconto = excluded.desconto,
            ativo = 1,
            updated_at = CURRENT_TIMESTAMP
        """,
        products,
    )

    conn.commit()
    conn.close()