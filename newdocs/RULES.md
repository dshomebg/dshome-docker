# Строги Правила

**Правила които ВИНАГИ трябва да се спазват. Нарушение = проблем.**

## URLs и Портове

❌ **НИКОГА не измисляй URLs**
- api.dshome.dev НЕ съществува
- Production backend е на порт **4000** (PM2)
- Production admin е на порт **3001** (PM2)
- Development backend е на порт **4000**
- Development admin е на порт **3000**

✅ **Винаги използвай:**
```
Production Backend:  http://localhost:4000/api/ (via PM2)
Production Admin:    http://localhost:3001/admin (via PM2)
Public URLs:         https://dshome.dev/api/ (Nginx proxy)
                     https://dshome.dev/admin/ (Nginx proxy)
Development:         http://localhost:4000/api/
```

## Database

❌ **НИКОГА не приемай че миграция е успешна без проверка**
- `pnpm db:migrate` може да върне 0 exit code дори ако не се изпълни
- Винаги проверявай дали промените са в базата

✅ **Винаги проверявай:**
```bash
# След миграция проверявай таблицата/колоната
psql -U admin_dsdock -d admin_dsdock -c "\d table_name"
```

❌ **НИКОГА не синхронизирай schema без проверка**
- Schema в TypeScript != Database schema
- Промяна в schema не означава че е в базата

✅ **Винаги проверявай sync:**
1. Проверявай database структурата преди промяна
2. Прави промяна в schema
3. Run migration/push
4. Проверявай че промяната е в базата

## Drizzle Count Queries

❌ **НИКОГА не използвай:**
```typescript
db.select({ count: table.id })  // ГРЕШНО
```

✅ **Винаги използвай:**
```typescript
import { count } from 'drizzle-orm';
db.select({ count: count() })   // ПРАВИЛНО
```

## Конфигурационни Файлове

❌ **НИКОГА не правиш промени без да проверяваш текущия config**
- Nginx config може да е различен от предположенията
- Docker compose може да има различни портове

✅ **Винаги четеш файла ПРЕДИ промяна:**
```bash
cat /etc/nginx/sites-available/dshome.dev
cat docker-compose.prod.yml
```

## Schema Changes

❌ **НИКОГА не предполагай че промяната е навсякъде**
- Промяна в schema файла НЕ означава промяна в DB
- Промяна в DB НЕ означава че backend кода е обновен
- Промяна в backend НЕ означава че е deployed

✅ **Винаги sync в правилната последователност:**
1. Промяна в schema файл
2. Generate/push migration
3. Verify в database
4. Update controller/код ако трябва
5. Build
6. Deploy
7. Verify deployed version

## PM2 Configuration (Production)

❌ **НИКОГА не използвай pnpm --filter в PM2**
```javascript
// ecosystem.config.js - ГРЕШНО ❌
{
  script: 'pnpm',
  args: '--filter @dshome/admin start',  // Bash не може да parse-не
  cwd: '/opt/dshome',
}
```

✅ **Винаги използвай npm от package directory:**
```javascript
// ecosystem.config.js - ПРАВИЛНО ✅
{
  name: 'dshome-admin',
  script: 'npm',
  args: 'start',
  cwd: '/opt/dshome/packages/admin',  // Run from package dir
  env: {
    NODE_ENV: 'production',
  }
}
```

**Защо:**
- PM2 изпълнява script като bash команда
- Bash не разбира pnpm workspace флагове като `--filter`
- Process изглежда "online" но постоянно crash-ва
- Води до 404 errors на всички нови pages

## Production Deployment

❌ **НИКОГА не deploy без build**
```bash
git pull && pm2 restart all  # ГРЕШНО - старият build
```

✅ **Винаги с rebuild:**
```bash
# Backend
cd /opt/dshome/packages/backend
git pull
pnpm build
pm2 restart dshome-backend

# Admin
cd /opt/dshome/packages/admin
git pull
pnpm install
pnpm build
pm2 restart dshome-admin
```

