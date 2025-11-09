-- Migration: Add price_without_vat and supplier_price fields
-- Date: 2025-11-09
-- Description: Adds price without VAT and supplier price fields for margin calculations

-- Add price_without_vat field
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "price_without_vat" NUMERIC(10, 2);

-- Add supplier_price field (cost price)
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "supplier_price" NUMERIC(10, 2);
