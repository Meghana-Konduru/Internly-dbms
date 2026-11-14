
# # from datetime import date
# # from typing import Optional

# # from fastapi import APIRouter, Depends, HTTPException
# # from pydantic import BaseModel, Field
# # from psycopg2 import Error as PsycopgError
# # from psycopg2.extras import RealDictCursor

# # from app.database import get_db_connection
# # from app.security import get_current_recruiter
# # from app.services.embeddings import (
# #     generate_embedding,
# #     embedding_to_pgvector
# # )


# # def generate_and_save_job_embedding(cursor, job_id: int):
# #     """
# #     Generate or update the semantic embedding for an internship.
# #     """

# #     cursor.execute(
# #         """
# #         SELECT title, description, location
# #         FROM jobs
# #         WHERE job_id = %s
# #         """,
# #         (job_id,)
# #     )

# #     job = cursor.fetchone()

# #     if not job:
# #         return

# #     title, description, location = job

# #     # Combine relevant internship information into one text.
# #     job_text = f"""
# #     Internship Title: {title or ''}
# #     Description: {description or ''}
# #     Location: {location or ''}
# #     """

# #     embedding = generate_embedding(job_text)
# #     vector_value = embedding_to_pgvector(embedding)

# #     cursor.execute(
# #         """
# #         INSERT INTO job_embeddings
# #             (job_id, embedding, model_name, updated_at)
# #         VALUES
# #             (%s, %s::vector, %s, CURRENT_TIMESTAMP)
# #         ON CONFLICT (job_id)
# #         DO UPDATE SET
# #             embedding = EXCLUDED.embedding,
# #             model_name = EXCLUDED.model_name,
# #             updated_at = CURRENT_TIMESTAMP
# #         """,
# #         (
# #             job_id,
# #             vector_value,
# #             "all-MiniLM-L6-v2"
# #         )
# #     )


# # router = APIRouter(tags=["Recruiter"])


# # class JobCreate(BaseModel):
# #     title: str = Field(min_length=2, max_length=150)
# #     description: Optional[str] = None
# #     location: Optional[str] = None
# #     deadline: date


# # class JobUpdate(BaseModel):
# #     title: Optional[str] = Field(default=None, min_length=2, max_length=150)
# #     description: Optional[str] = None
# #     location: Optional[str] = None
# #     deadline: Optional[date] = None
# #     status: Optional[str] = None


# # class ApplicationStatusUpdate(BaseModel):
# #     status: str


# # # 1. Recruiter's company profile
# # @router.get("/api/recruiters/me/company")
# # def get_my_company(
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 SELECT
# #                     c.company_id,
# #                     c.company_name,
# #                     c.industry,
# #                     c.location,
# #                     r.recruiter_id,
# #                     r.name AS recruiter_name,
# #                     r.email
# #                 FROM recruiters r
# #                 JOIN companies c ON c.company_id = r.company_id
# #                 WHERE r.recruiter_id = %s;
# #             """, (current_user["user_id"],))

# #             company = cursor.fetchone()

# #         if not company:
# #             raise HTTPException(status_code=404, detail="Company not found")

# #         return {"company": dict(company)}

# #     finally:
# #         connection.close()


