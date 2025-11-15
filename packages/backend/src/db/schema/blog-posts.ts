import { pgTable, uuid, varchar, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { blogCategories } from './blog-categories';
import { blogAuthors } from './blog-authors';

export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'archived']);

// Blog Posts
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  excerpt: text('excerpt'), // Short description/summary
  content: text('content').notNull(), // WYSIWYG content
  featuredImage: varchar('featured_image', { length: 500 }), // Main post image

  // Relationships
  categoryId: uuid('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  authorId: uuid('author_id').references(() => blogAuthors.id, { onDelete: 'set null' }),

  // Status & Publishing
  status: blogPostStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),

  // Statistics
  viewsCount: integer('views_count').notNull().default(0),

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

// Blog Post Views (for tracking unique views)
export const blogPostViews = pgTable('blog_post_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),

  // Tracking info
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: varchar('user_agent', { length: 500 }),

  // Timestamp
  viewedAt: timestamp('viewed_at').notNull().defaultNow()
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogPostView = typeof blogPostViews.$inferSelect;
export type NewBlogPostView = typeof blogPostViews.$inferInsert;
