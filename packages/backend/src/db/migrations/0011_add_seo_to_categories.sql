-- Add SEO fields to categories table
ALTER TABLE "categories" ADD COLUMN "meta_keywords" text;
ALTER TABLE "categories" ADD COLUMN "og_title" varchar(255);
ALTER TABLE "categories" ADD COLUMN "og_description" text;
ALTER TABLE "categories" ADD COLUMN "og_image" varchar(500);
ALTER TABLE "categories" ADD COLUMN "canonical_url" varchar(500);
ALTER TABLE "categories" ADD COLUMN "robots_index" boolean DEFAULT true NOT NULL;
ALTER TABLE "categories" ADD COLUMN "robots_follow" boolean DEFAULT true NOT NULL;
