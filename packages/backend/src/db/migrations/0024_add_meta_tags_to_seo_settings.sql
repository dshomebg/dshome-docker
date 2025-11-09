-- Migration: Add meta tags to SEO settings
-- Date: 2025-11-09
-- Description: Adds meta title and description template fields for products and categories

-- Add meta tags columns
ALTER TABLE "seo_settings"
  ADD COLUMN IF NOT EXISTS "product_meta_title_template" VARCHAR(255) NOT NULL DEFAULT '{name} - {shop_name}',
  ADD COLUMN IF NOT EXISTS "product_meta_description_template" VARCHAR(500) NOT NULL DEFAULT 'Купете {name} на страхотна цена от {shop_name}. {description}',
  ADD COLUMN IF NOT EXISTS "category_meta_title_template" VARCHAR(255) NOT NULL DEFAULT '{name} - {shop_name}',
  ADD COLUMN IF NOT EXISTS "category_meta_description_template" VARCHAR(500) NOT NULL DEFAULT 'Разгледайте нашата категория {name} в {shop_name}. {description}';
