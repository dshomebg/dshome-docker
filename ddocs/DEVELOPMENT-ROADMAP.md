# DSHome Development Roadmap

**Последна актуализация:** 2025-11-12

## Текущ Статус

### ✅ Завършени Модули

#### Backend API + Admin Panel
- ✅ **Users** - Admin потребители (role: admin, manager, staff)
- ✅ **Products** - Продукти с пълна функционалност
- ✅ **Categories** - Йерархични категории
- ✅ **Brands** - Марки
- ✅ **Suppliers** - Доставчици
- ✅ **Warehouses** - Складове
- ✅ **Attributes** - Групи атрибути (Size, Color) + values
- ✅ **Features** - Характеристики на продукти
- ✅ **Product Combinations** - Вариации (size/color комбинации)
- ✅ **Product Images** - Upload + resize (full, large, medium, thumb)
- ✅ **Product Inventory** - Наличности по складове
- ✅ **Import Templates** - Excel импорт настройки
- ✅ **SEO Settings** - SEO конфигурация
- ✅ **Catalog Settings** - Каталог настройки
- ✅ **General Settings** - Общи настройки
- ✅ **Faceted Navigation** - Филтри за каталог
- ✅ **Rich Snippets** - Structured data settings
- ✅ **Customers** - Клиенти (основна информация, без адреси)
- ✅ **Couriers** - Куриери с pricing ranges и pallet delivery
- ✅ **Email Templates** - Шаблони за имейли с WYSIWYG editor и променливи
- ✅ **Order Statuses** - Статуси на поръчки с цветове и email notifications

### 🔧 Частично Имплементирани

#### Orders Module
**Schema:** ✅ Дефиниран (orders, order_items, shipping_addresses)
**API Routes:** ❌ Липсват
**Controllers:** ❌ Липсват
**Admin UI:** ❌ Липсва

**Нужно:**
- API endpoints за CRUD операции
- Order management в admin panel
- Order status workflow
- Email notifications (optional)

### ❌ Липсващи Модули

#### 1. Shopping Cart
**Приоритет:** 🔴 Критичен за online store

**Schema нужда:**
```typescript
carts:
- id (uuid)
- customerId (nullable for guest)
- sessionId (за guest users)
- expiresAt
- createdAt
- updatedAt

cart_items:
- id
- cartId
- productId
- combinationId (nullable)
- quantity
- price (snapshot)
- createdAt
- updatedAt
```

**API нужда:**
- GET /api/cart - Get current cart
- POST /api/cart/items - Add item to cart
- PUT /api/cart/items/:id - Update quantity
- DELETE /api/cart/items/:id - Remove item
- DELETE /api/cart - Clear cart

---

#### 3. Checkout Process
**Приоритет:** 🔴 Критичен за online store

**API нужда:**
- POST /api/checkout/calculate - Calculate totals + shipping
- POST /api/checkout/create-order - Finalize order
- POST /api/checkout/guest - Guest checkout

**Integration нужда:**
- Payment gateway (Stripe, PayPal, или локален)
- Shipping calculator
- Email notifications
- Invoice generation

---

#### 4. Frontend Store (Customer-facing)
**Приоритет:** 🟠 Висок

Текущо имаме само Admin Panel. Нужен е customer-facing online store.

**Pages нужда:**
- Home page
- Product listing (category pages)
- Product detail page
- Search results page
- Cart page
- Checkout pages
- My Account pages
- Order history

**Location:** `packages/frontend/` (React + Vite)

---

#### 5. Payment Integration
**Приоритет:** 🟠 Висок

**Options:**
- Stripe
- PayPal
- ePay.bg (popular in Bulgaria)
- Bank transfer (manual)
- Cash on delivery

**Schema нужда:**
```typescript
payments:
- id
- orderId
- method ('stripe' | 'paypal' | 'epay' | 'bank_transfer' | 'cash')
- amount
- status ('pending' | 'completed' | 'failed' | 'refunded')
- transactionId (от payment provider)
- metadata (JSON)
- createdAt
- updatedAt
```

---

#### 6. Shipping Integration
**Приоритет:** 🟡 Среден

**Options:**
- Speedy
- Econt
- DHL
- Fixed rate shipping
- Free shipping (над определена сума)

**Schema нужда:**
```typescript
shipping_methods:
- id
- name
- provider ('speedy' | 'econt' | 'dhl' | 'fixed')
- priceCalculation ('flat' | 'weight' | 'zone')
- basePrice
- isActive

shipping_zones:
- id
- name
- countries (array)
- shippingMethodId
```

---

#### 7. Email System
**Приоритет:** 🟡 Среден

