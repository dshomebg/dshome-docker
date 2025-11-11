# DSHome Docker Architecture

## Overview

DSHome uses a **Docker-first architecture** where all application components and infrastructure services run in containers. This provides consistency between development and production environments, simplifies deployment, and ensures data persistence.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Host Machine                          │
│                                                          │
│  ┌────────────┐                                         │
│  │   nginx    │ (:443)  ← Only service on host         │
│  │  (host)    │                                         │
│  └─────┬──────┘                                         │
│        │                                                 │
│  ┌─────▼──────────────────────────────────────────────┐ │
│  │           Docker Network (dshome-network)          │ │
│  │                                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │ │
│  │  │ Backend  │  │  Admin   │  │  PostgreSQL  │    │ │
│  │  │   API    │  │  Panel   │  │      18      │    │ │
│  │  │  :3000   │  │  :3001   │  │    :5432     │    │ │
│  │  └────┬─────┘  └──────────┘  └──────┬───────┘    │ │
│  │       │                              │             │ │
│  │       └──────────┬──────────┬────────┘            │ │
│  │                  │          │                     │ │
│  │         ┌────────▼──┐  ┌───▼────────┐            │ │
│  │         │   Redis   │  │Meilisearch │            │ │
│  │         │     7     │  │    1.11    │            │ │
│  │         │  :6379    │  │   :7700    │            │ │
│  │         └───────────┘  └────────────┘            │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Named Volumes (Data)                  │ │
│  │  • dshome-postgres-data    (Database tables)      │ │
│  │  • dshome-redis-data       (Cache)                │ │
│  │  • dshome-meilisearch-data (Search indexes)       │ │
│  │  • dshome-uploads-data     (User uploads)         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Components

### 1. Backend API Container (`dshome-backend-prod`)

**Technology:** Node.js 20 + Express.js + TypeScript

**Port:** 3000 (exposed to host)

**Purpose:** REST API backend for e-commerce operations

**Key Features:**
- Product management (CRUD)
- Category management
- Order processing
- Customer management
- Image uploads
- Search integration (Meilisearch)

**Dependencies:**
- PostgreSQL (database connection)
- Redis (caching and sessions)
- Meilisearch (full-text search)

**Health Check:**
```bash
wget --spider http://localhost:3000/api/health
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@postgres:5432/dbname
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
```

### 2. Admin Panel Container (`dshome-admin-prod`)

**Technology:** Next.js 15 + React + TypeScript + Tailwind CSS

**Port:** 3001 (exposed to host)

**Purpose:** Administration interface for managing the e-commerce platform

**Key Features:**
- Dashboard with statistics
- Product management UI
- Category management UI
- Catalog settings
- General settings (baseUrl, image upload limits)
- Order management

**Dependencies:**
- Backend API (via nginx proxy at `/admin/api/`)

**Health Check:**
```bash
wget --spider http://localhost:3001
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://www.dshome.dev/admin/api
```

### 3. PostgreSQL Container (`dshome-postgres-prod`)

**Technology:** PostgreSQL 18 Alpine

**Port:** 5432 (internal only, not exposed to host)

**Purpose:** Primary relational database

**Data Location:** Volume `dshome-postgres-data` → `/var/lib/postgresql/data`

**Schema Management:** Drizzle ORM

**Tables:**
- `products`, `categories`, `brands`, `suppliers`
- `orders`, `order_items`, `customers`
- `attributes`, `features`, `specifications`
- `product_images`, `product_attributes`
- `general_settings`, `catalog_settings`
- `users`, `user_sessions`

**Health Check:**
```bash
pg_isready -U admin_dsdock
```

**Access:**
```bash
# From host
docker exec -it dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock

# Backup
docker exec dshome-postgres-prod pg_dump -U admin_dsdock admin_dsdock > backup.sql

# Restore
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock < backup.sql
```

### 4. Redis Container (`dshome-redis-prod`)

**Technology:** Redis 7 Alpine

**Port:** 6379 (internal only)

**Purpose:** Caching layer and session storage

**Data Location:** Volume `dshome-redis-data` → `/data`

**Persistence:** AOF (Append-Only File) enabled

**Use Cases:**
- API response caching
- Session storage
- Rate limiting
- Temporary data storage

**Health Check:**
```bash
redis-cli ping
# Expected: PONG
```

**Access:**
```bash
# CLI access
docker exec -it dshome-redis-prod redis-cli

# Check keys
docker exec dshome-redis-prod redis-cli KEYS '*'

# Get key value
docker exec dshome-redis-prod redis-cli GET "some:key"
```

### 5. Meilisearch Container (`dshome-meilisearch-prod`)

**Technology:** Meilisearch 1.11

**Port:** 7700 (internal only)

**Purpose:** Fast full-text search engine

**Data Location:** Volume `dshome-meilisearch-data` → `/meili_data`

**Indexes:**
- `products` - Product search (name, description, SKU)
- `categories` - Category search
- `brands` - Brand search

**Features:**
- Typo tolerance
- Synonyms
- Filtering
- Faceted search
- Instant search

**Health Check:**
```bash
curl -f http://localhost:7700/health
```

**Access:**
```bash
# Check indexes
curl -H "Authorization: Bearer $MEILISEARCH_MASTER_KEY" \
  http://localhost:7700/indexes

# Search products
curl -H "Authorization: Bearer $MEILISEARCH_MASTER_KEY" \
  -X POST http://localhost:7700/indexes/products/search \
  -d '{"q": "диван"}'
```

## Docker Networking

### Internal Communication

Containers communicate using Docker's internal DNS:

