# Стартиране на проекта след синхронизация (След 2025-11-10)

## ВАЖНО: Първо синхронизирай от работния компютър!

**НА РАБОТНИЯ КОМПЮТЪР (къщи) направи ПЪРВО това:**

```bash
# 1. Влез в проекта
cd dshome-docker

# 2. Провери какво има uncommitted
git status

# 3. Провери дали има непубликувани migrations
ls packages/backend/src/db/migrations/ | sort

# 4. АКО schema файловете са променени БЕЗ migrations:
pnpm --filter @dshome/backend db:generate
# Отговори на въпросите които задава - обикновено е безопасно да отговориш "да"

# 5. Commit ВСИЧКО
git add -A
git commit -m "Sync all schema changes, migrations and seed files"

# 6. Push към GitHub
git push
```

---

## СЛЕД ТОВА - на новия компютър

### Предусловия

Уверете се че имаш инсталирани:
- ✅ Node.js 20 LTS
- ✅ pnpm (`npm install -g pnpm`)
- ✅ Docker Desktop (стартиран)
- ✅ Git

---

## Стъпка 1: Изтрий старото (ако има)

```bash
# Спри Docker (ако работи)
cd E:\001-DS-DOCKER\dshome-docker
pnpm docker:dev:down

# Изтрий Docker volumes
docker volume rm docker_postgres_data docker_redis_data docker_meilisearch_data

# Изтрий папката (ИЛИ през File Explorer с Shift+Delete)
cd E:\001-DS-DOCKER
rm -rf dshome-docker
```

**Алтернатива:** Използвай File Explorer и изтрий `E:\001-DS-DOCKER\dshome-docker` ръчно.

---

## Стъпка 2: Clone от GitHub

```bash
cd E:\001-DS-DOCKER
git clone https://github.com/dshomebg/dshome-docker.git
cd dshome-docker
```

---

## Стъпка 3: Копирай .env файл

```bash
# Копирай example
cp .env.example .env
```

**Или** ако имаш backup на `.env` от друг компютър, копирай него.

---

## Стъпка 4: Инсталирай dependencies

```bash
pnpm install
```

Това отнема ~1-2 минути.

---

## Стъпка 5: Стартирай Docker услуги

```bash
pnpm docker:dev:up
```

Изчакай 10-15 секунди докато PostgreSQL стане "healthy".

Провери статуса:
```bash
docker ps
```

Трябва да видиш 3 контейнера:
- `dshome-postgres-dev` - (healthy)
- `dshome-redis-dev` - (healthy)
- `dshome-meilisearch-dev` - (може да е unhealthy в началото, това е нормално)

---

## Стъпка 6: Run migrations

```bash
pnpm --filter @dshome/backend db:migrate:dev
```

**Очакван резултат:**
```
✅ Migrations completed successfully
```

**Ако видиш грешка:** Спри тук и провери дали си sync-нал от работния компютър!

---

## Стъпка 7: Seed данни

```bash
pnpm --filter @dshome/backend db:seed
```

**Очакван резултат:**
```
🌱 Seeding database...
✅ Admin user created
✅ Default warehouse created
✅ Sample categories created
🎉 Seeding completed successfully!

Default credentials:
  Email: admin@dshome.dev
  Password: admin123
```

**Ако видиш грешка с "column does not exist":** Schema и migrations не са синхронизирани! Върни се на работния компютър и sync-ни отново.

---

## Стъпка 8: Стартирай development серверите

**Вариант А: Едновременно (препоръчано)**
```bash
pnpm dev
```

Това стартира Backend (4000) и Admin (3001) заедно.

**Вариант Б: Поотделно (в 2 терминала)**

Терминал 1 - Backend:
```bash
pnpm --filter @dshome/backend dev
```

Терминал 2 - Admin:
```bash
pnpm --filter @dshome/admin dev
```

---

## Стъпка 9: Провери че работи

**Backend API:**
```
http://localhost:4000/api/health
```

Трябва да видиш:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

**Admin Panel:**
```
http://localhost:3001
```

Login:
- Email: `admin@dshome.dev`
- Password: `admin123`

---

## Готово! 🎉

Сега можеш да работиш на проекта от новия компютър.

---

## Важни команди за ежедневна работа

### Стартиране
```bash
pnpm docker:dev:up   # Стартирай Docker
pnpm dev             # Стартирай backend + admin
```

### Спиране
```bash
Ctrl+C               # Спри dev серверите
pnpm docker:dev:down # Спри Docker
```

### Database операции
```bash
pnpm db:studio       # Отвори Drizzle Studio (DB GUI)
pnpm db:migrate:dev  # Прилагане на migrations
pnpm db:seed         # Seed данни
```

### Git синхронизация

**В края на деня:**
```bash
git add .
git commit -m "Описание на промените"
git push
```

**В началото на деня:**
```bash
git pull
pnpm install  # Ако има нови dependencies
```

---

## Troubleshooting

### "Port 4000 or 3001 already in use"

Намери и спри процеса:
```bash
netstat -ano | findstr :4000
cmd //c taskkill //PID <PID> //F
```

### "Cannot connect to database"

Провери Docker:
```bash
docker ps
pnpm docker:dev:down
pnpm docker:dev:up
```

### "Migration failed"

Синхронизирай отново от работния компютър:
```bash
# На работния компютър:
git add packages/backend/src/db/
git commit -m "Sync migrations"
git push

# На новия компютър:
git pull
```

### "Seeding failed: duplicate key"

Изтрий данните и seed отново:
```bash
docker exec dshome-postgres-dev psql -U dev -d dshome_dev -c "TRUNCATE users, warehouses, categories CASCADE;"
pnpm --filter @dshome/backend db:seed
```

---

**Последна актуализация:** 2025-11-10
**Статус:** Инструкции след откриване на schema/migration несъответствие
