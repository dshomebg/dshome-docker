import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer, decimal } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'draft', 'archived']);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  status: productStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),
  position: integer('position').notNull().default(0),
  altText: varchar('alt_text', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const productPrices = pgTable('product_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  validFrom: timestamp('valid_from').notNull().defaultNow(),
  validTo: timestamp('valid_to'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;
