# DSHome E-Commerce Platform

Модерен онлайн магазин за физически стоки с фокус върху българския пазар.

## Технологичен Stack

### Frontend (Customer Store)
- React 19 + TypeScript
- Vite
- Tailwind CSS

### Admin Panel
- Next.js 14 + TypeScript
- TailAdmin Template
- Tailwind CSS

### Backend
- Node.js 20.x
- Express.js + TypeScript
- Drizzle ORM
- JWT Authentication

### Infrastructure
- PostgreSQL 18.0
- Redis 7.0
- Meilisearch 1.24
- Docker + Docker Compose
- Nginx

## Изисквания

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker Desktop
- Git

## Първоначална настройка

### 1. Клониране на репозиторито

```bash
git clone https://github.com/dshomebg/dshome-docker.git
cd dshome-docker
```

### 2. Инсталиране на зависимости

```bash
pnpm install
```

### 3. Създаване на .env файл

```bash
copy .env.example .env
```

### 4. Стартиране на Docker услуги

```bash
pnpm docker:dev:up
```

Това ще стартира:
- PostgreSQL на порт 5432
- Redis на порт 6379
- Meilisearch на порт 7700

### 5. Database миграции

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Стартиране на development сървъри

```bash
pnpm dev
```

Ще стартират:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Admin Panel: http://localhost:3001

## Структура на проекта

```
dshome-docker/
├── packages/
│   ├── backend/          # Express API
│   ├── frontend/         # React магазин
│   ├── admin/            # Next.js админ панел
│   └── shared/           # Споделени типове и утилити
├── docker/               # Docker конфигурации
├── scripts/              # Build и deployment скриптове
├── docs/                 # Документация
└── dev-assets/           # Локални тестови ресурси
```

## Полезни команди

```bash
# Development
pnpm dev                  # Стартирай всички приложения
pnpm build                # Build всички приложения
pnpm test                 # Run тестове

# Docker
pnpm docker:dev:up        # Стартирай Docker услуги
pnpm docker:dev:down      # Спри Docker услуги
pnpm docker:dev:logs      # Виж логове от Docker

# Database
pnpm db:migrate           # Run миграции
pnpm db:studio            # Отвори Drizzle Studio
pnpm db:seed              # Seed данни

# Code Quality
pnpm lint                 # Lint всички пакети
pnpm clean                # Изчисти всички build файлове
```

## Production Deployment

За deployment инструкции вижте [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## Лиценз

Proprietary - © 2025 DSHome
