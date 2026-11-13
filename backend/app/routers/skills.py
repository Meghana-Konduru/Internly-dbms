
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from psycopg2 import IntegrityError
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_student


router = APIRouter(tags=["Skills"])


Proficiency = Literal[
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert"
]


class StudentSkillCreate(BaseModel):
    skill_id: int
    proficiency: Proficiency


class StudentSkillUpdate(BaseModel):
    proficiency: Proficiency


# 1. List all available skills
@router.get("/api/skills")
def get_all_skills():
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT skill_id, skill_name
                FROM skills
                ORDER BY skill_name;
            """)

            skills = cursor.fetchall()

        return {
            "message": "Skills retrieved successfully",
            "skills": [dict(skill) for skill in skills]
        }

    finally:
        connection.close()


# 2. View skills belonging to the logged-in student
@router.get("/api/students/me/skills")
def get_student_skills(
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    s.skill_id,
                    s.skill_name,
                    ss.proficiency
                FROM student_skills ss
                JOIN skills s
                    ON ss.skill_id = s.skill_id
                WHERE ss.student_id = %s
                ORDER BY s.skill_name;
            """, (current_user["user_id"],))

            skills = cursor.fetchall()

        return {
            "message": "Student skills retrieved successfully",
            "skills": [dict(skill) for skill in skills]
        }

    finally:
        connection.close()


# 3. Add a skill to the logged-in student's profile
@router.post("/api/students/me/skills", status_code=201)
def add_student_skill(
    data: StudentSkillCreate,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute("""
                SELECT skill_id, skill_name
                FROM skills
                WHERE skill_id = %s;
            """, (data.skill_id,))

            skill = cursor.fetchone()

            if not skill:
                raise HTTPException(
                    status_code=404,
                    detail="Skill not found"
                )

            cursor.execute("""
                INSERT INTO student_skills
                    (student_id, skill_id, proficiency)
                VALUES (%s, %s, %s)
                RETURNING student_id, skill_id, proficiency;
            """, (
                current_user["user_id"],
                data.skill_id,
                data.proficiency
            ))

            added_skill = cursor.fetchone()

        connection.commit()

        return {
            "message": "Skill added successfully",
            "skill": {
                **dict(added_skill),
                "skill_name": skill["skill_name"]
            }
        }

    except IntegrityError as exc:
        connection.rollback()
        if exc.pgcode == "23505":
            raise HTTPException(
                status_code=409,
                detail="This skill is already in your profile"
            )
        raise

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# 4. Update proficiency of an existing student skill
@router.put("/api/students/me/skills/{skill_id}")
def update_student_skill(
    skill_id: int,
    data: StudentSkillUpdate,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE student_skills
                SET proficiency = %s
                WHERE student_id = %s
                  AND skill_id = %s
                RETURNING student_id, skill_id, proficiency;
            """, (
                data.proficiency,
                current_user["user_id"],
                skill_id
            ))

            updated_skill = cursor.fetchone()

        if not updated_skill:
            raise HTTPException(
                status_code=404,
                detail="This skill is not in your profile"
            )

        connection.commit()

        return {
            "message": "Skill proficiency updated successfully",
            "skill": dict(updated_skill)
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# 5. Remove a skill from the logged-in student's profile
@router.delete("/api/students/me/skills/{skill_id}")
def delete_student_skill(
    skill_id: int,
    current_user: dict = Depends(get_current_student)
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM student_skills
                WHERE student_id = %s
                  AND skill_id = %s;
            """, (
                current_user["user_id"],
                skill_id
            ))

            deleted_count = cursor.rowcount

        if deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="This skill is not in your profile"
            )

        connection.commit()

        return {
            "message": "Skill removed successfully",
            "skill_id": skill_id
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
