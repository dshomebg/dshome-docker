#!/bin/bash

# DSHome Database Backup Script
# Backs up the PostgreSQL database from Docker container

set -e

REMOTE_USER="root"
REMOTE_HOST="157.90.129.12"
REMOTE_DIR="/opt/dshome"
CONTAINER="dshome-postgres-prod"
DB_USER="admin_dsdock"
DB_NAME="admin_dsdock"

# Generate timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

echo "===================================="
echo "DSHome Database Backup"
echo "===================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""

# Create backup on server
echo "[1/2] Creating backup on server..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDSSH
cd $REMOTE_DIR
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE
echo "Backup created: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))"
ENDSSH

# Optional: Download backup to local machine
read -p "Download backup to local machine? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "[2/2] Downloading backup..."
    LOCAL_BACKUP_DIR="./backups"
    mkdir -p "$LOCAL_BACKUP_DIR"
    scp "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/$BACKUP_FILE" "$LOCAL_BACKUP_DIR/"
    echo "Backup downloaded to: $LOCAL_BACKUP_DIR/$BACKUP_FILE"
else
    echo ""
    echo "[2/2] Skipping download"
fi

echo ""
echo "===================================="
echo "Backup completed successfully!"
echo "===================================="
echo ""
echo "To restore this backup:"
echo "  ./scripts/restore-db.sh $BACKUP_FILE"
echo ""
