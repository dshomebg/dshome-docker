-- Migration: Add general settings table
-- Date: 2025-11-09
-- Description: Adds table for global application settings including BaseUrl

-- Create general_settings table
CREATE TABLE IF NOT EXISTS "general_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "base_url" VARCHAR(255) NOT NULL DEFAULT 'https://example.com',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default general settings
INSERT INTO "general_settings" ("base_url")
VALUES ('https://example.com')
ON CONFLICT DO NOTHING;
