import { pgTable, uuid, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { emailTemplates } from './email-templates';

export const orderStatuses = pgTable('order_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'), // HEX color format
  visibleToCustomer: boolean('visible_to_customer').notNull().default(true),
  sendEmail: boolean('send_email').notNull().default(false),
  emailTemplateId: uuid('email_template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type OrderStatus = typeof orderStatuses.$inferSelect;
export type NewOrderStatus = typeof orderStatuses.$inferInsert;
