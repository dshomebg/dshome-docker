-- Migration: Add h1 field and remove metaKeywords from categories
-- Date: 2025-11-09
-- Description: Adds h1 heading field for frontend display and removes unused metaKeywords field

-- Add h1 field
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "h1" TEXT;

-- Remove metaKeywords field
ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_keywords";
