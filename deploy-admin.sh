#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /opt/dshome

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd packages/admin
pnpm install

# Build admin panel
echo "🔨 Building admin panel..."
pnpm build

# Restart PM2 service
echo "♻️ Restarting PM2 service..."
pm2 restart dshome-admin

# Show PM2 status
echo "✅ Deployment complete!"
pm2 status
