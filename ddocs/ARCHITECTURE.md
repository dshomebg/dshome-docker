# DSHome Architecture - Quick Reference

**Последна актуализация:** 2025-11-12

## URLs и Портове

### Production (157.90.129.12)
```
https://dshome.dev/              → Frontend (React store)
https://dshome.dev/admin/        → Admin Panel (Next.js)
http://157.90.129.12:3000/api/   → Backend API (direct)
```

**Важно:** Production backend е на порт 3000, НЕ на 4000. Nginx proxy-ва `/admin/api/*` към `http://localhost:3000/api/`

### Development (localhost)
```
http://localhost:5173/           → Frontend (Vite)
http://localhost:3001/           → Admin Panel (Next.js)
http://localhost:4000/api/       → Backend API
http://localhost:5432            → PostgreSQL
http://localhost:6379            → Redis
http://localhost:7700            → Meilisearch
```

### Server Access
```
SSH: root@157.90.129.12
Password: 1Borabora@#
Project: /opt/dshome
```

## Структура на Проекта

```
/opt/dshome/                     # Production root
├── packages/
│   ├── backend/                 # Node.js API (port 4000 dev, 3000 prod)
│   ├── admin/                   # Next.js admin (port 3001)
│   ├── frontend/                # React store (port 5173)
│   └── shared/                  # Shared types
├── docker-compose.prod.yml      # Production containers
├── scripts/
│   ├── deploy-docker.sh         # Deployment script
│   ├── backup-db.sh             # Database backup
│   ├── restore-db.sh            # Database restore
│   └── logs.sh                  # View logs
└── .env                         # Production env vars
```

## Database

**Connection (Docker service names):**
```bash
# Development (Docker)
DATABASE_URL=postgresql://dev:dev@postgres:5432/dshome_dev

# Production (Docker)
DATABASE_URL=postgresql://prod_user:PASSWORD@postgres:5432/dshome_prod
```

**Важно:** В Docker се използват service names (`postgres`, `redis`, `meilisearch`), НЕ `localhost`!

**Таблици:**
```
users                    # Admin потребители
categories               # Категории (йерархични, parentId)
brands                   # Марки
suppliers                # Доставчици
products                 # Продукти
product_images           # Снимки
product_prices           # Цени (history)
product_inventory        # Наличности по складове
product_combinations     # Вариации (size, color)
product_combination_attributes  # Атрибути на вариациите
product_categories       # Many-to-many products↔categories
product_features         # Характеристики
warehouses               # Складове
orders                   # Поръчки
order_items              # Артикули в поръчка
shipping_addresses       # Адреси за доставка
attribute_groups         # Групи атрибути (size, color)
attribute_values         # Стойности (S, M, L / red, blue)
feature_groups           # Групи характеристики
feature_values           # Стойности на характеристики
import_templates         # Excel импорт темплейти
seo_settings             # SEO настройки
general_settings         # Общи настройки
measurement_rules        # Правила за мерни единици
```

## API Endpoints

```
GET  /api/health                        # Health check

# Auth
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

# Products
GET    /api/products                    # List (pagination, search, filters)
POST   /api/products                    # Create
GET    /api/products/:id                # Get single
PUT    /api/products/:id                # Update
DELETE /api/products/:id                # Delete
POST   /api/products/:id/images         # Upload images

# Categories
GET    /api/categories                  # List
POST   /api/categories                  # Create
GET    /api/categories/:id              # Get single
PUT    /api/categories/:id              # Update
DELETE /api/categories/:id              # Delete (CASCADE children)
GET    /api/categories/tree             # Tree structure

# Brands
GET    /api/brands                      # List
POST   /api/brands                      # Create
GET    /api/brands/:id                  # Get single
PUT    /api/brands/:id                  # Update
DELETE /api/brands/:id                  # Delete

# Warehouses
GET    /api/warehouses                  # List
POST   /api/warehouses                  # Create
GET    /api/warehouses/:id              # Get single
PUT    /api/warehouses/:id              # Update
DELETE /api/warehouses/:id              # Delete

# Orders
GET    /api/orders                      # List
POST   /api/orders                      # Create
GET    /api/orders/:id                  # Get single
PUT    /api/orders/:id                  # Update
PATCH  /api/orders/:id/status           # Update status

# Suppliers
GET    /api/suppliers                   # List
POST   /api/suppliers                   # Create
GET    /api/suppliers/:id               # Get single
PUT    /api/suppliers/:id               # Update
DELETE /api/suppliers/:id               # Delete

# Inventory
GET    /api/inventory                   # List
PUT    /api/inventory/:id               # Update quantity

# Attributes
GET    /api/attributes                  # List groups
POST   /api/attributes                  # Create group
GET    /api/attributes/:id              # Get group with values
PUT    /api/attributes/:id              # Update group
DELETE /api/attributes/:id              # Delete group
POST   /api/attributes/:id/values       # Add value
PUT    /api/attribute-values/:id        # Update value
DELETE /api/attribute-values/:id        # Delete value

# Features
GET    /api/features                    # List groups
POST   /api/features                    # Create group
GET    /api/features/:id                # Get group with values
PUT    /api/features/:id                # Update group
DELETE /api/features/:id                # Delete group
POST   /api/features/:id/values         # Add value
PUT    /api/feature-values/:id          # Update value
DELETE /api/feature-values/:id          # Delete value
```

