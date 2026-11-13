
-- ============================================================
-- INTERNLY PROJECT
-- File: 05_complex_queries.sql
-- Purpose: Complex SQL queries and nested queries
-- Database: PostgreSQL 16
-- ============================================================


-- ============================================================
-- QUERY 1: INNER JOIN
-- Display jobs along with company and recruiter details
-- ============================================================

SELECT
    j.job_id,
    j.title,
    c.company_name,
    r.name AS recruiter_name,
    j.location,
    j.deadline,
    j.status
FROM jobs j
INNER JOIN companies c
    ON j.company_id = c.company_id
INNER JOIN recruiters r
    ON j.recruiter_id = r.recruiter_id
ORDER BY j.job_id;


-- ============================================================
-- QUERY 2: MULTIPLE JOIN
-- Display student applications with job and company details
-- ============================================================

SELECT
    a.application_id,
    s.name AS student_name,
    s.department,
    j.title AS job_title,
    c.company_name,
    a.applied_at,
    a.status
FROM applications a
INNER JOIN students s
    ON a.student_id = s.student_id
INNER JOIN jobs j
    ON a.job_id = j.job_id
INNER JOIN companies c
    ON j.company_id = c.company_id
ORDER BY a.applied_at DESC;


-- ============================================================
-- QUERY 3: LEFT JOIN + GROUP BY
-- Count applications received by every job
-- Includes jobs with zero applications
-- ============================================================

SELECT
    j.job_id,
    j.title,
    c.company_name,
    COUNT(a.application_id) AS total_applications
FROM jobs j
LEFT JOIN companies c
    ON j.company_id = c.company_id
LEFT JOIN applications a
    ON j.job_id = a.job_id
GROUP BY
    j.job_id,
    j.title,
    c.company_name
ORDER BY total_applications DESC;


-- ============================================================
-- QUERY 4: GROUP BY + HAVING
-- Find students who applied to more than one job
-- ============================================================

SELECT
    s.student_id,
    s.name,
    COUNT(a.application_id) AS application_count
FROM students s
INNER JOIN applications a
    ON s.student_id = a.student_id
GROUP BY
    s.student_id,
    s.name
HAVING COUNT(a.application_id) > 1
ORDER BY application_count DESC;


-- ============================================================
-- QUERY 5: NESTED SUBQUERY
-- Find jobs having more applications than the average
-- applications received per job
-- ============================================================

SELECT
    j.job_id,
    j.title,
    COUNT(a.application_id) AS total_applications
FROM jobs j
LEFT JOIN applications a
    ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
HAVING COUNT(a.application_id) >
(
    SELECT AVG(application_count)
    FROM
    (
        SELECT
            COUNT(a2.application_id) AS application_count
        FROM jobs j2
        LEFT JOIN applications a2
            ON j2.job_id = a2.job_id
        GROUP BY j2.job_id
    ) AS average_data
);


-- ============================================================
-- QUERY 6: EXISTS
-- Find jobs having at least one required skill
-- that matches a student's skills
-- ============================================================

SELECT
    j.job_id,
    j.title,
    c.company_name
FROM jobs j
JOIN companies c
    ON j.company_id = c.company_id
WHERE EXISTS
(
    SELECT 1
    FROM job_skills js
    JOIN student_skills ss
        ON js.skill_id = ss.skill_id
    WHERE js.job_id = j.job_id
);


-- ============================================================
-- QUERY 7: NOT EXISTS
-- Find students who have not applied to any internship
-- ============================================================

SELECT
    s.student_id,
    s.name,
    s.email
FROM students s
WHERE NOT EXISTS
(
    SELECT 1
    FROM applications a
    WHERE a.student_id = s.student_id
);


-- ============================================================
-- QUERY 8: CORRELATED SUBQUERY
-- Display each student's latest application
-- ============================================================

SELECT
    s.student_id,
    s.name,
    a.application_id,
    j.title AS job_title,
    a.applied_at,
    a.status
FROM students s
JOIN applications a
    ON a.student_id = s.student_id
JOIN jobs j
    ON a.job_id = j.job_id
WHERE a.applied_at =
(
    SELECT MAX(a2.applied_at)
    FROM applications a2
    WHERE a2.student_id = s.student_id
)
ORDER BY s.student_id;


-- ============================================================
-- QUERY 9: AGGREGATE FUNCTIONS
-- Analyze application status distribution
-- ============================================================

SELECT
    status,
    COUNT(*) AS total_applications,
    ROUND(
        COUNT(*) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM applications), 0),
        2
    ) AS percentage
FROM applications
GROUP BY status
ORDER BY total_applications DESC;


-- ============================================================
-- QUERY 10: CTE (COMMON TABLE EXPRESSION)
-- Recommend jobs based on matching student skills
-- Enter student_id = 1 in this example
-- ============================================================

WITH student_skill_data AS
(
    SELECT skill_id
    FROM student_skills
    WHERE student_id = 1
),
matching_jobs AS
(
    SELECT
        j.job_id,
        j.title,
        c.company_name,
        COUNT(js.skill_id) AS matched_skills
    FROM jobs j
    JOIN companies c
        ON j.company_id = c.company_id
    JOIN job_skills js
        ON j.job_id = js.job_id
    JOIN student_skill_data sd
        ON js.skill_id = sd.skill_id
    WHERE j.status = 'open'
    GROUP BY
        j.job_id,
        j.title,
        c.company_name
)
SELECT
    job_id,
    title,
    company_name,
    matched_skills
FROM matching_jobs
ORDER BY matched_skills DESC, job_id;


-- ============================================================
-- QUERY 11: WINDOW FUNCTION
-- Rank students based on number of applications
-- ============================================================

SELECT
    s.student_id,
    s.name,
    COUNT(a.application_id) AS total_applications,
    RANK() OVER (
        ORDER BY COUNT(a.application_id) DESC
    ) AS application_rank
FROM students s
LEFT JOIN applications a
    ON s.student_id = a.student_id
GROUP BY s.student_id, s.name
ORDER BY application_rank, s.student_id;


-- ============================================================
-- QUERY 12: CASE EXPRESSION
-- Classify jobs based on application activity
-- ============================================================

SELECT
    j.job_id,
    j.title,
    COUNT(a.application_id) AS total_applications,
    CASE
        WHEN COUNT(a.application_id) >= 3
            THEN 'High Application Activity'
        WHEN COUNT(a.application_id) >= 1
            THEN 'Moderate Application Activity'
        ELSE 'No Applications'
    END AS activity_level
FROM jobs j
LEFT JOIN applications a
    ON j.job_id = a.job_id
GROUP BY j.job_id, j.title
ORDER BY total_applications DESC;


-- ============================================================
-- END OF COMPLEX QUERIES
-- ============================================================
