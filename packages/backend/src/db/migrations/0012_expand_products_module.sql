-- Migration: Expand Products Module with combinations, categories, and features
-- Created: 2025-11-08

-- ============================================================================
-- 1. Create new ENUM types
-- ============================================================================

-- Create product_type enum
CREATE TYPE "product_type" AS ENUM('simple', 'combination');

-- ============================================================================
-- 2. Update products table with new fields
-- ============================================================================

-- Add slug column
ALTER TABLE "products" ADD COLUMN "slug" varchar(255) NOT NULL DEFAULT '';
-- Create unique index after populating slugs
-- We'll need to populate slugs manually or through a separate script

-- Add short_description
ALTER TABLE "products" ADD COLUMN "short_description" text;

-- Add product_type
ALTER TABLE "products" ADD COLUMN "product_type" "product_type" NOT NULL DEFAULT 'simple';

-- Add associations
ALTER TABLE "products" ADD COLUMN "brand_id" uuid REFERENCES "brands"("id");
ALTER TABLE "products" ADD COLUMN "supplier_id" uuid REFERENCES "suppliers"("id");

-- Add physical attributes
ALTER TABLE "products" ADD COLUMN "weight" decimal(10, 3); -- in kg
ALTER TABLE "products" ADD COLUMN "width" decimal(10, 2); -- in cm
ALTER TABLE "products" ADD COLUMN "height" decimal(10, 2); -- in cm
ALTER TABLE "products" ADD COLUMN "depth" decimal(10, 2); -- in cm

-- Add SEO fields
ALTER TABLE "products" ADD COLUMN "meta_title" varchar(255);
ALTER TABLE "products" ADD COLUMN "meta_description" text;
ALTER TABLE "products" ADD COLUMN "meta_keywords" text;
ALTER TABLE "products" ADD COLUMN "og_title" varchar(255);
ALTER TABLE "products" ADD COLUMN "og_description" text;
ALTER TABLE "products" ADD COLUMN "og_image" varchar(500);
ALTER TABLE "products" ADD COLUMN "canonical_url" varchar(500);
ALTER TABLE "products" ADD COLUMN "robots_index" boolean NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "robots_follow" boolean NOT NULL DEFAULT true;

-- Remove old category_id (will be replaced by product_categories many-to-many)
-- We'll keep it for now and migrate data later
-- ALTER TABLE "products" DROP COLUMN "category_id";

-- ============================================================================
-- 3. Create product_combinations table
-- ============================================================================

CREATE TABLE "product_combinations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "sku" varchar(100) NOT NULL UNIQUE,
  "name" varchar(255),
  "price" decimal(10, 2),
  "compare_at_price" decimal(10, 2),
  "position" integer NOT NULL DEFAULT 0,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create index on product_id for faster lookups
CREATE INDEX "idx_product_combinations_product_id" ON "product_combinations"("product_id");

-- ============================================================================
-- 4. Create product_combination_attributes table (many-to-many)
-- ============================================================================

CREATE TABLE "product_combination_attributes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "combination_id" uuid NOT NULL REFERENCES "product_combinations"("id") ON DELETE CASCADE,
  "attribute_value_id" uuid NOT NULL REFERENCES "attribute_values"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX "idx_product_combination_attributes_combination_id" ON "product_combination_attributes"("combination_id");
CREATE INDEX "idx_product_combination_attributes_attribute_value_id" ON "product_combination_attributes"("attribute_value_id");

-- ============================================================================
-- 5. Create product_categories table (many-to-many)
-- ============================================================================

CREATE TABLE "product_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "is_primary" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX "idx_product_categories_product_id" ON "product_categories"("product_id");
CREATE INDEX "idx_product_categories_category_id" ON "product_categories"("category_id");

-- Ensure only one primary category per product
CREATE UNIQUE INDEX "idx_product_categories_one_primary" ON "product_categories"("product_id") WHERE "is_primary" = true;

-- ============================================================================
-- 6. Create product_features table (many-to-many)
-- ============================================================================

CREATE TABLE "product_features" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "feature_value_id" uuid NOT NULL REFERENCES "feature_values"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX "idx_product_features_product_id" ON "product_features"("product_id");
CREATE INDEX "idx_product_features_feature_value_id" ON "product_features"("feature_value_id");

-- ============================================================================
-- 7. Update product_images table to support combinations
-- ============================================================================

-- Make product_id nullable and add combination_id
ALTER TABLE "product_images" ALTER COLUMN "product_id" DROP NOT NULL;
ALTER TABLE "product_images" ADD COLUMN "combination_id" uuid REFERENCES "product_combinations"("id") ON DELETE CASCADE;

-- Add check constraint: either product_id or combination_id must be set (but not both)
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_check"
  CHECK (
    (product_id IS NOT NULL AND combination_id IS NULL) OR
    (product_id IS NULL AND combination_id IS NOT NULL)
  );

-- Create index on combination_id
CREATE INDEX "idx_product_images_combination_id" ON "product_images"("combination_id");

-- ============================================================================
-- 8. Update product_inventory table to support combinations
-- ============================================================================

-- Make product_id nullable and add combination_id
ALTER TABLE "product_inventory" ALTER COLUMN "product_id" DROP NOT NULL;
ALTER TABLE "product_inventory" ADD COLUMN "combination_id" uuid REFERENCES "product_combinations"("id") ON DELETE CASCADE;

-- Add check constraint: either product_id or combination_id must be set (but not both)
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_check"
  CHECK (
    (product_id IS NOT NULL AND combination_id IS NULL) OR
    (product_id IS NULL AND combination_id IS NOT NULL)
  );

-- Create index on combination_id
CREATE INDEX "idx_product_inventory_combination_id" ON "product_inventory"("combination_id");

-- ============================================================================
-- 9. Migrate existing data (if needed)
-- ============================================================================

-- Migrate existing products' category associations to product_categories table
INSERT INTO "product_categories" ("product_id", "category_id", "is_primary")
SELECT "id", "category_id", true
FROM "products"
WHERE "category_id" IS NOT NULL;

-- Now we can safely drop the old category_id column
ALTER TABLE "products" DROP COLUMN "category_id";

-- ============================================================================
-- 10. Create unique index on product slug (after manual slug population)
-- ============================================================================

-- NOTE: This should be run AFTER slugs are populated!
-- For now we'll leave it commented out
-- CREATE UNIQUE INDEX "idx_products_slug" ON "products"("slug");

-- ============================================================================
-- End of migration
-- ============================================================================