## Testing Production

❌ **НИКОГА не приемай че работи без да тестваш**
- Exit code 0 != успешно deploy
- PM2 "online" != работещ API
- Build succeeded != deployed version

✅ **Винаги тествай:**
```bash
# Check PM2 status
pm2 status
pm2 logs --lines 20 --nostream

# Test backend
curl http://localhost:4000/api/health
curl https://dshome.dev/api/health

# Test admin
curl http://localhost:3001/admin
curl https://dshome.dev/admin

# Check restart count
pm2 status | grep -E 'dshome-(backend|admin)'
# If ↺ count is high = crash loop
```

## Controller Patterns

❌ **НИКОГА не копирай код без да разбереш проблема**
- Различни таблици имат различна структура
- count() трябва да се import-не от 'drizzle-orm'

✅ **Винаги следвай pattern:**
```typescript
import { count } from 'drizzle-orm';

let countQuery = db.select({ count: count() }).from(table);
if (conditions.length > 0) {
  countQuery = countQuery.where(conditions[0]) as any;
}

const [items, countResult] = await Promise.all([
  query.orderBy(...).limit(...).offset(...),
  countQuery
]);

const totalCount = Number(countResult[0]?.count || 0);
```

## Context и Памет

❌ **НИКОГА не разчитай на "помня от преди"**
- Context се губи
- Документацията е single source of truth

✅ **Винаги четеш newdocs/ файловете ПРЕДИ промяна**
- `newdocs/ARCHITECTURE.md` - URLs, ports, structure
- `newdocs/RULES.md` - Този файл
- `newdocs/COMMON_ISSUES.md` - Known problems
- `newdocs/WORKFLOWS.md` - Step by step guides

## Git Commits

❌ **НИКОГА не commit без да build-неш**
```bash
git add . && git commit  # ГРЕШНО
```

✅ **Винаги build преди commit:**
```bash
pnpm build                           # Verify builds
git add .
git commit -m "..."
git push
```

## Error Handling

❌ **НИКОГА не игнорирай errors**
- "Probably works" != работи
- Assume nothing, verify everything

✅ **Винаги check results:**
- Read error messages внимателно
- Check logs
- Test endpoint
- Verify data

## Code Changes

❌ **НИКОГА не правиш промени базирани на assumption**
- "Probably uses this pattern" - НЕ
- "Should work like this" - НЕ
- "I think this is the problem" - НЕ

✅ **Винаги read code ПРЕДИ промяна:**
```bash
# Read actual file
cat packages/backend/src/controllers/thing.controller.ts
# Understand pattern
# Make change
# Verify
```

## Schema Sync Rules

**При промяна в schema:**
1. ✅ Update TypeScript schema file
2. ✅ Generate migration OR push directly
3. ✅ Check database с psql
4. ✅ Update controllers if needed
5. ✅ Build backend
6. ✅ Test locally
7. ✅ Deploy
8. ✅ Test production

**Никога не skip нито една стъпка.**

## Production URLs - Final Check

**Валидни URLs:**
- https://dshome.dev/ (frontend)
- https://dshome.dev/admin/ (admin via Nginx)
- https://dshome.dev/api/ (backend via Nginx)
- http://localhost:4000/api/ (backend direct, on server)
- http://localhost:3001/admin (admin direct, on server)

**Невалидни URLs (НЕ СЪЩЕСТВУВАТ):**
- ❌ api.dshome.dev
- ❌ backend.dshome.dev
- ❌ http://157.90.129.12:3000 (не се използва)

**PM2 Process Management:**
- Backend runs on port **4000** via PM2
- Admin runs on port **3001** via PM2
- Nginx proxies external traffic to these ports

---

**Ако не си сигурен - ЧЕТИ ДОКУМЕНТАЦИЯТА. Не improvise.**
