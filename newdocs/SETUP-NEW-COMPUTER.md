# Setup на нов компютър - Стъпка по стъпка

**Цел:** Настройка на пълна development среда на нов компютър (home/work/нов laptop)

**Време:** ~30-45 минути (в зависимост от интернет скоростта)

---

## ✅ Предварителни изисквания

### 1. Инсталирай базовия софтуер:

| Софтуер | Версия | Download Link | Забележки |
|---------|--------|---------------|-----------|
| **Git** | Latest | https://git-scm.com/download/win | За клониране на repo |
| **Node.js** | 20.x LTS | https://nodejs.org/ | За pnpm и build tools |
| **pnpm** | 8.x | `corepack enable` след Node.js | Package manager |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop/ | **ЗАДЪЛЖИТЕЛНО WSL2 backend** |

### 2. Провери инсталациите:

```bash
# Git
git --version
# Трябва: git version 2.x

# Node.js
node --version
# Трябва: v20.x.x

# pnpm
corepack enable
pnpm --version
# Трябва: 8.x.x

# Docker
docker --version
# Трябва: Docker version 24.x+

docker compose version
# Трябва: Docker Compose version v2.x
```

---

## 📦 Стъпка 1: Клониране на проекта

### Опция A: Първи път (Clone)

```bash
# Навигирай където искаш да е проекта (примерно E:)
cd E:\

# Клонирай repo
git clone https://github.com/dshomebg/dshome-docker.git

# Влез в директорията
cd dshome-docker
```

### Опция B: Вече имаш проекта (Pull latest)

```bash
cd E:\001-DS-DOCKER\dshome-docker

# Pull latest changes
git pull

# Провери branch
git status
# Трябва да е на 'main'
```

---

## 🐳 Стъпка 2: Docker Desktop конфигурация

### 2.1. Премести Docker данните (ПРЕПОРЪЧИТЕЛНО)

**Защо?** C: диска бързо се пълни. По-добре е Docker данните да са на E: или друг диск с повече място.

**Как:**

1. Отвори Docker Desktop
2. Settings (зъбче икона) → Resources → Advanced
3. Виж "Disk image location"
4. Промени на `E:\Docker\wsl` (или друга папка с място)
5. Apply & Restart

**Алтернативно (ръчно):**

```bash
# Спри Docker Desktop (Quit от system tray)

# Спри WSL
wsl --shutdown

# Export Docker data
wsl --export docker-desktop "E:\Docker\wsl-data\docker-desktop.tar"

# Unregister старата локация
wsl --unregister docker-desktop

# Import на новото място
wsl --import docker-desktop "E:\Docker\wsl-data\docker-desktop" "E:\Docker\wsl-data\docker-desktop.tar" --version 2

# Delete tar file
del "E:\Docker\wsl-data\docker-desktop.tar"

# Стартирай Docker Desktop отново
```

### 2.2. Docker Desktop Settings

**Resources → Advanced:**
- CPUs: 4-8 (в зависимост от hardware-а)
- Memory: 8-16 GB (препоръчвам 12 GB за development)
- Swap: 2 GB

**Docker Engine (JSON config):**
```json
{
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB"
    }
  }
}
```

---

## 📝 Стъпка 3: Environment файлове

### 3.1. Създай .env файл

```bash
cd E:\001-DS-DOCKER\dshome-docker

# Copy example към .env
copy .env.example .env

# (или ако .env.example не съществува)
notepad .env
```

### 3.2. Попълни .env с правилните стойности

```env
# Database Configuration
DATABASE_URL=postgresql://dev:dev@postgres:5432/dshome_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev
POSTGRES_DB=dshome_dev

# Redis Configuration
REDIS_URL=redis://redis:6379

# Meilisearch Configuration
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=dev_master_key_change_in_production

# Backend API Configuration
API_PORT=4000
API_URL=http://localhost:4000

# Admin Panel Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# JWT Configuration
JWT_SECRET=your_jwt_secret_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Application
NODE_ENV=development
LOG_LEVEL=debug

# Currency & Locale
DEFAULT_CURRENCY=EUR
DEFAULT_LOCALE=bg
```

**⚠️ ВАЖНО:** За production използвай различни passwords и secrets!

---

## 🚀 Стъпка 4: Първоначален старт

### 4.1. Инсталирай dependencies (извън Docker за IDE support)

```bash
cd E:\001-DS-DOCKER\dshome-docker

# Install всички dependencies
pnpm install
```

**Забележка:** Това е **опционално** но препоръчително за IDE autocomplete и TypeScript support.

### 4.2. Стартирай Docker development environment

```bash
# Стартирай всички services
docker compose -f docker/docker-compose.dev.yml up -d --build
```

**Какво прави тази команда:**
- Създава Docker images за backend и admin (първия път отнема 5-10 мин)
- Стартира всички services (PostgreSQL, Redis, Meilisearch, Backend, Admin)
- `-d` = detached mode (работи на background)
- `--build` = rebuild images ако има промени

### 4.3. Провери че всичко работи

```bash
# Провери статуса на всички контейнери
docker ps

# Трябва да видиш 5 контейнера:
# - dshome-backend-dev (healthy)
# - dshome-admin-dev (може да е unhealthy първия път - нормално е)
# - dshome-postgres-dev (healthy)
# - dshome-redis-dev (healthy)
# - dshome-meilisearch-dev (running)
```

---

## 🗄️ Стъпка 5: Database Setup

### 5.1. Push schema към database

```bash
cd E:\001-DS-DOCKER\dshome-docker\packages\backend

# Push database schema (създава таблиците)
npx drizzle-kit push:pg
```

**Очакван резултат:** "[✓] Changes applied"

### 5.2. Провери таблиците

