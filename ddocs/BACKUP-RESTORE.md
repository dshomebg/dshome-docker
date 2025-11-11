# DSHome Backup & Restore Guide

## Overview

This guide covers backing up and restoring critical DSHome data. Two types of data require backups:

1. **PostgreSQL Database** - All application data (products, orders, customers, settings)
2. **User Uploads** - Product images and other uploaded files

## Quick Reference

```bash
# Backup database
./scripts/backup-db.sh

# Restore database
./scripts/restore-db.sh backup_20251111_175848.sql

# Backup uploads (manual)
ssh root@157.90.129.12
tar -czf uploads-backup.tar.gz \
  /var/lib/docker/volumes/dshome-uploads-data/_data
```

## Database Backup

### Automated Backup Script

The `backup-db.sh` script creates a PostgreSQL dump from the Docker container:

```bash
# From local machine (Windows)
cd F:\DOCKER\dshome-docker
./scripts/backup-db.sh
```

**What it does:**
1. Connects to production server via SSH
2. Runs `pg_dump` inside Docker container
3. Saves backup file on server: `/opt/dshome/backup_YYYYMMDD_HHMMSS.sql`
4. Optionally downloads backup to local machine

**Output:**
```
====================================
DSHome Database Backup
====================================

Backup file: backup_20251111_175848.sql

[1/2] Creating backup on server...
Backup created: backup_20251111_175848.sql (112K)

Download backup to local machine? (y/n)
```

### Manual Database Backup

If you need to run backup directly on the server:

```bash
# SSH to server
ssh root@157.90.129.12
cd /opt/dshome

# Create backup
docker exec dshome-postgres-prod pg_dump -U admin_dsdock admin_dsdock > backup.sql

# Check backup size
ls -lh backup.sql

# Compress backup
gzip backup.sql
```

### Backup File Contents

The backup file is a plain SQL dump containing:
- All table definitions (CREATE TABLE)
- All data (INSERT/COPY statements)
- Indexes and constraints
- Sequences and default values

**Example backup structure:**
```sql
CREATE TABLE products (...);
CREATE TABLE categories (...);
-- ... more tables

COPY products FROM stdin;
-- Product data rows
\.

-- Indexes and constraints
CREATE INDEX idx_products_sku ...
ALTER TABLE products ADD CONSTRAINT ...
```

### Backup Schedule

**Recommended schedule:**

```bash
# Add to server crontab
ssh root@157.90.129.12
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /opt/dshome && docker exec dshome-postgres-prod pg_dump -U admin_dsdock admin_dsdock > backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql

# Weekly cleanup (keep last 14 days)
0 3 * * 0 find /opt/dshome/backup_*.sql -mtime +14 -delete
```

## Database Restore

### Automated Restore Script

The `restore-db.sh` script restores a backup with safety measures:

```bash
# From local machine
./scripts/restore-db.sh backup_20251111_175848.sql
```

**What it does:**
1. Asks for confirmation (⚠️ overwrites current database!)
2. Uploads backup file to server (if local)
3. Creates safety backup of current database
4. Restores from backup file
5. Verifies restoration

**Output:**
```
====================================
DSHome Database Restore
====================================

⚠️  WARNING: This will REPLACE the current database!
Backup file: backup_20251111_175848.sql

Are you sure you want to continue? (yes/no) yes

[1/3] Using backup file on server...
[2/3] Creating safety backup of current database...
Safety backup created: backup_before_restore_20251111_180234.sql
[3/3] Restoring database from backup_20251111_175848.sql...

====================================
Database restored successfully!
====================================
```

### Manual Database Restore

```bash
# SSH to server
ssh root@157.90.129.12
cd /opt/dshome

# Optional: Create safety backup first
docker exec dshome-postgres-prod pg_dump -U admin_dsdock admin_dsdock > safety_backup.sql

# Restore from backup
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock < backup.sql

# Verify restoration
docker exec dshome-postgres-prod psql -U admin_dsdock -d admin_dsdock -c "\dt"
```

### Point-in-Time Restore

If you need to restore to a specific point in time:

```bash
# List available backups
ssh root@157.90.129.12
ls -lh /opt/dshome/backup_*.sql

# Example output:
# backup_20251110_020000.sql  (Yesterday 2 AM)
# backup_20251111_020000.sql  (Today 2 AM)
# backup_20251111_175848.sql  (Today 5:58 PM)

# Restore specific backup
./scripts/restore-db.sh backup_20251110_020000.sql
```

## User Uploads Backup

User uploads are stored in a Docker volume and need separate backup.

### Manual Uploads Backup

