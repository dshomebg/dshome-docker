# Docker Production Deployment Guide

Този документ описва как да deploy-нете приложението с Docker, като **запазите всички данни** (база данни и upload-нати файлове).

## Какво прави Docker deployment-а безопасен?

### ✅ Данните са защитени

1. **База данни:**
   - Използва **съществуващата** PostgreSQL инсталация на сървъра
   - НЕ се създава нов Docker контейнер за базата
   - НЕ се докосват записите в базата
   - Connection през `host.docker.internal` към host PostgreSQL

2. **Upload-нати файлове:**
   - Mapped като Docker volume: `./packages/backend/uploads:/app/packages/backend/uploads`
   - Всички файлове остават на **същото място** на диска
   - НЕ се копират в контейнера
   - Ако контейнерът се изтрие, файловете остават

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                         │
│                                                              │
│  ┌────────────────┐      ┌────────────────┐                │
│  │ Docker:        │      │ Docker:        │                │
│  │ dshome-admin   │◄─────┤ dshome-backend │                │
│  │ (port 3001)    │      │ (port 3000)    │                │
│  └────────────────┘      └───────┬────────┘                │
│                                   │                          │
│                                   │ DATABASE_URL             │
│                                   │ (host.docker.internal)   │
│                                   ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │ PostgreSQL 18 (NOT in Docker)           │                │
│  │ Database: admin_dshome                  │                │
│  │ Data: /var/lib/postgresql/18/main       │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ Uploads (Volume Mount)                  │                │
│  │ Path: /opt/dshome/packages/backend/uploads              │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Файлова структура

```
dshome/
├── docker-compose.prod.yml          # Production Docker Compose
├── packages/
│   ├── backend/
│   │   ├── Dockerfile              # Backend Docker image
│   │   └── uploads/                # ← VOLUME (preserved)
│   ├── admin/
│   │   └── Dockerfile              # Admin Docker image
│   └── shared/
└── .env                            # ← MOUNTED (not copied)
```

## Deployment процес

### Метод 1: Автоматичен deployment (препоръчителен)

```bash
# От локалния компютър
./deploy-docker.sh
```

Скриптът автоматично:
1. Build-ва Docker images локално
2. Качва ги на production сървъра
3. Спира PM2 процесите
4. Стартира Docker контейнери
5. Проверява статуса

### Метод 2: Ръчен deployment

#### Стъпка 1: Build на images локално

```bash
# Build backend image
docker build -f packages/backend/Dockerfile -t dshome-backend:latest .

# Build admin image
docker build -f packages/admin/Dockerfile -t dshome-admin:latest .
```

#### Стъпка 2: Export на images

```bash
docker save dshome-backend:latest | gzip > dshome-backend.tar.gz
docker save dshome-admin:latest | gzip > dshome-admin.tar.gz
```

#### Стъпка 3: Upload на production

```bash
scp dshome-backend.tar.gz root@157.90.129.12:/opt/dshome/
scp dshome-admin.tar.gz root@157.90.129.12:/opt/dshome/
scp docker-compose.prod.yml root@157.90.129.12:/opt/dshome/
```

#### Стъпка 4: Load и стартиране на production

```bash
ssh root@157.90.129.12

cd /opt/dshome

# Load images
docker load < dshome-backend.tar.gz
docker load < dshome-admin.tar.gz

# Stop PM2 (if running)
pm2 stop all

# Start Docker containers
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

## Управление на контейнери

### Преглед на статус

```bash
docker compose -f docker-compose.prod.yml ps
```

### Преглед на логове

```bash
# Всички логове
docker compose -f docker-compose.prod.yml logs -f

# Само backend
docker compose -f docker-compose.prod.yml logs -f backend

# Само admin
docker compose -f docker-compose.prod.yml logs -f admin
```

### Restart на контейнери

```bash
# Restart на всички
docker compose -f docker-compose.prod.yml restart

# Restart само на backend
docker compose -f docker-compose.prod.yml restart backend

# Restart само на admin
docker compose -f docker-compose.prod.yml restart admin
```

### Спиране на контейнери

```bash
docker compose -f docker-compose.prod.yml down
```

**ВАЖНО:** Това НЕ изтрива данните! Базата данни и uploads остават непокътнати.

### Изтриване на контейнери и images

```bash
# Спиране и изтриване на контейнери
docker compose -f docker-compose.prod.yml down

