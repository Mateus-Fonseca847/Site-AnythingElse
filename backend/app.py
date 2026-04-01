import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, render_template

from backend.database.db import init_db, seed_products
from backend.routes.auth import auth_bp
from backend.routes.orders import orders_bp
from backend.routes.payments import payments_bp
from backend.routes.products import products_bp
from backend.routes.shipping import shipping_bp
from backend.services.product_service import list_products


BASE_DIR = Path(__file__).resolve().parent.parent

# Carrega o .env da raiz do workspace e um .env local do app, se existir.
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env", override=False)


app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "frontend" / "templates"),
    static_folder=str(BASE_DIR / "frontend" / "static"),
)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

app.register_blueprint(auth_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(products_bp)
app.register_blueprint(shipping_bp)


@app.route("/")
def home():
    products = list_products()
    return render_template("index.html", products=products)


@app.route("/novidades")
def novidades():
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
        return "Produto nao encontrado", 404

    recommended = [
        item
        for item in products
        if item["codigo"] != codigo and item["tipo_produto"] == product["tipo_produto"]
    ]

    recommended = sorted(
        recommended,
        key=lambda item: (
            item.get("vendas", 0),
            item.get("data_lancamento", ""),
        ),
        reverse=True,
    )[:4]

    if len(recommended) < 4:
        extras = [
            item
            for item in products
            if item["codigo"] != codigo
            and item["codigo"] not in {r["codigo"] for r in recommended}
        ]

        extras = sorted(
            extras,
            key=lambda item: (
                item.get("vendas", 0),
                item.get("data_lancamento", ""),
            ),
            reverse=True,
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
    filtered = [
        p
        for p in products
        if p.get("tipo_produto", "").lower() in ["camiseta", "camisetas", "camisa", "camisas"]
    ]
    return render_template("camisetas.html", products=filtered)


@app.route("/livros")
def livros():
    products = list_products()
    filtered = [p for p in products if p.get("tipo_produto", "").lower() in ["livro", "livros"]]
    return render_template("livros.html", products=filtered)


@app.route("/filmes")
def filmes():
    products = list_products()
    filtered = [p for p in products if p.get("tipo_produto", "").lower() in ["filme", "filmes"]]
    return render_template("filmes.html", products=filtered)


@app.route("/acessorios")
def acessorios():
    products = list_products()
    filtered = [p for p in products if p.get("tipo_produto", "").lower() in ["ecobag", "mochila", "garrafa"]]
    return render_template("acessorios.html", products=filtered)


@app.route("/decoracao")
def decoracao():
    products = list_products()
    filtered = [p for p in products if p.get("tipo_produto", "").lower() in ["action figure", "mascara"]]
    return render_template("decoracao.html", products=filtered)


@app.route("/checkout")
def checkout():
    return render_template("checkout.html")


@app.route("/identificacao")
def identificacao():
    return render_template("identificacao.html")


@app.route("/pagamento")
def pagamento():
    return render_template("pagamento.html")


@app.route("/personalizacao")
def personalizacao():
    customizable_products = [
        {
            "slug": "camiseta",
            "name": "Camisa personalizada",
            "category": "Vestuario",
            "description": "Frente central para artes amplas e estampas marcantes.",
            "price": 89.90,
            "image": "img/camisas personalizaçao.webp",
        },
        {
            "slug": "caneca",
            "name": "Caneca personalizada",
            "category": "Acessorio",
            "description": "Faixa lateral ideal para ilustracoes e logos.",
            "price": 54.90,
            "image": "img/caneca.webp",
        },
        {
            "slug": "ecobag",
            "name": "Ecobag personalizada",
            "category": "Acessorio",
            "description": "Area frontal generosa para compor artes verticais.",
            "price": 64.90,
            "image": "img/ecobag.webp",
        },
        {
            "slug": "moletom",
            "name": "Moletom personalizado",
            "category": "Vestuario",
            "description": "Centro do peito com destaque para sua identidade visual.",
            "price": 149.90,
            "image": "img/moletom personalizaçao.webp",
        },
    ]
    return render_template(
        "personalizacao.html",
        customizable_products=customizable_products,
    )


@app.route("/personalizacao/<string:product_slug>")
def personalizacao_produto(product_slug):
    products = {
        "camiseta": {
            "slug": "camiseta",
            "name": "Camisa personalizada",
            "editor_title": "Camisa personalizada",
            "editor_description": "Envie seu PNG, ajuste a escala e arraste a arte para a posicao ideal da estampa.",
        },
        "caneca": {
            "slug": "caneca",
            "name": "Caneca personalizada",
            "editor_title": "Caneca personalizada",
            "editor_description": "Aplique sua arte na faixa lateral da caneca e monte um preview fiel do produto.",
        },
        "ecobag": {
            "slug": "ecobag",
            "name": "Ecobag personalizada",
            "editor_title": "Ecobag personalizada",
            "editor_description": "Posicione a arte livremente na frente da ecobag e teste diferentes composicoes.",
        },
        "moletom": {
            "slug": "moletom",
            "name": "Moletom personalizado",
            "editor_title": "Moletom personalizado",
            "editor_description": "Veja sua arte aplicada no peito do moletom com visualizacao ao vivo.",
        },
    }

    product = products.get(product_slug)
    if not product:
        return "Produto personalizavel nao encontrado", 404

    return render_template("personalizacao_editor.html", product=product)


@app.route("/vendedor/pedidos")
def vendedor_pedidos():
    return render_template("vendedor_pedidos.html")


def bootstrap() -> None:
    init_db()
    seed_products()


if __name__ == "__main__":
    bootstrap()
    port = int(os.getenv("PORT", "5000"))
    print(f"Servidor rodando em: http://127.0.0.1:{port}")
    app.run(debug=True, port=port)
