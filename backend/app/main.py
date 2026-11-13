
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.database import test_db_connection
from app.routers.auth import router as auth_router
from app.routers.students import router as students_router
from app.routers.skills import router as skills_router

app = FastAPI(
    title="Internly API",
    description="Internship recommendation platform backend",
    version="1.0.0"
)

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(skills_router)


@app.get("/")
def home():
    return {
        "message": "Internly backend is running",
        "status": "success"
    }


@app.get("/api/health/database")
def database_health():
    try:
        result = test_db_connection()
        return {
            "status": "connected",
            "database": result["database_name"],
            "user": result["connected_user"]
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )
