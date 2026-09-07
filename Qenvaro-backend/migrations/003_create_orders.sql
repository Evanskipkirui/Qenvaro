-- Migration 003: Create orders table
--
-- Run after 002:
-- psql -U postgres -d qenvaro -f migrations/003_create_orders.sql

-- Create the order status type
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id            BIGSERIAL       PRIMARY KEY,
    user_id       BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    --                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    --                                       This is a FOREIGN KEY constraint.
    --                                       It means user_id MUST exist in the users table.
    --                                       If a user is deleted, their orders are also deleted (CASCADE).
    --                                       This enforces the "User has many Orders" relationship.
    total_amount  NUMERIC(10, 2)  NOT NULL CHECK (total_amount >= 0),
    status        order_status    NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index on user_id to quickly fetch all orders for a specific user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
