
from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from psycopg2.extras import RealDictCursor
from psycopg2.errors import UniqueViolation

from app.database import get_db_connection
from app.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# -----------------------------
# REQUEST MODELS
# -----------------------------

class StudentRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    department: str | None = Field(default=None, max_length=100)
    graduation_year: int | None = Field(default=None, ge=2000, le=2100)
    resume_url: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# -----------------------------
# STUDENT REGISTRATION
# -----------------------------

@router.post(
    "/student/register",
    status_code=status.HTTP_201_CREATED
)
def register_student(data: StudentRegister):

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                INSERT INTO students
                (name, email, password_hash, department,
                 graduation_year, resume_url)
                VALUES (%s, LOWER(TRIM(%s)), %s, %s, %s, %s)
                RETURNING student_id, name, email,
                          department, graduation_year;
                """,
                (
                    data.name.strip(),
                    str(data.email),
                    hash_password(data.password),
                    data.department,
                    data.graduation_year,
                    data.resume_url
                )
            )

            student = cursor.fetchone()

        connection.commit()

        token = create_access_token(
            student["student_id"],
            "student"
        )

        return {
            "message": "Student registered successfully",
            "user": dict(student),
            "role": "student",
            "access_token": token,
            "token_type": "bearer"
        }

    except UniqueViolation:
        connection.rollback()

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists"
        )

    finally:
        connection.close()


# -----------------------------
# STUDENT LOGIN
# -----------------------------

@router.post("/student/login")
def student_login(data: LoginRequest):

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                SELECT student_id, name, email, password_hash
                FROM students
                WHERE email = LOWER(TRIM(%s));
                """,
                (str(data.email),)
            )

            student = cursor.fetchone()

        if not student or not verify_password(
            data.password,
            student["password_hash"]
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_access_token(
            student["student_id"],
            "student"
        )

        return {
            "message": "Student login successful",
            "user": {
                "student_id": student["student_id"],
                "name": student["name"],
                "email": student["email"]
            },
            "role": "student",
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        connection.close()


# -----------------------------
# RECRUITER LOGIN
# -----------------------------

@router.post("/recruiter/login")
def recruiter_login(data: LoginRequest):

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                SELECT recruiter_id, name, email,
                       company_id, password_hash
                FROM recruiters
                WHERE email = LOWER(TRIM(%s));
                """,
                (str(data.email),)
            )

            recruiter = cursor.fetchone()

        if not recruiter or not verify_password(
            data.password,
            recruiter["password_hash"]
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_access_token(
            recruiter["recruiter_id"],
            "recruiter"
        )

        return {
            "message": "Recruiter login successful",
            "user": {
                "recruiter_id": recruiter["recruiter_id"],
                "name": recruiter["name"],
                "email": recruiter["email"],
                "company_id": recruiter["company_id"]
            },
            "role": "recruiter",
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        connection.close()
