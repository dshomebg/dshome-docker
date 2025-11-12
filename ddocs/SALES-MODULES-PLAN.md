# Sales Modules Implementation Plan

**Дата:** 2025-11-12
**Статус:** Планиране

## Обща Информация

Трябва да създадем 3 нови модула за секцията "Продажби":
1. **Клиенти (Customers)**
2. **Куриери (Couriers)**
3. **Статуси на поръчки (Order Statuses)**

Също така трябва да довършим модула **Поръчки (Orders)** който е частично имплементиран.

---

## 1. Customers Module (Клиенти)

### 1.1 Database Schema

**Файл:** `packages/backend/src/db/schema/customers.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // nullable for guest checkout
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  isGuest: boolean('is_guest').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'), // Admin notes
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull().default('Bulgaria'),
  isDefault: boolean('is_default').notNull().default(false),
  type: varchar('type', { length: 20 }).notNull().default('both'), // 'billing', 'shipping', 'both'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type NewCustomerAddress = typeof customerAddresses.$inferInsert;
```

**Промени в orders.ts:**
```typescript
// Add foreign key to orders table
customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
```

### 1.2 Backend API Routes

**Файл:** `packages/backend/src/routes/customers.routes.ts`

```typescript
import { Router } from 'express';
import * as customersController from '../controllers/customers.controller';

const router = Router();

// Customers CRUD
router.get('/', customersController.getAll);
router.get('/:id', customersController.getOne);
router.post('/', customersController.create);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.deleteCustomer);

// Customer addresses
router.get('/:id/addresses', customersController.getAddresses);
router.post('/:id/addresses', customersController.createAddress);
router.put('/addresses/:addressId', customersController.updateAddress);
router.delete('/addresses/:addressId', customersController.deleteAddress);

// Customer orders
router.get('/:id/orders', customersController.getOrders);

// Statistics
router.get('/:id/stats', customersController.getStats);

export default router;
```

### 1.3 Backend Controller

**Файл:** `packages/backend/src/controllers/customers.controller.ts`

Ще съдържа:
- `getAll()` - List customers with pagination, search, filters
- `getOne()` - Get single customer with addresses
- `create()` - Create customer (admin or registration)
- `update()` - Update customer info
- `deleteCustomer()` - Soft delete or hard delete
- `getAddresses()` - List customer addresses
- `createAddress()` - Add address
- `updateAddress()` - Update address
- `deleteAddress()` - Delete address
- `getOrders()` - Get customer order history
- `getStats()` - Customer statistics (total orders, total spent, etc.)

### 1.4 Admin UI Pages

**Директория:** `packages/admin/app/(dashboard)/sales/customers/`

**Файлове:**
```
sales/customers/
├── page.tsx                 # List page with table
├── new/
│   └── page.tsx            # Create customer form
└── [id]/
    ├── page.tsx            # Customer detail/edit
    └── addresses/
        └── page.tsx        # Manage addresses
```

**Компоненти:**
- `CustomerList.tsx` - Таблица с клиенти
- `CustomerForm.tsx` - Форма за създаване/редакция
- `CustomerDetail.tsx` - Детайли + статистика
- `AddressForm.tsx` - Форма за адрес
- `AddressList.tsx` - Списък с адреси

**Features:**
- Pagination
- Search по email, име, телефон
- Филтри: активни/неактивни, guest/registered
- Сортиране
- Export to Excel
- View order history
- Add notes

---

## 2. Couriers Module (Куриери)

### 2.1 Database Schema

**Файл:** `packages/backend/src/db/schema/couriers.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

export const couriers = pgTable('couriers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // speedy, econt, dhl
  website: varchar('website', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  trackingUrlTemplate: varchar('tracking_url_template', { length: 500 }), // e.g. https://speedy.bg/track/{trackingNumber}
  apiKey: varchar('api_key', { length: 255 }), // за API integration
  apiSecret: varchar('api_secret', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const courierZones = pgTable('courier_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  courierId: uuid('courier_id').notNull().references(() => couriers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(), // e.g. "Sofia", "Bulgaria", "EU"
  countries: text('countries'), // JSON array or comma-separated
  cities: text('cities'), // JSON array or comma-separated
  postalCodes: text('postal_codes'), // ranges or specific codes
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }), // nullable
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }), // nullable
  estimatedDays: varchar('estimated_days', { length: 50 }), // e.g. "1-2 дни"
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type Courier = typeof couriers.$inferSelect;
export type NewCourier = typeof couriers.$inferInsert;
export type CourierZone = typeof courierZones.$inferSelect;
export type NewCourierZone = typeof courierZones.$inferInsert;
```

