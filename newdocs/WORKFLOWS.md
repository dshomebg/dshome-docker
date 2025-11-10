# Workflows - Стъпка по Стъпка

**Точни последователности за често срещани задачи.**

## Deploy to Production

**Стандартен deploy с нови промени в кода.**

```bash
# 1. Local: Verify changes build
pnpm build

# 2. Local: Commit and push
git add .
git commit -m "Description"
git push

# 3. SSH to production
ssh root@157.90.129.12

# 4. Navigate to project
cd /opt/dshome

# 5. Pull latest code
git pull

# 6. Rebuild and restart (choose ONE):

# Option A: Full rebuild (safest)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Option B: Specific service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# Option C: Admin only
docker compose -f docker-compose.prod.yml build admin
docker compose -f docker-compose.prod.yml up -d admin

# 7. Verify deployment
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --tail=50

# 8. Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products

# 9. Exit SSH
exit
```

## Database Schema Change

**Добавяне/променяне на таблица или колона.**

### Step 1: Update Schema (Local)

```bash
# Edit schema file
vim packages/backend/src/db/schema/table-name.ts

# Example: Add new column
export const myTable = pgTable('my_table', {
  // ... existing columns
  newColumn: varchar('new_column', { length: 100 }),
});
```

### Step 2: Generate Migration (Local)

```bash
# Option A: Generate migration file
cd packages/backend
pnpm db:generate

# This creates a new file in src/db/migrations/
# Review the generated SQL

# Option B: Push directly (for simple changes)
pnpm db:push
```

### Step 3: Test Locally

```bash
# Run migration
pnpm db:migrate

# Verify in local database
psql -U postgres -d dshome
\d table_name
\q

# Test application
pnpm dev
# Test affected endpoints
```

### Step 4: Update Controllers (if needed)

```typescript
// packages/backend/src/controllers/my-controller.ts
// Add new field to create/update handlers

export const createItem = async (req: Request, res: Response) => {
  const { existingField, newColumn } = req.body;

  await db.insert(myTable).values({
    existingField,
    newColumn,  // Add this
    // ...
  });
};
```

### Step 5: Build and Test

```bash
# Build
pnpm build

# Test
pnpm dev
# Verify create/update/get work with new field
```

### Step 6: Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Add newColumn to my_table"
git push

# SSH to production
ssh root@157.90.129.12
cd /opt/dshome

# Pull code
git pull

# Run migration/push
cd packages/backend
npx drizzle-kit push

# Verify schema change
psql -U admin_dsdock -d admin_dsdock
\d my_table
\q

# Rebuild backend
cd /opt/dshome
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# Test
curl http://localhost:3000/api/my-endpoint
```

## Rollback Deployment

**Ако deploy-а cause-ва проблеми.**

```bash
# 1. SSH to production
ssh root@157.90.129.12
cd /opt/dshome

# 2. Check current commit
git log -1

# 3. Find last working commit
git log --oneline -10

# 4. Rollback to working commit
git reset --hard <commit-hash>

# 5. Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 6. Verify
curl http://localhost:3000/api/health

# 7. Check logs
docker compose -f docker-compose.prod.yml logs backend --tail=50
```

## Fix Schema Mismatch

**Когато TypeScript schema не match-ва database.**

```bash
# 1. Check database current state
ssh root@157.90.129.12
psql -U admin_dsdock -d admin_dsdock

# 2. Describe table
\d table_name

# Example output:
# Column      | Type                  | Nullable | Default
# postal_code | varchar(20)           | YES      |
# is_default  | boolean               | NO       | false

# 3. Exit psql
\q

# 4. Compare with TypeScript schema
cat packages/backend/src/db/schema/table-name.ts

# 5. Choose approach:

# Approach A: Update TypeScript to match DB
# Edit schema file to match DB structure

# Approach B: Update DB to match TypeScript
cd /opt/dshome/packages/backend
npx drizzle-kit push