## Deployment

**Development:**
```bash
pnpm dev                  # All packages in watch mode
```

**Production Deployment:**

Използва се `scripts/deploy-docker.sh` който:
1. Билдва Docker images локално
2. Запазва ги в tar.gz файлове
3. Качва ги на сървъра със SCP
4. Зарежда images и стартира контейнерите

```bash
# From local machine
./scripts/deploy-docker.sh

# OR manually step by step:

# 1. Build images locally
docker compose -f docker-compose.prod.yml build --no-cache

# 2. Save images to tar files
docker save dshome-backend-prod:latest | gzip > backend-image.tar.gz
docker save dshome-admin-prod:latest | gzip > admin-image.tar.gz

# 3. Upload to server
scp backend-image.tar.gz admin-image.tar.gz root@157.90.129.12:/opt/dshome/

# 4. Load images on server and deploy
ssh root@157.90.129.12 << 'ENDSSH'
cd /opt/dshome
docker load < backend-image.tar.gz
docker load < admin-image.tar.gz
rm backend-image.tar.gz admin-image.tar.gz
docker compose -f docker-compose.prod.yml up -d --no-build
ENDSSH

# 5. Clean up local files
rm backend-image.tar.gz admin-image.tar.gz
```

**Database migrations:**
```bash
# Development
pnpm db:generate          # Generate migration from schema changes
pnpm db:migrate           # Run migrations

# Production - Run inside backend container
docker exec -it dshome-backend-prod sh -c "cd /app/packages/backend && pnpm db:migrate"

# OR via docker compose
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml exec backend pnpm db:migrate
```

## Image Storage

**Location:**

Съхранява се в Docker volume `dshome-uploads-data`, монтиран към `/app/packages/backend/uploads` в backend контейнера.

```
Docker Volume: dshome-uploads-data
Container path: /app/packages/backend/uploads/
├── products/
│   ├── full/             # Original quality
│   ├── large/            # 1200x1200px
│   ├── medium/           # 600x600px
│   └── thumb/            # 200x200px
└── categories/
```

**Access:**
```
https://dshome.dev/images/products/full/{filename}
```

**Важно:** Upload директорията е persistent Docker volume и се запазва при редеплой!

## Key Files

```
packages/backend/src/db/schema/        # Database schema (Drizzle ORM)
packages/backend/src/controllers/      # API route handlers
packages/backend/src/routes/           # Express routes
packages/admin/lib/api.ts              # Admin API client config
docker-compose.prod.yml                # Production containers
scripts/deploy-docker.sh               # Deployment script
scripts/logs.sh                        # View logs helper
.env                                   # Environment variables
```

## Nginx Config Location

```
/etc/nginx/sites-available/dshome.dev
/home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom
```

## Environment Variables (Production)

**В Docker се използват service names, НЕ localhost!**

```env
# Application
NODE_ENV=production
API_PORT=3000

# Database (Docker service name: postgres)
DATABASE_URL=postgresql://prod_user:CHANGE_PASSWORD@postgres:5432/dshome_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=CHANGE_PASSWORD
POSTGRES_DB=dshome_prod

# Redis (Docker service name: redis)
REDIS_URL=redis://redis:6379

# Meilisearch (Docker service name: meilisearch)
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=CHANGE_THIS_KEY

# JWT
JWT_SECRET=CHANGE_THIS_SECRET_MIN_32_CHARS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Admin Panel
NEXT_PUBLIC_API_URL=https://www.dshome.dev/api

# Locale
DEFAULT_CURRENCY=EUR
DEFAULT_LOCALE=bg
```

## Docker Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect dshome-postgres-data
docker volume inspect dshome-uploads-data

# Backup volume (see scripts/backup-db.sh)
docker run --rm -v dshome-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## Common Commands

**Restart services:**
```bash
# On server
cd /opt/dshome
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart admin
```

**View logs:**
```bash
# Using helper script
./scripts/logs.sh

# OR manually
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f admin
docker compose -f docker-compose.prod.yml logs -f postgres
```

**Database access:**
```bash
# Production - Enter PostgreSQL container
docker exec -it dshome-postgres-prod psql -U prod_user -d dshome_prod

# Development
docker exec -it dshome-postgres-dev psql -U dev -d dshome_dev
```

**Container management:**
```bash
# List running containers
docker compose -f docker-compose.prod.yml ps

# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Rebuild and restart specific service
docker compose -f docker-compose.prod.yml up -d --build backend
```

**Clear migrations table (emergency):**
```bash
docker exec -it dshome-postgres-prod psql -U prod_user -d dshome_prod -c "DELETE FROM drizzle.__drizzle_migrations;"
```

## Troubleshooting

**Backend не стартира:**
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Check if database is running
docker compose -f docker-compose.prod.yml ps postgres

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

**Database connection failed:**
```bash
# Verify database is healthy
docker compose -f docker-compose.prod.yml ps

# Check DATABASE_URL uses service name 'postgres', not 'localhost'
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

**Images не се качват:**
```bash
# Check uploads volume is mounted
docker compose -f docker-compose.prod.yml exec backend ls -la /app/packages/backend/uploads

# Check permissions
docker compose -f docker-compose.prod.yml exec backend chmod -R 755 /app/packages/backend/uploads
```
