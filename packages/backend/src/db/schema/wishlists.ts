import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { customers } from './customers';

// Customer Wishlists
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Customer reference (nullable for guest users)
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),

  // Session ID for guest users (before registration/login)
  sessionId: varchar('session_id', { length: 255 }),

  // Product reference
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),

  // Optional: specific product combination/variant
  combinationId: uuid('combination_id'), // References product_combinations if variant is selected

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