**Промени в orders.ts:**
```typescript
// Add courier info to orders
courierId: uuid('courier_id').references(() => couriers.id, { onDelete: 'set null' }),
courierName: varchar('courier_name', { length: 100 }), // snapshot
trackingNumber: varchar('tracking_number', { length: 100 }),
```

### 2.2 Backend API Routes

**Файл:** `packages/backend/src/routes/couriers.routes.ts`

```typescript
import { Router } from 'express';
import * as couriersController from '../controllers/couriers.controller';

const router = Router();

// Couriers CRUD
router.get('/', couriersController.getAll);
router.get('/:id', couriersController.getOne);
router.post('/', couriersController.create);
router.put('/:id', couriersController.update);
router.delete('/:id', couriersController.deleteCourier);

// Courier zones
router.get('/:id/zones', couriersController.getZones);
router.post('/:id/zones', couriersController.createZone);
router.put('/zones/:zoneId', couriersController.updateZone);
router.delete('/zones/:zoneId', couriersController.deleteZone);

// Calculate shipping
router.post('/calculate', couriersController.calculateShipping);

// Get tracking URL
router.get('/:id/tracking/:trackingNumber', couriersController.getTrackingUrl);

export default router;
```

### 2.3 Backend Controller

**Файл:** `packages/backend/src/controllers/couriers.controller.ts`

Ще съдържа:
- `getAll()` - List couriers
- `getOne()` - Get single courier with zones
- `create()` - Create courier
- `update()` - Update courier
- `deleteCourier()` - Delete courier
- `getZones()` - List zones for courier
- `createZone()` - Add zone
- `updateZone()` - Update zone
- `deleteZone()` - Delete zone
- `calculateShipping()` - Calculate shipping cost based on address + weight
- `getTrackingUrl()` - Generate tracking URL

### 2.4 Admin UI Pages

**Директория:** `packages/admin/app/(dashboard)/sales/couriers/`

**Файлове:**
```
sales/couriers/
├── page.tsx                # List page
├── new/
│   └── page.tsx           # Create courier
└── [id]/
    ├── page.tsx           # Courier detail/edit
    └── zones/
        ├── page.tsx       # Manage zones
        └── new/
            └── page.tsx   # Create zone
```

**Компоненти:**
- `CourierList.tsx` - Таблица с куриери
- `CourierForm.tsx` - Форма за куриер
- `ZoneList.tsx` - Таблица със зони
- `ZoneForm.tsx` - Форма за зона

**Features:**
- Active/Inactive toggle
- Test API connection
- Generate tracking URLs
- Manage pricing zones
- View orders using this courier

---

## 3. Order Statuses Module (Статуси)

### 3.1 Database Schema

**Файл:** `packages/backend/src/db/schema/order-statuses.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const orderStatuses = pgTable('order_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // pending, confirmed, shipped, etc.
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'), // Hex color
  icon: varchar('icon', { length: 50 }), // lucide icon name
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
  isFinal: boolean('is_final').notNull().default(false), // delivered, cancelled, refunded
  isActive: boolean('is_active').notNull().default(true),
  sendEmailToCustomer: boolean('send_email_to_customer').notNull().default(false),
  emailTemplate: varchar('email_template', { length: 100 }), // e.g. 'order_confirmed'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  statusId: uuid('status_id').notNull().references(() => orderStatuses.id),
  statusName: varchar('status_name', { length: 100 }).notNull(), // snapshot
  userId: uuid('user_id').references(() => users.id), // who changed the status
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type OrderStatus = typeof orderStatuses.$inferSelect;
export type NewOrderStatus = typeof orderStatuses.$inferInsert;
export type OrderStatusHistoryEntry = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistoryEntry = typeof orderStatusHistory.$inferInsert;
```

**Промени в orders.ts:**
```typescript
// Replace the enum with a foreign key
statusId: uuid('status_id').references(() => orderStatuses.id),
statusName: varchar('status_name', { length: 100 }), // snapshot for display
```

### 3.2 Backend API Routes

**Файл:** `packages/backend/src/routes/order-statuses.routes.ts`

```typescript
import { Router } from 'express';
import * as orderStatusesController from '../controllers/order-statuses.controller';

const router = Router();

// Order Statuses CRUD
router.get('/', orderStatusesController.getAll);
router.get('/:id', orderStatusesController.getOne);
router.post('/', orderStatusesController.create);
router.put('/:id', orderStatusesController.update);
router.delete('/:id', orderStatusesController.deleteStatus);

// Reorder
router.post('/reorder', orderStatusesController.reorder);

// Set default
router.post('/:id/set-default', orderStatusesController.setDefault);

export default router;
```

### 3.3 Backend Controller

**Файл:** `packages/backend/src/controllers/order-statuses.controller.ts`

Ще съдържа:
- `getAll()` - List statuses (sorted by sortOrder)
- `getOne()` - Get single status
- `create()` - Create status
- `update()` - Update status
- `deleteStatus()` - Delete (if not used by orders)
- `reorder()` - Update sortOrder for multiple statuses
- `setDefault()` - Set as default status

