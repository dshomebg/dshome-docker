import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Personal Info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),

  // Address
  address: varchar('address', { length: 500 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull().default('Bulgaria'),

  // Company Info (Optional)
  companyName: varchar('company_name', { length: 255 }),
  vatNumber: varchar('vat_number', { length: 50 }),

  // Registration
  isRegistered: boolean('is_registered').notNull().default(false),
  password: varchar('password', { length: 255 }), // nullable - само ако е registered

  // Status & Notes
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'), // Admin notes

  // Timestamps
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
