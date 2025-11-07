# DSHome E-Commerce - Setup Guide

Това е пълно ръководство за setup на проекта локално и на production сървъра.

## Системни изисквания

### Локална разработка (Windows 10)

**Задължително:**
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker Desktop
- Git
- VS Code (препоръчително)

**Проверка на версиите:**
```bash
node --version    # v22.20.0 или по-ново
pnpm --version    # 8.15.0 или по-ново
docker --version  # 28.5.1 или по-ново
git --version     # 2.x или по-ново
```

### Production сървър (Ubuntu 24.04)

**Инсталирано:**
- Ubuntu 24.04.3 LTS
- HestiaCP
- PostgreSQL 18
- Redis 7
- Nginx
- Docker
- PM2 (optional)

---

## Локална Setup (Development)

### 1. Клониране на проекта

```bash
# Clone repository
git clone https://github.com/dshomebg/dshome-docker.git

# Navigate to project
cd dshome-docker
```

### 2. Инсталиране на pnpm (ако не е инсталиран)

```bash
# Enable Corepack (вградено в Node.js)
corepack enable

# Проверка
pnpm --version
```

### 3. Инсталиране на dependencies

```bash
# Install all workspace dependencies
pnpm install
```

Това ще инсталира зависимостите за:
- Root monorepo
- packages/shared
- packages/backend
- packages/frontend (когато се създаде)
- packages/admin (когато се създаде)

### 4. Environment конфигурация

```bash
# Copy example env file
copy .env.example .env

# Edit .env file with your settings
```

**Основни настройки в .env:**
```env
# Database
DATABASE_URL=postgresql://dev:dev@localhost:5432/dshome_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev
POSTGRES_DB=dshome_dev

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=dev_master_key_change_in_production

# Backend API
API_PORT=4000
API_URL=http://localhost:4000

# JWT
JWT_SECRET=your_jwt_secret_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Images
IMAGES_PATH=./dev-assets/images
IMAGES_BASE_URL=http://localhost:3000/images

# Locale
DEFAULT_CURRENCY=EUR
DEFAULT_LOCALE=bg
```

### 5. Стартиране на Docker услуги

```bash
# Start PostgreSQL, Redis, Meilisearch
pnpm docker:dev:up

# Проверка на статуса
docker ps
```

**Очаквани контейнери:**
```
dshome-postgres-dev     → localhost:5432
dshome-redis-dev        → localhost:6379
dshome-meilisearch-dev  → localhost:7700
```

### 6. Database Setup

```bash
# Generate migrations from schema
pnpm --filter @dshome/backend db:generate

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

**Seed данни включват:**
- Admin user: admin@dshome.dev / admin123
- Главен склад
- 3 примерни категории

### 7. Стартиране на Development сървъри

**В отделни терминали:**

```bash
# Terminal 1 - Backend API
pnpm --filter @dshome/backend dev
# Runs on http://localhost:4000

# Terminal 2 - Frontend (когато се създаде)
pnpm --filter @dshome/frontend dev
# Runs on http://localhost:3000

# Terminal 3 - Admin Panel (когато се създаде)
pnpm --filter @dshome/admin dev
# Runs on http://localhost:3001
```

**Или стартирай всички наведнъж:**
```bash
pnpm dev
```

### 8. Достъп до услугите

**Backend API:**
- URL: http://localhost:4000
- Health: http://localhost:4000/api/health
- API Docs: http://localhost:4000/api-docs (когато се добави Swagger)

**Frontend:**
- URL: http://localhost:3000 (когато се създаде)

**Admin Panel:**
- URL: http://localhost:3001 (когато се създаде)
- Login: admin@dshome.dev / admin123

**Database:**
- Host: localhost
- Port: 5432
- Database: dshome_dev
- User: dev
- Password: dev

**Drizzle Studio (Database GUI):**
```bash
pnpm db:studio
# Opens on https://local.drizzle.studio
```

**Meilisearch Dashboard:**
- URL: http://localhost:7700
- Master Key: dev_master_key_change_in_production

---

## Полезни команди

### Monorepo управление

```bash
# Install package for specific workspace
pnpm --filter @dshome/backend add express

