-- Migration: Add quantity to product_combinations
-- Date: 2025-11-08

ALTER TABLE product_combinations
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN product_combinations.quantity IS 'Quantity available for this specific combination';