### 3.4 Admin UI Pages

**Директория:** `packages/admin/app/(dashboard)/sales/statuses/`

**Файлове:**
```
sales/statuses/
├── page.tsx                # List page with drag-drop reorder
├── new/
│   └── page.tsx           # Create status
└── [id]/
    └── page.tsx           # Edit status
```

**Компоненти:**
- `StatusList.tsx` - Таблица/Cards със статуси
- `StatusForm.tsx` - Форма за статус
- `StatusBadge.tsx` - Badge компонент за показване на статус

**Features:**
- Drag & drop reorder
- Color picker
- Icon selector
- Set default
- View orders with this status
- Delete warning if used

---

## 4. Orders Module (Довършване)

### 4.1 Промени в Schema

**Файл:** `packages/backend/src/db/schema/orders.ts`

Обновяване с връзки към customers, couriers, statuses:

```typescript
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),

  // Customer info
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),

  // Status
  statusId: uuid('status_id').references(() => orderStatuses.id),
  statusName: varchar('status_name', { length: 100 }).notNull(), // snapshot

  // Pricing
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),

  // Shipping
  courierId: uuid('courier_id').references(() => couriers.id, { onDelete: 'set null' }),
  courierName: varchar('courier_name', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  trackingUrl: varchar('tracking_url', { length: 500 }),
  estimatedDelivery: timestamp('estimated_delivery'),

  // Notes
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});
```

### 4.2 Backend API Routes

**Файл:** `packages/backend/src/routes/orders.routes.ts`

```typescript
import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';

const router = Router();

// Orders CRUD
router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getOne);
router.post('/', ordersController.create);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.deleteOrder);

// Status management
router.patch('/:id/status', ordersController.updateStatus);
router.get('/:id/status-history', ordersController.getStatusHistory);

// Shipping
router.patch('/:id/shipping', ordersController.updateShipping);

// Print/Export
router.get('/:id/invoice', ordersController.generateInvoice);
router.get('/export', ordersController.exportOrders);

export default router;
```

### 4.3 Backend Controller

**Файл:** `packages/backend/src/controllers/orders.controller.ts`

### 4.4 Admin UI Pages

**Директория:** `packages/admin/app/(dashboard)/sales/orders/`

**Файлове:**
```
sales/orders/
├── page.tsx                # List page with filters
├── new/
│   └── page.tsx           # Create order (admin)
└── [id]/
    └── page.tsx           # Order detail/edit
```

**Компоненти:**
- `OrderList.tsx` - Таблица с поръчки
- `OrderDetail.tsx` - Детайли на поръчка
- `OrderStatusDropdown.tsx` - Dropdown за смяна на статус
- `OrderTimeline.tsx` - Timeline с status history
- `ShippingInfo.tsx` - Shipping информация
- `InvoicePreview.tsx` - Preview на фактура

**Features:**
- Pagination
- Search по order number, customer, email
- Филтри: статус, куриер, дата
- Mass actions (update status, export)
- Print invoice
- Send email to customer
- Add tracking number
- View customer details
- View full history

---

## Implementation Order

### Step 1: Database Schema (Backend)
1. Create `customers.ts` schema
2. Create `couriers.ts` schema
3. Create `order-statuses.ts` schema
4. Update `orders.ts` schema with new relations
5. Update `schema/index.ts` to export new tables
6. Generate & run migrations

### Step 2: Backend API (Backend)
1. Create customers controller + routes
2. Create couriers controller + routes
3. Create order-statuses controller + routes
4. Update orders controller + routes
5. Register routes in `routes/index.ts`
6. Test with Postman/Thunder Client

### Step 3: Admin UI (Frontend)
1. Create `/sales/customers` pages + components
2. Create `/sales/couriers` pages + components
3. Create `/sales/statuses` pages + components
4. Update `/sales/orders` pages + components
5. Create shared components (forms, tables, badges)

### Step 4: Testing & Polish
1. Test CRUD operations
2. Test relationships (customer → orders, etc.)
3. Add validations
4. Polish UI/UX
5. Add loading states
6. Add error handling

---

## Timeline Estimate

- **Customers Module:** 3-4 дни
- **Couriers Module:** 2-3 дни
- **Order Statuses Module:** 1-2 дни
- **Orders Module (update):** 2-3 дни
- **Testing & Polish:** 1-2 дни

**Total:** ~9-14 дни (2 седмици реалистично)

---

## Notes

- Customers е най-критичният модул - започваме от там
- Order Statuses е най-лесният - може да се направи бързо
- Couriers е най-сложният заради shipping calculation
- След като тези модули са готови, можем да мигрираме от PrestaShop
