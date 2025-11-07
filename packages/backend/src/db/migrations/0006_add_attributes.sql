-- Create attribute display type enum
CREATE TYPE "attribute_display_type" AS ENUM ('dropdown', 'radio', 'color');

-- Create attribute status enum
CREATE TYPE "attribute_status" AS ENUM ('active', 'inactive');

-- Create attribute_groups table
CREATE TABLE "attribute_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "display_type" "attribute_display_type" DEFAULT 'dropdown' NOT NULL,
  "status" "attribute_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create attribute_values table
CREATE TABLE "attribute_values" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attribute_group_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "color_hex" varchar(7),
  "texture_image" varchar(500),
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_group_id_attribute_groups_id_fk"
FOREIGN KEY ("attribute_group_id") REFERENCES "attribute_groups"("id") ON DELETE cascade ON UPDATE no action;
