from werkzeug.security import generate_password_hash, check_password_hash
from backend.database.db import get_connection


def create_user(name: str, email: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()

    existing = cursor.execute(
        "SELECT id FROM users WHERE email = ?",
        (email.lower().strip(),),
    ).fetchone()

    if existing:
        conn.close()
        return {"ok": False, "message": "Este e-mail já está cadastrado."}

    password_hash = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
        """,
        (name.strip(), email.lower().strip(), password_hash),
    )

    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return {
        "ok": True,
        "user": {
            "id": user_id,
            "name": name.strip(),
            "email": email.lower().strip(),
        },
    }


def authenticate_user(email: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()

    user = cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email.lower().strip(),),
    ).fetchone()

    conn.close()

    if not user:
      return {"ok": False, "message": "E-mail ou senha inválidos."}

    if not check_password_hash(user["password_hash"], password):
        return {"ok": False, "message": "E-mail ou senha inválidos."}

    return {
        "ok": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }