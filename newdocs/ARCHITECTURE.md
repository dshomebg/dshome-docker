# DSHome Architecture - Quick Reference

**Последна актуализация:** 2025-11-10

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
└── .env.production              # Production env vars
```

## Database

**Connection:**
- Dev: `postgresql://postgres:postgres@localhost:5432/dshome`
- Prod: `postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock`

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

**Production:**
```bash
# On server
cd /opt/dshome
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

**Database migrations:**
```bash
# Development
pnpm db:generate          # Generate migration from schema changes
pnpm db:migrate           # Run migrations

# Production (inside backend container or on server)
cd /opt/dshome/packages/backend
npx drizzle-kit push      # Push schema changes directly
```

## Image Storage

**Location:**
```
Production: /opt/dshome/packages/backend/uploads/
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

## Key Files

```
packages/backend/src/db/schema/        # Database schema (Drizzle ORM)
packages/backend/src/controllers/      # API route handlers
packages/backend/src/routes/           # Express routes
packages/admin/lib/api.ts              # Admin API client config
docker-compose.prod.yml                # Production containers
.env.production                        # Production env vars
```

## Nginx Config Location

```
/etc/nginx/sites-available/dshome.dev
```

## Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=your-master-key

UPLOAD_DIR=/opt/dshome/packages/backend/uploads
```

## Common Commands

**Restart backend:**
```bash
docker compose -f docker-compose.prod.yml restart backend
```

**View logs:**
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f admin
```

**Database access:**
```bash
# Production
psql -U admin_dsdock -d admin_dsdock

# Development
psql -U postgres -d dshome
```

**Clear migrations table (emergency):**
```bash
psql -U admin_dsdock -d admin_dsdock -c "DELETE FROM drizzle.__drizzle_migrations;"
```
