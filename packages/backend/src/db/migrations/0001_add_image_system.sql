-- Migration: Add image size templates and tracking system
-- Created: 2025-11-10

-- Create enum types
CREATE TYPE "image_entity_type" AS ENUM ('product', 'category', 'brand', 'blog');
CREATE TYPE "image_fit_mode" AS ENUM ('inside', 'cover', 'fill', 'contain');
CREATE TYPE "image_format" AS ENUM ('webp', 'jpeg', 'png');
CREATE TYPE "image_job_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create image_size_templates table
CREATE TABLE "image_size_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(100) NOT NULL UNIQUE,
  "display_name" varchar(255) NOT NULL,
  "entity_type" "image_entity_type" NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "fit_mode" "image_fit_mode" NOT NULL DEFAULT 'inside',
  "quality" integer NOT NULL DEFAULT 85,
  "format" "image_format" NOT NULL DEFAULT 'webp',
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "description" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create image_files table
CREATE TABLE "image_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" "image_entity_type" NOT NULL,
  "entity_id" uuid NOT NULL,
  "size_template" varchar(100) NOT NULL,
  "original_filename" varchar(255) NOT NULL,
  "original_path" varchar(500) NOT NULL,
  "original_mime_type" varchar(100),
  "original_size" integer,
  "original_width" integer,
  "original_height" integer,
  "generated_path" varchar(500) NOT NULL,
  "generated_size" integer,
  "generated_width" integer,
  "generated_height" integer,
  "generated_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create image_regeneration_jobs table
CREATE TABLE "image_regeneration_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" "image_entity_type" NOT NULL,
  "size_template" varchar(100) NOT NULL,
  "entity_ids" jsonb,
  "total_count" integer NOT NULL DEFAULT 0,
  "processed_count" integer NOT NULL DEFAULT 0,
  "failed_count" integer NOT NULL DEFAULT 0,
  "status" "image_job_status" NOT NULL DEFAULT 'pending',
  "started_at" timestamp,
  "completed_at" timestamp,
  "error_message" text,
  "triggered_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_image_files_entity ON "image_files"("entity_type", "entity_id");
CREATE INDEX idx_image_files_template ON "image_files"("size_template");
CREATE INDEX idx_image_jobs_status ON "image_regeneration_jobs"("status");
