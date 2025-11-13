# Setup на нов компютър - Бърз старт

**Предварителни изисквания:** Git, Node.js v20, pnpm, Docker Desktop (с WSL2) - вече инсталирани

**Време:** ~10-15 минути

---

## Стъпка 1: Git Pull

```bash
# Отиди в папката на проекта (примерно D:\100Docker\dshome-docker)
cd D:\100Docker\dshome-docker

# Pull latest changes
git pull

# Провери branch
git status
```

**Забележка:** Папката може да е където искаш - D:\100Docker, E:\Projects, F:\DOCKER и т.н.

## Стъпка 2: Environment файлове

Копирай `.env` файла от стария компютър в root папката на проекта, или създай нов:

```bash
# Ако нямаш готов .env файл
notepad .env
```

Минимални настройки за development:
```env
DATABASE_URL=postgresql://dev:dev@postgres:5432/dshome_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev
POSTGRES_DB=dshome_dev
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=dev_master_key
API_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
JWT_SECRET=dev_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
DEFAULT_CURRENCY=EUR
```

## Стъпка 3: Docker Desktop настройка

1. Стартирай **Docker Desktop**
2. Изчакай да се стартира напълно (whale иконката да спре да мига)

*Опционално - ако C: диска е малък:*
- Settings → Resources → Advanced
- Промени "Disk image location" на `E:\Docker\wsl`
- Apply & Restart

## Стъпка 4: Стартирай containers

```bash
# От root папката на проекта
docker compose -f docker/docker-compose.dev.yml up -d --build

# Провери статуса
docker ps
```

Очакваш 5 контейнера running: backend, admin, postgres, redis, meilisearch

## Стъпка 5: Database migrations

```bash
# Влез в backend папката
cd packages/backend

# Създай/актуализирай таблиците
npx drizzle-kit push:pg
```

## Стъпка 6: Провери че работи

**Backend API:**
```
http://localhost:4000/api/health
```

**Admin Panel:**
```
http://localhost:3001/admin
```

**Готово! ✅**

---

## Ежедневна работа

**Стартиране:**
```bash
# От root папката на проекта
docker compose -f docker/docker-compose.dev.yml up -d
```

**Спиране:**
```bash
docker compose -f docker/docker-compose.dev.yml down
```

**След промени в кода:**
```bash
docker restart dshome-backend-dev
docker restart dshome-admin-dev
```

---

## Работа между 2 компютъра

**На компютър А (работиш и качваш):**
```bash
# След като си готов с промените
git add .
git commit -m "Описание на промените"
git push
```

**На компютър Б (свалям промените):**
```bash
# Свали последните промени от GitHub
git pull

# Ако има Docker промени - rebuild
docker compose -f docker/docker-compose.dev.yml up -d --build

# Ако има database промени - migrate
cd packages/backend
npx drizzle-kit push:pg
```

**Важно:** Винаги прави `git pull` ПРЕДИ да започнеш да работиш, за да имаш последните промени!

---

## Бързи команди

```bash
# Logs
docker logs dshome-backend-dev --tail 50 -f
docker logs dshome-admin-dev --tail 50 -f

# PostgreSQL
docker exec -it dshome-postgres-dev psql -U dev -d dshome_dev

# Restart service
docker restart dshome-backend-dev

# Cleanup disk space
docker system prune -a
```

---

**Последна актуализация:** 2025-11-13
