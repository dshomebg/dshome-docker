import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';

export const attributeDisplayTypeEnum = pgEnum('attribute_display_type', ['dropdown', 'radio', 'color']);
export const attributeStatusEnum = pgEnum('attribute_status', ['active', 'inactive']);

export const attributeGroups = pgTable('attribute_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  displayType: attributeDisplayTypeEnum('display_type').notNull().default('dropdown'),
  status: attributeStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const attributeValues = pgTable('attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  attributeGroupId: uuid('attribute_group_id').notNull().references(() => attributeGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  colorHex: varchar('color_hex', { length: 7 }), // For color type: #RRGGBB
  textureImage: varchar('texture_image', { length: 500 }), // Path to texture image
  position: integer('position').notNull().default(0), // For ordering
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type AttributeGroup = typeof attributeGroups.$inferSelect;
export type NewAttributeGroup = typeof attributeGroups.$inferInsert;
export type AttributeValue = typeof attributeValues.$inferSelect;
export type NewAttributeValue = typeof attributeValues.$inferInsert;
