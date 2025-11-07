import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { warehouses } from './warehouses';

export const productInventory = pgTable('product_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
  quantity: integer('quantity').notNull().default(0),
  reservedQuantity: integer('reserved_quantity').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type ProductInventory = typeof productInventory.$inferSelect;
export type NewProductInventory = typeof productInventory.$inferInsert;