```javascript
// Backend connects to PostgreSQL
const db = postgres('postgresql://user:pass@postgres:5432/dbname')
//                                            ^^^^^^^^
//                          Docker network hostname (NOT localhost!)

// Backend connects to Redis
const redis = new Redis('redis://redis:6379')
//                               ^^^^^

// Backend connects to Meilisearch
const meili = new MeiliSearch({
  host: 'http://meilisearch:7700'
  //           ^^^^^^^^^^^^
})
```

**Key Point:** Use service names (`postgres`, `redis`, `meilisearch`) as hostnames, NOT `localhost` or `127.0.0.1`!

### External Access

Only backend and admin containers expose ports to the host:
- Backend: `3000:3000`
- Admin: `3001:3001`

nginx on the host proxies HTTPS traffic to these ports:
```
https://www.dshome.dev/api/*        → http://localhost:3000/api/*
https://www.dshome.dev/admin/api/*  → http://localhost:3000/api/*
https://www.dshome.dev/admin        → http://localhost:3001
https://www.dshome.dev/uploads/*    → http://localhost:3000/uploads/*
```

## Data Persistence

### Named Volumes

Docker named volumes ensure data survives container restarts, updates, and even container deletion.

#### Volume Locations

```bash
# List volumes
docker volume ls | grep dshome

# Inspect volume
docker volume inspect dshome-postgres-data

# Volume data is stored at:
# /var/lib/docker/volumes/dshome-postgres-data/_data
```

#### Critical Volumes

**1. PostgreSQL Data (`dshome-postgres-data`)**
- Contains: All database tables, indexes, and data
- Size: ~100MB+ (grows with data)
- Backup: Use `pg_dump` regularly
- **⚠️ CRITICAL:** Loss means losing ALL application data!

**2. User Uploads (`dshome-uploads-data`)**
- Contains: All uploaded product images
- Size: Variable (depends on upload activity)
- Backup: Copy volume data or use rsync
- **⚠️ CRITICAL:** Loss means losing all product images!

**3. Meilisearch Data (`dshome-meilisearch-data`)**
- Contains: Search indexes
- Size: ~50MB+ (grows with indexed documents)
- Backup: Optional (can be rebuilt from database)
- **✓ RECOVERABLE:** Can re-index from PostgreSQL

**4. Redis Data (`dshome-redis-data`)**
- Contains: Cached data and sessions
- Size: ~10-100MB
- Backup: Optional (ephemeral data)
- **✓ RECOVERABLE:** Cache can be regenerated

#### Backup Strategy

**Automatic backups (recommended):**
```bash
# Setup cron job on server
0 2 * * * /opt/dshome/scripts/backup-db.sh >> /var/log/dshome-backup.log 2>&1
```

**Manual backup:**
```bash
./scripts/backup-db.sh
```

**Volume backup (for uploads):**
```bash
ssh root@157.90.129.12
tar -czf uploads-backup.tar.gz \
  /var/lib/docker/volumes/dshome-uploads-data/_data
```

## Health Checks

All containers have health checks to ensure they're ready before dependent services start:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U admin_dsdock"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

### Dependency Chain

```
postgres (healthy) ──┐
redis (healthy) ─────┤
meilisearch (healthy)┘
        │
        ▼
  backend (healthy)
        │
        ▼
      admin
```

Backend waits for all infrastructure services to be healthy before starting. Admin waits for backend to be healthy.

## Container Restart Policies

All containers use `restart: unless-stopped`:
- Automatically restart after crashes
- Restart after server reboot
- Don't restart if manually stopped

```bash
# Manual stop (won't auto-restart)
docker stop dshome-backend-prod

# Manual start
docker start dshome-backend-prod

# Server reboot (all containers auto-start)
reboot
```

## Resource Limits

Currently no resource limits are set. Consider adding for production:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## Logs

All container logs are managed by Docker:

```bash
# View logs
docker logs dshome-backend-prod

# Follow logs
docker logs -f dshome-backend-prod

# Last 100 lines
docker logs --tail 100 dshome-backend-prod

# With timestamps
docker logs -t dshome-backend-prod
```

**Log rotation** is handled automatically by Docker's logging driver.

## Development vs Production

### Development (`docker-compose.dev.yml`)

- Hot reload enabled (bind mounts for code)
- Source maps enabled
- Verbose logging
- Development mode environment variables
- Port exposed: backend (3000), admin (3001), postgres (5432)

### Production (`docker-compose.prod.yml`)

- Optimized builds (multi-stage Dockerfiles)
- No bind mounts (code baked into image)
- Production optimizations enabled
- Minimal logging
- Only backend and admin ports exposed to host
- Infrastructure ports (postgres, redis, meilisearch) internal only

## Security Considerations

1. **No Root User**: Containers should run as non-root user (TODO: implement)

2. **Internal Network**: Database, Redis, and Meilisearch are not exposed to host

3. **Environment Variables**: Secrets stored in `.env` file (not committed to git)

4. **Image Scanning**: Consider scanning images for vulnerabilities:
   ```bash
   docker scan dshome-backend-prod:latest
   ```

5. **Read-Only Filesystem**: Consider making containers read-only where possible

6. **Docker Socket**: Don't mount Docker socket into containers

## Monitoring & Observability

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats dshome-backend-prod
```

### Container Inspection

```bash
# Full container details
docker inspect dshome-backend-prod

# Network details
docker network inspect dshome-network

# Volume details
docker volume inspect dshome-postgres-data
```

### Health Status

```bash
# All containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# With health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"
```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common Docker-related issues and solutions.
