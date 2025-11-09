import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const generalSettings = pgTable('general_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseUrl: varchar('base_url', { length: 255 }).notNull().default('https://example.com'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type NewGeneralSettings = typeof generalSettings.$inferInsert;
