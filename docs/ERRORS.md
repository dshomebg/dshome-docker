# Проблеми и решения при деплоймънт

Този документ съдържа всички проблеми, с които сме се сблъсквали при деплоймънт на приложението, и техните решения.

## Общ проблем: Деплоймънт без Docker

**Проблем:** Първоначално планът беше да използваме Docker image, който работи на локалния компютър и после се качва на production сървъра. Вместо това правихме:
- SSH към production сървъра (157.90.129.12)
- `git pull` за теглене на кода
- `pnpm build` за компилиране директно на сървъра
- PM2 restart

**Защо е проблем:**
- Build-ът на production може да се провали, докато на локалния компютър работи
- Различни версии на Node.js/pnpm могат да създадат несъвместимости
- TypeScript strict mode може да показва различни грешки
- ESLint правилата се прилагат по-строго в production build

**Решение (✅ ВНЕДРЕНО):**
- ✅ Създадени Dockerfile за backend и admin
- ✅ Създаден docker-compose.prod.yml за production
- ✅ Автоматичен deployment скрипт: `./deploy-docker.sh`
- ✅ Запазване на database (external PostgreSQL)
- ✅ Запазване на uploads (volume mount)
- ✅ Пълна документация в [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)

**Как работи сега:**
```bash
# Локално
docker build → test → ./deploy-docker.sh

# Production
docker run (с external DB и volume за uploads)
```

**Гарантира:** "работи на локално = работи на production" + **НИКАКВИ ДАННИ НЕ СЕ ГУБЯТ**

**Важно за данните:**
- База данни: Използва съществуващата PostgreSQL на хоста (не в Docker)
- Uploads: Volume mount на `/opt/dshome/packages/backend/uploads`
- При deployment: Данните остават напълно непокътнати
- Rollback: Винаги можете да се върнете към PM2 без загуба на данни

---

## TypeScript грешки

### 1. Missing Breadcrumb Component

**Грешка:**
```
Cannot find module '@/components/Breadcrumbs/Breadcrumb'
```

**Засегнати файлове:**
- `app/(dashboard)/catalog/faceted-navigation/[id]/page.tsx`
- `app/(dashboard)/catalog/faceted-navigation/page.tsx`
- `app/(dashboard)/catalog/settings/page.tsx`

**Причина:**
Компонентът `Breadcrumb` не съществува в проекта, но е импортиран в няколко страници.

**Решение:**
Премахнати импортите и JSX usage на Breadcrumb компонента:
```typescript
// ПРЕДИ
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// СЛЕД - изтрит напълно
```

---

### 2. Missing SEO Types Module

**Грешка:**
```
Cannot find module '@dshome/shared/types/seo'
```

**Причина:**
Файлът `packages/shared/src/types/seo.types.ts` не съществуваше.

**Решение:**
1. Създаден файл `packages/shared/src/types/seo.types.ts`:
```typescript
export interface SeoFormData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}
```

2. Добавен export в `packages/shared/src/types/index.ts`:
```typescript
export * from './seo.types';
```

---

### 3. Invalid Import Path for SEO Types

**Грешка:**
```
Package subpath './types/seo' is not defined by "exports"
```

**Засегнати файлове:**
- `components/categories/CategoryForm.tsx`
- `components/products/ProductForm.tsx`
- `components/seo/SeoForm.tsx`

**Причина:**
Import path-ът `@dshome/shared/types/seo` не е разрешен в package.json exports конфигурацията на shared пакета.

**Решение:**
Променени импортите да използват основния entry point:
```typescript
// ПРЕДИ
import { SeoFormData } from "@dshome/shared/types/seo";

// СЛЕД
import { SeoFormData } from "@dshome/shared";
```

---

### 4. Missing SEO Fields in Category Interface

**Грешка:**
```
Property 'metaKeywords' does not exist on type 'Category'
Property 'ogTitle' does not exist on type 'Category'
Property 'ogDescription' does not exist on type 'Category'
... и др.
```

**Файл:** `packages/admin/lib/services/categories.service.ts`

**Причина:**
Category интерфейсът в TypeScript не съвпадаше с реалната database schema. База данните съдържа всички SEO полета, но TypeScript типът не ги включваше.

**Решение:**
Добавени липсващите SEO полета в Category интерфейса и method signatures:
```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  position: number;
  status: 'active' | 'inactive';
  // Добавени полета:
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;  // ← НОВО
  ogTitle: string | null;        // ← НОВО
  ogDescription: string | null;  // ← НОВО
  ogImage: string | null;        // ← НОВО
  canonicalUrl: string | null;   // ← НОВО
  robotsIndex: boolean;          // ← НОВО
  robotsFollow: boolean;         // ← НОВО
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}
```

Също добавени в `createCategory` и `updateCategory` method parameters.

