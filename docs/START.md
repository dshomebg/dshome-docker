# START - Инструкции за AI асистент

## Общ преглед на проекта

DSHome е E-Commerce платформа за българския пазар, изградена като monorepo с фокус върху модулност и мащабируемост.

**ВАЖНО:** Всички комуникации трябва да бъдат на БЪЛГАРСКИ език.

## Технологичен Stack

### Backend
- **Node.js 20.x** + Express.js + TypeScript
- **Drizzle ORM** с PostgreSQL 18.0
- **Manual Migrations** (не използваме auto-generate от drizzle-kit винаги)
- JWT Authentication
- Порт: **4000**

### Admin Panel
- **Next.js 15** с App Router + TypeScript
- TailAdmin template
- Tailwind CSS
- Порт: **3001**

### Frontend (Customer)
- React 19 + Vite + TypeScript
- Порт: **3000** (предстои разработка)

### Infrastructure
- PostgreSQL 18.0 (порт 5432)
- Redis 7.0 (порт 6379)
- Meilisearch 1.24 (порт 7700)

## Архитектурни решения

### 1. Monorepo структура
```
packages/
├── backend/          # Express API
├── admin/            # Next.js админ панел
├── frontend/         # React store (предстои)
└── shared/           # Споделени типове и utility
```

### 2. Shared Types
**ПРАВИЛО:** Всички типове, които се използват и във frontend и в backend, трябва да живеят в `packages/shared/types/`.

Примери:
- `packages/shared/types/seo.ts` - SEO типове
- `packages/shared/types/api.ts` - API response типове

### 3. Database Migrations

**МНОГО ВАЖНО:**

1. Migrations са в `packages/backend/src/db/migrations/`
2. Номерацията е `0001_`, `0002_`, и т.н.
3. **НЕ винаги** използвай `pnpm db:generate` автоматично
4. За сложни schema промени (добавяне на boolean, SEO полета и т.н.) - пиши migrations **РЪЧНО**
5. Формат на миграции: SQL файлове с ALTER TABLE команди

Пример:
```sql
-- 0011_add_seo_to_categories.sql
ALTER TABLE "categories" ADD COLUMN "meta_keywords" text;
ALTER TABLE "categories" ADD COLUMN "robots_index" boolean DEFAULT true NOT NULL;
```

### 4. Database Schema

**Локация:** `packages/backend/src/db/schema/`

Всяка таблица има собствен файл:
- `brands.ts`
- `categories.ts`
- `suppliers.ts`
- и т.н.

**ВАЖНО:** След промени в schema файловете, винаги актуализирай `packages/backend/src/db/schema/index.ts`

### 5. SEO модул

SEO е изграден като **преизползваем компонент**:

**Споделени типове:** `packages/shared/types/seo.ts`
```typescript
export interface SeoFormData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}
```

**React компонент:** `packages/admin/components/seo/SeoForm.tsx`
- Може да се embed в всяка форма (Categories, Products, CMS Pages)
- Има character counters (60 за title, 160 за description)
- Auto-fill бутон за копиране Meta → OG

**Database полета:** Добавяй 9 SEO колони към всяка entity таблица:
```typescript
metaTitle: varchar('meta_title', { length: 255 }),
metaDescription: text('meta_description'),
metaKeywords: text('meta_keywords'),
ogTitle: varchar('og_title', { length: 255 }),
ogDescription: text('og_description'),
ogImage: varchar('og_image', { length: 500 }),
canonicalUrl: varchar('canonical_url', { length: 500 }),
robotsIndex: boolean('robots_index').notNull().default(true),
robotsFollow: boolean('robots_follow').notNull().default(true),
```

## Завършени модули

✅ Brands - Пълна CRUD функционалност
✅ Suppliers - Пълна CRUD функционалност
✅ Warehouses - Пълна CRUD функционалност
✅ Attributes - Групи + стойности (CRUD)
✅ Features - Групи + стойности (CRUD)
✅ Categories - Йерархична структура с безкрайна дълбочина, SEO интеграция
✅ Catalog Settings - Глобални настройки (ДДС, продукти на страница и т.н.)
✅ Faceted Navigation - Филтри за категории и търсене (templates + items)
✅ SEO Module - Преизползваем компонент

