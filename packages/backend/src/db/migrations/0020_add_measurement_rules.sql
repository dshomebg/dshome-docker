-- Migration: Add measurement rules and product measurement configuration
-- Date: 2025-11-09
-- Description: Adds functionality for products sold in packages with unit-based pricing

-- Create calculation_type enum
DO $$ BEGIN
  CREATE TYPE "calculation_type" AS ENUM('package_based', 'minimum_quantity', 'step_quantity');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create measurement_status enum
DO $$ BEGIN
  CREATE TYPE "measurement_status" AS ENUM('active', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create measurement_rules table
CREATE TABLE IF NOT EXISTS "measurement_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "calculation_type" "calculation_type" NOT NULL,
  "status" "measurement_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create product_measurement_config table
CREATE TABLE IF NOT EXISTS "product_measurement_config" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL UNIQUE REFERENCES "products"("id") ON DELETE CASCADE,
  "measurement_rule_id" UUID NOT NULL REFERENCES "measurement_rules"("id"),
  "pricing_unit" VARCHAR(50) NOT NULL,
  "selling_unit" VARCHAR(50) NOT NULL,
  "units_per_package" NUMERIC(10, 3),
  "minimum_quantity" NUMERIC(10, 3),
  "step_quantity" NUMERIC(10, 3),
  "display_both_units" BOOLEAN NOT NULL DEFAULT TRUE,
  "calculator_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_measurement_rules_slug" ON "measurement_rules"("slug");
CREATE INDEX IF NOT EXISTS "idx_measurement_rules_status" ON "measurement_rules"("status");
CREATE INDEX IF NOT EXISTS "idx_product_measurement_config_product_id" ON "product_measurement_config"("product_id");
CREATE INDEX IF NOT EXISTS "idx_product_measurement_config_rule_id" ON "product_measurement_config"("measurement_rule_id");

-- Insert default measurement rules
INSERT INTO "measurement_rules" ("name", "slug", "description", "calculation_type", "status")
VALUES
  ('Пакети м²', 'paketi-m2', 'Продукти, които се продават в пакети, но цената е на квадратен метър (плочки, ламинат и др.)', 'package_based', 'active'),
  ('Минимално количество', 'minimalno-kolichestvo', 'Продукти с минимално количество за поръчка', 'minimum_quantity', 'active'),
  ('Стъпка на увеличение', 'stapka-na-uvelichenie', 'Продукти, които се продават на определена стъпка (по 0.5м, 1м и т.н.)', 'step_quantity', 'active')
ON CONFLICT (slug) DO NOTHING;