# Run script in specific workspace
pnpm --filter @dshome/backend dev

# Run script in all workspaces
pnpm -r dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Clean all build artifacts
pnpm clean
```

### Database операции

```bash
# Generate new migration
pnpm --filter @dshome/backend db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Drizzle Studio
pnpm db:studio
```

### Docker операции

```bash
# Start services
pnpm docker:dev:up

# Stop services
pnpm docker:dev:down

# View logs
pnpm docker:dev:logs

# Restart services
pnpm docker:dev:down && pnpm docker:dev:up

# Remove all data (fresh start)
docker-compose -f docker/docker-compose.dev.yml down -v
```

### Git workflow

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/your-feature

# Switch branch
git checkout main
```

---

## Production Setup (Ubuntu Server)

### Предварителна подготовка

**Информация за сървъра:**
- Host: srv.dshome.dev (157.90.129.12)
- OS: Ubuntu 24.04.3 LTS
- CPU: 12 cores
- RAM: 125 GiB
- Storage: 1.9 TB

**Инсталирани услуги:**
- HestiaCP
- PostgreSQL 18 (native)
- Redis 7 (native)
- Meilisearch 1.24 (native)
- Nginx
- Docker

### 1. Server Access

```bash
# SSH to server
ssh root@157.90.129.12

# Or with key
ssh -i ~/.ssh/your-key root@157.90.129.12
```

### 2. Domain Configuration (в HestiaCP)

**Създай 1 домейн:**
1. `dshome.dev` → Всички приложения (path-based routing)

**Let's Encrypt SSL:**
- Активирай SSL за dshome.dev (с www.dshome.dev)
- Auto-renewal: enabled

**URL структура:**
```
https://dshome.dev/              → Frontend (React store)
https://dshome.dev/admin/        → Admin Panel (Next.js)
https://dshome.dev/api/          → Backend API
https://dshome.dev/images/       → Static images
```

### 3. Database Setup (Native PostgreSQL)

```bash
# Create production database
sudo -u postgres psql
CREATE DATABASE dshome_prod;
CREATE USER dshome_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE dshome_prod TO dshome_user;
\q
```

### 4. Environment Variables

```bash
# Create production .env
cd /opt/dshome
nano .env
```

**Production .env:**
```env
NODE_ENV=production

# Database (Native PostgreSQL)
DATABASE_URL=postgresql://dshome_user:PASSWORD@localhost:5432/dshome_prod

# Redis (Native)
REDIS_URL=redis://localhost:6379

# Meilisearch (Native)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=PRODUCTION_MASTER_KEY_HERE

# Backend API
API_PORT=4000
API_URL=https://dshome.dev/api

# Frontend
VITE_API_URL=https://dshome.dev/api

# Admin
NEXT_PUBLIC_API_URL=https://dshome.dev/api
NEXT_PUBLIC_BASE_PATH=/admin

# JWT
JWT_SECRET=STRONG_RANDOM_SECRET_HERE
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Images
IMAGES_PATH=/var/www/dshome.dev/public/images
IMAGES_BASE_URL=https://dshome.dev/images

# Locale
DEFAULT_CURRENCY=EUR
DEFAULT_LOCALE=bg
```

### 5. Images Directory Setup

```bash
# Create images directory
mkdir -p /var/www/dshome.dev/public/images/products/{full,large,medium,thumb}
mkdir -p /var/www/dshome.dev/public/images/categories

# Set permissions
chown -R www-data:www-data /var/www/dshome.dev/public/images
chmod -R 755 /var/www/dshome.dev/public/images
```

### 6. Nginx Configuration (HestiaCP)

**Важно:** HestiaCP управлява основната Nginx конфигурация. Използваме custom config файл.

