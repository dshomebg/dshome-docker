-- Create enums
DO $$ BEGIN
 CREATE TYPE "template_type" AS ENUM('category', 'search');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "filter_type" AS ENUM('price', 'brand', 'feature_group', 'attribute_group');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create filter_templates table
CREATE TABLE IF NOT EXISTS "filter_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "template_type" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create filter_template_items table
CREATE TABLE IF NOT EXISTS "filter_template_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL REFERENCES "filter_templates"("id") ON DELETE CASCADE,
	"filter_type" "filter_type" NOT NULL,
	"label" varchar(255) NOT NULL,
	"config" json,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default templates
INSERT INTO "filter_templates" ("name", "type", "description") VALUES
('Филтри за категории', 'category', 'Филтри които се показват на страниците с категории'),
('Филтри за търсене', 'search', 'Филтри които се показват на страницата за търсене')
ON CONFLICT DO NOTHING;
