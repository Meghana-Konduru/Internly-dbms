
-- ============================================================
-- INTERNLY PROJECT
-- File: 03_constraints.sql
-- Purpose: Additional indexes and query optimization
-- PostgreSQL 16
-- ============================================================


-- 1. RECRUITERS TABLE
-- Quickly find recruiters belonging to a company.

CREATE INDEX idx_recruiters_company
ON recruiters(company_id);


-- 2. JOBS TABLE
-- Find jobs posted by recruiters.

CREATE INDEX idx_jobs_recruiter_company
ON jobs(recruiter_id, company_id);

-- Find jobs belonging to a company.

CREATE INDEX idx_jobs_company
ON jobs(company_id);

-- Find jobs based on their status.

CREATE INDEX idx_jobs_status
ON jobs(status);

-- Find jobs using their application deadline.

CREATE INDEX idx_jobs_deadline
ON jobs(deadline);

-- Optimize searches for currently open jobs.

CREATE INDEX idx_jobs_open
ON jobs(deadline)
WHERE status = 'open';


-- 3. APPLICATIONS TABLE
-- Find applications received for a particular job.

CREATE INDEX idx_applications_job
ON applications(job_id);

-- Find applications based on their status.

CREATE INDEX idx_applications_status
ON applications(status);

-- Find applications based on application date.

CREATE INDEX idx_applications_applied_at
ON applications(applied_at);


-- 4. STUDENT_SKILLS TABLE
-- Find students possessing a particular skill.

CREATE INDEX idx_student_skills_skill
ON student_skills(skill_id);


-- 5. JOB_SKILLS TABLE
-- Find jobs requiring a particular skill.

CREATE INDEX idx_job_skills_skill
ON job_skills(skill_id);


-- 6. STUDENT_CERTIFICATIONS TABLE
-- Find students possessing a particular certification.

CREATE INDEX idx_student_cert_certification
ON student_certifications(certification_id);


-- 7. CERTIFICATIONS TABLE
-- Search certifications by their name.

CREATE INDEX idx_certifications_name
ON certifications(certification_name);


-- 8. SKILLS TABLE
-- Search skills by their name.

-- Note: skill_name already has a UNIQUE constraint,
-- so PostgreSQL automatically creates an index for it.
-- No additional index is required.


-- ============================================================
-- END OF INDEX CREATION
-- ============================================================
