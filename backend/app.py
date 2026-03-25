from flask import Flask, render_template
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente (.env)
load_dotenv()

# Importações do seu projeto
from backend.database.db import init_db, seed_products
from backend.routes.auth import auth_bp
from backend.routes.products import products_bp
from backend.services.product_service import list_products


# Configuração do Flask apontando para frontend
app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), "../frontend/templates"),
    static_folder=os.path.join(os.path.dirname(__file__), "../frontend/static")
)

# Configuração de segurança
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")


# Registro das rotas (blueprints)
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)


# =========================
# ROTAS PRINCIPAIS
# =========================

@app.route("/")
def home():
    """
    Página inicial - exibe alguns produtos (ex: destaques)
    """
    products = list_products()
    return render_template("index.html", products=products)


@app.route("/novidades")
def novidades():
    """
    Página de novidades - exibe TODOS os produtos em grid
    """
    products = list_products()

    product_types = sorted(
        {product["tipo_produto"] for product in products if product["tipo_produto"]}
    )

    return render_template(
        "novidades.html",
        products=products,
        product_types=product_types,
    )

@app.route("/produto/<string:codigo>")
def product_page(codigo):
    products = list_products()

    product = next((item for item in products if item["codigo"] == codigo), None)

    if not product:
        return "Produto não encontrado", 404

    recommended = [
        item for item in products
        if item["codigo"] != codigo and item["tipo_produto"] == product["tipo_produto"]
    ]

    recommended = sorted(
        recommended,
        key=lambda item: (
            item.get("vendas", 0),
            item.get("data_lancamento", "")
        ),
        reverse=True
    )[:4]

    if len(recommended) < 4:
        extras = [
            item for item in products
            if item["codigo"] != codigo
            and item["codigo"] not in {r["codigo"] for r in recommended}
        ]

        extras = sorted(
            extras,
            key=lambda item: (
                item.get("vendas", 0),
                item.get("data_lancamento", "")
            ),
            reverse=True
        )

        recommended.extend(extras[: 4 - len(recommended)])

    return render_template(
        "produto.html",
        product=product,
        recommended=recommended,
    )
@app.route("/camisetas")
def camisetas():
    products = list_products()

    camisetas = [
        p for p in products
        if p.get("tipo_produto", "").lower() in ["camiseta", "camisetas", "camisa", "camisas"]
    ]

    return render_template("camisetas.html", products=camisetas)


@app.route("/livros")
def livros():
    """
    Página de livros
    """
    products = list_products()

    livros = [
        p for p in products
        if p.get("tipo_produto", "").lower() in ["livro", "livros"]
    ]

    return render_template("livros.html", products=livros)



# =========================
# INICIALIZAÇÃO DO SISTEMA
# =========================

if __name__ == "__main__":
    try:
        print("🚀 Iniciando aplicação...")

        # Inicializa banco de dados
        init_db()
        print("✅ Banco de dados inicializado")

        # Popula com dados iniciais (seed)
        seed_products()
        print("✅ Produtos iniciais carregados")

        print("🌐 Servidor rodando em: http://127.0.0.1:5000")
        app.run(debug=True)

    except Exception as e:
        print("❌ Erro ao iniciar a aplicação:")
        print(e)