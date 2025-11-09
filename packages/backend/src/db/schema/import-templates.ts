import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const importTemplates = pgTable('import_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  columnMapping: jsonb('column_mapping').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type ImportTemplate = typeof importTemplates.$inferSelect;
export type NewImportTemplate = typeof importTemplates.$inferInsert;