# Изтриване на images (ако искате да спестите място)
docker rmi dshome-backend:latest dshome-admin:latest
```

## Проверка че данните са запазени

### Проверка на базата данни

```bash
ssh root@157.90.129.12

# Connect to PostgreSQL
sudo -u postgres psql -d admin_dshome

# Check tables
\dt

# Check records
SELECT COUNT(*) FROM categories;
```

### Проверка на uploads

```bash
ssh root@157.90.129.12

# List uploaded files
ls -lh /opt/dshome/packages/backend/uploads/
```

## Преминаване от PM2 към Docker

### Текущ процес (PM2)
```
git pull → pnpm build → pm2 restart
```
- Build-ът може да се провали на production
- Различни environments

### Нов процес (Docker)
```
local: docker build → test → deploy image → production: docker run
```
- Ако работи локално → гарантирано работи на production
- Идентична среда

### Миграция

1. **Първи път:** Следвайте deployment процеса по-горе
2. **PM2 остава като fallback:** Ако Docker има проблем, можете да се върнете към PM2:
   ```bash
   docker compose -f docker-compose.prod.yml down
   pm2 start ecosystem.config.js
   ```

## Rollback процедура

Ако нещо се обърка с Docker:

```bash
ssh root@157.90.129.12

cd /opt/dshome

# Stop Docker
docker compose -f docker-compose.prod.yml down

# Start PM2
pm2 start ecosystem.config.js

# Verify
pm2 status
```

Всички данни (база данни + uploads) остават непокътнати!

## Environment Variables

### Production .env файл

Docker контейнерите използват `.env` файла на production сървъра:

```bash
# /opt/dshome/.env
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/admin_dshome
NEXT_PUBLIC_API_URL=https://api.dshome.dev
NODE_ENV=production
```

**ВАЖНО:** `host.docker.internal` позволява на Docker контейнера да достъпи PostgreSQL на хост машината.

## Troubleshooting

### Контейнерът не може да се свърже с базата данни

Проверете дали `DATABASE_URL` използва `host.docker.internal`:
```
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/admin_dshome
```

### Uploads не се записват

Проверете дали volume mount-ът е правилен:
```bash
docker inspect dshome-backend-prod | grep -A 10 Mounts
```

Трябва да видите:
```json
"Mounts": [
  {
    "Source": "/opt/dshome/packages/backend/uploads",
    "Destination": "/app/packages/backend/uploads"
  }
]
```

### Out of disk space

Docker images заемат място. Почистете старите:
```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes (ВНИМАНИЕ!)
docker volume prune  # Не използвайте ако имате важни volumes!
```

## Предимства на Docker deployment

### ✅ Гарантирана консистентност
- Работи локално = работи на production
- Няма "works on my machine" проблеми

### ✅ Изолация
- Всяко приложение в собствен контейнер
- Няма конфликти между dependencies

### ✅ Лесен rollback
- Просто стартирайте предишния image
- Секундно връщане към стара версия

### ✅ Scaling
- Лесно добавяне на повече инстанции
- Load balancing с nginx

### ✅ Безопасност на данните
- Database е external (не се докосва)
- Uploads са volume mounted (не се копират)
- Pълен контрол над персистентността

## FAQ

**Q: Ще се изтрият ли данните в базата данни?**
A: НЕ. Docker използва съществуващата PostgreSQL инсталация на хоста. Базата данни НЕ е в контейнер.

**Q: Ще се загубят ли качените изображения?**
A: НЕ. Uploads директорията е volume mount. Файловете остават на същото място на диска.

**Q: Мога ли да се върна към PM2?**
A: ДА. Просто спрете Docker контейнерите и стартирайте PM2. Данните са непокътнати.

**Q: Колко място заемат Docker images?**
A: Backend ~200MB, Admin ~300MB. Общо ~500MB.

**Q: Как да обновя приложението?**
A: Build нов image локално и deploy-нете го. Или просто пуснете `./deploy-docker.sh`.

**Q: Работи ли с Nginx?**
A: ДА. Nginx reverse proxy работи както преди, просто proxy-ва към Docker контейнерите на портове 3000 и 3001.