## Важни файлове за проверка

### Backend Routes
**Локация:** `packages/backend/src/routes/index.ts`

Всички API routes се регистрират тук:
```typescript
router.use('/brands', brandsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/faceted-navigation', facetedNavigationRoutes);
```

### API Response формат
Всички API endpoints връщат:
```typescript
{ data: T } | { error: string }
```

### Validation
Използваме Zod за validation във всички controllers.

## Development Workflow

### 1. Стартиране на проекта

```bash
# Backend
cd packages/backend
pnpm dev  # Порт 4000

# Admin
cd packages/admin
pnpm dev  # Порт 3001
```

### 2. Database промени

```bash
# 1. Промени schema в packages/backend/src/db/schema/
# 2. Създай migration файл ръчно (за сложни промени)
# 3. Apply migration:
cd packages/backend
pnpm db:migrate
```

### 3. Git workflow

**ВАЖНО за commits:**
- Винаги използвай детайлни commit съобщения
- Добави footer с Claude Code attribution:
```
feat: Add SEO module with reusable component

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 4. Testing преди commit

Когато потребителят каже "направи и после ще тестваме всичко":
1. Направи ВСИЧКИ имплементации първо
2. Apply всички migrations
3. Провери че компилира без грешки
4. После информирай потребителя за тестване

**НЕ** commit-вай докато потребителят не тества и одобри!

## Често срещани грешки

### 1. Drizzle migrations
❌ **НЕ:** Винаги използвай `pnpm db:generate`
✅ **ДА:** За boolean полета, SEO полета и сложни промени - пиши SQL migration ръчно

### 2. TypeScript imports
❌ **НЕ:** Import от `../../../shared/types/`
✅ **ДА:** Import от `@dshome/shared/types/` (използваме workspace aliases)

### 3. API endpoints
❌ **НЕ:** Различни response формати
✅ **ДА:** Винаги `{ data: ... }` или `{ error: ... }`

### 4. React components
❌ **НЕ:** Inline styles или classes в JSX
✅ **ДА:** Tailwind CSS classes, следвай TailAdmin конвенциите

### 5. Bulgarian text
❌ **НЕ:** Английски UI text
✅ **ДА:** Всички UI текстове, labels, placeholders на БЪЛГАРСКИ

## Следващи стъпки (ROADMAP)

Според `docs/ROADMAP.md`, следващият голям модул е:

### Products (Предстои)
Най-сложният модул с:
- Product variants (размери, цветове)
- Bulk pricing
- Stock management
- Image galleries
- Връзки с Attributes, Features, Categories, Brands, Suppliers, Warehouses
- SEO интеграция
- Faceted navigation интеграция

## Важни конвенции

### Naming
- **Database:** snake_case (`meta_title`, `created_at`)
- **TypeScript:** camelCase (`metaTitle`, `createdAt`)
- **React Components:** PascalCase (`CategoryForm`, `SeoForm`)
- **Files:** kebab-case (`category-form.tsx`, `faceted-navigation.routes.ts`)

### Ports
- Backend: **4000**
- Admin: **3001**
- Frontend: **3000** (предстои)
- PostgreSQL: **5432**
- Redis: **6379**
- Meilisearch: **7700**

### Environment
Винаги check `.env` файла за:
- Database connection
- JWT secrets
- API keys

## Когато започнеш нова сесия

1. ✅ Прочети този файл (START.md)
2. ✅ Прочети README.md за overview
3. ✅ Провери дали има running servers (backend на 4000, admin на 3001)
4. ✅ Попитай потребителя какво искаме да направим
5. ✅ Използвай TodoWrite tool за планиране на задачите
6. ✅ Комуникирай на БЪЛГАРСКИ

## Контакт и feedback

Потребителят предпочита:
- Директна комуникация без излишни емоджита
- Първо планиране, после изпълнение
- Тестване след имплементация (не преди)
- Commit само след одобрение

---

**Дата на създаване:** 2025-11-07
**Последна актуализация:** 2025-11-07
**Версия:** 1.0
