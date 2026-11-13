
-- ============================================
-- INTERNLY: PGVECTOR SETUP
-- File: 09_pgvector.sql
-- Purpose: Store and compare resume/job embeddings
-- Embedding model: all-MiniLM-L6-v2 (384 dimensions)
-- ============================================

-- pgvector extension must already be enabled
-- It was previously enabled by the PostgreSQL admin.

-- 1. Store student resume embeddings
CREATE TABLE IF NOT EXISTS student_resume_embeddings (
    student_id INTEGER PRIMARY KEY,
    embedding VECTOR(384) NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_embedding
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE
);

-- 2. Store internship/job description embeddings
CREATE TABLE IF NOT EXISTS job_embeddings (
    job_id INTEGER PRIMARY KEY,
    embedding VECTOR(384) NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_embedding
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE
);

-- 3. Create vector similarity indexes
CREATE INDEX IF NOT EXISTS idx_student_embedding
ON student_resume_embeddings
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_job_embedding
ON job_embeddings
USING hnsw (embedding vector_cosine_ops);

-- 4. Verify pgvector extension
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';

-- 5. Verify embedding tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'student_resume_embeddings',
    'job_embeddings'
);

-- 6. Verify vector indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_student_embedding',
    'idx_job_embedding'
);
