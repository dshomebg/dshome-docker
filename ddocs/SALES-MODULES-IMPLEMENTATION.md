# Sales Modules - Implementation Summary

**Дата на завършване:** 2025-11-12
**Статус:** ✅ Завършен

## Обща Информация

Този документ описва **реалната имплементация** на Sales модулите, която беше завършена на 12 ноември 2025 г.

Завършени модули:
1. ✅ **Customers (Клиенти)**
2. ✅ **Couriers (Куриери)**
3. ✅ **Email Templates (Email шаблони)**
4. ✅ **Order Statuses (Статуси на поръчки)**

---

## 1. Customers Module (Клиенти)

### Статус: ✅ Завършен

### 1.1 Database Schema

**Файл:** `packages/backend/src/db/schema/customers.ts`

```typescript
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Промени спрямо плана:**
- ❌ Няма `isGuest` поле (опростено)
- ❌ Няма `registeredAt` и `lastLoginAt` (опростено)
- ❌ Няма `customer_addresses` таблица (не е нужна за миграция)
- ✅ Има `notes` поле за admin бележки

### 1.2 Backend API

**Endpoint:** `/api/customers`

**Имплементирани routes:**
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/change-password` - Change password

**Контролер:** `packages/backend/src/controllers/customers.controller.ts`

### 1.3 Admin UI

**Файлове:**
```
packages/admin/app/(dashboard)/sales/customers/
├── page.tsx                          # List page с таблица
├── CustomerTable.tsx                 # Таблица компонент
├── CustomerForm.tsx                  # Форма за create/edit
├── new/page.tsx                      # Create page
└── [id]/page.tsx                     # Edit page
```

**Features:**
- ✅ Списък с клиенти
- ✅ Създаване на клиент
- ✅ Редакция на клиент
- ✅ Изтриване на клиент
- ✅ Смяна на парола
- ✅ Active/Inactive status
- ✅ Admin бележки

---

## 2. Couriers Module (Куриери)

### Статус: ✅ Завършен

### 2.1 Database Schema

**Файл:** `packages/backend/src/db/schema/couriers.ts`

```typescript
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
```

**Промени спрямо плана:**
- ❌ Няма `code`, `website`, `phone`, `email`, `apiKey` (опростено)
- ✅ Има `logoUrl` за качване на лого
- ✅ Има `trackingUrl` за tracking links
- ✅ Има `offersOfficeDelivery` toggle за доставка до офис
- ✅ Има `palletDelivery` функционалност с праг и цена
- ❌ Няма zones - вместо това има pricing ranges по тегло
- ✅ Pricing ranges за 2 типа доставка: address / office

### 2.2 Backend API

**Endpoint:** `/api/couriers`

**Имплементирани routes:**
- `GET /api/couriers` - List all couriers
- `GET /api/couriers/:id` - Get single courier with pricing ranges
- `POST /api/couriers` - Create courier
- `PUT /api/couriers/:id` - Update courier
- `DELETE /api/couriers/:id` - Delete courier
- `POST /api/couriers/calculate-delivery-price` - Calculate delivery price based on weight

**Контролер:** `packages/backend/src/controllers/couriers.controller.ts`

**Специална логика:**
- Калкулира доставка по тегло
- Ако тегло > `palletWeightThreshold`, използва pallet pricing
- Валидира че pricing ranges започват от 0 kg
- Валидира че няма gaps в ranges

### 2.3 Admin UI

**Файлове:**
```
packages/admin/app/(dashboard)/sales/couriers/
├── page.tsx                          # List page
├── CourierTable.tsx                  # Таблица компонент
├── CourierForm.tsx                   # Форма за create/edit (compact design)
├── new/page.tsx                      # Create page
└── [id]/page.tsx                     # Edit page
```

**Features:**
- ✅ Списък с куриери
- ✅ Създаване/редакция на куриер
- ✅ Качване на лого (ImageUpload component)
- ✅ Tracking URL
- ✅ Active/Inactive toggle
- ✅ Office delivery toggle
- ✅ Tabs за Address/Office pricing ranges
- ✅ Weight-based pricing ranges
- ✅ Auto-populate "from" weight при добавяне на range
- ✅ Pallet delivery с праг, max weight, цена
- ✅ Компактен дизайн (p-4, text-xs, smaller toggles)

