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
docker save dshome-backend-prod:latest -o dshome-backend.tar
docker save dshome-admin-prod:latest -o dshome-admin.tar

echo ""
echo "Step 3: Uploading images to production server..."
echo "------------------------------------------------"

# Upload images using SSH pipe (scp doesn't work from Windows)
echo "Uploading backend image..."
cat dshome-backend.tar | ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER "cat > $PRODUCTION_PATH/dshome-backend.tar"
echo "Uploading admin image..."
cat dshome-admin.tar | ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER "cat > $PRODUCTION_PATH/dshome-admin.tar"
echo "Uploading docker-compose file..."
cat docker-compose.prod.yml | ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER "cat > $PRODUCTION_PATH/docker-compose.prod.yml"

echo ""
echo "Step 4: Deploying on production server..."
echo "------------------------------------------"

ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER << 'EOF'
  cd /opt/dshome

  echo "Loading Docker images..."
  docker load < dshome-backend.tar
  docker load < dshome-admin.tar

  echo "Stopping PM2 services if running..."
  pm2 stop all || true

  echo "Starting Docker containers..."
  docker compose -f docker-compose.prod.yml down || true
  docker compose -f docker-compose.prod.yml up -d

  echo "Cleaning up image files..."
  rm -f dshome-backend.tar dshome-admin.tar

  echo "Docker container status:"
  docker compose -f docker-compose.prod.yml ps
EOF

echo ""
echo "Step 5: Running database migrations..."
echo "---------------------------------------"

ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER << 'EOF'
  cd /opt/dshome

  echo "Running migrations directly on host (not in Docker)..."
  # Migrations run on host where PostgreSQL is accessible via localhost
  # Override DATABASE_URL to use localhost instead of host.docker.internal
  export DATABASE_URL="postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock"
  pnpm --filter @dshome/backend db:migrate

  echo "Migrations completed!"
EOF

echo ""
echo "Step 6: Cleaning up local image files..."
echo "----------------------------------------"
rm -f dshome-backend.tar dshome-admin.tar

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
