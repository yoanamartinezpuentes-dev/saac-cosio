from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sqlite3
import os

app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DATABASE
# =========================

DB_NAME = "saac_cosio.db"

COMMUNITIES = [
    "Punta",
    "El Refugio de Providencia",
    "El Salero",
    "Santa María de la Paz",
    "Soledad de Abajo",
    "Guadalupito",
    "Zacatequillas",
    "El Durazno"
]

def init_db():

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # TABLA USUARIOS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE
    )
    """)

    # TABLA REPORTES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        description TEXT,
        zone TEXT,
        lat REAL,
        lng REAL,
        status TEXT,
        priority TEXT,
        image_path TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# =========================
# PRIORIDAD AUTOMÁTICA
# =========================

PRIORITY_MAP = {
    "Punta": "Alta",
    "El Refugio de Providencia": "Media",
    "El Salero": "Baja",
    "Santa María de la Paz": "Alta",
    "Soledad de Abajo": "Media",
    "Guadalupito": "Baja",
    "Zacatequillas": "Alta",
    "El Durazno": "Media"
}

def get_priority(zone):
    return PRIORITY_MAP.get(zone, "Media")

# =========================
# REGISTRO DE USUARIOS
# =========================

@app.post("/register")
async def register_user(
    name: str = Form(...),
    email: str = Form(...)
):

    try:

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (name, email)
        )

        conn.commit()

        user_id = cursor.lastrowid

        conn.close()

        return {
            "status": "success",
            "user_id": user_id
        }

    except sqlite3.IntegrityError:

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )

        user = cursor.fetchone()

        conn.close()

        return {
            "status": "existing_user",
            "user_id": user[0]
        }

# =========================
# CREAR REPORTE
# =========================

@app.post("/report")
async def create_report(

    user_id: int = Form(...),
    description: str = Form(...),
    zone: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    image: UploadFile = File(None)

):

    if zone not in COMMUNITIES:
        raise HTTPException(
            status_code=400,
            detail="Zona inválida"
        )

    priority = get_priority(zone)

    image_path = None

    # GUARDAR IMAGEN
    if image:

        os.makedirs("uploads", exist_ok=True)

        image_path = f"uploads/{image.filename}"

        with open(image_path, "wb") as buffer:
            buffer.write(await image.read())

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO reports
    (
        user_id,
        description,
        zone,
        lat,
        lng,
        status,
        priority,
        image_path
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        user_id,
        description,
        zone,
        lat,
        lng,
        "Pendiente",
        priority,
        image_path
    ))

    report_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "status": "Reporte creado",
        "priority": priority,
        "report_id": report_id
    }

# =========================
# OBTENER REPORTES
# =========================

@app.get("/admin/reports")
async def get_reports():

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reports")

    rows = cursor.fetchall()

    conn.close()

    return rows

# =========================
# ACTUALIZAR ESTADO
# =========================

@app.put("/admin/reports/{report_id}")
async def update_status(
    report_id: int,
    status: str = "Atendido"
):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE reports SET status = ? WHERE id = ?",
        (status, report_id)
    )

    conn.commit()
    conn.close()

    return {
        "status": "Actualizado"
    }
    
    # =========================
# ELIMINAR REPORTE
# =========================

@app.delete("/admin/reports/{report_id}")
async def delete_report(report_id: int):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM reports WHERE id = ?",
        (report_id,)
    )

    conn.commit()

    conn.close()

    return {
        "status": "Reporte eliminado"
    }

# =========================
# INICIO DEL SERVIDOR
# =========================

@app.put("/admin/reports/{report_id}")
async def delete_report(report_id: int):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM reports WHERE id = ?",
        (report_id,)
    )

    conn.commit()
    conn.close()

    return {
        "status": "Reporte eliminado"
    }
    

# =========================
# RUTA PRINCIPAL
# =========================

@app.get("/")
async def home():

    return {
        "mensaje": "SAAC Cosío funcionando correctamente"
    }

if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001
    )