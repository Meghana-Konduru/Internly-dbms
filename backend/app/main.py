
# from fastapi import FastAPI, HTTPException

# from app.database import test_db_connection

# app = FastAPI(
#     title="Internly API",
#     description="Internship platform backend",
#     version="1.0.0"
# )


# @app.get("/")
# def home():
#     return {"message": "Internly backend is running"}


# @app.get("/api/health/database")
# def database_health():

#     try:
#         result = test_db_connection()

#         return {
#             "status": "connected",
#             "database": result["database_name"],
#             "user": result["connected_user"]
#         }

#     except Exception as error:
#         raise HTTPException(
#             status_code=503,
#             detail=f"Database connection failed: {str(error)}"
#         )


from fastapi import FastAPI, HTTPException

from app.database import test_db_connection
from app.routers.auth import router as auth_router


app = FastAPI(
    title="Internly API",
    description="Internship recommendation platform backend",
    version="1.0.0"
)


# Register authentication endpoints
app.include_router(auth_router)


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
