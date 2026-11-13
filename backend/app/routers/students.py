
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student


router = APIRouter(
    prefix="/api/students",
    tags=["Students"]
)


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    graduation_year: int | None = Field(default=None, ge=2000, le=2100)
    resume_url: str | None = None


@router.get("/me")
def get_student_profile(
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT student_id, name, email, department,
                       graduation_year, resume_url
                FROM students
                WHERE student_id = %s;
                """,
                (current_user["user_id"],)
            )

            student = cursor.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student profile not found"
            )

        return {
            "message": "Student profile retrieved successfully",
            "profile": dict(student)
        }

    finally:
        connection.close()


@router.put("/me")
def update_student_profile(
    data: StudentProfileUpdate,
    current_user: dict = Depends(get_current_student)
):
    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update"
        )

    if "name" in updates:
        if updates["name"] is None or not updates["name"].strip():
            raise HTTPException(
                status_code=422,
                detail="Name cannot be empty"
            )
        updates["name"] = updates["name"].strip()

    # Only these predefined database columns can be updated.
    allowed_columns = {
        "name": "name",
        "department": "department",
        "graduation_year": "graduation_year",
        "resume_url": "resume_url"
    }

    set_clauses = [
        f"{allowed_columns[field]} = %s"
        for field in updates
    ]

    values = list(updates.values())
    values.append(current_user["user_id"])

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                UPDATE students
                SET {", ".join(set_clauses)}
                WHERE student_id = %s
                RETURNING student_id, name, email, department,
                          graduation_year, resume_url;
                """,
                values
            )

            student = cursor.fetchone()

        if not student:
            connection.rollback()
            raise HTTPException(
                status_code=404,
                detail="Student profile not found"
            )

        connection.commit()

        return {
            "message": "Student profile updated successfully",
            "profile": dict(student)
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
