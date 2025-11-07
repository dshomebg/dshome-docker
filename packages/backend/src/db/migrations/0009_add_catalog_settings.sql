-- Create product_sorting enum
DO $$ BEGIN
 CREATE TYPE "product_sorting" AS ENUM('name_asc', 'name_desc', 'price_asc', 'price_desc', 'created_desc', 'created_asc');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create catalog_settings table
CREATE TABLE IF NOT EXISTS "catalog_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vat_percentage" numeric(5, 2) DEFAULT '20.00' NOT NULL,
	"products_per_page" integer DEFAULT 20 NOT NULL,
	"new_product_period_days" integer DEFAULT 30 NOT NULL,
	"default_sorting" "product_sorting" DEFAULT 'created_desc' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create delivery_time_templates table
CREATE TABLE IF NOT EXISTS "delivery_time_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default catalog settings
INSERT INTO "catalog_settings" ("id", "vat_percentage", "products_per_page", "new_product_period_days", "default_sorting", "created_at", "updated_at")
VALUES (gen_random_uuid(), '20.00', 20, 30, 'created_desc', now(), now())
ON CONFLICT DO NOTHING;

-- Insert default delivery time templates
INSERT INTO "delivery_time_templates" ("name", "position") VALUES
('1-2 работни дни', 0),
('3-5 работни дни', 1),
('5-7 работни дни', 2),
('7-10 работни дни', 3),
('По договаряне', 4)
ON CONFLICT DO NOTHING;