**Файл:** `/home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom`

```nginx
# Custom Nginx configuration for dshome.dev
# This file is included by HestiaCP main config

# Static images serving
location /images/ {
    alias /home/admin/web/dshome.dev/public_html/images/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# Backend API proxy
location /api/ {
    proxy_pass http://localhost:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # CORS headers
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

    if ($request_method = OPTIONS) {
        return 204;
    }
}

# Admin Panel proxy
location /admin/ {
    proxy_pass http://localhost:3001/admin/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Frontend SPA (fallback to index.html for React Router)
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Health check endpoint
location /health {
    proxy_pass http://localhost:4000/api/health;
    access_log off;
}
```

**Активиране:**
```bash
# HestiaCP автоматично включва _custom файлове
# Само рестартираме Nginx
systemctl restart nginx

# Проверка
nginx -t
```

### 7. Docker Deployment

**Build и deploy чрез GitHub Actions** (автоматично при push)

Или ръчно:

```bash
# Pull latest code
cd /opt/dshome
git pull origin main

# Build Docker images
docker-compose -f docker/docker-compose.prod.yml build

# Run migrations
docker-compose -f docker/docker-compose.prod.yml run --rm backend pnpm db:migrate

# Start services
docker-compose -f docker/docker-compose.prod.yml up -d

# Check status
docker-compose -f docker/docker-compose.prod.yml ps
```

### 8. Database Migrations (Production)

```bash
# Run migrations
cd /opt/dshome
docker-compose -f docker/docker-compose.prod.yml run --rm backend pnpm db:migrate

# Or if using native Node
cd /opt/dshome/packages/backend
pnpm db:migrate
```

### 9. Initial Seed (Production)

```bash
# Seed production database
docker-compose -f docker/docker-compose.prod.yml run --rm backend pnpm db:seed

# Change admin password immediately after!
```

### 10. Monitoring & Logs

```bash
# View Docker logs
docker-compose -f docker/docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker/docker-compose.prod.yml logs -f backend

# System logs
tail -f /var/log/dshome/backend/app.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 11. Backup Setup

**Automated PostgreSQL Backup (cron):**

```bash
# Create backup script
nano /opt/scripts/backup-dshome-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/dshome"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U dshome_user dshome_prod > "$BACKUP_DIR/dshome_prod_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/dshome_prod_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "dshome_prod_*.sql.gz" -mtime +30 -delete

echo "Backup completed: dshome_prod_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /opt/scripts/backup-dshome-db.sh

# Add to cron (daily at 2 AM)
crontab -e
0 2 * * * /opt/scripts/backup-dshome-db.sh >> /var/log/dshome-backup.log 2>&1
```

---

## Troubleshooting

### Docker issues

**Containers not starting:**
```bash
# Check logs
docker logs dshome-postgres-dev
docker logs dshome-redis-dev
docker logs dshome-meilisearch-dev

# Restart Docker
net stop com.docker.service
net start com.docker.service
```

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database issues

**Connection refused:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs dshome-postgres-dev

# Restart container
docker restart dshome-postgres-dev
```

**Migration failed:**
```bash
# Reset database (development only!)
docker-compose -f docker/docker-compose.dev.yml down -v
docker-compose -f docker/docker-compose.dev.yml up -d
pnpm db:migrate
pnpm db:seed
```

### pnpm issues

**Install fails:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
rm -rf node_modules
rm -rf packages/*/node_modules

# Reinstall
pnpm install
```

### Build issues

**TypeScript errors:**
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

**Circular dependencies:**
```bash
# Check dependency tree
pnpm list --depth=3
```

---

## Полезни ресурси

**Официална документация:**
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)
- [React 19](https://react.dev/)
- [Next.js 14](https://nextjs.org/)

**Инструменти:**
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)
- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database GUI

---

**Последна актуализация:** 2025-11-07
**Автор:** Claude (AI Assistant)