```bash
# SSH to server
ssh root@157.90.129.12

# Create uploads backup
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  -C /var/lib/docker/volumes/dshome-uploads-data/_data .

# Download to local machine
exit
scp root@157.90.129.12:/root/uploads_backup_*.tar.gz ./backups/
```

### Uploads Restore

```bash
# SSH to server
ssh root@157.90.129.12

# Stop backend (using uploads)
docker stop dshome-backend-prod

# Restore uploads
tar -xzf uploads_backup_20251111_180000.tar.gz \
  -C /var/lib/docker/volumes/dshome-uploads-data/_data

# Start backend
docker start dshome-backend-prod
```

### Automated Uploads Backup Script

Create `scripts/backup-uploads.sh`:

```bash
#!/bin/bash
set -e

REMOTE_USER="root"
REMOTE_HOST="157.90.129.12"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="uploads_backup_${TIMESTAMP}.tar.gz"

echo "Creating uploads backup..."
ssh "$REMOTE_USER@$REMOTE_HOST" \
  "tar -czf /root/$BACKUP_FILE \
   -C /var/lib/docker/volumes/dshome-uploads-data/_data ."

echo "Downloading backup..."
mkdir -p ./backups
scp "$REMOTE_USER@$REMOTE_HOST:/root/$BACKUP_FILE" ./backups/

echo "Backup completed: ./backups/$BACKUP_FILE"
```

## Full System Backup

For complete disaster recovery, backup both database and uploads:

### Full Backup Script

Create `scripts/backup-full.sh`:

```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/full_${TIMESTAMP}"

echo "===================================="
echo "Full System Backup"
echo "===================================="

mkdir -p "$BACKUP_DIR"

# 1. Database backup
echo "[1/3] Backing up database..."
./scripts/backup-db.sh
# Move latest backup to full backup dir
ssh root@157.90.129.12 "ls -t /opt/dshome/backup_*.sql | head -1" | \
  xargs -I {} scp root@157.90.129.12:{} "$BACKUP_DIR/database.sql"

# 2. Uploads backup
echo "[2/3] Backing up uploads..."
ssh root@157.90.129.12 \
  "tar -czf /root/uploads_temp.tar.gz \
   -C /var/lib/docker/volumes/dshome-uploads-data/_data ."
scp root@157.90.129.12:/root/uploads_temp.tar.gz "$BACKUP_DIR/uploads.tar.gz"
ssh root@157.90.129.12 "rm /root/uploads_temp.tar.gz"

# 3. Configuration backup
echo "[3/3] Backing up configuration..."
ssh root@157.90.129.12 "cat /opt/dshome/.env" > "$BACKUP_DIR/.env.backup"
cp docker-compose.prod.yml "$BACKUP_DIR/"

echo ""
echo "===================================="
echo "Full backup completed!"
echo "===================================="
echo "Location: $BACKUP_DIR"
echo "Contents:"
ls -lh "$BACKUP_DIR"
```

### Full Restore Procedure

```bash
# 1. Restore database
./scripts/restore-db.sh ./backups/full_20251111_180000/database.sql

# 2. Stop backend
ssh root@157.90.129.12 "docker stop dshome-backend-prod"

# 3. Restore uploads
scp ./backups/full_20251111_180000/uploads.tar.gz root@157.90.129.12:/tmp/
ssh root@157.90.129.12 << 'ENDSSH'
  rm -rf /var/lib/docker/volumes/dshome-uploads-data/_data/*
  tar -xzf /tmp/uploads.tar.gz \
    -C /var/lib/docker/volumes/dshome-uploads-data/_data
  rm /tmp/uploads.tar.gz
ENDSSH

# 4. Restart backend
ssh root@157.90.129.12 "docker start dshome-backend-prod"

# 5. Verify
curl https://www.dshome.dev/api/health
```

## Backup Storage

### Local Storage

Store backups on local development machine:

```
F:\DOCKER\dshome-docker\backups\
├── backup_20251110_020000.sql
├── backup_20251111_020000.sql
├── backup_20251111_175848.sql
└── uploads_backup_20251111_180000.tar.gz
```

### Remote Storage (Recommended)

For production, store backups off-site:

**Option 1: Cloud Storage (AWS S3, Google Cloud Storage)**

```bash
# Install AWS CLI
apt install awscli

# Configure credentials
aws configure

# Upload backup
aws s3 cp backup.sql s3://dshome-backups/$(date +%Y%m%d)/
```

**Option 2: Remote Backup Server**

```bash
# rsync to backup server
rsync -avz --progress \
  /opt/dshome/backup_*.sql \
  backup-server:/backups/dshome/
```

**Option 3: Hestia Backup (Built-in)**

