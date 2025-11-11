#!/bin/bash

# DSHome Database Restore Script
# Restores the PostgreSQL database to Docker container

set -e

REMOTE_USER="root"
REMOTE_HOST="157.90.129.12"
REMOTE_DIR="/opt/dshome"
CONTAINER="dshome-postgres-prod"
DB_USER="admin_dsdock"
DB_NAME="admin_dsdock"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup-file.sql>"
    echo ""
    echo "Example:"
    echo "  $0 backup_20251111_175848.sql"
    echo ""
    echo "Available backups on server:"
    ssh "$REMOTE_USER@$REMOTE_HOST" "ls -lh $REMOTE_DIR/backup_*.sql 2>/dev/null || echo 'No backups found'"
    exit 1
fi

BACKUP_FILE=$1

echo "===================================="
echo "DSHome Database Restore"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will REPLACE the current database!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no) " -r
echo ""

if [[ ! $REPLY == "yes" ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Check if file exists locally or on server
if [ -f "$BACKUP_FILE" ]; then
    echo "[1/3] Uploading backup to server..."
    scp "$BACKUP_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"
    BACKUP_FILE=$(basename "$BACKUP_FILE")
else
    echo "[1/3] Using backup file on server..."
fi

echo ""
echo "[2/3] Creating safety backup of current database..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDSSH
cd $REMOTE_DIR
SAFETY_BACKUP="backup_before_restore_$(date +%Y%m%d_%H%M%S).sql"
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME > \$SAFETY_BACKUP
echo "Safety backup created: \$SAFETY_BACKUP"
ENDSSH

echo ""
echo "[3/3] Restoring database from $BACKUP_FILE..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDSSH
cd $REMOTE_DIR
docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE
ENDSSH

echo ""
echo "===================================="
echo "Database restored successfully!"
echo "===================================="
echo ""
echo "Next steps:"
echo "  - Verify data: https://www.dshome.dev/admin"
echo "  - Check backend: https://www.dshome.dev/api/health"
echo ""
