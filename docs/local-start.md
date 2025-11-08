# Стартиране на локална версия

Как да стартираш development средата локално на компютъра.

## Бързо стартиране

### Стъпка 1: Стартирай Docker услугите

```bash
pnpm docker:dev:up
```

Това стартира PostgreSQL, Redis и Meilisearch.

### Стъпка 2: Стартирай development серверите

```bash
pnpm dev
```

Това стартира и backend (порт 4000) и admin (порт 3001) едновременно.

### Достъп до приложенията

- **Backend API:** http://localhost:4000/api/health
- **Admin Panel:** http://localhost:3001/admin/

**Login credentials:**
- Email: admin@dshome.dev
- Password: admin123

---

## Алтернативно: Стартиране поотделно

Ако искаш да стартираш services поотделно в отделни терминали:

**Терминал 1 - Backend:**
```bash
pnpm --filter @dshome/backend dev
```

**Терминал 2 - Admin:**
```bash
pnpm --filter @dshome/admin dev
```

---

## Проблем: "EADDRINUSE - address already in use"

Ако виждаш грешка че портове 4000 или 3001 са заети:

```
Error: listen EADDRINUSE: address already in use :::4000
Error: listen EADDRINUSE: address already in use :::3001
```

### Решение

**Стъпка 1: Намери кой процес използва портовете**

```bash
# За порт 4000
netstat -ano | findstr :4000

# За порт 3001
netstat -ano | findstr :3001
```

Ще видиш нещо като:
```
TCP    0.0.0.0:4000    0.0.0.0:0    LISTENING    22792
```

Числото в края (22792) е PID на процеса.

**Стъпка 2: Спри процесите**

```bash
# Замени <PID> с реалния номер
cmd //c taskkill //PID <PID> //F
```

Пример:
```bash
cmd //c taskkill //PID 22792 //F
cmd //c taskkill //PID 19772 //F
```

**Стъпка 3: Стартирай отново**

```bash
pnpm dev
```

---

## Проверка на Docker контейнерите

Ако имаш проблеми с базата данни:

```bash
# Провери дали контейнерите работят
docker ps

# Рестартирай ги ако не работят
pnpm docker:dev:down
pnpm docker:dev:up
```

Очакваш да видиш 3 контейнера:
- dshome-postgres-dev (порт 5432)
- dshome-redis-dev (порт 6379)
- dshome-meilisearch-dev (порт 7700)

---

## Полезни команди

### Спиране на всички services

```bash
# Спри Node.js процесите
Ctrl+C във терминала където работи pnpm dev

# Спри Docker контейнерите
pnpm docker:dev:down
```

### Пълен restart

```bash
# 1. Спри всичко
pnpm docker:dev:down

# 2. Стартирай Docker
pnpm docker:dev:up

# 3. Стартирай apps
pnpm dev
```

### Database операции

```bash
# Отвори Drizzle Studio (Database GUI)
pnpm db:studio

# Прилагане на migrations
pnpm db:migrate

# Seed данни
pnpm db:seed
```

---

## Troubleshooting

### "Cannot connect to database"

Провери дали PostgreSQL контейнерът работи:
```bash
docker ps | grep postgres
```

Ако не работи:
```bash
pnpm docker:dev:up
```

### "Module not found"

Инсталирай dependencies:
```bash
pnpm install
```

### TypeScript грешки

Build shared package първо:
```bash
pnpm --filter @dshome/shared build
```

### Портовете са заети от друго приложение

Ако имаш друго приложение, което използва портове 4000 или 3001, можеш да:

1. Спреш другото приложение
2. Или промениш портовете в `.env` файла:
   ```env
   # Backend
   PORT=4500

   # Admin (в next.config.ts)
   # Промени порта на 3500
   ```

---

## Бързи клавиши

- **Ctrl+C** - Спри running процеси в терминала
- **Ctrl+Shift+`** - Отвори нов терминал в VS Code
- **F5** - Refresh на браузъра

---

**Дата:** 2025-11-08
