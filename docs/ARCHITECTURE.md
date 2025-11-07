# Архитектура на DSHome E-Commerce Platform

## Общ преглед

DSHome е модерен e-commerce платформа за физически стоки, оптимизирана за българския пазар. Проектът използва monorepo архитектура с отделни пакети за frontend, admin панел, backend API и споделени типове.

## Технологичен Stack

### Frontend (Customer Store)
- **React 19** - UI библиотека
- **TypeScript** - типова безопасност
- **Vite** - бърз build tool и dev server
- **Tailwind CSS** - utility-first styling
- **TanStack Query** - data fetching и state management
- **React Router** - routing
- **html2pdf.js** - PDF генериране

### Admin Panel
- **Next.js 14** - React framework с SSR
- **TailAdmin Template v2.2** - готов dashboard UI
- **TypeScript** - типова безопасност
- **Tailwind CSS** - styling

### Backend API
- **Node.js 20.x** - JavaScript runtime
- **Express.js** - web framework
- **TypeScript** - типова безопасност
- **Drizzle ORM** - type-safe ORM
- **JWT** - автентикация
- **Winston** - logging
- **Sharp** - image processing
- **XLSX** - Excel file processing

### Infrastructure
- **PostgreSQL 18.0** - релационна база данни
- **Redis 7.0** - кеш и session store
- **Meilisearch 1.24** - търсачка
- **Docker + Docker Compose** - контейнеризация
- **PM2** - process manager (production)
- **Nginx** - reverse proxy и static files
- **HestiaCP** - server control panel

### DevOps
- **GitHub** - source control
- **GitHub Actions** - CI/CD
- **pnpm** - package manager
- **Turbo** - monorepo build system

## Структура на проекта

```
dshome-docker/
├── .github/
│   └── workflows/              # CI/CD workflows
│
├── packages/
│   ├── shared/                 # Споделени типове и константи
│   │   ├── src/
│   │   │   ├── types/         # TypeScript типове
│   │   │   ├── constants/     # Константи (валута, локал)
│   │   │   ├── validators/    # Zod schemas
│   │   │   └── utils/         # Utility функции
│   │   └── package.json
│   │
│   ├── backend/               # Node.js API
│   │   ├── src/
│   │   │   ├── config/       # Конфигурация
│   │   │   ├── db/           # Database (Drizzle ORM)
│   │   │   │   ├── schema/   # DB schema
│   │   │   │   └── migrations/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── routes/       # Express routes
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── services/     # Business logic
│   │   │   └── utils/        # Utilities
│   │   └── package.json
│   │
│   ├── frontend/             # React клиентски магазин
│   │   ├── src/
│   │   │   ├── components/   # React компоненти
│   │   │   ├── pages/        # Страници
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── services/     # API комуникация
│   │   │   └── stores/       # State management
│   │   └── package.json
│   │
│   └── admin/                # Next.js admin панел
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # React компоненти
│       │   └── services/     # API комуникация
│       └── package.json
│
├── docker/
│   ├── docker-compose.dev.yml    # Development услуги
│   └── docker-compose.prod.yml   # Production apps
│
├── scripts/
│   ├── db-backup.sh         # Database backup
│   └── deploy.sh            # Deployment script
│
├── docs/                    # Документация
│
└── dev-assets/             # Development ресурси
    └── images/             # Тестови снимки
```

## Архитектурни решения

### 1. Monorepo подход

**Защо monorepo?**
- Споделени типове между frontend/backend/admin
- Единна система за версии
- Проста cross-package референция
- Консистентни dependencies

**Инструменти:**
- `pnpm workspaces` - package management
- `Turbo` - build orchestration и кеширане

### 2. Database стратегия

**Development (локално):**
```
Docker PostgreSQL → localhost:5432
- Тестови данни (50-100 продукта)
- Бързо reset
- Изолирана среда
```

**Production (Ubuntu сървър):**
```
Native PostgreSQL → localhost:5432
- Permanent data storage
- HestiaCP backups
- По-добра производителност
- Лесен достъп за администрация
```

**Защо не Docker за production DB?**
- Данните са критични и не трябва да се губят при redeploy
- HestiaCP има вградени backup механизми за native PostgreSQL
- По-добра производителност без Docker overhead
- Лесна миграция и scaling

### 3. Images Storage

**Архитектура:**
```
Production Server:
/var/www/dshome.dev/public/images/
├── products/
│   ├── full/          # Оригинални (upload quality)
│   ├── large/         # 1200x1200px
│   ├── medium/        # 600x600px
│   └── thumb/         # 200x200px
└── categories/
    └── {id}/banner.webp
```

