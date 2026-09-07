-- Migration 001: Create users table
--
-- What is a migration?
-- A migration is a SQL file that changes your database structure.
-- Instead of manually running SQL commands every time, you keep them in files.
-- This way, every developer (and the production server) runs the SAME setup.
-- Migrations are run in order: 001 first, then 002, etc.
--
-- How to run this:
-- psql -U postgres -d qenvaro -f migrations/001_create_users.sql

-- Create the role type for user roles.
-- Using a custom type means PostgreSQL will ONLY accept these exact values.
-- It prevents typos like "Admin" or "CUSTOMER" from being stored.
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,           -- Auto-incrementing unique ID
    name          VARCHAR(100)  NOT NULL,           -- User's display name
    email         VARCHAR(255)  NOT NULL UNIQUE,    -- Must be unique — no two users share an email
    password_hash TEXT          NOT NULL,           -- bcrypt hash, never plain text
    role          user_role     NOT NULL DEFAULT 'customer',  -- Default to customer
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index on email for fast lookups during login
-- Without an index, PostgreSQL scans the whole table to find an email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
