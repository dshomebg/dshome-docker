-- Migration: Add price_impact, weight, and weight_impact to product_combinations
-- Date: 2025-11-08

-- Add new columns to product_combinations table
ALTER TABLE product_combinations
ADD COLUMN price_impact DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN weight DECIMAL(10, 3),
ADD COLUMN weight_impact DECIMAL(10, 3) DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN product_combinations.price_impact IS 'Additional price to be added to base product price';
COMMENT ON COLUMN product_combinations.weight IS 'Total weight of this combination in kg';
COMMENT ON COLUMN product_combinations.weight_impact IS 'Additional weight to be added to base product weight in kg';
