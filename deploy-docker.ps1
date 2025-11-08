# Docker Production Deployment Script for Windows
# This script deploys the app using Docker while preserving database and uploads

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DSHOME Docker Production Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PRODUCTION_SERVER = "root@157.90.129.12"
$PRODUCTION_PATH = "/opt/dshome"

# Step 1: Build Docker images
Write-Host "Step 1: Building Docker images locally..." -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    docker compose -f docker-compose.prod.yml build --no-cache
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }
}
catch {
    Write-Host "ERROR: Failed to build Docker images" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Save Docker images
Write-Host ""
Write-Host "Step 2: Saving Docker images..." -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    # Save backend image
    Write-Host "Saving backend image..." -ForegroundColor Gray
    docker save dshome-backend-prod:latest | gzip > dshome-backend.tar.gz
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to save backend image"
    }

    # Save admin image
    Write-Host "Saving admin image..." -ForegroundColor Gray
    docker save dshome-admin-prod:latest | gzip > dshome-admin.tar.gz
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to save admin image"
    }

    Write-Host "Images saved successfully" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to save Docker images" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 3: Upload to production
Write-Host ""
Write-Host "Step 3: Uploading images to production server..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Uploading backend image..." -ForegroundColor Gray
    scp -o StrictHostKeyChecking=no dshome-backend.tar.gz "${PRODUCTION_SERVER}:${PRODUCTION_PATH}/"

    Write-Host "Uploading admin image..." -ForegroundColor Gray
    scp -o StrictHostKeyChecking=no dshome-admin.tar.gz "${PRODUCTION_SERVER}:${PRODUCTION_PATH}/"

    Write-Host "Uploading docker-compose..." -ForegroundColor Gray
    scp -o StrictHostKeyChecking=no docker-compose.prod.yml "${PRODUCTION_SERVER}:${PRODUCTION_PATH}/"

    Write-Host "Upload completed" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to upload to production" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 4: Deploy on production
Write-Host ""
Write-Host "Step 4: Deploying on production server..." -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host ""

$deployScript = @'
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
'@

try {
    ssh -o StrictHostKeyChecking=no $PRODUCTION_SERVER $deployScript
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment on server failed"
    }
}
catch {
    Write-Host "ERROR: Failed to deploy on production server" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 5: Cleanup local files
Write-Host ""
Write-Host "Step 5: Cleaning up local image files..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    Remove-Item -Path "dshome-backend.tar.gz" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "dshome-admin.tar.gz" -Force -ErrorAction SilentlyContinue
    Write-Host "Cleanup completed" -ForegroundColor Green
}
catch {
    Write-Host "WARNING: Failed to cleanup some files" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Cyan
Write-Host "- Database: Using existing PostgreSQL (NOT touched)" -ForegroundColor White
Write-Host "- Uploads: Preserved in /opt/dshome/packages/backend/uploads" -ForegroundColor White
Write-Host "- Backend: http://157.90.129.12:3000" -ForegroundColor White
Write-Host "- Admin: https://www.dshome.dev/admin/" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  ssh root@157.90.129.12 'cd /opt/dshome && docker compose -f docker-compose.prod.yml logs -f'" -ForegroundColor Gray
Write-Host ""
