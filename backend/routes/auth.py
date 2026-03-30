from flask import Blueprint, jsonify, request, session
from backend.services.auth_service import create_user, authenticate_user

auth_bp = Blueprint("auth", __name__)


def validate_email(email: str) -> bool:
    return "@" in email and "." in email


@auth_bp.post("/auth/register")
def register():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not name:
        return jsonify({"ok": False, "message": "Informe seu nome."}), 400

    if not email or not validate_email(email):
        return jsonify({"ok": False, "message": "Digite um e-mail válido."}), 400

    if len(password) < 8:
        return jsonify(
            {"ok": False, "message": "A senha precisa ter pelo menos 8 caracteres."}
        ), 400

    if password != confirm_password:
        return jsonify({"ok": False, "message": "As senhas não coincidem."}), 400

    result = create_user(name, email, password)

    if not result["ok"]:
        return jsonify(result), 409

    session["user"] = result["user"]

    return jsonify(
        {
            "ok": True,
            "message": "Conta criada com sucesso.",
            "user": result["user"],
        }
    )


@auth_bp.post("/auth/login")
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not validate_email(email):
        return jsonify({"ok": False, "message": "Digite um e-mail válido."}), 400

    if not password:
        return jsonify({"ok": False, "message": "Digite sua senha."}), 400

    result = authenticate_user(email, password)

    if not result["ok"]:
        return jsonify(result), 401

    session["user"] = result["user"]

    return jsonify(
        {
            "ok": True,
            "message": "Login realizado com sucesso.",
            "user": result["user"],
        }
    )


@auth_bp.post("/auth/logout")
def logout():
    session.pop("user", None)
    return jsonify({"ok": True, "message": "Logout realizado."})


@auth_bp.get("/auth/me")
def me():
    user = session.get("user")
    if not user:
        return jsonify({"ok": False, "user": None}), 401

    return jsonify({"ok": True, "user": user})



from flask import Blueprint, jsonify, request, session
from backend.services.auth_service import create_user, authenticate_user

auth_bp = Blueprint("auth", __name__)

def validate_email(email: str) -> bool:
    return "@" in email and "." in email


@auth_bp.post("/auth/register")
def register():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not name:
        return jsonify({"ok": False, "message": "Informe seu nome."}), 400

    if not email or not validate_email(email):
        return jsonify({"ok": False, "message": "Digite um e-mail válido."}), 400

    if len(password) < 8:
        return jsonify({"ok": False, "message": "A senha precisa ter pelo menos 8 caracteres."}), 400

    if password != confirm_password:
        return jsonify({"ok": False, "message": "As senhas não coincidem."}), 400

    result = create_user(name, email, password)

    if not result["ok"]:
        return jsonify(result), 409

    session["user"] = result["user"]

    return jsonify({
        "ok": True,
        "message": "Conta criada com sucesso.",
        "user": result["user"],
    })


@auth_bp.post("/auth/login")
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not validate_email(email):
        return jsonify({"ok": False, "message": "Digite um e-mail válido."}), 400

    if not password:
        return jsonify({"ok": False, "message": "Digite sua senha."}), 400

    result = authenticate_user(email, password)

    if not result["ok"]:
        return jsonify(result), 401

    session["user"] = result["user"]

    return jsonify({
        "ok": True,
        "message": "Login realizado com sucesso.",
        "user": result["user"],
    })


@auth_bp.post("/auth/logout")
def logout():
    session.pop("user", None)
    return jsonify({"ok": True, "message": "Logout realizado com sucesso."})


@auth_bp.get("/auth/me")
def me():
    user = session.get("user")

    if not user:
        return jsonify({"ok": False, "user": None}), 401

    return jsonify({"ok": True, "user": user})