-- Drop old warehouse_status enum value 'maintenance'
-- Note: Cannot remove enum values in PostgreSQL, so we'll keep it but won't use it
--> statement-breakpoint

-- Add new columns
ALTER TABLE "warehouses" ADD COLUMN "working_hours" text;
--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "latitude" numeric(10, 8);
--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "longitude" numeric(11, 8);
--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "is_physical_store" boolean DEFAULT false NOT NULL;
--> statement-breakpoint

-- Drop old columns that are no longer needed
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "slug";
--> statement-breakpoint
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "code";
--> statement-breakpoint
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "city";
--> statement-breakpoint
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "country";
--> statement-breakpoint
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "manager";
--> statement-breakpoint
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "capacity";
