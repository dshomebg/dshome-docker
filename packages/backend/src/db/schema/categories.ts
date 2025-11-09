import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const categoryStatusEnum = pgEnum('category_status', ['active', 'inactive']);
export const categoryStyleEnum = pgEnum('category_style', ['navigation', 'product']);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id, { onDelete: 'cascade' }),
  image: varchar('image', { length: 500 }),
  position: integer('position').notNull().default(0),
  status: categoryStatusEnum('status').notNull().default('active'),
  style: categoryStyleEnum('style').notNull().default('product'),
  // Frontend heading (h1)
  h1: text('h1'),
  // SEO fields
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
