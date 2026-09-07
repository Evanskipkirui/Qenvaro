-- Migration 004: Create order_items table
--
-- Run after 003:
-- psql -U postgres -d qenvaro -f migrations/004_create_order_items.sql

CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL       PRIMARY KEY,
    order_id    BIGINT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    --                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    --                                   Foreign key to orders table.
    --                                   "Order has many OrderItems" relationship.
    --                                   If the order is deleted, its items are deleted too.
    product_id  BIGINT          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    --                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    --                                   Foreign key to products table.
    --                                   "Product can appear in many OrderItems" relationship.
    --                                   ON DELETE RESTRICT means you CANNOT delete a product
    --                                   that has been ordered (protects order history).
    quantity    INTEGER         NOT NULL CHECK (quantity > 0),
    price       NUMERIC(10, 2)  NOT NULL CHECK (price > 0)
    --          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    --          This stores the product price AT THE TIME OF PURCHASE.
    --          Important: if the product price changes later, this order still
    --          shows what the customer actually paid.
);

-- Index on order_id to quickly find all items in an order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
