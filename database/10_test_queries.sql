
-- =========================================================
-- INTERNLY DBMS PROJECT
-- File: 10_test_queries.sql
-- Purpose: Final database verification and testing
-- Database: PostgreSQL
-- =========================================================

-- ---------------------------------------------------------
-- 1. CHECK DATABASE CONNECTION
-- ---------------------------------------------------------

SELECT
    current_database() AS database_name,
    current_user AS connected_user,
    version() AS postgresql_version;


-- ---------------------------------------------------------
-- 2. CHECK ALL 10 CORE TABLES
-- ---------------------------------------------------------

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
      'companies',
      'recruiters',
      'students',
      'jobs',
      'applications',
      'skills',
      'student_skills',
      'job_skills',
      'certifications',
      'student_certifications'
  )
ORDER BY table_name;

-- Count core tables
SELECT COUNT(*) AS total_core_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
      'companies', 'recruiters', 'students', 'jobs',
      'applications', 'skills', 'student_skills',
      'job_skills', 'certifications', 'student_certifications'
  );


-- ---------------------------------------------------------
-- 3. CHECK RECORD COUNTS IN ALL CORE TABLES
-- ---------------------------------------------------------

SELECT 'companies' AS table_name, COUNT(*) AS total_records FROM companies
UNION ALL
SELECT 'recruiters', COUNT(*) FROM recruiters
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'skills', COUNT(*) FROM skills
UNION ALL
SELECT 'student_skills', COUNT(*) FROM student_skills
UNION ALL
SELECT 'job_skills', COUNT(*) FROM job_skills
UNION ALL
SELECT 'certifications', COUNT(*) FROM certifications
UNION ALL
SELECT 'student_certifications', COUNT(*) FROM student_certifications
ORDER BY table_name;


-- ---------------------------------------------------------
-- 4. CHECK PRIMARY KEYS, FOREIGN KEYS, UNIQUE AND CHECK
-- CONSTRAINTS
-- ---------------------------------------------------------

SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;


-- ---------------------------------------------------------
-- 5. TEST JOIN: STUDENTS AND THEIR APPLICATIONS
-- ---------------------------------------------------------

SELECT
    s.student_id,
    s.name AS student_name,
    j.title AS job_title,
    a.status AS application_status,
    a.applied_at
FROM students s
INNER JOIN applications a
    ON s.student_id = a.student_id
INNER JOIN jobs j
    ON a.job_id = j.job_id
ORDER BY s.student_id;


-- ---------------------------------------------------------
-- 6. TEST JOIN: JOBS, COMPANIES AND RECRUITERS
-- ---------------------------------------------------------

SELECT
    j.job_id,
    j.title AS job_title,
    c.company_name,
    r.name AS recruiter_name,
    j.location,
    j.status
FROM jobs j
INNER JOIN companies c
    ON j.company_id = c.company_id
INNER JOIN recruiters r
    ON j.recruiter_id = r.recruiter_id
ORDER BY j.job_id;


-- ---------------------------------------------------------
-- 7. TEST AGGREGATE QUERY: APPLICATIONS PER JOB
-- ---------------------------------------------------------

SELECT
    j.job_id,
    j.title,
    COUNT(a.application_id) AS total_applications
FROM jobs j
LEFT JOIN applications a
    ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
ORDER BY total_applications DESC;


-- ---------------------------------------------------------
-- 8. TEST NESTED QUERY: JOBS WITH ABOVE-AVERAGE
-- APPLICATION COUNTS
-- ---------------------------------------------------------

SELECT
    j.job_id,
    j.title,
    COUNT(a.application_id) AS application_count
FROM jobs j
LEFT JOIN applications a
    ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
HAVING COUNT(a.application_id) > (
    SELECT AVG(application_count)
    FROM (
        SELECT COUNT(*) AS application_count
        FROM applications
        GROUP BY job_id
    ) AS application_totals
)
ORDER BY application_count DESC;


