from fastapi import APIRouter, Depends, HTTPException, Query
from app.redis_client import get_cache, set_cache
from psycopg2.extras import RealDictCursor
from psycopg2 import Error as PsycopgError

from app.database import get_db_connection
from app.security import get_current_student
from app.schemas.recommendations import ResumeTextRequest
from app.services.embeddings import (
    generate_embedding,
    embedding_to_pgvector,
    MODEL_NAME
)


router = APIRouter(tags=["Recommendations"])


# ============================================================
# 1. SKILL-BASED INTERNSHIP RECOMMENDATIONS
# ============================================================

@router.get("/api/students/me/recommendations/skills")
def get_skill_recommendations(
    current_user: dict = Depends(get_current_student)
):
    student_id = current_user["user_id"]
    cache_key = f"recommendations:skills:{student_id}"

    # Check Redis cache
    cached_recommendations = get_cache(cache_key)

    if cached_recommendations is not None:
        return {
            **cached_recommendations,
            "source": "redis_cache"
        }

    # Fetch from PostgreSQL if cache is empty
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    m.recommended_job_id AS job_id,
                    m.job_title,
                    m.company_name,
                    m.matched_skill_count,
                    j.description,
                    j.location,
                    j.deadline,
                    j.status,

                    COALESCE(
                        (
                            SELECT json_agg(s.skill_name ORDER BY s.skill_name)
                            FROM job_skills js
                            JOIN skills s ON s.skill_id = js.skill_id
                            WHERE js.job_id = j.job_id
                        ),
                        '[]'::json
                    ) AS required_skills,

                    COALESCE(
                        (
                            SELECT json_agg(s.skill_name ORDER BY s.skill_name)
                            FROM job_skills js
                            JOIN skills s ON s.skill_id = js.skill_id
                            JOIN student_skills ss
                                ON ss.skill_id = s.skill_id
                               AND ss.student_id = %s
                            WHERE js.job_id = j.job_id
                        ),
                        '[]'::json
                    ) AS matched_skills,

                    (
                        SELECT COUNT(*)
                        FROM job_skills js
                        WHERE js.job_id = j.job_id
                    ) AS total_skill_count

                FROM get_matching_jobs(%s) m
                JOIN jobs j
                    ON j.job_id = m.recommended_job_id
                ORDER BY
                    m.matched_skill_count DESC,
                    m.recommended_job_id;
                """,
                (student_id, student_id)
            )

            recommendations = cursor.fetchall()

        result = {
            "message": "Skill-based recommendations retrieved successfully",
            "recommendation_type": "skill_match",
            "total": len(recommendations),
            "recommendations": [
                dict(recommendation)
                for recommendation in recommendations
            ]
        }

        # Store in Redis for 60 seconds
        set_cache(cache_key, result, expiry=60)

        return {
            **result,
            "source": "postgresql"
        }

    finally:
        connection.close()


# ============================================================
# 2. GENERATE AND SAVE STUDENT RESUME EMBEDDING
# ============================================================

@router.post("/api/students/me/resume-embedding")
def create_resume_embedding(
    data: ResumeTextRequest,
    current_user: dict = Depends(get_current_student)
):
    # Generate the resume embedding
    try:
        embedding = generate_embedding(data.resume_text)
        vector_value = embedding_to_pgvector(embedding)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO student_resume_embeddings
                    (student_id, embedding, model_name, updated_at)
                VALUES
                    (%s, %s::vector, %s, CURRENT_TIMESTAMP)

                ON CONFLICT (student_id)
                DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    model_name = EXCLUDED.model_name,
                    updated_at = CURRENT_TIMESTAMP

                RETURNING student_id, model_name, updated_at;
                """,
                (
                    current_user["user_id"],
                    vector_value,
                    MODEL_NAME
                )
            )

            saved_embedding = cursor.fetchone()

        connection.commit()

        return {
            "message": "Resume embedding saved successfully",
            "embedding": dict(saved_embedding)
        }

    except PsycopgError:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not save resume embedding"
        )

    finally:
        connection.close()


# ============================================================
# 3. SEMANTIC INTERNSHIP RECOMMENDATIONS USING PGVECTOR
# ============================================================

@router.get("/api/students/me/recommendations/semantic")
def get_semantic_recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            # Check whether the student has a resume embedding
            cursor.execute(
                """
                SELECT student_id
                FROM student_resume_embeddings
                WHERE student_id = %s
                  AND model_name = %s;
                """,
                (current_user["user_id"], MODEL_NAME)
            )

            student_embedding = cursor.fetchone()

            if not student_embedding:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Resume embedding not found. "
                        "Generate your resume embedding first."
                    )
                )

            # Find semantically similar internships
            cursor.execute(
                """
                SELECT
                    j.job_id,
                    j.title,
                    j.description,
                    j.location,
                    j.deadline,
                    c.company_name,

                    ROUND(
                        (
                            1 - (
                                je.embedding <=> se.embedding
                            )
                        )::numeric,
                        4
                    ) AS similarity_score

                FROM student_resume_embeddings se

                JOIN job_embeddings je
                    ON je.model_name = se.model_name

                JOIN jobs j
                    ON j.job_id = je.job_id

                JOIN companies c
                    ON c.company_id = j.company_id

                WHERE se.student_id = %s
                  AND se.model_name = %s
                  AND j.status = 'open'

                  AND (
                      j.deadline IS NULL
                      OR j.deadline >= CURRENT_DATE
                  )

                  AND NOT EXISTS (
                      SELECT 1
                      FROM applications a
                      WHERE a.student_id = se.student_id
                        AND a.job_id = j.job_id
                  )

                ORDER BY
                    je.embedding <=> se.embedding ASC

                LIMIT %s;
                """,
                (
                    current_user["user_id"],
                    MODEL_NAME,
                    limit
                )
            )

            recommendations = cursor.fetchall()

        return {
            "message": "Semantic recommendations retrieved successfully",
            "recommendation_type": "semantic_match",
            "total": len(recommendations),
            "recommendations": [
                dict(recommendation)
                for recommendation in recommendations
            ]
        }

    finally:
        connection.close()
