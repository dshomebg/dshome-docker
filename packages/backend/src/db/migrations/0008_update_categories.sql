-- Rename image_url to image
ALTER TABLE "categories" RENAME COLUMN "image_url" TO "image";

-- Add SEO fields
ALTER TABLE "categories" ADD COLUMN "meta_title" varchar(255);
ALTER TABLE "categories" ADD COLUMN "meta_description" text;

-- Drop existing foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'categories_parent_id_categories_id_fk' 
    AND table_name = 'categories'
  ) THEN
    ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  END IF;
END $$;

-- Add foreign key with cascade delete
ALTER TABLE "categories" 
  ADD CONSTRAINT "categories_parent_id_categories_id_fk" 
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE;
