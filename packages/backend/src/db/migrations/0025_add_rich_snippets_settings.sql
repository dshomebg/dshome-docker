-- Migration: Add Rich Snippets Settings
-- Date: 2025-11-09
-- Description: Creates rich_snippets_settings table for JSON-LD structured data configuration

CREATE TABLE IF NOT EXISTS "rich_snippets_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization Settings
  "organization_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "organization_name" VARCHAR(255) NOT NULL DEFAULT '',
  "organization_logo" VARCHAR(500) NOT NULL DEFAULT '',
  "organization_type" VARCHAR(50) NOT NULL DEFAULT 'OnlineStore',
  "telephone" VARCHAR(50) NOT NULL DEFAULT '',
  "email" VARCHAR(255) NOT NULL DEFAULT '',
  "address_street" VARCHAR(255) NOT NULL DEFAULT '',
  "address_city" VARCHAR(100) NOT NULL DEFAULT '',
  "address_postal_code" VARCHAR(20) NOT NULL DEFAULT '',
  "address_country" VARCHAR(2) NOT NULL DEFAULT 'BG',
  "social_facebook" VARCHAR(500) NOT NULL DEFAULT '',
  "social_instagram" VARCHAR(500) NOT NULL DEFAULT '',
  "social_twitter" VARCHAR(500) NOT NULL DEFAULT '',

  -- Product Snippets
  "product_snippets_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_description_type" VARCHAR(20) NOT NULL DEFAULT 'short',
  "product_include_specifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_include_price" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_include_availability" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_include_sku" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_include_images" BOOLEAN NOT NULL DEFAULT TRUE,
  "product_include_brand" BOOLEAN NOT NULL DEFAULT TRUE,
  "default_currency" VARCHAR(3) NOT NULL DEFAULT 'BGN',

  -- Breadcrumbs
  "breadcrumbs_enabled" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Website Search
  "website_search_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "search_url_pattern" VARCHAR(255) NOT NULL DEFAULT '/search?q={search_term_string}',

  -- Blog Snippets
  "blog_snippets_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "default_author_name" VARCHAR(255) NOT NULL DEFAULT '',
  "default_author_image" VARCHAR(500) NOT NULL DEFAULT '',

  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO "rich_snippets_settings" (
  "organization_enabled",
  "product_snippets_enabled",
  "breadcrumbs_enabled",
  "website_search_enabled",
  "blog_snippets_enabled"
)
VALUES (TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT DO NOTHING;
