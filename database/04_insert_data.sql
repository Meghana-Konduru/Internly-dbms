
-- ============================================================
-- INTERNLY PROJECT
-- File: 04_insert_data.sql
-- Purpose: Insert sample data into all 10 tables
-- PostgreSQL 16
-- ============================================================

BEGIN;

-- Clear previous sample data and reset generated IDs.
-- This makes the script safe to execute again.
TRUNCATE TABLE
    student_certifications,
    student_skills,
    job_skills,
    applications,
    jobs,
    recruiters,
    certifications,
    skills,
    students,
    companies
RESTART IDENTITY CASCADE;


-- ============================================================
-- 1. COMPANIES (3 records)
-- ============================================================

INSERT INTO companies
(company_name, industry, location)
VALUES
('Google', 'Technology', 'Bangalore'),
('Microsoft', 'Software Development', 'Hyderabad'),
('Amazon', 'E-Commerce and Cloud Computing', 'Bangalore');


-- ============================================================
-- 2. RECRUITERS (4 records)
-- ============================================================

INSERT INTO recruiters
(name, email, password_hash, company_id)
VALUES
('Rahul Sharma', 'rahul@google.example', 'DEMO_HASH_001', 1),
('Priya Nair', 'priya@google.example', 'DEMO_HASH_002', 1),
('Arjun Reddy', 'arjun@microsoft.example', 'DEMO_HASH_003', 2),
('Sneha Kapoor', 'sneha@amazon.example', 'DEMO_HASH_004', 3);


-- ============================================================
-- 3. STUDENTS (5 records)
-- ============================================================

INSERT INTO students
(name, email, password_hash, department, graduation_year, resume_url)
VALUES
('Ananya Rao', 'ananya@student.example', 'DEMO_HASH_101',
 'Computer Science', 2027, 'https://example.com/resumes/ananya.pdf'),

('Karan Mehta', 'karan@student.example', 'DEMO_HASH_102',
 'Information Technology', 2027, 'https://example.com/resumes/karan.pdf'),

('Meera Iyer', 'meera@student.example', 'DEMO_HASH_103',
 'Electronics', 2028, 'https://example.com/resumes/meera.pdf'),

('Rohan Das', 'rohan@student.example', 'DEMO_HASH_104',
 'Computer Science', 2027, 'https://example.com/resumes/rohan.pdf'),

('Ishita Verma', 'ishita@student.example', 'DEMO_HASH_105',
 'Information Technology', 2028, 'https://example.com/resumes/ishita.pdf');


-- ============================================================
-- 4. JOBS (6 records)
-- ============================================================

INSERT INTO jobs
(recruiter_id, company_id, title, description, location, deadline, status)
VALUES
(1, 1, 'Python Developer Intern',
 'Work on Python backend development and API integration.',
 'Bangalore', '2026-12-15', 'open'),

(2, 1, 'Data Analyst Intern',
 'Analyze business datasets and prepare reports using SQL and Python.',
 'Bangalore', '2026-12-20', 'open'),

(3, 2, 'Cloud Engineering Intern',
 'Work with cloud infrastructure, Linux and cloud deployment.',
 'Hyderabad', '2026-12-18', 'open'),

(3, 2, 'Database Developer Intern',
 'Develop database solutions using SQL and PostgreSQL.',
 'Hyderabad', '2026-12-25', 'open'),

(4, 3, 'Machine Learning Intern',
 'Build machine learning models and work with Python.',
 'Bangalore', '2026-12-22', 'open'),

(4, 3, 'Frontend Developer Intern',
 'Develop responsive web applications using React and JavaScript.',
 'Bangalore', '2026-12-28', 'open');


-- ============================================================
-- 5. APPLICATIONS (8 records)
-- ============================================================

INSERT INTO applications
(student_id, job_id, applied_at, status)
VALUES
(1, 1, '2026-11-01 10:30:00', 'shortlisted'),
(1, 2, '2026-11-02 11:00:00', 'pending'),
(2, 1, '2026-11-03 09:15:00', 'accepted'),
(2, 4, '2026-11-04 14:20:00', 'pending'),
(3, 5, '2026-11-05 12:10:00', 'shortlisted'),
(3, 3, '2026-11-06 15:45:00', 'rejected'),
(4, 1, '2026-11-07 10:00:00', 'pending'),
(5, 6, '2026-11-08 16:30:00', 'pending');


-- ============================================================
-- 6. SKILLS (10 records)
-- ============================================================

INSERT INTO skills (skill_name)
VALUES
('Python'),
('Java'),
('SQL'),
('PostgreSQL'),
('Machine Learning'),
('React'),
('JavaScript'),
('Data Analysis'),
('Cloud Computing'),
('HTML/CSS');


-- ============================================================
-- 7. STUDENT_SKILLS (15 records)
-- ============================================================

INSERT INTO student_skills
(student_id, skill_id, proficiency)
VALUES
(1, 1, 'Advanced'),
(1, 3, 'Advanced'),
(1, 4, 'Intermediate'),

(2, 1, 'Intermediate'),
(2, 2, 'Advanced'),
(2, 3, 'Advanced'),

(3, 5, 'Intermediate'),
(3, 8, 'Advanced'),
(3, 1, 'Intermediate'),

(4, 1, 'Advanced'),
(4, 6, 'Intermediate'),
(4, 7, 'Advanced'),

(5, 6, 'Advanced'),
(5, 7, 'Intermediate'),
(5, 10, 'Advanced');


-- ============================================================
-- 8. JOB_SKILLS (12 records)
-- ============================================================

INSERT INTO job_skills (job_id, skill_id)
VALUES
(1, 1),
(1, 3),

(2, 3),
(2, 8),

(3, 9),
(3, 1),

(4, 3),
(4, 4),

(5, 1),
(5, 5),

(6, 6),
(6, 7);


-- ============================================================
-- 9. CERTIFICATIONS (5 records)
-- ============================================================

INSERT INTO certifications
(certification_name, issuing_organization)
VALUES
('Python Programming Certificate', 'Coursera'),
('AWS Cloud Practitioner', 'Amazon Web Services'),
('SQL for Data Science', 'Coursera'),
('Machine Learning Fundamentals', 'Google'),
('Frontend Web Development', 'freeCodeCamp');


-- ============================================================
-- 10. STUDENT_CERTIFICATIONS (7 records)
-- ============================================================

INSERT INTO student_certifications
(student_id, certification_id, issue_date, expiry_date)
VALUES
(1, 1, '2026-01-10', NULL),
(1, 3, '2026-02-15', NULL),

(2, 1, '2026-03-20', NULL),
(2, 2, '2026-04-12', '2029-04-12'),

(3, 4, '2026-05-18', NULL),

(4, 1, '2026-06-01', NULL),

(5, 5, '2026-07-22', NULL);


-- ============================================================
-- COMMIT TRANSACTION
-- ============================================================

COMMIT;

-- ============================================================
-- END OF SAMPLE DATA
-- ============================================================
