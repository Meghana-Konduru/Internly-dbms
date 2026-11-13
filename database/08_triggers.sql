
-- ============================================================
-- INTERNLY PROJECT
-- File: 08_triggers.sql
-- Purpose: Automatic database operations using triggers
-- Database: PostgreSQL 16
-- ============================================================


-- ============================================================
-- PREPARATION: Add updated_at to applications
-- ============================================================

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP;


-- ============================================================
-- TRIGGER 1: AUTOMATIC APPLICATION TIMESTAMP
-- Purpose: Update updated_at whenever application details change.
-- ============================================================

CREATE OR REPLACE FUNCTION update_application_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_timestamp
ON applications;

CREATE TRIGGER trg_application_timestamp
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_application_timestamp();


-- ============================================================
-- TRIGGER 2: APPLICATION STATUS AUDIT
-- Purpose: Store every application status change.
--
-- This is a technical audit table, not an additional
-- core ER entity. The project still has 10 core tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS application_status_history (
    history_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL
        REFERENCES applications(application_id)
        ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (
            application_id,
            old_status,
            new_status,
            changed_at
        )
        VALUES (
            NEW.application_id,
            OLD.status,
            NEW.status,
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_log
ON applications;

CREATE TRIGGER trg_application_status_log
AFTER UPDATE OF status ON applications
FOR EACH ROW
EXECUTE FUNCTION log_application_status_change();


-- ============================================================
-- TRIGGER 3: VALIDATE JOB DEADLINE
-- Purpose: Prevent new internships or deadline changes
--          from using a date in the past.
-- ============================================================

CREATE OR REPLACE FUNCTION validate_job_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.deadline IS NOT NULL
       AND NEW.deadline < CURRENT_DATE THEN

        RAISE EXCEPTION
            'Internship deadline cannot be in the past';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_job_deadline
ON jobs;

CREATE TRIGGER trg_validate_job_deadline
BEFORE INSERT OR UPDATE OF deadline ON jobs
FOR EACH ROW
EXECUTE FUNCTION validate_job_deadline();


-- ============================================================
-- TRIGGER 4: NORMALIZE STUDENT EMAIL
-- Purpose: Store student email addresses in lowercase
--          and remove accidental surrounding spaces.
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_student_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email := LOWER(TRIM(NEW.email));

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_student_email
ON students;

CREATE TRIGGER trg_normalize_student_email
BEFORE INSERT OR UPDATE OF email ON students
FOR EACH ROW
EXECUTE FUNCTION normalize_student_email();


-- ============================================================
-- TRIGGER 5: NORMALIZE RECRUITER EMAIL
-- Purpose: Store recruiter email addresses in lowercase
--          and remove accidental surrounding spaces.
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_recruiter_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email := LOWER(TRIM(NEW.email));

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_recruiter_email
ON recruiters;

CREATE TRIGGER trg_normalize_recruiter_email
BEFORE INSERT OR UPDATE OF email ON recruiters
FOR EACH ROW
EXECUTE FUNCTION normalize_recruiter_email();


-- ============================================================
-- END OF TRIGGERS
-- ============================================================
