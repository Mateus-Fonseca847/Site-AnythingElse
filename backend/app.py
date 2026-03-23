from flask import Flask, render_template
import os

from dotenv import load_dotenv
load_dotenv()

from backend.database.db import init_db
from backend.routes.auth import auth_bp

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), "../frontend/templates"),
    static_folder=os.path.join(os.path.dirname(__file__), "../frontend/static")
)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    init_db()
    app.run(debug=True)