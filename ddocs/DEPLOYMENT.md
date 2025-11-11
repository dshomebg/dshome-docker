# DSHome Production Deployment Guide

## Overview

DSHome uses a **full Docker deployment architecture** where ALL services run in Docker containers:
- PostgreSQL 18 (database)
- Redis 7 (cache)
- Meilisearch 1.11 (search engine)
- Backend API (Node.js/Express)
- Admin Panel (Next.js 15)

The production server ONLY has:
- nginx (reverse proxy on host)
- git (for pulling code)
- docker & docker-compose (container runtime)

## Architecture

```
Internet → nginx (host:443) → Docker containers
                            ├─ backend:3000
                            ├─ admin:3001
                            ├─ postgres:5432 (internal)
                            ├─ redis:6379 (internal)
                            └─ meilisearch:7700 (internal)
```

### Docker Network
All containers communicate via the internal Docker network `dshome-network`:
- Backend connects to `postgres:5432` (NOT localhost)
- Backend connects to `redis:6379` (NOT localhost)
- Backend connects to `meilisearch:7700` (NOT localhost)

### Data Persistence
Named Docker volumes ensure data survives container restarts:
- `dshome-postgres-data` - Database tables and records
- `dshome-redis-data` - Cache data
- `dshome-meilisearch-data` - Search indexes
- `dshome-uploads-data` - User uploaded images

## Deployment Methods

### Option A: Automated Deployment (Recommended)

Use the deployment script:

```bash
# From your local machine (Windows)
cd F:\DOCKER\dshome-docker
./scripts/deploy-docker.sh
```

This script will:
1. Build Docker images locally
2. Save images to tar.gz files
3. Upload images to production server
4. Load images on server
5. Deploy with docker-compose
6. Clean up temporary files

### Option B: Manual Deployment

If you need more control:

```bash
# 1. Build images locally
docker compose -f docker-compose.prod.yml build --no-cache

# 2. Save and upload
docker save dshome-backend-prod:latest | gzip > backend-image.tar.gz
docker save dshome-admin-prod:latest | gzip > admin-image.tar.gz
scp *.tar.gz root@157.90.129.12:/opt/dshome/

# 3. Load on server
ssh root@157.90.129.12
cd /opt/dshome
docker load < backend-image.tar.gz
docker load < admin-image.tar.gz
rm *.tar.gz

# 4. Deploy
docker compose -f docker-compose.prod.yml up -d --no-build
```

## Initial Setup (One-Time)

### 1. Server Preparation

```bash
# SSH to server
ssh root@157.90.129.12

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Create project directory
mkdir -p /opt/dshome
```

### 2. Environment Configuration

```bash
# Copy environment template
cd /opt/dshome
cp .env.production.example .env

# Edit .env with real values
nano .env
```

Required variables:
```env
# Database (Docker network hostnames)
DATABASE_URL=postgresql://admin_dsdock:YOUR_PASSWORD@postgres:5432/admin_dsdock
POSTGRES_USER=admin_dsdock
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
POSTGRES_DB=admin_dsdock

# Redis (Docker network hostname)
REDIS_URL=redis://redis:6379

# Meilisearch (Docker network hostname)
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=YOUR_MASTER_KEY

# API Configuration
API_PORT=3000
API_URL=https://www.dshome.dev

# Admin Panel
NEXT_PUBLIC_API_URL=https://www.dshome.dev/admin/api

# JWT Security
JWT_SECRET=YOUR_RANDOM_STRING_MIN_32_CHARS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Application
NODE_ENV=production
LOG_LEVEL=info

# Currency & Locale
DEFAULT_CURRENCY=EUR
DEFAULT_LOCALE=bg
```

### 3. nginx Configuration

Edit `/home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom`:

```nginx
# Backend API
location /admin/api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location /api/ {
    proxy_pass http://localhost:3000/api/;
    # ... same headers as above
}

# Admin Panel
location /admin {
    proxy_pass http://localhost:3001;
    # ... same headers as above
}

# User Uploads
location /uploads/ {
    proxy_pass http://localhost:3000/uploads/;
    proxy_cache_valid 200 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

Reload nginx:
```bash
systemctl reload nginx
```

### 4. First Deployment

```bash
# From local machine
./scripts/deploy-docker.sh
```

## Updating the Application

### Quick Update (Code Changes Only)

```bash
# From local machine
./scripts/deploy-docker.sh
```

This rebuilds images and redeploys containers.

### Database Migrations

If schema changes are needed:

```bash
# 1. Deploy new code
./scripts/deploy-docker.sh

# 2. Run migrations on server
ssh root@157.90.129.12
cd /opt/dshome
docker exec dshome-backend-prod sh -c 'cd /app/packages/backend && npx drizzle-kit push:pg'
```

**Note:** If drizzle-kit is not in production image, run migrations manually:
```bash
# Connect to database
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock

# Run SQL commands
ALTER TABLE your_table ADD COLUMN new_column TYPE;
```

## Verification

After deployment, verify all services:

```bash
# Check container status
ssh root@157.90.129.12 "docker ps"

# All containers should show "healthy" or "Up"

# Test backend API
curl https://www.dshome.dev/api/health

# Expected: {"success":true,"data":{"status":"healthy","database":"connected"}}

# Test admin panel
curl -I https://www.dshome.dev/admin

# Expected: HTTP/1.1 200 OK
```

## Monitoring

### View Logs

```bash
# All services
./scripts/logs.sh all

# Specific service
./scripts/logs.sh backend
./scripts/logs.sh admin
./scripts/logs.sh postgres

# Follow logs in real-time
./scripts/logs.sh backend -f
```

### Check Service Health

```bash
ssh root@157.90.129.12

# Container status
docker ps

# Resource usage
docker stats

# Service-specific health
docker exec dshome-backend-prod wget --spider http://localhost:3000/api/health
docker exec dshome-postgres-prod pg_isready -U admin_dsdock
docker exec dshome-redis-prod redis-cli ping
```

## Rollback

If a deployment fails:

```bash
ssh root@157.90.129.12
cd /opt/dshome

# Stop current containers
docker compose -f docker-compose.prod.yml down

# List available images
docker images | grep dshome

# Re-tag previous working image
docker tag dshome-backend-prod:old dshome-backend-prod:latest
docker tag dshome-admin-prod:old dshome-admin-prod:latest

# Restart with previous images
docker compose -f docker-compose.prod.yml up -d
```

## Common Tasks

### Restart All Services

```bash
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml restart
```

### Restart Single Service

```bash
ssh root@157.90.129.12
docker restart dshome-backend-prod
# or
docker restart dshome-admin-prod
```

### Update Environment Variables

```bash
ssh root@157.90.129.12
cd /opt/dshome

# Edit .env
nano .env

# Restart affected services
docker compose -f docker-compose.prod.yml up -d --force-recreate backend admin
```

### Clean Up Old Images

```bash
ssh root@157.90.129.12

# Remove dangling images
docker image prune

# Remove specific old images
docker images | grep dshome
docker rmi <image_id>
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` to git. Use `.env.production.example` as template.

2. **Database Password**: Use strong random passwords for PostgreSQL.

3. **JWT Secret**: Generate with: `openssl rand -base64 32`

4. **Meilisearch Key**: Generate with: `openssl rand -hex 16`

5. **SSH Access**: Use SSH keys instead of passwords for server access.

6. **Firewall**: Only expose ports 80 (HTTP), 443 (HTTPS), and 22 (SSH) to the internet.

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.
