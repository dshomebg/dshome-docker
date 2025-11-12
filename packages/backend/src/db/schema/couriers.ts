import { pgTable, uuid, varchar, boolean, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';

export const deliveryTypeEnum = pgEnum('delivery_type', ['address', 'office']);

export const couriers = pgTable('couriers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  trackingUrl: varchar('tracking_url', { length: 500 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  offersOfficeDelivery: boolean('offers_office_delivery').notNull().default(false),
  palletDeliveryEnabled: boolean('pallet_delivery_enabled').notNull().default(false),
  palletWeightThreshold: decimal('pallet_weight_threshold', { precision: 10, scale: 2 }),
  palletMaxWeight: decimal('pallet_max_weight', { precision: 10, scale: 2 }),
  palletPrice: decimal('pallet_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const courierPricingRanges = pgTable('courier_pricing_ranges', {
  id: uuid('id').primaryKey().defaultRandom(),
  courierId: uuid('courier_id').notNull().references(() => couriers.id, { onDelete: 'cascade' }),
  deliveryType: deliveryTypeEnum('delivery_type').notNull(),
  weightFrom: decimal('weight_from', { precision: 10, scale: 2 }).notNull(),
  weightTo: decimal('weight_to', { precision: 10, scale: 2 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Courier = typeof couriers.$inferSelect;
export type NewCourier = typeof couriers.$inferInsert;
export type CourierPricingRange = typeof courierPricingRanges.$inferSelect;
export type NewCourierPricingRange = typeof courierPricingRanges.$inferInsert;