# 6. Verify sync
psql -U admin_dsdock -d admin_dsdock -c "\d table_name"

# 7. Rebuild and restart
cd /opt/dshome
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

## Add New Endpoint

**Създаване на нов API endpoint.**

### Step 1: Create Controller

```bash
# Create/edit controller
vim packages/backend/src/controllers/my-controller.ts
```

```typescript
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { myTable } from '../db/schema';

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db.select().from(myTable);
    res.json({ data: items });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const [newItem] = await db.insert(myTable).values({ name }).returning();
    res.status(201).json({ data: newItem });
  } catch (error) {
    next(error);
  }
};
```

### Step 2: Add Route

```bash
# Edit routes
vim packages/backend/src/routes/my-routes.ts
```

```typescript
import express from 'express';
import { getItems, createItem } from '../controllers/my-controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getItems);
router.post('/', authenticate, createItem);

export default router;
```

### Step 3: Register Route

```bash
# Edit main routes file
vim packages/backend/src/routes/index.ts
```

```typescript
import myRoutes from './my-routes';

// In setup function:
app.use('/api/my-endpoint', myRoutes);
```

### Step 4: Test Locally

```bash
# Build and run
pnpm build
pnpm dev

# Test endpoints
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/my-endpoint
```

### Step 5: Deploy

```bash
# Commit and deploy (see "Deploy to Production")
git add .
git commit -m "Add my-endpoint API"
git push

# Deploy to production...
```

## Update Nginx Config

**Промяна в Nginx reverse proxy.**

```bash
# 1. SSH to production
ssh root@157.90.129.12

# 2. Backup current config
cp /etc/nginx/sites-available/dshome.dev /etc/nginx/sites-available/dshome.dev.backup

# 3. Edit config
nano /etc/nginx/sites-available/dshome.dev

# 4. Test config syntax
nginx -t

# 5. If OK, reload nginx
systemctl reload nginx

# 6. If errors, restore backup
# cp /etc/nginx/sites-available/dshome.dev.backup /etc/nginx/sites-available/dshome.dev
# systemctl reload nginx

# 7. Check logs
tail -f /var/log/nginx/error.log
```

## Clear and Rebuild Everything (Nuclear Option)

**Когато нещо е напълно объркано.**

```bash
# LOCAL
cd D:\001-DSHOME-DOCKER

# 1. Stop everything
docker compose -f docker\docker-compose.dev.yml down

# 2. Clean build artifacts
rm -rf packages/backend/dist
rm -rf packages/admin/.next
rm -rf packages/shared/dist
rm -rf node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# 3. Fresh install
pnpm install

# 4. Build all
pnpm build

# 5. Start dev
docker compose -f docker\docker-compose.dev.yml up -d
pnpm dev

# PRODUCTION
ssh root@157.90.129.12
cd /opt/dshome

# 1. Stop containers
docker compose -f docker-compose.prod.yml down

# 2. Rebuild without cache
docker compose -f docker-compose.prod.yml build --no-cache

# 3. Start
docker compose -f docker-compose.prod.yml up -d

# 4. Verify
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
```

## Database Backup and Restore

**Backup преди major changes.**

```bash
# BACKUP
ssh root@157.90.129.12

# Create backup
pg_dump -U admin_dsdock -d admin_dsdock -F c -f /tmp/backup_$(date +%Y%m%d_%H%M%S).dump

# Download backup to local (from local machine)
scp root@157.90.129.12:/tmp/backup_*.dump ./backups/

# RESTORE (if needed)
ssh root@157.90.129.12

# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Restore
pg_restore -U admin_dsdock -d admin_dsdock -c /tmp/backup_YYYYMMDD_HHMMSS.dump

# Start backend
docker compose -f docker-compose.prod.yml start backend
```

---

**Винаги следвай workflows точно. Не skip-вай стъпки.**
