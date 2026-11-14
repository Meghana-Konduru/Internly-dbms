
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection


router = APIRouter(tags=["Internships"])


# 1. Get all open internships with optional filters
@router.get("/api/jobs")
def get_jobs(
    search: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    company: Optional[str] = Query(default=None),
    skill: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT DISTINCT
                    j.job_id,
                    j.title,
                    j.description,
                    j.location,
                    j.deadline,
                    j.status,
                    c.company_id,
                    c.company_name,
                    r.name AS recruiter_name,
                    COALESCE(
                        ARRAY_AGG(DISTINCT s.skill_name)
                        FILTER (WHERE s.skill_name IS NOT NULL),
                        ARRAY[]::VARCHAR[]
                    ) AS required_skills,
                    COUNT(*) OVER() AS total_count
                FROM jobs j
                JOIN companies c ON c.company_id = j.company_id
                JOIN recruiters r ON r.recruiter_id = j.recruiter_id
                LEFT JOIN job_skills js ON js.job_id = j.job_id
                LEFT JOIN skills s ON s.skill_id = js.skill_id
                WHERE j.status = 'open'
                  AND (j.deadline IS NULL OR j.deadline >= CURRENT_DATE)
                  AND (
                      %s IS NULL
                      OR j.title ILIKE %s
                      OR j.description ILIKE %s
                      OR c.company_name ILIKE %s
                  )
                  AND (%s IS NULL OR j.location ILIKE %s)
                  AND (%s IS NULL OR c.company_name ILIKE %s)
                  AND (%s IS NULL OR s.skill_name ILIKE %s)
                GROUP BY j.job_id, c.company_id, r.recruiter_id
                ORDER BY j.job_id DESC
                LIMIT %s OFFSET %s;
            """, (
                search, f"%{search}%" if search else None,
                f"%{search}%" if search else None,
                f"%{search}%" if search else None,
                location, f"%{location}%" if location else None,
                company, f"%{company}%" if company else None,
                skill, f"%{skill}%" if skill else None,
                limit, offset
            ))

            jobs = cursor.fetchall()

        total_count = jobs[0]["total_count"] if jobs else 0

        return {
            "message": "Internships retrieved successfully",
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "jobs": [
                {key: value for key, value in dict(job).items()
                 if key != "total_count"}
                for job in jobs
            ]
        }

    finally:
        connection.close()


# 2. Get details of one internship
@router.get("/api/jobs/{job_id}")
def get_job_details(job_id: int):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    j.job_id,
                    j.title,
                    j.description,
                    j.location,
                    j.deadline,
                    j.status,
                    c.company_id,
                    c.company_name,
                    c.industry,
                    r.name AS recruiter_name,
                    COALESCE(
                        ARRAY_AGG(DISTINCT s.skill_name)
                        FILTER (WHERE s.skill_name IS NOT NULL),
                        ARRAY[]::VARCHAR[]
                    ) AS required_skills
                FROM jobs j
                JOIN companies c ON c.company_id = j.company_id
                JOIN recruiters r ON r.recruiter_id = j.recruiter_id
                LEFT JOIN job_skills js ON js.job_id = j.job_id
                LEFT JOIN skills s ON s.skill_id = js.skill_id
                WHERE j.job_id = %s
                  AND j.status = 'open'
                  AND (j.deadline IS NULL OR j.deadline >= CURRENT_DATE)
                GROUP BY j.job_id, c.company_id, r.recruiter_id;
            """, (job_id,))

            job = cursor.fetchone()

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Internship not found or no longer available"
            )

        return {
            "message": "Internship details retrieved successfully",
            "job": dict(job)
        }

    finally:
        connection.close()
