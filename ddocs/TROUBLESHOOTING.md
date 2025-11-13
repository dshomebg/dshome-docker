# DSHome Troubleshooting Guide

## Quick Diagnostics

When something goes wrong, start with these commands:

```bash
# Check all container status
ssh root@157.90.129.12 "docker ps -a"

# Check container health
ssh root@157.90.129.12 "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Backend health endpoint
curl https://www.dshome.dev/api/health

# View recent logs
./scripts/logs.sh backend -n 50
./scripts/logs.sh admin -n 50
```

## Container Issues

### Container Won't Start

**Symptom:** Container status shows "Exited" or "Restarting"

**Diagnosis:**
```bash
# Check why container exited
docker ps -a | grep dshome
docker logs dshome-backend-prod --tail 100
```

**Common causes:**

**1. Port already in use**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Find process using the port
ss -tulpn | grep :3000

# Kill the process
kill -9 <PID>

# Or stop PM2 if still running
pm2 stop all && pm2 delete all
```

**2. Environment variable missing**
```
Error: DATABASE_URL is required
```

**Solution:**
```bash
# Check .env file exists
ssh root@157.90.129.12 "cat /opt/dshome/.env"

# Recreate container with .env
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

**3. Dependency service not healthy**
```
dependency failed to start: container dshome-postgres-prod is unhealthy
```

**Solution:**
```bash
# Check postgres logs
./scripts/logs.sh postgres -n 100

# Try restarting postgres
ssh root@157.90.129.12 "docker restart dshome-postgres-prod"

# Wait for health check
ssh root@157.90.129.12 "docker ps | grep dshome-postgres-prod"
```

### Container Keeps Restarting

**Symptom:** Container status shows "Restarting" or exits immediately after start

**Diagnosis:**
```bash
# Watch logs in real-time
./scripts/logs.sh backend -f
```

**Common causes:**

**1. Application crash on startup**
```
Error: Cannot find module '@/lib/db'
```

**Solution:** Rebuild images with fresh dependencies
```bash
./scripts/deploy-docker.sh
```

**2. Database connection failed**
```
Error: connect ECONNREFUSED postgres:5432
```

**Solution:** Check postgres is running and healthy
```bash
ssh root@157.90.129.12
docker ps | grep postgres
docker exec dshome-postgres-prod pg_isready -U admin_dsdock
```

**3. Health check failing**
```
Health check failed: wget: command not found
```

**Solution:** Update healthcheck command in docker-compose.prod.yml

### Container Unhealthy

**Symptom:** Container shows "(unhealthy)" status

**Diagnosis:**
```bash
# Check health check logs
docker inspect dshome-backend-prod | grep -A 20 Health

# Test health endpoint manually
ssh root@157.90.129.12 "curl http://localhost:3000/api/health"
```

**Solution:** Check application logs for errors:
```bash
./scripts/logs.sh backend -n 100
```

## Database Issues

### Cannot Connect to Database

**Symptom:**
```
Error: getaddrinfo ENOTFOUND postgres
Error: connect ECONNREFUSED postgres:5432
```

**Diagnosis:**
```bash
# Check postgres is running
ssh root@157.90.129.12 "docker ps | grep postgres"

# Check postgres health
ssh root@157.90.129.12 \
  "docker exec dshome-postgres-prod pg_isready -U admin_dsdock"
```

**Solutions:**

**1. Postgres container not running**
```bash
ssh root@157.90.129.12
docker start dshome-postgres-prod
```

**2. Wrong hostname in DATABASE_URL**

Check that .env uses Docker network hostname:
```env
# WRONG (from old setup):
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# CORRECT (Docker network):
DATABASE_URL=postgresql://user:pass@postgres:5432/db
```

**3. Backend not on same Docker network**
```bash
# Check network
ssh root@157.90.129.12 \
  "docker network inspect dshome-network"

# Recreate backend with network
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

### Database Migrations Failed

**Symptom:**
```
Error: column "max_image_upload_size_mb" does not exist
```

**Diagnosis:**
```bash
# Check current schema
ssh root@157.90.129.12
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock -c "\d general_settings"
```

**Solution:** Run migrations manually
```bash
ssh root@157.90.129.12
cd /opt/dshome

# If drizzle-kit available in container:
docker exec dshome-backend-prod sh -c \
  'cd /app/packages/backend && npx drizzle-kit push:pg'

