-- Migration: Remove unused SEO fields from categories
-- Date: 2025-11-09
-- Description: Removes Open Graph (og_*) and robots_* fields from categories table

-- Drop Open Graph fields
ALTER TABLE "categories" DROP COLUMN IF EXISTS "og_title";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "og_description";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "og_image";

-- Drop robots fields
ALTER TABLE "categories" DROP COLUMN IF EXISTS "robots_index";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "robots_follow";
