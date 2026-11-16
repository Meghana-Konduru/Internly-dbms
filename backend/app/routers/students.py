
import os
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student


router = APIRouter(
    prefix="/api/students",
    tags=["Students"]
)

# Store uploaded resumes inside the backend directory.
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "resumes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx"
}

CONTENT_TYPES = {
    ".pdf": {"application/pdf"},
    ".doc": {"application/msword"},
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
}


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    graduation_year: int | None = Field(default=None, ge=2000, le=2100)
    resume_url: str | None = None


def get_resume_record(student_id: int):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT resume_url
                FROM students
                WHERE student_id = %s;
                """,
                (student_id,)
            )
            return cursor.fetchone()
    finally:
        connection.close()


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


@router.post("/me/resume", status_code=201)
async def upload_student_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_student)
):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC and DOCX files are allowed"
        )

    content_type = (file.content_type or "").lower()

    if content_type not in CONTENT_TYPES[extension]:
        raise HTTPException(
            status_code=400,
            detail="File content type does not match its extension"
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty"
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume must not exceed 5 MB"
        )

    # Check basic file signatures.
    if extension == ".pdf" and not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )

    if extension == ".docx" and not contents.startswith(b"PK"):
        raise HTTPException(
            status_code=400,
            detail="Invalid DOCX file"
        )

    if extension == ".doc" and not contents.startswith(
        (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",)
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid DOC file"
        )

    student_id = current_user["user_id"]
    unique_filename = f"student_{student_id}_{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Save the actual file.
    try:
        file_path.write_bytes(contents)

        connection = get_db_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE students
                    SET resume_url = %s
                    WHERE student_id = %s;
                    """,
                    (
                        f"/api/students/me/resume",
                        student_id
                    )
                )

                if cursor.rowcount == 0:
                    raise HTTPException(
                        status_code=404,
                        detail="Student profile not found"
                    )

            connection.commit()

        finally:
            connection.close()

    except Exception:
        if file_path.exists():
            file_path.unlink()
        raise

    return {
        "message": "Resume uploaded successfully",
        "filename": file.filename,
        "resume_url": "/api/students/me/resume"
    }


@router.get("/me/resume")
def download_student_resume(
    current_user: dict = Depends(get_current_student)
):
    student_id = current_user["user_id"]

    pattern = f"student_{student_id}_*"

    files = sorted(
        UPLOAD_DIR.glob(pattern),
        key=lambda path: path.stat().st_mtime,
        reverse=True
    )

    if not files:
        raise HTTPException(
            status_code=404,
            detail="No resume uploaded"
        )

    file_path = files[0]

    return FileResponse(
        path=file_path,
        filename=f"resume{file_path.suffix}",
        media_type="application/octet-stream"
    )
