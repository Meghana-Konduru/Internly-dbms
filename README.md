# Internly
# Internly – PostgreSQL Database Documentation

## 1. Overview

Internly is an internship recommendation platform that connects students with recruiters and companies.

The database is developed using **PostgreSQL 16** with **pgvector** for semantic similarity matching between student resumes and internship descriptions.

### Technologies

- PostgreSQL 16 – Relational database management
- pgvector – Vector storage and similarity search
- Python – Backend database integration
- Redis – Caching and temporary data management
- Next.js – Frontend application

## 2. Database Configuration

| Property | Value |
|---|---|
| Database name | `internly_db` |
| Database user | `internly_user` |
| Database system | PostgreSQL 16 |
| Schema | `public` |
| Vector extension | `vector` |
| Embedding model planned | `all-MiniLM-L6-v2` |
| Embedding dimensions | 384 |

**Note:** Configure your own database password locally. Never commit passwords or secret credentials to GitHub.

## 3. Database Tables

The project contains 10 core relational tables.

| Table | Purpose |
|---|---|
| companies | Stores company information |
| recruiters | Stores recruiter accounts and company associations |
| students | Stores student profiles |
| jobs | Stores internship opportunities |
| applications | Stores student applications and their statuses |
| skills | Maintains the available skills |
| student_skills | Maps students to their skills |
| job_skills | Maps jobs to required skills |
| certifications | Stores certification details |
| student_certifications | Maps students to their certifications |

### Supporting tables

| Table | Purpose |
|---|---|
| application_status_history | Maintains an audit trail of application status changes |
| student_resume_embeddings | Stores student resume vectors |
| job_embeddings | Stores internship description vectors |

The supporting tables do not change the 10-table core ER design.

## 4. SQL Files and Execution Order

Execute the SQL files in the following order.

| File | Description |
|---|---|
| `01_create_database.sql` | Creates the database and database user |
| `02_create_tables.sql` | Creates the 10 core tables |
| `03_constraints.sql` | Creates supporting indexes |
| `04_insert_data.sql` | Inserts demonstration records |
| `05_complex_queries.sql` | Contains complex SQL queries, joins, nested queries, CTEs and window functions |
| `06_functions.sql` | Defines user-created SQL functions |
| `07_procedures.sql` | Defines stored procedures |
| `08_triggers.sql` | Creates triggers and application status audit functionality |
| `09_pgvector.sql` | Creates vector embedding tables and indexes |
| `10_test_queries.sql` | Tests database objects and functionality |

**Important:** `04_insert_data.sql` truncates existing project records before inserting sample data. Do not rerun it if you want to preserve existing records.

## 5. PostgreSQL Setup

Install PostgreSQL 16 and pgvector.

Create the database and user using the first SQL file.

The pgvector extension must be installed for PostgreSQL 16 and enabled in `internly_db`.

The extension can be enabled by a PostgreSQL administrator:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 6. Running the SQL Files

From the project root directory in Ubuntu/WSL:

```bash
psql -U internly_user -d internly_db -h localhost
```

For files that operate on the existing database:

```bash
psql -U internly_user -d internly_db -h localhost -f database/02_create_tables.sql
```

Repeat for the remaining files in the specified order.

Run the first file separately as the PostgreSQL administrator:

```bash
sudo -u postgres psql -f database/01_create_database.sql
```

## 7. Functions

The database contains the following user-defined functions:

1. `get_student_application_count()` – Returns the number of applications submitted by a student.
2. `get_job_application_count()` – Returns the number of applications received by a job.
3. `get_matching_skill_count()` – Counts matching skills between a student and a job.
4. `get_matching_jobs()` – Recommends open jobs based on student skills, excluding jobs already applied to.
5. `get_student_acceptance_percentage()` – Calculates a student's application acceptance percentage.

## 8. Stored Procedures

The project includes procedures for:

- Registering students.
- Adding internship opportunities.
- Applying directly for internships.
- Updating application statuses.
- Adding student skills.

A right swipe in the student interface directly creates an application. A left swipe skips the internship.

## 9. Triggers

The database uses triggers for:

- Updating application modification timestamps.
- Recording application status changes.
- Validating job deadlines.
- Normalizing student email addresses.
- Normalizing recruiter email addresses.

The `application_status_history` table stores application status change records.

## 10. Complex SQL Concepts

The database demonstrates:

- INNER JOIN
- LEFT JOIN
- Multiple-table JOIN
- GROUP BY and HAVING
- Aggregate functions
- Nested queries
- Correlated subqueries
- EXISTS and NOT EXISTS
- Common Table Expressions (CTEs)
- Window functions
- CASE expressions

## 11. pgvector Integration

Internly uses pgvector to support semantic matching between student resumes and internship descriptions.

Two supporting tables store 384-dimensional vectors:

- `student_resume_embeddings`
- `job_embeddings`

The planned embedding model is `sentence-transformers/all-MiniLM-L6-v2`.

Cosine similarity can be calculated using pgvector's `<=>` operator.

**Implementation status:** The extension, tables and indexes are configured. Actual embedding generation and backend integration are pending.

## 12. Database Verification

Run the final test file:

```bash
psql -U internly_user -d internly_db -h localhost -f database/10_test_queries.sql
```

It checks:

- Database connection.
- Core tables and record counts.
- Constraints.
- Joins and complex queries.
- Functions and procedures.
- Triggers and audit history.
- pgvector extension and embedding tables.
- Indexes.

## 13. Project Architecture

The planned application architecture is:

```text
              NEXT.JS FRONTEND
                     |
                     v
              PYTHON BACKEND
                 (FastAPI)
                /         \
               v           v
          PostgreSQL      Redis
               |
               v
            pgvector
```

- PostgreSQL stores persistent relational data.
- pgvector supports semantic internship recommendations.
- Redis provides caching and fast temporary data access.
- FastAPI handles communication between the frontend and databases.
- Next.js provides student and recruiter interfaces.

## 14. Important Notes

- Never expose database passwords in source code.
- Do not commit `.env` files.
- Install pgvector for the correct PostgreSQL version.
- Run SQL files in the specified order.
- Back up important data before running scripts that modify or truncate records.
- The core ER diagram contains 10 tables; supporting technical tables are additional.

---

**Project:** Internly – Internship Recommendation Platform

**Database:** PostgreSQL 16 with pgvector