---

## 3. Email Templates Module (Email шаблони)

### Статус: ✅ Завършен

**Забележка:** Този модул НЕ беше в оригиналния план, но беше добавен като dependency за Order Statuses модула.

### 3.1 Database Schema

**Файл:** `packages/backend/src/db/schema/email-templates.ts`

```typescript
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  subject: varchar('subject', { length: 500 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### 3.2 Backend API

**Endpoint:** `/api/design/email-templates`

**Имплементирани routes:**
- `GET /api/design/email-templates` - List all templates
- `GET /api/design/email-templates/:id` - Get single template
- `POST /api/design/email-templates` - Create template
- `PUT /api/design/email-templates/:id` - Update template
- `DELETE /api/design/email-templates/:id` - Delete template
- `GET /api/design/email-templates/variables` - Get available variables

**Контролер:** `packages/backend/src/controllers/email-templates.controller.ts`

**Available Variables (17):**
```typescript
{shop_name}, {shop_email}, {shop_phone}, {shop_address},
{customer_first_name}, {customer_last_name}, {customer_email}, {customer_phone},
{order_reference}, {order_date}, {order_status}, {order_total},
{order_items}, {shipping_address}, {billing_address},
{tracking_number}, {tracking_url}
```

### 3.3 Admin UI

**Файлове:**
```
packages/admin/app/(dashboard)/design/email-templates/
├── page.tsx                          # List page (grid layout)
├── EmailTemplateForm.tsx             # Форма със WYSIWYG editor
├── new/page.tsx                      # Create page
└── [id]/page.tsx                     # Edit page
```

**Компоненти:**
- `TiptapEditorWithVariables.tsx` - Enhanced Tiptap editor с:
  - "Вмъкни променлива" dropdown button
  - Dropdown с всички 17 променливи
  - Variable key + description
  - Visual editor / HTML view toggle
  - Full WYSIWYG toolbar (headings, bold, italic, lists, alignment, links, code)

**Features:**
- ✅ Grid layout списък
- ✅ Създаване/редакция на шаблон
- ✅ WYSIWYG editor (Tiptap)
- ✅ Variable insertion dropdown
- ✅ HTML view toggle
- ✅ Subject field (може да съдържа променливи)

---

## 4. Order Statuses Module (Статуси)

### Статус: ✅ Завършен

### 4.1 Database Schema

**Файл:** `packages/backend/src/db/schema/order-statuses.ts`

```typescript
export const orderStatuses = pgTable('order_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  visibleToCustomer: boolean('visible_to_customer').notNull().default(true),
  sendEmail: boolean('send_email').notNull().default(false),
  emailTemplateId: uuid('email_template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Промени спрямо плана:**
- ❌ Няма `code` поле (опростено)
- ❌ Няма `icon` поле (не е необходимо)
- ❌ Няма `description` поле (опростено)
- ✅ Има `position` вместо `sortOrder`
- ❌ Няма `isDefault` и `isFinal` (опростено)
- ✅ Има `visibleToCustomer` toggle
- ✅ Има `sendEmail` toggle
- ✅ Има връзка към `emailTemplates`
- ❌ Няма `order_status_history` таблица (не е необходима засега)

### 4.2 Backend API

**Endpoint:** `/api/order-statuses`

**Имплементирани routes:**
- `GET /api/order-statuses` - List all statuses (ordered by position)
- `GET /api/order-statuses/:id` - Get single status
- `POST /api/order-statuses` - Create status
- `PUT /api/order-statuses/:id` - Update status
- `DELETE /api/order-statuses/:id` - Delete status

**Контролер:** `packages/backend/src/controllers/order-statuses.controller.ts`

**Валидации:**
- HEX color format validation (#RRGGBB)
- Email template required when sendEmail is true
- Unique name validation

### 4.3 Admin UI

**Файлове:**
```
packages/admin/app/(dashboard)/sales/order-statuses/
├── page.tsx                          # List page (table)
├── OrderStatusForm.tsx               # Форма с color picker
├── new/page.tsx                      # Create page
└── [id]/page.tsx                     # Edit page
```

**Features:**
- ✅ Таблица със статуси
- ✅ Визуален color preview box
- ✅ HEX color picker (native + manual input)
- ✅ Toggle: "Видим за клиента"
- ✅ Toggle: "Изпрати имейл"
- ✅ Условен dropdown за email template (показва се само когато sendEmail=true)
- ✅ Валидация на HEX цвят
- ✅ Валидация на задължителен email template
- ✅ Visual indicators (icons) в таблицата
- ✅ Compact design

**Color Picker Implementation:**
```typescript
// Visual preview
<div style={{ backgroundColor: formData.color }} />

// Native HTML5 color picker
<input type="color" value={formData.color} onChange={...} />

// Manual HEX input
<input type="text" value={formData.color} onChange={...} />
```

---

## Технически Детайли

### File Structure Pattern

```
Backend:
packages/backend/src/
  db/schema/{module}.ts              # Drizzle schema
  controllers/{module}.controller.ts  # Business logic
  routes/{module}.routes.ts          # Express routes
  routes/index.ts                    # Router registration

Frontend:
packages/admin/
  lib/services/{module}.service.ts   # API client
  app/(dashboard)/{section}/{module}/
    page.tsx                         # List page
    {Component}.tsx                  # Reusable components
    new/page.tsx                     # Create page
    [id]/page.tsx                    # Edit page
```

### Design System

**Compact Design Pattern** (established for all sales modules):
- Form spacing: `space-y-4` (not `space-y-6`)
- Section padding: `p-4` (not `p-6`)
- Headings: `text-base` (not `text-lg`)
- Labels: `text-xs font-medium` (not `text-sm`)
- Inputs: `px-3 py-1.5 text-sm` (not `px-4 py-2`)
- Buttons: `px-3 py-1.5 text-xs` with `h-3.5 w-3.5` icons
- Toggle switches: `h-5 w-9` with `h-3.5 w-3.5` inner circle

### Database Migrations

Всички миграции се правят чрез:
```bash
docker exec dshome-backend-dev npm run db:push
```

### API Authentication

Всички API endpoints изискват authentication (JWT token от login).

### Currency

Всички цени са в **EUR** (евро).

---

## Sidebar Menu Structure

```
Продажби (Sales)
├── Поръчки (Orders)          - /sales/orders (TBD)
├── Клиенти (Customers)       - /sales/customers ✅
├── Куриери (Couriers)        - /sales/couriers ✅
└── Статуси (Order Statuses)  - /sales/order-statuses ✅

Дизайн (Design)
├── Изображения (Images)      - /design/image-sizes ✅
└── Email шаблони (Templates) - /design/email-templates ✅
```

---

## Testing & Deployment

### Development Testing
Всички модули са тествани локално на:
- Backend: `http://localhost:3001/api`
- Admin: `http://localhost:3000/admin`

### Production Deployment
Използва се скрипт: `./scripts/deploy-docker.sh`

**Стъпки:**
1. `git add .`
2. `git commit`
3. `git push`
4. `bash ./deploy-docker.sh`

---

## Следващи Стъпки

### Непосредствени:
- ⏳ Завършване на **Orders Module** (API + UI)
- ⏳ Интеграция на orders с customers, couriers, statuses

### Краткосрочни:
- Shopping Cart module
- Checkout process
- Payment integration

### Дългосрочни:
- PrestaShop migration (след като Orders е готов)
- Frontend store (customer-facing)

---

## Заключение

Успешно завършени 4 Sales модула за ~1 ден работа:
- ✅ Customers
- ✅ Couriers
- ✅ Email Templates
- ✅ Order Statuses

Всички модули са напълно функционални с:
- Database schemas
- Backend APIs с валидации
- Admin UI с compact design
- CRUD операции
- Special features (color picker, WYSIWYG editor, image upload, pricing calculator)

**Готови за production deployment!** 🚀
