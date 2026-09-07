-- Migration 002: Create products table
--
-- Run after 001:
-- psql -U postgres -d qenvaro -f migrations/002_create_products.sql

CREATE TABLE IF NOT EXISTS products (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description TEXT            NOT NULL,
    price       NUMERIC(10, 2)  NOT NULL CHECK (price > 0),  -- NUMERIC ensures exact decimal storage (important for money)
    image       TEXT            NOT NULL,
    category    VARCHAR(100)    NOT NULL,
    stock       INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),  -- Stock can't go negative
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index on category for filtering products by type (e.g. "Laptops")
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