# Otherwise, run SQL manually:
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock << 'EOF'
ALTER TABLE general_settings
ADD COLUMN max_image_upload_size_mb integer NOT NULL DEFAULT 5;
EOF
```

### Database Disk Full

**Symptom:**
```
ERROR: could not write to file "base/...": No space left on device
```

**Diagnosis:**
```bash
ssh root@157.90.129.12

# Check disk usage
df -h

# Check Docker volumes
docker system df -v
```

**Solution:**
```bash
# Clean up old Docker images
docker image prune -a

# Clean up old volumes
docker volume prune

# If still full, move volumes to larger disk
# (Complex process - contact system admin)
```

## Admin Panel Issues

### Admin Panel Shows 404

**Symptom:** https://www.dshome.dev/admin shows "404 Not Found"

**Diagnosis:**
```bash
# Check admin container
ssh root@157.90.129.12 "docker ps | grep admin"

# Test admin locally
ssh root@157.90.129.12 "curl -I http://localhost:3001"

# Check nginx proxy
ssh root@157.90.129.12 \
  "cat /home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom | grep admin"
```

**Solutions:**

**1. Admin container not running**
```bash
ssh root@157.90.129.12
docker logs dshome-admin-prod --tail 50
docker restart dshome-admin-prod
```

**2. nginx misconfiguration**
```bash
# Check nginx config
ssh root@157.90.129.12 \
  "cat /home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom"

# Should have:
location /admin {
    proxy_pass http://localhost:3001;
    ...
}

# Reload nginx
ssh root@157.90.129.12 "systemctl reload nginx"
```

### Admin Panel Can't Connect to API

**Symptom:** Admin loads but shows errors like "Network Error" or "Failed to fetch"

**Diagnosis:**
```bash
# Check browser console (F12)
# Look for failed requests to /admin/api/

# Test API endpoint
curl https://www.dshome.dev/admin/api/health
```

**Solutions:**

**1. Wrong API URL in environment**

Check admin .env:
```env
# Should be:
NEXT_PUBLIC_API_URL=https://www.dshome.dev/admin/api
```

**2. nginx not proxying /admin/api/**

Edit `/home/admin/conf/web/dshome.dev/nginx.ssl.conf_custom`:
```nginx
# MUST come BEFORE /admin location
location /admin/api/ {
    proxy_pass http://localhost:3000/api/;
    # ... proxy headers
}
```

**3. CORS issues**

Check backend CORS configuration allows frontend domain.

## Deployment Issues

### Shell Script Not Found in Container

**Symptom:**
```
/app/packages/backend/docker-start.sh: not found
```

**Cause:** Windows CRLF line endings (`\r\n`) instead of Unix LF (`\n`). Linux interprets shebang as `#!/bin/sh\r`.

**Solution:**
```bash
# Convert line endings
sed -i 's/\r$//' packages/backend/docker-start.sh

# Verify with od
od -c packages/backend/docker-start.sh | head -1
# Should show: #   !   /   b   i   n   /   s   h  \n

# Rebuild and redeploy
./scripts/deploy-docker.sh
```

**Prevention:** Configure Git to handle line endings:
```bash
# .gitattributes
*.sh text eol=lf
```

### Migrations Not Running in Production

**Symptom:** Tables don't exist or schema is outdated after deployment.

**Cause 1:** `drizzle-kit` not installed (removed by `--prod` flag).

**Solution:** Ensure Dockerfile installs all dependencies:
```dockerfile
# Install all dependencies (including drizzle-kit for migrations)
RUN pnpm install --frozen-lockfile
```

**Cause 2:** `docker-compose.prod.yml` overrides startup script with `command:`.

**Solution:** Remove `command:` from backend service in docker-compose.prod.yml to use Dockerfile's CMD.

**Cause 3:** Wrong drizzle-kit command syntax.

**Solution:** Use correct syntax in docker-start.sh:
```bash
echo "y" | npx drizzle-kit push:pg
```

### TypeScript Compilation Errors with Drizzle Types

**Symptom:**
```
error TS2769: No overload matches this call.
Object literal may only specify known properties...
```

**Cause:** Incorrect types for Drizzle schema columns:
- `decimal` columns require string values, not numbers
- Enum columns require valid enum values from schema

**Solution:** Match types to schema definition:
```typescript
// ❌ Wrong
vatPercentage: 20,
defaultSorting: 'newest'

// ✅ Correct
vatPercentage: '20.00',  // decimal → string
defaultSorting: 'created_desc'  // valid enum value
```

### Catalog Settings 404 Error

**Symptom:** Admin panel shows 404 when accessing catalog settings on fresh database.

**Cause:** No default settings created in empty database.

