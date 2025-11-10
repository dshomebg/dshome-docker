# Чести Проблеми и Решения

**Known issues и как да ги fix-неш бързо.**

## Migration Problems

### Problem: Migrations not applying
```
Error: Migration already exists in history but not in filesystem
```

**Причина:** Несинхронизирани migration files и database history table.

**Решение:**
```bash
# 1. Check current migrations in DB
ssh root@157.90.129.12
psql -U admin_dsdock -d admin_dsdock -c "SELECT * FROM drizzle.__drizzle_migrations;"

# 2. Clear migration table (emergency only)
psql -U admin_dsdock -d admin_dsdock -c "DELETE FROM drizzle.__drizzle_migrations;"

# 3. Push current schema
cd /opt/dshome/packages/backend
npx drizzle-kit push
```

### Problem: Schema mismatch after migration
```
Error: column "field_name" does not exist
```

**Причина:** TypeScript schema не match-ва database schema.

**Решение:**
```bash
# 1. Check actual database schema
psql -U admin_dsdock -d admin_dsdock -c "\d table_name"

# 2. Compare with TypeScript schema
cat packages/backend/src/db/schema/table.ts

# 3. Update TypeScript schema to match DB
# 4. OR update DB to match TypeScript
npx drizzle-kit push
```

## Count Query Errors

### Problem: Cannot read properties of undefined (reading 'count')
```typescript
const totalCount = countResult[0].count;  // Error
```

**Причина:**
1. Използваш `db.select({ count: table.id })` вместо `count()`
2. Празна таблица връща `[]`, не `[{ count: 0 }]`

**Решение:**
```typescript
import { count } from 'drizzle-orm';

let countQuery = db.select({ count: count() }).from(table);
if (conditions.length > 0) {
  countQuery = countQuery.where(conditions[0]) as any;
}

const [items, countResult] = await Promise.all([
  query.orderBy(desc(table.createdAt)).limit(limitNum).offset(offset),
  countQuery
]);

const totalCount = Number(countResult[0]?.count || 0);  // Null safety
```

## Nginx Issues

### Problem: 404 on /admin/ or /api/ routes

**Причина:** Nginx config не proxy-ва правилно.

**Решение:**
```bash
# 1. Check nginx config
cat /etc/nginx/sites-available/dshome.dev

# 2. Should have these locations:
location /admin/api/ {
    proxy_pass http://localhost:3000/api/;
}

location /api/ {
    proxy_pass http://localhost:3000/api/;
}

# 3. Restart nginx
systemctl restart nginx

# 4. Check logs
tail -f /var/log/nginx/error.log
```

### Problem: Admin static files not loading

**Причина:** Next.js basePath не match-ва nginx location.

**Решение:**
```javascript
// packages/admin/next.config.js
module.exports = {
  basePath: '/admin',  // MUST match nginx location
  assetPrefix: '/admin',
}
```

## Docker Issues

### Problem: Container starts but API doesn't respond

**Причина:** Container може да run but application crash-ва вътре.

**Решение:**
```bash
# 1. Check container logs
docker compose -f docker-compose.prod.yml logs backend

# 2. Check if process is running
docker compose -f docker-compose.prod.yml exec backend ps aux

# 3. Check environment
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL

# 4. Restart with rebuild
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Problem: Changes not reflected after deploy

**Причина:** Docker cache - не rebuild-ва с новия код.

**Решение:**
```bash
# Always rebuild on deploy
git pull
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend

# Verify new code
docker compose -f docker-compose.prod.yml exec backend cat package.json
```

## Database Connection Issues

### Problem: Backend can't connect to database

**Причина:** Wrong DATABASE_URL or PostgreSQL not running.

**Решение:**
```bash
# 1. Check PostgreSQL is running
systemctl status postgresql

# 2. Check connection string
echo $DATABASE_URL
# Should be: postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock

# 3. Test connection manually
psql -U admin_dsdock -d admin_dsdock

# 4. Check backend env
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

## NOT NULL Constraint Violations

### Problem: null value in column violates not-null constraint
```
ERROR: null value in column "field_name" violates not-null constraint
```

**Причина:** Schema има `.notNull()` но frontend не изпраща стойност.

**Решение:**
```typescript
// packages/backend/src/db/schema/table.ts
// Option 1: Make field optional
fieldName: varchar('field_name', { length: 100 }),  // No .notNull()

// Option 2: Add default
fieldName: varchar('field_name', { length: 100 }).notNull().default(''),

// Then push schema change
npx drizzle-kit push

// Update database constraint manually if needed
psql -U admin_dsdock -d admin_dsdock
ALTER TABLE table_name ALTER COLUMN field_name DROP NOT NULL;
```

## Port Conflicts

### Problem: Port already in use

**Причина:** Previous process still running.

**Решение:**
```bash
# Windows (development)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux (production)
lsof -ti:3000 | xargs kill -9

# Or restart docker
docker compose -f docker-compose.prod.yml restart backend
```

## Admin Panel API Errors

### Problem: Admin calls wrong API URL

**Причина:** `packages/admin/lib/api.ts` config.

**Решение:**
```typescript
// packages/admin/lib/api.ts
const API_URL =
  process.env.NODE_ENV === "production"
    ? "/admin/api"              // Production: nginx proxy
    : "http://localhost:4000/api";  // Dev: direct

// Verify NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_URL:', API_URL);
```

## Image Upload Issues

### Problem: Images uploaded but not accessible

**Причина:** Upload path not mounted or wrong permissions.

**Решение:**
```bash
# 1. Check upload directory
ls -la /opt/dshome/packages/backend/uploads/

# 2. Check permissions
chmod -R 755 /opt/dshome/packages/backend/uploads/

# 3. Verify docker volume mount
docker compose -f docker-compose.prod.yml exec backend ls -la /app/packages/backend/uploads/
```

## Build Failures

### Problem: TypeScript compilation errors

**Причина:** Type mismatch or missing imports.

**Решение:**
```bash
# 1. Clean build
rm -rf packages/backend/dist
rm -rf packages/shared/dist

# 2. Rebuild shared first
cd packages/shared
pnpm build

# 3. Then backend
cd ../backend
pnpm build

# 4. Check errors carefully
```

## Quick Diagnostics

**When something breaks, run these:**

```bash
# 1. Check all services
docker compose -f docker-compose.prod.yml ps

# 2. Check logs
docker compose -f docker-compose.prod.yml logs backend -f

# 3. Test API
curl http://157.90.129.12:3000/api/health

# 4. Check database
psql -U admin_dsdock -d admin_dsdock -c "SELECT version();"

# 5. Check nginx
systemctl status nginx
```

---

**Винаги четеш logs преди да предполагаш проблема.**
