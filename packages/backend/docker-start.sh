#!/bin/sh

# Docker startup script for backend
# Replaces localhost with host.docker.internal in DATABASE_URL for Docker networking

if [ ! -z "$DATABASE_URL" ]; then
  # Replace localhost with host.docker.internal for Docker
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost/host.docker.internal/g')
  echo "DATABASE_URL configured for Docker networking"
fi

echo "Running database migrations..."
cd /app/packages/backend

# Run migrations using tsx to execute the migration script
if [ -f "src/db/migrate.ts" ]; then
  npx tsx src/db/migrate.ts || echo "Warning: Migration script failed or not found"
else
  echo "Warning: Migration script not found at src/db/migrate.ts"
fi

echo "Starting backend server..."
# Start the backend
exec pnpm --filter @dshome/backend start
