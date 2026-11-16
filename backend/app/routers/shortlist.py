
from fastapi import APIRouter, Depends, HTTPException
from psycopg2 import Error as PsycopgError
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student

router = APIRouter(tags=["Student Shortlist"])


# 1. View all shortlisted internships
@router.get("/api/students/me/shortlist")
def get_my_shortlist(
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    s.shortlist_id,
                    s.job_id,
                    j.title AS job_title,
                    j.location,
                    j.description,
                    c.company_name,
                    s.shortlisted_at
                FROM shortlist s
                JOIN jobs j ON j.job_id = s.job_id
                JOIN companies c ON c.company_id = j.company_id
                WHERE s.student_id = %s
                ORDER BY s.shortlisted_at DESC;
            """, (current_user["user_id"],))

            items = cursor.fetchall()

        return {
            "message": "Shortlist retrieved successfully",
            "total": len(items),
            "shortlist": [dict(item) for item in items]
        }

    finally:
        connection.close()


# 2. Add an internship to shortlist
@router.post("/api/students/me/shortlist/{job_id}", status_code=201)
def add_to_shortlist(
    job_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO shortlist (student_id, job_id)
                VALUES (%s, %s)
                RETURNING shortlist_id, student_id, job_id, shortlisted_at;
            """, (current_user["user_id"], job_id))

            item = cursor.fetchone()

        connection.commit()

        return {
            "message": "Internship added to shortlist",
            "item": dict(item)
        }

    except PsycopgError as exc:
        connection.rollback()

        if exc.pgcode == "23505":
            raise HTTPException(
                status_code=409,
                detail="This internship is already shortlisted"
            )

        if exc.pgcode == "23503":
            raise HTTPException(
                status_code=404,
                detail="Student or internship not found"
            )

        raise HTTPException(
            status_code=500,
            detail="Could not add internship to shortlist"
        )

    finally:
        connection.close()


# 3. Remove an internship from shortlist
@router.delete("/api/students/me/shortlist/{job_id}")
def remove_from_shortlist(
    job_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                DELETE FROM shortlist
                WHERE student_id = %s
                  AND job_id = %s
                RETURNING shortlist_id, job_id;
            """, (current_user["user_id"], job_id))

            item = cursor.fetchone()

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Internship not found in your shortlist"
            )

        connection.commit()

        return {
            "message": "Internship removed from shortlist",
            "item": dict(item)
        }

    finally:
        connection.close()