**Email Types:**
- Order confirmation
- Shipping notification
- Password reset
- Welcome email
- Newsletter

**Tech Options:**
- Nodemailer + SMTP
- SendGrid
- Mailgun
- AWS SES

---

#### 8. Analytics & Reports
**Приоритет:** 🟢 Нисък (може след launch)

**Reports нужда:**
- Sales by day/week/month
- Top selling products
- Revenue by category
- Customer acquisition
- Abandoned carts
- Inventory alerts

---

#### 9. Promotions & Discounts
**Приоритет:** 🟢 Нисък (може след launch)

**Schema нужда:**
```typescript
promotions:
- id
- code (за coupon codes)
- type ('percentage' | 'fixed' | 'free_shipping')
- value
- minOrderAmount
- maxUses
- usedCount
- validFrom
- validUntil
- isActive
```

---

## Приоритизация за Разработка

### Phase 1: Core E-commerce (Преди миграция)
**Timeline:** 2-3 седмици

1. **Customers Module** (3-4 дни)
   - Database schema
   - API routes
   - Admin UI за преглед

2. **Orders Module - Complete** (2-3 дни)
   - API routes (CRUD)
   - Admin UI
   - Order status workflow

3. **Shopping Cart** (2-3 дни)
   - Database schema
   - API routes
   - Session management

4. **Basic Checkout** (2-3 дни)
   - Guest checkout
   - Order creation from cart
   - Manual payment (bank transfer/cash)

### Phase 2: Frontend Store (Може паралелно с Phase 1)
**Timeline:** 2-3 седмици

1. **Store Layout** (2 дни)
   - Header, footer, navigation
   - Responsive design

2. **Product Pages** (3 дни)
   - Category listing
   - Product detail
   - Search

3. **Cart & Checkout UI** (3 дни)
   - Cart page
   - Checkout flow
   - Order confirmation

4. **Account Pages** (2 дни)
   - Login/Register
   - My Account
   - Order history

### Phase 3: PrestaShop Migration
**Timeline:** 5-6 дни

След като Phase 1 и 2 са завършени.

1. **Data Analysis** (1 ден)
2. **Migration Scripts** (2-3 дни)
3. **Execution + Validation** (2 дни)

### Phase 4: Payments & Shipping
**Timeline:** 1-2 седмици

1. **Payment Gateway Integration** (3-5 дни)
   - Stripe/PayPal integration
   - ePay.bg (ако е нужен)

2. **Shipping Integration** (3-5 дни)
   - Speedy API
   - Econt API
   - Rate calculation

### Phase 5: Polish & Launch
**Timeline:** 1 седмица

1. **Email Notifications** (2 дни)
2. **SEO Optimization** (2 дни)
3. **Testing** (2 дни)
4. **Launch!** 🚀

---

## Migration Strategy (Updated)

**❌ Не мигрираме СЕГА** - чакаме Phase 1 & 2 да са готови

**✅ Мигрираме СЛЕД като имаме:**
- Customers schema + API
- Orders API endpoints
- Shopping cart functionality
- Basic checkout

**Миграционен ред:**
1. Brands, Suppliers, Warehouses (вече са готови)
2. Categories (вече са готови)
3. Products + Combinations (вече са готови)
4. **→ Customers** (нов модул)
5. **→ Orders** (нов модул)
6. Product Images (copy файлове)

---

## Следващи Стъпки

### Непосредствени (тази седмица):
1. [ ] Решение: Frontend stack (React/Next.js/Vue?)
2. [ ] Създаване на Customers schema
3. [ ] Customers API routes
4. [ ] Завършване на Orders API routes

### Краткосрочни (следващи 2 седмици):
1. [ ] Shopping Cart implementation
2. [ ] Basic checkout flow
3. [ ] Frontend store основи

### Средносрочни (следващ месец):
1. [ ] PrestaShop migration
2. [ ] Payment integration
3. [ ] Shipping integration
4. [ ] Email system

---

## Въпроси за Вземане на Решения

1. **Frontend Framework?**
   - React (вече имаш admin с Next.js)
   - Просто React + Vite (по-лесно)
   - Next.js (за SEO)

2. **Payment Gateway?**
   - Stripe (international)
   - ePay.bg (Bulgaria specific)
   - И двете?

3. **Shipping?**
   - Speedy
   - Econt
   - Фиксирана цена за начало?

4. **Guest Checkout?**
   - Да (по-лесно за клиенти)
   - Не (само registered users)

5. **Multi-language?**
   - Само BG за начало
   - BG + EN

---

## Notes

- MIGRATION-PLAN.md остава валиден, но се отлага за Phase 3
- Фокусът сега е на core e-commerce functionality
- Frontend store може да се разработва паралелно с backend модули
