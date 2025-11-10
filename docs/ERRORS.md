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

## Production Runtime Грешки

### 1. Admin панел се опитва да се свърже с localhost:4000

**Грешка в browser console:**
```
localhost:4000/api/categories/tree:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
localhost:4000/api/products?page=1&limit=20:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Причина:**
Admin панелът (`packages/admin/lib/api.ts`) има **hardcoded** `const API_URL = "http://localhost:4000/api"` вместо да използва environment variable или относителен URL.

**Проблем:**
Next.js `NEXT_PUBLIC_*` променливи се вграждат (embed) по време на build, не по време на runtime. Дори да има правилно `NEXT_PUBLIC_API_URL` в docker-compose, ако admin image-ът е build-нат локално с неправилна конфигурация, той ще продължава да използва грешния URL.

**Решение:**
1. **Променете `packages/admin/lib/api.ts`:**
```typescript
// ПРЕДИ (❌ ГРЕШНО)
const API_URL = "http://localhost:4000/api";

// СЛЕД (✅ ПРАВИЛНО)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
```

2. **Използвайте относителен URL като fallback:**
   - Относителният URL `/api` ще работи чрез Nginx proxy
   - Не зависи от environment variable
   - Работи и локално и на production

3. **Rebuild admin image:**
```bash
# Локално
docker build -f packages/admin/Dockerfile -t dshome-admin:latest .

# Deploy
./deploy-docker.sh
```

**Алтернативно решение (по-добро):**
Използвайте **само относителни URLs** във всички API calls:
```typescript
// packages/admin/lib/api.ts
const API_URL = "/api";  // Винаги относителен
```

Nginx ще proxy-ва `/api/` към backend автоматично (configure в nginx.ssl.conf_custom).

---

### 2. Backend port mapping несъответствие

**Проблем:**
Backend слуша на порт 4000 вътре в контейнера, но docker-compose map-ва различен порт.

**Симптоми:**
- `curl http://localhost:3000/api/health` → Connection reset by peer
- Backend логове казват "Server running on port 4000"
- Docker map-ва 3000:3000 вместо 3000:4000

**Причина:**
Backend (`packages/backend/src/config/index.ts`) чете `API_PORT` environment variable, НЕ `PORT`:
```typescript
port: parseInt(process.env.API_PORT || '4000', 10),
```

Но `docker-compose.prod.yml` подаваше `PORT=3000` вместо `API_PORT=3000`.

**Решение:**
1. **Фиксирайте docker-compose.prod.yml:**
```yaml
environment:
  API_PORT: 3000  # ← ПРАВИЛНО (не PORT)
  DATABASE_URL: ${DATABASE_URL}
```

2. **Port mapping трябва да съвпада:**
```yaml
ports:
  - "3000:3000"  # External:Internal
```

Сега backend слуша на internal 3000 и Docker map-ва external 3000 → internal 3000.

---

### 3. Nginx proxy към грешен порт

**Проблем:**
Nginx proxy-ваше към `localhost:4000`, но backend Docker контейнер е exposed на порт 3000.

**Симптоми:**
```
nginx: [error] connect() failed (111: Connection refused) while connecting to upstream
upstream: "http://127.0.0.1:4000/api/"
```

**Решение:**
Променете `/home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom`:
```nginx
# ПРЕДИ
location /api/ {
    proxy_pass http://localhost:4000/api/;
    ...
}

# СЛЕД
location /api/ {
    proxy_pass http://localhost:3000/api/;
    ...
}
```

После reload nginx:
```bash
nginx -t && systemctl reload nginx
```

---

### 4. PostgreSQL не приема Docker connections

**Проблем:**
Backend не може да се свърже с PostgreSQL през `host.docker.internal`.

**Симптоми:**
```json
{"success":false,"data":{"status":"unhealthy","error":"Database connection failed"}}
```

Backend логове казват:
```
🗄️  Database: host.docker.internal:5432/admin_dsdock
```

Но connection fail-ва.

**Причина:**
PostgreSQL слуша само на `127.0.0.1:5432`, не приема connections от Docker контейнери.

**Решение:**

1. **Променете PostgreSQL да слуша на всички интерфейси:**
```bash
# /etc/postgresql/18/main/postgresql.conf
listen_addresses = '*'  # Вместо 'localhost'
```

2. **Добавете Docker network в pg_hba.conf:**
```bash
# /etc/postgresql/18/main/pg_hba.conf
# Добавете в края:
host    all             all             172.16.0.0/12           md5
```

3. **Рестартирайте PostgreSQL:**
```bash
systemctl restart postgresql
```

4. **Рестартирайте backend контейнера:**
```bash
cd /opt/dshome
docker compose -f docker-compose.prod.yml restart backend
```

**Верифициране:**
```bash
# PostgreSQL слуша на всички интерфейси
netstat -tlnp | grep 5432
# Трябва да видите: 0.0.0.0:5432

# API health check работи
curl https://dshome.dev/api/health
# Трябва да върне: {"success":true,"data":{"status":"healthy",...}}
```

---

### 5. DATABASE_URL с localhost вместо host.docker.internal

**Проблем:**
`.env` файлът на production съдържа `localhost` в DATABASE_URL, но Docker контейнери не могат да достигнат host през `localhost`.

**Грешна конфигурация:**
```env
DATABASE_URL=postgresql://admin_dsdock:pass@localhost:5432/admin_dsdock
```

**Правилна конфигурация:**
```env
DATABASE_URL=postgresql://admin_dsdock:pass@host.docker.internal:5432/admin_dsdock
```

**Решение:**
```bash
sed -i 's/@localhost:/@host.docker.internal:/g' /opt/dshome/.env
```

Docker използва `host.docker.internal` за да достигне host machine от контейнера.

---

## Deployment Checklist (Docker)

Преди deployment, проверете:

- [ ] Admin `lib/api.ts` използва относителен URL `/api` или `process.env.NEXT_PUBLIC_API_URL`
- [ ] `docker-compose.prod.yml` има `API_PORT: 3000` (не `PORT`)
- [ ] Port mapping е `3000:3000` (съвпада с internal порт)
- [ ] `.env` file има `host.docker.internal` в DATABASE_URL
- [ ] Nginx proxy-ва към `localhost:3000/api/`
- [ ] PostgreSQL `listen_addresses = '*'`
- [ ] PostgreSQL `pg_hba.conf` има Docker network range
- [ ] Health check работи: `curl https://dshome.dev/api/health`

---

## История на деплоймънти

### 2025-11-10 - Docker deployment debugging
- Проблем: Admin се опитва да се свърже с localhost:4000
- Причина: Hardcoded API_URL в lib/api.ts
- Решение: Трябва да се промени на относителен URL и rebuild
- Статус: Документирано, очаква fix в кода

### 2025-01-XX - Успешен деплоймънт след fixes
- Commits: `b95020e`, `0d4a597`
- Поправени всички TypeScript и ESLint грешки
- PM2 статус: Online
- URL: https://www.dshome.dev/admin/
