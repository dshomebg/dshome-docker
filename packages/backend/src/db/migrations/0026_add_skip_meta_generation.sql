-- Migration: Add skip_meta_generation field
-- Date: 2025-11-09
-- Description: Adds skip_meta_generation boolean field to products and categories tables

-- Add skip_meta_generation to products
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "skip_meta_generation" BOOLEAN NOT NULL DEFAULT FALSE;

-- Add skip_meta_generation to categories
ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "skip_meta_generation" BOOLEAN NOT NULL DEFAULT FALSE;
