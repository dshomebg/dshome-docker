import { pgTable, uuid, varchar, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const blogCategoryStatusEnum = pgEnum('blog_category_status', ['active', 'inactive']);

// Blog Categories
export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'), // WYSIWYG content
  image: varchar('image', { length: 500 }), // Featured image URL

  // Hierarchy
  parentId: uuid('parent_id'), // Self-referencing for nested categories

  // Display
  position: integer('position').notNull().default(0),
  status: blogCategoryStatusEnum('status').notNull().default('active'),

  // SEO
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  robotsIndex: boolean('robots_index').notNull().default(true),
  robotsFollow: boolean('robots_follow').notNull().default(true),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
