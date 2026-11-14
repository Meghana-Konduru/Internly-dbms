
from fastapi import APIRouter, Depends, HTTPException
from psycopg2 import Error as PsycopgError
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student


router = APIRouter(tags=["Student Applications"])


# 1. View all applications belonging to the logged-in student
@router.get("/api/students/me/applications")
def get_my_applications(
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    a.application_id,
                    a.job_id,
                    j.title AS job_title,
                    j.location,
                    j.status AS job_status,
                    c.company_name,
                    a.applied_at,
                    a.status AS application_status
                FROM applications a
                JOIN jobs j ON j.job_id = a.job_id
                JOIN companies c ON c.company_id = j.company_id
                WHERE a.student_id = %s
                ORDER BY a.applied_at DESC;
            """, (current_user["user_id"],))

            applications = cursor.fetchall()

        return {
            "message": "Applications retrieved successfully",
            "applications": [
                dict(application) for application in applications
            ]
        }

    finally:
        connection.close()


# 2. Apply directly to a job (right swipe)
@router.post("/api/students/me/applications/{job_id}", status_code=201)
def apply_to_job(
    job_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            # Use the existing PostgreSQL stored procedure
            cursor.execute(
                "CALL apply_for_internship(%s, %s);",
                (current_user["user_id"], job_id)
            )

            # Retrieve the newly created application
            cursor.execute("""
                SELECT
                    a.application_id,
                    a.student_id,
                    a.job_id,
                    j.title AS job_title,
                    c.company_name,
                    a.applied_at,
                    a.status AS application_status
                FROM applications a
                JOIN jobs j ON j.job_id = a.job_id
                JOIN companies c ON c.company_id = j.company_id
                WHERE a.student_id = %s
                  AND a.job_id = %s;
            """, (current_user["user_id"], job_id))

            application = cursor.fetchone()

        connection.commit()

        return {
            "message": "Application submitted successfully",
            "application": dict(application)
        }

    except PsycopgError as exc:
        connection.rollback()

        if exc.pgcode == "23505":
            raise HTTPException(
                status_code=409,
                detail="You have already applied to this job"
            )

        if exc.pgcode == "P0001":
            raise HTTPException(
                status_code=400,
                detail=str(exc).strip()
            )

        raise HTTPException(
            status_code=500,
            detail="Could not submit application"
        )

    finally:
        connection.close()


# 3. View one application belonging to the logged-in student
@router.get("/api/students/me/applications/{application_id}")
def get_application(
    application_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    a.application_id,
                    a.job_id,
                    j.title AS job_title,
                    j.description,
                    j.location,
                    c.company_name,
                    a.applied_at,
                    a.status AS application_status
                FROM applications a
                JOIN jobs j ON j.job_id = a.job_id
                JOIN companies c ON c.company_id = j.company_id
                WHERE a.application_id = %s
                  AND a.student_id = %s;
            """, (application_id, current_user["user_id"]))

            application = cursor.fetchone()

        if not application:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        return {
            "message": "Application retrieved successfully",
            "application": dict(application)
        }

    finally:
        connection.close()


# 4. Withdraw an application
@router.patch("/api/students/me/applications/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE applications
                SET status = 'withdrawn'
                WHERE application_id = %s
                  AND student_id = %s
                  AND status IN ('pending', 'shortlisted')
                RETURNING application_id, job_id, status;
            """, (application_id, current_user["user_id"]))

            application = cursor.fetchone()

        if not application:
            connection.rollback()
            raise HTTPException(
                status_code=404,
                detail=(
                    "Application not found, or it cannot be withdrawn "
                    "because of its current status"
                )
            )

        connection.commit()

        return {
            "message": "Application withdrawn successfully",
            "application": dict(application)
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
