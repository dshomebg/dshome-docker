-- Migration: Add SEO settings table
-- Date: 2025-11-09
-- Description: Adds table for global SEO configuration and URL formats

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS "seo_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_url_format" VARCHAR(255) NOT NULL DEFAULT '/products/{slug}',
  "category_url_format" VARCHAR(255) NOT NULL DEFAULT '/categories/{slug}',
  "brand_url_format" VARCHAR(255) NOT NULL DEFAULT '/brands/{slug}',
  "cms_url_format" VARCHAR(255) NOT NULL DEFAULT '/{slug}',
  "blog_url_format" VARCHAR(255) NOT NULL DEFAULT '/blog/{slug}',
  "canonical_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default SEO settings
INSERT INTO "seo_settings" ("product_url_format", "category_url_format", "brand_url_format", "cms_url_format", "blog_url_format", "canonical_enabled")
VALUES ('/products/{slug}', '/categories/{slug}', '/brands/{slug}', '/{slug}', '/blog/{slug}', TRUE)
ON CONFLICT DO NOTHING;
