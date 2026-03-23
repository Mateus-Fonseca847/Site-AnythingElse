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
    return render_template("novidades.html", products=products)


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