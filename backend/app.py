from flask import Flask, render_template
import os

from dotenv import load_dotenv
load_dotenv()

from backend.database.db import init_db
from backend.routes.auth import auth_bp
from backend.database.db import init_db, seed_products
from backend.routes.products import products_bp
from backend.services.product_service import list_products

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), "../frontend/templates"),
    static_folder=os.path.join(os.path.dirname(__file__), "../frontend/static")
)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)

@app.route("/")
def home():
    products = list_products()
    return render_template("index.html", products=products)

if __name__ == "__main__":
    init_db()
    seed_products()
    app.run(debug=True)