---

### 5. Missing Status Field in WarehouseForm

**Грешка:**
```
Type error: Argument of type '{ name: string; url?: string | undefined; ... }'
is not assignable to parameter of type 'WarehouseFormData'.
Property 'status' is missing
```

**Файл:** `packages/admin/components/warehouses/WarehouseForm.tsx`

**Причина:**
`WarehouseFormData` type (дефиниран в `warehouses.service.ts`) изисква `status` поле, но Zod schema-та във формата не го включваше.

**Решение:**
1. Добавено в Zod schema:
```typescript
const warehouseSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  address: z.string().optional(),
  // ... други полета
  status: z.enum(["active", "inactive"]),  // ← НОВО
});
```

2. Добавено в default values:
```typescript
defaultValues: {
  name: warehouse?.name || "",
  // ... други полета
  status: warehouse?.status || "active",  // ← НОВО
}
```

3. Добавено в UI (select field):
```tsx
<select id="status" {...register("status")}>
  <option value="active">Активен</option>
  <option value="inactive">Неактивен</option>
</select>
```

---

## ESLint грешки

### 1. Unescaped Entities in JSX

**Грешка:**
```
ESLint: react/no-unescaped-entities
```

**Засегнати файлове:**
- `app/(dashboard)/catalog/faceted-navigation/[id]/page.tsx`
- `app/(dashboard)/catalog/settings/page.tsx`
- `components/attributes/AttributeValuesList.tsx`
- `components/features/FeatureForm.tsx`
- `components/features/FeatureValuesList.tsx`
- `components/products/ProductForm.tsx`
- `components/warehouses/WarehouseForm.tsx`

**Причина:**
В Next.js production build, ESLint изисква escape на специални символи като кавички в JSX текст.

**Решение:**
Заменени всички кавички с HTML entity `&quot;`:
```tsx
// ПРЕДИ
<p>Цена: {"priceDisplayType: "slider""}</p>
<label>Период "Нов продукт" (дни)</label>

// СЛЕД
<p>Цена: {'{'}priceDisplayType: &quot;slider&quot;{'}'}}</p>
<label>Период &quot;Нов продукт&quot; (дни)</label>
```

---

## ESLint warnings (не спират build-а)

Следните warnings се появяват, но не спират production build:

### 1. Missing dependencies in useEffect

**Warning:**
```
React Hook useEffect has a missing dependency: 'fetchSomething'
```

**Файлове:** Множество страници и компоненти

**Причина:**
useEffect dependencies arrays не включват всички използвани функции.

**Статус:**
- Warnings, не errors
- Не спират build-а
- TODO: Могат да се поправят чрез useCallback или добавяне в dependencies

### 2. Using &lt;img&gt; instead of Next.js Image

**Warning:**
```
Using <img> could result in slower LCP and higher bandwidth.
Consider using <Image /> from 'next/image'
```

**Причина:**
Използване на стандартен HTML `<img>` вместо оптимизирания Next.js `<Image>` компонент.

**Статус:**
- Warning, не error
- TODO: Може да се оптимизира в бъдеще

---

## Deployment команда

След всички fixes, финалната deployment команда е:

```bash
ssh -o StrictHostKeyChecking=no root@157.90.129.12 "
  cd /opt/dshome &&
  git pull &&
  pnpm --filter @dshome/shared build &&
  pnpm --filter @dshome/admin build &&
  pm2 restart dshome-admin &&
  pm2 status
"
```

**Забележка:** Парола: `1Borabora@#` (ако SSH key auth не работи)

---

## Препоръки за избягване на проблеми в бъдеще

1. **Използвайте Docker deployment:**
   - Build локално в Docker image
   - Test локално в Docker container
   - Deploy същия image на production
   - Гарантира идентична среда

2. **Проверявайте TypeScript локално преди commit:**
   ```bash
   pnpm --filter @dshome/admin tsc --noEmit
   ```

3. **Проверявайте production build локално:**
   ```bash
   pnpm --filter @dshome/admin build
   ```

4. **Синхронизирайте TypeScript типове с Database schema:**
   - При промяна на schema, веднага обновете интерфейсите
   - Използвайте Drizzle ORM type generation където е възможно

5. **ESLint fix преди push:**
   ```bash
   pnpm --filter @dshome/admin lint --fix
   ```

6. **Pre-commit hooks:**
   - TODO: Добавете Husky за автоматични проверки преди commit
   - Проверка за TypeScript errors
   - Проверка за ESLint errors
   - Автоматично форматиране с Prettier

---

## История на деплоймънти

### 2025-01-XX - Успешен деплоймънт след fixes
- Commits: `b95020e`, `0d4a597`
- Поправени всички TypeScript и ESLint грешки
- PM2 статус: Online
- URL: https://www.dshome.dev/admin/
