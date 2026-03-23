import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, render_template
from flask_cors import CORS

from backend.database.db import init_db, seed_products
from backend.routes.auth import auth_bp
from backend.routes.products import products_bp
from backend.services.product_service import list_products

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = Flask(
    __name__,
    template_folder=str(FRONTEND_DIR / "templates"),
    static_folder=str(FRONTEND_DIR / "static"),
)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["JSON_AS_ASCII"] = False

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5000,http://localhost:5000,http://127.0.0.1:5001,http://localhost:5001",
)

CORS(
    app,
    resources={r"/api/*": {"origins": [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]}},
    supports_credentials=True,
)

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)


@app.get("/")
def home():
    products = list_products()
    return render_template("index.html", products=products)


def bootstrap() -> None:
    init_db()
    seed_products()


bootstrap()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(debug=True, host="0.0.0.0", port=port)