-- Migration: Add discount fields to product_prices
-- Date: 2025-11-09
-- Description: Adds discount functionality with type, value, date range, and promotional price

-- Create discount_type enum
DO $$ BEGIN
 CREATE TYPE "discount_type" AS ENUM('fixed', 'percentage');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add discount_type field
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "discount_type" "discount_type";

-- Add discount_value field (amount or percentage)
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "discount_value" NUMERIC(10, 2);

-- Add discount_start_date field
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "discount_start_date" TIMESTAMP;

-- Add discount_end_date field
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "discount_end_date" TIMESTAMP;

-- Add promotional_price field (calculated price after discount)
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "promotional_price" NUMERIC(10, 2);
