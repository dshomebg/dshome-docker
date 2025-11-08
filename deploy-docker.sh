#!/bin/bash

# Docker Production Deployment Script
# This script deploys the app using Docker while preserving database and uploads

set -e

echo "========================================="
echo "DSHOME Docker Production Deployment"
echo "========================================="

# Configuration
PRODUCTION_SERVER="root@157.90.129.12"
PRODUCTION_PATH="/opt/dshome"

echo ""
echo "Step 1: Building Docker images locally..."
echo "-----------------------------------------"

# Build images
docker compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "Step 2: Saving Docker images..."
echo "--------------------------------"

# Save images to tar files
docker save dshome-backend-prod:latest | gzip > dshome-backend.tar.gz
docker save dshome-admin-prod:latest | gzip > dshome-admin.tar.gz

echo ""
echo "Step 3: Uploading images to production server..."
echo "------------------------------------------------"

# Upload images
scp -o StrictHostKeyChecking=no dshome-backend.tar.gz $PRODUCTION_SERVER:$PRODUCTION_PATH/
scp -o StrictHostKeyChecking=no dshome-admin.tar.gz $PRODUCTION_SERVER:$PRODUCTION_PATH/
scp -o StrictHostKeyChecking=no docker-compose.prod.yml $PRODUCTION_SERVER:$PRODUCTION_PATH/

echo ""
echo "Step 4: Deploying on production server..."
echo "------------------------------------------"

ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER << 'EOF'
  cd /opt/dshome

  echo "Loading Docker images..."
  docker load < dshome-backend.tar.gz
  docker load < dshome-admin.tar.gz

  echo "Stopping PM2 services (if running)..."
  pm2 stop all || true

  echo "Starting Docker containers..."
  docker compose -f docker-compose.prod.yml down || true
  docker compose -f docker-compose.prod.yml up -d

  echo "Cleaning up image files..."
  rm -f dshome-backend.tar.gz dshome-admin.tar.gz

  echo "Docker container status:"
  docker compose -f docker-compose.prod.yml ps
EOF

echo ""
echo "Step 5: Cleaning up local image files..."
echo "----------------------------------------"
rm -f dshome-backend.tar.gz dshome-admin.tar.gz

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo ""
echo "IMPORTANT:"
echo "- Database: Using existing PostgreSQL (NOT touched)"
echo "- Uploads: Preserved in /opt/dshome/packages/backend/uploads"
echo "- Backend: http://157.90.129.12:3000"
echo "- Admin: https://www.dshome.dev/admin/"
echo ""
echo "To view logs:"
echo "  ssh root@157.90.129.12 'cd /opt/dshome && docker compose -f docker-compose.prod.yml logs -f'"
echo ""
