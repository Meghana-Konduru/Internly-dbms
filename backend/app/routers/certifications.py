
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from psycopg2 import IntegrityError
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student


router = APIRouter(tags=["Certifications"])


class StudentCertificationCreate(BaseModel):
    certification_id: int = Field(gt=0)
    issue_date: date
    expiry_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.expiry_date and self.expiry_date < self.issue_date:
            raise ValueError("Expiry date cannot be before issue date")
        return self


# 1. List all available certifications
@router.get("/api/certifications")
def get_all_certifications():
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    certification_id,
                    certification_name,
                    issuing_organization
                FROM certifications
                ORDER BY certification_name;
            """)

            certifications = cursor.fetchall()

        return {
            "message": "Certifications retrieved successfully",
            "certifications": [
                dict(certification)
                for certification in certifications
            ]
        }

    finally:
        connection.close()


# 2. View certifications belonging to the logged-in student
@router.get("/api/students/me/certifications")
def get_student_certifications(
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    c.certification_id,
                    c.certification_name,
                    c.issuing_organization,
                    sc.issue_date,
                    sc.expiry_date
                FROM student_certifications sc
                JOIN certifications c
                    ON c.certification_id = sc.certification_id
                WHERE sc.student_id = %s
                ORDER BY sc.issue_date DESC;
            """, (current_user["user_id"],))

            certifications = cursor.fetchall()

        return {
            "message": "Student certifications retrieved successfully",
            "certifications": [
                dict(certification)
                for certification in certifications
            ]
        }

    finally:
        connection.close()


# 3. Add a certification to the logged-in student's profile
@router.post("/api/students/me/certifications", status_code=201)
def add_student_certification(
    data: StudentCertificationCreate,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute("""
                SELECT certification_id, certification_name,
                       issuing_organization
                FROM certifications
                WHERE certification_id = %s;
            """, (data.certification_id,))

            certification = cursor.fetchone()

            if not certification:
                raise HTTPException(
                    status_code=404,
                    detail="Certification not found"
                )

            cursor.execute("""
                INSERT INTO student_certifications
                    (student_id, certification_id, issue_date, expiry_date)
                VALUES (%s, %s, %s, %s)
                RETURNING student_id, certification_id,
                          issue_date, expiry_date;
            """, (
                current_user["user_id"],
                data.certification_id,
                data.issue_date,
                data.expiry_date
            ))

            added = cursor.fetchone()

        connection.commit()

        return {
            "message": "Certification added successfully",
            "certification": {
                **dict(added),
                "certification_name": certification["certification_name"],
                "issuing_organization": certification["issuing_organization"]
            }
        }

    except IntegrityError as exc:
        connection.rollback()

        if exc.pgcode == "23505":
            raise HTTPException(
                status_code=409,
                detail="This certification is already in your profile"
            )

        raise

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# 4. Remove a certification from the logged-in student's profile
@router.delete("/api/students/me/certifications/{certification_id}")
def delete_student_certification(
    certification_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM student_certifications
                WHERE student_id = %s
                  AND certification_id = %s;
            """, (
                current_user["user_id"],
                certification_id
            ))

            deleted_count = cursor.rowcount

        if deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Certification not found in your profile"
            )

        connection.commit()

        return {
            "message": "Certification removed successfully",
            "certification_id": certification_id
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
