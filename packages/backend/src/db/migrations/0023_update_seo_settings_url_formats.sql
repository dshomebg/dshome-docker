-- Migration: Update SEO settings with URL suffixes and new formats
-- Date: 2025-11-09
-- Description: Adds URL suffix fields and new URL format fields for CMS/Blog categories

-- Add new suffix columns
ALTER TABLE "seo_settings"
  ADD COLUMN IF NOT EXISTS "product_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "category_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "brand_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "cms_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "cms_category_url_format" VARCHAR(255) NOT NULL DEFAULT '/pages/{cms-category}',
  ADD COLUMN IF NOT EXISTS "cms_category_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "blog_url_suffix" VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "blog_category_url_format" VARCHAR(255) NOT NULL DEFAULT '/blog/{blog-category}',
  ADD COLUMN IF NOT EXISTS "blog_category_url_suffix" VARCHAR(50) NOT NULL DEFAULT '';

-- Update existing URL format defaults
UPDATE "seo_settings"
SET
  "product_url_format" = '/{def-category-slug}/{product-slug}',
  "category_url_format" = '/{category-slug}',
  "brand_url_format" = '/{brand-slug}',
  "cms_url_format" = '/pages/{cms-category}/{cms-page-slug}',
  "blog_url_format" = '/blog/{blog-category}/{blog-page-slug}'
WHERE "id" IS NOT NULL;
