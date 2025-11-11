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

## PM2 Configuration Issues

### Problem: PM2 process constantly restarting, pages return 404
```
[PM2] Process restarted 15 times
/usr/bin/bash: --filter: invalid option
```

**Причина:**
- ecosystem.config.js използва `pnpm --filter` което bash не може да parse-не като команда
- PM2 изпълнява script като bash команда, не като npm/pnpm команда
- Process-ът изглежда "online" в PM2 но всъщност постоянно crash-ва и restart-ва

**Симптоми:**
- Всички НОВИ pages връщат 404
- Стари pages работят (от предишен build)
- PM2 status показва "online" но високо ↺ restart count
- Port е зает но приложението не работи

**Решение:**
```javascript
// ecosystem.config.js - ГРЕШНО ❌
{
  name: 'dshome-admin',
  script: 'pnpm',
  args: '--filter @dshome/admin start',  // Bash не може да parse-не --filter
  cwd: '/opt/dshome',
}

// ecosystem.config.js - ПРАВИЛНО ✅
{
  name: 'dshome-admin',
  script: 'npm',
  args: 'start',
  cwd: '/opt/dshome/packages/admin',  // Run from package directory
  env: {
    NODE_ENV: 'production',
  }
}
```

**Стъпки за fix:**
```bash
# 1. Edit ecosystem.config.js
nano /opt/dshome/ecosystem.config.js

# 2. Kill old processes blocking the port
lsof -ti:3001 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# 3. Restart PM2 with new config
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# 4. Verify
pm2 status
pm2 logs --lines 50
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
lsof -ti:3001 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# Or restart docker
docker compose -f docker-compose.prod.yml restart backend
```

## Admin Panel API Errors

### Problem: Admin calls wrong API URL or images load from localhost

**Причина:** Missing `.env.production` file OR incorrect `packages/admin/lib/api.ts` config.

**Симптоми:**
- Images load from `http://localhost:4000/uploads/...` instead of production URL
- Mixed Content errors in browser console
- API calls go to localhost instead of production

**Решение:**
```bash
# 1. Create .env.production file (REQUIRED for production builds)
cat > /opt/dshome/packages/admin/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://www.dshome.dev/api
NODE_ENV=production
EOF

# 2. Rebuild admin with environment file
cd /opt/dshome/packages/admin
rm -rf .next
NODE_ENV=production pnpm build
pm2 restart dshome-admin

# 3. Verify build used correct env
# Look for "- Environments: .env.production" in build output
```

**Важно:**
- Next.js "захардкодва" environment variables по време на build
- PM2 env vars НЕ работят за NEXT_PUBLIC_* променливи
- Трябва да има `.env.production` файл ПРЕДИ build

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
# 1. Check PM2 processes (PRODUCTION)
pm2 status
pm2 logs --lines 20 --nostream
# Check for:
# - High restart count (↺) - indicates crash loop
# - Errors in logs like "bash: --filter: invalid option"
# - Process "online" but port conflicts

# 2. Check ports in use
lsof -ti:3001   # Admin port
lsof -ti:4000   # Backend port
netstat -tlnp | grep -E ':(3001|4000)'

# 3. Check all services (DOCKER)
docker compose -f docker-compose.prod.yml ps

# 4. Check logs (DOCKER)
docker compose -f docker-compose.prod.yml logs backend -f

# 5. Test API endpoints
curl http://localhost:4000/api/health
curl http://localhost:3001/admin
curl https://dshome.dev/api/health

# 6. Check database connection
psql -U admin_dsdock -d admin_dsdock -c "SELECT version();"

# 7. Check nginx
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log
```

---

**Винаги четеш logs преди да предполагаш проблема. PM2 logs са критични за production issues.**
