import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer, boolean, json } from 'drizzle-orm/pg-core';
import { products } from './products';
import { customers } from './customers';

export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

// Product Reviews
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }), // Nullable for anonymous reviews

  // Review content
  rating: integer('rating').notNull(), // 1-5
  title: varchar('title', { length: 200 }),
  content: text('content').notNull(),

  // Reviewer info (for manual/anonymous reviews)
  reviewerName: varchar('reviewer_name', { length: 255 }).notNull(),
  reviewerEmail: varchar('reviewer_email', { length: 255 }),

  // Review metadata
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(false), // Admin approves this

  // Images
  images: json('images').$type<string[]>().default([]), // Array of image URLs

  // Helpful votes
  helpfulCount: integer('helpful_count').notNull().default(0),
  notHelpfulCount: integer('not_helpful_count').notNull().default(0),

  // Store reply
  storeReply: text('store_reply'),
  storeReplyDate: timestamp('store_reply_date'),
  storeRepliedBy: uuid('store_replied_by'), // Admin user who replied

  // Status and moderation
  status: reviewStatusEnum('status').notNull().default('pending'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Helpful votes tracking
export const reviewHelpfulVotes = pgTable('review_helpful_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }), // Nullable for guest votes
  sessionId: varchar('session_id', { length: 255 }), // For anonymous votes
  isHelpful: boolean('is_helpful').notNull(), // true = helpful, false = not helpful
  createdAt: timestamp('created_at').notNull().defaultNow()
});
