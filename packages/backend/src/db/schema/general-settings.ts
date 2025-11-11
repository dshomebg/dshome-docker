import { pgTable, uuid, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const generalSettings = pgTable('general_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseUrl: varchar('base_url', { length: 255 }).notNull().default('https://example.com'),

  // Image upload settings
  maxImageUploadSizeMb: integer('max_image_upload_size_mb').notNull().default(5),
  allowedImageFormats: jsonb('allowed_image_formats').notNull().default(['jpeg', 'jpg', 'png', 'webp', 'gif']),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type NewGeneralSettings = typeof generalSettings.$inferInsert;
