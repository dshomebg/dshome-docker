import { pgTable, uuid, boolean, integer, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const similarProductsSettings = pgTable('similar_products_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Global Settings
  moduleEnabled: boolean('module_enabled').notNull().default(true),
  defaultLimit: integer('default_limit').notNull().default(12),
  cacheDuration: integer('cache_duration').notNull().default(900), // seconds
  excludeOutOfStock: boolean('exclude_out_of_stock').notNull().default(true),

  // Same Category Sub-module
  sameCategoryEnabled: boolean('same_category_enabled').notNull().default(true),
  sameCategoryLimit: integer('same_category_limit').notNull().default(8),
  sameCategoryTitle: varchar('same_category_title', { length: 255 }).notNull().default('Продукти от същата категория'),
  sameCategorySort: varchar('same_category_sort', { length: 50 }).notNull().default('popularity'), // popularity, price_asc, price_desc, newest, random, rating
  sameCategoryMatchType: varchar('same_category_match_type', { length: 50 }).notNull().default('primary_only'), // primary_only, same_parent, any_shared
  sameCategoryShowImage: boolean('same_category_show_image').notNull().default(true),
  sameCategoryShowPrice: boolean('same_category_show_price').notNull().default(true),
  sameCategoryShowAddToCart: boolean('same_category_show_add_to_cart').notNull().default(true),

  // Similar Features Sub-module
  similarFeaturesEnabled: boolean('similar_features_enabled').notNull().default(true),
  similarFeaturesLimit: integer('similar_features_limit').notNull().default(8),
  similarFeaturesTitle: varchar('similar_features_title', { length: 255 }).notNull().default('Продукти с подобни характеристики'),
  similarFeaturesMinSimilarity: integer('similar_features_min_similarity').notNull().default(30), // percentage 0-100
  similarFeaturesShowScore: boolean('similar_features_show_score').notNull().default(false),
  similarFeaturesFallback: varchar('similar_features_fallback', { length: 50 }).notNull().default('same_category'), // same_category, hide, show_all
  similarFeaturesCombineWithSameCategory: boolean('similar_features_combine_with_same_category').notNull().default(false),
  similarFeaturesShowImage: boolean('similar_features_show_image').notNull().default(true),
  similarFeaturesShowPrice: boolean('similar_features_show_price').notNull().default(true),
  similarFeaturesShowAddToCart: boolean('similar_features_show_add_to_cart').notNull().default(true),

  // Related Products Sub-module
  relatedEnabled: boolean('related_enabled').notNull().default(true),
  relatedLimit: integer('related_limit').notNull().default(6),
  relatedTitle: varchar('related_title', { length: 255 }).notNull().default('Свързани продукти'),
  relatedBidirectional: boolean('related_bidirectional').notNull().default(false),
  relatedPriority: varchar('related_priority', { length: 50 }).notNull().default('high'), // high, medium, low
  relatedShowImage: boolean('related_show_image').notNull().default(true),
  relatedShowPrice: boolean('related_show_price').notNull().default(true),
  relatedShowAddToCart: boolean('related_show_add_to_cart').notNull().default(true),

  // Display Settings
  layoutType: varchar('layout_type', { length: 50 }).notNull().default('grid'), // grid, carousel, list
  gridColumns: integer('grid_columns').notNull().default(4), // 2, 3, 4, 6
  cardStyle: varchar('card_style', { length: 50 }).notNull().default('standard'), // compact, standard, detailed
  showSectionDividers: boolean('show_section_dividers').notNull().default(true),
  animation: varchar('animation', { length: 50 }).notNull().default('fade'), // fade, slide, none
  mobileLayout: varchar('mobile_layout', { length: 50 }).notNull().default('same'), // same, stack

  // Advanced Settings
  excludedCategoryIds: jsonb('excluded_category_ids').notNull().default([]),
  excludedProductIds: jsonb('excluded_product_ids').notNull().default([]),
  maxCandidates: integer('max_candidates').notNull().default(100),
  enableQueryCaching: boolean('enable_query_caching').notNull().default(true),
  moduleOrder: jsonb('module_order').notNull().default(['related', 'similar_features', 'same_category']), // priority order

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type SimilarProductsSettings = typeof similarProductsSettings.$inferSelect;
export type NewSimilarProductsSettings = typeof similarProductsSettings.$inferInsert;
