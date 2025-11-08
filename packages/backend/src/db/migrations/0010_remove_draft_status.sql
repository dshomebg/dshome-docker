-- Migration: Remove 'draft' status from product_status enum
-- Date: 2025-11-08

-- Step 1: Update all products with 'draft' status to 'inactive'
UPDATE products SET status = 'inactive' WHERE status = 'draft';

-- Step 2: Recreate the enum without 'draft'
-- PostgreSQL doesn't support ALTER TYPE ... DROP VALUE, so we need to:
-- a) Create new enum
CREATE TYPE product_status_new AS ENUM ('active', 'inactive', 'archived');

-- b) Alter the column to use the new enum
ALTER TABLE products
  ALTER COLUMN status TYPE product_status_new
  USING status::text::product_status_new;

-- c) Drop old enum and rename new one
DROP TYPE product_status;
ALTER TYPE product_status_new RENAME TO product_status;