Hestia CP has built-in backup functionality:
1. Log into Hestia CP
2. Go to "Backups"
3. Configure automatic backups
4. Ensure `/opt/dshome` is included

## Backup Retention Policy

Recommended retention:
- **Daily backups**: Keep last 7 days
- **Weekly backups**: Keep last 4 weeks
- **Monthly backups**: Keep last 12 months

### Cleanup Script

```bash
#!/bin/bash
# cleanup-old-backups.sh

BACKUP_DIR="/opt/dshome"

# Delete backups older than 7 days
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

# Keep weekly backups (Sundays)
# Keep monthly backups (1st of month)
# Implementation depends on backup naming convention
```

## Disaster Recovery Plan

### Scenario 1: Database Corruption

```bash
# 1. Check latest backup
ssh root@157.90.129.12 "ls -lht /opt/dshome/backup_*.sql | head -5"

# 2. Restore from latest backup
./scripts/restore-db.sh backup_YYYYMMDD_HHMMSS.sql

# 3. Verify
curl https://www.dshome.dev/api/health
```

### Scenario 2: Server Failure

```bash
# 1. Provision new server
# 2. Install Docker and Docker Compose
# 3. Clone repository
# 4. Copy .env file
# 5. Deploy application
./scripts/deploy-docker.sh

# 6. Restore data
./scripts/restore-db.sh ./backups/latest_backup.sql
# Restore uploads (see above)

# 7. Update DNS to point to new server
```

### Scenario 3: Accidental Data Deletion

```bash
# 1. Identify when data was deleted
# 2. Find backup before deletion
ssh root@157.90.129.12 "ls -lht /opt/dshome/backup_*.sql"

# 3. Restore backup
./scripts/restore-db.sh backup_BEFORE_DELETION.sql

# 4. Verify data is restored
```

## Testing Backups

**IMPORTANT:** Regularly test your backups to ensure they work!

### Test Restore (Safe Method)

```bash
# 1. Create test database
ssh root@157.90.129.12
docker exec dshome-postgres-prod psql -U admin_dsdock -c \
  "CREATE DATABASE test_restore;"

# 2. Restore backup to test database
docker exec -i dshome-postgres-prod psql -U admin_dsdock -d test_restore \
  < /opt/dshome/backup_latest.sql

# 3. Verify data
docker exec dshome-postgres-prod psql -U admin_dsdock -d test_restore -c \
  "SELECT COUNT(*) FROM products;"

# 4. Drop test database
docker exec dshome-postgres-prod psql -U admin_dsdock -c \
  "DROP DATABASE test_restore;"
```

### Monthly Backup Test

Schedule monthly backup verification:

```bash
# First Monday of each month
0 9 1-7 * 1 /opt/dshome/scripts/test-backup.sh
```

## Backup Checklist

**Before making major changes:**

- [ ] Create database backup
- [ ] Create uploads backup
- [ ] Save .env file
- [ ] Document current state
- [ ] Test backup restoration (optional but recommended)

**After deployment:**

- [ ] Verify application works
- [ ] Create post-deployment backup
- [ ] Update backup documentation

**Monthly:**

- [ ] Review backup retention
- [ ] Test backup restoration
- [ ] Verify backup storage space
- [ ] Check backup script logs
- [ ] Update disaster recovery plan

## Troubleshooting

### Backup Script Fails

**Error: "Permission denied"**
```bash
# Fix permissions on server
ssh root@157.90.129.12
chmod 755 /opt/dshome
```

**Error: "docker exec: command not found"**
```bash
# Container not running
docker ps | grep dshome-postgres-prod
docker start dshome-postgres-prod
```

### Restore Fails

**Error: "database admin_dsdock does not exist"**
```bash
# Create database first
docker exec dshome-postgres-prod createdb -U admin_dsdock admin_dsdock
```

**Error: "duplicate key violates unique constraint"**
```bash
# Database not empty, need to drop first
docker exec dshome-postgres-prod psql -U admin_dsdock -c \
  "DROP DATABASE admin_dsdock; CREATE DATABASE admin_dsdock;"
```

### Backup Files Too Large

**Compress old backups:**
```bash
gzip /opt/dshome/backup_*.sql
```

**Split large backups:**
```bash
# Split into 100MB chunks
split -b 100M backup.sql backup.sql.part_

# Recombine
cat backup.sql.part_* > backup.sql
```

## Additional Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Docker Volume Backup Best Practices](https://docs.docker.com/storage/volumes/#back-up-restore-or-migrate-data-volumes)
- [Disaster Recovery Planning](https://en.wikipedia.org/wiki/Disaster_recovery)