**Image Processing Pipeline:**
1. Upload от admin panel
2. Validation (тип, размер)
3. Sharp library: resize в 4 размера
4. Save to filesystem
5. WebP format за оптимизация
6. Database запазва само пътища

**Защо filesystem, не cloud?**
- Пълен контрол
- Нулеви допълнителни разходи
- Бързо обслужване от Nginx
- Лесни backups (part of server backup)

### 4. Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│  Client │                │   API   │                │   Redis  │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /auth/login        │                          │
     ├─────────────────────────>│                          │
     │  email + password        │                          │
     │                          │                          │
     │                          │  Check credentials       │
     │                          │  (PostgreSQL)            │
     │                          │                          │
     │                          │  Generate JWT tokens     │
     │                          │  - accessToken (15 min)  │
     │                          │  - refreshToken (7 days) │
     │                          │                          │
     │  Return tokens           │  Store session           │
     │<─────────────────────────├─────────────────────────>│
     │                          │                          │
     │  API requests            │                          │
     │  + Bearer token          │                          │
     ├─────────────────────────>│                          │
     │                          │  Verify JWT              │
     │                          │                          │
     │  Response                │                          │
     │<─────────────────────────┤                          │
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "email": "admin@dshome.dev",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### 5. API Architecture

**REST API Design:**
```
/api/
├── health              # Health check
├── auth/
│   ├── login          # POST - Login
│   ├── logout         # POST - Logout
│   ├── refresh        # POST - Refresh token
│   └── me             # GET - Current user
├── products/
│   ├── /              # GET - List, POST - Create
│   ├── /:id           # GET - Get, PUT - Update, DELETE - Delete
│   ├── /:id/images    # POST - Upload images
│   └── /search        # GET - Search products
├── categories/
│   ├── /              # GET - List, POST - Create
│   ├── /:id           # GET - Get, PUT - Update, DELETE - Delete
│   └── /tree          # GET - Category tree
├── orders/
│   ├── /              # GET - List, POST - Create
│   ├── /:id           # GET - Get, PUT - Update
│   └── /:id/status    # PATCH - Update status
├── warehouses/
│   └── ...
└── inventory/
    └── ...
```

### 6. Search Architecture (Meilisearch)

**Why Meilisearch?**
- Изключително бърз (написан на Rust)
- Typo tolerance - работи добре с кирилица
- Instant search results
- Лесен за setup и поддръжка

**Index Structure:**
```javascript
{
  "products": {
    "id": "uuid",
    "sku": "string",
    "name": "string",           // searchable
    "description": "string",    // searchable
    "categoryId": "uuid",       // filterable
    "status": "active",         // filterable
    "price": 99.99,            // sortable, filterable
    "inventory": 10            // sortable, filterable
  }
}
```

### 7. State Management

**Frontend:**
- TanStack Query (React Query) - server state
- Zustand - client state (shopping cart, UI preferences)

**Why not Redux?**
- React Query handles 90% of state (server data)
- Zustand е по-лек и прост за останалото
- По-малко boilerplate код

## Database Schema

### Core Tables

**users** - Администратори
```sql
- id (uuid, primary key)
- email (unique)
- password (hashed with bcrypt)
- firstName, lastName
- role (admin, manager, staff)
- status (active, inactive, suspended)
- lastLoginAt
- createdAt, updatedAt
```

**products** - Продукти
```sql
- id (uuid, primary key)
- sku (unique)
- name
- description
- categoryId (foreign key)
- status (active, inactive, draft, archived)
- createdAt, updatedAt
```

**categories** - Категории
```sql
- id (uuid, primary key)
- name
- slug (unique)
- description
- parentId (self-reference for tree)
- imageUrl
- position (ordering)
- status
- createdAt, updatedAt
```

**warehouses** - Складове
```sql
- id (uuid, primary key)
- name
- code (unique)
- address, city, postalCode, country
- status
- isDefault
- createdAt, updatedAt
```

**product_inventory** - Наличности
```sql
- id (uuid, primary key)
- productId (foreign key)
- warehouseId (foreign key)
- quantity
- reservedQuantity
- updatedAt
```

**orders** - Поръчки
```sql
- id (uuid, primary key)
- orderNumber (unique)
- customerId (optional)
- customerEmail, customerPhone
- status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- subtotal, shippingCost, total
- currency (EUR)
- notes
- courierTrackingUrl
- createdAt, updatedAt
```

**order_items** - Артикули в поръчка
```sql
- id (uuid, primary key)
- orderId (foreign key)
- productId (foreign key)
- productName, productSku (snapshot)
- quantity
- unitPrice, total
- createdAt
```

