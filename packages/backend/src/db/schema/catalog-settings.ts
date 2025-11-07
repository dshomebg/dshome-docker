import { pgTable, uuid, integer, varchar, timestamp, pgEnum, decimal } from 'drizzle-orm/pg-core';

export const productSortingEnum = pgEnum('product_sorting', [
  'name_asc',
  'name_desc',
  'price_asc',
  'price_desc',
  'created_desc',
  'created_asc'
]);

export const catalogSettings = pgTable('catalog_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vatPercentage: decimal('vat_percentage', { precision: 5, scale: 2 }).notNull().default('20.00'),
  productsPerPage: integer('products_per_page').notNull().default(20),
  newProductPeriodDays: integer('new_product_period_days').notNull().default(30),
  defaultSorting: productSortingEnum('default_sorting').notNull().default('created_desc'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const deliveryTimeTemplates = pgTable('delivery_time_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type CatalogSettings = typeof catalogSettings.$inferSelect;
export type NewCatalogSettings = typeof catalogSettings.$inferInsert;
export type DeliveryTimeTemplate = typeof deliveryTimeTemplates.$inferSelect;
export type NewDeliveryTimeTemplate = typeof deliveryTimeTemplates.$inferInsert;
