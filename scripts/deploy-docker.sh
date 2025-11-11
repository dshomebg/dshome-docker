#!/bin/bash

# DSHome Docker Deployment Script
# This script deploys the DSHome application using Docker Compose
# All services run in Docker containers (PostgreSQL, Redis, Meilisearch, Backend, Admin)

set -e  # Exit on error

# Configuration
REMOTE_USER="root"
REMOTE_HOST="157.90.129.12"
REMOTE_DIR="/opt/dshome"
COMPOSE_FILE="docker-compose.prod.yml"

echo "===================================="
echo "DSHome Docker Deployment"
echo "===================================="
echo ""

# Step 1: Build images locally
echo "[1/6] Building Docker images locally..."
docker compose -f "$COMPOSE_FILE" build --no-cache

echo ""
echo "[2/6] Saving Docker images to tar files..."
docker save dshome-backend-prod:latest | gzip > backend-image.tar.gz
docker save dshome-admin-prod:latest | gzip > admin-image.tar.gz

echo ""
echo "[3/6] Uploading images to server..."
scp backend-image.tar.gz admin-image.tar.gz "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

echo ""
echo "[4/6] Loading images on server..."
ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd /opt/dshome
docker load < backend-image.tar.gz
docker load < admin-image.tar.gz
rm backend-image.tar.gz admin-image.tar.gz
ENDSSH

echo ""
echo "[5/6] Deploying with Docker Compose..."
ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd /opt/dshome
docker compose -f docker-compose.prod.yml up -d --no-build
ENDSSH

echo ""
echo "[6/6] Cleaning up local tar files..."
rm backend-image.tar.gz admin-image.tar.gz

echo ""
echo "===================================="
echo "Deployment completed successfully!"
echo "===================================="
echo ""
echo "Next steps:"
echo "  - Check logs: ./scripts/logs.sh"
echo "  - Backend API: https://www.dshome.dev/api/health"
echo "  - Admin Panel: https://www.dshome.dev/admin"
echo ""
