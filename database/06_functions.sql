
-- ============================================================
-- INTERNLY PROJECT
-- File: 06_functions.sql
-- Purpose: User-defined PostgreSQL functions
-- Database: internly_db
-- ============================================================


-- ============================================================
-- FUNCTION 1: COUNT STUDENT APPLICATIONS
-- Purpose: Returns the total applications submitted by a student.
-- ============================================================

CREATE OR REPLACE FUNCTION get_student_application_count(
    p_student_id INTEGER
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM applications
    WHERE student_id = p_student_id;
$$;


-- ============================================================
-- FUNCTION 2: COUNT JOB APPLICATIONS
-- Purpose: Returns the number of applications received by a job.
-- ============================================================

CREATE OR REPLACE FUNCTION get_job_application_count(
    p_job_id INTEGER
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM applications
    WHERE job_id = p_job_id;
$$;


-- ============================================================
-- FUNCTION 3: COUNT MATCHING SKILLS
-- Purpose: Counts how many required job skills match
--          a particular student's skills.
-- ============================================================

CREATE OR REPLACE FUNCTION get_matching_skill_count(
    p_student_id INTEGER,
    p_job_id INTEGER
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM student_skills ss
    INNER JOIN job_skills js
        ON ss.skill_id = js.skill_id
    WHERE ss.student_id = p_student_id
      AND js.job_id = p_job_id;
$$;


-- ============================================================
-- FUNCTION 4: RECOMMEND INTERNSHIPS
-- Purpose: Recommends open jobs based on matching student skills.
--          Jobs already applied to are excluded.
-- ============================================================

CREATE OR REPLACE FUNCTION get_matching_jobs(
    p_student_id INTEGER
)
RETURNS TABLE (
    recommended_job_id INTEGER,
    job_title VARCHAR(150),
    company_name VARCHAR(150),
    matched_skill_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
    SELECT
        j.job_id,
        j.title,
        c.company_name,
        COUNT(js.skill_id)::BIGINT
    FROM jobs j
    INNER JOIN companies c
        ON j.company_id = c.company_id
    INNER JOIN job_skills js
        ON j.job_id = js.job_id
    INNER JOIN student_skills ss
        ON js.skill_id = ss.skill_id
    WHERE ss.student_id = p_student_id
      AND j.status = 'open'
      AND (
          j.deadline IS NULL
          OR j.deadline >= CURRENT_DATE
      )
      AND NOT EXISTS (
          SELECT 1
          FROM applications a
          WHERE a.student_id = p_student_id
            AND a.job_id = j.job_id
      )
    GROUP BY
        j.job_id,
        j.title,
        c.company_name
    ORDER BY
        COUNT(js.skill_id) DESC,
        j.job_id;
$$;

-- ============================================================
-- FUNCTION 5: ACCEPTANCE PERCENTAGE
-- Purpose: Calculates the percentage of a student's
--          applications that have been accepted.
-- ============================================================

CREATE OR REPLACE FUNCTION get_student_acceptance_percentage(
    p_student_id INTEGER
)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(
        ROUND(
            COUNT(*) FILTER (
                WHERE status = 'accepted'
            ) * 100.0 /
            NULLIF(COUNT(*), 0),
            2
        ),
        0
    )
    FROM applications
    WHERE student_id = p_student_id;
$$;


-- ============================================================
-- END OF FUNCTIONS
-- ============================================================
