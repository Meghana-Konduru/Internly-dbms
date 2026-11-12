
-- ============================================================
-- INTERNLY PROJECT
-- File: 07_procedures.sql
-- Purpose: Stored procedures
-- Database: PostgreSQL 16
-- ============================================================


-- ============================================================
-- PROCEDURE 1: REGISTER STUDENT
-- Purpose: Register a new student.
-- ============================================================

CREATE OR REPLACE PROCEDURE register_student(
    p_name VARCHAR(100),
    p_email VARCHAR(150),
    p_password_hash VARCHAR(255),
    p_department VARCHAR(100),
    p_graduation_year INTEGER,
    p_resume_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM students s
        WHERE s.email = p_email
    ) THEN
        RAISE EXCEPTION 'Student email already exists: %', p_email;
    END IF;

    INSERT INTO students (
        name,
        email,
        password_hash,
        department,
        graduation_year,
        resume_url
    )
    VALUES (
        p_name,
        p_email,
        p_password_hash,
        p_department,
        p_graduation_year,
        p_resume_url
    );

    RAISE NOTICE 'Student registered successfully';
END;
$$;


-- ============================================================
-- PROCEDURE 2: ADD INTERNSHIP
-- Purpose: Allow a recruiter to post an internship.
-- ============================================================

CREATE OR REPLACE PROCEDURE add_internship(
    p_recruiter_id INTEGER,
    p_company_id INTEGER,
    p_title VARCHAR(150),
    p_description TEXT,
    p_location VARCHAR(150),
    p_deadline DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM recruiters r
        WHERE r.recruiter_id = p_recruiter_id
          AND r.company_id = p_company_id
    ) THEN
        RAISE EXCEPTION
            'Recruiter does not belong to the specified company';
    END IF;

    IF p_deadline IS NOT NULL AND p_deadline < CURRENT_DATE THEN
        RAISE EXCEPTION 'Internship deadline cannot be in the past';
    END IF;

    INSERT INTO jobs (
        recruiter_id,
        company_id,
        title,
        description,
        location,
        deadline,
        status
    )
    VALUES (
        p_recruiter_id,
        p_company_id,
        p_title,
        p_description,
        p_location,
        p_deadline,
        'open'
    );

    RAISE NOTICE 'Internship posted successfully';
END;
$$;


-- ============================================================
-- PROCEDURE 3: APPLY FOR INTERNSHIP
-- Purpose: Insert an application immediately when a student
--          confirms an internship (right swipe).
-- ============================================================

CREATE OR REPLACE PROCEDURE apply_for_internship(
    p_student_id INTEGER,
    p_job_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_job_status VARCHAR(30);
    v_deadline DATE;
BEGIN
    -- Check whether student exists.

    IF NOT EXISTS (
        SELECT 1
        FROM students s
        WHERE s.student_id = p_student_id
    ) THEN
        RAISE EXCEPTION 'Student does not exist';
    END IF;

    -- Fetch job information.

    SELECT j.status, j.deadline
    INTO v_job_status, v_deadline
    FROM jobs j
    WHERE j.job_id = p_job_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Internship does not exist';
    END IF;

    -- Check job availability.

    IF v_job_status <> 'open' THEN
        RAISE EXCEPTION 'This internship is not open';
    END IF;

    IF v_deadline IS NOT NULL AND v_deadline < CURRENT_DATE THEN
        RAISE EXCEPTION 'Application deadline has passed';
    END IF;

    -- Prevent duplicate applications.

    IF EXISTS (
        SELECT 1
        FROM applications a
        WHERE a.student_id = p_student_id
          AND a.job_id = p_job_id
    ) THEN
        RAISE EXCEPTION 'Student has already applied for this internship';
    END IF;

    -- Directly create the application.

    INSERT INTO applications (
        student_id,
        job_id,
        applied_at,
        status
    )
    VALUES (
        p_student_id,
        p_job_id,
        CURRENT_TIMESTAMP,
        'pending'
    );

    RAISE NOTICE 'Application submitted successfully';
END;
$$;


-- ============================================================
-- PROCEDURE 4: UPDATE APPLICATION STATUS
-- Purpose: Recruiter updates application status.
-- ============================================================

CREATE OR REPLACE PROCEDURE update_application_status(
    p_application_id INTEGER,
    p_new_status VARCHAR(30)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_new_status NOT IN (
        'pending',
        'shortlisted',
        'rejected',
        'accepted',
        'withdrawn'
    ) THEN
        RAISE EXCEPTION 'Invalid application status: %', p_new_status;
    END IF;

    UPDATE applications
    SET status = p_new_status
    WHERE application_id = p_application_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application ID % does not exist',
            p_application_id;
    END IF;

    RAISE NOTICE 'Application status updated successfully';
END;
$$;


-- ============================================================
-- PROCEDURE 5: ADD STUDENT SKILL
-- Purpose: Add a skill to a student's profile.
-- ============================================================

CREATE OR REPLACE PROCEDURE add_student_skill(
    p_student_id INTEGER,
    p_skill_id INTEGER,
    p_proficiency VARCHAR(30)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM students s
        WHERE s.student_id = p_student_id
    ) THEN
        RAISE EXCEPTION 'Student does not exist';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM skills sk
        WHERE sk.skill_id = p_skill_id
    ) THEN
        RAISE EXCEPTION 'Skill does not exist';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM student_skills ss
        WHERE ss.student_id = p_student_id
          AND ss.skill_id = p_skill_id
    ) THEN
        RAISE EXCEPTION 'Student already has this skill';
    END IF;

    INSERT INTO student_skills (
        student_id,
        skill_id,
        proficiency
    )
    VALUES (
        p_student_id,
        p_skill_id,
        p_proficiency
    );

    RAISE NOTICE 'Student skill added successfully';
END;
$$;


-- ============================================================
-- END OF STORED PROCEDURES
-- ============================================================
