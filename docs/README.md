# Документация на DSHome E-Commerce Platform

Добре дошли в документацията на DSHome E-Commerce платформата!

## Налични документи

### [ARCHITECTURE.md](./ARCHITECTURE.md)
Подробно описание на архитектурата на системата:
- Технологичен stack
- Структура на проекта
- Архитектурни решения
- Database schema
- Security measures
- Performance optimization
- Deployment strategy

### [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
Пълен план за разработка на проекта:
- Текущо състояние
- Предстоящи задачи (фазов подход)
- Времева линия
- Рискове и митигация
- Success criteria

### [SETUP.md](./SETUP.md)
Пълно ръководство за setup:
- Локална разработка (Windows)
- Production deployment (Ubuntu)
- Конфигурация на services
- Troubleshooting
- Полезни команди

## Бърз преглед

### Какво е DSHome?

DSHome е модерен e-commerce платформа за физически стоки, оптимизирана за българския пазар с:
- 50,000+ продукта capacity
- 500+ категории support
- Multi-warehouse inventory management
- Excel bulk import/export
- Real-time search (Meilisearch)
- Courier tracking integration

### Технологичен Stack (кратко)

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
**Admin:** Next.js 14 + TailAdmin Template
**Backend:** Node.js 20 + Express + Drizzle ORM
**Database:** PostgreSQL 18 + Redis 7 + Meilisearch 1.24
**Infrastructure:** Docker + Nginx + HestiaCP

### Бързо стартиране

```bash
# Clone repository
git clone https://github.com/dshomebg/dshome-docker.git
cd dshome-docker

# Install dependencies
pnpm install

# Setup environment
copy .env.example .env

# Start Docker services
pnpm docker:dev:up

# Run migrations
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

**Access:**
- Backend API: http://localhost:4000
- Frontend: http://localhost:3000 (когато се създаде)
- Admin: http://localhost:3001 (когато се създаде)
- Database Studio: `pnpm db:studio`

**Default credentials:**
- Email: admin@dshome.dev
- Password: admin123

### Monorepo структура

```
dshome-docker/
├── packages/
│   ├── shared/      ✅ TypeScript types & constants
│   ├── backend/     ✅ Express API (4000)
│   ├── frontend/    🚧 React store (3000)
│   └── admin/       🚧 Next.js panel (3001)
├── docker/          ✅ Docker Compose configs
├── docs/            ✅ Documentation
└── scripts/         🚧 Deployment scripts
```

### API Endpoints (Current)

```
GET  /api/health         → Health check
POST /api/auth/login     → Login
GET  /api/auth/me        → Current user (auth required)
```

### Database Schema (Current)

- ✅ users (authentication)
- ✅ products
- ✅ categories
- ✅ warehouses
- ✅ product_inventory
- ✅ orders
- ✅ order_items
- ✅ shipping_addresses
- ✅ product_images
- ✅ product_prices

## Следващи стъпки

За нови разработчици:

1. **Прочети SETUP.md** - за да настроиш локална среда
2. **Прочети ARCHITECTURE.md** - за да разбереш системата
3. **Прочети DEVELOPMENT_PLAN.md** - за да видиш какво предстои
4. Започни разработка!

## Допълнителни ресурси

- [GitHub Repository](https://github.com/dshomebg/dshome-docker)
- [Production Server](https://srv.dshome.dev) (admin access required)

---

**Версия:** 1.0.0
**Дата:** 2025-11-07
**Статус:** В разработка - Backend готов, Frontend предстои
