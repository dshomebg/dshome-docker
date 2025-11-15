import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const blogAuthorStatusEnum = pgEnum('blog_author_status', ['active', 'inactive']);

// Blog Authors
export const blogAuthors = pgTable('blog_authors', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  bio: text('bio'), // Author biography
  image: varchar('image', { length: 500 }), // Avatar/profile image URL

  // Social Links
  facebookLink: varchar('facebook_link', { length: 500 }),
  instagramLink: varchar('instagram_link', { length: 500 }),
  youtubeLink: varchar('youtube_link', { length: 500 }),
  linkedinLink: varchar('linkedin_link', { length: 500 }),
  websiteLink: varchar('website_link', { length: 500 }),

  // Status
  status: blogAuthorStatusEnum('status').notNull().default('active'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type BlogAuthor = typeof blogAuthors.$inferSelect;
export type NewBlogAuthor = typeof blogAuthors.$inferInsert;
