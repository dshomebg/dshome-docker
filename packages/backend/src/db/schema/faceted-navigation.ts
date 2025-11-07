import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, boolean, json } from 'drizzle-orm/pg-core';

export const templateTypeEnum = pgEnum('template_type', ['category', 'search']);
export const filterTypeEnum = pgEnum('filter_type', ['price', 'brand', 'feature_group', 'attribute_group']);

export const filterTemplates = pgTable('filter_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: templateTypeEnum('type').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const filterTemplateItems = pgTable('filter_template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => filterTemplates.id, { onDelete: 'cascade' }),
  filterType: filterTypeEnum('filter_type').notNull(),
  label: varchar('label', { length: 255 }).notNull(), // Display label
  config: json('config'), // Filter-specific configuration (e.g., { priceDisplayType: 'slider' | 'from-to', featureGroupIds: ['uuid1', 'uuid2'] })
  position: integer('position').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type FilterTemplate = typeof filterTemplates.$inferSelect;
export type NewFilterTemplate = typeof filterTemplates.$inferInsert;
export type FilterTemplateItem = typeof filterTemplateItems.$inferSelect;
export type NewFilterTemplateItem = typeof filterTemplateItems.$inferInsert;
