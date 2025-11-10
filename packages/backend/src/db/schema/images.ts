import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';

export const entityTypeEnum = pgEnum('image_entity_type', ['product', 'category', 'brand', 'blog']);
export const fitModeEnum = pgEnum('image_fit_mode', ['inside', 'cover', 'fill', 'contain']);
export const imageFormatEnum = pgEnum('image_format', ['webp', 'jpeg', 'png']);
export const jobStatusEnum = pgEnum('image_job_status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);

/**
 * Image Size Templates
 * Defines the configuration for image sizes (UI-driven)
 */
export const imageSizeTemplates = pgTable('image_size_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g., 'product_large'
  displayName: varchar('display_name', { length: 255 }).notNull(), // e.g., 'Product - Large Image'
  entityType: entityTypeEnum('entity_type').notNull(), // product, category, brand, blog
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  fitMode: fitModeEnum('fit_mode').notNull().default('inside'), // inside, cover, fill, contain
  quality: integer('quality').notNull().default(85), // 1-100
  format: imageFormatEnum('format').notNull().default('webp'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Image Files
 * Tracks all generated image files
 */
export const imageFiles = pgTable('image_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(), // ID of product/category/brand/blog
  sizeTemplate: varchar('size_template', { length: 100 }).notNull(), // References imageSizeTemplates.name

  // Original file info
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  originalPath: varchar('original_path', { length: 500 }).notNull(),
  originalMimeType: varchar('original_mime_type', { length: 100 }),
  originalSize: integer('original_size'), // bytes
  originalWidth: integer('original_width'),
  originalHeight: integer('original_height'),

  // Generated file info
  generatedPath: varchar('generated_path', { length: 500 }).notNull(),
  generatedSize: integer('generated_size'), // bytes
  generatedWidth: integer('generated_width'),
  generatedHeight: integer('generated_height'),

  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * Image Regeneration Jobs
 * Tracks batch regeneration jobs
 */
export const imageRegenerationJobs = pgTable('image_regeneration_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: entityTypeEnum('entity_type').notNull(),
  sizeTemplate: varchar('size_template', { length: 100 }).notNull(),

  // Job config
  entityIds: jsonb('entity_ids'), // Array of UUIDs, null = all entities
  totalCount: integer('total_count').notNull().default(0),
  processedCount: integer('processed_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),

  // Status tracking
  status: jobStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),

  // Metadata
  triggeredBy: uuid('triggered_by'), // User ID who triggered regeneration
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports
export type ImageSizeTemplate = typeof imageSizeTemplates.$inferSelect;
export type NewImageSizeTemplate = typeof imageSizeTemplates.$inferInsert;
export type ImageFile = typeof imageFiles.$inferSelect;
export type NewImageFile = typeof imageFiles.$inferInsert;
export type ImageRegenerationJob = typeof imageRegenerationJobs.$inferSelect;
export type NewImageRegenerationJob = typeof imageRegenerationJobs.$inferInsert;