**Solution:** Auto-create settings if they don't exist:
```typescript
export const getCatalogSettings = async (req, res, next) => {
  let [settings] = await db.select().from(catalogSettings).limit(1);

  if (!settings) {
    [settings] = await db.insert(catalogSettings)
      .values({ /* default values */ })
      .returning();
  }

  res.json({ data: settings });
};
```

### Build Failed Locally

**Symptom:**
```
ERROR: failed to solve: process "/bin/sh -c pnpm build" did not complete successfully
```

**Diagnosis:**
```bash
# Try building manually
docker compose -f docker-compose.prod.yml build backend --progress=plain
```

**Common causes:**

**1. TypeScript errors**

Fix TypeScript errors in code before building.

**2. Missing dependencies**

```bash
# Update lockfile
pnpm install
git add pnpm-lock.yaml
git commit -m "Update dependencies"
```

**3. Out of memory during build**

Increase Docker memory limit:
- Docker Desktop → Settings → Resources → Memory (increase to 8GB+)

### Image Upload Failed

**Symptom:**
```
Error: ENOENT: no such file or directory, open '/app/packages/backend/uploads/...'
```

**Diagnosis:**
```bash
# Check uploads volume mounted
ssh root@157.90.129.12
docker inspect dshome-backend-prod | grep -A 10 Mounts

# Check volume exists
docker volume ls | grep uploads
```

**Solution:**
```bash
# Volume missing, recreate backend with volume
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

### Server Can't Load Images

**Symptom:** Server runs out of memory when loading images

**Solution:** Increase swap space on server
```bash
ssh root@157.90.129.12

# Create swap file (8GB)
dd if=/dev/zero of=/swapfile bs=1M count=8192
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Network Issues

### Can't Access Application from Internet

**Symptom:** https://www.dshome.dev/ times out or shows "Connection refused"

**Diagnosis:**
```bash
# Check nginx running
ssh root@157.90.129.12 "systemctl status nginx"

# Check firewall
ssh root@157.90.129.12 "ufw status"

# Check containers listening
ssh root@157.90.129.12 "ss -tulpn | grep -E ':(3000|3001)'"
```

**Solutions:**

**1. nginx not running**
```bash
ssh root@157.90.129.12
systemctl start nginx
systemctl enable nginx
```

**2. Firewall blocking ports**
```bash
ssh root@157.90.129.12
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

**3. Container ports not exposed**

Check docker-compose.prod.yml:
```yaml
backend:
  ports:
    - "3000:3000"  # Must be present
```

### Internal Container Communication Failed

**Symptom:**
```
Error: getaddrinfo ENOTFOUND redis
Error: connect ECONNREFUSED meilisearch:7700
```

**Diagnosis:**
```bash
# Check all containers on same network
ssh root@157.90.129.12
docker network inspect dshome-network | grep Name
```

**Solution:**
```bash
# Recreate containers with network
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Performance Issues

### Application Running Slow

**Diagnosis:**
```bash
# Check resource usage
ssh root@157.90.129.12 "docker stats --no-stream"

# Check server load
ssh root@157.90.129.12 "top"

# Check disk I/O
ssh root@157.90.129.12 "iostat -x 1 5"
```

**Solutions:**

**1. High CPU usage**
- Check application logs for errors causing loops
- Consider vertical scaling (more CPU cores)

**2. High memory usage**
- Increase container memory limits
- Check for memory leaks in application

**3. Slow database queries**
```bash
# Enable query logging
ssh root@157.90.129.12
docker exec dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock -c \
  "ALTER DATABASE admin_dsdock SET log_statement = 'all';"

# Check slow queries
docker exec dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### Redis Out of Memory

**Symptom:**
```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**

Edit docker-compose.prod.yml:
```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d --force-recreate redis
```

## SSL/HTTPS Issues

### SSL Certificate Expired

**Symptom:** Browser shows "Your connection is not private" (ERR_CERT_DATE_INVALID)

**Solution:** Renew Let's Encrypt certificate
```bash
ssh root@157.90.129.12

# Using Hestia CP
v-update-letsencrypt-ssl

# Or manually
certbot renew
systemctl reload nginx
```

### Mixed Content Warnings

**Symptom:** Browser console shows "Mixed Content" errors

**Solution:** Ensure all assets use HTTPS:
```javascript
// WRONG:
const API_URL = 'http://www.dshome.dev/api';

// CORRECT:
const API_URL = 'https://www.dshome.dev/api';
```

## Search (Meilisearch) Issues

### Search Not Working

