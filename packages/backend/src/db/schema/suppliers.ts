import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const supplierStatusEnum = pgEnum('supplier_status', ['active', 'inactive']);

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  vat: varchar('vat', { length: 50 }), // VAT/ДДС номер
  contactPerson: varchar('contact_person', { length: 255 }),
  description: text('description'),
  status: supplierStatusEnum('status').notNull().default('active'),
  isDefault: boolean('is_default').notNull().default(false),
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
