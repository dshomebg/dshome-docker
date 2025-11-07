import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, decimal } from 'drizzle-orm/pg-core';

export const warehouseStatusEnum = pgEnum('warehouse_status', ['active', 'inactive']);

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  workingHours: text('working_hours'),
  url: varchar('url', { length: 500 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isPhysicalStore: boolean('is_physical_store').notNull().default(false),
  status: warehouseStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
