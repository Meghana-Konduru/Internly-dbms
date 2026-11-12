
-- =====================================================
-- INTERNLY DBMS PROJECT
-- File: 01_create_database.sql
-- Purpose: Create PostgreSQL role and database
-- =====================================================

-- Run this file as the PostgreSQL administrator
-- using: sudo -u postgres psql -f database/01_create_database.sql

-- 1. Create database user if it does not exist

SELECT 'CREATE ROLE internly_user LOGIN'
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'internly_user'
)
\gexec


-- 2. Create database if it does not exist

SELECT 'CREATE DATABASE internly_db OWNER internly_user'
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_database
    WHERE datname = 'internly_db'
)
\gexec


-- 3. Connect to the Internly database

\connect internly_db


-- 4. Set schema permissions

GRANT ALL ON SCHEMA public TO internly_user;

ALTER SCHEMA public OWNER TO internly_user;


-- 5. Verify database and user

SELECT
    current_database() AS database_name,
    current_user AS connected_user;

SELECT
    rolname,
    rolsuper,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
WHERE rolname = 'internly_user';

-- =====================================================
-- DATABASE SETUP COMPLETED
-- =====================================================