**shipping_addresses** - Адреси за доставка
```sql
- id (uuid, primary key)
- orderId (foreign key, one-to-one)
- fullName, phone
- address, city, postalCode, country
- createdAt
```

**product_images** - Снимки на продукти
```sql
- id (uuid, primary key)
- productId (foreign key)
- url (full size)
- thumbnailUrl
- position (ordering)
- altText
- createdAt
```

**product_prices** - Цени (history-enabled)
```sql
- id (uuid, primary key)
- productId (foreign key)
- price
- compareAtPrice (discount)
- currency
- validFrom, validTo
- createdAt
```

## Security

### Authentication & Authorization
- JWT tokens (HS256 algorithm)
- HttpOnly cookies (production)
- Role-based access control (RBAC)
- Password hashing с bcrypt (cost factor: 10)

### API Security
- Helmet.js middleware (security headers)
- CORS configuration
- Rate limiting (за production)
- Input validation с Zod
- SQL injection protection (Drizzle ORM параметризирани queries)

### Infrastructure Security
- Cloudflare WAF + DDoS protection
- Firewall rules (само 80/443 публични)
- Database не е exposed публично
- Environment variables за secrets
- Regular security updates

## Performance Optimization

### Backend
- Database connection pooling (max 10)
- Redis caching за често ползвани данни
- Efficient SQL queries (Drizzle ORM)
- Image optimization (Sharp → WebP)

### Frontend
- Code splitting (Vite)
- Lazy loading
- Image optimization (responsive images)
- Service Worker (optional PWA)

### Infrastructure
- Nginx static file serving
- Nginx caching
- Gzip/Brotli compression
- CDN за images (опционално Cloudflare)

## Deployment Strategy

### Development
```
Local Windows Machine:
- Docker: PostgreSQL, Redis, Meilisearch
- pnpm dev → All services in watch mode
- Hot reload за всички пакети
```

### Production
```
Ubuntu Server (srv.dshome.dev):
- Native: PostgreSQL, Redis, Meilisearch
- Docker: Frontend, Admin, Backend containers
- Nginx: Reverse proxy + static files
- PM2: Process management (backup)
- HestiaCP: Server administration
```

### CI/CD Pipeline
```
1. Git push → GitHub
2. GitHub Actions:
   - Run tests
   - Build Docker images
   - Push to GitHub Container Registry
3. SSH to production:
   - Pull images
   - Run DB migrations
   - Rolling restart containers
   - Health check
   - Rollback on failure
```

## Локализация

### Език: Български
- UI текстове на български
- Email темплейти на български
- Форматиране на дати: DD.MM.YYYY
- Форматиране на числа: 1 234,56

### Валута: EUR (€)
- Всички цени в евро
- Форматиране: 99,99 €
- Database precision: DECIMAL(10,2)

### Куриери
- Speedy - tracking integration
- Econt - tracking integration
- DHL - tracking integration

## Scalability

### Horizontal Scaling
- Stateless backend → множество инстанции
- Load balancer (Nginx)
- Redis за споделена сесия

### Vertical Scaling
- Database optimization
- Connection pooling
- Query optimization
- Indexes

### Future Considerations
- PostgreSQL replication (master-slave)
- Redis cluster
- CDN за static assets
- Microservices (optional)

## Monitoring & Logging

### Logging
- Winston structured logging
- Log levels: debug, info, warn, error
- Log rotation (daily, max 30 days)
- Centralized logs (optional: ELK stack)

### Monitoring
- Health check endpoints
- PM2 monitoring
- Database connection monitoring
- Error tracking (optional: Sentry)

### Metrics
- Response times
- Error rates
- Database query performance
- API usage statistics

## Backup Strategy

### Database Backups
1. **HestiaCP Automated Backups** - daily full backup
2. **Custom pg_dump** - hourly incremental
3. **Off-site Storage** - weekly sync to external storage
4. **Retention**: 30 days online, 1 year archive

### Code Backups
- GitHub repository (primary)
- Server backups include code

### Images Backups
- Part of server filesystem backup
- Weekly sync to external storage

## Maintenance

### Regular Tasks
- Security updates (weekly)
- Database vacuum (weekly)
- Log rotation (daily)
- Backup verification (weekly)
- Performance monitoring (daily)

### Updates Strategy
- Minor updates: automatic
- Major updates: manual with testing
- Database migrations: versioned with Drizzle
- Zero-downtime deployment with rolling restart

---

**Дата на създаване:** 2025-11-07
**Последна актуализация:** 2025-11-07
**Версия:** 1.0.0