**Diagnosis:**
```bash
# Check Meilisearch running
ssh root@157.90.129.12 "docker ps | grep meilisearch"

# Test Meilisearch API
ssh root@157.90.129.12 \
  "curl -H 'Authorization: Bearer \$MEILISEARCH_MASTER_KEY' \
   http://localhost:7700/health"

# Check indexes
ssh root@157.90.129.12 \
  "curl -H 'Authorization: Bearer \$MEILISEARCH_MASTER_KEY' \
   http://localhost:7700/indexes"
```

**Solutions:**

**1. Meilisearch not running**
```bash
ssh root@157.90.129.12
docker start dshome-meilisearch-prod
```

**2. Indexes not created**
```bash
# Re-index from backend
curl -X POST https://www.dshome.dev/api/search/reindex \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**3. Wrong master key**

Check .env file has correct key and backend uses same key.

## Data Loss Prevention

### Accidental Container Deletion

**If you accidentally delete a container:**

```bash
# DON'T PANIC! Data is in volumes, not containers.

# Recreate container
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d

# Volumes automatically remount
```

### Accidental Volume Deletion

**If you accidentally delete a volume:**

```bash
# Check if volume really deleted
ssh root@157.90.129.12
docker volume ls | grep dshome

# If postgres volume deleted:
# 1. Restore from latest backup
./scripts/restore-db.sh backup_LATEST.sql

# If uploads volume deleted:
# 2. Restore uploads from backup
# (see BACKUP-RESTORE.md)
```

**Prevention:** Always backup before major operations!

## Getting Help

### Collecting Debug Information

When asking for help, provide:

```bash
# 1. Container status
ssh root@157.90.129.12 "docker ps -a" > debug-containers.txt

# 2. Recent logs
./scripts/logs.sh backend -n 200 > debug-backend.log
./scripts/logs.sh admin -n 200 > debug-admin.log

# 3. Configuration (remove sensitive data!)
ssh root@157.90.129.12 "cat /opt/dshome/.env" > debug-env.txt
# Edit debug-env.txt to remove passwords!

# 4. Docker compose file
cat docker-compose.prod.yml > debug-compose.yml

# 5. System info
ssh root@157.90.129.12 "docker info" > debug-docker-info.txt
ssh root@157.90.129.12 "docker version" > debug-docker-version.txt
```

### Common Commands Reference

```bash
# Container management
docker ps                              # List running containers
docker ps -a                          # List all containers
docker logs <container>               # View logs
docker logs -f <container>            # Follow logs
docker exec -it <container> bash      # Shell into container
docker restart <container>            # Restart container
docker stop <container>               # Stop container
docker start <container>              # Start container
docker rm <container>                 # Remove container

# Image management
docker images                         # List images
docker rmi <image>                    # Remove image
docker image prune                    # Remove unused images

# Volume management
docker volume ls                      # List volumes
docker volume inspect <volume>        # Inspect volume
docker volume rm <volume>             # Remove volume
docker volume prune                   # Remove unused volumes

# Network management
docker network ls                     # List networks
docker network inspect <network>      # Inspect network

# System management
docker system df                      # Show Docker disk usage
docker system prune                   # Clean up everything unused
docker stats                          # Real-time resource usage
```

### Emergency Recovery

If everything is broken:

```bash
# 1. Stop everything
ssh root@157.90.129.12
cd /opt/dshome
docker compose -f docker-compose.prod.yml down

# 2. Backup any remaining data
./scripts/backup-db.sh

# 3. Pull latest code
ssh root@157.90.129.12
cd /opt/dshome
git pull

# 4. Rebuild and deploy
./scripts/deploy-docker.sh

# 5. Restore data if needed
./scripts/restore-db.sh backup_LATEST.sql
```

## Preventive Maintenance

### Weekly Tasks

- [ ] Check disk space: `df -h`
- [ ] Review logs for errors: `./scripts/logs.sh all -n 100`
- [ ] Verify backups exist: `ssh root@157.90.129.12 "ls -lh /opt/dshome/backup_*.sql"`
- [ ] Check container health: `docker ps`

### Monthly Tasks

- [ ] Test backup restoration (see BACKUP-RESTORE.md)
- [ ] Update Docker images: `docker compose pull`
- [ ] Clean up old images: `docker image prune`
- [ ] Review resource usage: `docker stats`
- [ ] Check SSL certificate expiry: `certbot certificates`

### Security Updates

```bash
# Update server packages
ssh root@157.90.129.12
apt update && apt upgrade -y

# Update Docker
curl -fsSL https://get.docker.com | sh

# Restart containers with updated base images
./scripts/deploy-docker.sh
```
