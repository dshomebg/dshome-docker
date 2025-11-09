-- Migration: Add style field to categories
-- Date: 2025-11-09
-- Description: Adds style enum field to differentiate between navigation and product categories

-- Create enum type for category style
DO $$ BEGIN
  CREATE TYPE category_style AS ENUM ('navigation', 'product');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add style column with default value 'product'
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "style" category_style NOT NULL DEFAULT 'product';