```bash
# Влез в PostgreSQL контейнера
docker exec -it dshome-postgres-dev psql -U dev -d dshome_dev

# Виж таблиците
\dt

# Трябва да видиш ~33 таблици (products, categories, brands, users, etc.)

# Излез
\q
```

### 5.3. (Опционално) Seed данни

Ако искаш test данни:

```bash
cd E:\001-DS-DOCKER\dshome-docker

pnpm db:seed
```

---

## ✅ Стъпка 6: Тестване

### 6.1. Тествай Backend API

Отвори browser:
```
http://localhost:4000/api/health
```

**Очакван резултат:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-11T10:00:00.000Z",
    "uptime": 123.45,
    "database": "connected",
    "dockerMode": "Docker-First Development",
    "hotReload": "WORKING! 🚀"
  }
}
```

### 6.2. Тествай Admin Panel

Отвори browser:
```
http://localhost:3001/admin
```

**Очакван резултат:** Admin login страница или 404 (ако няма root page) - и двете са OK, означава че Next.js работи.

### 6.3. Провери logs (ако нещо не работи)

```bash
# Backend logs
docker logs dshome-backend-dev --tail 50

# Admin logs
docker logs dshome-admin-dev --tail 50

# Postgres logs
docker logs dshome-postgres-dev --tail 50
```

---

## 🔄 Ежедневен Workflow

### Стартиране на development:

```bash
cd E:\001-DS-DOCKER\dshome-docker

# Стартирай всички services
docker compose -f docker/docker-compose.dev.yml up -d
```

### Спиране на development:

```bash
# Спри всички services (запазва volumes/данни)
docker compose -f docker/docker-compose.dev.yml down
```

### След code changes:

```bash
# Backend hot reload (ръчен restart заради Windows file watching issues)
docker restart dshome-backend-dev

# Admin hot reload
docker restart dshome-admin-dev
```

### Pull latest changes от GitHub:

```bash
cd E:\001-DS-DOCKER\dshome-docker

# Pull промени
git pull

# Rebuild Docker images (ако има промени в Dockerfile или dependencies)
docker compose -f docker/docker-compose.dev.yml up -d --build

# Check за нови database migrations
cd packages/backend
npx drizzle-kit push:pg
```

---

## 🔧 Troubleshooting

### Проблем: Backend/Admin не отговарят от browser

**Симптоми:** ERR_EMPTY_RESPONSE или connection refused

**Решение:**
```bash
# Опция 1: Рестартирай WSL networking
wsl --shutdown
# След това стартирай Docker Desktop отново

# Опция 2: Използвай 127.0.0.1 вместо localhost
http://127.0.0.1:4000/api/health
http://127.0.0.1:3001/admin
```

### Проблем: Docker контейнери постоянно restarting

**Проверка:**
```bash
docker ps
# Виж в колоната STATUS дали имаш "Restarting" или високо ↺ count

docker logs dshome-backend-dev --tail 50
# Виж грешките в logs
```

**Чести причини:**
- Port conflict (друго приложение използва 4000/3001)
- Database connection failed (проверка .env файла)
- Out of memory (увеличи Docker memory в Settings)

### Проблем: Database connection failed

**Проверка:**
```bash
# Тествай PostgreSQL connection
docker exec dshome-postgres-dev psql -U dev -d dshome_dev -c "SELECT 1"

# Провери че postgres контейнера е healthy
docker ps | grep postgres
```

**Решение:**
```bash
# Restart postgres
docker restart dshome-postgres-dev

# Изчакай 10 секунди
# Restart backend
docker restart dshome-backend-dev
```

### Проблем: "No space left on device"

**Решение:**
```bash
# Cleanup Docker (images, containers, volumes)
docker system prune -a --volumes

# ВНИМАНИЕ: Това изтрива ВСИЧКИ неизползвани Docker данни!
# Ако искаш да запазиш volumes (database data), премахни --volumes flag
```

---

## 📚 Полезни команди

### Docker Management:

```bash
# Виж всички контейнери
docker ps -a

# Виж Docker disk usage
docker system df

# Виж logs на service
docker logs <container-name> --tail 50 -f

# Restart service
docker restart <container-name>

# Влез в контейнер (за debugging)
docker exec -it <container-name> sh

# Rebuild specific service
docker compose -f docker/docker-compose.dev.yml build backend
docker compose -f docker/docker-compose.dev.yml up -d backend
```

### Database Management:

```bash
# Влез в PostgreSQL
docker exec -it dshome-postgres-dev psql -U dev -d dshome_dev

# Backup database
docker exec dshome-postgres-dev pg_dump -U dev dshome_dev > backup.sql

# Restore database
docker exec -i dshome-postgres-dev psql -U dev -d dshome_dev < backup.sql

# Drizzle Studio (visual database browser)
cd packages/backend
pnpm db:studio
# Отваря http://localhost:4983
```

---

## 🎯 Checklist - Готов ли си?

Преди да започнеш да работиш, провери:

- [ ] Git клониран и на latest commit
- [ ] Docker Desktop работи
- [ ] Всички 5 контейнера са running
- [ ] Backend health check връща success
- [ ] Admin panel се зарежда
- [ ] Database има всички таблици
- [ ] IDE вижда TypeScript types (ако си направил local pnpm install)

**Ако всичко е ✅ - готов си да разработваш!** 🚀

---

## 📞 Помощ и Документация

- **Архитектура:** `newdocs/ARCHITECTURE.md`
- **Правила:** `newdocs/RULES.md`
- **Workflows:** `newdocs/WORKFLOWS.md`
- **Чести проблеми:** `newdocs/COMMON_ISSUES.md`
- **Този файл:** `newdocs/SETUP-NEW-COMPUTER.md`

---

**Последна актуализация:** 2025-11-11
**Версия:** 1.0.0 (Docker-First)
