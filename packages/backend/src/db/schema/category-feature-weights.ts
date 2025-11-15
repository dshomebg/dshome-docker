import { pgTable, uuid, integer, timestamp, varchar, unique } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { featureGroups } from './features';

// Category Feature Weights for Similar Products algorithm
export const categoryFeatureWeights = pgTable('category_feature_weights', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Category reference
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),

  // Feature group reference (nullable for 'price' type)
  featureGroupId: uuid('feature_group_id').references(() => featureGroups.id, { onDelete: 'cascade' }),

  // Type: 'price' or 'feature_group'
  weightType: varchar('weight_type', { length: 20 }).notNull(),

  // Weight 0-100 (can be 0)
  weight: integer('weight').notNull().default(0),

  // Position for ordering
  position: integer('position').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  // Unique constraint: one weight per category per feature group
  uniqueCategoryFeatureGroup: unique('unique_category_feature_group').on(table.categoryId, table.featureGroupId),
  // Unique constraint: one price weight per category
  uniqueCategoryPrice: unique('unique_category_price').on(table.categoryId, table.weightType)
}));

export type CategoryFeatureWeight = typeof categoryFeatureWeights.$inferSelect;
export type NewCategoryFeatureWeight = typeof categoryFeatureWeights.$inferInsert;