# # # 2. Create an internship
# # @router.post("/api/recruiters/me/jobs", status_code=201)
# # def create_job(
# #     data: JobCreate,
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 CALL add_internship(
# #                     %s, %s, %s, %s, %s, %s
# #                 );
# #             """, (
# #                 current_user["user_id"],
# #                 current_user["company_id"],
# #                 data.title,
# #                 data.description,
# #                 data.location,
# #                 data.deadline
# #             ))

# #             cursor.execute("""
# #                 SELECT job_id, title, description, location,
# #                        deadline, status
# #                 FROM jobs
# #                 WHERE recruiter_id = %s
# #                 ORDER BY job_id DESC
# #                 LIMIT 1;
# #             """, (current_user["user_id"],))

# #             job = cursor.fetchone()

# #         connection.commit()

# #         return {
# #             "message": "Internship created successfully",
# #             "job": dict(job)
# #         }

# #     except PsycopgError as exc:
# #         connection.rollback()

# #         if exc.pgcode == "P0001":
# #             raise HTTPException(status_code=400, detail=str(exc).strip())

# #         raise HTTPException(status_code=500, detail="Could not create job")

# #     finally:
# #         connection.close()


# # # 3. View jobs posted by this recruiter
# # @router.get("/api/recruiters/me/jobs")
# # def get_my_jobs(
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 SELECT
# #                     j.job_id,
# #                     j.title,
# #                     j.description,
# #                     j.location,
# #                     j.deadline,
# #                     j.status,
# #                     COUNT(a.application_id) AS applicant_count
# #                 FROM jobs j
# #                 LEFT JOIN applications a ON a.job_id = j.job_id
# #                 WHERE j.recruiter_id = %s
# #                 GROUP BY j.job_id
# #                 ORDER BY j.job_id DESC;
# #             """, (current_user["user_id"],))

# #             jobs = cursor.fetchall()

# #         return {
# #             "message": "Recruiter jobs retrieved successfully",
# #             "jobs": [dict(job) for job in jobs]
# #         }

# #     finally:
# #         connection.close()


# # # 4. Update a job posted by this recruiter
# # @router.patch("/api/recruiters/me/jobs/{job_id}")
# # def update_job(
# #     job_id: int,
# #     data: JobUpdate,
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     changes = data.model_dump(exclude_unset=True)

# #     if not changes:
# #         raise HTTPException(status_code=400, detail="No fields provided")

# #     allowed_fields = {"title", "description", "location", "deadline", "status"}

# #     if not set(changes).issubset(allowed_fields):
# #         raise HTTPException(status_code=400, detail="Invalid fields")

# #     if changes.get("status") not in (None, "open", "closed", "paused"):
# #         raise HTTPException(status_code=400, detail="Invalid job status")

# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 SELECT job_id
# #                 FROM jobs
# #                 WHERE job_id = %s AND recruiter_id = %s;
# #             """, (job_id, current_user["user_id"]))

# #             if not cursor.fetchone():
# #                 raise HTTPException(status_code=404, detail="Job not found")

# #             set_clause = ", ".join(
# #                 f"{field} = %s" for field in changes
# #             )

# #             values = list(changes.values()) + [job_id, current_user["user_id"]]

# #             cursor.execute(f"""
# #                 UPDATE jobs
# #                 SET {set_clause}
# #                 WHERE job_id = %s AND recruiter_id = %s
# #                 RETURNING job_id, title, description, location, deadline, status;
# #             """, values)

# #             updated_job = cursor.fetchone()

# #         connection.commit()

# #         return {
# #             "message": "Job updated successfully",
# #             "job": dict(updated_job)
# #         }

# #     except PsycopgError:
# #         connection.rollback()
# #         raise HTTPException(status_code=400, detail="Could not update job")

# #     finally:
# #         connection.close()


# # # 5. View applicants for a job owned by this recruiter
# # @router.get("/api/recruiters/me/jobs/{job_id}/applicants")
# # def get_job_applicants(
# #     job_id: int,
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 SELECT job_id
# #                 FROM jobs
# #                 WHERE job_id = %s AND recruiter_id = %s;
# #             """, (job_id, current_user["user_id"]))

# #             if not cursor.fetchone():
# #                 raise HTTPException(status_code=404, detail="Job not found")

# #             cursor.execute("""
# #                 SELECT
# #                     a.application_id,
# #                     a.status AS application_status,
# #                     a.applied_at,
# #                     s.student_id,
# #                     s.name AS student_name,
# #                     s.email,
# #                     s.department,
# #                     s.graduation_year,
# #                     s.resume_url
# #                 FROM applications a
# #                 JOIN students s ON s.student_id = a.student_id
# #                 WHERE a.job_id = %s
# #                 ORDER BY a.applied_at DESC;
# #             """, (job_id,))

# #             applicants = cursor.fetchall()

# #         return {
# #             "message": "Applicants retrieved successfully",
# #             "applicants": [dict(applicant) for applicant in applicants]
# #         }

# #     finally:
# #         connection.close()


# # # 6. Update an applicant's status
# # @router.patch("/api/recruiters/me/applications/{application_id}/status")
# # def update_applicant_status(
# #     application_id: int,
# #     data: ApplicationStatusUpdate,
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     allowed_statuses = {"shortlisted", "rejected", "accepted"}

# #     if data.status not in allowed_statuses:
# #         raise HTTPException(status_code=400, detail="Invalid application status")

# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 SELECT a.application_id
# #                 FROM applications a
# #                 JOIN jobs j ON j.job_id = a.job_id
# #                 WHERE a.application_id = %s
# #                   AND j.recruiter_id = %s;
# #             """, (application_id, current_user["user_id"]))

# #             if not cursor.fetchone():
# #                 raise HTTPException(status_code=404, detail="Application not found")

# #             cursor.execute("""
# #                 UPDATE applications
# #                 SET status = %s
# #                 WHERE application_id = %s
# #                   AND status IN ('pending', 'shortlisted')
# #                 RETURNING application_id, job_id, student_id, status;
# #             """, (data.status, application_id))

# #             updated_application = cursor.fetchone()

# #             if not updated_application:
# #                 raise HTTPException(
# #                     status_code=409,
# #                     detail="Application cannot be updated from its current status"
# #                 )

# #         connection.commit()

# #         return {
# #             "message": "Application status updated successfully",
# #             "application": dict(updated_application)
# #         }

# #     except Exception:
# #         connection.rollback()
# #         raise

# #     finally:
# #         connection.close()

# # # 7. Pause, reopen or close a job posting
# # @router.patch("/api/recruiters/me/jobs/{job_id}/status")
# # def update_job_status(
# #     job_id: int,
# #     data: dict,
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     new_status = data.get("status")

# #     if new_status not in {"open", "paused", "closed"}:
# #         raise HTTPException(
# #             status_code=400,
# #             detail="Status must be open, paused or closed"
# #         )

# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
# #             cursor.execute("""
# #                 UPDATE jobs
# #                 SET status = %s
# #                 WHERE job_id = %s
# #                   AND recruiter_id = %s
# #                 RETURNING job_id, title, status;
# #             """, (
# #                 new_status,
# #                 job_id,
# #                 current_user["user_id"]
# #             ))

# #             job = cursor.fetchone()

# #             if not job:
# #                 raise HTTPException(
# #                     status_code=404,
# #                     detail="Job not found"
# #                 )

# #         connection.commit()

# #         return {
# #             "message": "Job status updated successfully",
# #             "job": dict(job)
# #         }

# #     except Exception:
# #         connection.rollback()
# #         raise

# #     finally:
# #         connection.close()


# # # 8. Recruiter dashboard statistics
# # @router.get("/api/recruiters/me/dashboard")
# # def get_recruiter_dashboard(
# #     current_user: dict = Depends(get_current_recruiter)
# # ):
# #     connection = get_db_connection()

# #     try:
# #         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

# #             # Overall job statistics
# #             cursor.execute("""
# #                 SELECT
# #                     COUNT(*) AS total_jobs,
# #                     COUNT(*) FILTER (
# #                         WHERE status = 'open'
# #                     ) AS open_jobs,
# #                     COUNT(*) FILTER (
# #                         WHERE status = 'closed'
# #                     ) AS closed_jobs,
# #                     COUNT(*) FILTER (
# #                         WHERE status = 'paused'
# #                     ) AS paused_jobs
# #                 FROM jobs
# #                 WHERE recruiter_id = %s;
# #             """, (current_user["user_id"],))

# #             job_stats = cursor.fetchone()

# #             # Application statistics for this recruiter's jobs
# #             cursor.execute("""
# #                 SELECT
# #                     COUNT(a.application_id) AS total_applications,
# #                     COUNT(a.application_id) FILTER (
# #                         WHERE a.status = 'pending'
# #                     ) AS pending_applications,
# #                     COUNT(a.application_id) FILTER (
# #                         WHERE a.status = 'shortlisted'
# #                     ) AS shortlisted_applications,
# #                     COUNT(a.application_id) FILTER (
# #                         WHERE a.status = 'accepted'
# #                     ) AS accepted_applications,
# #                     COUNT(a.application_id) FILTER (
# #                         WHERE a.status = 'rejected'
# #                     ) AS rejected_applications,
# #                     COUNT(a.application_id) FILTER (
# #                         WHERE a.status = 'withdrawn'
# #                     ) AS withdrawn_applications
# #                 FROM jobs j
# #                 LEFT JOIN applications a ON a.job_id = j.job_id
# #                 WHERE j.recruiter_id = %s;
# #             """, (current_user["user_id"],))

# #             application_stats = cursor.fetchone()

# #             # Applicant count for each job
# #             cursor.execute("""
# #                 SELECT
# #                     j.job_id,
# #                     j.title,
# #                     j.status,
# #                     COUNT(a.application_id) AS applicant_count
# #                 FROM jobs j
# #                 LEFT JOIN applications a ON a.job_id = j.job_id
# #                 WHERE j.recruiter_id = %s
# #                 GROUP BY j.job_id
# #                 ORDER BY applicant_count DESC, j.job_id DESC;
# #             """, (current_user["user_id"],))

# #             job_applicant_stats = cursor.fetchall()

# #         return {
# #             "message": "Recruiter dashboard retrieved successfully",
# #             "jobs": dict(job_stats),
# #             "applications": dict(application_stats),
# #             "job_wise_applicants": [
# #                 dict(row) for row in job_applicant_stats
# #             ]
# #         }

# #     finally:
# #         connection.close()



# from datetime import date
# from typing import Optional

# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel, Field
# from psycopg2 import Error as PsycopgError
# from psycopg2.extras import RealDictCursor

# from app.database import get_db_connection
# from app.security import get_current_recruiter
# from app.services.embeddings import (
#     generate_embedding,
#     embedding_to_pgvector
# )

# router = APIRouter(tags=["Recruiter"])


# # ============================================================
# # EMBEDDING HELPER
# # ============================================================

# def generate_and_save_job_embedding(cursor, job_id: int):
#     """
#     Generate or update the semantic embedding for an internship.
#     """

#     cursor.execute(
#         """
#         SELECT title, description, location
#         FROM jobs
#         WHERE job_id = %s;
#         """,
#         (job_id,)
#     )

#     job = cursor.fetchone()

#     if not job:
#         return

#     title = job["title"]
#     description = job["description"]
#     location = job["location"]

#     job_text = f"""
#     Internship Title: {title or ''}
#     Description: {description or ''}
#     Location: {location or ''}
#     """

#     embedding = generate_embedding(job_text)
#     vector_value = embedding_to_pgvector(embedding)

#     cursor.execute(
#         """
#         INSERT INTO job_embeddings
#             (job_id, embedding, model_name, updated_at)
#         VALUES
#             (%s, %s::vector, %s, CURRENT_TIMESTAMP)
#         ON CONFLICT (job_id)
#         DO UPDATE SET
#             embedding = EXCLUDED.embedding,
#             model_name = EXCLUDED.model_name,
#             updated_at = CURRENT_TIMESTAMP;
#         """,
#         (
#             job_id,
#             vector_value,
#             "all-MiniLM-L6-v2"
#         )
#     )


# # ============================================================
# # REQUEST MODELS
# # ============================================================

# class JobCreate(BaseModel):
#     title: str = Field(min_length=2, max_length=150)
#     description: Optional[str] = None
#     location: Optional[str] = None
#     deadline: date


# class JobUpdate(BaseModel):
#     title: Optional[str] = Field(default=None, min_length=2, max_length=150)
#     description: Optional[str] = None
#     location: Optional[str] = None
#     deadline: Optional[date] = None
#     status: Optional[str] = None


# class ApplicationStatusUpdate(BaseModel):
#     status: str


# # ============================================================
# # 1. RECRUITER'S COMPANY PROFILE
# # ============================================================

# @router.get("/api/recruiters/me/company")
# def get_my_company(
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute(
#                 """
#                 SELECT
#                     c.company_id,
#                     c.company_name,
#                     c.industry,
#                     c.location,
#                     r.recruiter_id,
#                     r.name AS recruiter_name,
#                     r.email
#                 FROM recruiters r
#                 JOIN companies c
#                     ON c.company_id = r.company_id
#                 WHERE r.recruiter_id = %s;
#                 """,
#                 (current_user["user_id"],)
#             )

#             company = cursor.fetchone()

#         if not company:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Company not found"
#             )

#         return {"company": dict(company)}

#     finally:
#         connection.close()


# # ============================================================
# # 2. CREATE AN INTERNSHIP
# #    Automatically generates and stores job embedding
# # ============================================================

# @router.post("/api/recruiters/me/jobs", status_code=201)
# def create_job(
#     data: JobCreate,
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

#             # Retrieve recruiter's company ID from database
#             cursor.execute(
#                 """
#                 SELECT company_id
#                 FROM recruiters
#                 WHERE recruiter_id = %s;
#                 """,
#                 (current_user["user_id"],)
#             )

#             recruiter = cursor.fetchone()

#             if not recruiter:
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Recruiter not found"
#                 )

#             company_id = recruiter["company_id"]

#             # Create internship using stored procedure
#             cursor.execute(
#                 """
#                 CALL add_internship(
#                     %s, %s, %s, %s, %s, %s
#                 );
#                 """,
#                 (
#                     current_user["user_id"],
#                     company_id,
#                     data.title,
#                     data.description,
#                     data.location,
#                     data.deadline
#                 )
#             )

#             # Retrieve the newly created internship
#             cursor.execute(
#                 """
#                 SELECT
#                     job_id,
#                     title,
#                     description,
#                     location,
#                     deadline,
#                     status
#                 FROM jobs
#                 WHERE recruiter_id = %s
#                 ORDER BY job_id DESC
#                 LIMIT 1;
#                 """,
#                 (current_user["user_id"],)
#             )

#             job = cursor.fetchone()

#             if not job:
#                 raise HTTPException(
#                     status_code=500,
#                     detail="Created job could not be retrieved"
#                 )

#             # Automatically generate and save embedding
#             generate_and_save_job_embedding(
#                 cursor,
#                 job["job_id"]
#             )

#         connection.commit()

#         return {
#             "message": "Internship created successfully",
#             "job": dict(job)
#         }

#     except PsycopgError as exc:
#         connection.rollback()

#         if exc.pgcode == "P0001":
#             raise HTTPException(
#                 status_code=400,
#                 detail=str(exc).strip()
#             )

#         raise HTTPException(
#             status_code=500,
#             detail="Could not create job"
#         )

#     finally:
#         connection.close()


# # ============================================================
# # 3. VIEW JOBS POSTED BY THIS RECRUITER
# # ============================================================

# @router.get("/api/recruiters/me/jobs")
# def get_my_jobs(
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute(
#                 """
#                 SELECT
#                     j.job_id,
#                     j.title,
#                     j.description,
#                     j.location,
#                     j.deadline,
#                     j.status,
#                     COUNT(a.application_id) AS applicant_count
#                 FROM jobs j
#                 LEFT JOIN applications a
#                     ON a.job_id = j.job_id
#                 WHERE j.recruiter_id = %s
#                 GROUP BY j.job_id
#                 ORDER BY j.job_id DESC;
#                 """,
#                 (current_user["user_id"],)
#             )

#             jobs = cursor.fetchall()

#         return {
#             "message": "Recruiter jobs retrieved successfully",
#             "jobs": [dict(job) for job in jobs]
#         }

#     finally:
#         connection.close()


# # ============================================================
# # 4. UPDATE A JOB
# #    Regenerates embedding if semantic details change
# # ============================================================

# @router.patch("/api/recruiters/me/jobs/{job_id}")
# def update_job(
#     job_id: int,
#     data: JobUpdate,
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     changes = data.model_dump(exclude_unset=True)

#     if not changes:
#         raise HTTPException(
#             status_code=400,
#             detail="No fields provided"
#         )

#     allowed_fields = {
#         "title",
#         "description",
#         "location",
#         "deadline",
#         "status"
#     }

#     if not set(changes).issubset(allowed_fields):
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid fields"
#         )

#     if changes.get("status") not in (None, "open", "closed", "paused"):
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid job status"
#         )

#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

#             # Verify job ownership
#             cursor.execute(
#                 """
#                 SELECT job_id
#                 FROM jobs
#                 WHERE job_id = %s
#                   AND recruiter_id = %s;
#                 """,
#                 (job_id, current_user["user_id"])
#             )

#             if not cursor.fetchone():
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Job not found"
#                 )

#             set_clause = ", ".join(
#                 f"{field} = %s" for field in changes
#             )

#             values = list(changes.values()) + [
#                 job_id,
#                 current_user["user_id"]
#             ]

#             cursor.execute(
#                 f"""
#                 UPDATE jobs
#                 SET {set_clause}
#                 WHERE job_id = %s
#                   AND recruiter_id = %s
#                 RETURNING
#                     job_id,
#                     title,
#                     description,
#                     location,
#                     deadline,
#                     status;
#                 """,
#                 values
#             )

#             updated_job = cursor.fetchone()

#             # Regenerate embedding only when relevant details change
#             semantic_fields = {
#                 "title",
#                 "description",
#                 "location"
#             }

#             if semantic_fields.intersection(changes.keys()):
#                 generate_and_save_job_embedding(
#                     cursor,
#                     job_id
#                 )

#         connection.commit()

#         return {
#             "message": "Job updated successfully",
#             "job": dict(updated_job)
#         }

#     except PsycopgError:
#         connection.rollback()

#         raise HTTPException(
#             status_code=400,
#             detail="Could not update job"
#         )

#     finally:
#         connection.close()


# # ============================================================
# # 5. VIEW APPLICANTS FOR A JOB
# # ============================================================

# @router.get("/api/recruiters/me/jobs/{job_id}/applicants")
# def get_job_applicants(
#     job_id: int,
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

#             # Verify job ownership
#             cursor.execute(
#                 """
#                 SELECT job_id
#                 FROM jobs
#                 WHERE job_id = %s
#                   AND recruiter_id = %s;
#                 """,
#                 (job_id, current_user["user_id"])
#             )

#             if not cursor.fetchone():
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Job not found"
#                 )

#             cursor.execute(
#                 """
#                 SELECT
#                     a.application_id,
#                     a.status AS application_status,
#                     a.applied_at,
#                     s.student_id,
#                     s.name AS student_name,
#                     s.email,
#                     s.department,
#                     s.graduation_year,
#                     s.resume_url
#                 FROM applications a
#                 JOIN students s
#                     ON s.student_id = a.student_id
#                 WHERE a.job_id = %s
#                 ORDER BY a.applied_at DESC;
#                 """,
#                 (job_id,)
#             )

#             applicants = cursor.fetchall()

#         return {
#             "message": "Applicants retrieved successfully",
#             "applicants": [
#                 dict(applicant) for applicant in applicants
#             ]
#         }

#     finally:
#         connection.close()


# # ============================================================
# # 6. UPDATE AN APPLICANT'S STATUS
# # ============================================================

# @router.patch("/api/recruiters/me/applications/{application_id}/status")
# def update_applicant_status(
#     application_id: int,
#     data: ApplicationStatusUpdate,
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     allowed_statuses = {
#         "shortlisted",
#         "rejected",
#         "accepted"
#     }

#     if data.status not in allowed_statuses:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid application status"
#         )

#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

#             # Verify application belongs to recruiter's job
#             cursor.execute(
#                 """
#                 SELECT a.application_id
#                 FROM applications a
#                 JOIN jobs j
#                     ON j.job_id = a.job_id
#                 WHERE a.application_id = %s
#                   AND j.recruiter_id = %s;
#                 """,
#                 (application_id, current_user["user_id"])
#             )

#             if not cursor.fetchone():
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Application not found"
#                 )

#             cursor.execute(
#                 """
#                 UPDATE applications
#                 SET status = %s
#                 WHERE application_id = %s
#                   AND status IN ('pending', 'shortlisted')
#                 RETURNING
#                     application_id,
#                     job_id,
#                     student_id,
#                     status;
#                 """,
#                 (data.status, application_id)
#             )

#             updated_application = cursor.fetchone()

#             if not updated_application:
#                 raise HTTPException(
#                     status_code=409,
#                     detail="Application cannot be updated from its current status"
#                 )

#         connection.commit()

#         return {
#             "message": "Application status updated successfully",
#             "application": dict(updated_application)
#         }

#     except Exception:
#         connection.rollback()
#         raise

#     finally:
#         connection.close()


# # ============================================================
# # 7. PAUSE, REOPEN OR CLOSE A JOB
# # ============================================================

# @router.patch("/api/recruiters/me/jobs/{job_id}/status")
# def update_job_status(
#     job_id: int,
#     data: dict,
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     new_status = data.get("status")

#     if new_status not in {"open", "paused", "closed"}:
#         raise HTTPException(
#             status_code=400,
#             detail="Status must be open, paused or closed"
#         )

#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute(
#                 """
#                 UPDATE jobs
#                 SET status = %s
#                 WHERE job_id = %s
#                   AND recruiter_id = %s
#                 RETURNING job_id, title, status;
#                 """,
#                 (
#                     new_status,
#                     job_id,
#                     current_user["user_id"]
#                 )
#             )

#             job = cursor.fetchone()

#             if not job:
#                 raise HTTPException(
#                     status_code=404,
#                     detail="Job not found"
#                 )

#         connection.commit()

#         return {
#             "message": "Job status updated successfully",
#             "job": dict(job)
#         }

#     except Exception:
#         connection.rollback()
#         raise

#     finally:
#         connection.close()


# # ============================================================
# # 8. RECRUITER DASHBOARD STATISTICS
# # ============================================================

# @router.get("/api/recruiters/me/dashboard")
# def get_recruiter_dashboard(
#     current_user: dict = Depends(get_current_recruiter)
# ):
#     connection = get_db_connection()

#     try:
#         with connection.cursor(cursor_factory=RealDictCursor) as cursor:

#             # Overall job statistics
#             cursor.execute(
#                 """
#                 SELECT
#                     COUNT(*) AS total_jobs,
#                     COUNT(*) FILTER (
#                         WHERE status = 'open'
#                     ) AS open_jobs,
#                     COUNT(*) FILTER (
#                         WHERE status = 'closed'
#                     ) AS closed_jobs,
#                     COUNT(*) FILTER (
#                         WHERE status = 'paused'
#                     ) AS paused_jobs
#                 FROM jobs
#                 WHERE recruiter_id = %s;
#                 """,
#                 (current_user["user_id"],)
#             )

#             job_stats = cursor.fetchone()

#             # Application statistics
#             cursor.execute(
#                 """
#                 SELECT
#                     COUNT(a.application_id) AS total_applications,

#                     COUNT(a.application_id) FILTER (
#                         WHERE a.status = 'pending'
#                     ) AS pending_applications,

#                     COUNT(a.application_id) FILTER (
#                         WHERE a.status = 'shortlisted'
#                     ) AS shortlisted_applications,

#                     COUNT(a.application_id) FILTER (
#                         WHERE a.status = 'accepted'
#                     ) AS accepted_applications,

#                     COUNT(a.application_id) FILTER (
#                         WHERE a.status = 'rejected'
#                     ) AS rejected_applications,

#                     COUNT(a.application_id) FILTER (
#                         WHERE a.status = 'withdrawn'
#                     ) AS withdrawn_applications

#                 FROM jobs j
#                 LEFT JOIN applications a
#                     ON a.job_id = j.job_id
#                 WHERE j.recruiter_id = %s;
#                 """,
#                 (current_user["user_id"],)
#             )

#             application_stats = cursor.fetchone()

#             # Applicant count for each job
#             cursor.execute(
#                 """
#                 SELECT
#                     j.job_id,
#                     j.title,
#                     j.status,
#                     COUNT(a.application_id) AS applicant_count
#                 FROM jobs j
#                 LEFT JOIN applications a
#                     ON a.job_id = j.job_id
#                 WHERE j.recruiter_id = %s
#                 GROUP BY j.job_id
#                 ORDER BY applicant_count DESC, j.job_id DESC;
#                 """,
#                 (current_user["user_id"],)
#             )

#             job_applicant_stats = cursor.fetchall()

#         return {
#             "message": "Recruiter dashboard retrieved successfully",
#             "jobs": dict(job_stats),
#             "applications": dict(application_stats),
#             "job_wise_applicants": [
#                 dict(row) for row in job_applicant_stats
#             ]
#         }

#     finally:
#         connection.close()


from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from psycopg2 import Error as PsycopgError
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.security import get_current_recruiter
from app.services.embeddings import (
    generate_embedding,
    embedding_to_pgvector,
    MODEL_NAME
)
router = APIRouter(tags=["Recruiter"])


# ============================================================
# EMBEDDING HELPER
# ============================================================

def generate_and_save_job_embedding(cursor, job_id: int):
    """Generate or update the semantic embedding for an internship."""

    cursor.execute(
        """
        SELECT title, description, location
        FROM jobs
        WHERE job_id = %s;
        """,
        (job_id,)
    )

    job = cursor.fetchone()

    if not job:
        return

    job_text = f"""
    Internship Title: {job['title'] or ''}
    Description: {job['description'] or ''}
    Location: {job['location'] or ''}
    """

    embedding = generate_embedding(job_text)
    vector_value = embedding_to_pgvector(embedding)

    cursor.execute(
        """
        INSERT INTO job_embeddings
            (job_id, embedding, model_name, updated_at)
        VALUES
            (%s, %s::vector, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (job_id)
        DO UPDATE SET
            embedding = EXCLUDED.embedding,
            model_name = EXCLUDED.model_name,
            updated_at = CURRENT_TIMESTAMP;
        """,
        (job_id, vector_value, MODEL_NAME)
    )


# ============================================================
# REQUEST MODELS
# ============================================================

class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: Optional[str] = None
    location: Optional[str] = None
    deadline: date


class JobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str


# ============================================================
# 1. RECRUITER COMPANY PROFILE
# ============================================================

@router.get("/api/recruiters/me/company")
def get_my_company(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    c.company_id,
                    c.company_name,
                    c.industry,
                    c.location,
                    r.recruiter_id,
                    r.name AS recruiter_name,
                    r.email
                FROM recruiters r
                JOIN companies c
                    ON c.company_id = r.company_id
                WHERE r.recruiter_id = %s;
            """, (current_user["user_id"],))

            company = cursor.fetchone()

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        return {"company": dict(company)}

    finally:
        connection.close()

# ============================================================
# 2. CREATE INTERNSHIP + AUTOMATIC EMBEDDING
# ============================================================

@router.post("/api/recruiters/me/jobs", status_code=201)
def create_job(
    data: JobCreate,
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute("""
                SELECT company_id
                FROM recruiters
                WHERE recruiter_id = %s;
            """, (current_user["user_id"],))

            recruiter = cursor.fetchone()

            if not recruiter:
                raise HTTPException(
                    status_code=404,
                    detail="Recruiter not found"
                )

            cursor.execute("""
                CALL add_internship(%s, %s, %s, %s, %s, %s);
            """, (
                current_user["user_id"],
                recruiter["company_id"],
                data.title,
                data.description,
                data.location,
                data.deadline
            ))

            # Get the exact job ID generated by this database session.
            cursor.execute("""
                SELECT currval(
                    pg_get_serial_sequence('jobs', 'job_id')
                ) AS job_id;
            """)

            job_id = cursor.fetchone()["job_id"]

            cursor.execute("""
                SELECT
                    job_id,
                    title,
                    description,
                    location,
                    deadline,
                    status
                FROM jobs
                WHERE job_id = %s;
            """, (job_id,))

            job = cursor.fetchone()

            if not job:
                raise HTTPException(
                    status_code=500,
                    detail="Created job could not be retrieved"
                )

            # Generate and store the job's semantic embedding.
            generate_and_save_job_embedding(cursor, job_id)

        connection.commit()

        return {
            "message": "Internship created successfully",
            "job": dict(job)
        }

    except PsycopgError as exc:
        connection.rollback()

        if exc.pgcode == "P0001":
            raise HTTPException(
                status_code=400,
                detail=str(exc).strip()
            )

        raise HTTPException(
            status_code=500,
            detail="Could not create job"
        )

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# ============================================================
# 3. VIEW RECRUITER'S JOBS
# ============================================================

@router.get("/api/recruiters/me/jobs")
def get_my_jobs(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    j.job_id,
                    j.title,
                    j.description,
                    j.location,
                    j.deadline,
                    j.status,
                    COUNT(a.application_id) AS applicant_count
                FROM jobs j
                LEFT JOIN applications a ON a.job_id = j.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.job_id
                ORDER BY j.job_id DESC;
                """,
                (current_user["user_id"],)
            )

            jobs = cursor.fetchall()

        return {
            "message": "Recruiter jobs retrieved successfully",
            "jobs": [dict(job) for job in jobs]
        }

    finally:
        connection.close()


# ============================================================
# 4. UPDATE INTERNSHIP + REGENERATE EMBEDDING
# ============================================================

@router.patch("/api/recruiters/me/jobs/{job_id}")
def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: dict = Depends(get_current_recruiter)
):
    changes = data.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="No fields provided"
        )

    allowed_fields = {
        "title", "description", "location", "deadline", "status"
    }

    if not set(changes).issubset(allowed_fields):
        raise HTTPException(
            status_code=400,
            detail="Invalid fields"
        )

    if changes.get("status") not in (None, "open", "closed", "paused"):
        raise HTTPException(
            status_code=400,
            detail="Invalid job status"
        )

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute("""
                SELECT
                    deadline,
                    CURRENT_DATE AS today
                FROM jobs
                WHERE job_id = %s
                  AND recruiter_id = %s;
            """, (job_id, current_user["user_id"]))

            existing_job = cursor.fetchone()

            if not existing_job:
                raise HTTPException(
                    status_code=404,
                    detail="Job not found"
                )

            effective_deadline = changes.get(
                "deadline",
                existing_job["deadline"]
            )

            if (
                changes.get("status") == "open"
                and effective_deadline is not None
                and effective_deadline < existing_job["today"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail="An expired internship cannot be reopened"
                )

            set_clause = ", ".join(
                f"{field} = %s" for field in changes
            )

            values = list(changes.values()) + [
                job_id,
                current_user["user_id"]
            ]

            cursor.execute(f"""
                UPDATE jobs
                SET {set_clause}
                WHERE job_id = %s
                  AND recruiter_id = %s
                RETURNING
                    job_id,
                    title,
                    description,
                    location,
                    deadline,
                    status;
            """, values)

            updated_job = cursor.fetchone()

            if {"title", "description", "location"}.intersection(changes):
                generate_and_save_job_embedding(cursor, job_id)

        connection.commit()

        return {
            "message": "Job updated successfully",
            "job": dict(updated_job)
        }

    except HTTPException:
        connection.rollback()
        raise

    except PsycopgError:
        connection.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not update job"
        )

    finally:
        connection.close()


# ============================================================
# 5. VIEW APPLICANTS FOR A JOB
# ============================================================

@router.get("/api/recruiters/me/jobs/{job_id}/applicants")
def get_job_applicants(
    job_id: int,
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                SELECT job_id
                FROM jobs
                WHERE job_id = %s AND recruiter_id = %s;
                """,
                (job_id, current_user["user_id"])
            )

            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Job not found")

            cursor.execute(
                """
                SELECT
                    a.application_id,
                    a.status AS application_status,
                    a.applied_at,
                    s.student_id,
                    s.name AS student_name,
                    s.email,
                    s.department,
                    s.graduation_year,
                    s.resume_url
                FROM applications a
                JOIN students s ON s.student_id = a.student_id
                WHERE a.job_id = %s
                ORDER BY a.applied_at DESC;
                """,
                (job_id,)
            )

            applicants = cursor.fetchall()

        return {
            "message": "Applicants retrieved successfully",
            "applicants": [dict(row) for row in applicants]
        }

    finally:
        connection.close()


# ============================================================
# 6. UPDATE APPLICANT STATUS
# ============================================================

@router.patch("/api/recruiters/me/applications/{application_id}/status")
def update_applicant_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_recruiter)
):
    allowed_statuses = {"shortlisted", "rejected", "accepted"}

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status"
        )

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                SELECT a.application_id
                FROM applications a
                JOIN jobs j ON j.job_id = a.job_id
                WHERE a.application_id = %s
                  AND j.recruiter_id = %s;
                """,
                (application_id, current_user["user_id"])
            )

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=404,
                    detail="Application not found"
                )

            cursor.execute(
                """
                UPDATE applications
                SET status = %s
                WHERE application_id = %s
                  AND status IN ('pending', 'shortlisted')
                RETURNING application_id, job_id, student_id, status;
                """,
                (data.status, application_id)
            )

            application = cursor.fetchone()

            if not application:
                raise HTTPException(
                    status_code=409,
                    detail="Application cannot be updated from its current status"
                )

        connection.commit()

        return {
            "message": "Application status updated successfully",
            "application": dict(application)
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# ============================================================
# 7. PAUSE, REOPEN OR CLOSE A JOB
# ============================================================

@router.patch("/api/recruiters/me/jobs/{job_id}/status")
def update_job_status(
    job_id: int,
    data: dict,
    current_user: dict = Depends(get_current_recruiter)
):
    new_status = data.get("status")

    if new_status not in {"open", "paused", "closed"}:
        raise HTTPException(
            status_code=400,
            detail="Status must be open, paused or closed"
        )

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute("""
                SELECT
                    deadline,
                    CURRENT_DATE AS today
                FROM jobs
                WHERE job_id = %s
                  AND recruiter_id = %s;
            """, (job_id, current_user["user_id"]))

            existing_job = cursor.fetchone()

            if not existing_job:
                raise HTTPException(
                    status_code=404,
                    detail="Job not found"
                )

            if (
                new_status == "open"
                and existing_job["deadline"] is not None
                and existing_job["deadline"] < existing_job["today"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail="An expired internship cannot be reopened"
                )

            cursor.execute("""
                UPDATE jobs
                SET status = %s
                WHERE job_id = %s
                  AND recruiter_id = %s
                  AND (
                      %s <> 'open'
                      OR deadline IS NULL
                      OR deadline >= CURRENT_DATE
                  )
                RETURNING job_id, title, status;
            """, (
                new_status,
                job_id,
                current_user["user_id"],
                new_status
            ))

            job = cursor.fetchone()

            if not job:
                raise HTTPException(
                    status_code=400,
                    detail="An expired internship cannot be reopened"
                )

        connection.commit()

        return {
            "message": "Job status updated successfully",
            "job": dict(job)
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# ============================================================
# 8. RECRUITER DASHBOARD
# ============================================================

@router.get("/api/recruiters/me/dashboard")
def get_recruiter_dashboard(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            cursor.execute(
                """
                SELECT
                    COUNT(*) AS total_jobs,
                    COUNT(*) FILTER (WHERE status = 'open') AS open_jobs,
                    COUNT(*) FILTER (WHERE status = 'closed') AS closed_jobs,
                    COUNT(*) FILTER (WHERE status = 'paused') AS paused_jobs
                FROM jobs
                WHERE recruiter_id = %s;
                """,
                (current_user["user_id"],)
            )

            job_stats = cursor.fetchone()

            cursor.execute(
                """
                SELECT
                    COUNT(a.application_id) AS total_applications,
                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'pending'
                    ) AS pending_applications,
                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'shortlisted'
                    ) AS shortlisted_applications,
                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'accepted'
                    ) AS accepted_applications,
                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'rejected'
                    ) AS rejected_applications,
                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'withdrawn'
                    ) AS withdrawn_applications
                FROM jobs j
                LEFT JOIN applications a ON a.job_id = j.job_id
                WHERE j.recruiter_id = %s;
                """,
                (current_user["user_id"],)
            )

            application_stats = cursor.fetchone()

            cursor.execute(
                """
                SELECT
                    j.job_id,
                    j.title,
                    j.status,
                    COUNT(a.application_id) AS applicant_count
                FROM jobs j
                LEFT JOIN applications a ON a.job_id = j.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.job_id
                ORDER BY applicant_count DESC, j.job_id DESC;
                """,
                (current_user["user_id"],)
            )

            job_applicant_stats = cursor.fetchall()

        return {
            "message": "Recruiter dashboard retrieved successfully",
            "jobs": dict(job_stats),
            "applications": dict(application_stats),
            "job_wise_applicants": [dict(row) for row in job_applicant_stats]
        }

    finally:
        connection.close()


# ============================================================
# 9. APPLICATIONS GROUPED BY STATUS
# ============================================================

@router.get("/api/recruiters/me/analytics/applications")
def get_application_analytics(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    a.status,
                    COUNT(*) AS application_count,
                    ROUND(
                        COUNT(*) * 100.0 /
                        NULLIF(SUM(COUNT(*)) OVER (), 0),
                        2
                    ) AS percentage
                FROM applications a
                JOIN jobs j ON j.job_id = a.job_id
                WHERE j.recruiter_id = %s
                GROUP BY a.status
                ORDER BY application_count DESC;
                """,
                (current_user["user_id"],)
            )

            results = cursor.fetchall()

        return {
            "message": "Application analytics retrieved successfully",
            "analytics": [dict(row) for row in results]
        }

    finally:
        connection.close()


# ============================================================
# 10. JOB-WISE APPLICATION ANALYTICS
# ============================================================

@router.get("/api/recruiters/me/analytics/jobs")
def get_job_analytics(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    j.job_id,
                    j.title,
                    j.status,
                    COUNT(a.application_id) AS total_applications,

                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'pending'
                    ) AS pending,

                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'shortlisted'
                    ) AS shortlisted,

                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'accepted'
                    ) AS accepted,

                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'rejected'
                    ) AS rejected,

                    COUNT(a.application_id) FILTER (
                        WHERE a.status = 'withdrawn'
                    ) AS withdrawn

                FROM jobs j
                LEFT JOIN applications a ON a.job_id = j.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.job_id
                ORDER BY total_applications DESC, j.job_id DESC;
                """,
                (current_user["user_id"],)
            )

            results = cursor.fetchall()

        return {
            "message": "Job analytics retrieved successfully",
            "analytics": [dict(row) for row in results]
        }

    finally:
        connection.close()


# ============================================================
# 11. APPLICATION TRENDS - LAST 30 DAYS
# ============================================================

@router.get("/api/recruiters/me/analytics/trends")
def get_application_trends(
    current_user: dict = Depends(get_current_recruiter)
):
    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    dates.application_date,
                    COUNT(a.application_id) AS application_count
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '29 days',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                ) AS dates(application_date)
                LEFT JOIN jobs j
                    ON j.recruiter_id = %s
                LEFT JOIN applications a
                    ON a.job_id = j.job_id
                    AND a.applied_at >= dates.application_date
                    AND a.applied_at < dates.application_date + INTERVAL '1 day'
                GROUP BY dates.application_date
                ORDER BY dates.application_date;
                """,
                (current_user["user_id"],)
            )

            results = cursor.fetchall()

        return {
            "message": "Application trends retrieved successfully",
            "period": "Last 30 days",
            "trends": [dict(row) for row in results]
        }

    finally:
        connection.close()