-- ---------------------------------------------------------
-- 9. TEST STUDENT SKILLS
-- ---------------------------------------------------------

SELECT
    s.name AS student_name,
    sk.skill_name,
    ss.proficiency
FROM student_skills ss
INNER JOIN students s
    ON ss.student_id = s.student_id
INNER JOIN skills sk
    ON ss.skill_id = sk.skill_id
ORDER BY s.student_id, sk.skill_name;


-- ---------------------------------------------------------
-- 10. TEST JOB REQUIRED SKILLS
-- ---------------------------------------------------------

SELECT
    j.title AS job_title,
    sk.skill_name
FROM job_skills js
INNER JOIN jobs j
    ON js.job_id = j.job_id
INNER JOIN skills sk
    ON js.skill_id = sk.skill_id
ORDER BY j.job_id, sk.skill_name;


-- ---------------------------------------------------------
-- 11. TEST FUNCTIONS
-- ---------------------------------------------------------

-- Number of applications submitted by student 1
SELECT get_student_application_count(1);

-- Number of applications received by job 1
SELECT get_job_application_count(1);

-- Matching skills between student 1 and job 1
SELECT get_matching_skill_count(1, 1);

-- Jobs matching student 1's skills
SELECT *
FROM get_matching_jobs(1);

-- Acceptance percentage for student 1
SELECT get_student_acceptance_percentage(1);


-- ---------------------------------------------------------
-- 12. CHECK STORED PROCEDURES
-- ---------------------------------------------------------

SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'PROCEDURE'
ORDER BY routine_name;


-- ---------------------------------------------------------
-- 13. CHECK TRIGGERS
-- ---------------------------------------------------------

SELECT
    trigger_name,
    event_object_table AS table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;


-- ---------------------------------------------------------
-- 14. TEST APPLICATION STATUS HISTORY
-- ---------------------------------------------------------

SELECT *
FROM application_status_history
ORDER BY changed_at DESC;


-- ---------------------------------------------------------
-- 15. TEST APPLICATION UPDATED_AT COLUMN
-- ---------------------------------------------------------

SELECT
    application_id,
    status,
    applied_at,
    updated_at
FROM applications
ORDER BY application_id;


-- ---------------------------------------------------------
-- 16. CHECK PGVECTOR EXTENSION
-- ---------------------------------------------------------

SELECT
    extname,
    extversion
FROM pg_extension
WHERE extname = 'vector';


-- ---------------------------------------------------------
-- 17. CHECK EMBEDDING TABLES
-- ---------------------------------------------------------

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'student_resume_embeddings',
      'job_embeddings'
  )
ORDER BY table_name;


-- ---------------------------------------------------------
-- 18. CHECK EMBEDDING RECORD COUNTS
-- ---------------------------------------------------------

SELECT
    'student_resume_embeddings' AS table_name,
    COUNT(*) AS total_embeddings
FROM student_resume_embeddings

UNION ALL

SELECT
    'job_embeddings',
    COUNT(*)
FROM job_embeddings;


-- ---------------------------------------------------------
-- 19. TEST VECTOR SIMILARITY
-- This query returns results after embeddings are inserted.
-- It compares student 1's resume with available job vectors.
-- ---------------------------------------------------------

SELECT
    j.job_id,
    j.title,
    ROUND(
        (1 - (se.embedding <=> je.embedding))::numeric,
        4
    ) AS cosine_similarity
FROM student_resume_embeddings se
CROSS JOIN job_embeddings je
INNER JOIN jobs j
    ON j.job_id = je.job_id
WHERE se.student_id = 1
ORDER BY se.embedding <=> je.embedding
LIMIT 5;


-- ---------------------------------------------------------
-- 20. CHECK INDEXES
-- ---------------------------------------------------------

SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ---------------------------------------------------------
-- END OF TEST QUERIES
-- ---------------------------------------------------------

SELECT 'INTERNLY DATABASE TESTS COMPLETED' AS result;
