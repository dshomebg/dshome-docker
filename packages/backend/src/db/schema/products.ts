import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer, decimal, boolean } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { brands } from './brands';
import { suppliers } from './suppliers';
import { attributeValues } from './attributes';
import { featureValues } from './features';
import { warehouses } from './warehouses';

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'archived']);
export const productTypeEnum = pgEnum('product_type', ['simple', 'combination']);
export const discountTypeEnum = pgEnum('discount_type', ['fixed', 'percentage']);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  shortDescription: text('short_description'),
  description: text('description'),
  productType: productTypeEnum('product_type').notNull().default('simple'),

  // Associations
  brandId: uuid('brand_id').references(() => brands.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),

  // Physical attributes
  weight: decimal('weight', { precision: 10, scale: 3 }), // in kg
  width: decimal('width', { precision: 10, scale: 2 }), // in cm
  height: decimal('height', { precision: 10, scale: 2 }), // in cm
  depth: decimal('depth', { precision: 10, scale: 2 }), // in cm

  // SEO fields
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  ogTitle: varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImage: varchar('og_image', { length: 500 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  robotsIndex: boolean('robots_index').notNull().default(true),
  robotsFollow: boolean('robots_follow').notNull().default(true),

  status: productStatusEnum('status').notNull().default('inactive'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Product Combinations (for products with variants)
export const productCombinations = pgTable('product_combinations', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  priceImpact: decimal('price_impact', { precision: 10, scale: 2 }).default('0'), // Additional price to base price
  weight: decimal('weight', { precision: 10, scale: 3 }), // Total weight in kg
  weightImpact: decimal('weight_impact', { precision: 10, scale: 3 }).default('0'), // Additional weight to base weight
  quantity: integer('quantity').notNull().default(0), // Quantity for this combination
  position: integer('position').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Links combinations to attribute values (many-to-many)
export const productCombinationAttributes = pgTable('product_combination_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  combinationId: uuid('combination_id').notNull().references(() => productCombinations.id, { onDelete: 'cascade' }),
  attributeValueId: uuid('attribute_value_id').notNull().references(() => attributeValues.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Links products to categories (many-to-many)
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Links products to feature values (many-to-many)
export const productFeatures = pgTable('product_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  featureValueId: uuid('feature_value_id').notNull().references(() => featureValues.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Product images - can belong to product or combination
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  combinationId: uuid('combination_id').references(() => productCombinations.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),
  position: integer('position').notNull().default(0),
  altText: varchar('alt_text', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Product prices - history enabled
export const productPrices = pgTable('product_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price with VAT
  priceWithoutVat: decimal('price_without_vat', { precision: 10, scale: 2 }), // Price without VAT
  supplierPrice: decimal('supplier_price', { precision: 10, scale: 2 }), // Cost price (always without VAT)
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),

  // Discount fields
  discountType: discountTypeEnum('discount_type'), // fixed amount or percentage
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }), // Amount or percentage value
  discountStartDate: timestamp('discount_start_date'),
  discountEndDate: timestamp('discount_end_date'),
  promotionalPrice: decimal('promotional_price', { precision: 10, scale: 2 }), // Price after discount

  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  validFrom: timestamp('valid_from').notNull().defaultNow(),
  validTo: timestamp('valid_to'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Type exports
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductCombination = typeof productCombinations.$inferSelect;
export type NewProductCombination = typeof productCombinations.$inferInsert;
export type ProductCombinationAttribute = typeof productCombinationAttributes.$inferSelect;
export type NewProductCombinationAttribute = typeof productCombinationAttributes.$inferInsert;
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
export type ProductFeature = typeof productFeatures.$inferSelect;
export type NewProductFeature = typeof productFeatures.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;
